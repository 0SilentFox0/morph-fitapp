# Database Structure (FitConnect)

PostgreSQL schema for the backend. Узгоджено з [TECH_TASK.md](TECH_TASK.md) і feature specs у [`features/`](features/).

**Stack:** PostgreSQL 16+, Eloquent ORM (Laravel 12), modular monolith. Усі timestamp'и — `TIMESTAMPTZ` в UTC. PK — UUIDv7 (`gen_random_uuid()` або Laravel's `Str::orderedUuid()`).

**Visual ER tree:** [DB_SCHEMA_TREE.md](DB_SCHEMA_TREE.md) — Mermaid diagram + ASCII ownership tree.

---

## 1. Conventions

### 1.1 Common columns

Більшість таблиць має:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` (через `pgcrypto` extension).
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` (через trigger або Eloquent timestamps).
- `deleted_at TIMESTAMPTZ NULL` — soft delete (де потрібно).

### 1.2 Foreign key conventions

- `ON DELETE CASCADE` — для child-rows, що не мають сенсу без parent (e.g. `messages → conversations`).
- `ON DELETE SET NULL` — для optional refs, де parent може зникнути, а child лишається (e.g. `transactions.client_id`).
- `ON DELETE RESTRICT` — для прямих фінансових/audit зв'язків (default).

### 1.3 Indexes

- Кожен FK має індекс на FK column.
- Усі `created_at DESC` для cursor pagination.
- Часті фільтри — composite indexes.
- Search — `tsvector` GIN.
- Time-range queries — GiST (`tstzrange`).

### 1.4 Naming

- Snake_case.
- Plural for tables (`users`, `sessions`).
- Singular for FK columns (`user_id`, `session_id`).
- Boolean — `is_*` (e.g. `is_in_debt`).
- Timestamps — `*_at` (e.g. `paid_at`).
- Counts — `*_count` (e.g. `views_count`).

### 1.5 Module mapping

| Tables | Feature module |
|---|---|
| users, refresh_tokens, oauth_identities, email_verifications, password_resets, email_change_requests, audit_logs, data_exports | [Auth](features/auth.md) |
| (users — Profile fields) | [Users](features/users.md) |
| media_files | [Files](features/files.md) |
| notifications, device_tokens | [Notifications](features/notifications.md) |
| onboarding_progress | [Onboarding](features/onboarding.md) |
| clients, client_invitations | [Clients](features/clients.md) |
| programs, program_exercises, program_videos, program_likes, client_programs | [Programs](features/programs.md) |
| exercises | [Exercises](features/exercises.md) |
| sessions, session_participants, session_series | [Sessions](features/sessions.md) |
| conversations, conversation_participants, messages | [Chat](features/chat.md) |
| workout_logs, workout_log_exercises, workout_log_sets | [Workout Tracking](features/workout-tracking.md) |
| calendar_integrations | [Integrations](features/integrations.md) |
| package_templates, client_packages | [Packages](features/packages.md) |
| transactions, withdrawals | [Transactions](features/transactions.md) |
| body_measurements, personal_records | [Progress](features/progress.md) |
| profile_view_events, analytics_cache | [Analytics](features/analytics.md) |
| achievements | (Gamification — minimal MVP) |

---

## 2. Entity Relationship (overview)

```
users ──┬── refresh_tokens
        ├── oauth_identities
        ├── email_verifications / password_resets / email_change_requests
        ├── audit_logs
        ├── data_exports
        ├── onboarding_progress
        ├── device_tokens
        ├── notifications (recipient)
        ├── media_files (owner)
        │
        ├── clients (trainer_id) ──┬── client_invitations
        │                          ├── client_programs (snapshot)
        │                          ├── client_packages ────┐
        │                          ├── body_measurements   │
        │                          ├── personal_records    │
        │                          └── sessions (via session_participants)
        │                                                  │
        ├── programs ──┬── program_exercises               │
        │              ├── program_videos                  │
        │              └── program_likes                   │
        │                                                  │
        ├── exercises ─── (referenced by program_exercises,│
        │                  workout_log_sets, personal_records)
        │                                                  │
        ├── sessions ──┬── session_participants            │
        │              ├── workout_logs ───┬── workout_log_exercises
        │              │                   └── workout_log_sets
        │              └── (linked to client_packages) ────┘
        │
        ├── session_series ── (materialized into sessions)
        │
        ├── conversations ── conversation_participants
        │                 └─ messages (with media via media_files)
        │
        ├── transactions ── (linked to client_packages)
        ├── withdrawals
        │
        ├── package_templates ── (referenced by client_packages)
        │
        ├── calendar_integrations
        ├── profile_view_events
        ├── analytics_cache
        └── achievements
```

---

## 3. Tables — Auth & Identity

### 3.1 `users`

Central user table. Один row per user; trainer-specific fields nullable for clients. Used by both [Auth](features/auth.md) and [Users](features/users.md) modules.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| email | VARCHAR(255) | UNIQUE NULL | nullable for OAuth-only users (тимчасово; finalize on first email) |
| email_verified_at | TIMESTAMPTZ | NULL | set on AUTH-001 verification or AUTH-002 verified OAuth email |
| phone | VARCHAR(32) | UNIQUE NULL | optional, post-MVP for SMS |
| password_hash | VARCHAR(255) | NULL | bcrypt (cost 12); NULL for OAuth-only |
| name | VARCHAR(255) | NOT NULL | |
| avatar_url | VARCHAR(512) | NULL | computed from `media_files` (avatar purpose); denormalized for fast read |
| role | ENUM(`client`,`trainer`,`admin`) | NOT NULL DEFAULT `client` | |
| timezone | VARCHAR(64) | DEFAULT `'UTC'` | IANA TZ name |
| locale | VARCHAR(16) | DEFAULT `'uk'` | for localized notifications |
| currency | VARCHAR(3) | DEFAULT `'UAH'` | trainer's primary currency (for analytics) |
| notification_preferences | JSONB | DEFAULT `'{}'` | per-channel toggles: `{ sessions: true, chat: true, packages: true, marketing: false }` |
| points | INTEGER | DEFAULT 0 | gamification (HOME-003 badge) |
| **Trainer-specific (NULL for clients):** | | | |
| experience | VARCHAR(255) | NULL | "5 years" |
| certifications | JSONB | NULL | `string[]` |
| training_types | JSONB | NULL | `["HIIT", "Cardio", ...]` |
| client_types | JSONB | NULL | `["Personal", "Group", "Online"]` |
| locations | JSONB | NULL | `["Gym X", "Online"]` |
| work_schedule_start | TIME | NULL | |
| work_schedule_end | TIME | NULL | |
| work_schedule_days | JSONB | NULL | `["mon", "tue", ...]` |
| **Client-specific (NULL for trainers):** | | | |
| goals | JSONB | NULL | `["lose_weight", "build_muscle"]` |
| fitness_level | ENUM(`beginner`,`intermediate`,`advanced`) | NULL | |
| **Lifecycle:** | | | |
| onboarding_completed_at | TIMESTAMPTZ | NULL | set on ONB completion |
| last_seen_at | TIMESTAMPTZ | NULL | updated on each authenticated request (throttled) |
| deleted_at | TIMESTAMPTZ | NULL | soft delete (AUTH-005) |
| deletion_scheduled_at | TIMESTAMPTZ | NULL | hard delete schedule (now + 30 days) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(email)` UNIQUE WHERE `deleted_at IS NULL`, `(role)`, `(deletion_scheduled_at) WHERE deleted_at IS NOT NULL` (for hard-delete cron).

**Anonymization on hard delete:** `name = 'Deleted user'`, `email/phone/avatar_url = NULL`, JSONB fields → `'{}'`. Row не видаляється (FK з усіх таблиць).

---

### 3.2 `refresh_tokens`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users, ON DELETE CASCADE NOT NULL | |
| token_hash | VARCHAR(255) | NOT NULL | sha256 of token; plain token only returned once at issuance |
| device_label | VARCHAR(255) | NULL | "iPhone 15, Safari" — for sessions list UI |
| ip | INET | NULL | last-used IP |
| user_agent | VARCHAR(512) | NULL | |
| expires_at | TIMESTAMPTZ | NOT NULL | now + 30 days |
| revoked_at | TIMESTAMPTZ | NULL | invalidated (logout) |
| replaced_by_id | UUID | FK → refresh_tokens SET NULL | rotation chain |
| last_used_at | TIMESTAMPTZ | NULL | for sessions list |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(user_id)`, `(expires_at) WHERE revoked_at IS NULL` (cleanup job), `(token_hash)` UNIQUE.

---

### 3.3 `oauth_identities`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users, ON DELETE CASCADE NOT NULL | |
| provider | VARCHAR(32) | NOT NULL | `google`, `apple`, `facebook` |
| provider_subject | VARCHAR(255) | NOT NULL | id from provider |
| provider_email | VARCHAR(255) | NULL | email at provider (may differ from users.email) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** UNIQUE `(provider, provider_subject)`, `(user_id)`.

---

### 3.4 `email_verifications`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users, ON DELETE CASCADE NOT NULL | |
| token_hash | VARCHAR(255) | NOT NULL UNIQUE | sha256 of token |
| expires_at | TIMESTAMPTZ | NOT NULL | now + 24h |
| last_send_status | VARCHAR(32) | NULL | from email provider |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(user_id)`, `(expires_at)`.

---

### 3.5 `password_resets`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users, ON DELETE CASCADE NOT NULL | |
| token_hash | VARCHAR(255) | NOT NULL UNIQUE | sha256 |
| expires_at | TIMESTAMPTZ | NOT NULL | now + 1h |
| used_at | TIMESTAMPTZ | NULL | one-time use |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(user_id)`, `(expires_at) WHERE used_at IS NULL`.

---

### 3.6 `email_change_requests`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users, ON DELETE CASCADE NOT NULL | |
| new_email | VARCHAR(255) | NOT NULL | |
| token_hash | VARCHAR(255) | NOT NULL UNIQUE | sha256 |
| expires_at | TIMESTAMPTZ | NOT NULL | now + 24h |
| confirmed_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

---

### 3.7 `audit_logs`

Append-only log для security-critical actions ([AUTH-005](features/auth.md) §6.8).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users SET NULL | NULL after hard-delete |
| user_email_at_event | VARCHAR(255) | NULL | snapshot для post-anonymization |
| action | VARCHAR(64) | NOT NULL | e.g. `login`, `password_change`, `account_deletion_request` |
| entity_type | VARCHAR(64) | NULL | e.g. `transaction`, `session` |
| entity_id | UUID | NULL | |
| ip | INET | NULL | |
| user_agent | VARCHAR(512) | NULL | |
| metadata | JSONB | NULL | event-specific data |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(user_id, created_at DESC)`, `(action, created_at DESC)`. Retention: 1 рік (auto-cleanup job).

---

### 3.8 `data_exports`

GDPR data exports (AUTH-005) + reused для transaction/progress exports.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users, ON DELETE CASCADE NOT NULL | exporter |
| kind | VARCHAR(32) | NOT NULL | `gdpr_full`, `transactions`, `progress` |
| filters | JSONB | NULL | export-specific params (date range, client_id) |
| status | ENUM(`pending`,`processing`,`ready`,`failed`) | NOT NULL DEFAULT `pending` | |
| size_bytes | BIGINT | NULL | |
| file_id | UUID | FK → media_files SET NULL | ZIP/CSV upload after ready |
| signed_url | VARCHAR(1024) | NULL | TTL-bound; regenerated on access |
| signed_url_expires_at | TIMESTAMPTZ | NULL | |
| error | TEXT | NULL | if failed |
| started_at | TIMESTAMPTZ | NULL | |
| completed_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(user_id, created_at DESC)`, `(status)`.

---

## 4. Tables — Onboarding

### 4.1 `onboarding_progress`

Per-user progress through onboarding flow ([ONB-001/002/003](features/onboarding.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| user_id | UUID | PK FK → users CASCADE | one-to-one |
| steps | JSONB | NOT NULL DEFAULT `'{}'` | `{ choose_role: { status: 'completed', completed_at, data: {...} }, ... }` |
| current_step | VARCHAR(64) | NULL | for resume |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

---

## 5. Tables — Files & Media

### 5.1 `media_files`

Single table для всіх uploads (avatars, exercise videos, chat media, exports). Two-phase upload pipeline ([FIL-001](features/files.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| owner_user_id | UUID | FK → users SET NULL | uploader |
| purpose | ENUM(`avatar`,`exercise_video`,`chat_media`,`data_export`,`progress_export`,`other`) | NOT NULL | |
| mime | VARCHAR(100) | NOT NULL | `image/jpeg`, `video/mp4`, ... |
| size_bytes | BIGINT | NOT NULL | |
| s3_bucket | VARCHAR(255) | NOT NULL | |
| s3_key | VARCHAR(512) | NOT NULL | path within bucket |
| original_name | VARCHAR(255) | NULL | |
| status | ENUM(`pending`,`ready`,`failed`) | NOT NULL DEFAULT `pending` | |
| thumbnails | JSONB | NULL | `{ "120": "url", "240": "url" }` |
| context | JSONB | NULL | e.g. `{ conversation_id, exercise_id }` for ACL |
| uploaded_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULL | for cleanup |

**Indexes:** `(owner_user_id)`, `(status) WHERE deleted_at IS NULL`, `(purpose, created_at)`, `(uploaded_at) WHERE status = 'pending'` (for cleanup job).

---

## 6. Tables — Notifications

### 6.1 `device_tokens`

FCM device tokens для push delivery ([NTF-001](features/notifications.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users CASCADE NOT NULL | |
| token | VARCHAR(512) | NOT NULL UNIQUE | FCM token |
| platform | ENUM(`ios`,`android`) | NOT NULL | |
| device_label | VARCHAR(255) | NULL | "iPhone 15" |
| app_version | VARCHAR(32) | NULL | |
| last_seen_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | refresh per app launch |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULL | on logout або `NOT_REGISTERED` від FCM |

**Indexes:** `(user_id) WHERE deleted_at IS NULL`, `(token)` UNIQUE.

---

### 6.2 `notifications`

In-app notification feed + push delivery state ([NTF-002](features/notifications.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| recipient_user_id | UUID | FK → users CASCADE NOT NULL | |
| type | VARCHAR(64) | NOT NULL | e.g. `session_reminder_24h`, `message_received`, `package_exhausted` |
| title | VARCHAR(255) | NULL | localized; computed on render |
| body | TEXT | NULL | |
| payload | JSONB | NULL | type-specific data (e.g. `{ session_id, sender_name }`) |
| source_type | VARCHAR(64) | NULL | e.g. `session`, `message`, `package` |
| source_id | UUID | NULL | |
| read_at | TIMESTAMPTZ | NULL | |
| delivered_at | TIMESTAMPTZ | NULL | when client confirmed receipt (best-effort) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(recipient_user_id, created_at DESC)`, `(recipient_user_id) WHERE read_at IS NULL` (unread count), UNIQUE partial `(recipient_user_id, type, source_id) WHERE type IN ('session_reminder_24h', 'session_reminder_1h')` (dedup).

**Retention:** 90 днів (cleanup job).

---

## 7. Tables — Clients (CRM)

### 7.1 `clients`

Trainer's roster ([CLT-001](features/clients.md)). Може існувати з linked user_id (registered client) або без (standalone record).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| trainer_id | UUID | FK → users CASCADE NOT NULL | |
| user_id | UUID | FK → users SET NULL UNIQUE per (trainer_id) | linked client account |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | NULL | for invitation/contact |
| phone | VARCHAR(32) | NULL | |
| avatar_url | VARCHAR(512) | NULL | denormalized from linked user |
| type | ENUM(`personal`,`group`,`online`) | NOT NULL DEFAULT `personal` | |
| status | ENUM(`active`,`archived`) | NOT NULL DEFAULT `active` | |
| notes | TEXT | NULL | private to trainer; max 10000 chars |
| tags | JSONB | NULL DEFAULT `'[]'` | string array, max 20 elements |
| archived_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(trainer_id, status, name)`, `(trainer_id, user_id)`, GIN on `tags`.

**Constraint:** UNIQUE `(trainer_id, user_id) WHERE user_id IS NOT NULL` — один user не може бути двічі в roster того ж тренера.

---

### 7.2 `client_invitations`

Email invitations to register/link ([CLT-002](features/clients.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| client_id | UUID | FK → clients CASCADE NOT NULL | |
| trainer_id | UUID | FK → users CASCADE NOT NULL | denormalized for queries |
| code | VARCHAR(64) | NOT NULL UNIQUE | base32 random, URL-friendly |
| email | VARCHAR(255) | NOT NULL | snapshot at issuance |
| expires_at | TIMESTAMPTZ | NOT NULL | now + 14d |
| accepted_at | TIMESTAMPTZ | NULL | |
| revoked_at | TIMESTAMPTZ | NULL | |
| last_sent_at | TIMESTAMPTZ | NULL | for resend rate limit |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(client_id) WHERE accepted_at IS NULL AND revoked_at IS NULL` (active), `(trainer_id, created_at DESC)`, `(code) UNIQUE`.

---

## 8. Tables — Programs & Exercises

### 8.1 `exercises`

Trainer's exercise library ([EXR-001](features/exercises.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| trainer_id | UUID | FK → users CASCADE NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | NULL | markdown |
| muscle_groups | JSONB | NOT NULL DEFAULT `'[]'` | `["quads", "glutes"]` |
| equipment | JSONB | NULL DEFAULT `'[]'` | `["barbell", "bench"]` |
| video_file_id | UUID | FK → media_files SET NULL | exercise demo video |
| archived_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(trainer_id, name)`, GIN on `muscle_groups`.

---

### 8.2 `programs`

Training programs templates ([PRG-001](features/programs.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| trainer_id | UUID | FK → users CASCADE NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | NULL | |
| difficulty | ENUM(`beginner`,`intermediate`,`advanced`) | NULL | |
| estimated_duration_min | INTEGER | NULL | total estimated time |
| cover_file_id | UUID | FK → media_files SET NULL | cover image |
| views_count | INTEGER | NOT NULL DEFAULT 0 | denormalized |
| likes_count | INTEGER | NOT NULL DEFAULT 0 | denormalized |
| archived_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(trainer_id, archived_at)`, `(trainer_id, views_count DESC)`.

---

### 8.3 `program_exercises`

Exercise within a program with defaults ([EXR-002](features/exercises.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| program_id | UUID | FK → programs CASCADE NOT NULL | |
| exercise_id | UUID | FK → exercises SET NULL | snapshot integrity |
| order | INTEGER | NOT NULL | for drag-and-drop |
| sets | INTEGER | NOT NULL | 1-50 |
| reps | INTEGER | NOT NULL | 1-1000 |
| weight_kg | NUMERIC(6,2) | NULL | 0-1000 |
| rest_seconds | INTEGER | NULL | 0-3600 |
| notes | TEXT | NULL | |
| name_snapshot | VARCHAR(255) | NOT NULL | preserves name if exercise deleted |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(program_id, order)`, UNIQUE `(program_id, order)` (deferred constraint for reorder transactions).

---

### 8.4 `program_videos`

Optional video gallery per program (besides exercises). Files reference `media_files`.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| program_id | UUID | FK → programs CASCADE NOT NULL | |
| media_file_id | UUID | FK → media_files SET NULL | |
| title | VARCHAR(255) | NULL | |
| order | INTEGER | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(program_id, order)`.

---

### 8.5 `program_likes`

User likes per program ([PRG-001](features/programs.md)).

| Column | Type | Constraints |
|---|---|---|
| program_id | UUID | PK FK → programs CASCADE |
| user_id | UUID | PK FK → users CASCADE |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Indexes:** `(program_id)`.

---

### 8.6 `client_programs`

Program assignment to client with snapshot ([PRG-002](features/programs.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| client_id | UUID | FK → clients CASCADE NOT NULL | |
| program_id | UUID | FK → programs SET NULL | nullable if program deleted |
| program_snapshot | JSONB | NOT NULL | frozen at assignment: `{ name, description, exercises: [...] }` |
| assigned_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| removed_at | TIMESTAMPTZ | NULL | soft unassign |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(client_id, removed_at)`, `(program_id)`, UNIQUE partial `(client_id, program_id) WHERE removed_at IS NULL`.

---

## 9. Tables — Sessions & Calendar

### 9.1 `sessions`

Tренувальна сесія ([SES-001](features/sessions.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| trainer_id | UUID | FK → users CASCADE NOT NULL | |
| title | VARCHAR(255) | NOT NULL | |
| type | VARCHAR(50) | NULL | Cardio, HIIT, Strength, Mobility, ... |
| start_at | TIMESTAMPTZ | NOT NULL | UTC |
| end_at | TIMESTAMPTZ | NOT NULL | UTC; `> start_at` |
| status | ENUM(`planned`,`in_progress`,`completed`,`canceled`,`no_show`) | NOT NULL DEFAULT `planned` | |
| status_changed_at | TIMESTAMPTZ | NULL | |
| cancellation_reason | VARCHAR(64) | NULL | `no_show`, `canceled_by_trainer`, `canceled_by_client`, `other` |
| notes | TEXT | NULL | |
| program_id | UUID | FK → programs SET NULL | optional template link |
| client_package_id | UUID | FK → client_packages SET NULL | package linkage (SES-007) |
| series_id | UUID | FK → session_series SET NULL | for recurring (SES-004) |
| series_overridden | BOOLEAN | NOT NULL DEFAULT false | edited individually |
| google_event_id | VARCHAR(255) | NULL | for Calendar sync (INT-001) |
| google_event_etag | VARCHAR(255) | NULL | for conflict detection |
| idempotency_key | VARCHAR(64) | NULL UNIQUE | create idempotency |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(trainer_id, start_at)`, `(status, start_at) WHERE status = 'planned'` (для AutoNoShow job), `(google_event_id) WHERE google_event_id IS NOT NULL`, GiST `tstzrange(start_at, end_at)` для overlap queries ([SES-005](features/sessions.md)).

---

### 9.2 `session_participants`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| session_id | UUID | PK FK → sessions CASCADE | |
| client_id | UUID | PK FK → clients SET NULL | NULL if client hard-deleted |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(client_id)` (для client's session view).

---

### 9.3 `session_series`

Parent for recurring sessions ([SES-004](features/sessions.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| trainer_id | UUID | FK → users CASCADE NOT NULL | |
| template | JSONB | NOT NULL | session fields snapshot: `{ title, type, duration_min, participants: [client_id], program_id, ... }` |
| recurrence_rule | JSONB | NOT NULL | `{ frequency: "weekly", days_of_week: ["mon","wed","fri"], time: "18:00", until_date }` |
| timezone | VARCHAR(64) | NOT NULL | for DST handling |
| materialized_until | DATE | NULL | last day for which sessions are materialized |
| deleted_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(trainer_id, materialized_until)`, `(deleted_at)`.

---

## 10. Tables — Workout Tracking

### 10.1 `workout_logs`

One row per session that started workout ([WT-001](features/workout-tracking.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| session_id | UUID | FK → sessions CASCADE UNIQUE NOT NULL | one log per session |
| started_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| started_by_user_id | UUID | FK → users SET NULL | trainer or client |
| finished_at | TIMESTAMPTZ | NULL | |
| finished_by_user_id | UUID | FK → users SET NULL | |
| last_version | INTEGER | NOT NULL DEFAULT 0 | for real-time conflict resolution |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(session_id)` UNIQUE, `(started_at) WHERE finished_at IS NULL`.

---

### 10.2 `workout_log_exercises`

Snapshot of program exercises (or ad-hoc) при початку workout.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| workout_log_id | UUID | FK → workout_logs CASCADE NOT NULL | |
| exercise_id | UUID | FK → exercises SET NULL | NULL if deleted |
| order | INTEGER | NOT NULL | |
| name_snapshot | VARCHAR(255) | NOT NULL | from exercise at workout start |
| planned_sets | INTEGER | NULL | from program_exercises |
| planned_reps | INTEGER | NULL | |
| planned_weight_kg | NUMERIC(6,2) | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(workout_log_id, order)`.

---

### 10.3 `workout_log_sets`

Actual performed sets ([WT-002](features/workout-tracking.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| workout_log_id | UUID | FK → workout_logs CASCADE NOT NULL | denormalized for queries |
| workout_log_exercise_id | UUID | FK → workout_log_exercises CASCADE NOT NULL | |
| exercise_id | UUID | FK → exercises SET NULL | denormalized for PR queries |
| set_index | INTEGER | NOT NULL | 1, 2, 3, ... |
| reps | INTEGER | NOT NULL | 0-1000 |
| weight_kg | NUMERIC(6,2) | NOT NULL DEFAULT 0 | 0 for bodyweight |
| rest_seconds | INTEGER | NULL | |
| performed_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | overridden if client-provided in future |
| actor_user_id | UUID | FK → users SET NULL NOT NULL | who logged |
| is_pr | BOOLEAN | NOT NULL DEFAULT false | flagged by PR detector |
| client_uuid | UUID | NOT NULL | client-generated for offline idempotency |
| version | INTEGER | NOT NULL | from workout_logs.last_version |
| deleted_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** UNIQUE `(workout_log_id, client_uuid)` (idempotency), `(workout_log_id, set_index)`, `(exercise_id, performed_at)` (для PR detection), `(actor_user_id)`.

---

## 11. Tables — Chat

### 11.1 `conversations`

One row per pair trainer-client ([CHT-001](features/chat.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| last_message_at | TIMESTAMPTZ | NULL | for sort DESC |
| last_message_id | UUID | FK → messages SET NULL | for preview |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

---

### 11.2 `conversation_participants`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| conversation_id | UUID | PK FK → conversations CASCADE | |
| user_id | UUID | PK FK → users CASCADE | |
| last_read_message_id | UUID | FK → messages SET NULL | for unread count |
| last_read_at | TIMESTAMPTZ | NULL | |
| deleted_at | TIMESTAMPTZ | NULL | soft delete для current user only |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(user_id, conversation_id)`, UNIQUE pair canonical `(LEAST(u1,u2), GREATEST(u1,u2))` enforced at service level.

---

### 11.3 `messages`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| conversation_id | UUID | FK → conversations CASCADE NOT NULL | |
| sender_id | UUID | FK → users SET NULL | NULL if deleted |
| body | TEXT | NULL | text content; NULL allowed if only media |
| body_tsv | TSVECTOR | GENERATED ALWAYS AS (to_tsvector('simple', coalesce(body, ''))) STORED | for [CHT-005](features/chat.md) search |
| media_file_ids | JSONB | NOT NULL DEFAULT `'[]'` | array of media_files.id |
| client_message_id | UUID | NOT NULL | from client for idempotency |
| sent_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULL | soft delete |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(conversation_id, sent_at DESC)`, UNIQUE `(conversation_id, client_message_id)`, GIN on `body_tsv`.

**Constraint:** `body IS NOT NULL OR jsonb_array_length(media_file_ids) > 0`.

---

## 12. Tables — Packages & Subscriptions

### 12.1 `package_templates`

Trainer's шаблони пакетів ([PKG-001](features/packages.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| trainer_id | UUID | FK → users CASCADE NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| kind | ENUM(`count_based`,`time_based`,`hybrid`) | NOT NULL | |
| sessions_count | INTEGER | NULL | for count_based/hybrid |
| validity_days | INTEGER | NULL | for time_based/hybrid |
| price | NUMERIC(10,2) | NOT NULL | |
| currency | VARCHAR(3) | NOT NULL DEFAULT `'UAH'` | |
| auto_renew_default | BOOLEAN | NOT NULL DEFAULT false | |
| archived_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(trainer_id, archived_at)`.

---

### 12.2 `client_packages`

Конкретний пакет призначений клієнту ([PKG-002](features/packages.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| client_id | UUID | FK → clients CASCADE NOT NULL | |
| trainer_id | UUID | FK → users CASCADE NOT NULL | denormalized для queries |
| template_id | UUID | FK → package_templates SET NULL | optional |
| kind | ENUM(`count_based`,`time_based`,`hybrid`) | NOT NULL | snapshot |
| sessions_count | INTEGER | NULL | total |
| remaining_sessions | INTEGER | NULL | decremented on SessionCompleted |
| validity_days | INTEGER | NULL | |
| expires_at | TIMESTAMPTZ | NULL | computed at assignment |
| price | NUMERIC(10,2) | NOT NULL | snapshot |
| currency | VARCHAR(3) | NOT NULL | snapshot |
| status | ENUM(`active`,`exhausted`,`expired`,`archived`) | NOT NULL DEFAULT `active` | |
| assigned_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| archived_at | TIMESTAMPTZ | NULL | |
| auto_renew | BOOLEAN | NOT NULL DEFAULT false | |
| auto_renewed_at | TIMESTAMPTZ | NULL | when this was renewed (deprecated) |
| auto_renewed_to_id | UUID | FK → client_packages SET NULL | chain link |
| expiry_reminded_at | TIMESTAMPTZ | NULL | for one-time reminder |
| debt_since | TIMESTAMPTZ | NULL | for debt tracking (PKG-004) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(client_id, status)`, `(trainer_id, status)`, `(trainer_id, debt_since) WHERE debt_since IS NOT NULL`, `(expires_at) WHERE status = 'active'`.

---

## 13. Tables — Transactions & Withdrawals

### 13.1 `transactions`

Manual transactions (без прямих оплат) ([TRX-001](features/transactions.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| trainer_id | UUID | FK → users CASCADE NOT NULL | |
| client_id | UUID | FK → clients SET NULL | optional |
| client_package_id | UUID | FK → client_packages SET NULL | optional link [TRX-002](features/transactions.md) |
| amount | NUMERIC(10,2) | NOT NULL CHECK > 0 | |
| currency | VARCHAR(3) | NOT NULL DEFAULT `'UAH'` | |
| method | ENUM(`cash`,`transfer`,`card`,`other`) | NOT NULL | |
| status | ENUM(`paid`,`pending`,`canceled`) | NOT NULL DEFAULT `paid` | |
| paid_at | TIMESTAMPTZ | NULL | required if status = `paid` |
| note | TEXT | NULL | |
| idempotency_key | VARCHAR(64) | NULL | |
| deleted_at | TIMESTAMPTZ | NULL | soft delete |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(trainer_id, paid_at DESC) WHERE deleted_at IS NULL`, `(client_id, status)`, UNIQUE partial `(client_package_id) WHERE status = 'paid' AND deleted_at IS NULL` (один paid transaction per package), `(idempotency_key)` UNIQUE.

---

### 13.2 `withdrawals`

Trainer's withdrawals ([TRX-004](features/transactions.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| trainer_id | UUID | FK → users CASCADE NOT NULL | |
| amount | NUMERIC(10,2) | NOT NULL CHECK > 0 | |
| currency | VARCHAR(3) | NOT NULL | |
| withdrawn_at | TIMESTAMPTZ | NOT NULL | |
| note | TEXT | NULL | |
| deleted_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(trainer_id, withdrawn_at DESC) WHERE deleted_at IS NULL`.

---

## 14. Tables — Progress Metrics

### 14.1 `body_measurements`

Long-format vimirivannya ([PROG-001](features/progress.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| client_id | UUID | FK → clients CASCADE NOT NULL | |
| metric_type | ENUM(`weight`,`height`,`body_fat_percent`,`chest`,`waist`,`hips`,`biceps`,`thigh`) | NOT NULL | |
| value | NUMERIC(7,2) | NOT NULL CHECK > 0 | |
| unit | VARCHAR(8) | NOT NULL | `kg`, `cm`, `%` |
| measured_at | TIMESTAMPTZ | NOT NULL | |
| recorded_by_user_id | UUID | FK → users SET NULL | trainer or client (self-record) |
| deleted_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(client_id, metric_type, measured_at DESC)`.

---

### 14.2 `personal_records`

Auto-detected PRs ([PROG-003](features/progress.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| client_id | UUID | FK → clients CASCADE NOT NULL | |
| exercise_id | UUID | FK → exercises CASCADE NOT NULL | |
| weight_kg | NUMERIC(6,2) | NOT NULL | |
| reps | INTEGER | NOT NULL | |
| estimated_1rm | NUMERIC(7,2) | GENERATED ALWAYS AS (weight_kg * (1 + reps::numeric / 30)) STORED | Epley formula |
| achieved_at | TIMESTAMPTZ | NOT NULL | |
| workout_log_set_id | UUID | FK → workout_log_sets SET NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** UNIQUE `(client_id, exercise_id)` (one PR per pair), `(client_id, achieved_at DESC)`.

---

## 15. Tables — Integrations

### 15.1 `calendar_integrations`

Per-user external calendar links ([INT-001/INT-002](features/integrations.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users CASCADE NOT NULL | |
| provider | ENUM(`google`,`apple`) | NOT NULL | |
| provider_user_email | VARCHAR(255) | NULL | for display |
| access_token | TEXT | NULL | encrypted (Eloquent `encrypted` cast); for `google` |
| refresh_token | TEXT | NULL | encrypted |
| token_expires_at | TIMESTAMPTZ | NULL | |
| calendar_id | VARCHAR(255) | NULL | selected calendar (Google) |
| sync_token | VARCHAR(255) | NULL | для incremental pull (Google) |
| feed_token | VARCHAR(64) | NULL UNIQUE | для ICS feed (Apple) |
| webhook_channel_id | VARCHAR(255) | NULL | Google watch channel |
| webhook_resource_id | VARCHAR(255) | NULL | Google resource id |
| webhook_expires_at | TIMESTAMPTZ | NULL | renewals every 7 днів |
| last_synced_at | TIMESTAMPTZ | NULL | |
| last_error | TEXT | NULL | |
| deleted_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** UNIQUE `(user_id, provider) WHERE deleted_at IS NULL`, `(webhook_channel_id) WHERE webhook_channel_id IS NOT NULL`, `(webhook_expires_at) WHERE webhook_expires_at IS NOT NULL` (для RenewWebhookJob).

---

## 16. Tables — Analytics

### 16.1 `profile_view_events`

Append-only лог переглядів профіля ([ANL-001](features/analytics.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| viewed_user_id | UUID | FK → users CASCADE NOT NULL | profile owner |
| viewer_user_id | UUID | FK → users SET NULL | NULL if anonymous |
| viewer_ip_hash | VARCHAR(64) | NULL | sha256(ip + salt) for dedup |
| viewed_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(viewed_user_id, viewed_at)`, UNIQUE partial `(viewed_user_id, viewer_user_id, date_trunc('day', viewed_at)) WHERE viewer_user_id IS NOT NULL` (1 view per user per day per profile).

---

### 16.2 `analytics_cache`

Precomputed analytics aggregations.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| cache_key | VARCHAR(255) | NOT NULL UNIQUE | e.g. `trainer:{id}:income:2026-05:day` |
| payload | JSONB | NOT NULL | aggregation result |
| computed_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| expires_at | TIMESTAMPTZ | NOT NULL | TTL для invalidation |

**Indexes:** `(cache_key)` UNIQUE, `(expires_at)` для cleanup.

---

### 16.3 `achievements`

Optional gamification (e.g. "You got paid").

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users CASCADE NOT NULL | |
| key | VARCHAR(64) | NOT NULL | e.g. `first_payment_received` |
| earned_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| payload | JSONB | NULL | extra info |

**Unique:** `(user_id, key)`.

---

## 16A. Tables — Gamification (Phase 4)

Спека: [features/gamification.md](features/gamification.md). Чотири незалежні концепти — points, consistency, strength, league — у розділених таблицях/колонках.

### 16A.0 Alterations to existing tables

| Таблиця | Колонка | Тип | Призначення |
|---|---|---|---|
| `users` | `points` | INTEGER DEFAULT 0 | **уже існує** — стає денормалізованим кешем над `points_ledger` |
| `exercises` | `canonical_exercise_id` | UUID NULL FK → canonical_exercises ON DELETE SET NULL | міст приватної вправи у глобальний борд |
| `sessions` | `is_trainer_verified` | BOOLEAN NOT NULL DEFAULT true | тренерська сесія = true; соло само-лог = false |
| `workout_log_sets` | `is_verified` | BOOLEAN NOT NULL DEFAULT false | копіюється з `sessions.is_trainer_verified` при вставці |
| `personal_records` | `is_verified` | BOOLEAN NOT NULL DEFAULT false | копіюється з сету-джерела при детекті PR |
| `personal_records` | `canonical_exercise_id` | UUID NULL | денормалізовано з `exercises` для борда «по вправі» |

**Нові індекси на змінених таблицях:** `exercises (canonical_exercise_id) WHERE canonical_exercise_id IS NOT NULL`; `personal_records (canonical_exercise_id, is_verified, estimated_1rm DESC) WHERE canonical_exercise_id IS NOT NULL AND is_verified`.

---

### 16A.1 `canonical_exercises`

Невеликий адмін-курований глобальний каталог базових вправ ([GAME-005](features/gamification.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| key | VARCHAR(64) | NOT NULL UNIQUE | `bench_press`, `back_squat`, `deadlift`, `overhead_press`, `barbell_row` |
| name | VARCHAR(255) | NOT NULL | display |
| category | VARCHAR(32) | NOT NULL | `push`/`pull`/`squat`/`hinge` |
| is_bodyweight | BOOLEAN | NOT NULL DEFAULT false | вмикає bodyweight-нормалізацію 1RM |
| strength_weight | NUMERIC(4,3) | NOT NULL DEFAULT 1.0 | внесок вправи у силовий суб-бал (тюнабельно) |
| is_active | BOOLEAN | NOT NULL DEFAULT true | борди лише для активних |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** UNIQUE `(key)`, `(is_active) WHERE is_active`.

---

### 16A.2 `points_ledger`

Append-only джерело істини нарахувань; `users.points` — кеш ([GAME-001](features/gamification.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users CASCADE NOT NULL | |
| amount | INTEGER | NOT NULL | signed; реверс = негативний row |
| reason | VARCHAR(48) | NOT NULL | `session_completed`,`pr_set`,`streak_milestone`,`reversal`,`admin_adjustment` |
| source_type | VARCHAR(48) | NULL | `session`,`personal_record`,`streak` |
| source_id | UUID | NULL | |
| dedup_key | VARCHAR(96) | NULL | `session_completed:{session_id}:{user_id}` |
| metadata | JSONB | NULL | streak length, exercise, admin_id |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(user_id, created_at DESC)`, UNIQUE `(dedup_key) WHERE dedup_key IS NOT NULL` (ідемпотентність), `(reason, source_id)`.

---

### 16A.3 `gamification_scores`

Похідний стан per (user, subject_role, scope) ([GAME-002/003](features/gamification.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users CASCADE NOT NULL | |
| subject_role | VARCHAR(8) | NOT NULL DEFAULT `client` | `client` / `trainer` |
| scope_type | VARCHAR(16) | NOT NULL DEFAULT `world` | `world`/`gym`/`city`/`region` (розширюваність) |
| scope_id | UUID | NULL | NULL для world |
| consistency_score | NUMERIC(10,4) | NOT NULL DEFAULT 0 | |
| strength_score | NUMERIC(10,4) | NOT NULL DEFAULT 0 | 0..1 перцентиль verified 1RM |
| composite_score | NUMERIC(10,4) | NOT NULL DEFAULT 0 | зважений мікс |
| composite_percentile | NUMERIC(6,5) | NULL | 0..1 у пулі (з останнього snapshot) |
| league_tier_id | UUID | NULL FK → league_tiers SET NULL | поточна ліга |
| previous_league_tier_id | UUID | NULL | для promo/demo diff |
| rank | INTEGER | NULL | dense rank у скоупі |
| pool_size | INTEGER | NULL | популяція на момент snapshot |
| inputs | JSONB | NULL | аудит складових (streak/longevity/freq/percentiles) |
| scored_at | TIMESTAMPTZ | NULL | останній перерахунок сирих балів |
| ranked_at | TIMESTAMPTZ | NULL | останнє призначення перцентиля/ліги |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** UNIQUE `(user_id, subject_role, scope_type, scope_id)`, `(scope_type, scope_id, subject_role, composite_score DESC)` (робочий — віконний сорт перцентилів), `(scope_type, scope_id, league_tier_id)`.

---

### 16A.4 `league_tiers`

Конфіг перцентильних тірів зі сталими назвами, окремий набір на роль ([GAME-003](features/gamification.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| subject_role | VARCHAR(8) | NOT NULL DEFAULT `client` | |
| key | VARCHAR(24) | NOT NULL | `wooden`,`bronze`,`silver`,`gold`,`diamond`,`platinum` |
| name | VARCHAR(48) | NOT NULL | |
| ordinal | SMALLINT | NOT NULL | 1..6, вище = краще |
| min_percentile | NUMERIC(6,5) | NOT NULL | inclusive |
| max_percentile | NUMERIC(6,5) | NOT NULL | exclusive |
| icon_key | VARCHAR(48) | NULL | |
| is_active | BOOLEAN | NOT NULL DEFAULT true | |

**Indexes:** UNIQUE `(subject_role, key)`, UNIQUE `(subject_role, ordinal)`. Constraint: діапазони тайлять `[0,1)` без проміжків per role.

---

### 16A.5 `leaderboard_snapshots`

Матеріалізовані борди, читаються по `rank` (cursor) ([GAME-004](features/gamification.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| board_type | VARCHAR(24) | NOT NULL | `composite` / `canonical_1rm` |
| canonical_exercise_id | UUID | NULL | для `canonical_1rm` |
| subject_role | VARCHAR(8) | NOT NULL | |
| scope_type | VARCHAR(16) | NOT NULL | |
| scope_id | UUID | NULL | |
| batch_id | UUID | NOT NULL | один повний перерахунок |
| user_id | UUID | NOT NULL | |
| rank | INTEGER | NOT NULL | |
| score | NUMERIC(12,4) | NOT NULL | composite_score або estimated_1rm |
| percentile | NUMERIC(6,5) | NOT NULL | |
| league_tier_id | UUID | NULL | для composite |
| computed_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** `(board_type, canonical_exercise_id, scope_type, scope_id, subject_role, batch_id, rank)` (cursor read), `(board_type, scope_type, scope_id, user_id, batch_id)` (my-rank). Старі batch-и чистить `LeaderboardSnapshotPruneJob` (latest+1).

---

### 16A.6 `pricing_insight_aggregates`

Анонімні перцентилі цін пакетів ([GAME-008](features/gamification.md)).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| currency | VARCHAR(3) | NOT NULL | |
| kind | package_kind | NULL | сегментація `count_based`/`time_based`/`hybrid` |
| sample_size | INTEGER | NOT NULL | приховуємо показ якщо < min_sample |
| percentiles | JSONB | NOT NULL | `{p10,p25,p50,p75,p90}` з `percentile_cont` |
| min_price | NUMERIC(10,2) | NOT NULL | |
| max_price | NUMERIC(10,2) | NOT NULL | |
| computed_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:** UNIQUE `(currency, kind)`.

---

## 17. Enums (PostgreSQL)

```sql
-- Identity
CREATE TYPE user_role AS ENUM ('client', 'trainer', 'admin');
CREATE TYPE fitness_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Files
CREATE TYPE media_purpose AS ENUM (
    'avatar', 'exercise_video', 'chat_media',
    'data_export', 'progress_export', 'other'
);
CREATE TYPE media_status AS ENUM ('pending', 'ready', 'failed');

-- Notifications
CREATE TYPE device_platform AS ENUM ('ios', 'android');

-- Clients
CREATE TYPE client_type AS ENUM ('personal', 'group', 'online');
CREATE TYPE client_status AS ENUM ('active', 'archived');

-- Programs
CREATE TYPE program_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- Sessions
CREATE TYPE session_status AS ENUM (
    'planned', 'in_progress', 'completed', 'canceled', 'no_show'
);

-- Packages
CREATE TYPE package_kind AS ENUM ('count_based', 'time_based', 'hybrid');
CREATE TYPE package_status AS ENUM ('active', 'exhausted', 'expired', 'archived');

-- Transactions
CREATE TYPE payment_method AS ENUM ('cash', 'transfer', 'card', 'other');
CREATE TYPE transaction_status AS ENUM ('paid', 'pending', 'canceled');

-- Progress
CREATE TYPE body_metric_type AS ENUM (
    'weight', 'height', 'body_fat_percent',
    'chest', 'waist', 'hips', 'biceps', 'thigh'
);

-- Integrations
CREATE TYPE calendar_provider AS ENUM ('google', 'apple');

-- Data exports
CREATE TYPE data_export_kind AS ENUM ('gdpr_full', 'transactions', 'progress');
CREATE TYPE data_export_status AS ENUM ('pending', 'processing', 'ready', 'failed');
```

---

## 18. Indexes summary (key indexes)

| Table | Index | Purpose |
|---|---|---|
| users | UNIQUE `(email) WHERE deleted_at IS NULL` | unique non-deleted email |
| users | `(deletion_scheduled_at) WHERE deleted_at IS NOT NULL` | hard-delete cron |
| sessions | `(trainer_id, start_at)` | schedule list |
| sessions | GiST `tstzrange(start_at, end_at)` | conflict detection |
| sessions | `(status, start_at) WHERE status = 'planned'` | AutoNoShow cron |
| messages | `(conversation_id, sent_at DESC)` | thread pagination |
| messages | GIN `body_tsv` | full-text search |
| messages | UNIQUE `(conversation_id, client_message_id)` | idempotency |
| workout_log_sets | UNIQUE `(workout_log_id, client_uuid)` | offline idempotency |
| workout_log_sets | `(exercise_id, performed_at)` | PR detection |
| client_packages | `(client_id, status)` | client view |
| client_packages | `(trainer_id, debt_since) WHERE debt_since IS NOT NULL` | debt view |
| transactions | `(trainer_id, paid_at DESC) WHERE deleted_at IS NULL` | list |
| transactions | UNIQUE partial `(client_package_id) WHERE status='paid' AND deleted_at IS NULL` | one paid per package |
| personal_records | UNIQUE `(client_id, exercise_id)` | one PR per pair |
| body_measurements | `(client_id, metric_type, measured_at DESC)` | history chart |
| calendar_integrations | UNIQUE `(user_id, provider) WHERE deleted_at IS NULL` | one connection per provider |
| notifications | UNIQUE partial `(recipient_user_id, type, source_id) WHERE type IN (...)` | reminder dedup |
| media_files | `(uploaded_at) WHERE status = 'pending'` | cleanup orphans |
| clients | `(trainer_id, status, name)`, GIN `tags` | roster + filter |
| profile_view_events | UNIQUE partial dedup by day | profile views dedup |
| points_ledger | UNIQUE `(dedup_key) WHERE dedup_key IS NOT NULL` | award idempotency |
| gamification_scores | `(scope_type, scope_id, subject_role, composite_score DESC)` | percentile window sort |
| gamification_scores | UNIQUE `(user_id, subject_role, scope_type, scope_id)` | one row per pool |
| leaderboard_snapshots | `(board_type, canonical_exercise_id, scope_type, scope_id, subject_role, batch_id, rank)` | cursor read |
| personal_records | `(canonical_exercise_id, is_verified, estimated_1rm DESC) WHERE ...` | canonical 1RM board |

---

## 19. Migration order (по фазах)

### Phase 0 — Foundation

1. Extensions: `pgcrypto` (for `gen_random_uuid()`), `btree_gist` (for time range exclusion).
2. Enums (`user_role`, `media_purpose`, `media_status`, `device_platform`, `data_export_kind`, `data_export_status`).
3. `users`.
4. `refresh_tokens`, `oauth_identities`, `email_verifications`, `password_resets`, `email_change_requests`.
5. `media_files`.
6. `device_tokens`, `notifications`.
7. `audit_logs`, `data_exports`.

### Phase 1 — Core CRM

8. Enums (`client_type`, `client_status`, `program_difficulty`, `session_status`, `fitness_level`).
9. `onboarding_progress`.
10. `clients`, `client_invitations`.
11. `exercises`.
12. `programs`, `program_exercises`, `program_videos`, `program_likes`.
13. `client_programs`.
14. `sessions`, `session_participants`, `session_series`.

### Phase 2 — Real-time

15. `conversations`, `conversation_participants`, `messages` (з `body_tsv` generated column).
16. `workout_logs`, `workout_log_exercises`, `workout_log_sets`.
17. Enum (`calendar_provider`), `calendar_integrations`.

### Phase 3 — Business

18. Enums (`package_kind`, `package_status`, `payment_method`, `transaction_status`, `body_metric_type`).
19. `package_templates`, `client_packages`.
20. `transactions`, `withdrawals`.
21. `body_measurements`, `personal_records`.
22. `profile_view_events`, `analytics_cache`, `achievements`.

### Phase 4 — Gamification

23. `canonical_exercises`; alter `exercises` ADD `canonical_exercise_id`.
24. Alter `sessions` ADD `is_trainer_verified`; `workout_log_sets` ADD `is_verified`; `personal_records` ADD `is_verified` + `canonical_exercise_id`.
25. `points_ledger`.
26. `league_tiers` (+ seed 6 tiers per role).
27. `gamification_scores`.
28. `leaderboard_snapshots`.
29. `pricing_insight_aggregates`.

---

## 20. Notes & Open issues

- **Soft delete strategy:** використовуємо `deleted_at` patterns; запити фільтрують через global scope в Eloquent. Для `users` — окремий `deletion_scheduled_at` для GDPR grace period.
- **Multi-currency:** MVP — single currency per trainer (`users.currency`). FX conversion не реалізована — аналітика поазкує per-currency aggregates. Post-MVP можна додати `currency_rates` table.
- **Тимчасові поля `body_tsv`, `estimated_1rm`** — `GENERATED ALWAYS AS ... STORED` для performance (computed once at write).
- **Backups:** PITR через WAL archiving; daily snapshot з retention 30 днів. Окрема таблиця `backup_log` (operational, не application) — TBD.
- **Audit log retention:** 1 рік за default; configurable. Old rows видаляються через scheduled job `AuditLogRetentionJob`.
- **JSONB consistency:** для типізованих JSON-полів (e.g. `notification_preferences`, `tags`) — використовуємо JSON Schema validation на app-рівні (Laravel Validators).
- **Cascade deletion danger:** при hard delete `users` row — пройде CASCADE на `clients (trainer_id)` → `client_packages`, `sessions` (як participant) тощо. Це робиться лише через `HardDeleteScheduledAccountsJob` (AUTH-005); web app interfaces не дозволяють direct DELETE.
- **Connection pooling:** PgBouncer transaction-mode для high-concurrency endpoints (post-MVP).
- **Read replicas:** post-MVP — read-only replicas для analytics queries.
