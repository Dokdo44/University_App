-- ============================================================
-- Migration 001 · Initial schema setup
-- Run order matters: users → scheduling → forum
-- ============================================================
-- Usage:
--   psql -U <user> -d university_app -f 001_initial_schema.sql

BEGIN;

\ir ../schema/01_users.sql
\ir ../schema/02_scheduling.sql
\ir ../schema/03_forum.sql

-- Seed lookup data
INSERT INTO roles (name) VALUES
    ('student'), ('faculty'), ('staff'), ('admin')
ON CONFLICT (name) DO NOTHING;

INSERT INTO reaction_types (name, emoji) VALUES
    ('like',       '👍'),
    ('helpful',    '💡'),
    ('insightful', '🔍')
ON CONFLICT (name) DO NOTHING;

COMMIT;
