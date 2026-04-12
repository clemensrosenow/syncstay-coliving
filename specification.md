# MVP Specification: AI-Powered Co-Living Travel Platform

## 1. Project Overview
A prototype travel platform designed to optimize long-term stays for digital nomads by intelligently grouping compatible travelers into shared accommodations (Co-Living Pods). To solve marketplace liquidity constraints and ensure feasibility within a 6-hour sprint, the platform utilizes a **"Pod-First Gravity"** model. AI acts as a steering mechanism, guiding users toward partially filled pods to maximize booking success rates and social compatibility.

## 2. Technical Stack
* **Frontend & Internal API:** Next.js (TypeScript, App Router)
* **Styling:** Tailwind CSS (with shadcn/ui for rapid component scaffolding)
* **Authentication:** `better-auth` (Configured for single-provider OAuth like Google, or a hardcoded "Demo Login" bypass)
* **Database:** Neon.tech (Serverless Postgres with the `pgvector` extension)
* **ORM:** Drizzle ORM *(Schema definition pending next phase)*
* **AI Microservice:** FastAPI (Python)
* **AI Models:** External LLM & Embedding APIs (e.g., Google Gemini or OpenAI)

## 3. Core UX Flow (The "Gravity" Pod-First Model)
The platform operates on fixed constraints to eliminate complex matching math. 

### 3.1. Discovery & Constraints
* **Static Timeframes:** Bookings occur in fixed, full-calendar-month blocks (e.g., "October 2026").
* **Hardcoded Locations:** Users choose from predefined hubs via a simple dropdown (e.g., Lisbon, Bali, Medellin).
* **Flat-Rate Pricing:** A property’s total cost is divided equally among its total rooms.
* **The "Anchor" Property:** Users browse available houses (Pods) first, rather than matching with humans in a vacuum. 

### 3.2. AI Steering & Sorting
* Instead of standard sorting (e.g., by price), properties in a selected location/month are sorted by an **AI Pod Compatibility Score**.
* **Vector Math:** The FastAPI microservice compares the active user's embedding vector against the vectors of travelers who are *already pending* in a specific Pod.
* **LLM Synthesis:** For Pods with existing pending members, the LLM generates a personalized 2-sentence hook (e.g., *"95% Match: Sarah and Alex are pending here. You share similar work hours and a love for surfing."*). 
* **Empty Pods:** Empty houses are displayed at the bottom of the feed with a prompt to "Be the first to anchor this Pod."

### 3.3. Frictionless Booking State Machine
* **Action:** The user clicks "Commit to Pod." 
* **Pre-Authorization (Simulated):** The user agrees to pay *only* if the Pod reaches its required minimum occupancy (e.g., 3 out of 4 rooms).
* **State Updates:**
    * Clicking "Commit" adds the user to the Pod and sets their booking status to `PENDING`.
    * If the addition of this user meets the `min_occupancy` threshold, the platform automatically shifts the Pod status to `LOCKED`.
* **Success UI:** Upon locking, the UI updates to show "Match Successful" and displays a mocked "Group Chat Unlocked" interface.

## 4. API & Architecture Contracts
To maintain clean separation of concerns:
1. **Next.js (The Orchestrator):** Handles routing, UI state, auth, and standard Drizzle queries (fetching Pods, joining Pods). 
2. **FastAPI (The AI Engine):** Receives a `POST /api/rank-pods` request from Next.js containing the active User ID and a list of available Pods. It executes the `pgvector` similarity search on Neon, queries the LLM for the text summaries, and returns a sorted JSON array of Pods back to Next.js.

## 5. Strict Exclusions (Out of Scope for MVP)
To guarantee delivery within the 6-hour window, the following are strictly prohibited:
* **Host UI / Supply Side:** No dashboards for property owners. All properties will be pre-seeded into the database by the developer.
* **Complex User Onboarding:** Initial nomad users and their vector embeddings will be generated and pre-seeded via a Python script.
* **Payment Gateways:** No Stripe/PayPal integration. Financial commitment is simulated entirely via database status changes.
* **Multi-Destination Logic:** Users book one location for one month. Route optimization is excluded.
* **Dynamic Pricing:** Prices are static. No algorithmic price adjustments.
* **Real-Time WebSockets:** No live chat servers or email/SMS integrations (SendGrid/Twilio). Notifications are simulated via static UI state changes.
