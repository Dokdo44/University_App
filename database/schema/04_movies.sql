-- ============================================================
-- 04_movies.sql  –  커플 영화 기록장 스키마
-- ============================================================

-- ── couple_spaces ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS couple_spaces (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id     TEXT        NOT NULL,                  -- Firebase UID
  user2_id     TEXT,                                  -- NULL until partner joins
  user1_name   VARCHAR(50) NOT NULL,
  user2_name   VARCHAR(50),
  invite_code  CHAR(6)     NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_couple_spaces_invite ON couple_spaces (invite_code);
CREATE INDEX IF NOT EXISTS idx_couple_spaces_user1  ON couple_spaces (user1_id);
CREATE INDEX IF NOT EXISTS idx_couple_spaces_user2  ON couple_spaces (user2_id);

-- ── users_meta ───────────────────────────────────────────────
-- Lightweight per-user metadata (complements Firebase Auth)
CREATE TABLE IF NOT EXISTS users_meta (
  user_id         TEXT        PRIMARY KEY,             -- Firebase UID
  display_name    VARCHAR(50) NOT NULL,
  couple_space_id UUID        REFERENCES couple_spaces (id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── movie_status enum ─────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE movie_status AS ENUM ('want_to_watch', 'watched', 'rewatch');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── movies ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS movies (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id UUID         NOT NULL REFERENCES couple_spaces (id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  poster_url      TEXT,
  status          movie_status NOT NULL DEFAULT 'want_to_watch',
  watched_at      DATE,
  platform        VARCHAR(50),
  genres          TEXT[]       NOT NULL DEFAULT '{}',
  rating_user1    SMALLINT     CHECK (rating_user1 BETWEEN 1 AND 5),
  rating_user2    SMALLINT     CHECK (rating_user2 BETWEEN 1 AND 5),
  comment_user1   TEXT,
  comment_user2   TEXT,
  year            CHAR(4),
  director        VARCHAR(100),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movies_couple_space ON movies (couple_space_id);
CREATE INDEX IF NOT EXISTS idx_movies_status       ON movies (couple_space_id, status);
CREATE INDEX IF NOT EXISTS idx_movies_watched_at   ON movies (couple_space_id, watched_at DESC)
  WHERE watched_at IS NOT NULL;

-- ── auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$ BEGIN
  CREATE TRIGGER movies_updated_at
    BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER users_meta_updated_at
    BEFORE UPDATE ON users_meta
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── useful views ──────────────────────────────────────────────

-- Couple movie summary per space
CREATE OR REPLACE VIEW couple_movie_stats AS
SELECT
  cs.id                                          AS couple_space_id,
  cs.user1_name,
  cs.user2_name,
  COUNT(*)                                       AS total_movies,
  COUNT(*) FILTER (WHERE m.status != 'want_to_watch') AS watched_count,
  COUNT(*) FILTER (WHERE m.status = 'want_to_watch')  AS want_to_watch_count,
  ROUND(AVG(m.rating_user1) FILTER (WHERE m.rating_user1 IS NOT NULL), 2) AS avg_rating_user1,
  ROUND(AVG(m.rating_user2) FILTER (WHERE m.rating_user2 IS NOT NULL), 2) AS avg_rating_user2,
  MAX(m.watched_at)                              AS last_watched_at
FROM couple_spaces cs
LEFT JOIN movies m ON m.couple_space_id = cs.id
GROUP BY cs.id, cs.user1_name, cs.user2_name;
