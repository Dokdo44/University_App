-- ============================================================
-- University App · Scheduling Module
-- Covers: courses, sections, rooms, enrollments, events
-- ============================================================

-- ----------------------------------------------------------
-- Academic terms (semesters / quarters)
-- ----------------------------------------------------------
CREATE TABLE terms (
    term_id    SERIAL       PRIMARY KEY,
    name       VARCHAR(50)  NOT NULL UNIQUE,  -- 'Fall 2025', 'Spring 2026'
    start_date DATE         NOT NULL,
    end_date   DATE         NOT NULL,
    is_active  BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_term_dates CHECK (end_date > start_date)
);

-- ----------------------------------------------------------
-- Buildings & rooms
-- ----------------------------------------------------------
CREATE TABLE buildings (
    building_id  SERIAL      PRIMARY KEY,
    code         VARCHAR(10) NOT NULL UNIQUE,
    name         VARCHAR(100) NOT NULL,
    address      TEXT
);

CREATE TABLE rooms (
    room_id      SERIAL      PRIMARY KEY,
    building_id  INT         NOT NULL REFERENCES buildings(building_id),
    number       VARCHAR(20) NOT NULL,
    capacity     SMALLINT    NOT NULL CHECK (capacity > 0),
    has_projector BOOLEAN    NOT NULL DEFAULT FALSE,
    UNIQUE (building_id, number)
);

-- ----------------------------------------------------------
-- Course catalogue (independent of term)
-- ----------------------------------------------------------
CREATE TABLE courses (
    course_id   SERIAL        PRIMARY KEY,
    dept_id     INT           NOT NULL REFERENCES departments(dept_id),
    code        VARCHAR(15)   NOT NULL,           -- 'CS 301'
    title       VARCHAR(200)  NOT NULL,
    credits     SMALLINT      NOT NULL CHECK (credits BETWEEN 1 AND 6),
    description TEXT,
    UNIQUE (dept_id, code)
);

CREATE INDEX idx_courses_dept ON courses(dept_id);

-- ----------------------------------------------------------
-- Course prerequisites (self-referencing many-to-many)
-- ----------------------------------------------------------
CREATE TABLE course_prerequisites (
    course_id    INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    prereq_id    INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, prereq_id),
    CONSTRAINT chk_no_self_prereq CHECK (course_id <> prereq_id)
);

-- ----------------------------------------------------------
-- Course sections (a course offered in a specific term)
-- ----------------------------------------------------------
CREATE TABLE course_sections (
    section_id   SERIAL       PRIMARY KEY,
    course_id    INT          NOT NULL REFERENCES courses(course_id),
    term_id      INT          NOT NULL REFERENCES terms(term_id),
    instructor_id UUID        NOT NULL REFERENCES users(user_id),
    section_code VARCHAR(5)   NOT NULL,           -- '001', 'H01'
    max_capacity SMALLINT     NOT NULL CHECK (max_capacity > 0),
    is_online    BOOLEAN      NOT NULL DEFAULT FALSE,
    syllabus_url TEXT,
    UNIQUE (course_id, term_id, section_code)
);

CREATE INDEX idx_sections_course  ON course_sections(course_id);
CREATE INDEX idx_sections_term    ON course_sections(term_id);
CREATE INDEX idx_sections_instr   ON course_sections(instructor_id);

-- ----------------------------------------------------------
-- Weekly schedule for each section
-- (one row per day/time slot; sections can meet multiple times)
-- ----------------------------------------------------------
CREATE TABLE section_schedules (
    schedule_id  SERIAL    PRIMARY KEY,
    section_id   INT       NOT NULL REFERENCES course_sections(section_id) ON DELETE CASCADE,
    room_id      INT       REFERENCES rooms(room_id),
    day_of_week  SMALLINT  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sun … 6=Sat
    start_time   TIME      NOT NULL,
    end_time     TIME      NOT NULL,
    CONSTRAINT chk_schedule_times CHECK (end_time > start_time)
);

CREATE INDEX idx_sec_sched_section ON section_schedules(section_id);
CREATE INDEX idx_sec_sched_room    ON section_schedules(room_id);

-- ----------------------------------------------------------
-- Student enrollments
-- ----------------------------------------------------------
CREATE TYPE enrollment_status AS ENUM ('enrolled', 'waitlisted', 'dropped', 'completed');

CREATE TABLE enrollments (
    enrollment_id SERIAL            PRIMARY KEY,
    student_id    UUID              NOT NULL REFERENCES users(user_id),
    section_id    INT               NOT NULL REFERENCES course_sections(section_id),
    status        enrollment_status NOT NULL DEFAULT 'enrolled',
    grade         VARCHAR(5),
    enrolled_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, section_id)
);

CREATE INDEX idx_enroll_student ON enrollments(student_id);
CREATE INDEX idx_enroll_section ON enrollments(section_id);
CREATE INDEX idx_enroll_status  ON enrollments(status);

CREATE TRIGGER trg_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------
-- Campus events (lectures, workshops, social events …)
-- ----------------------------------------------------------
CREATE TABLE events (
    event_id     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID         NOT NULL REFERENCES users(user_id),
    room_id      INT          REFERENCES rooms(room_id),
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    starts_at    TIMESTAMPTZ  NOT NULL,
    ends_at      TIMESTAMPTZ  NOT NULL,
    max_rsvp     SMALLINT,
    is_public    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_times CHECK (ends_at > starts_at)
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_starts_at ON events(starts_at);

-- ----------------------------------------------------------
-- Event RSVPs
-- ----------------------------------------------------------
CREATE TYPE rsvp_status AS ENUM ('going', 'maybe', 'not_going');

CREATE TABLE event_rsvps (
    rsvp_id    SERIAL       PRIMARY KEY,
    event_id   UUID         NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    user_id    UUID         NOT NULL REFERENCES users(user_id),
    status     rsvp_status  NOT NULL DEFAULT 'going',
    rsvp_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

CREATE INDEX idx_rsvp_event ON event_rsvps(event_id);
CREATE INDEX idx_rsvp_user  ON event_rsvps(user_id);
