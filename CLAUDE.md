# CLAUDE.md — LegalPh.AI

> Claude Code reads this file automatically at the start of every session.
> Last updated: March 2026

## Project Overview

**LegalPh.AI** is an AI-powered legal technology platform for the Philippine legal ecosystem. It provides AI legal research, document drafting, notarial compliance tools, and citizen legal navigation services.

**Domain:** legalph.ai
**Builder:** Solo developer (Jun) + Claude AI. No team, no co-founders, no hires. All architecture and code designed for one-person operation with AI assistance.

## Tech Stack

| Layer | Platform | Details |
|-------|----------|---------|
| Frontend | **Netlify** | Next.js 14+ (App Router), React 18+, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | **Railway** | Node.js + Python microservices, Redis cache, cron jobs |
| Database | **Neon PostgreSQL** | Serverless Postgres, pgvector for AI embeddings, database branching |
| AI | **Claude API** (claude-sonnet-4-20250514) + **OpenAI** text-embedding-3-small (1536 dims) |
| Auth | Clerk or Auth.js |
| Payments | Stripe |
| Analytics | Plausible (privacy-first, DPA-compliant) |

## Repository Structure

```
legalph-ai/
├── CLAUDE.md                  # This file — Claude Code context
├── ARCHITECTURE.md            # Detailed technical architecture
├── README.md
├── frontend/                  # Next.js app → deploys to Netlify
│   ├── app/                   # App Router pages
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Authenticated dashboard
│   │   │   ├── research/      # AI legal research interface
│   │   │   ├── drafting/      # Document drafting tools
│   │   │   ├── notarial/      # Notarial practice suite
│   │   │   ├── cases/         # Case management
│   │   │   └── settings/      # User/subscription settings
│   │   ├── (public)/          # Public pages (landing, pricing, legal navigator)
│   │   └── api/               # Next.js API routes (proxy to Railway)
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── legal/             # Legal-specific components (case cards, citation links)
│   │   └── layout/            # Layout components (sidebar, header, footer)
│   ├── lib/                   # Utilities, API client, auth helpers
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── netlify.toml           # Netlify configuration
│   └── package.json
├── backend/                   # Railway services
│   ├── api-gateway/           # Node.js — REST API, auth middleware, rate limiting
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── ai-engine/             # Python — RAG pipeline, embeddings, Claude orchestration
│   │   ├── src/
│   │   │   ├── rag/           # Retrieval-augmented generation
│   │   │   ├── embeddings/    # Vector embedding generation
│   │   │   ├── citations/     # Citation verification
│   │   │   └── main.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── search-service/        # Node.js — Full-text + semantic search
│   ├── document-processor/    # Python — PDF parsing, OCR, template rendering
│   ├── scraper-workers/       # Python — SC E-Library, LawPhil, Gazette crawlers
│   ├── notarial-service/      # Node.js — Digital notarial register, compliance
│   └── auth-service/          # Node.js — User auth, RBAC, subscriptions
├── shared/                    # Shared types, constants, utilities
│   ├── types/                 # TypeScript type definitions
│   ├── constants/             # Legal enums (court types, case categories)
│   └── utils/
├── database/                  # Neon PostgreSQL
│   ├── migrations/            # SQL migration files (numbered)
│   ├── seeds/                 # Seed data (sample cases, test users)
│   └── schema.sql             # Full schema reference
├── scripts/                   # Dev utilities
│   ├── scrape/                # One-off scraping scripts
│   ├── embed/                 # Batch embedding scripts
│   └── deploy/                # Deployment helpers
└── docs/                      # Additional documentation
    ├── api/                   # API documentation
    ├── legal/                 # Legal compliance docs, PIA
    └── guides/                # User guides
```

## Railway Services

| Service | Runtime | Port | Internal URL |
|---------|---------|------|-------------|
| api-gateway | Node.js | 3000 | `api-gateway.railway.internal` |
| ai-engine | Python | 8000 | `ai-engine.railway.internal` |
| search-service | Node.js | 3001 | `search-service.railway.internal` |
| document-processor | Python | 8001 | `document-processor.railway.internal` |
| scraper-workers | Python | — | Cron-triggered, no HTTP port |
| notarial-service | Node.js | 3002 | `notarial-service.railway.internal` |
| auth-service | Node.js | 3003 | `auth-service.railway.internal` |
| redis | Redis | 6379 | `redis.railway.internal` |

## Database Schema (Neon)

Key schemas and tables:

```sql
-- Legal corpus
legal_corpus.cases          -- SC/CA/CTA decisions (gr_number, full_text, embedding VECTOR(1536))
legal_corpus.statutes       -- RAs, PDs, EOs (number, title, status, embedding)
legal_corpus.provisions     -- Individual sections/articles (statute_id, section_number, embedding)
legal_corpus.citations      -- Citation graph (source_id, target_id, citation_type)

-- Notarial (per 2004 Rules on Notarial Practice, A.M. No. 02-8-13-SC)
notarial.registers          -- Digital notarial register entries (Rule VI compliance)
notarial.commissions        -- Commission tracking with renewal alerts

-- Users
users.accounts              -- Profiles (role: lawyer|citizen|notary|judge|admin)
users.subscriptions         -- Stripe-managed billing

-- Case management
cases.matters               -- Client cases, hearings, deadlines

-- Analytics
analytics.queries           -- AI query logs with citations and confidence scores
```

pgvector is enabled: `CREATE EXTENSION IF NOT EXISTS vector;`
Embedding dimension: 1536 (OpenAI text-embedding-3-small)
Index type: HNSW with cosine distance (`<=>` operator)

## Environment Variables

```bash
# Neon
DATABASE_URL=postgresql://...@ep-xxx.ap-southeast-1.aws.neon.tech/legalph?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://...  # For migrations

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Auth
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis (Railway internal)
REDIS_URL=redis://redis.railway.internal:6379

# App
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.legalph.ai
```

## Key Commands

```bash
# Frontend (Netlify)
cd frontend && npm run dev          # Local dev at localhost:3000
cd frontend && npm run build        # Production build (static export)

# Backend services (Railway)
cd backend/api-gateway && npm run dev
cd backend/ai-engine && python -m uvicorn src.main:app --reload

# Database (Neon)
cd database && npx dbmate up        # Run migrations
cd database && npx dbmate new name  # Create new migration

# Embedding scripts
cd scripts/embed && python batch_embed.py --source sc-decisions --limit 1000
```

## Coding Conventions

- **TypeScript everywhere** (frontend + Node.js services). Python for AI/ML services only.
- **Strict mode** enabled in tsconfig.json
- **ESLint + Prettier** with consistent config across all packages
- **Zod** for runtime validation on all API inputs
- **Error handling**: All API endpoints return `{ success: boolean, data?: T, error?: { code: string, message: string } }`
- **Naming**: camelCase for variables/functions, PascalCase for components/types, snake_case for database columns
- **API versioning**: `/api/v1/...` prefix on all endpoints
- **Legal disclaimers**: Every AI response MUST include the standard disclaimer text (see `shared/constants/disclaimers.ts`)

## Philippine Legal Context

This platform must comply with:
- **Data Privacy Act of 2012 (RA 10173)** — NPC registration, PIA, 72-hour breach notification
- **NPC Advisory 2024-04** — AI transparency, human oversight for automated decisions
- **2004 Rules on Notarial Practice (A.M. No. 02-8-13-SC)** — Notarial register format, commission requirements
- **2025 Rules on Electronic Notarization (A.M. No. 24-10-14-SC)** — IEN/REN for electronic documents
- **UPL Prevention** — Platform provides legal INFORMATION, not ADVICE. All AI outputs carry disclaimers.

## AI/RAG Pipeline

1. User submits natural language legal query
2. Query → embedding via OpenAI text-embedding-3-small (1536 dims)
3. pgvector similarity search in Neon across legal_corpus tables
4. Top-k passages retrieved with metadata (case number, date, ponente, court)
5. Context + query → Claude API (claude-sonnet-4-20250514) with legal system prompt
6. Citation verification layer confirms all referenced cases/statutes exist
7. Cache response in Redis (TTL based on query type)
8. Return response with inline citations and confidence score

## Important Notes

- **Solo operation**: This entire platform is built and maintained by one developer with Claude AI. Prioritize managed services, automation, and simplicity over custom solutions.
- **No custom ML models**: Use managed AI APIs (Claude, OpenAI embeddings). No training, no GPU infrastructure.
- **Deploy via git push**: All three platforms (Netlify, Railway, Neon) deploy automatically from GitHub.
- **Philippine timezone**: All timestamps in Asia/Manila (UTC+8). Date formats: YYYY-MM-DD.
- **Multi-language**: UI supports English, Filipino, Cebuano, Ilocano via next-intl.
- **Mobile-first**: Many Philippine lawyers access tools via mobile. Responsive design is mandatory.
