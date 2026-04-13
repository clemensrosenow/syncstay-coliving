# SyncStay Embedding Optimization Strategy

> Guidelines and rationale for how user profiles are processed into text and passed to the `text-embedding-3-large` model for the `pgvector` coliving search engine.

---

## 1. Contextual Semantic Framing

**The Problem:** Normal generative embeddings measure general semantic similarity. Someone who is "very organized and clean" and someone who "loves organizing data" might score slightly similar because of the word "organize". We don't care about their general personality; we care about their *behavior as a housemate*.
**The Solution:** All profile data is deliberately prepended with context frames like `"As a housemate, they..."` or `"In a shared house, they..."` This anchors the resulting coordinates in the latent space specifically around household dynamics.

## 2. Categorical Structural Markers

**The Problem:** When feeding a raw paragraph of text (e.g., bio + schedule + cleanliness), the attention heads of the model can bleed the contexts together.
**The Solution:** The text is segmented using strict bracketed labels:
- `[DEMOGRAPHICS]`
- `[LIFESTYLE & WORK]`
- `[HOUSEHOLD RULES]`
- `[COMMUNITY VIBE]`
- `[INTERESTS]`
- `[PERSONAL NOTE]`

This structure forces the transformer's attention mechanisms to compartmentalize the traits, making comparisons between two formatted strings mathematically cleaner and resulting in a higher signal-to-noise ratio in cosine similarity calculations.

## 3. Deliberate Data Omission (Hard Constraints vs. Soft Vibes)

**The Problem:** If we include fields like `budgetTier` or `genderPreference` in the embedding text, the AI will factor them into the compatibility score. This means two people with identical personalities but conflicting budgets might still score an "85% match".
**The Solution:** We **exclude** hard constraints from the embedding string entirely. 
- Budget, age ranges, gender requirements, and property-specific needs (AC/WiFi) are omitted from the text vectorization.
- They are handled exclusively via PostgreSQL `WHERE` clauses *before* the vector sort `ORDER BY embedding <-> query` is executed. The vector search is strictly reserved for qualitative personality matching.

## 4. Normalization of Time and Numbers

**The Problem:** Raw timestamps (like `"1997-03-14"`) or disjointed integers (like `workStart: 6`) are mathematically alien concepts to a language model evaluating personality. 
**The Solution:** The script preprocesses raw numbers into semantic representations:
- `1997-03-14` → `"A 28-year-old professional."`
- `6:00 to 14:00` → `"working from 6:00 to 14:00"` combined with their chronotype `"identifies as an early bird"`.

## 5. Execution Optimization: Batching

To ensure the seed script (and future background jobs) can process thousands of profiles without hitting API throttling or dragging out execution time to hours, the script uses **Batch Processing**.
OpenAI's embedding endpoint accepts arrays. Instead of `1 request = 1 profile` (which incurs massive HTTP overhead), the script chunks profiles into arrays of 50. This reduces a 1,000-user embedding job from 1,000 network requests down to exactly 20.
