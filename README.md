# SyncStay – AI-Powered Co-Living Platform

SyncStay is a travel platform for digital nomads that uses AI to group compatible travelers into shared accommodations ("Co-Living Pods"). Instead of traditional roommate matching, SyncStay employs a **Pod-First Gravity model**: users browse properties first, and an AI engine ranks listings by social compatibility with existing pod members using vector embeddings and LLM-generated explanations.

## Key Features

- **AI compatibility matching** – User profiles are embedded via OpenAI (`text-embedding-3-large`, 3072-d) and compared with `pgvector` cosine similarity to rank properties by social fit.
- **LLM-generated match explanations** – GPT-4o produces personalized summaries and per-member highlights explaining *why* a pod is a good fit.
- **Pod-First booking flow** – Users commit to a property/month pod. When minimum occupancy is met, the pod locks and the booking is confirmed.
- **Dynamic landing page** – Featured properties carousel, scrollytelling "How It Works" section, database-driven testimonials, and team/pricing sections.
- **Auth & accounts** – Email/password authentication via `better-auth` with profile management, booking history, and user avatars.
- **Search & filtering** – Location and month-based property search with pod availability indicators.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend & API** | Next.js 16 (App Router, React 19, TypeScript) |
| **Styling** | Tailwind CSS 4, shadcn/ui, Framer Motion |
| **Authentication** | better-auth (email/password, Drizzle adapter) |
| **Database** | Neon (serverless Postgres + `pgvector` extension) |
| **ORM** | Drizzle ORM (with `drizzle-kit` for migrations) |
| **AI Microservice** | FastAPI (Python) |
| **AI Models** | OpenAI – `text-embedding-3-large` (embeddings), `gpt-4o` (match explanations) |
| **UI Components** | Radix UI, Embla Carousel, Lucide icons, cmdk |

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Client                            │
│                   (Next.js App Router)                    │
│                                                          │
│  Landing ─ Search ─ Property Detail ─ Checkout ─ Account │
└────────────────────────┬─────────────────────────────────┘
                         │
           ┌─────────────┴──────────────┐
           │                            │
           ▼                            ▼
┌─────────────────────┐     ┌────────────────────────┐
│  Next.js Server      │     │  FastAPI AI Backend     │
│  (Drizzle ORM)       │     │  (Python)               │
│                      │     │                          │
│  • Auth (better-auth)│     │  • POST /api/embed-      │
│  • CRUD queries      │     │    profiles              │
│  • Pod state machine │     │  • POST /api/property-   │
│  • Server Actions    │     │    match                 │
└──────────┬───────────┘     └────────────┬─────────────┘
           │                              │
           └──────────┬──────────────────┘
                      ▼
          ┌────────────────────────┐
          │  Neon Postgres         │
          │  (pgvector enabled)    │
          │                        │
          │  Schemas:              │
          │  • users, sessions     │
          │  • user_profiles       │
          │    (3072-d embeddings) │
          │  • properties, pods    │
          │  • pod_members         │
          │  • locations, flights  │
          │  • amenities, tags     │
          │  • testimonials        │
          └────────────────────────┘
```

**Data flow for AI matching:**

1. User profiles are converted to structured semantic text and embedded via OpenAI.
2. When a signed-in user views a property, Next.js calls the FastAPI backend with the user ID, property ID, and month.
3. FastAPI runs a `pgvector` cosine similarity query against existing pod members' embeddings and asks GPT-4o to generate a match explanation.
4. The match score and explanation are returned to the frontend and rendered on the property detail page.

## Repository Structure

```
syncstay-coliving/
├── platform-frontend/          # Next.js application (main codebase)
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── search/             # Property search with filters
│   │   ├── properties/[id]/    # Property detail + AI match display
│   │   ├── checkout/           # Pod commitment / booking flow
│   │   ├── account/            # User profile, bookings, auth settings
│   │   ├── auth/               # Sign-in / sign-up pages (better-auth)
│   │   ├── api/
│   │   │   ├── auth/           # better-auth API routes
│   │   │   └── rank-pods/      # Proxy to FastAPI for AI matching
│   │   └── components/         # App-level components (nav, footer)
│   ├── components/
│   │   ├── landing/            # Landing page sections
│   │   ├── ui/                 # shadcn/ui primitives
│   │   └── kokonutui/          # Custom UI components
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema (all domain tables)
│   │   ├── drizzle.ts          # Neon DB connection
│   │   └── scripts/
│   │       ├── seed.ts         # Full database seed script
│   │       └── embed-profiles.ts  # Trigger embedding generation
│   ├── lib/
│   │   ├── auth.ts             # better-auth server config
│   │   ├── auth-client.ts      # better-auth client config
│   │   └── properties/         # Property display helpers
│   ├── auth-schema.ts          # Drizzle schema (auth tables)
│   ├── drizzle.config.ts       # Drizzle Kit config
│   ├── proxy.ts                # Auth-guard middleware
│   └── public/                 # Static assets (images, icons)
│
├── ai-backend/                 # FastAPI microservice
│   ├── main.py                 # API endpoints + AI logic
│   └── requirements.txt        # Python dependencies
│
├── docs/                       # Project documentation
├── specification.md            # MVP specification
├── booking-flow.md             # Booking state machine docs
├── matching-profile-factors.md # Matching algorithm design
└── embedding-strategy.md       # Embedding pipeline docs
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **Neon** database with the `pgvector` extension enabled
- **OpenAI** API key

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/syncstay-coliving.git
cd syncstay-coliving
```

### 2. Set up the Next.js frontend

```bash
cd platform-frontend
npm install
```

Create a `.env` file in `platform-frontend/`:

```env
DATABASE_URL="postgresql://..."          # Neon connection string
OPENAI_API_KEY="sk-..."                  # OpenAI API key
BETTER_AUTH_SECRET="<random-base64>"      # Auth encryption secret
BETTER_AUTH_URL="http://localhost:3000"   # App base URL
AI_BACKEND_URL="http://localhost:8000"   # FastAPI backend URL
```

Push the schema to your database and seed it:

```bash
npx drizzle-kit push
npm run db:seed
npm run db:embed-profiles
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 3. Set up the AI backend

```bash
cd ai-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `ai-backend/`:

```env
DATABASE_URL="postgresql://..."    # Same Neon connection string
OPENAI_API_KEY="sk-..."           # Same OpenAI API key
```

Start the FastAPI server:

```bash
uvicorn main:app --reload --port 8000
```

The AI API will be available at `http://localhost:8000`.

---

<sub>Built as an MVP prototype exploring AI-driven co-living matchmaking for digital nomads.</sub>
