/**
 * This script embeds user profiles into a vector database using OpenAI's text-embedding-3-large model.
 * It uses pgvector to store the embeddings and allows for semantic search.
 * 
 * Usage: 
 * 1. Make sure you have a .env file with DATABASE_URL and OPENAI_API_KEY.
 * 2. Run: npm run db:embed-profiles
 */

import { config } from "dotenv";
config({ path: ".env" });

import { eq, sql as drizzleSql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import OpenAI from "openai";
import * as schema from "../schema";
import * as authSchema from "../../auth-schema";

// ── DB and OpenAI connection ──────────────────────────────────────
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: { ...schema, ...authSchema } });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── Helper to calculate age ───────────────────────────────────────
function calculateAge(birthday: string | null | Date): number | null {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// ── Helper to format the profile into natural text ────────────────
function formatProfileToText(profile: any, tags: string[]) {
  const parts = [];
  
  // Note: We deliberately exclude budgetTier and gender preferences from the embedding. 
  // These act as hard filters (WHERE clauses) during DB queries to prevent AI from matching 
  // conflicting budgets simply because personalities align.

  // 1. Age and Basic Info
  const age = calculateAge(profile.birthday);
  const ageString = age ? `A ${age}-year-old professional.` : "A professional.";
  parts.push(`[DEMOGRAPHICS] ${ageString}`);

  // 2. Lifestyle & Work (Chronotype + Hours)
  let rhythm = "has a standard schedule";
  if (profile.chronotype === "EARLY_BIRD") rhythm = "identifies as an early bird";
  else if (profile.chronotype === "NIGHT_OWL") rhythm = "identifies as a night owl";

  let hoursStr = "working flexible hours";
  if (profile.workStartHour !== null && profile.workEndHour !== null) {
     hoursStr = `working from ${profile.workStartHour}:00 to ${profile.workEndHour}:00`;
  }
  
  let styleStr = "";
  if (profile.workStyle === "DEEP_FOCUS") styleStr = "requires deep focus and silence for their work.";
  else if (profile.workStyle === "MIXED") styleStr = "has a mixed schedule of focused work and meetings.";
  else if (profile.workStyle === "MOSTLY_CALLS") styleStr = "spends most of their day on calls.";
  else if (profile.workStyle === "LIGHT") styleStr = "has a light or highly flexible work schedule.";

  parts.push(`[LIFESTYLE & WORK] As a housemate, they ${rhythm}, ${hoursStr}. During the day, they ${styleStr}`);

  // 3. Household Rules (Cleanliness)
  let cleanlinessStr = "maintains average, regular cleanliness standards in a shared house.";
  if (profile.cleanliness !== null) {
    if (profile.cleanliness <= 2) cleanlinessStr = "prefers a very relaxed and casual approach to cleanliness.";
    else if (profile.cleanliness >= 4) cleanlinessStr = "requires a spotless, highly organized shared home and strict cleanliness.";
  }
  parts.push(`[HOUSEHOLD RULES] ${cleanlinessStr}`);

  // 4. Community Vibe (Social Energy)
  let socialStr = "balances between being social and enjoying their alone time.";
  if (profile.socialEnergy !== null) {
    if (profile.socialEnergy <= 2) socialStr = "is an introvert who respects quiet hours and values independent, private space in the shared house.";
    else if (profile.socialEnergy >= 4) socialStr = "is highly extroverted and thrives on daily community interaction, communal dinners, and shared activities.";
  }
  parts.push(`[COMMUNITY VIBE] ${socialStr}`);

  // 5. Interests
  if (tags && tags.length > 0) {
    parts.push(`[INTERESTS] In their free time, they enjoy: ${tags.join(", ")}.`);
  }

  // 6. Personal Note
  if (profile.bio) {
    parts.push(`[PERSONAL NOTE] In their own words: "${profile.bio}"`);
  }

  return parts.join("\n");
}

// ── Helper to chunk arrays for batching ───────────────────────────
function chunkArray<T>(array: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// ── Main Seed Script ──────────────────────────────────────────────
async function main() {
  
  console.log("Fetching user profiles from the database...");
  
  const profiles = await db.query.userProfiles.findMany({
    with: {
      interests: {
        with: { tag: true }
      }
    }
  });

  if (profiles.length === 0) {
    console.log("No user profiles found. Have you run the seed script first?");
    return;
  }

  console.log(`Found ${profiles.length} profiles. Generating embeddings...`);

  // Batch in chunks of 50 to optimize OpenAI API usage
  const BATCH_SIZE = 50;
  const chunks = chunkArray(profiles, BATCH_SIZE);

  let processedCount = 0;

  let allSucceeded = true;

  for (const chunk of chunks) {
    // 1. Prepare inputs
    const inputs = chunk.map(profile => {
      const tagStrings = profile.interests.map((ui: any) => ui.tag.label);
      return formatProfileToText(profile, tagStrings);
    });

    console.log(`Sending batch of ${inputs.length} profiles to OpenAI...`);

    try {
      // 2. Call OpenAI API with the batch
      const response = await openai.embeddings.create({
        model: "text-embedding-3-large",
        dimensions: 3072, 
        input: inputs,
      });

      // 3. Update the database for this batch
      for (let i = 0; i < chunk.length; i++) {
        const profile = chunk[i];
        const embedding = response.data[i].embedding;

        await db.update(schema.userProfiles)
          .set({ embedding })
          .where(eq(schema.userProfiles.id, profile.id));

        processedCount++;
      }
      console.log(`✅ Processed ${processedCount}/${profiles.length} profiles...`);
      
    } catch (error) {
      console.error(`❌ Failed to embed batch:`, error);
      allSucceeded = false;
    }
  }

  if (allSucceeded) {
    console.log("\nAll profiles successfully embedded!");
  } else {
    console.warn("\nEmbedding completed with some errors. Please check the logs above.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
