# Features — Progress Metrics

**Модуль:** Progress Metrics · **Phase:** 3 · **Файлів-сусідів:** [`../progress.md`](../progress.md) (technical)

4 фічі. Tracking фізичного прогресу клієнтів — вимірювання тіла, графіки, автоматичні Personal Records з workout log, експорт.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | PROG-001 | Body measurements | compact |
| 2 | PROG-002 | Progress charts | compact |
| 3 | PROG-003 | Personal Records & 1RM auto-detect | full |
| 4 | PROG-004 | CSV export | compact |

---

## 1. Body measurements [PROG-001]

**Phase:** 3 · **Стиль:** compact

### Контекст

Логування фізичних параметрів клієнта в часі. Підтримує: `weight`, `height`, `body_fat_percent` + обміри (`chest`, `waist`, `hips`, `biceps`, `thigh`). Кожен запис = окрема row у `body_measurements` (long format), що дозволяє time-series queries.

### User stories

- **US-PROG-001** — *Як trainer, я хочу зафіксувати поточні параметри клієнта (вага, обміри).*
- **US-PROG-002** — *Як client, я хочу самостійно логувати свої вимірювання.*
- **US-PROG-003** — *Як user, я хочу побачити історію вимірювань по конкретному параметру.*

### Acceptance criteria

- **AC-1** — *Given* trainer і свій client *When* `POST /v1/clients/{id}/body-measurements` з `{ metric_type: "weight", value: 75.5, unit: "kg", measured_at }` *Then* `201`.
- **AC-2** — *Given* client *When* `POST /v1/me/body-measurements` з тим же body *Then* `201`.
- **AC-3** — *Given* invalid `metric_type` (not in enum) *Then* `422`.
- **AC-4** — *Given* `value` outside reasonable range (e.g. `weight > 500 kg`, `height > 300 cm`, `body_fat_percent` > 70) *Then* `422 value_out_of_range`.
- **AC-5** — *Given* unit mismatch (e.g. `metric_type: weight, unit: cm`) *Then* `422`.
- **AC-6** — *Given* trainer *When* `GET /v1/clients/{id}/body-measurements?metric_type=weight&from=&to=&cursor=` *Then* `200` з cursor-paginated history.
- **AC-7** — *Given* трендер *When* `PATCH /v1/body-measurements/{id}` (виправити помилку) *Then* `200`.
- **AC-8** — *Given* `DELETE /v1/body-measurements/{id}` *Then* `200` (soft).

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ write/read для свого client'а |
| Client | ✅ write/read свої own |
| Stranger | ❌ |
| Admin | ✅ |

### Edge cases

- **EC-1** — Концurrent write (тренер і client одночасно логуть weight) — дві окремі rows (timestamps different); UI може показати "duplicated entry" warning, але це не error.
- **EC-2** — Units: per-metric whitelist. weight: kg/lb. height: cm/in. measurements (chest/waist/etc.): cm/in. body_fat_percent: %.
- **EC-3** — Backend завжди зберігає у consistent units (SI: kg, cm); frontend конвертує перед запитом і назад на основі user settings.

### Технічна спека

- API: [`../progress.md`](../progress.md) § `POST /clients/{id}/body-measurements`, `POST /me/body-measurements`, `GET /clients/{id}/body-measurements?metric_type=&from=&to=&cursor=`, `GET /me/body-measurements`, `PATCH /body-measurements/{id}`, `DELETE /body-measurements/{id}`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `body_measurements` (long format: `client_id`, `metric_type enum: weight|height|body_fat_percent|chest|waist|hips|biceps|thigh`, `value numeric(7,2)`, `unit varchar(8)`, `measured_at`, `recorded_by_user_id`, `deleted_at`)
- Index: `(client_id, metric_type, measured_at DESC)`
- Events: `BodyMeasurementRecorded`, `BodyMeasurementUpdated`, `BodyMeasurementDeleted`

---

## 2. Progress charts [PROG-002]

**Phase:** 3 · **Стиль:** compact

### Контекст

Time-series charts per metric. Backend агрегує (downsamples для довгих періодів, наприклад per-week у year-view) і повертає `{ date, value }` arrays для frontend's chart rendering.

### User stories

- **US-PROG-004** — *Як trainer, я хочу побачити графік ваги клієнта за останні 3 місяці.*
- **US-PROG-005** — *Як client, я хочу побачити свій прогрес weight loss у графіку.*

### Acceptance criteria

- **AC-1** — *Given* trainer і свій client *When* `GET /v1/clients/{id}/body-measurements/chart?metric_type=weight&from=&to=&granularity=day` *Then* `200` з array `[{ date, value, unit }]`. `granularity` ∈ `day|week|month`.
- **AC-2** — *Given* range > 90 днів і `granularity=day` *Then* response auto-downsamples до weekly aggregate (avoid client lag); warning у response `granularity_adjusted_to: "week"`.
- **AC-3** — *Given* без вимірювань у періоді *Then* `200` з `data: []`.
- **AC-4** — *Given* missing days *Then* response містить тільки existing measurements, NOT interpolated; frontend сам gap-fillit.
- **AC-5** — *Given* range > 2 роки *Then* `422 range_too_wide`.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ для свого client'а |
| Client | ✅ свої |
| Admin | ✅ |

### Edge cases

- **EC-1** — Multiple measurements per day — aggregation default: average; для weight — last value of day; configurable.
- **EC-2** — Cache: per `(client_id, metric_type, from, to, granularity)` — TTL 5 хв; invalidate на `BodyMeasurementRecorded` event.

### Технічна спека

- API: `GET /v1/clients/{id}/body-measurements/chart`, `GET /v1/me/body-measurements/chart`
- DB: query з `date_trunc(granularity, measured_at)` + `AVG/LAST(value)`; aggregate cache layer (Redis)

---

## 3. Personal Records & 1RM auto-detect [PROG-003]

**Phase:** 3 · **Стиль:** full

### Контекст

Автоматичне виявлення PR (Personal Record) з workout log entries. PR — це найкращий результат користувача на конкретній вправі: `max weight × reps` АБО `max estimated_1RM`. **1RM (one-rep max)** — теоретична максимальна вага на одне повторення, обчислена за формулою Epley:

```
1RM = weight × (1 + reps / 30)
```

При кожному `WorkoutLogSetCreated` event (з [`WT-002`](workout-tracking.md)) → listener перевіряє, чи це new PR. Якщо так — UPSERT у `personal_records` + push notification "🏆 New PR!". При delete'у set'у — recompute PR.

### User stories

- **US-PROG-006** — *Як user (trainer or client), я хочу автоматично отримати рекорд "Best at exercise X", без manual entry.*
- **US-PROG-007** — *Як client, я хочу отримати push, коли встановив новий PR.*
- **US-PROG-008** — *Як trainer, я хочу бачити PRs клієнта в одному списку для motivation tracking.*

### User flow + UI mapping

1. Під час workout (WT-002) → user додає set → backend dispatches `WorkoutLogSetCreated` event.
2. Listener `DetectPRListener`:
   - Завантажує set: `exercise_id`, `weight_kg`, `reps`.
   - Обчислює `estimated_1rm = weight_kg × (1 + reps / 30)`.
   - SELECT поточний PR (з `personal_records` для `(client_id, exercise_id)`).
   - Якщо немає PR АБО `estimated_1rm > existing.estimated_1rm` АБО (`estimated_1rm == existing AND weight_kg > existing.weight_kg`) — це new PR:
     - UPSERT `personal_records` row.
     - Set `workout_log_sets.is_pr = true`.
     - Dispatch `PersonalRecordSet` event → push до client (і trainer'а).
3. **Delete recompute:** на `WorkoutLogSetDeleted` event → listener `RecomputePROnDeleteListener`:
   - SELECT поточний PR for `(client_id, exercise_id)`.
   - Якщо deleted set was the PR → SELECT next-best з `workout_log_sets WHERE deleted_at IS NULL` → upsert або delete PR row.
4. **Listing:** `GET /v1/clients/{id}/personal-records` → list PRs з detail (when achieved, in which session).

### Acceptance criteria

- **AC-1** — *Given* client without PR for exercise *When* logs set `{ weight: 100, reps: 5 }` *Then* PR created: `weight=100`, `reps=5`, `estimated_1rm=116.67`. Push send'ить.
- **AC-2** — *Given* existing PR weight=100, reps=5 (1RM≈116) *When* user logs `weight=80, reps=10` (1RM≈106) *Then* NOT new PR (lower 1RM).
- **AC-3** — *Given* existing PR weight=100, reps=5 (1RM≈116) *When* user logs `weight=110, reps=4` (1RM≈124.67) *Then* new PR detected, updated, push.
- **AC-4** — *Given* PR established *When* set deleted *Then* PR recomputed; new best (or null if jejich немає історії).
- **AC-5** — *Given* PR set'нуто в workout #5 *Then* `personal_records.workout_log_set_id` posila на set; в UI можна tap "View workout" → перейти до session detail.
- **AC-6** — *Given* trainer *When* `GET /v1/clients/{id}/personal-records` *Then* `200` з list (групpoval по exercise; найновіші PRs згори).
- **AC-7** — *Given* client *When* `GET /v1/me/personal-records` *Then* `200` (свої).
- **AC-8** — *Given* concurrent PR detection (2 sets одночасно) *Then* `SELECT FOR UPDATE` на `personal_records` per `(client_id, exercise_id)`; serial.
- **AC-9** — *Given* `PersonalRecordSet` event *Then* push payload: `🏆 New PR! [Exercise]: 100 kg x 5 reps (1RM 116.7)`.

### Permissions

| Роль | Read own | Read client's | Write (manual override) |
|---|---|---|---|
| Trainer | — | ✅ для своїх | ❌ (only auto-computed) |
| Client | ✅ | — | ❌ |
| Admin | — | ✅ всі | ❌ (read-only) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Body weight exercise (weight=0) — як computed PR? | `estimated_1rm = 0`; PR detection ignores `weight=0` sets — не tracking PRs for bodyweight у MVP |
| EC-2 | Дуже високі reps (e.g. reps=30) | Epley formula стає inaccurate (`1RM = weight × 2`); cap'имо PR detection на `reps ≤ 12` (configurable). Sets з reps > 12 не considered for PR |
| EC-3 | User видалив set, що PR було basedнуto на ньому, але немає інших sets для цієї exercise | PR row deleted (NULL у `personal_records` row) |
| EC-4 | Concurrent log of two PR-quality sets — race | SELECT FOR UPDATE locks per `(client_id, exercise_id)`; whichever first finishes — wins; other one re-evaluates і може теж бути PR |
| EC-5 | Trainer корегує set's `weight_kg` upward post-factum | `WorkoutLogSetUpdated` listener теж triggers PR check — handled identically |
| EC-6 | Exercise deleted (EXR-001) — PR rows orphan? | FK on `personal_records.exercise_id` SET NULL? Або CASCADE delete PR rows. **Рекомендовано CASCADE** — PR for non-existent exercise meaningless |

### Зв'язок з технічною спекою

- API: [`../progress.md`](../progress.md) § `GET /clients/{id}/personal-records`, `GET /me/personal-records`, `GET /personal-records/{id}` (detail)
- DB: `personal_records` (з `client_id` FK CASCADE, `exercise_id` FK CASCADE, `weight_kg`, `reps`, `estimated_1rm numeric(7,2) GENERATED ALWAYS AS (weight_kg * (1 + reps::numeric / 30)) STORED`, `achieved_at`, `workout_log_set_id` FK SET NULL); UNIQUE on `(client_id, exercise_id)`
- Events: `PersonalRecordSet` (broadcast on `private-user.{client_id}` + push)
- Listeners: `DetectPRListener` (on `WorkoutLogSetCreated`, `WorkoutLogSetUpdated`), `RecomputePROnDeleteListener` (on `WorkoutLogSetDeleted`)
- Service: `PersonalRecordService::evaluateNewSet($set)`

---

## 4. CSV export [PROG-004]

**Phase:** 3 · **Стиль:** compact

### Контекст

Експорт прогресу клієнта у CSV (одне file з усіма metrics + PR + workout history). Async job → email з signed URL.

### User stories

- **US-PROG-009** — *Як trainer, я хочу експортувати весь прогрес клієнта у CSV для analytics в Excel/Sheets.*
- **US-PROG-010** — *Як client, я хочу експортувати свій прогрес для personal records keeping.*

### Acceptance criteria

- **AC-1** — *Given* trainer / client *When* `POST /v1/clients/{id}/progress/export` (або `/v1/me/progress/export`) з optional `{ from, to }` *Then* `202` з `{ export_id }`. `BuildProgressExportJob` enqueued.
- **AC-2** — *Given* job completes *Then* email "Your export is ready" з signed URL (TTL 7 днів). Lui також available у `GET /v1/me/exports/{id}`.
- **AC-3** — *Given* export ZIP file *Then* contains:
  - `body-measurements.csv` (всі measurements з columns: `date, metric_type, value, unit, recorded_by`)
  - `personal-records.csv` (всі PRs: `exercise, weight_kg, reps, estimated_1rm, achieved_at`)
  - `workouts.csv` (workout history: `session_date, exercise, set_index, reps, weight_kg, performed_at`)
- **AC-4** — *Given* export > 10K rows *Then* chunk-streaming у CSV (avoid memory exhaustion).

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ для свого client'а |
| Client | ✅ свого own |
| Admin | ✅ |

### Edge cases

- **EC-1** — Concurrent exports — кожен — окрема row у `data_exports`; rate limit 5/година/user.
- **EC-2** — Великий клієнт з 2 роками workout history — export size > 100 MB; warning user "Large export, may take 24h".
- **EC-3** — Soft-deleted entries (deleted measurements/sets) — НЕ exported.

### Технічна спека

- API: [`../progress.md`](../progress.md) § `POST /clients/{id}/progress/export`, `POST /me/progress/export`, `GET /me/exports/{id}` (shared з [`AUTH-005`](auth.md))
- Jobs: `BuildProgressExportJob` (queue `low`)
- DB: `data_exports` table (shared, з AUTH-005)
- Storage: S3 private; signed URL TTL 7 днів

---

## Залежності модуля Progress

- **Залежить від:** Auth, Users, Clients, Exercises, Workout Tracking (для PR detection), Files (для CSV storage).
- **Залежать від нього:** Analytics (progress charts можуть бути у trainer-level analytics — post-MVP).
