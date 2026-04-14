# SyncStay AI Backend API Documentation

## Overview
The `ai-backend` application powers the remaining AI matching capabilities of SyncStay through FastAPI. Its active responsibility is generating property-specific compatibility explanations using stored `pgvector` embeddings plus GPT-4o.

Property ranking for `/search` now lives in the Next.js app, so this backend no longer exposes `/api/rank-pods`.
