# SyncStay — Development Challenges

A record of the key engineering and product challenges encountered during development of the SyncStay co-living platform, grouped by domain.

---

## 1. Data Modelling & Schema Evolution

### 1.1 Continually Evolving Data Schema

**Challenge:** The domain model grew significantly as the product vision sharpened. What started as a simple `users` + `properties` + `pods` schema required multiple additive migrations as new features were designed:

- **Amenities** — properties needed structured amenity lists (with icon identifiers) to render rich search cards. A separate `amenities` table and a `propertyAmenities` join table were added, requiring a curated many-to-many assignment per property.
- **Flights** — to add travel-cost context to location cards, a `flights` table was introduced, pre-seeded with realistic routes from a static JSON file (`raw_flights.json`), linked to locations via `locationId`.
- **Testimonials** — social proof on the landing page required a `testimonials` table linked to specific `podMembers` rather than users directly, to anchor quotes to a verified booking experience.
- **Languages** — users needed structured language data for filtering and display. A `languages` reference table with a `userLanguages` join table was added, extracting unique language names from all traveler specs at seed time.

**Measurements taken:** All schema changes were made using Drizzle ORM pushes to the DB. Data could quickly be generated using the seed scripts (see below).

---

### 1.2 Inserting Realistic Sample Data for the Prototype

**Challenge:** A co-living platform with AI-driven matching is essentially non-demonstrable without rich, realistic data. Sparse or generic seed data makes the matching engine look useless and the UI look empty. The data needed to be:
- Internally consistent (pods referencing real properties, memberships referencing real users)
- Rich enough to demonstrate AI compatibility scoring
- Deterministic and reproducible across environments

**Measurements taken:** A dedicated `db/scripts/seed.ts` script was built using `@faker-js/faker` with a fixed seed for full determinism. 30 hand-crafted `TravelerSpec` objects encode realistic personas with structured attributes (chronotype, work style, cleanliness score, languages, interests, budget tier). Pod memberships are scripted across 6 months with deliberate patterns — early months have LOCKED/FULL pods, middle months have partial fills to demonstrate "AI gravity", and month 5 is intentionally empty to represent the future horizon. An `--overwrite` flag and a `syncSeedProperties` / `syncSeedUsers` sync step ensure idempotent re-seeding. A final `verifySeedImages` check throws if any `NULL` images sneak through.

---

## 2. UX & Booking Flow

### 2.1 Designing a Booking Flow that Incentivises Action

**Challenge:** Co-living bookings differ fundamentally from standard hotel reservations. A user is not just booking a room — they are joining a group that may or may not reach viability. The core UX problem was making pod state legible and motivating action without misleading users:

- **State communication:** Pods cycle through `OPEN → LOCKED → FULL`. Users needed to immediately understand where a pod stands and what their action changes.
- **Social proof at a glance:** Showing who has already booked (avatar group) signals real demand without revealing personal data.
- **Progress toward the lock threshold:** The minimum occupancy threshold (`minOccupancy`) is the critical tipping point — reaching it locks the pod and commits the group. This had to be surfaced visually, not buried in copy.
- **Urgency without dark patterns:** Showing remaining spots (`X spots left`) with a red highlight at ≤ 2 spots creates genuine urgency without fabricating scarcity.

**Measurements taken:** The `PropertyBookingProgress` component renders a single progress bar with a floating lock icon pinned at the `lockPercent` position — this visually shows how far the pod is from locking. A fill percentage tracks actual occupancy relative to total rooms. The `getPodStateDetails` utility maps the raw pod state + auth state into user-facing copy. Avatar previews of up to 2 existing members with an overflow count (`+N`) make real social proof visible immediately. The component accepts a `displayMode` prop (`'avatars' | 'text'`) to allow context-appropriate rendering.

---

### 2.2 Avoiding Payment Integration and Locking Mechanism for MVP

**Challenge:** Implementing a real payment flow (Stripe, escrow, partial refunds on pod dissolution) and a robust lock/unlock mechanism (what happens if someone withdraws after locking?) is weeks of engineering. For a prototype validating the core matching concept, this was out of scope.

**Measurements taken:** The checkout process is simulated. Pod status (`LOCKED`, `FULL`) and member status (`PENDING`, `CONFIRMED`) are set directly by the seed script and by simulated booking actions, with no real payment gate. The schema fields (`lockedAt`, `filledAt`, `podMembers.status`) are all in place to support a real implementation later — the data model is not compromised. The UI communicates the booking state clearly while the actual confirmation step is a no-op for the prototype, allowing product validation without payment infrastructure risk.

---

## 3. AI Matching & Embedding

### 3.1 Optimising Embedding Quality for User Profiles

**Challenge:** Using raw profile data to generate embeddings produces noisy, context-ambiguous vectors. Standard cosine similarity on a raw bio + lifestyle dump conflates "I love organising data" (professional trait) with "I'm very organised as a housemate" (household trait). The goal was to produce embeddings that measure housemate compatibility specifically, not general personality similarity.

**Measurements taken:** Five deliberate strategies were applied (documented fully in `embedding-strategy.md`):

1. **Contextual semantic framing** — all profile text is prefixed with phrases like `"As a housemate, they..."` and `"In a shared house, they..."` to anchor vector coordinates in the household dynamics latent space.
2. **Categorical structural markers** — the text is segmented with strict bracket labels (`[DEMOGRAPHICS]`, `[LIFESTYLE & WORK]`, `[HOUSEHOLD RULES]`, `[COMMUNITY VIBE]`, `[INTERESTS]`, `[PERSONAL NOTE]`) to compartmentalise traits and reduce cross-context attention bleed.
3. **Deliberate data omission** — hard constraints (`budgetTier`, `genderPreference`, age range) are excluded from embedding text entirely and handled as PostgreSQL `WHERE` clauses before the `pgvector` `ORDER BY embedding <-> query` sort. This prevents budget mismatch from degrading a high personality compatibility score.
4. **Normalisation of numbers and timestamps** — raw values like `birthday: "1997-03-14"` or `workStartHour: 6` are converted to semantic phrases (`"A 28-year-old professional"`, `"working from 6:00 to 14:00, identifies as an early bird"`) before embedding.
5. **Batch processing against rate limits** — instead of one HTTP request per profile, profiles are chunked into arrays of 50 and sent to OpenAI's embedding endpoint in bulk. This reduces a 1,000-user job from 1,000 requests to 20, eliminating throttling risk and dramatically cutting HTTP overhead.

---

### 3.2 Displaying Matching Scores in a User-Friendly Way

**Challenge:** Raw cosine similarity scores (e.g., `0.87`) are mathematically meaningful but experientially empty. Users need to understand *why* they match with a pod, not just *that* they do. A single group score also fails to show intra-group dynamics — a perfect overall score could mask one incompatible member.

**Measurements taken:** Matching output is passed through an LLM synthesis step that generates two levels of explanation:
- **Group-level synthesis** — a short natural-language paragraph describing the compatibility of the entire pod, referencing shared traits (e.g., work schedules, social energy, lifestyle alignment).
- **Per-member synthesis** — individual compatibility notes for each existing pod member, surfacing specific points of resonance or tension.

This transforms a number into a narrative. The UI renders these synthesised descriptions alongside a visual score indicator, giving users the confidence to act on a recommendation they can actually read and reason about.

---

## 4. Architecture

### 4.1 Monorepo with a Decoupled Python Service (No CORS Issues)

**Challenge:** The embedding pipeline and the LLM synthesis layer are implemented in Python (using OpenAI's SDK and `pgvector`). Running Python logic inside a Next.js monorepo requires a clean service boundary. The two main risks were:
- **CORS issues** — if the Next.js frontend called the Python API directly from the browser, CORS headers on the Python service would become a security and configuration concern.
- **Coupling** — mixing Python and Node.js processes in a shared runtime creates dependency management nightmares.

**Measurements taken:** The Python service (`ai-backend/`) is a standalone FastAPI application. All calls to the Python API are routed through **Next.js server-side API routes**, meaning the browser never calls the Python service directly. This eliminates CORS entirely — the Python service only receives requests from the Next.js server process, where same-origin constraints do not apply. The two services share no runtime; the monorepo structure is purely organisational (shared git history, unified CI). Environment variables for the Python service URL are injected server-side only, keeping them out of the client bundle.

---

## 5. MVP Scope Constraints

### 5.1 Finding Overlapping Travel Periods

**Challenge:** In a real co-living platform, users specify flexible date ranges and the matching engine must find pods where travel windows overlap. This requires date-range intersection queries, availability calendars, and potentially negotiation UX for near-miss overlaps — significant product and engineering complexity.

**Measurements taken:** For the MVP, the problem was sidestepped by using **fixed monthly slots** (pods are defined as one month, e.g., `"2025-06"`) and limiting available locations to **8 curated European cities**. The `monthOffset(n)` helper in the seed script generates pod months deterministically. Users browse pods by month, not by custom date range. This eliminates the overlap-detection problem entirely for the prototype phase while preserving the schema fields (`month` on `pods`) needed to support flexible date ranges in a future iteration.
