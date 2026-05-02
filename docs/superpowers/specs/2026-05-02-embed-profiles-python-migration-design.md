# Embed Profiles Migration: Next.js → Python API

**Date:** 2026-05-02
**Status:** Approved

## Overview

Move profile embedding logic from the TypeScript Next.js script (`db/scripts/embed-profiles.ts`) to a new Python FastAPI endpoint in `ai-backend/main.py`. The npm script retains only the responsibility of fetching user IDs from the database and sending them to the Python endpoint.

## Problem

Embedding logic currently lives in the TypeScript script (`embed-profiles.ts`). The Python backend (`main.py`) already owns the `format_profile_to_text` function (duplicate exists in TS), has OpenAI client, and has direct DB access via psycopg. The TS script duplicates all of this and adds an unnecessary Node.js dependency on OpenAI.

## Architecture

### New Python endpoint: `POST /api/embed-profiles`

**Location:** `ai-backend/main.py`

**Request body:**
```json
{ "user_ids": ["uuid1", "uuid2", "..."] }
```

**Behavior:**
1. Fetches full profiles + tags for the given user IDs from DB via psycopg
2. Formats each profile using existing `format_profile_to_text`
3. Chunks into batches of 50
4. Calls OpenAI `text-embedding-3-large` (dimensions: 3072) per batch
5. Writes embeddings back to `user_profiles.embedding` via psycopg
6. Returns summary

**Response body:**
```json
{ "processed": 42, "failed": 0 }
```

### Modified npm script: `db/scripts/embed-profiles.ts`

**Removes:**
- OpenAI import and client
- `formatProfileToText` helper
- `chunkArray` helper
- All embedding generation and DB write logic

**Retains:**
- Drizzle DB connection
- Query to fetch all user profile IDs

**Adds:**
- HTTP POST to `http://localhost:8000/api/embed-profiles` with `{ user_ids: [...] }`
- Logs returned `{ processed, failed }` summary
- Exits with code 1 if `failed > 0`

## Data Flow

```
npm run db:embed-profiles
  → TS: SELECT id FROM user_profiles (all)
  → POST http://localhost:8000/api/embed-profiles { user_ids: [...] }
    → Python: query profiles + tags for given IDs
    → chunk into 50s
    → for each chunk:
        → format_profile_to_text per profile
        → openai.embeddings.create(model, dims, inputs)
        → UPDATE user_profiles SET embedding = ... for each profile
    → return { processed: N, failed: M }
  → TS: log result, exit 0 or 1
```

## Error Handling

- Python catches exceptions per batch, continues processing remaining chunks
- Failed batches increment `failed` counter, successful ones increment `processed`
- Final response includes both counts regardless of partial failures
- npm script exits with code 1 if `failed > 0`

## Files Changed

| File | Change |
|------|--------|
| `ai-backend/main.py` | Add `EmbedProfilesRequest`, `EmbedProfilesResponse` models and `POST /api/embed-profiles` endpoint |
| `platform-frontend/db/scripts/embed-profiles.ts` | Strip embedding logic, add HTTP POST to Python |

## What Does Not Change

- OpenAI model and dimensions: `text-embedding-3-large`, 3072
- Batch size: 50
- `format_profile_to_text` logic (Python version is canonical)
- DB schema (`user_profiles.embedding` column)
- The `npm run db:embed-profiles` command name
