-- Bayanihan.AI Initial Schema
-- Neon PostgreSQL with pgvector
-- Run: npx dbmate up

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- LEGAL CORPUS SCHEMA
-- ============================================
CREATE SCHEMA IF NOT EXISTS legal_corpus;

CREATE TABLE legal_corpus.cases (
    id              BIGSERIAL PRIMARY KEY,
    gr_number       VARCHAR(50) UNIQUE NOT NULL,
    title           TEXT NOT NULL,
    date_decided    DATE NOT NULL,
    court           VARCHAR(50) NOT NULL,
    division        VARCHAR(50),
    ponente         VARCHAR(200),
    full_text       TEXT NOT NULL,
    digest          TEXT,
    dispositive     TEXT,
    case_type       VARCHAR(50),
    source_url      TEXT,
    tsvector_content TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(full_text, ''))
    ) STORED,
    embedding       VECTOR(1536),
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
    type            VARCHAR(20) NOT NULL,
    number          VARCHAR(50) NOT NULL,
    title           TEXT NOT NULL,
    date_enacted    DATE,
    date_effectivity DATE,
    full_text       TEXT NOT NULL,
    status          VARCHAR(20) DEFAULT 'active',
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
    source_type     VARCHAR(10) NOT NULL,
    source_id       BIGINT NOT NULL,
    target_type     VARCHAR(10) NOT NULL,
    target_id       BIGINT NOT NULL,
    citation_type   VARCHAR(20),
    context_excerpt TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citations_source ON legal_corpus.citations (source_type, source_id);
CREATE INDEX idx_citations_target ON legal_corpus.citations (target_type, target_id);

-- ============================================
-- NOTARIAL SCHEMA
-- ============================================
CREATE SCHEMA IF NOT EXISTS notarial;

CREATE TABLE notarial.registers (
    id              BIGSERIAL PRIMARY KEY,
    notary_id       BIGINT NOT NULL,
    entry_number    INTEGER NOT NULL,
    page_number     INTEGER NOT NULL,
    date_time       TIMESTAMPTZ NOT NULL,
    notarial_act_type VARCHAR(50) NOT NULL,
    instrument_title TEXT NOT NULL,
    principal_name  TEXT NOT NULL,
    principal_address TEXT,
    identity_type   VARCHAR(50),
    identity_details TEXT,
    fee_charged     DECIMAL(10,2),
    location        TEXT,
    location_type   VARCHAR(50),
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
    jurisdiction    VARCHAR(200) NOT NULL,
    executive_judge VARCHAR(200),
    issue_date      DATE NOT NULL,
    expiry_date     DATE NOT NULL,
    status          VARCHAR(20) DEFAULT 'active',
    seal_approved   BOOLEAN DEFAULT FALSE,
    renewal_alert_sent BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS SCHEMA
-- ============================================
CREATE SCHEMA IF NOT EXISTS users;

CREATE TABLE users.accounts (
    id              BIGSERIAL PRIMARY KEY,
    clerk_id        VARCHAR(200) UNIQUE,
    email           VARCHAR(255) UNIQUE NOT NULL,
    full_name       VARCHAR(200) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'citizen',
    bar_roll_number VARCHAR(50),
    ibp_number      VARCHAR(50),
    jurisdiction    VARCHAR(200),
    phone           VARCHAR(20),
    subscription_tier VARCHAR(20) DEFAULT 'free',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users.accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE users.subscriptions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users.accounts(id),
    stripe_customer_id VARCHAR(200),
    stripe_subscription_id VARCHAR(200),
    plan            VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK constraints for notarial tables
ALTER TABLE notarial.registers
    ADD CONSTRAINT fk_registers_notary
    FOREIGN KEY (notary_id) REFERENCES users.accounts(id);

ALTER TABLE notarial.commissions
    ADD CONSTRAINT fk_commissions_notary
    FOREIGN KEY (notary_id) REFERENCES users.accounts(id);

-- ============================================
-- CASES (CASE MANAGEMENT) SCHEMA
-- ============================================
CREATE SCHEMA IF NOT EXISTS cases;

CREATE TABLE cases.matters (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users.accounts(id),
    title           TEXT NOT NULL,
    case_number     VARCHAR(100),
    court           VARCHAR(100),
    case_type       VARCHAR(50),
    status          VARCHAR(20) DEFAULT 'active',
    opposing_party  TEXT,
    notes           TEXT,
    next_hearing    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS SCHEMA
-- ============================================
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE analytics.queries (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users.accounts(id),
    query_text      TEXT NOT NULL,
    response_summary TEXT,
    citations_used  JSONB,
    confidence_score DECIMAL(3,2),
    latency_ms      INTEGER,
    cached          BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queries_user ON analytics.queries (user_id, created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON legal_corpus.cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statutes_updated_at BEFORE UPDATE ON legal_corpus.statutes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON users.accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matters_updated_at BEFORE UPDATE ON cases.matters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
