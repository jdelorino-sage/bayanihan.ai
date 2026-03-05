-- Seed data: Test users for development
INSERT INTO users.accounts (email, full_name, role, subscription_tier) VALUES
    ('admin@bayanihan.io', 'Jun Admin', 'admin', 'enterprise'),
    ('lawyer@test.bayanihan.io', 'Maria Santos', 'lawyer', 'professional'),
    ('notary@test.bayanihan.io', 'Pedro Cruz', 'notary', 'professional'),
    ('citizen@test.bayanihan.io', 'Ana Reyes', 'citizen', 'free'),
    ('student@test.bayanihan.io', 'Carlos Mendoza', 'citizen', 'student')
ON CONFLICT (email) DO NOTHING;
