-- Add RLS policies for users.accounts and add missing cases tables
-- Run: npx dbmate up

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Users can read their own account
CREATE POLICY users_select_own ON users.accounts
    FOR SELECT
    USING (clerk_id = current_setting('app.current_user_clerk_id', true));

-- Users can update their own account
CREATE POLICY users_update_own ON users.accounts
    FOR UPDATE
    USING (clerk_id = current_setting('app.current_user_clerk_id', true));

-- Admins can read all accounts
CREATE POLICY users_admin_select ON users.accounts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users.accounts a
            WHERE a.clerk_id = current_setting('app.current_user_clerk_id', true)
            AND a.role = 'admin'
        )
    );

-- Service role bypasses RLS (for backend services)
CREATE POLICY users_service_all ON users.accounts
    FOR ALL
    USING (current_setting('app.service_role', true) = 'true');

-- ============================================
-- CASES: HEARINGS TABLE
-- ============================================
CREATE TABLE cases.hearings (
    id              BIGSERIAL PRIMARY KEY,
    matter_id       BIGINT REFERENCES cases.matters(id) ON DELETE CASCADE,
    hearing_date    TIMESTAMPTZ NOT NULL,
    court           VARCHAR(100),
    branch          VARCHAR(50),
    judge           VARCHAR(200),
    purpose         TEXT,
    notes           TEXT,
    status          VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, postponed, cancelled
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hearings_matter ON cases.hearings (matter_id);
CREATE INDEX idx_hearings_date ON cases.hearings (hearing_date);

CREATE TRIGGER update_hearings_updated_at BEFORE UPDATE ON cases.hearings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CASES: DEADLINES TABLE
-- ============================================
CREATE TABLE cases.deadlines (
    id              BIGSERIAL PRIMARY KEY,
    matter_id       BIGINT REFERENCES cases.matters(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    due_date        TIMESTAMPTZ NOT NULL,
    description     TEXT,
    priority        VARCHAR(10) DEFAULT 'normal', -- low, normal, high, urgent
    status          VARCHAR(20) DEFAULT 'pending', -- pending, completed, overdue
    reminder_sent   BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deadlines_matter ON cases.deadlines (matter_id);
CREATE INDEX idx_deadlines_due ON cases.deadlines (due_date);
CREATE INDEX idx_deadlines_status ON cases.deadlines (status) WHERE status != 'completed';

CREATE TRIGGER update_deadlines_updated_at BEFORE UPDATE ON cases.deadlines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
