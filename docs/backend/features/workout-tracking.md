# Features — Workout Tracking

**Модуль:** Workout Tracking · **Phase:** 2 · **Файлів-сусідів:** [`../workout-tracking.md`](../workout-tracking.md) (technical)

5 фіч. Real-time двостороння синхронізація логів тренування між трендером і клієнтом.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | WT-001 | Live session lifecycle | full |
| 2 | WT-002 | Workout log entry | full |
| 3 | WT-003 | Real-time sync | full |
| 4 | WT-004 | Offline mode & idempotency | full |
| 5 | WT-005 | Workout history | compact |

> **Skeleton.** Детальний контент — на Phase 2 checkpoint. Це найскладніший real-time модуль.

---

## 1. Live session lifecycle [WT-001]
**Full · Skeleton.** Старт live-сесії (status → `in_progress`), завершення (→ `completed`), пауза. Один `workout_log` per session.

- API: `POST /sessions/{id}/workout-log/start`, `POST /sessions/{id}/workout-log/finish`
- DB: `workout_logs` (з `session_id`, `started_at`, `finished_at`)
- Events: `WorkoutSessionStarted`, `WorkoutSessionFinished`

## 2. Workout log entry [WT-002]
**Full · Skeleton.** Логування sets/reps/weight/rest per exercise per actor.

- API: `POST /workout-logs/{id}/sets`, `PATCH /workout-log-sets/{id}`, `DELETE /workout-log-sets/{id}`
- DB: `workout_log_sets` (з `workout_log_id`, `exercise_id`, `set_index`, `reps`, `weight_kg`, `actor_id`, `version`, `performed_at`)
- Idempotency: `Idempotency-Key` обов'язковий.

## 3. Real-time sync [WT-003]
**Full · Skeleton.** Broadcasting через Reverb на канал `private-session.{id}`.

- Events: `WorkoutLogSetCreated`, `WorkoutLogSetUpdated`, `WorkoutLogSetDeleted`
- Conflict resolution: last-write-wins per `(workout_log_id, exercise_id, set_index)`, версіонування через `version` field

## 4. Offline mode & idempotency [WT-004]
**Full · Skeleton.** Клієнт пише локально, синхронізує при відновленні зв'язку. Idempotency keys, version conflict resolution.

- Підхід: кожен set має `client_uuid` (генерується клієнтом); backend UPSERT за `(workout_log_id, client_uuid)`; race resolution через `version`.

## 5. Workout history [WT-005]
**Compact · Skeleton.** Перегляд історичних workout logs (фільтр по client, exercise, date range).

- API: `GET /clients/{id}/workout-logs`, `GET /workout-logs/{id}`
