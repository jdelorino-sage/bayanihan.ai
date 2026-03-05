# ARCHITECTURE.md — Bayanihan.AI Technical Architecture

> Detailed technical architecture for the Bayanihan.AI platform.
> For quick reference, see [CLAUDE.md](./CLAUDE.md).

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      USERS                               │
│   Lawyers · Citizens · Notaries · Courts · OFWs          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────┐
│                    NETLIFY CDN                            │
│   Next.js 14+ (App Router)  ·  Edge Functions            │
│   Static Pages  ·  ISR for legal content                 │
│   React 18+ / TypeScript / Tailwind / shadcn/ui          │
│   Auth (Clerk)  ·  Plausible Analytics                   │
│   Deploy: git push → auto-deploy < 60s                   │
└────────────────────────┬────────────────────────────────┘
                         │ API Calls (HTTPS)
┌────────────────────────▼────────────────────────────────┐
│                  RAILWAY (Backend)                        │
│                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │ API Gateway  │  │  AI/RAG      │  │   Search     │  │
│   │ (Node.js)    │──│  Engine      │  │   Service    │  │
│   │ REST + Auth  │  │  (Python)    │  │  (Node.js)   │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │  Document    │  │  Scraper     │  │  Notarial    │  │
│   │  Processor   │  │  Workers     │  │  Service     │  │
│   │  (Python)    │  │  (Python)    │  │  (Node.js)   │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│   ┌──────────────┐  ┌──────────────┐                     │
│   │ Auth Service │  │    Redis     │                     │
│   │ (Node.js)    │  │   (Cache)    │                     │
│   └──────────────┘  └──────────────┘                     │
│                                                          │
│   Private networking between services                    │
│   Deploy: git push → auto-deploy                         │
│   Pricing: usage-based (CPU/memory utilization)          │
└────────────────────────┬────────────────────────────────┘
                         │ Connection Pooling (SSL)
┌────────────────────────▼────────────────────────────────┐
│              NEON PostgreSQL + pgvector                   │
│   Region: AWS ap-southeast-1 (Singapore)                 │
│                                                          │
│   Schemas:                                               │
│   ├── legal_corpus (cases, statutes, provisions,         │
│   │                 citations, embeddings)                │
│   ├── notarial (registers, commissions)                  │
│   ├── users (accounts, subscriptions)                    │
│   ├── cases (matters, hearings, deadlines)               │
│   └── analytics (queries, usage)                         │
│                                                          │
│   pgvector: HNSW index, cosine distance, 1536 dims      │
│   Branching: main → staging → dev/* → migration/*        │
│   Scale-to-zero when idle                                │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  EXTERNAL APIS                           │
│   Claude API (claude-sonnet-4-20250514)                          │
│   OpenAI Embeddings (text-embedding-3-small)             │
│   SC E-Library · LawPhil · Official Gazette              │
│   Stripe · Clerk · NPC APIs                              │
└─────────────────────────────────────────────────────────┘
```

## Frontend — Netlify

### Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | Next.js 14+ (App Router) | SSG for legal content, ISR for fresh data, API routes as proxy |
| Language | TypeScript (strict) | Type safety for complex legal data models |
| UI | Tailwind CSS + shadcn/ui | Rapid professional UI building; consistent design system |
| State | Zustand (client) + TanStack Query (server) | Minimal boilerplate; built-in caching and revalidation |
| Auth | Clerk | Drop-in auth with MFA, SSO, session management |
| i18n | next-intl | English, Filipino, Cebuano, Ilocano |
| PDF | react-pdf | In-browser rendering of SC decisions and legal documents |
| Analytics | Plausible | Privacy-first, no cookies, DPA-compliant |
| Search UI | Custom | Typeahead, faceted filters (court, date range, topic, ponente) |

### Key Pages

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Landing page, product overview |
| `/pricing` | Public | Subscription tiers |
| `/legal-navigator` | Public (Free) | Citizen AI chatbot for basic legal info |
| `/dashboard` | Auth | Main dashboard with usage stats |
| `/dashboard/research` | Auth | AI legal research interface |
| `/dashboard/drafting` | Auth (Pro+) | Document drafting tools |
| `/dashboard/notarial` | Auth (Notary) | Notarial register and compliance |
| `/dashboard/cases` | Auth (Pro+) | Case management |
| `/dashboard/settings` | Auth | Profile, subscription, API keys |
| `/api/v1/*` | — | Next.js API routes proxying to Railway |

### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NEXT_PRIVATE_STANDALONE = "true"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"

[[redirects]]
  from = "/api/v1/*"
  to = "https://api.bayanihan.io/v1/:splat"
  status = 200
  force = true
```

## Backend — Railway

### Service Details

#### API Gateway (Node.js/Express)

Primary entry point for all client requests.

- Request validation (Zod schemas)
- JWT verification (Clerk tokens)
- Rate limiting (Redis-backed, per-user tier)
- API versioning (`/v1/`)
- Request logging and metrics
- CORS configuration for bayanihan.io

Rate limits by tier:
| Tier | Requests/min | AI Queries/day |
|------|-------------|---------------|
| Free (Citizen) | 30 | 5 |
| Student | 60 | 50 |
| Professional | 120 | 200 |
| Firm | 300 | Unlimited |
| Enterprise | Custom | Unlimited |

#### AI/RAG Engine (Python/FastAPI)

Core intelligence layer. Handles all AI-powered features.

```python
# RAG Pipeline Flow
async def legal_research(query: str, user_id: str) -> LegalResponse:
    # 1. Generate query embedding
    embedding = await openai.embeddings.create(
        model="text-embedding-3-small",
        input=query
    )

    # 2. Vector similarity search in Neon
    similar_docs = await neon.query("""
        SELECT id, gr_number, title, date, ponente, full_text,
               embedding <=> $1::vector AS distance
        FROM legal_corpus.cases
        ORDER BY embedding <=> $1::vector
        LIMIT 10
    """, [embedding])

    # 3. Full-text search supplement
    fts_results = await neon.query("""
        SELECT id, gr_number, title, ts_rank(tsvector_content, query) AS rank
        FROM legal_corpus.cases,
             plainto_tsquery('english', $1) query
        WHERE tsvector_content @@ query
        ORDER BY rank DESC
        LIMIT 5
    """, [query])

    # 4. Merge and deduplicate results
    context = merge_results(similar_docs, fts_results)

    # 5. Generate response via Claude
    response = await anthropic.messages.create(
        model="claude-sonnet-4-20250514",
        system=LEGAL_SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion: {query}"
        }]
    )

    # 6. Verify citations
    verified = await verify_citations(response)

    # 7. Cache and return
    await redis.setex(cache_key(query), 3600, verified)
    return verified
```

#### Search Service (Node.js)

Handles full-text and semantic search independently from the AI engine.

- Combined tsvector + pgvector queries
- Faceted search: court, date range, topic, ponente, case type
- Autocomplete/typeahead for case numbers and statute references
- Search result ranking combining text relevance + vector similarity

#### Document Processor (Python)

- PDF text extraction (PyMuPDF + Tesseract OCR for scanned documents)
- Legal document template rendering (Jinja2 → DOCX/PDF)
- Contract analysis: clause extraction, risk scoring
- Document comparison/redlining

#### Scraper Workers (Python)

Scheduled via Railway cron jobs:

| Schedule | Source | Action |
|----------|--------|--------|
| Daily 2:00 AM PHT | SC E-Library | Scrape new decisions, embed, index |
| Daily 3:00 AM PHT | LawPhil | Check for new statutes/decisions |
| Weekly Monday | Official Gazette | New RAs, EOs, proclamations |
| Weekly Monday | Congress.gov.ph | Bill status updates |
| Monthly 1st | Notarial reports | Generate monthly Clerk of Court submissions |

#### Notarial Service (Node.js)

Implements digital notarial register per 2004 Rules on Notarial Practice:

- **Rule VI, Sec. 2 compliance**: Entry number, page number, date/time, notarial act type, instrument title, principal name, identity evidence, fee charged, location
- **Rule VI, Sec. 2(g)**: Weekly certification of instruments executed
- **Rule VI, Sec. 2(h)**: Monthly certified copy generation for Clerk of Court
- **Rule IV, Sec. 3**: Disqualification checker (party, relative within 4th civil degree, financial interest)
- **Rule III, Sec. 13**: Commission renewal alerts (45 days before expiry)
- **2025 E-Notarization readiness**: Data model supports IEN/REN metadata fields

## Database — Neon PostgreSQL

### Schema Details

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- Fuzzy text matching

-- ============================================
-- LEGAL CORPUS SCHEMA
-- ============================================
CREATE SCHEMA legal_corpus;

CREATE TABLE legal_corpus.cases (
    id              BIGSERIAL PRIMARY KEY,
    gr_number       VARCHAR(50) UNIQUE NOT NULL,   -- e.g., "G.R. No. 123456"
    title           TEXT NOT NULL,                   -- e.g., "People v. Santos"
    date_decided    DATE NOT NULL,
    court           VARCHAR(50) NOT NULL,            -- SC, CA, CTA, Sandiganbayan
    division        VARCHAR(50),                     -- First, Second, Third, En Banc
    ponente         VARCHAR(200),
    full_text       TEXT NOT NULL,
    digest          TEXT,
    dispositive     TEXT,                            -- Dispositive portion
    case_type       VARCHAR(50),                     -- Criminal, Civil, Labor, etc.
    source_url      TEXT,
    tsvector_content TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(full_text, ''))
    ) STORED,
    embedding       VECTOR(1536),                   -- OpenAI text-embedding-3-small
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cases_embedding ON legal_corpus.cases
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
CREATE INDEX idx_cases_fts ON legal_corpus.cases USING gin(tsvector_content);
CREATE INDEX idx_cases_gr ON legal_corpus.cases (gr_number);
CREATE INDEX idx_cases_date ON legal_corpus.cases (date_decided DESC);
CREATE INDEX idx_cases_court ON legal_corpus.cases (court);
CREATE INDEX idx_cases_ponente ON legal_corpus.cases (ponente);

CREATE TABLE legal_corpus.statutes (
    id              BIGSERIAL PRIMARY KEY,
    type            VARCHAR(20) NOT NULL,            -- RA, PD, EO, AO, BP, CA
    number          VARCHAR(50) NOT NULL,
    title           TEXT NOT NULL,
    date_enacted    DATE,
    date_effectivity DATE,
    full_text       TEXT NOT NULL,
    status          VARCHAR(20) DEFAULT 'active',    -- active, amended, repealed
    source_url      TEXT,
    tsvector_content TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(full_text, ''))
    ) STORED,
    embedding       VECTOR(1536),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(type, number)
);

CREATE INDEX idx_statutes_embedding ON legal_corpus.statutes
    USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_statutes_fts ON legal_corpus.statutes USING gin(tsvector_content);

CREATE TABLE legal_corpus.provisions (
    id              BIGSERIAL PRIMARY KEY,
    statute_id      BIGINT REFERENCES legal_corpus.statutes(id),
    article_number  VARCHAR(20),
    section_number  VARCHAR(20),
    text            TEXT NOT NULL,
    embedding       VECTOR(1536),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provisions_embedding ON legal_corpus.provisions
    USING hnsw (embedding vector_cosine_ops);

CREATE TABLE legal_corpus.citations (
    id              BIGSERIAL PRIMARY KEY,
    source_type     VARCHAR(10) NOT NULL,  -- case, statute
    source_id       BIGINT NOT NULL,
    target_type     VARCHAR(10) NOT NULL,
    target_id       BIGINT NOT NULL,
    citation_type   VARCHAR(20),           -- positive, negative, distinguished, cited
    context_excerpt TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citations_source ON legal_corpus.citations (source_type, source_id);
CREATE INDEX idx_citations_target ON legal_corpus.citations (target_type, target_id);

-- ============================================
-- NOTARIAL SCHEMA
-- ============================================
CREATE SCHEMA notarial;

CREATE TABLE notarial.registers (
    id              BIGSERIAL PRIMARY KEY,
    notary_id       BIGINT NOT NULL,        -- FK to users.accounts
    entry_number    INTEGER NOT NULL,
    page_number     INTEGER NOT NULL,
    date_time       TIMESTAMPTZ NOT NULL,
    notarial_act_type VARCHAR(50) NOT NULL,  -- acknowledgment, jurat, oath, copy_cert, signature_witnessing
    instrument_title TEXT NOT NULL,
    principal_name  TEXT NOT NULL,
    principal_address TEXT,
    identity_type   VARCHAR(50),             -- government_id, credible_witness
    identity_details TEXT,
    fee_charged     DECIMAL(10,2),
    location        TEXT,                    -- If not regular place of work
    location_type   VARCHAR(50),             -- office, hospital, detention, public_function
    remarks         TEXT,
    weekly_certified BOOLEAN DEFAULT FALSE,
    monthly_submitted BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(notary_id, entry_number)
);

CREATE TABLE notarial.commissions (
    id              BIGSERIAL PRIMARY KEY,
    notary_id       BIGINT NOT NULL,
    commission_number VARCHAR(100),
    jurisdiction    VARCHAR(200) NOT NULL,   -- City/Province of RTC
    executive_judge VARCHAR(200),
    issue_date      DATE NOT NULL,
    expiry_date     DATE NOT NULL,           -- Dec 31 of commission year + 1
    status          VARCHAR(20) DEFAULT 'active',  -- active, expired, revoked, resigned
    seal_approved   BOOLEAN DEFAULT FALSE,
    renewal_alert_sent BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS SCHEMA
-- ============================================
CREATE SCHEMA users;

CREATE TABLE users.accounts (
    id              BIGSERIAL PRIMARY KEY,
    clerk_id        VARCHAR(200) UNIQUE,     -- Clerk.dev user ID
    email           VARCHAR(255) UNIQUE NOT NULL,
    full_name       VARCHAR(200) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'citizen',  -- citizen, lawyer, notary, judge, admin
    bar_roll_number VARCHAR(50),             -- For lawyers
    ibp_number      VARCHAR(50),
    jurisdiction    VARCHAR(200),            -- For notaries
    phone           VARCHAR(20),
    subscription_tier VARCHAR(20) DEFAULT 'free',  -- free, student, professional, firm, enterprise
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Row-Level Security
ALTER TABLE users.accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE users.subscriptions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users.accounts(id),
    stripe_customer_id VARCHAR(200),
    stripe_subscription_id VARCHAR(200),
    plan            VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL,    -- active, past_due, canceled, trialing
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS SCHEMA
-- ============================================
CREATE SCHEMA analytics;

CREATE TABLE analytics.queries (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users.accounts(id),
    query_text      TEXT NOT NULL,
    response_summary TEXT,
    citations_used  JSONB,                   -- Array of {type, id, gr_number/statute_number}
    confidence_score DECIMAL(3,2),           -- 0.00 to 1.00
    latency_ms      INTEGER,
    cached          BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queries_user ON analytics.queries (user_id, created_at DESC);
```

### Neon Branching Strategy

| Branch | Purpose | Lifecycle |
|--------|---------|-----------|
| `main` | Production | Permanent |
| `staging` | Pre-release testing | Permanent, reset weekly |
| `dev/*` | Feature development | Created per feature, deleted on merge |
| `migration/*` | Test schema changes | Created before migration, deleted after verification |

### Connection Configuration

```typescript
// Use pooled connection for application queries
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,  // Pooled
    ssl: { rejectUnauthorized: false },
    max: 10,
});

// Use unpooled for migrations and schema changes
const migrationPool = new Pool({
    connectionString: process.env.DATABASE_URL_UNPOOLED,
    ssl: { rejectUnauthorized: false },
    max: 1,
});
```

## Security

### Data Protection

- **At rest**: Neon AES-256; Railway volume encryption
- **In transit**: TLS 1.3 everywhere (Netlify CDN → Railway → Neon)
- **Neon SSL**: `?sslmode=require` on all connection strings
- **Railway private networking**: Inter-service communication never hits public internet
- **Redis**: Internal-only access via Railway private network

### Authentication & Authorization

- **Clerk** handles auth: MFA, SSO, session management
- **RBAC roles**: citizen, lawyer, notary, judge, admin
- **API keys**: Per-user for programmatic access (rate-limited by tier)
- **JWT verification**: Every request validated at API Gateway

### Philippine DPA Compliance (RA 10173)

- NPC registration as Personal Information Controller (PIC)
- Privacy Impact Assessment (PIA) before launch
- Data Processing Agreements with all vendors (Netlify, Railway, Neon, Clerk, Stripe)
- 72-hour breach notification pipeline
- Data subject rights portal (access, correction, erasure, portability)
- NPC Advisory 2024-04: AI transparency labels, human oversight

## Cost Estimates

### Monthly Infrastructure

| Phase | Netlify | Railway | Neon | AI APIs | Total |
|-------|---------|---------|------|---------|-------|
| MVP (M1-6) | $0 | $20-50 | $0-19 | $50-100 | **$70-170** |
| Growth (M7-12) | $19 | $100-300 | $69 | $200-500 | **$388-888** |
| Scale (M13-24) | Custom | $500-1.5K | $350+ | $1K-3K | **$2K-5K** |

### Annual Operational Cost (Solo Builder, Year 1)

| Category | Amount (PHP) | Amount (USD) |
|----------|-------------|-------------|
| Cloud infrastructure | 120,000 | ~2,150 |
| AI API costs | 600,000 | ~10,700 |
| Legal consultant (retainer) | 240,000 | ~4,300 |
| Data/licensing | 600,000 | ~10,700 |
| Marketing (digital) | 360,000 | ~6,400 |
| Tools/subscriptions | 180,000 | ~3,200 |
| **Total** | **2,100,000** | **~37,500** |

Break-even: ~35-50 Professional subscribers at PHP 4,999/month.

## Deployment

All deployments are triggered by git push to GitHub:

1. **Frontend**: Push to `main` → Netlify auto-builds and deploys to CDN (< 60s)
2. **Backend**: Push to `main` → Railway auto-detects changes per service, builds and deploys
3. **Database**: Migrations run via CI/CD or manual `npx dbmate up`
4. **Preview environments**: PRs get Netlify deploy preview + Railway preview + Neon branch

No Terraform, no Kubernetes, no manual server management.
