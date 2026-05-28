# Database structure (FitConnect)

PostgreSQL schema for the backend. Aligns with [TASKS.md](../TASKS.md), API specs in this folder, frontend types in [`src/mocks/data.ts`](../../src/mocks/data.ts), and design references in Figma.

**Visual ER tree:** [DB_SCHEMA_TREE.md](DB_SCHEMA_TREE.md) — Mermaid diagram + ASCII ownership tree.

**Figma (design copy):** [Fitness-app (Copy)](https://www.figma.com/design/nWHcYBqsCKqkBh5WUnghye/Fitness-app--Copy-) — file key `nWHcYBqsCKqkBh5WUnghye`. Individual frames map to flows in TASKS (Home, Schedule, Library, Clients, Chat, Stats/Analytics, Onboarding); node IDs in Figma are for designers/devs to open the exact screen, not separate DB tables.

---

## 1. What each product area needs in the DB

| Area (TASKS / Figma) | Primary tables | Notes |
|----------------------|----------------|-------|
| Auth & sessions (JWT, OAuth, SMS) | `users`, `refresh_tokens`, `oauth_identities` | TECH_DOC §2.1 |
| Onboarding & profile (ONB-*, HOME-003) | `users` (role, points, experience, certifications, JSON arrays, work schedule, avatar) | Single row per user; trainer fields nullable for clients |
| Home dashboard (HOME-*) | `users`, `programs`, `sessions`, `analytics_cache` or aggregates | Revenue/profile views from analytics |
| Schedule (SCHED-*, SFORM-*) | `sessions`, `session_participants`, `clients` | Search/filter by title/date |
| Training library (TLIB-*) | `programs`, `program_videos`, `program_exercises`, `exercises` | Views/likes can stay on `programs` |
| Clients (CLNT-*) | `clients`, `sessions`, `programs`, `client_programs`, `exercises` | `clients` = trainer’s roster; optional link to client app user |
| Chat (CHAT-*, BCHAT-*) | `conversations`, `messages`, `conversation_reads`, `users` | One conversation per trainer–client pair |
| Analytics & transactions (ANLY-*, ANLY-007–010) | `transactions`, `analytics_cache`, `profile_view_events` | Charts can be computed or cached |
| Gamification / milestones (ANLY-011 “You got paid”) | `achievements` | Optional v1+ |
| Push (TECH_DOC Firebase) | `push_tokens` | Optional |

---

## 2. Entity relationship (short)

```
users ──┬── sessions (trainer_id)
        ├── clients (trainer_id) ── session_participants ── sessions
        ├── programs ── program_videos / program_exercises ── exercises
        ├── client_programs (client ↔ program)
        ├── conversations ── messages
        ├── transactions
        └── refresh_tokens / oauth_identities / push_tokens / notifications
```

---

## 3. Tables

### 3.1 `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| email | VARCHAR(255) | UNIQUE | nullable if phone-only (future) |
| phone | VARCHAR(32) | UNIQUE | optional; SMS verification |
| password_hash | VARCHAR(255) | | nullable if OAuth-only |
| name | VARCHAR(255) | NOT NULL | |
| avatar_url | VARCHAR(512) | | |
| role | ENUM(`client`,`trainer`,`admin`) | NOT NULL | TECH_DOC: admin later |
| points | INTEGER | DEFAULT 0 | HOME-003 |
| experience | VARCHAR(255) | | trainer onboarding |
| certifications | JSONB | | `string[]` |
| training_types | JSONB | | e.g. HIIT, Cardio |
| client_types | JSONB | | Personal, Group |
| locations | JSONB | | where trainer works |
| work_schedule_start | TIME | | |
| work_schedule_end | TIME | | |
| work_schedule_days | JSONB | | e.g. `["mon","tue",...]` |
| onboarding_completed_at | TIMESTAMPTZ | | null until ONB complete |
| timezone | VARCHAR(64) | DEFAULT 'UTC' | |
| locale | VARCHAR(16) | | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**API:** [user.md](user.md)

---

### 3.2 `refresh_tokens` (AUTH)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, ON DELETE CASCADE |
| token_hash | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |

**Index:** `(user_id)`, `(expires_at)` for cleanup.

---

### 3.3 `oauth_identities` (AUTH)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, ON DELETE CASCADE |
| provider | VARCHAR(32) | NOT NULL | `google`, `apple`, `facebook` |
| provider_subject | VARCHAR(255) | NOT NULL | id from provider |
| created_at | TIMESTAMPTZ | NOT NULL |

**Unique:** `(provider, provider_subject)`.

---

### 3.4 `push_tokens` (optional)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, ON DELETE CASCADE |
| token | VARCHAR(512) | NOT NULL |
| platform | VARCHAR(16) | | `ios`, `android` |
| created_at | TIMESTAMPTZ | NOT NULL |

---

### 3.5 `clients` (trainer CRM roster)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| trainer_id | UUID | FK → users, NOT NULL | |
| client_user_id | UUID | FK → users, UNIQUE nullable | link when client has account |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | | optional |
| phone | VARCHAR(32) | | optional |
| avatar_url | VARCHAR(512) | | |
| tag | VARCHAR(50) | | Personal / Group |
| next_session_at | TIMESTAMPTZ | | denormalized for CLNT list; optional |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Index:** `(trainer_id)`, search on `(trainer_id, name)`.

**API:** [clients.md](clients.md)

---

### 3.6 `sessions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| trainer_id | UUID | FK → users, NOT NULL | |
| title | VARCHAR(255) | NOT NULL | |
| type | VARCHAR(50) | | Cardio, HIIT, … |
| date | DATE | NOT NULL | |
| time | TIME | NOT NULL | local to trainer/session |
| duration_minutes | INTEGER | | optional default e.g. 90 |
| status | ENUM(`pending`,`completed`,`canceled`) | DEFAULT `pending` | |
| payment_status | VARCHAR(32) | | optional: matches UI badge if needed |
| location_label | VARCHAR(255) | | optional |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Index:** `(trainer_id, date)`.

**API:** [sessions.md](sessions.md)

---

### 3.7 `session_participants`

| Column | Type | Constraints |
|--------|------|-------------|
| session_id | UUID | FK → sessions, PK, ON DELETE CASCADE |
| client_id | UUID | FK → clients, PK |
| created_at | TIMESTAMPTZ | NOT NULL |

---

### 3.8 `session_summaries` (optional)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| session_id | UUID | FK → sessions, UNIQUE |
| client_id | UUID | FK → clients |
| exercises | JSONB | `[{ id, name, sets, reps }]` |
| created_at | TIMESTAMPTZ | NOT NULL |

---

### 3.9 `programs`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| trainer_id | UUID | FK → users, NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| tag | VARCHAR(50) | | |
| thumbnail_url | VARCHAR(512) | | |
| video_count | INTEGER | DEFAULT 0 | denormalized |
| views | INTEGER | DEFAULT 0 | |
| likes | INTEGER | DEFAULT 0 | |
| price | VARCHAR(50) | | display string e.g. `$5/month` |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Index:** `(trainer_id)`.

**API:** [programs.md](programs.md)

---

### 3.10 `program_videos`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| program_id | UUID | FK → programs, ON DELETE CASCADE |
| title | VARCHAR(255) | NOT NULL |
| thumbnail_url | VARCHAR(512) | | |
| video_url | VARCHAR(1024) | | storage/CDN URL |
| duration_seconds | INTEGER | | |
| sort_order | INTEGER | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

---

### 3.11 `exercises`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | | |
| sets | INTEGER | | |
| reps | VARCHAR(50) | | |
| video_url | VARCHAR(512) | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

**API:** [clients.md](clients.md) exercise detail.

---

### 3.12 `program_exercises` (ordering within a program)

| Column | Type | Constraints |
|--------|------|-------------|
| program_id | UUID | FK → programs, PK |
| exercise_id | UUID | FK → exercises, PK |
| sort_order | INTEGER | NOT NULL |

---

### 3.13 `client_programs`

| Column | Type | Constraints |
|--------|------|-------------|
| client_id | UUID | FK → clients, PK |
| program_id | UUID | FK → programs, PK |
| assigned_at | TIMESTAMPTZ | NOT NULL | |

---

### 3.14 `conversations`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| trainer_id | UUID | FK → users, NOT NULL |
| client_id | UUID | FK → clients, NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Unique:** `(trainer_id, client_id)`.

**API:** [chat.md](chat.md)

---

### 3.15 `messages`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| conversation_id | UUID | FK → conversations, ON DELETE CASCADE | |
| sender_id | UUID | FK → users, NOT NULL | trainer or client user |
| text | TEXT | NOT NULL | |
| status | ENUM(`sent`,`delivered`,`read`) | DEFAULT `sent` | |
| created_at | TIMESTAMPTZ | NOT NULL | |

**Index:** `(conversation_id, created_at DESC)`.

---

### 3.16 `conversation_reads`

| Column | Type | Constraints |
|--------|------|-------------|
| conversation_id | UUID | FK → conversations, PK |
| user_id | UUID | FK → users, PK |
| last_read_at | TIMESTAMPTZ | NOT NULL | |

---

### 3.17 `transactions`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| trainer_id | UUID | FK → users, NOT NULL |
| client_id | UUID | FK → clients | nullable for non-client revenue |
| session_id | UUID | FK → sessions | nullable |
| amount_cents | INTEGER | NOT NULL |
| currency | VARCHAR(3) | DEFAULT `USD` |
| type | ENUM(`Training`,`Subscription`) | NOT NULL |
| status | ENUM(`pending`,`completed`,`canceled`) | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

**Index:** `(trainer_id, created_at DESC)`.

**API:** [transactions.md](transactions.md)

---

### 3.18 `analytics_cache` (optional)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| trainer_id | UUID | FK → users, NOT NULL |
| period | VARCHAR(20) | | `week`, `month` |
| period_start | DATE | NOT NULL |
| total_earnings_cents | INTEGER | | |
| from_subscriptions_cents | INTEGER | | |
| from_trainings_cents | INTEGER | | |
| income_over_time | JSONB | | chart payload |
| revenue_by_source | JSONB | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

---

### 3.19 `profile_view_events` (optional, HOME-005)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| trainer_id | UUID | FK → users, NOT NULL | whose profile was viewed |
| viewer_user_id | UUID | FK → users | nullable if anonymous |
| created_at | TIMESTAMPTZ | NOT NULL | |

**Index:** `(trainer_id, created_at)` for aggregations.

---

### 3.20 `achievements` (optional, ANLY-011)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| trainer_id | UUID | FK → users, NOT NULL |
| key | VARCHAR(64) | NOT NULL | e.g. `first_payout` |
| earned_at | TIMESTAMPTZ | NOT NULL | |

**Unique:** `(trainer_id, key)` if one badge per key.

---

### 3.21 `notifications` (optional, HOME-003 bell)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| type | VARCHAR(64) | NOT NULL | |
| payload | JSONB | | |
| read_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

---

## 4. Enums (PostgreSQL)

```sql
CREATE TYPE user_role AS ENUM ('client', 'trainer', 'admin');
CREATE TYPE session_status AS ENUM ('pending', 'completed', 'canceled');
CREATE TYPE transaction_type AS ENUM ('Training', 'Subscription');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'canceled');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
```

---

## 5. Indexes summary

| Table | Index | Purpose |
|-------|-------|---------|
| sessions | `(trainer_id, date)` | Schedule |
| clients | `(trainer_id)` | Roster |
| programs | `(trainer_id)` | Library |
| messages | `(conversation_id, created_at DESC)` | Thread pagination |
| transactions | `(trainer_id, created_at DESC)` | Lists |
| conversations | UNIQUE `(trainer_id, client_id)` | One thread per pair |
| refresh_tokens | `(user_id)` | Session invalidation |

---

## 6. Migration order (suggested)

1. `users`
2. `refresh_tokens`, `oauth_identities`
3. `clients`
4. `sessions`, `session_participants`, `session_summaries`
5. `programs`, `program_videos`, `exercises`, `program_exercises`, `client_programs`
6. `conversations`, `messages`, `conversation_reads`
7. `transactions`
8. `analytics_cache`, `profile_view_events`, `achievements`, `notifications`, `push_tokens` (as needed)

---

## 7. Future (TECH_DOC) — not required for first API slice

- Stripe: `stripe_customer_id` on `users`, payment intents table
- Subscriptions billing separate from one-off `transactions`
- Calendar sync: `calendar_connections` table
- Matching algorithm: extra tables for preferences/budget
- Admin moderation: `admin` role + audit tables

See [TASKS.md](../TASKS.md) TECH_DOC alignment and TODO rows.

---

## Appendix: Figma node references (same file)

**File:** [Fitness-app (Copy)](https://www.figma.com/design/nWHcYBqsCKqkBh5WUnghye/Fitness-app--Copy-) (`nWHcYBqsCKqkBh5WUnghye`)

Node IDs passed to Dev Mode (`node-id=` in URL; in Figma API tools use `2003-10171` → `2003:10171`):  
`2003-10171`, `2003-10172`, `2003-12282`, `2003-12340`, `2003-15495`, `2003-12299`, `2003-15487`, `2003-15467`, `2003-15400`, `2003-12327`, `2003-12213`, `2003-15393`, `2003-15480`, `2003-13106`, `2003-14782`, `2003-10757`, `2003-10170`, `2003-16056`, `2003-16286`, `2003-16164`, `2003-14780`, `2003-15970`, `2003-12973`, `2003-12978`, `2003-15844`, `2003-13110`, `2003-12343`, `2003-12209`, `2003-10903`.

Example link: `?node-id=2003-10171&m=dev` — some nodes are full screens, others symbols/components; data model above is organized by **product domain**, not by Figma node.
