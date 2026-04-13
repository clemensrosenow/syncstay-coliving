# SyncStay AI Backend API Documentation

## Overview
The `ai-backend` application powers the intelligent matching capabilities of the SyncStay platform. It exposes RESTful API endpoints—built with FastAPI—that seamlessly integrate our internal `pgvector` user embeddings alongside generative Language Models (GPT-4o). 

This approach provides prospective coliving tenants with a ranked listing of available properties, driven directly by actionable, psychological, and lifestyle-based semantic similarity scoring.

---

## The `/api/rank-pods` Endpoint

**Method:** `POST`  
**Path:** `/api/rank-pods`  

### Purpose
To query the database for all available coliving properties within a given geographic `location_id` and temporal `month`. For properties containing active "Pods" (groups of currently `PENDING` members), the endpoint compares their embedded profiles mathematically against the "Active User" currently browsing the application. Properties are sorted by compatibility, and OpenAI writes a bespoke 1-2 sentence overview detailing why the user and the pod will be great housemates.

### Architectural Rationale 
1. **Empty State Awareness:** Not all properties will have an active Pod. To gracefully handle the "Anchor Model" architecture (Pod-First Gravity), the API unconditionally returns all available properties in the location. If a property has no matching pod, it simply returns a `0.0` score and prompts the user to "Be the first one to start a pod!".
2. **Contextual Translation Engine:** The API does not send unstructured raw DB rows directly to OpenAI. To protect data and optimize the AI attention mechanisms, it reconstructs natural text representations (`[DEMOGRAPHICS]`, `[LIFESTYLE & WORK]`, `[HOUSEHOLD RULES]`) mimicking the exact methodology used to build the original vector embeddings.
3. **Concurrent Parallel Generation:** Waiting sequentially for 5-10 properties to get customized GPT-4o statements would degrade UX latency drastically. `asyncio.gather` wraps all prompt requests, matching the total LLM overhead to the time of our single slowest response.

---

### Request Payload

**Headers:** 
`Content-Type: application/json`

| Field | Type | Description |
|-----------|---------|----------------------------------------------------------|
| `location_ids` | `list[uuid]` | An array of geographic `location_id`s being queried |
| `active_user_id` | `uuid` | The DB unique identifier (`id`) in the `users` table |
| `months` | `list[date]` | Target stay month string format array (e.g., `["2026-04-01", "2026-05-01"]`) |

**Example Request:**
```json
{
  "location_ids": ["5fb9220d-9b0f-4d32-a248-6492457c3890"],
  "active_user_id": "1b81772f-da76-4a80-88c7-0c3425c83eed",
  "months": ["2026-04-01"]
}
```

---

### Response Structure

The endpoint returns an array of ranked properties, internally calculated and arranged by highest `match_score` sequentially.

| Field | Type | Description |
|-----------|---------|----------------------------------------------------------|
| `property_id` | `uuid` | Target property DB ID |
| `location_id` | `uuid` | Associated property location ID |
| `month` | `date` | Evaluated specific stay month |
| `pod_id` | `uuid?` | The Pod DB ID (Can be `null` if the property is entirely empty) |
| `property_name` | `string` | The human-readable name of the coliving house |
| `match_score` | `float` | Averaged cosine similarity between the Active User and all Pending Members |
| `explanation` | `string` | GPT-4o driven summary addressing the active user ("You and the housemates both love..."). |
| `members` | `list` | Comprehensive structured data representing `PENDING` potential housemates |

**Member Properties Extracted:**
Each entry in the `members` array contains:
- `name` (string)
- `score` (float cosine similarity specific strictly to this member)
- `age` (integer, inferred from birthday if available)
- `bio` (string biography text)
- `chronotype` (`EARLY_BIRD`, `NIGHT_OWL`, `STANDARD`)
- `work_style` (`DEEP_FOCUS`, `MIXED`, `MOSTLY_CALLS`, `LIGHT`)
- `tags` (Array of chosen specific interests strings)

**Example Response:**
```json
{
  "rankings": [
    {
      "property_id": "c1901a5-8d...",
      "pod_id": "42345ab-12...",
      "property_name": "Sunny Peak Villa",
      "match_score": 0.895,
      "explanation": "You and the housemates both identify as early birds who require deep focus during the workday. Your shared expectation for strict cleanliness and preference for balancing social interaction with needed alone time suggests an incredibly robust household synergy.",
      "members": [
        {
          "name": "Jane",
          "age": 28,
          "bio": "I love running in the mornings before I start coding.",
          "chronotype": "EARLY_BIRD",
          "work_style": "DEEP_FOCUS",
          "tags": ["Running", "Cooking"],
          "score": 0.92
        },
        {
          "name": "Sam",
          "age": 31,
          "bio": "Architect mostly working from home.",
          "chronotype": "EARLY_BIRD",
          "work_style": "MIXED",
          "tags": ["Photography", "Hiking"],
          "score": 0.87
        }
      ]
    },
    {
      "property_id": "89b21a5-1d...",
      "pod_id": null,
      "property_name": "Downtown Loft 3A",
      "match_score": 0.0,
      "explanation": "Be the first one to start a pod!",
      "members": []
    }
  ]
}
```

---

### Internal Execution Pipeline Details
1. **Pre-Query Connection:** FastAPI negotiates an asynchronous vector connection with Neon DB invoking `register_vector_async` to correctly interpret vector embeddings as mathematical objects.
2. **Active User Extraction:** Scans `user_profiles` joining `user_tags` to calculate `active_semantic_string`: a structured paragraph describing the active tenant's core behaviors. *If the query fails because physical embedding has not been completed for the user, it immediately drops to an HTTP `400 Bad Request`.*
3. **Universal Joining:** Runs a `LEFT JOIN` leveraging `UNNEST` and `ANY` across the `properties` table (bound by location IDs list) cross-referenced through all requested `months` to `pod_members` (Status exactly `'PENDING'`) tracking individual user embedding `<=>` cosine distance operations at the postgres layer level.
4. **Member Hydration:** Groups the returned raw rows by physical property and requested month combinations. Fills in demographic stats safely parsing Python `datetime` objects and translating nested enums into lists.
5. **AI Synthesis (GPT-4o):** Identifies non-zero Pod groups, aggregates their individual scores to a unified average, bundles semantic arrays, and executes the dynamic LLM generation for optimal conversational onboarding.
6. **Destructive Sorting:** Mutates Python output array by score descending prior to returning HTTP `200`.
