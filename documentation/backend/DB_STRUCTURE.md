# Database Structure

Database schema for FitConnect backend implementation. Use **PostgreSQL** (per [TECH_DOC.md](../TECH_DOC.md)).

---

## Entity Relationship Overview

```
users ──┬── sessions (trainer_id)
        ├── clients (trainer_id)
        ├── programs (trainer_id)
        ├── conversations (participants)
        └── transactions (trainer_id)

sessions ── session_participants ── clients
programs ── program_videos
programs ── client_programs (assignment)
conversations ── messages
```

---

## Tables

### 1. users

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| password_hash | VARCHAR(255) | | nullable for OAuth |
| name | VARCHAR(255) | NOT NULL | |
| avatar_url | VARCHAR(512) | | |
| role | ENUM('client','trainer') | NOT NULL | |
| points | INTEGER | DEFAULT 0 | gamification |
| experience | VARCHAR(255) | | e.g. "5 years" |
| certifications | JSONB | | array of strings |
| training_types | JSONB | | array: HIIT, Cardio, etc. |
| client_types | JSONB | | array: Personal, Group |
| locations | JSONB | | array of strings |
| work_schedule_start | TIME | | e.g. 09:00 |
| work_schedule_end | TIME | | e.g. 18:00 |
| work_schedule_days | JSONB | | array: mon, tue, ... |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**API:** `user.md`, `GET/PATCH /user/profile`, `POST /user/avatar`

---

### 2. clients

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| trainer_id | UUID | FK → users, NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| avatar_url | VARCHAR(512) | | |
| tag | VARCHAR(50) | | Personal, Group |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**API:** `clients.md`, `GET/POST/PATCH/DELETE /clients`

**Index:** `trainer_id` for list by trainer

---

### 3. sessions

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| trainer_id | UUID | FK → users, NOT NULL | |
| title | VARCHAR(255) | NOT NULL | |
| type | VARCHAR(50) | | Cardio, HIIT, Strength, etc. |
| date | DATE | NOT NULL | |
| time | TIME | NOT NULL | |
| status | ENUM('pending','completed','canceled') | | DEFAULT 'pending' |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**API:** `sessions.md`, `GET/POST/PATCH/DELETE /sessions`

**Index:** `(trainer_id, date)` for schedule queries

---

### 4. session_participants

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| session_id | UUID | FK → sessions, PK | |
| client_id | UUID | FK → clients, PK | |
| created_at | TIMESTAMPTZ | NOT NULL | |

**API:** `sessions.md` — participants array in session response

---

### 5. session_summaries (optional)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| session_id | UUID | FK → sessions, UNIQUE | |
| client_id | UUID | FK → clients | |
| exercises | JSONB | | [{id, name, sets, reps}] |
| created_at | TIMESTAMPTZ | NOT NULL | |

**API:** `sessions.md`, `GET /sessions/:id/summary`

---

### 6. programs

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| trainer_id | UUID | FK → users, NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| tag | VARCHAR(50) | | HIIT, Cardio, etc. |
| thumbnail_url | VARCHAR(512) | | |
| video_count | INTEGER | DEFAULT 0 | denormalized |
| views | INTEGER | DEFAULT 0 | |
| likes | INTEGER | DEFAULT 0 | |
| price | VARCHAR(50) | | e.g. "$5/month" |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**API:** `programs.md`, `GET/POST/PATCH/DELETE /programs`

**Index:** `trainer_id` for list by trainer

---

### 7. program_videos

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| program_id | UUID | FK → programs, NOT NULL | |
| title | VARCHAR(255) | NOT NULL | |
| thumbnail_url | VARCHAR(512) | | |
| duration | INTEGER | | seconds |
| sort_order | INTEGER | | for ordering |
| created_at | TIMESTAMPTZ | NOT NULL | |

**API:** `programs.md`, `GET /programs/:id/videos`

---

### 8. client_programs (client assignments)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| client_id | UUID | FK → clients, PK | |
| program_id | UUID | FK → programs, PK | |
| assigned_at | TIMESTAMPTZ | NOT NULL | |

**API:** `clients.md`, `GET /clients/:id/programs`

---

### 9. exercises

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| sets | INTEGER | | |
| reps | VARCHAR(50) | | e.g. "12" or "AMRAP" |
| video_url | VARCHAR(512) | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

**API:** `clients.md`, `GET /exercises/:id`

---

### 10. conversations

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| trainer_id | UUID | FK → users, NOT NULL | |
| client_id | UUID | FK → clients, NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Unique:** `(trainer_id, client_id)` — one conversation per trainer–client pair

**API:** `chat.md`, `GET/POST /conversations`

---

### 11. messages

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| conversation_id | UUID | FK → conversations, NOT NULL | |
| sender_id | UUID | FK → users, NOT NULL | |
| text | TEXT | NOT NULL | |
| status | ENUM('sent','delivered','read') | | DEFAULT 'sent' |
| created_at | TIMESTAMPTZ | NOT NULL | |

**API:** `chat.md`, `GET/POST /conversations/:id/messages`

**Index:** `(conversation_id, created_at DESC)` for pagination

---

### 12. conversation_reads (unread tracking)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| conversation_id | UUID | FK → conversations, PK | |
| user_id | UUID | FK → users, PK | |
| last_read_at | TIMESTAMPTZ | NOT NULL | |

**API:** `chat.md`, `PATCH /conversations/:id/read`, unread count

---

### 13. transactions

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| trainer_id | UUID | FK → users, NOT NULL | |
| client_id | UUID | FK → clients | |
| session_id | UUID | FK → sessions | |
| amount_cents | INTEGER | NOT NULL | store as cents |
| currency | VARCHAR(3) | DEFAULT 'USD' | |
| type | ENUM('Training','Subscription') | NOT NULL | |
| status | ENUM('pending','completed','canceled') | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

**API:** `transactions.md`, `GET /transactions`

**Index:** `(trainer_id, created_at DESC)` for list

---

### 14. analytics_cache (optional)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| trainer_id | UUID | FK → users, NOT NULL | |
| period | VARCHAR(20) | | week, month |
| period_start | DATE | NOT NULL | |
| total_earnings | INTEGER | | cents |
| from_subscriptions | INTEGER | | |
| from_trainings | INTEGER | | |
| income_over_time | JSONB | | |
| revenue_by_source | JSONB | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

**API:** `analytics.md` — can be computed on-the-fly or cached

---

## Enums (PostgreSQL)

```sql
CREATE TYPE user_role AS ENUM ('client', 'trainer');
CREATE TYPE session_status AS ENUM ('pending', 'completed', 'canceled');
CREATE TYPE transaction_type AS ENUM ('Training', 'Subscription');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'canceled');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
```

---

## Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| sessions | (trainer_id, date) | Schedule list |
| clients | (trainer_id) | List by trainer |
| programs | (trainer_id) | List by trainer |
| messages | (conversation_id, created_at DESC) | Pagination |
| transactions | (trainer_id, created_at DESC) | List by trainer |
| conversations | (trainer_id, client_id) UNIQUE | One per pair |

---

## Migration Order

1. users
2. clients
3. sessions, session_participants
4. programs, program_videos
5. client_programs
6. exercises
7. conversations, messages, conversation_reads
8. transactions
9. analytics_cache (optional)
