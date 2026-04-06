-- ============================================================
-- University App · Users & Roles
-- Normalized to 3NF; all FKs enforced at DB level
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- ----------------------------------------------------------
-- Lookup / enum-style tables
-- ----------------------------------------------------------
CREATE TABLE roles (
    role_id   SERIAL       PRIMARY KEY,
    name      VARCHAR(50)  NOT NULL UNIQUE,   -- 'student','faculty','staff','admin'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE departments (
    dept_id    SERIAL       PRIMARY KEY,
    code       VARCHAR(10)  NOT NULL UNIQUE,  -- 'CS', 'MATH', …
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- Core user table
-- ----------------------------------------------------------
CREATE TABLE users (
    user_id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid   VARCHAR(128) NOT NULL UNIQUE,   -- Firebase Auth UID
    email          VARCHAR(255) NOT NULL UNIQUE,
    display_name   VARCHAR(150) NOT NULL,
    avatar_url     TEXT,
    role_id        INT          NOT NULL REFERENCES roles(role_id),
    dept_id        INT          REFERENCES departments(dept_id),
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_role         ON users(role_id);
CREATE INDEX idx_users_dept         ON users(dept_id);

-- ----------------------------------------------------------
-- Student-specific profile (1:1 with users where role=student)
-- ----------------------------------------------------------
CREATE TABLE student_profiles (
    user_id          UUID         PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    student_number   VARCHAR(20)  NOT NULL UNIQUE,
    enrollment_year  SMALLINT     NOT NULL,
    expected_grad    SMALLINT,
    gpa              NUMERIC(4,3) CHECK (gpa BETWEEN 0 AND 4.0)
);

-- ----------------------------------------------------------
-- Faculty-specific profile
-- ----------------------------------------------------------
CREATE TABLE faculty_profiles (
    user_id    UUID        PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    title      VARCHAR(50),           -- 'Professor', 'Lecturer', …
    office     VARCHAR(50),
    bio        TEXT
);

-- ----------------------------------------------------------
-- Trigger: keep updated_at current
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
