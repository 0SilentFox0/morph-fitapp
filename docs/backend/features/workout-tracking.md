# Features — Workout Tracking

**Модуль:** Workout Tracking · **Phase:** 2 · **Файлів-сусідів:** `workout-tracking.md` (TBD) (technical)

5 фіч. Real-time двостороння синхронізація логів тренування між тренером і клієнтом під час сесії. Найскладніший модуль системи з точки зору concurrent state.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | WT-001 | Live session lifecycle | full |
| 2 | WT-002 | Workout log entry | full |
| 3 | WT-003 | Real-time sync | full |
| 4 | WT-004 | Offline mode & idempotency | full |
| 5 | WT-005 | Workout history | compact |

---

## 1. Live session lifecycle [WT-001]

**Phase:** 2 · **Стиль:** full

### Контекст

Live workout session — це активний log виконання вправ під час реальної фізичної тренувальної сесії. Один `workout_log` per `session`. Lifecycle:

```
[session: planned]
       │
   (any actor opens session screen with "Start workout" tap)
       │
       ▼
[workout_log created, session: in_progress]
       │
   (sets/reps/weight logged by trainer and/or client during workout)
       │
       ▼
[workout_log.finished_at set, session: completed]
       │
   (post-workout: PRs detected, package decremented, etc.)
```

### User stories

- **US-WT-001** — *Як trainer, я хочу почати workout-сесію в реальному часі, обравши заплановану session у Schedule.*
- **US-WT-002** — *Як client, я хочу побачити "Live workout in progress" на своєму екрані одразу, як тренер почав.*
- **US-WT-003** — *Як trainer, я хочу завершити workout одним тапом, щоб система автоматично перевела status у completed.*
- **US-WT-004** — *Як я (trainer або client) хочу побачити, що інша сторона приєдналась до live-сесії (через presence indicator).*

### User flow + UI mapping

1. **Start:** Trainer (або client) на `SessionDetailScreen` → "Start Workout" button (видна лише для status=planned і часу start_at у межах ±30хв):
2. Frontend → `POST /v1/sessions/{id}/workout-log/start`.
3. Backend:
   - Перевіряє permission (учасник сесії).
   - Перевіряє: `session.status = "planned"` і `session.start_at - 30min <= now() <= session.start_at + 30min` (toleranс).
   - У transaction:
     - Створює `workout_logs` row з `session_id`, `started_by_user_id`, `started_at = now()`.
     - Якщо `session.program_id` IS NOT NULL → копіює `program_exercises` snapshot у `workout_log_exercises` (як planned items).
     - Оновлює `sessions.status = "in_progress"` (через WT-001 transition logic).
   - Dispatch `WorkoutSessionStarted` event → broadcast на `private-session.{id}` (всі учасники).
   - Респонс: `201` з `{ workout_log, session }`.
4. **Live:** обидві сторони subscribed на `private-session.{id}` + `presence-session.{id}` для presence info.
5. **Finish:** `POST /v1/sessions/{id}/workout-log/finish`.
6. Backend:
   - У transaction:
     - `workout_logs.finished_at = now()`, `finished_by_user_id`.
     - `sessions.status = "completed"`.
   - Trigger downstream events:
     - `SessionCompleted` → package decrement ([`SES-007`](sessions.md)).
     - `WorkoutSessionFinished` → PR detection ([`PROG-003`](progress.md)).
   - Respond: `200` з `{ workout_log }`.

### Acceptance criteria

- **AC-1** — *Given* user — учасник session з status `planned` *When* `POST /v1/sessions/{id}/workout-log/start` *Then* `201`; `workout_logs` row created, `sessions.status = "in_progress"`; `WorkoutSessionStarted` event broadcasts.
- **AC-2** — *Given* session з `start_at = now + 2h` *When* attempt start *Then* `422 too_early` (поза toleranсом). UI може показати countdown.
- **AC-3** — *Given* session з status уже `in_progress` *When* attempt start (race) *Then* `409 workout_already_started`; returns existing `workout_log_id`.
- **AC-4** — *Given* session з `program_id` *When* start *Then* `workout_log_exercises` populated з program snapshot.
- **AC-5** — *Given* non-participant *When* try start *Then* `403`.
- **AC-6** — *Given* workout_log з некий `finished_at IS NULL` *When* `POST .../finish` *Then* `200`; status `completed`, package decrement triggered.
- **AC-7** — *Given* workout_log вже finished *When* attempt finish again *Then* `409 workout_already_finished`.
- **AC-8** — *Given* trainer started workout, client subscribed *Then* client отримує `WorkoutSessionStarted` event у межах 1с і UI оновлюється до live view.
- **AC-9** — *Given* trainer і client обидва приєднались до `presence-session.{id}` *Then* кожен бачить присутність іншого (через WS presence info).

### Permissions

| Роль | Start | Finish | View live |
|---|---|---|---|
| Trainer | ✅ свої сесії | ✅ свої | ✅ свої |
| Client | ✅ де participant | ✅ де participant (post-MVP заборонити, наразі дозволено) | ✅ де participant |
| Admin | ✅ (audit) | ✅ (audit) | ✅ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Race start (trainer і client одночасно) | DB level: UNIQUE на `workout_logs.session_id`; виграє один. Other отримує `409 workout_already_started` з `existing_workout_log_id` — клієнт re-fetch'ить state |
| EC-2 | Network connection lost between start і finish | Pre-existing `in_progress` lives forever, поки auto-no-show'нуло (це через `SES-003`). Manual finish можна потім |
| EC-3 | App crashed mid-session, workout залишився in_progress | Користувач переоткриває session — UI показує "Resume live workout"; backend state intact |
| EC-4 | Учасник вийшов з conversation/team по час workout | Permission re-check на кожному POST; якщо втратив доступ — error |
| EC-5 | Trainer finish'ить, але client все ще subscribed і пише set | Backend перевіряє `workout_log.finished_at IS NULL`; якщо finished — `409 workout_finished`. Client UI має react'нути на `WorkoutSessionFinished` event |
| EC-6 | Session group (кілька клієнтів), один із них started | OK; будь-який participant може start. Один `workout_log` per session — спільний для всіх. Кожен log_set має `actor_id` |
| EC-7 | start без `program_id` (ad-hoc workout) | Дозволено: `workout_log_exercises` залишається empty; ходимо ввести exercises вручну (через WT-002) |

### Зв'язок з технічною спекою

- API: `workout-tracking.md` (TBD) § `POST /sessions/{id}/workout-log/start`, `POST /sessions/{id}/workout-log/finish`, `GET /sessions/{id}/workout-log` (current state)
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `workout_logs` (з `session_id` UNIQUE, `started_at`, `started_by_user_id`, `finished_at`, `finished_by_user_id`); `workout_log_exercises` (snapshot from program_exercises на start)
- Events: `WorkoutSessionStarted`, `WorkoutSessionFinished` (broadcast on `private-session.{id}`)
- Listeners: `TransitionSessionToInProgressListener`, `TransitionSessionToCompletedListener`, `DetectPersonalRecordsOnFinishListener`

---

## 2. Workout log entry [WT-002]

**Phase:** 2 · **Стиль:** full

### Контекст

Запис фактично виконаного set'а: `exercise_id`, `set_index`, `reps`, `weight_kg`, `rest_seconds`, `performed_at`, `actor_id`, `version`. Обидва учасники можуть писати — кожен set має actor. Поправки до set'у — це нові entries з тим самим `set_index` (через UPSERT з `version`).

### User stories

- **US-WT-005** — *Як trainer, я хочу залогувати виконаний set під час workout (reps, weight).*
- **US-WT-006** — *Як client, я хочу залогувати свій set самостійно.*
- **US-WT-007** — *Як user, я хочу виправити заздалегідь введений set, якщо помилився.*
- **US-WT-008** — *Як user, я хочу додати unplanned exercise під час workout (не з програми).*

### User flow + UI mapping

1. **Add set:** на `LiveWorkoutScreen.tsx` user тапає "+ Set" на exercise card → modal input `{ reps, weight_kg, rest_seconds? }` → submit.
2. Frontend → `POST /v1/workout-logs/{wl_id}/sets` з `Idempotency-Key` header, body `{ exercise_id, set_index, reps, weight_kg, rest_seconds?, client_uuid }`.
3. Backend:
   - Permission: учасник session.
   - State: `workout_log.finished_at IS NULL`.
   - UPSERT за `(workout_log_id, client_uuid)` — захищає від duplicate з retry.
   - Якщо row існував для цього `client_uuid` — це UPDATE.
   - Якщо ні — INSERT з incremented `version` (per workout_log).
   - Set `actor_id = auth()->id()`, `performed_at = now()`.
   - Dispatch `WorkoutLogSetCreated` або `WorkoutLogSetUpdated`.
   - Респонс: `200` або `201` з `{ set }`.
4. **Edit:** довге нажаття на set → modal → submit → той самий endpoint з тим самим `client_uuid` (frontend memo'ує).
5. **Delete:** swipe-left → `DELETE /v1/workout-log-sets/{id}` → `deleted_at = now()` (soft); Dispatch `WorkoutLogSetDeleted`.
6. **Add ad-hoc exercise:** user обирає exercise з library → frontend `POST /v1/workout-logs/{wl_id}/exercises` з `{ exercise_id, order }` → `workout_log_exercises` row appears.

### Acceptance criteria

- **AC-1** — *Given* active workout_log і valid set body *When* `POST /v1/workout-logs/{id}/sets` *Then* `201` з `{ set }` (з `actor_id = auth()`).
- **AC-2** — *Given* той самий `client_uuid` *When* repeat POST *Then* `200` UPDATE з тим самим `id`, version incremented.
- **AC-3** — *Given* workout_log finished *Then* `409 workout_finished` на будь-який POST.
- **AC-4** — *Given* invalid values (negative reps, weight > 1000) *Then* `422` зі специфічним полем.
- **AC-5** — *Given* attempt на чужий workout_log *Then* `403`.
- **AC-6** — *Given* video `WorkoutLogSetCreated` *Then* event broadcasts on `private-session.{session_id}` з payload `{ set, actor_id, version }`.
- **AC-7** — *Given* `DELETE /v1/workout-log-sets/{id}` *Then* `200`, `deleted_at` set; event `WorkoutLogSetDeleted` broadcasts.
- **AC-8** — *Given* sets для unplanned exercise (exercise НЕ в `workout_log_exercises`) *Then* auto-create exercise в `workout_log_exercises` з order = max+1.
- **AC-9** — *Given* set marked PR за результатом *Then* `PersonalRecordSet` event надсилається (через [`PROG-003`](progress.md)).

### Permissions

| Роль | Add/edit own sets | Add/edit other's sets | Delete |
|---|---|---|---|
| Trainer (in active workout) | ✅ свої та клієнтські | ✅ | ✅ |
| Client (in active workout) | ✅ свої | ❌ (post-MVP) | ✅ власні |
| Admin | ✅ (audit) | ✅ (audit) | ✅ (audit) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Концurrent UPSERT на той самий `client_uuid` від 2 sources | DB UNIQUE на `(workout_log_id, client_uuid)`; одна transaction виграє, інша get 409. Idempotency через `Idempotency-Key` |
| EC-2 | Client пише set, потім offline на 5хв, потім resend з тим самим uuid | Idempotent UPSERT повертає той самий result (version вже incremented) |
| EC-3 | Trainer і client одночасно correct same set (різні clients_uuid) | Це різні UPSERT — кожен створює свій row з conflict resolution per `(exercise_id, set_index)` — last-write-wins (через timestamp + version) у WT-003 |
| EC-4 | Set з `reps = 0` (failed attempt) | Дозволено; aslong як `set_index` and `exercise_id` valid |
| EC-5 | Set з `weight_kg = 0` (bodyweight exercise) | Дозволено |
| EC-6 | User видалив set що був marked PR | Soft delete; PR recomputed (next best set, or PR removed). Через PR-recompute listener |
| EC-7 | Set count > 100 per exercise per workout | Дозволено; rare edge case |

### Зв'язок з технічною спекою

- API: `workout-tracking.md` (TBD) § `POST /workout-logs/{id}/sets`, `PATCH /workout-log-sets/{id}` (alias на UPSERT), `DELETE /workout-log-sets/{id}`, `POST /workout-logs/{id}/exercises` (ad-hoc)
- DB: `workout_log_sets` (з `workout_log_id` FK CASCADE, `workout_log_exercise_id` FK, `set_index`, `reps`, `weight_kg numeric`, `rest_seconds`, `performed_at`, `actor_id`, `client_uuid UUID UNIQUE per workout_log`, `version int`, `deleted_at`)
- UNIQUE: `(workout_log_id, client_uuid)` для idempotency
- Events: `WorkoutLogSetCreated`, `WorkoutLogSetUpdated`, `WorkoutLogSetDeleted`
- Listeners: `DetectPRListener` (в [`PROG-003`](progress.md)), `RecomputePROnDeleteListener`

---

## 3. Real-time sync [WT-003]

**Phase:** 2 · **Стиль:** full

### Контекст

Канал `private-session.{id}` доступний всім учасникам сесії на час workout. Кожен mutation генерує event з payload, що дозволяє іншим клієнтам атомарно apply'нути зміну локально. Conflict-resolution за версією + timestamp.

### User stories

- **US-WT-009** — *Як user, я хочу бачити sets, які інша сторона запісує, в реальному часі без refresh.*
- **US-WT-010** — *Як system, я хочу гарантувати, що concurrent updates не призводять до lost updates.*
- **US-WT-011** — *Як user, я хочу побачити "Trainer is typing weight..." (typing indicator для set inputs — post-MVP).*

### Events specification

| Event | Канал | Payload | Trigger |
|---|---|---|---|
| `WorkoutSessionStarted` | `private-session.{id}` | `{ workout_log, session }` | WT-001 start |
| `WorkoutSessionFinished` | `private-session.{id}` | `{ workout_log }` | WT-001 finish |
| `WorkoutLogSetCreated` | `private-session.{id}` | `{ set: {...}, actor_id, version }` | WT-002 INSERT |
| `WorkoutLogSetUpdated` | `private-session.{id}` | `{ set: {...}, actor_id, version, previous_version }` | WT-002 UPDATE |
| `WorkoutLogSetDeleted` | `private-session.{id}` | `{ set_id, actor_id }` | WT-002 DELETE |
| `WorkoutLogExerciseAdded` | `private-session.{id}` | `{ workout_log_exercise: {...} }` | WT-002 ad-hoc exercise |

### Conflict resolution

Семантика: **last-write-wins** на рівні `(workout_log_id, exercise_id, set_index)`.

Клієнт зберігає remote `version` per set. При застосуванні події:

1. Якщо `event.version > local.version` → apply (overwrite local).
2. Якщо `event.version == local.version` → no-op (echo of own write).
3. Якщо `event.version < local.version` → ignore (stale event).

Версіонування: `workout_log.last_version` AUTO-incremented per mutation; кожен set's `version` = новий `workout_log.last_version`.

### Acceptance criteria

- **AC-1** — *Given* trainer і client subscribed на `private-session.{id}` *When* trainer adds set *Then* client отримує `WorkoutLogSetCreated` event протягом 1с з повним payload set'а.
- **AC-2** — *Given* trainer і client одночасно update'ять той самий set (different `client_uuid` per same `exercise/set_index`) *Then* останній UPSERT'ом гасить попередній; всі учасники конвергують до останнього стану через events.
- **AC-3** — *Given* WS connection lost для одного учасника *When* він reconnect'нувся *Then* пише `GET /v1/workout-logs/{id}` → отримує current state з версією; sync resumed.
- **AC-4** — *Given* set updated *Then* event містить `version` (monotonic per workout_log); клієнт ignore'ує events з `version <= local`.
- **AC-5** — *Given* trainer не учасник session *When* attempt subscribe на `private-session.{id}` *Then* WS auth fails з 403.
- **AC-6** — *Given* presence info *When* trainer і client активні *Then* кожен бачить `presence-session.{id}.users` content.

### Permissions

| Роль | Subscribe | Listen all events |
|---|---|---|
| Participant | ✅ | ✅ |
| Non-participant | ❌ | ❌ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Reverb server restart during workout | Client retries з exponential backoff; на reconnect — `GET /workout-log/{id}` recovers state |
| EC-2 | Slow client (mobile network) пропускає 50 events | На reconnect — re-fetch full state замість replay (simplicity > efficiency у MVP) |
| EC-3 | Trainer і client мають дуже різні `last_known_version` | Re-fetch після reconnect; conflict resolution per set automatic |
| EC-4 | Event ordering — broadcast latency різниться | Cliеnt використовує `version` як sole truth, не порядок отримання |
| EC-5 | Late-arriving event після finish | Post-finish events ignored (`workout_log.finished_at IS NOT NULL`); UI freezes state |
| EC-6 | Cross-session event (trainer subscribed на 2 sessions через bug) | Channel auth per session — ізоляція гарантована |

### Зв'язок з технічною спекою

- API: Реверб broadcasting через `php artisan reverb:start`; auth у `routes/channels.php` для `private-session.{id}` — перевіряє participant
- DB: `workout_logs.last_version int` (incremented в transaction із кожним set CRUD)
- Events: usе `ShouldBroadcastNow` (для immediacy) + `ShouldBroadcastAfterCommit` (для consistency з DB transaction)
- Reverb scaling: cluster через Redis pub/sub між Reverb instances

---

## 4. Offline mode & idempotency [WT-004]

**Phase:** 2 · **Стиль:** full

### Контекст

Mobile client має offline-first storage (наприклад, SQLite через Expo SQLite або AsyncStorage). Користувач continue логуванням навіть без інтернету. Frontend генерує `client_uuid` per set локально, queue'ить mutations, sync'ить коли інтернет повертається.

Backend гарантує idempotency через:
1. `client_uuid` UNIQUE per workout_log → UPSERT повертає той самий record.
2. `Idempotency-Key` header → cached response 24h у Redis.

### User stories

- **US-WT-012** — *Як user, я хочу продовжити логувати workout навіть якщо інтернет пропав у залі.*
- **US-WT-013** — *Як user, я хочу, щоб всі мої offline-логи синхронізувалися автоматично, коли інтернет повернеться.*
- **US-WT-014** — *Як system, я хочу гарантувати, що retry не створить duplicate-entries при поверненні онлайн.*

### Mobile-side flow (informational, не backend's обов'язок)

1. Local DB зберігає `workout_log_sets` queue з `client_uuid`, `synced: bool`.
2. Background sync (network reachability listener) → POST'ить unsynced.
3. На server response — mark як `synced = true`.
4. Conflict resolution на client теж — applies WT-003 logic локально.

### Acceptance criteria (backend)

- **AC-1** — *Given* same `client_uuid` + same `Idempotency-Key` repeated 5 times *Then* лише один INSERT у DB; всі responses identical.
- **AC-2** — *Given* `client_uuid` reused, але body different (e.g. reps було 5, тепер 6) *Then* UPDATE; `version` incremented; `WorkoutLogSetUpdated` event.
- **AC-3** — *Given* user offline на 30хв і має 20 queued mutations *When* online *Then* послідовний POST усіх — backend обробляє кожен в order; final state correct.
- **AC-4** — *Given* послідовно надсилаються `add → update → delete` для одного set'у *Then* фінальний стан = deleted; intermediate events broadcasted коректно.
- **AC-5** — *Given* `Idempotency-Key` Redis store missing entry (TTL expired) *When* repeat *Then* second request створює duplicate? **Ні** — DB UNIQUE на `client_uuid` захищає (повертає UPSERT).
- **AC-6** — *Given* clock skew — client's `performed_at` у майбутньому *Then* backend overrides з `now()` (захист від tampering).

### Permissions

— Same as WT-002.

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Client crashed mid-sync (5 з 20 mutations applied) | DB має 5 нових records; client при relaunch продовжує queue з 6-го (через `synced` field locally) |
| EC-2 | Client and server diverge on `version` numbers | Backend always source of truth; client має re-fetch на mismatch detected |
| EC-3 | Двоє clients (mobile + tablet) того ж user'а офлайн з різними логами | На sync — UPSERT each по `client_uuid`; різні uuids → різні rows; може створити duplicate set'и → user сам видаляє через WT-002 DELETE |
| EC-4 | Session ended за час offline-логування | На sync — backend returns `409 workout_finished`; client showsuser "Workout ended, your logs were lost" — або вирішує merge'нути як post-completion edits (post-MVP) |
| EC-5 | `Idempotency-Key` collision між users | Namespace'ється per user через middleware: `idem:{user_id}:{key}`; collision impossible |

### Зв'язок з технічною спекою

- API: Header `Idempotency-Key` (64-char max) on POST endpoints у WT-002
- DB: `client_uuid` UNIQUE per workout_log; `Idempotency-Key` stored у Redis (TTL 24h) with response cache
- Service: `IdempotencyMiddleware` для глобальної обробки header'а

---

## 5. Workout history [WT-005]

**Phase:** 2 · **Стиль:** compact

### Контекст

Перегляд минулих completed workout logs — для тренера (view client's history), для клієнта (свої own).

### User stories

- **US-WT-015** — *Як trainer, я хочу подивитися історію тренувань клієнта (фільтри: date range, exercise).*
- **US-WT-016** — *Як client, я хочу бачити свою workout history з прогресом по конкретній вправі.*

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `GET /v1/clients/{id}/workout-logs?from=&to=&exercise_id=&cursor=` *Then* `200` з cursor-paginated list, фільтри.
- **AC-2** — *Given* client *When* `GET /v1/me/workout-logs?from=&to=&cursor=` *Then* `200` з своїми завершеними workouts.
- **AC-3** — *Given* `GET /v1/workout-logs/{id}` для свого/клієнтського workout *Then* `200` з detail включно з sets, exercises.
- **AC-4** — *Given* finished workout *Then* response має aggregations: `total_volume_kg` (sum of weight × reps), `duration_min`, `total_sets`.

### Permissions

| Роль | Read own | Read client's |
|---|---|---|
| Trainer | ✅ | ✅ для свого roster |
| Client | ✅ | ❌ (свого тренера workout — теж ні) |
| Admin | ✅ | ✅ |

### Edge cases

- **EC-1** — Дуже довгий history (1000+ workouts) — pagination обов'язкова; cursor через `(finished_at, id)`.
- **EC-2** — Filter `exercise_id` — JOIN з `workout_log_sets WHERE exercise_id = X`; повертає workouts, які мали цю exercise.

### Технічна спека

- API: `workout-tracking.md` (TBD) § `GET /clients/{id}/workout-logs`, `GET /me/workout-logs`, `GET /workout-logs/{id}`
- DB: queries з aggregation; cache можна додати на per-workout summary (post-MVP)

---

## Залежності модуля Workout Tracking

- **Залежить від:** Auth, Users, Sessions (workout = log per session), Exercises (log items reference exercises), Programs (через session.program_id для exercise snapshot), Reverb (broadcasting).
- **Залежать від нього:** Progress (PR detection), Analytics (workouts count), Packages (decrement on finish).
