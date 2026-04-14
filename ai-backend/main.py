import os
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

class PropertyMatchRequest(BaseModel):
    active_user_id: str
    property_id: str
    month: date

class PropertyMatchResponse(BaseModel):
    match_score: float
    explanation: str

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
        f"Based on the signed-in user's profile and the pending members listed below,\n"
        f"write exactly one short, highly readable sentence explaining why the signed-in user is a strong fit for those pending members.\n"
        f"Compare the signed-in user directly with the pending members using shared household habits, lifestyle, interests, or work styles.\n"
        f"Do not describe the fit as being with a pod or a generic group dynamic.\n"
        f"Speak directly to the signed-in user in a warm, simple tone (e.g., 'You and the pending members all value...').\n"
        f"Keep the language very concise without complex structures.\n\n"
        f"SIGNED-IN USER PROFILE:\n{active_semantic}\n\n"
        f"PENDING MEMBERS:\n{members_text}"
    )
    
    response = await openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a concise matchmaking AI that writes simple, short explanations comparing the signed-in user with the pending members. Never describe the fit as being with a pod."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=100,
        temperature=0.7
    )
    return response.choices[0].message.content.strip()

@app.post("/api/property-match", response_model=PropertyMatchResponse)
async def get_property_match(request: PropertyMatchRequest):
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

            # 2. Fetch members for the specific property and month
            await cur.execute('''
                SELECT
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
                FROM pods p
                JOIN pod_members pm ON pm.pod_id = p.id AND pm.status = 'PENDING'
                JOIN users u ON pm.user_id = u.id
                JOIN user_profiles up ON up.user_id = u.id AND up.embedding IS NOT NULL
                WHERE p.property_id = %s AND p.month = %s
            ''', (active_embedding, request.property_id, request.month))
            
            rows = await cur.fetchall()

    finally:
        await conn.close()

    if not rows:
        return PropertyMatchResponse(
            match_score=0.0,
            explanation="This month is still wide open. You could be the first to start a pod here!"
        )

    scores = []
    members_semantics = {}
    
    for r in rows:
        score = r['similarity_score'] or 0.0
        scores.append(score)
        member_semantic = format_profile_to_text(r, r['tags'])
        members_semantics[r['user_name']] = member_semantic

    avg_score = sum(scores) / len(scores)
    
    explanation = await generate_explanation(active_semantic, members_semantics)
    
    return PropertyMatchResponse(
        match_score=avg_score,
        explanation=explanation
    )
