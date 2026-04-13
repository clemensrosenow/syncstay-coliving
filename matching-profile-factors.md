# Traveler Matching Profile Factors

> Factors collected during onboarding and stored on the user profile.  
> Used by the AI engine to generate embedding vectors (`pgvector`, 3072-dim) and by the LLM to synthesize personalized pod-match hooks.

---

## 1 · Work & Productivity Style

These factors determine whether housemates will respect each other's focus time and naturally sync their daily rhythms.

| Factor | Input Type | Example Values |
|---|---|---|
| **Primary work timezone** | Dropdown | UTC−5 … UTC+9 (or "Flexible / No fixed TZ") |
| **Typical work hours** | Range selector | e.g. 09:00–17:00, 12:00–20:00, "Variable" |
| **Work intensity** | Single select | Deep-focus blocks · Mixed meetings & async · Mostly calls/meetings · Light / freelance schedule |
| **Need for quiet during work** | Likert 1–5 | 1 = "Noise doesn't bother me" → 5 = "I need library-level silence" |
| **Preferred workspace** | Multi-select | Home/house office · Co-working space · Café · Library · Outdoors |
| **Industry / role** | Free text + tags | "Product Design", "Backend Engineering", "Content Creator", "Founder" |

---

## 2 · Daily Rhythm & Lifestyle

Mismatched sleep schedules and cleanliness standards are the #1 destroyer of shared-living harmony.

| Factor | Input Type | Example Values |
|---|---|---|
| **Chronotype** | Single select | Early bird (up before 7) · Standard (7–9) · Night owl (after 10) |
| **Sleep sensitivity** | Likert 1–5 | 1 = "Sleep through anything" → 5 = "Light sleeper, need total quiet" |
| **Cleanliness standard** | Likert 1–5 | 1 = "Relaxed" → 5 = "Spotless at all times" |
| **Cooking habits** | Single select | Cook daily · Cook sometimes · Mostly eat out · Mix of both |
| **Dietary preferences** | Multi-select + free text | Vegan · Vegetarian · Pescatarian · Halal · Kosher · Gluten-free · No restrictions |
| **Smoking** | Single select | Non-smoker · Social smoker · Regular smoker (outdoors only) |
| **Alcohol & social drinking** | Single select | Non-drinker · Occasional · Social · Frequent |
| **Pet comfort** | Single select | Love pets · Fine with them · Prefer pet-free |

---

## 3 · Social & Interpersonal Preferences

The balance between community and solitude is the core promise of co-living.

| Factor | Input Type | Example Values |
|---|---|---|
| **Social energy** | Slider | Introvert ←——→ Extrovert |
| **Communal meal interest** | Likert 1–5 | 1 = "I eat alone" → 5 = "Let's cook together every night" |
| **Guest / visitor policy** | Single select | No guests · Occasional guests OK · Frequent guests welcome |
| **Shared activity appetite** | Multi-select | Co-working sessions · Group dinners · Weekend trips · Fitness together · Movie nights · "I prefer solo time" |
| **Conflict resolution style** | Single select | Direct conversation · Written message first · Prefer mediation · Avoid confrontation |
| **Communication style** | Single select | Group chat active · Responsive but quiet · Minimal digital contact |

---

## 4 · Interests & Hobbies

Powers the "You share similar interests" hooks that the LLM generates for pod recommendations.

| Factor | Input Type | Example Values |
|---|---|---|
| **Top interests** (pick 3–7) | Tag selector | Surfing · Yoga · Hiking · Photography · Gaming · Reading · Music production · Cooking · Rock climbing · Diving · Skateboarding · Art · Writing · Dancing · Martial arts |
| **Fitness routine** | Single select | Daily · A few times a week · Occasionally · Rarely |
| **Weekend vibe** | Single select | Adventure & explore · Relax & recharge · Social events & nightlife · Work on side projects |
| **Learning appetite** | Multi-select | Language classes · Skill swaps · Book clubs · Hackathons · "Not looking for this" |

---

## 5 · Travel & Logistics Profile

Hard constraints that filter before the AI even scores compatibility.

| Factor | Input Type | Example Values |
|---|---|---|
| **Nomad experience** | Single select | First time · < 1 year · 1–3 years · 3+ years |
| **Typical stay length** | Single select | 2–4 weeks · 1–2 months · 3–6 months · 6+ months |
| **Budget tier** | Single select | Budget-conscious · Mid-range · Premium · Flexible |
| **Languages spoken** | Multi-select + proficiency | English (native) · Spanish (conversational) · Portuguese (beginner) |
| **Visa / remote-work status** | Single select | Tourist visa · Digital nomad visa · Residency · Citizen |

---

## 6 · Values & Dealbreakers

High-signal, low-noise factors that prevent fundamentally incompatible matches.

| Factor | Input Type | Example Values |
|---|---|---|
| **Gender** | Single select | Male · Female · Non-binary · Prefer not to say |
| **Age** | Number | Used for age-range matching; displayed as range (e.g. "mid-20s") |
| **Sustainability importance** | Likert 1–5 | 1 = "Not a priority" → 5 = "Core value — affects daily choices" |
| **Gender preference for pod** | Single select | No preference · Women-only · Men-only · Non-binary inclusive preferred |
| **Age range comfort** | Range selector | e.g. 22–35, 25–45, "No preference" |
| **Dealbreakers** | Multi-select | Smoking indoors · Loud music after 22:00 · No AC · Pets · Shared bathroom · Party house |

---

## 7 · Free-Text "About Me"

A short bio (≤ 300 chars) that the embedding model processes for semantic similarity and the LLM uses to craft the personalized match hook.

> *"Full-stack dev from Berlin. I work 10–6. mornings for yoga, evenings for cooking experiments. Looking for calm, focused housemates who also like weekend surf trips."*

---

## 8 · Property & Accommodation Preferences

What the traveler needs from the physical space. These filter and rank *which pods* to show, before interpersonal compatibility is scored.

| Factor | Input Type | Example Values |
|---|---|---|
| **WiFi requirement** | Single select | Basic (browsing) · Reliable (video calls) · High-speed (streaming/uploads) |
| **Private vs. shared bathroom** | Single select | Private required · Shared is fine · No preference |
| **Air conditioning** | Single select | Must have · Nice to have · Don't care |
| **Kitchen access** | Single select | Full kitchen required · Shared kitchen fine · Not important |
| **Workspace setup** | Single select | Dedicated desk/monitor space · Any table works · Use co-working instead |
| **Location vibe** | Single select | City center · Beachfront / nature · Suburban / quiet · No preference |
| **Accessibility needs** | Multi-select | Ground floor · Step-free access · Wide doorways · None |

---

## How These Factors Feed the AI Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  Onboarding Form (factors 1–8 above)                    │
└──────────────────────┬──────────────────────────────────┘
                       │  JSON profile blob
                       ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI  /api/generate-embedding                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Prompt template stitches all factors into a       │  │
│  │ natural-language paragraph → sent to embedding    │  │
│  │ model → 3072-dim vector stored in users.embedding │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI  /api/rank-pods                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 1. pgvector cosine similarity pre-filters top     │  │
│  │    candidate pods                                 │  │
│  │ 2. LLM receives raw profile factors of user +     │  │
│  │    pod members → generates 2-sentence hook +      │  │
│  │    final compatibility score                      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Weighting Philosophy
Not all factors are equal. The embedding model naturally captures this, but for interpretability:

| Priority | Factors | Why |
|---|---|---|
| **Must-match** (dealbreakers filter first) | Dealbreakers, gender pref, budget tier, schedule conflicts | Incompatibility here = zero chance of a good stay |
| **Hard filter** (property level) | WiFi, AC, bathroom, accessibility needs | Filters *which pods* are shown before scoring |
| **High weight** | Work hours, chronotype, cleanliness, social energy | Day-to-day friction points |
| **Medium weight** | Interests, cooking, fitness, weekend vibe | Community bonding surface area |
| **Low weight** (enrichment) | Industry, nomad experience, languages | Nice-to-haves that improve the LLM hook quality |

---

## MVP Seeding Note

For the 6-hour sprint, these factors will be **pre-generated via Faker + a Python seed script** and stored as JSON on each seeded user row, then batch-embedded. The onboarding UI that collects these from real users is **out of scope** for the MVP.

---

## 🎯 MVP Top 5: The Only Factors That Matter for v1

Out of the full factor list above, these five carry ~80% of the matching signal. Everything else is enrichment we can add later.

1. **Work schedule** (chronotype + typical work hours, combined)
   - *Why:* This is the single highest-friction dimension in co-living. A night-owl developer on calls until 2 AM sharing a wall with an early-bird yoga instructor who's asleep by 10 PM is a guaranteed conflict. Aligning daily rhythm is the minimum viable compatibility check.

2. **Cleanliness standard** (Likert 1–5)
   - *Why:* Every shared-housing study — from university dorms to coliving platforms — identifies cleanliness mismatch as the #1 source of housemate resentment. It's also dead-simple to collect (one slider) and extremely predictive. A one-question factor with outsized signal.

3. **Social energy** (introvert ↔ extrovert slider)
   - *Why:* Co-living's entire value proposition is community. But mismatched expectations destroy it: an extrovert who wants group dinners every night will exhaust an introvert who came for affordable rent and quiet focus time. This single axis captures whether the pod will feel like a commune or a library — and both are valid, as long as everyone agrees.

4. **Budget tier** (budget-conscious / mid-range / premium)
   - *Why:* This is a hard economic constraint, not a preference. If one person wants the €400/month shared house and another expects the €1,200 designer villa, they shouldn't be in the same pod. Budget also correlates with lifestyle expectations (eating out vs. cooking, activities, transport). Filtering on this *before* AI scoring avoids wasted computation on impossible matches.

5. **Top interests** (pick 3–7 tags)
   - *Why:* The first four factors prevent *conflict*. This one creates *connection*. Shared interests are what turn strangers into a community — and they're exactly what the LLM needs to generate compelling pod hooks ("You and Alex both surf and do photography"). Without this, the AI can only say "your schedules are compatible," which is accurate but not motivating.

> **Design principle:** Factors 1–4 filter out bad matches (conflict avoidance). Factor 5 ranks the remaining good matches (connection creation). Both halves are necessary — neither alone is sufficient.
