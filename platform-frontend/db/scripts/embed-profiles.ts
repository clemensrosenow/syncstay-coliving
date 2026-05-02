/**
 * Fetches all user profile IDs and sends them to the Python AI backend
 * for embedding generation and storage.
 *
 * Usage:
 * 1. Make sure .env has DATABASE_URL and AI_BACKEND_URL.
 * 2. Run: npm run db:embed-profiles
 */

import { config } from "dotenv";
config({ path: ".env" });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { userProfiles } from "../schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  const AI_BACKEND_URL = process.env.AI_BACKEND_URL;
  if (!AI_BACKEND_URL) {
    console.error("AI_BACKEND_URL is not set in .env");
    process.exit(1);
  }

  console.log("Fetching user profile IDs from the database...");

  const profiles = await db.select({ id: userProfiles.id }).from(userProfiles);

  if (profiles.length === 0) {
    console.log("No user profiles found. Have you run the seed script first?");
    return;
  }

  const userIds = profiles.map((p) => p.id);
  console.log(`Found ${userIds.length} profiles. Sending to embedding service...`);

  const response = await fetch(`${AI_BACKEND_URL}/api/embed-profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_ids: userIds }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Embedding service error: ${response.status} ${error}`);
    process.exit(1);
  }

  const result = (await response.json()) as { processed: number; failed: number };
  console.log(`\nProcessed: ${result.processed} | Failed: ${result.failed}`);

  if (result.failed > 0) {
    console.warn(`\nEmbedding completed with ${result.failed} failures. Check Python server logs.`);
    process.exit(1);
  }

  console.log("\nAll profiles successfully embedded!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
