-- ============================================================
-- University App · Forum / Community Module
-- ============================================================

-- ----------------------------------------------------------
-- Top-level forum categories (e.g. "Computer Science", "General")
-- ----------------------------------------------------------
CREATE TABLE forums (
    forum_id    SERIAL        PRIMARY KEY,
    dept_id     INT           REFERENCES departments(dept_id),  -- NULL = university-wide
    name        VARCHAR(100)  NOT NULL,
    description TEXT,
    is_archived BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_forums_dept ON forums(dept_id);

-- ----------------------------------------------------------
-- Threads (discussions within a forum)
-- ----------------------------------------------------------
CREATE TABLE threads (
    thread_id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id     INT          NOT NULL REFERENCES forums(forum_id),
    author_id    UUID         NOT NULL REFERENCES users(user_id),
    title        VARCHAR(300) NOT NULL,
    is_pinned    BOOLEAN      NOT NULL DEFAULT FALSE,
    is_locked    BOOLEAN      NOT NULL DEFAULT FALSE,
    view_count   INT          NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_threads_forum     ON threads(forum_id);
CREATE INDEX idx_threads_author    ON threads(author_id);
CREATE INDEX idx_threads_created   ON threads(created_at DESC);

CREATE TRIGGER trg_threads_updated_at
    BEFORE UPDATE ON threads
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------
-- Tags (reusable across threads)
-- ----------------------------------------------------------
CREATE TABLE tags (
    tag_id  SERIAL      PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE thread_tags (
    thread_id UUID NOT NULL REFERENCES threads(thread_id) ON DELETE CASCADE,
    tag_id    INT  NOT NULL REFERENCES tags(tag_id)       ON DELETE CASCADE,
    PRIMARY KEY (thread_id, tag_id)
);

CREATE INDEX idx_thread_tags_tag ON thread_tags(tag_id);

-- ----------------------------------------------------------
-- Posts (messages within a thread; supports nested replies)
-- ----------------------------------------------------------
CREATE TABLE posts (
    post_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id   UUID        NOT NULL REFERENCES threads(thread_id) ON DELETE CASCADE,
    author_id   UUID        NOT NULL REFERENCES users(user_id),
    parent_id   UUID        REFERENCES posts(post_id),   -- NULL = top-level reply
    body        TEXT        NOT NULL,
    is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_thread    ON posts(thread_id);
CREATE INDEX idx_posts_author    ON posts(author_id);
CREATE INDEX idx_posts_parent    ON posts(parent_id);
CREATE INDEX idx_posts_created   ON posts(created_at DESC);

CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------
-- Reactions (likes, helpful, etc.) on posts
-- ----------------------------------------------------------
CREATE TABLE reaction_types (
    reaction_type_id SERIAL      PRIMARY KEY,
    name             VARCHAR(30) NOT NULL UNIQUE,  -- 'like', 'helpful', 'insightful'
    emoji            VARCHAR(10) NOT NULL
);

CREATE TABLE post_reactions (
    reaction_id      SERIAL    PRIMARY KEY,
    post_id          UUID      NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    user_id          UUID      NOT NULL REFERENCES users(user_id),
    reaction_type_id INT       NOT NULL REFERENCES reaction_types(reaction_type_id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (post_id, user_id, reaction_type_id)
);

CREATE INDEX idx_reactions_post ON post_reactions(post_id);
CREATE INDEX idx_reactions_user ON post_reactions(user_id);

-- ----------------------------------------------------------
-- Announcements (faculty/admin broadcast to a section or forum)
-- ----------------------------------------------------------
CREATE TABLE announcements (
    announcement_id UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id       UUID         NOT NULL REFERENCES users(user_id),
    section_id      INT          REFERENCES course_sections(section_id),
    forum_id        INT          REFERENCES forums(forum_id),
    title           VARCHAR(200) NOT NULL,
    body            TEXT         NOT NULL,
    published_at    TIMESTAMPTZ,                            -- NULL = draft
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_announcement_target
        CHECK (section_id IS NOT NULL OR forum_id IS NOT NULL)
);

CREATE INDEX idx_announce_section ON announcements(section_id);
CREATE INDEX idx_announce_forum   ON announcements(forum_id);
