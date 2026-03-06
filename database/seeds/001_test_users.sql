-- Seed data: Test users for development
-- clerk_id values are placeholders — replace with real Clerk user IDs after sign-up.
INSERT INTO users.accounts (clerk_id, email, full_name, role, subscription_tier) VALUES
    ('user_test_admin_001', 'admin@bayanihan.io', 'Jun Admin', 'admin', 'enterprise'),
    ('user_test_lawyer_001', 'lawyer@test.bayanihan.io', 'Maria Santos', 'lawyer', 'professional'),
    ('user_test_notary_001', 'notary@test.bayanihan.io', 'Pedro Cruz', 'notary', 'professional'),
    ('user_test_citizen_001', 'citizen@test.bayanihan.io', 'Ana Reyes', 'citizen', 'free'),
    ('user_test_student_001', 'student@test.bayanihan.io', 'Carlos Mendoza', 'citizen', 'student')
ON CONFLICT (email) DO NOTHING;
