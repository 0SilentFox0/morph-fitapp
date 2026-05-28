# Features — Sessions & Calendar

**Модуль:** Sessions & Calendar · **Phase:** 1 (basic), 2 (calendar sync, real-time hooks) · **Файлів-сусідів:** `sessions.md` (TBD) (technical)

7 фіч. Sessions — центральна доменна сутність системи, навколо якої вʼяжуться програми, пакети, оплати, workout tracking, чат.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | SES-001 | Session management (CRUD) | full |
| 2 | SES-002 | Schedule views | compact |
| 3 | SES-003 | Session status lifecycle | full |
| 4 | SES-004 | Recurring sessions | full |
| 5 | SES-005 | Conflict detection | full |
| 6 | SES-006 | Reminders & notifications | compact |
| 7 | SES-007 | Package linkage | compact |

---

## 1. Session management (CRUD) [SES-001]

**Phase:** 1 · **Стиль:** full

### Контекст

Базові CRUD сесій. Сесія має: `title`, `start_at`, `end_at` (або `duration_min`), `type` (Cardio, HIIT, Strength, Mobility, ...), `trainer_id`, `participants` (через `session_participants`), `notes`, optional `program_id` (link), optional `client_package_id` (для package linkage). Створення, редагування, скасування, перенесення.

### User stories

- **US-SES-001** — *Як trainer, я хочу створити сесію з конкретною датою/часом, типом і клієнтом-учасником.*
- **US-SES-002** — *Як trainer, я хочу редагувати сесію (час, учасників, тип).*
- **US-SES-003** — *Як trainer, я хочу скасувати сесію з опцією reason (no_show / canceled_by_trainer / canceled_by_client / other).*
- **US-SES-004** — *Як trainer, я хочу перенести сесію (`reschedule`) на іншу дату/час, зберігаючи зв'язки з пакетом.*
- **US-SES-005** — *Як client, я хочу бачити сесії, де я учасник.*
- **US-SES-006** — *Як client, я хочу запитати тренера скасування сесії (post-MVP — наразі просто чат).*

### User flow + UI mapping

1. **Create:** `+` button у TabBar → `SessionFormScreen.tsx` → форма (title, date, time, duration, participants chips, type modal-picker, optional program, optional package).
2. Submit → `POST /v1/sessions` з `Idempotency-Key` header.
3. Backend:
   - Валідує (`title` 1-255, `start_at` > now (з толерансом 1 хв), `end_at > start_at`, `type` enum, `participants` non-empty).
   - Перевіряє: всі `participants.client_id` належать тренеру.
   - Перевіряє: якщо `client_package_id` присутній — пакет valid, non-exhausted, належить хоч одному participant'у. Деталі — [`SES-007`](#7-package-linkage-ses-007).
   - Conflict detection ([`SES-005`](#5-conflict-detection-ses-005)) — за замовчанням повертає `warnings`, не error.
   - У DB transaction: створює `sessions` row + `session_participants` для кожного.
   - Dispatch `SessionCreated` event.
   - Респонс: `201` з `{ session }`.
4. **Edit:** `ScheduleCard` → options menu → "Edit" → `PATCH /v1/sessions/{id}` з diff.
5. **Cancel:** options → "Cancel" → confirmation modal → `POST /v1/sessions/{id}/cancel` з `{ reason, notify_clients: bool }`.
6. **Reschedule:** options → "Reschedule" → calendar picker → `POST /v1/sessions/{id}/reschedule` з `{ new_start_at, new_end_at }`.
7. **Delete:** options → "Delete" → confirmation → `DELETE /v1/sessions/{id}`. Допустимо тільки для `status = "planned"`; для completed — лише `archive` (post-MVP).

### Acceptance criteria

- **AC-1** — *Given* trainer T і client C тренера T *When* `POST /v1/sessions` з валідним body *Then* `201` з `{ session }`. `session_participants` row створено. `SessionCreated` event broadcasts.
- **AC-2** — *Given* `start_at` у минулому (> 1 хв tolerance) *Then* `422 start_at_in_past`.
- **AC-3** — *Given* `end_at <= start_at` *Then* `422 invalid_time_range`.
- **AC-4** — *Given* participant з `client_id`, який не належить тренеру *Then* `403 forbidden_participant`.
- **AC-5** — *Given* `client_package_id` не belongs to any participant *Then* `422 package_client_mismatch`.
- **AC-6** — *Given* `client_package_id` з `remaining_sessions = 0` *Then* `409 package_exhausted`.
- **AC-7** — *Given* trainer T і session його *When* `PATCH /v1/sessions/{id}` з `{ title }` *Then* `200`, title оновлено, `SessionUpdated` event.
- **AC-8** — *Given* session з status `completed` *When* `PATCH` змінює `start_at` *Then* `422 cannot_modify_completed`.
- **AC-9** — *Given* session з status `planned` *When* `POST /v1/sessions/{id}/cancel` з reason *Then* `200`, status `canceled`, `cancellation_reason` set, `SessionCanceled` event broadcasts; учасники отримують push.
- **AC-10** — *Given* `POST .../reschedule` з `{ new_start_at, new_end_at }` *Then* `200`, `start_at`/`end_at` оновлено, `SessionRescheduled` event; учасники отримують push.
- **AC-11** — *Given* idempotency-key reused within 24h *Then* той самий response (без створення дубля).

### Permissions

| Роль | Create | Update | Cancel | Reschedule | Delete | View |
|---|---|---|---|---|---|---|
| Trainer | ✅ свої клієнти | ✅ свої | ✅ свої | ✅ свої | ✅ свої planned | ✅ свої |
| Client | ❌ (post-MVP) | ❌ | ❌ (post-MVP — request) | ❌ (post-MVP — request) | ❌ | ✅ де participant |
| Admin | ✅ (audit) | ✅ (audit) | ✅ | ✅ | ✅ (audit) | ✅ всі |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Подвійний submit (network race) | `Idempotency-Key` header → за 24h той самий ключ повертає cached response |
| EC-2 | Participant видалений під час створення (race) | DB transaction FK check → `422 participant_not_found`; usable error |
| EC-3 | Створення сесії в час, коли учасник вже зайнятий | За замовчанням — `warnings`, не error; конкретика — [`SES-005`](#5-conflict-detection-ses-005) |
| EC-4 | Cancel сесії за < 1h до start_at | Дозволено, але notification до participant'ів з high priority |
| EC-5 | Reschedule в минуле | `422 start_at_in_past`; не дозволено |
| EC-6 | Delete сесії з прив'язаним package, що декрементувався | Поки сесія `planned`, package не декрементувався (декремент — на `completed`); delete просто видаляє session, package intact |
| EC-7 | Edit `client_package_id` на сесії | Дозволено для `planned`; для `completed` — ні (package вже декрементнувся) |
| EC-8 | Сесія з програмою; програма видалена | `program_id` SET NULL; сесія залишається, але без program-link |
| EC-9 | Сесія з > 10 учасниками (групова) | Допустимо (UI tier — це Group Class); single endpoint обробляє both personal і group |

### Зв'язок з технічною спекою

- API: `sessions.md` (TBD) § `POST /sessions`, `GET /sessions/{id}`, `PATCH /sessions/{id}`, `POST /sessions/{id}/cancel`, `POST /sessions/{id}/reschedule`, `DELETE /sessions/{id}`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `sessions` (з `trainer_id`, `title`, `start_at`, `end_at`, `type enum`, `status enum`, `cancellation_reason text`, `notes`, `program_id` FK nullable, `client_package_id` FK nullable, `series_id` FK nullable для recurring); `session_participants` (з `session_id`, `client_id`)
- Indexes: `(trainer_id, start_at)`, GIST index `tstzrange(start_at, end_at)` для overlap queries
- Events: `SessionCreated`, `SessionUpdated`, `SessionCanceled`, `SessionRescheduled`, `SessionDeleted`
- Listeners: `NotifyParticipantsListener` (push), `SyncToGoogleCalendarListener` (Phase 2)

---

## 2. Schedule views [SES-002]

**Phase:** 1 · **Стиль:** compact

### Контекст

Перегляд розкладу — month view (calendar grid з днями та counter сесій per day) і day view (chronological list). Search by title, фільтри по статусу, типу, клієнту.

### User stories

- **US-SES-007** — *Як trainer, я хочу бачити свій місяць calendar grid з кількістю сесій per day.*
- **US-SES-008** — *Як trainer, я хочу обрати день і побачити chronological list сесій.*
- **US-SES-009** — *Як trainer, я хочу пошукати сесію по title, client name або типу.*

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `GET /v1/sessions?from=2026-05-01&to=2026-05-31&group_by=day` *Then* `200` з `{ days: [{ date, sessions_count, by_status }] }`.
- **AC-2** — *Given* `GET /v1/sessions?from=...&to=...&status=planned` *Then* фільтрований список (cursor-paginated).
- **AC-3** — *Given* `GET /v1/sessions?q=Іва&from=...&to=...` *Then* ILIKE search по `title` + JOIN search по participant `clients.name`.
- **AC-4** — *Given* range > 90 днів *Then* `422 range_too_wide` (захист від heavy queries).
- **AC-5** — *Given* client *When* `GET /v1/me/sessions?from=...&to=...` *Then* `200` зі своїми сесіями (через JOIN з session_participants).

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ свої сесії |
| Client | ✅ де participant |
| Admin | ✅ всі |

### Edge cases

- **EC-1** — Часовий пояс trainer'а vs response: запит `from/to` приймається як ISO 8601 з timezone; backend конвертує в UTC для query. Response містить дати в UTC (frontend конвертує під user.timezone).
- **EC-2** — Default pagination — cursor-based; для group_by=day — окремий response format без cursor (повертає всі дні у range).

### Технічна спека

- API: `sessions.md` (TBD) § `GET /sessions?from=&to=&status=&type=&client_id=&q=&group_by=&cursor=`, `GET /me/sessions`
- DB: queries з range overlap (`start_at >= from AND start_at < to`); index `(trainer_id, start_at)`
- Cache: per `(trainer_id, from, to, hash(filters))` — TTL 60s (frequent reads + cheap invalidation on SessionUpdated)

---

## 3. Session status lifecycle [SES-003]

**Phase:** 1 · **Стиль:** full

### Контекст

Чітко визначена state machine для статусу сесії. Транзишени мають правила (хто і коли може змінити).

```
planned ──(start)──► in_progress ──(finish)──► completed
   │                       │
   │                       └──(cancel)──► canceled
   │
   ├──(cancel)──► canceled
   │
   └──(no_show)──► no_show     (auto, через 1h after start якщо ніхто не log'нувся)
```

### User stories

- **US-SES-010** — *Як trainer, я хочу позначити сесію як completed після факту (manual override).*
- **US-SES-011** — *Як trainer, я хочу позначити сесію як no_show, якщо клієнт не з'явився.*
- **US-SES-012** — *Як система, я хочу автоматично переводити сесію в `in_progress` коли стартує workout tracking (див. `WT-001`).*
- **US-SES-013** — *Як система, я хочу автоматично переводити "забуті" сесії в `no_show` через 1h після start_at, якщо нічого не логнувалось.*

### User flow + UI mapping

1. Manual transition: `ScheduleCard` → options → "Mark as completed" / "Mark as no_show".
2. `POST /v1/sessions/{id}/status` з `{ status, reason? }`.
3. Backend:
   - Перевіряє legal transition (state machine).
   - Якщо `completed` і прив'язаний package — декрементує remaining (`SES-007`).
   - Якщо `no_show` — конфігуроване decrement (default: ні; trainer setting).
   - Dispatch `SessionStatusChanged` event.
4. **Auto-transitions** (cron jobs):
   - `AutoStartSessionsJob` (every 5 min): шукає `planned` сесії з `start_at <= now - 5min` АБО запущений workout-log → перевіряє чи clients/trainer "приєдналися" (через WS presence на `presence-session.{id}`); якщо так — `in_progress`.
   - `AutoNoShowSessionsJob` (every 30 min): `planned` сесії з `end_at < now() - 1h` і без workout-log → `no_show`.

### Acceptance criteria

- **AC-1** — *Given* session з status `planned` *When* `POST /v1/sessions/{id}/status` з `{ status: "completed" }` *Then* `200`, status `completed`, `status_changed_at = now()`, event broadcasts.
- **AC-2** — *Given* status `completed` *When* try transition до `planned` *Then* `409 invalid_transition`.
- **AC-3** — *Given* session з прив'язаним active package *When* transition до `completed` *Then* package decrement (`remaining_sessions -= 1`); якщо `remaining = 0` — event `PackageExhausted`.
- **AC-4** — *Given* session без package *When* transition до `completed` *Then* `200`, no package action.
- **AC-5** — *Given* trainer cancel'ив сесію без notify clients flag *When* `POST .../cancel` з `{ notify_clients: false }` *Then* `200`, push НЕ надсилається. (Behaviour: для quiet cancel — наприклад, що тренер сам забув).
- **AC-6** — *Given* `AutoNoShowSessionsJob` runs *When* знаходить `planned` сесію де `end_at < now() - 1h` і без `workout_logs` *Then* `status = "no_show"`, event broadcasts.
- **AC-7** — *Given* invalid transition (e.g. `canceled → in_progress`) *Then* `409 invalid_transition`.

### Permissions

| Роль | planned→in_progress | →completed | →canceled | →no_show |
|---|---|---|---|---|
| Trainer | ✅ свої (manual або auto via workout) | ✅ manual | ✅ manual | ✅ manual |
| Client | ❌ | ❌ (post-MVP — confirm completion request) | ❌ (request only post-MVP) | ❌ |
| System (auto) | ✅ при workout start | ✅ при workout finish (WT-001) | ❌ | ✅ (AutoNoShowSessionsJob) |
| Admin | ✅ (audit) | ✅ | ✅ | ✅ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Workout запущено, але сесія не в `in_progress` (race) | At start of workout-log в [`WT-001`](workout-tracking.md) — transition`planned → in_progress` атомічно у тій самій transaction |
| EC-2 | Trainer marks completed, але workout-log empty | Дозволено; completion — manual override. Workout history просто буде empty |
| EC-3 | Auto-noshow повторно (job re-run) | Idempotent: вже `no_show` сесія skip'ається (WHERE clause) |
| EC-4 | Reschedule сесії, що auto-no_show'нулася | Дозволено: створює нову row через [`SES-001`](#1-session-management-crud-ses-001) reschedule; старий запис залишається for history |
| EC-5 | Package decrement при completed, але потім session edit'нули до canceled | Decrement reversed: `remaining_sessions += 1` (через listener на reverse transition) |

### Зв'язок з технічною спекою

- API: `sessions.md` (TBD) § `POST /sessions/{id}/status`, `POST /sessions/{id}/cancel`, `POST /sessions/{id}/no-show`
- DB: `sessions.status enum: planned, in_progress, completed, canceled, no_show`, `sessions.status_changed_at`, `sessions.cancellation_reason`
- Events: `SessionStatusChanged`, `SessionCompleted`, `SessionCanceled`, `SessionNoShow`
- Jobs: `AutoStartSessionsJob` (every 5 min), `AutoNoShowSessionsJob` (every 30 min)
- Listeners: `DecrementPackageOnCompletionListener`, `RestorePackageOnReverseListener`, `EmitPushOnStatusChangeListener`

---

## 4. Recurring sessions [SES-004]

**Phase:** 1 · **Стиль:** full

### Контекст

Trainer створює recurring series (напр. "every Mon/Wed/Fri at 18:00 for 3 months") → система генерує окремі `sessions` через materialization. Patch на одну сесію — affects only that occurrence, не серію. Видалення occurrence — також лише його. Видалення серії — каскадно видаляє всі pending occurrences (planned), але historic (completed/no_show) лишаються.

### User stories

- **US-SES-014** — *Як trainer, я хочу створити recurring сесію (e.g. Mon/Wed/Fri 18:00 для 3 місяців).*
- **US-SES-015** — *Як trainer, я хочу скасувати одну сесію з серії, не зачіпаючи інші.*
- **US-SES-016** — *Як trainer, я хочу скасувати всю серію (всі майбутні).*
- **US-SES-017** — *Як trainer, я хочу змінити recurrence rule (e.g. перенести on Sat instead of Fri).*

### User flow + UI mapping

1. Trainer на SessionForm → toggle "Make recurring" → recurrence settings (frequency: weekly, daysOfWeek, until_date or count).
2. `POST /v1/sessions/recurring` з `{ template: {...session fields}, recurrence: { frequency, days_of_week, until_date } }`.
3. Backend:
   - Створює `session_series` row (parent).
   - **Materializes** перші 30 днів — створює окремі `sessions` rows з `series_id` FK.
   - `MaterializeRecurringSessionsJob` (scheduled daily) — для всіх `session_series` робить look-ahead і materializes наступні 30 днів окремими sessions.
4. Edit single occurrence: `PATCH /v1/sessions/{id}` — лише ця row. Frontend може показати "Only this / Also future" dialog.
5. Edit series: `PATCH /v1/session-series/{id}` — оновлює template; майбутні **non-materialized** occurrences будуть generated з новими полями.
6. Cancel series: `DELETE /v1/session-series/{id}` — soft delete + cascade видаляє `planned` occurrences. Historic occurrences (completed/no_show) залишаються without `series_id`.

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `POST /v1/sessions/recurring` з `{ template, recurrence: { frequency: "weekly", days_of_week: ["mon","wed","fri"], until_date: "2026-08-01" } }` *Then* `201` з `{ series, materialized_count: N }` де N — кількість materialized у наступні 30 днів.
- **AC-2** — *Given* до 12 occurrences materialized per request initially (rate limit на initial creation 30 днів).
- **AC-3** — *Given* `until_date < start_at` або `until_date - start_at > 365 days` *Then* `422`.
- **AC-4** — *Given* trainer *When* `PATCH /v1/sessions/{id}` для single occurrence (з `series_id`) *Then* `200`. Має поле `series_overridden: true` — на frontend показується icon "modified".
- **AC-5** — *Given* `PATCH /v1/session-series/{id}` з `{ template: { time: "19:00" } }` *Then* `200`; майбутні non-materialized occurrences будуть generated з 19:00. Існуючі materialized — НЕ оновлюються (за замовчуванням).
- **AC-6** — *Given* `PATCH /v1/session-series/{id}?cascade=true` *Then* `200`; всі **non-overridden** materialized occurrences (з `series_overridden=false`) оновлюються; overridden — залишаються.
- **AC-7** — *Given* `DELETE /v1/session-series/{id}` *Then* `200`; soft delete `session_series.deleted_at`; cascade delete всі `planned` occurrences з `series_id = id`; completed/no_show — залишаються (з `series_id` NULL).
- **AC-8** — *Given* materialize job runs щодня *Then* для активних series без overlap (до конкуренції) генерує наступні 30 днів occurrences.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ свої series |
| Client | ❌ (просто бачить individual sessions як participant) |
| Admin | ✅ (audit) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | DST transition у midweek | Recurrence rule зберігається в trainer's timezone (`session_series.timezone`); occurrence start_at обчислюється в local time of trainer, потім конвертується в UTC при materialize. DST автоматично corrected |
| EC-2 | Holiday — trainer хоче пропустити одну occurrence | "Skip this only" → `DELETE /v1/sessions/{id}` (з `series_id`); інші лишаються |
| EC-3 | Edit `participants` в series — не передаються в materialized | Materialize має snapshot participants з series.template; зміни participant у template передаються при cascade=true |
| EC-4 | Trainer змінив timezone (USR-001 settings) | `session_series.timezone` лишається original; trainer бачить попередження "Series uses old timezone" |
| EC-5 | Recurring з `count: 100` замість `until_date` | Допустимо: backend конвертує в `until_date = start_at + count * period`. Limit до 365 days або 100 occurrences |
| EC-6 | Materialize race (job runs concurrently for same series) | Lock через `SELECT ... FOR UPDATE` на `session_series`; один winner |

### Зв'язок з технічною спекою

- API: `sessions.md` (TBD) § `POST /sessions/recurring`, `GET /session-series/{id}`, `PATCH /session-series/{id}`, `DELETE /session-series/{id}`
- DB: `session_series` (з `template jsonb`, `recurrence_rule jsonb`, `timezone`, `materialized_until`, `deleted_at`); `sessions.series_id` FK SET NULL; `sessions.series_overridden boolean`
- Jobs: `MaterializeRecurringSessionsJob` (scheduled daily 02:00, look-ahead 30 days)
- Events: `SessionSeriesCreated`, `SessionSeriesUpdated`, `SessionSeriesDeleted`

---

## 5. Conflict detection [SES-005]

**Phase:** 1 · **Стиль:** full

### Контекст

При створенні/редагуванні сесії — перевірка timeslot конфлікту з іншими сесіями того ж trainer'а або того ж participant'а. За замовчанням повертає `warnings` у response (UX-friendly), але dozволяє `?force=false` для жорсткої перевірки (status 409 при конфлікті).

### User stories

- **US-SES-018** — *Як trainer, я хочу отримати warning перед створенням сесії, що конфліктує з іншою (свою чи мого клієнта).*
- **US-SES-019** — *Як trainer, я хочу мати опцію створення з override (warning, не error) — деякі конфлікти допустимі (наприклад, group session з кількома слотами).*
- **US-SES-020** — *Як trainer, я хочу налаштувати strict mode (заборона конфліктів) у settings (post-MVP).*

### User flow + UI mapping

1. Trainer заповнює SessionForm → submit.
2. Backend перевіряє conflicts (детально нижче).
3. Якщо є conflicts:
   - Default (`?force=false` неявно): `201` з полем `warnings: [{ type: "conflict", conflicting_session_id, with_participant_id, severity: "trainer_overlap" | "client_overlap" }]`.
   - З `?force=false` (strict mode): `409 schedule_conflict` з details.
4. Frontend може показати modal "Conflict detected, create anyway?" і retry з `?force=true`.

### Detection logic

Conflict detected якщо існує інша сесія S' з:

- `S'.status NOT IN ("canceled", "no_show")`.
- Time overlap: `tstzrange(S.start_at, S.end_at) && tstzrange(S'.start_at, S'.end_at)` (PostgreSQL range && оператор).
- AND одне з:
  - `S'.trainer_id = S.trainer_id` → **trainer overlap** (severity high).
  - `S'.participants ∩ S.participants ≠ ∅` → **client overlap** (severity medium).

### Acceptance criteria

- **AC-1** — *Given* trainer T має сесію з 10:00-11:00 *When* `POST /v1/sessions` з 10:30-11:30 *Then* `201` з `warnings: [{ type: "trainer_overlap", conflicting_session_id }]`.
- **AC-2** — *Given* `POST /v1/sessions?force=false` зі conflict *Then* `409 schedule_conflict` з details.
- **AC-3** — *Given* client C є participant у сесії S1 10:00-11:00 *When* `POST /v1/sessions` з C у participants на 10:30-11:30 *Then* `201` з `warnings: [{ type: "client_overlap", with_participant_id: C.id }]`.
- **AC-4** — *Given* edit existing session з новим `start_at/end_at` що створює conflict *Then* той самий behavior (warnings/error).
- **AC-5** — *Given* recurring session creation з тимстампами що конфліктують у деяких occurrences *Then* warnings per occurrence у response: `{ series, occurrences_with_warnings: [...] }`.
- **AC-6** — *Given* conflict але інша сесія `status = "canceled"` *Then* НЕ conflict (виключено з detection).
- **AC-7** — *Given* identical timeslot AND identical participants — duplicate *Then* `409 duplicate_session` (high severity, force=true дозволяє, але рідко осмислений).

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ детект на свої сесії |
| Client | — (не створює сесії в MVP) |
| Admin | ✅ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Performance — overlap query потенційно heavy | GiST index на `tstzrange(start_at, end_at)`; query фільтрує по `trainer_id` спочатку (cardinality) |
| EC-2 | Conflict з minimum overlap (1 минута) | Threshold 0 — будь-який overlap detected. Frontend може фільтрувати warnings по severity |
| EC-3 | Many participants у group session, кілька з conflicts | Returns array of warnings — один per participant з overlap; UX вирішує (показати list) |
| EC-4 | Conflict із recurring series — детектено per occurrence | Materialized occurrences враховуються (вони — звичайні sessions rows); non-materialized — НЕ враховуються |
| EC-5 | Edit session, що сама генерує conflict (compare with self) | Exclude `WHERE id != current_session_id` |

### Зв'язок з технічною спекою

- API: response field `warnings[]` у `POST /sessions`, `PATCH /sessions/{id}`, `POST /sessions/recurring`; query param `force=true|false`
- DB: GIST index `EXCLUDE USING gist (trainer_id WITH =, tstzrange(start_at, end_at) WITH &&) WHERE (status NOT IN ('canceled','no_show'))` — для DB-level enforcement (post-MVP strict mode)
- Service: `SessionConflictDetector` (analyzes proposed session, returns array of conflicts)

---

## 6. Reminders & notifications [SES-006]

**Phase:** 1 · **Стиль:** compact

### Контекст

Автоматичні push-нагадування до учасників — за 24h і за 1h до start_at. Інтеграція з модулем [`notifications.md`](notifications.md) — backend dispatch'ить events, NotificationListener формує push.

### User stories

- **US-SES-021** — *Як user, я хочу отримувати нагадування про майбутню сесію (24h і 1h before).*
- **US-SES-022** — *Як user, я хочу налаштувати: чи отримувати reminder push'і (через USR-001 settings).*

### Acceptance criteria

- **AC-1** — *Given* session з `start_at = now + 24h` (з tolerance ±5 min) *When* `SessionRemindersJob` runs (every 5 min) *Then* для кожного participant'а с `notification_preferences.sessions = true` створюється `Notification` row + `SendPushJob` enqueued.
- **AC-2** — *Given* session з `start_at = now + 1h` *Then* той самий flow з кодом `session_reminder_1h`.
- **AC-3** — *Given* session з status `canceled` *When* job *Then* SKIP (reminder не надсилається).
- **AC-4** — *Given* той самий reminder вже надіслано (dedup) *Then* НЕ дублюється — через unique index `(session_id, recipient_id, kind: "session_reminder_24h"|"session_reminder_1h")` у `notifications`.

### Permissions

— Internal job; не керується UI.

### Edge cases

- **EC-1** — User has push disabled — Notification row все одно створюється (для in-app feed), push skip.
- **EC-2** — Sessions created з `start_at < 24h` ahead — no 24h reminder (skipped); 1h reminder надсилається якщо в межах.
- **EC-3** — Session rescheduled — reminder dedup: якщо `(session_id, recipient_id, kind)` index existed та session changed — re-evaluation в job; нова `start_at` → новий reminder з новим dedup (видаляється стара notification через delete on reschedule).

### Технічна спека

- Jobs: `SessionRemindersJob` (scheduled every 5 min)
- Dispatch: `Notification` rows + `SendPushJob` через [`notifications.md`](notifications.md) `NTF-001`
- DB UNIQUE: `(recipient_id, type='session_reminder_24h', source_id=session_id)` + аналогічно для `1h`

---

## 7. Package linkage [SES-007]

**Phase:** 1 + 3 · **Стиль:** compact

### Контекст

Опційне прив'язання сесії до клієнтського пакета (`ClientPackage`, [`packages.md`](packages.md)). На completed → пакет декрементується.

### User stories

- **US-SES-023** — *Як trainer, я хочу прив'язати сесію до active пакета клієнта при створенні, щоб система автоматично декрементувала залишок при completed.*
- **US-SES-024** — *Як trainer, я хочу побачити в session form список active пакетів учасника-клієнта.*

### Acceptance criteria

- **AC-1** — *Given* trainer створює сесію з одним participant'ом C *When* `GET /v1/clients/{C.id}/packages?status=active` *Then* response з `[{ client_package, remaining, ...}]` — frontend підставляє у picker.
- **AC-2** — *Given* `POST /v1/sessions` з `client_package_id` що не належить хоч одному participant'у *Then* `422 package_client_mismatch`.
- **AC-3** — *Given* `client_package_id` з `remaining_sessions = 0` *Then* `409 package_exhausted`.
- **AC-4** — *Given* session з прив'язаним пакетом *When* status `completed` *Then* `client_packages.remaining_sessions -= 1` атомарно (через `OnSessionCompleted` listener); якщо стало 0 — event `PackageExhausted` (push клієнту + тренеру).
- **AC-5** — *Given* session з пакетом *When* edit `client_package_id` на NULL (unlink) *Then* `200`; package восстановлюється (decremented session — reverse decrement лише якщо session уже completed).
- **AC-6** — *Given* groupова session з 3 participants але `client_package_id` для одного з них *Then* OK; decrement лише для конкретного клієнта.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ link/unlink свої сесії |
| Client | ❌ |
| Admin | ✅ (audit) |

### Edge cases

- **EC-1** — Concurrent completion двох сесій з тим самим пакетом, що має `remaining=1` — `SELECT FOR UPDATE` на `client_packages` row у `OnSessionCompleted` listener; виграє один, другий отримує `PackageExhausted` failure (logged, admin notify).
- **EC-2** — Reverse transition `completed → canceled` через AC-5 SES-003 → package decrement reversed (atomic).
- **EC-3** — Group session з кількома пакетами для різних клієнтів — поки що 1 session → 1 client_package_id; для group-with-many-packages — окремі sessions потрібні (або post-MVP розширення моделі до `session_package_links` table).

### Технічна спека

- API: `POST /sessions` body field `client_package_id`; `GET /clients/{id}/packages?status=active` (від [`packages.md`](packages.md))
- DB: `sessions.client_package_id` FK SET NULL до `client_packages`
- Listeners: `DecrementPackageOnSessionCompletedListener`, `RestorePackageOnSessionReversedListener` (від [`SES-003`](#3-session-status-lifecycle-ses-003))
- Logic — більш повно у [`features/packages.md`](packages.md) `PKG-002`

---

## Залежності модуля Sessions

- **Залежить від:** Auth, Users (trainer/clients), Clients (participants), Programs (опційно session pulls program template), Packages (опційно link), Files (для cover/notes media — post-MVP), Notifications (reminders, status push), Integrations (Calendar sync — Phase 2).
- **Залежать від нього:** Workout Tracking (live session = workout_log per session), Analytics (sessions count), Chat (link до сесії у messages — post-MVP).
