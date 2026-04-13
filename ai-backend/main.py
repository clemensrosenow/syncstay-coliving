import os
import asyncio
from datetime import date
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import AsyncOpenAI
import psycopg
from pgvector.psycopg import register_vector_async

load_dotenv()

app = FastAPI()

# Optionally add CORS middleware to allow Next.js local interaction
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
DB_URL = os.getenv("DATABASE_URL")

class RankPodsRequest(BaseModel):
    location_ids: List[str]
    active_user_id: str
    months: List[date]

class PodRankingMember(BaseModel):
    name: str
    age: Optional[int] = None
    bio: Optional[str] = None
    chronotype: Optional[str] = None
    work_style: Optional[str] = None
    tags: List[str] = []
    score: float

class PodRanking(BaseModel):
    property_id: str
    location_id: str
    month: date
    pod_id: Optional[str] = None
    property_name: str
    match_score: float
    explanation: str
    members: List[PodRankingMember]

class RankPodsResponse(BaseModel):
    rankings: List[PodRanking]

def calculate_age(birthday: date | None) -> int | None:
    if not birthday:
        return None
    today = date.today()
    return today.year - birthday.year - ((today.month, today.day) < (birthday.month, birthday.day))

def format_profile_to_text(profile: dict, tags: List[str]) -> str:
    parts = []
    
    # 1. Demographics
    age = calculate_age(profile.get('birthday'))
    age_string = f"A {age}-year-old professional." if age else "A professional."
    parts.append(f"[DEMOGRAPHICS] {age_string}")

    # 2. Lifestyle & Work
    rhythm = "has a standard schedule"
    chronotype = profile.get('chronotype')
    if chronotype == "EARLY_BIRD":
        rhythm = "identifies as an early bird"
    elif chronotype == "NIGHT_OWL":
        rhythm = "identifies as a night owl"

    start = profile.get('work_start_hour')
    end = profile.get('work_end_hour')
    hours_str = "working flexible hours"
    if start is not None and end is not None:
        hours_str = f"working from {start}:00 to {end}:00"

    style_str = ""
    work_style = profile.get('work_style')
    if work_style == "DEEP_FOCUS":
        style_str = "requires deep focus and silence for their work."
    elif work_style == "MIXED":
        style_str = "has a mixed schedule of focused work and meetings."
    elif work_style == "MOSTLY_CALLS":
        style_str = "spends most of their day on calls."
    elif work_style == "LIGHT":
        style_str = "has a light or highly flexible work schedule."

    parts.append(f"[LIFESTYLE & WORK] As a housemate, they {rhythm}, {hours_str}. During the day, they {style_str}")

    # 3. Household Rules
    cleanliness = profile.get('cleanliness')
    clean_str = "maintains average, regular cleanliness standards in a shared house."
    if cleanliness is not None:
        if cleanliness <= 2:
            clean_str = "prefers a very relaxed and casual approach to cleanliness."
        elif cleanliness >= 4:
            clean_str = "requires a spotless, highly organized shared home and strict cleanliness."
    parts.append(f"[HOUSEHOLD RULES] {clean_str}")

    # 4. Community Vibe
    social = profile.get('social_energy')
    social_str = "balances between being social and enjoying their alone time."
    if social is not None:
        if social <= 2:
            social_str = "is an introvert who respects quiet hours and values independent, private space in the shared house."
        elif social >= 4:
            social_str = "is highly extroverted and thrives on daily community interaction, communal dinners, and shared activities."
    parts.append(f"[COMMUNITY VIBE] {social_str}")

    # 5. Interests
    if tags:
        parts.append(f"[INTERESTS] In their free time, they enjoy: {', '.join(tags)}.")

    # 6. Personal Note
    bio = profile.get('bio')
    if bio:
        parts.append(f"[PERSONAL NOTE] In their own words: \"{bio}\"")

    return "\n".join(parts)


async def get_db_connection():
    if not DB_URL:
        raise ValueError("DATABASE_URL is missing")
    conn = await psycopg.AsyncConnection.connect(DB_URL)
    await register_vector_async(conn)
    return conn

async def generate_explanation(active_semantic: str, members_semantics: dict) -> str:
    members_text = ""
    for name, text in members_semantics.items():
        members_text += f"-- Member: {name}\n{text}\n\n"

    prompt = (
        f"You are a premium coliving matchmaking AI.\n"
        f"Based on the active user's profile and the group of pending housemates (the 'pod'),\n"
        f"write exactly one short, highly readable sentence explaining why this group dynamic is a great fit.\n"
        f"Focus on the overall group synergy (shared household habits, lifestyle, or work styles) rather than individuals.\n"
        f"Speak directly to the active user in a warm, simple tone (e.g., 'You and the pod both value...').\n"
        f"Keep the language very concise without complex structures.\n\n"
        f"ACTIVE USER PROFILE:\n{active_semantic}\n\n"
        f"POD MEMBERS (Group Context):\n{members_text}"
    )
    
    response = await openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a concise matchmaking AI that writes simple, short explanations focused on group synergy."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=100,
        temperature=0.7
    )
    return response.choices[0].message.content.strip()

@app.post("/api/rank-pods", response_model=RankPodsResponse)
async def rank_pods(request: RankPodsRequest):
    try:
        conn = await get_db_connection()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")

    try:
        async with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            # 1. Fetch active user
            await cur.execute('''
                SELECT
                    up.id,
                    up.birthday,
                    up.chronotype,
                    up.work_start_hour,
                    up.work_end_hour,
                    up.work_style,
                    up.cleanliness,
                    up.social_energy,
                    up.bio,
                    up.embedding,
                    COALESCE(
                        (
                            SELECT array_agg(t.label)
                            FROM user_tags ut 
                            JOIN tags t ON ut.tag_id = t.id 
                            WHERE ut.profile_id = up.id
                        ), 
                        '{}'
                    ) AS tags
                FROM user_profiles up
                WHERE up.user_id = %s
            ''', (request.active_user_id,))
            
            active_row = await cur.fetchone()
            if not active_row:
                raise HTTPException(status_code=404, detail="Active user profile not found")
            
            active_embedding = active_row['embedding']
            if active_embedding is None:
                raise HTTPException(status_code=400, detail="Active user has no embedding vector. Please set up profile.")

            active_semantic = format_profile_to_text(active_row, active_row['tags'])

            # 2. Fetch properties and any existing pending members for combinations of queried locations and months
            await cur.execute('''
                WITH queried_combinations AS (
                    SELECT prop.id AS property_id, prop.name AS property_name, prop.location_id AS location_id, q_moon.month AS queried_month
                    FROM properties prop
                    CROSS JOIN unnest(%s::date[]) AS q_moon(month)
                    WHERE prop.location_id = ANY(%s::uuid[])
                )
                SELECT
                    qc.property_id AS property_id,
                    qc.property_name AS property_name,
                    qc.location_id AS location_id,
                    qc.queried_month AS month,
                    p.id AS pod_id,
                    u.id AS user_id,
                    u.name AS user_name,
                    up.birthday,
                    up.chronotype,
                    up.work_start_hour,
                    up.work_end_hour,
                    up.work_style,
                    up.cleanliness,
                    up.social_energy,
                    up.bio,
                    (1 - (up.embedding <=> %s::vector)) AS similarity_score,
                    COALESCE(
                        (
                            SELECT array_agg(t.label)
                            FROM user_tags ut 
                            JOIN tags t ON ut.tag_id = t.id 
                            WHERE ut.profile_id = up.id
                        ), 
                        '{}'
                    ) AS tags
                FROM queried_combinations qc
                LEFT JOIN pods p ON p.property_id = qc.property_id AND p.month = qc.queried_month
                LEFT JOIN pod_members pm ON pm.pod_id = p.id AND pm.status = 'PENDING'
                LEFT JOIN users u ON pm.user_id = u.id
                LEFT JOIN user_profiles up ON up.user_id = u.id AND up.embedding IS NOT NULL
            ''', (request.months, request.location_ids, active_embedding))
            
            rows = await cur.fetchall()

    finally:
        await conn.close()

    if not rows:
        return RankPodsResponse(rankings=[])

    # 3. Group by property and month combination
    properties_map = {}
    for r in rows:
        prop_id = r['property_id']
        month_val = r['month']
        key = (prop_id, month_val)
        
        if key not in properties_map:
            properties_map[key] = {
                'property_name': r['property_name'],
                'location_id': r['location_id'],
                'month': month_val,
                'pod_id': r['pod_id'],
                'scores': [],
                'members_semantics': {},
                'member_list': []
            }
        
        # If user_id is not None, there is an actual member
        if r['user_id'] is not None:
            score = r['similarity_score'] or 0.0
            properties_map[key]['scores'].append(score)
            
            member_age = calculate_age(r['birthday'])
            
            properties_map[key]['member_list'].append(PodRankingMember(
                name=r['user_name'],
                age=member_age,
                bio=r['bio'],
                chronotype=r['chronotype'],
                work_style=r['work_style'],
                tags=r['tags'],
                score=score
            ))
            
            member_semantic = format_profile_to_text(r, r['tags'])
            properties_map[key]['members_semantics'][r['user_name']] = member_semantic

    # 4. Generate explanations concurrently and build rankings
    tasks = []
    
    async def process_property(prop_id, prop_data):
        if len(prop_data['member_list']) == 0:
            return PodRanking(
                property_id=prop_id,
                location_id=prop_data['location_id'],
                month=prop_data['month'],
                pod_id=prop_data['pod_id'],
                property_name=prop_data['property_name'],
                match_score=0.0,
                explanation="Be the first one to start a pod!",
                members=[]
            )
            
        avg_score = sum(prop_data['scores']) / len(prop_data['scores'])
        explanation = await generate_explanation(active_semantic, prop_data['members_semantics'])
        
        return PodRanking(
            property_id=prop_id,
            location_id=prop_data['location_id'],
            month=prop_data['month'],
            pod_id=prop_data['pod_id'],
            property_name=prop_data['property_name'],
            match_score=avg_score,
            explanation=explanation,
            members=prop_data['member_list']
        )

    for (prop_id, month_val), data in properties_map.items():
        tasks.append(process_property(prop_id, data))

    completed_props = await asyncio.gather(*tasks)

    # Sort by match_score descending
    completed_props.sort(key=lambda x: x.match_score, reverse=True)
    
    return RankPodsResponse(rankings=completed_props)

