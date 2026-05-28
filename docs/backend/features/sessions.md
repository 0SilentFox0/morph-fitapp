# Features — Sessions & Calendar

**Модуль:** Sessions & Calendar · **Phase:** 1 (basic), 2 (calendar sync) · **Файлів-сусідів:** [`../sessions.md`](../sessions.md) (technical)

7 фіч. Sessions — центральна доменна сутність системи, навколо якої вʼяжуться програми, пакети, оплати, workout tracking.

| # | Код | Назва | Стиль | Phase |
|:-:|---|---|:-:|:-:|
| 1 | SES-001 | Session management (CRUD) | full | 1 |
| 2 | SES-002 | Schedule views | compact | 1 |
| 3 | SES-003 | Session status lifecycle | full | 1 |
| 4 | SES-004 | Recurring sessions | full | 1 |
| 5 | SES-005 | Conflict detection | full | 1 |
| 6 | SES-006 | Reminders & notifications | compact | 1 |
| 7 | SES-007 | Package linkage | compact | 1, 3 |

> **Skeleton.** Детальний контент — на Phase 1 checkpoint. Базова reference імплементація — у TECH_TASK §10 (приклад фічі "Створення сесії"), яку ми вже зробили full-style раніше.

---

## 1. Session management (CRUD) [SES-001]

**Phase:** 1 · **Стиль:** full · **Status:** skeleton

Створення, редагування, скасування, перенесення (reschedule) сесій. Сесія має title, start_at, end_at (або duration), type (enum), trainer_id, participants (`session_participants`), optional `client_package_id`.

**User stories (заплановані):**
- *Як trainer, я хочу створити сесію з конкретною датою/часом і клієнтом.*
- *Як trainer, я хочу редагувати сесію (час, учасників, тип).*
- *Як trainer, я хочу скасувати сесію (з можливістю reason).*
- *Як trainer, я хочу перенести сесію (reschedule) на іншу дату.*

**Технічна спека:**
- API: [`../sessions.md`](../sessions.md) § `POST /sessions`, `PATCH /sessions/{id}`, `DELETE /sessions/{id}`, `POST /sessions/{id}/reschedule`
- DB: `sessions`, `session_participants`
- Events: `SessionCreated`, `SessionUpdated`, `SessionCanceled`, `SessionRescheduled`

---

## 2. Schedule views [SES-002]

**Phase:** 1 · **Стиль:** compact · **Status:** skeleton

День/місяць views з фільтрами і пошуком.

**User stories:**
- *Як trainer, я хочу бачити свій місяць (calendar grid) і обрати конкретний день.*
- *Як trainer, я хочу пошукати сесію по title або клієнту.*

**Технічна спека:**
- API: [`../sessions.md`](../sessions.md) § `GET /sessions?from=&to=&q=&status=`
- Cursor pagination + filtering.

---

## 3. Session status lifecycle [SES-003]

**Phase:** 1 · **Стиль:** full · **Status:** skeleton

State machine: `planned` → `in_progress` → `completed` | `canceled` | `no_show`. Транзишени через окремі endpoints або implicit (workout tracking → in_progress).

**User stories (заплановані):**
- *Як trainer, я хочу позначити сесію як completed/no_show після факту.*
- *Як система, я хочу автоматично перевести сесію в `in_progress` при початку workout tracking.*

**Технічна спека:**
- API: [`../sessions.md`](../sessions.md) § `POST /sessions/{id}/status` з body `{ status, reason? }`
- DB: `sessions.status enum`, `sessions.status_changed_at`
- Events: `SessionStatusChanged`

---

## 4. Recurring sessions [SES-004]

**Phase:** 1 · **Стиль:** full · **Status:** skeleton

Тренер створює recurring (e.g. "every Mon/Wed/Fri at 18:00 for 3 months") → система генерує окремі `sessions` через scheduled job. Patches на одну сесію — affects тільки цю, не серію.

**User stories (заплановані):**
- *Як trainer, я хочу створити повторювану сесію з налаштуванням періодичності.*
- *Як trainer, я хочу скасувати одну сесію з серії, не зачіпаючи інші.*
- *Як trainer, я хочу скасувати всю серію.*

**Технічна спека:**
- API: [`../sessions.md`](../sessions.md) § `POST /sessions/recurring`, `DELETE /sessions/recurring/{series_id}`
- DB: `session_series` (parent), `sessions.series_id` (nullable FK)
- Jobs: `MaterializeRecurringSessionsJob` (creates next 30 days of occurrences)

---

## 5. Conflict detection [SES-005]

**Phase:** 1 · **Стиль:** full · **Status:** skeleton

При створенні/редагуванні сесії — перевірка timeslot конфлікту з іншими сесіями того ж trainer'а або учасника.

**User stories:**
- *Як trainer, я хочу отримати warning, якщо створюю сесію в час, що конфліктує з іншою.*
- *Як trainer, я хочу мати опцію створення з override (warning, не error).*

**Технічна спека:**
- API: response 200 з `warnings: [{ type: "conflict", conflicting_session_id, ... }]` АБО 409 (configurable через `?force=true`)
- Query: PostgreSQL range type `tstzrange` + GiST index для overlap check.

---

## 6. Reminders & notifications [SES-006]

**Phase:** 1 · **Стиль:** compact · **Status:** skeleton

24h і 1h до сесії — push нагадування. Кастомізація per user через `notification_preferences`.

**Технічна спека:**
- Triggered by `SessionRemindersJob` (scheduled every 5 min) — див. [`notifications.md`](notifications.md).

---

## 7. Package linkage [SES-007]

**Phase:** 1, 3 · **Стиль:** compact · **Status:** skeleton

При створенні сесії опційно прив'язати до `client_package`. На `completed` — декрементує `remaining_sessions` (див. [`packages.md`](packages.md)). На `canceled`/`no_show` — налаштовується per package (default: no decrement; "no-show" може decrement як penalty — configurable).

**Технічна спека:**
- DB: `sessions.client_package_id` (nullable FK)
- Logic: `OnSessionCompleted` listener decrements pakage.
