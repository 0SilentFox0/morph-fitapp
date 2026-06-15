# Backend Integration Changes — driven by frontend P0 wiring

> **Purpose:** as the RN frontend is wired from "UI-театр" (local-only writes) to the live API
> (plan: `~/.claude/plans/elegant-plotting-jellyfish.md`, VoC: `docs/ux/2026-06-15-voice-of-customer-trainer-client.md`),
> this file lists the **backend (PHP/Laravel) contract the frontend now depends on**. Update the
> backend to match each section. Contracts are expressed against the Zod schemas in
> `src/schemas/api/models.ts` (single source of truth) and the input shapes in `src/services/api/*`.
>
> Conventions: prefix `/v1`, Sanctum bearer, envelope `{data}` / `{data:[],meta}`, ISO-8601 UTC dates,
> UUID ids. POST/PATCH carry an `Idempotency-Key` header (frontend sends it automatically — make
> mutations idempotent on it).
>
> Status legend: ✅ endpoint already live & shape OK · ⚠️ live but verify/adjust shape · ❌ to implement.

---

## P0.1 — Create Transaction (`POST /v1/transactions`)  ⚠️ verify

Wired in `src/services/repositories/transactionsRepository.ts` → `transactionsApi.createTransaction`.
Frontend sends `TransactionInput` (`src/services/api/transactions.ts`):

```jsonc
{
  "amount": 50,                 // number > 0 (frontend validates)
  "currency": "USD",            // from authenticated user's currency
  "method": "card",             // enum: cash | transfer | card | other
  "status": "paid",             // enum: paid | pending | canceled  (UI "completed" → "paid")
  "paid_at": "2026-06-15T10:00:00.000Z",
  "note": "Bob"                 // currently carries the free-text client name (see limitation)
}
```

Response: `{ data: Transaction }` exactly per `TransactionSchema` (`models.ts:290`).

**Backend actions / gaps:**
- Confirm `POST /v1/transactions` accepts the above and returns `TransactionSchema` unchanged.
- **Known frontend limitation (no backend action required yet):** there is no client picker, so
  `client_id` is **not** sent and the client name is stored in `note`. When the picker lands the
  frontend will send `client_id` instead — keep `note` free-text.
- **Future field (not sent yet):** UI distinguishes `Training` vs `Subscription` (`type`), but
  `TransactionSchema` has no `type` column. If revenue-split analytics (B5) needs it server-side,
  add `transactions.type enum('training','subscription')`; otherwise split is derived from
  `client_package_id` (B5).

---

## P0.2 — Create / Update Session (`POST /v1/sessions`, `PUT /v1/sessions/{id}`)  ⚠️ verify

Wired in `src/services/repositories/sessionsRepository.ts` → `sessionsApi.createSession/updateSession`.
Frontend sends `SessionInput` (`src/services/api/sessions.ts`):

```jsonc
{
  "title": "Morning session",
  "type": "Cardio",                       // free string (UI training type label)
  "start_at": "2026-06-15T08:30:00.000Z", // merged date + time picker
  "end_at": "2026-06-15T09:30:00.000Z",   // start + 60 min default (no duration field in UI yet)
  "program_id": "<uuid>"                  // OMITTED unless a real UUID (mock program ids dropped)
}
```

Response: `{ data: Session }` per `SessionSchema` (`models.ts:160`), `status` defaulting to `planned`.

**Backend actions / gaps:**
- Confirm create/update accept a session with **no participants and no program** (frontend omits
  `client_ids` until a real client picker exists, and omits non-UUID `program_id`). The trainer's
  own session must be creatable standalone.
- Accept arbitrary `type` strings (UI training-type labels) OR document the allowed set so the
  frontend can map. Currently sent verbatim.
- `end_at` is always `start_at + 60min` until the UI grows a duration field — fine as-is.
- **Sequencing note:** session list/detail is still mock on the frontend (migrates in P1.1). Until
  then, `PUT /sessions/{id}` may be called with a **local (non-server) id** for sessions that came
  from seed data — those edits will 404 server-side, which is acceptable transitional behavior. Once
  P1.1 loads sessions from `GET /v1/sessions`, ids will be real. No backend action needed; just be
  aware update is only meaningful for sessions created via the live API.

---

## P0.3 — Workout logging pipeline (`/v1/sessions/{id}/workout`, `/workout-logs/*`)  ⚠️ verify, dormant

Wired in `src/services/repositories/workoutsRepository.ts` and the active-training store
(`beginServerWorkout`/`finishServerWorkout`, `workoutLogId`). The pipeline is:

```
POST /v1/sessions/{sessionId}/workout            → { data: WorkoutLog }      (start, returns log id)
POST /v1/workout-logs/{logId}/exercises          → { data: WorkoutLogExercise }
POST /v1/workout-logs/{logId}/sets               → { data: WorkoutLogSet }
POST /v1/workout-logs/{logId}/finish             → { data: WorkoutLog }
```

`LogSetInput` (`src/services/api/workouts.ts`): `{ workout_log_exercise_id, exercise_id, set_index,
reps, weight_kg, rest_seconds?, client_uuid }` — all UUIDs are **server** ids. Reps/weight are
clamped to ≥0 on the client.

**Backend actions / gaps:**
- Confirm the four endpoints accept/return exactly `WorkoutLogSchema` / `WorkoutLogExerciseSchema` /
  `WorkoutLogSetSchema` (`models.ts:198–233`).
- **Hard dependency (no backend action, just awareness):** this pipeline is **dormant** until the
  frontend has real ids — a server **session UUID** (from P1.1 sessions API), real **exercise UUIDs**
  (from programs API), and real **client UUIDs**. The store only calls `startWorkout` when the active
  session id is a UUID, so today nothing fires and the local summary flow is unchanged. When P1.1
  lands, `beginServerWorkout(sessionId)` must be invoked at session start (ClientProfile / start-training)
  and `logSet` on each confirmed set.
- `finishWorkout` is already wired into the Training Summary "Done" button (guarded; no-op when no log
  is open). It must be idempotent and tolerate being called once per log.

---

## P0.4 — Create / Update Client (`POST /v1/clients`, `PUT /v1/clients/{id}`)  ⚠️ verify

Wired in `src/services/clientsService.ts` (`createClient`/`updateClient`/`buildClientInput`), new
`AddEditClientScreen`, "+" button on the clients list, and the list refetches on focus.

Frontend sends `ClientInput` (`src/services/api/clients.ts`):

```jsonc
{
  "name": "Bob",
  "type": "personal",     // enum: personal | group | online
  "email": "b@x.io",      // omitted when blank
  "phone": "+380...",     // omitted when blank
  "notes": "..."          // omitted when blank
}
```

Response: `{ data: Client }` per `ClientSchema`. Edit mode prefetches via `GET /v1/clients/{id}`.

**Backend actions / gaps:**
- Confirm `POST`/`PUT` accept `ClientInput` and return `ClientSchema`; `GET /clients/{id}` returns
  `email`, `phone`, `notes`, `type`, `tags` for edit prefill.
- New client must appear in `GET /clients` immediately (list refetches on focus).
- `tags` are not collected in the UI yet (no `tags` field sent); keep optional.

---

## P0.5 — Chat repository groundwork (`/v1/conversations/*`)  ❌ blocked, flag `false`

Wired in `src/services/repositories/chatRepository.ts` (adapters + `loadConversations`/`loadMessages`/
`sendMessage` behind `apiReadiness.chat`, which stays **`false`**). Screens still use the mock store;
the repository centralizes the API path so list + thread flip atomically when the flag flips (P3 / B6).

**Backend gaps that must be closed before flipping `chat` to `true`:**
- `ConversationParticipantSchema` (`models.ts:277`) has only `user_id` + `last_read_at` — **no name or
  avatar**. The list row cannot show who the conversation is with. **Embed a participant summary**
  (`{ user_id, name, avatar_url }`) in the conversation payload, or expose a batch user-lookup.
- `MessageSchema` (`models.ts:267`) has no per-message **delivery status** (sent/delivered/read); the
  UI defaults to `'sent'`. If receipts are desired, add status or derive from `last_read_at`.
- Real-time (B6) — `MessageSent` / `MessageRead` / typing events on `private-conversation.{id}` — must
  be live so the thread updates without polling.
- Confirm `POST /v1/conversations` is get-or-create and `POST /v1/conversations/{id}/read` exists.

Until the above ship, keep `apiReadiness.chat = false`.

---

## P0.6 — Edit Profile (`PUT /v1/me`)  ⚠️ verify

Wired in `src/services/usersService.ts` (`buildProfileInput`/`updateProfile`), new `EditProfileScreen`,
the Profile pencil now navigates there. On save: `PUT /me` → `authStore.refreshProfile()` (`GET /me`).

Frontend sends `UpdateProfileInput` (`src/services/api/users.ts`): `{ name, experience?,
training_types?, client_types?, locations? }`. Response: `{ data: User }` per `UserSchema`.

**Backend actions / gaps:**
- Confirm `PUT /v1/me` accepts a partial `UpdateProfileInput` and returns the full `UserSchema`.
- The Profile screen currently still reads display data from the local onboarding store; the edit
  writes to both backend and that store. Full backend-authoritative profile display is folded into
  P0.7 / the onboarding-persistence work below.

---

## P0.7 — Onboarding publish (`PUT /v1/me` + `POST /v1/me/onboarding/complete`)  ❌ partial

See section **B8** below — this is the same backend work. P0.7 makes `submitOnboardingProfile` perform
a real `PUT /me` instead of a `setTimeout` mock, and stops wiping the profile after completion.

---

## B8 — Persist onboarding completion (`POST /v1/me/onboarding/complete`)  ❌ to implement

The frontend (`authStore.ts:65`) explicitly notes `/me/onboarding/complete` is **not deployed**, so
`isOnboarded` can't be backend-authoritative and a destructive local reset is avoided.

**Backend actions:**
- Implement `POST /v1/me/onboarding/complete` → sets `users.onboarding_completed_at = now()`, returns
  `{ data: User }`. Return `onboarding_completed_at` in `GET /me`.
- Once live, the frontend will (a) call it at the end of onboarding, (b) re-enable the logout reset in
  `authStore`, and (c) flip the Profile screen to read from the backend user.

---

## P1.1 — Stores load from the API (remove seed for new accounts)

Migrating the in-memory seeded stores to async API loads (empty start → real,
possibly-empty list). First store done: **programs**.

### Programs — DONE (`GET /v1/programs`)  ⚠️ field gaps
`programsRepository.loadPrograms` → `programsApi.listPrograms` → `apiProgramToUi`; the
store starts empty and loads once (guarded), Home carousel + SessionForm picker + Library
all trigger it. Library shows loading/error/empty via `AsyncBoundary`.

**Backend field gaps** (frontend derives/omits for now — add these to make the library faithful):
- **No `tag`/category** on `Program` — frontend derives a tag from `difficulty`
  (`beginner`/`intermediate`/`advanced`). Add a real category/tag field if programs should
  be grouped by training type.
- **No cover image** — `ProgramInput` accepts `cover_file_id`, but `ProgramSchema` returns no
  resolved `thumbnail`/`cover_url`. Add a resolved cover URL to the response.
- **No `price`** — the card shows a price ("$5/month"); there is no price field. Add one if
  programs are monetized, else the UI drops it.
- Full exercise mapping (API count-based `sets` vs UI set arrays + catalog join) is deferred;
  the list only needs `exercises.length`.

### Remaining stores — NOT migrated yet (blocked / larger refactor)
- **sessions** — needs a UI date-model rework: the UI `Session` uses `'Today'`/`'Tomorrow'`
  display strings and a 3-value status (`pending|completed|canceled`), while the API uses ISO
  `start_at`/`end_at` and `planned|in_progress|completed|canceled|no_show`. Migrating requires
  adapting both. (Trainer `GET /sessions` exists; client-as-participant listing does not — see below.)
- **trainers** — **no backend endpoint exists** for a trainer catalog or discovery; the
  `Trainer` model is frontend-only. Blocked on **B2** (`GET /v1/trainers`, `TrainerPublic`).
- **measurements / training history / client sessions** — these are **client-facing** screens, but
  the APIs are **trainer-centric** (`/clients/{clientId}/measurements`, `/sessions` by trainer).
  There are **no client-self endpoints**. **Backend gap:** add self-scoped endpoints —
  `GET /v1/me/measurements`, `POST /v1/me/measurements`, `GET /v1/me/workout-logs` (training
  history), `GET /v1/me/sessions` (sessions where I'm a participant). Until these exist, client
  progress/measurements stay on mock.

---

## Cross-cutting (applies to every P0 slice)

- **Idempotency:** every `POST`/`PATCH` carries `Idempotency-Key`; a retried mutation (e.g. after
  token refresh) must be recognized as the same operation, not duplicated.
- **Errors, not silence:** the frontend now shows inline errors and does **not** navigate to a
  success screen unless the write resolves. Return precise `422` field errors (the client maps
  `ApiError.fieldErrors`) and meaningful 4xx/5xx — the user sees them.
- **Empty for new accounts:** the frontend is removing seed mocks for fresh accounts (P1.1), so list
  endpoints must return real (possibly empty) collections for a brand-new trainer/client.

---

*(Append a new section per wired slice: P0.3 Workouts, P0.4 Clients, P0.5 Chat, P0.6 Profile,
P0.7 Onboarding — and later P1/P2/P3 backend contracts B1–B8.)*
