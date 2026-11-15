# University Community & Academic Management App

A mobile app for university students: course timetable and enrollment, department forums,
a campus board, and course reviews. React Native on the front, a normalized PostgreSQL
schema underneath, Firebase for authentication.

**Stack** — TypeScript · React Native (Expo) · React Navigation · Firebase Auth · PostgreSQL

> **Status — paused.** Last worked on April 2026. The UI layer, design system, and database
> schema are complete; backend wiring for several screens is not. Kept public because the
> schema and query work stand on their own.

---

## What is here

### Database (PostgreSQL, ~530 lines of SQL)

The part of this project worth reading.

```
database/schema/01_users.sql        roles, departments, users
database/schema/02_scheduling.sql   courses, sections, enrollment, timetable
database/schema/03_forum.sql        forums, threads, posts, reactions
database/migrations/                initial schema migration
database/queries/                   analytical reporting queries
```

Design decisions:

- **Normalized to 3NF**, with every foreign key enforced at the database level rather than
  in application code
- **UUID primary keys** on user-facing tables (`gen_random_uuid()` via `pgcrypto`), serial
  keys on lookup tables where exposure does not matter
- **`TIMESTAMPTZ` everywhere**, never naive timestamps
- **Indexes on the columns actually queried** — e.g. `firebase_uid`, which every
  authenticated request resolves through
- **Soft deletes** on posts (`is_deleted`), so thread structure survives removal

`database/queries/engagement_metrics.sql` holds the reporting queries: forum engagement
per department, aggregating threads, posts, unique authors, and reactions across five
joins, with `NULLIF` guarding the division.

### Application (TypeScript, ~2,300 lines)

```
src/screens/      12 screens — auth, timetable, enrollment, board, forum, reviews
src/components/   reusable UI (Button, Card, Badge, Header) + feature components
src/services/     Firebase and database clients
src/hooks/        useAuth
src/navigation/   stack and bottom-tab navigators
src/theme/        colors, typography, spacing — a small design system
```

The theme directory is a deliberate choice: colors, typography, and spacing live in one
place and screens import from it, so visual changes do not require touching twelve files.

## Running it

```bash
cp .env.example .env     # fill in Firebase config and DB connection
npm install
npm run db:migrate       # applies database/migrations/001_initial_schema.sql
npm start                # Expo
```

`npm run lint` runs ESLint over `src/`.

## What is not finished

- Several screens render against local state rather than live queries
- No test suite
- Push notifications were scoped but not started

These are listed rather than hidden — the repository is a snapshot of a paused project,
not a shipped product.
