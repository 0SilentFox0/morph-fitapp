# Features — Progress Metrics

**Модуль:** Progress · **Phase:** 3 · **Файлів-сусідів:** [`../progress.md`](../progress.md) (technical)

4 фічі.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | PROG-001 | Body measurements | compact |
| 2 | PROG-002 | Progress charts | compact |
| 3 | PROG-003 | Personal Records & 1RM auto-detect | full |
| 4 | PROG-004 | CSV export | compact |

> **Skeleton.** Детальний контент — на Phase 3 checkpoint.

---

## 1. Body measurements [PROG-001]
**Compact · Skeleton.** Логування `weight`, `height`, `body_fat_percent`, обмірів (`chest`, `waist`, `hips`, `biceps`, `thigh`) — кожен запис з `measured_at`.

- API: `POST /clients/{id}/body-measurements`, `GET /clients/{id}/body-measurements?from=&to=`
- DB: `body_measurements` (long format: `client_id`, `metric_type enum`, `value numeric`, `unit enum`, `measured_at`)
- Permissions: trainer пише і читає для своїх клієнтів; client пише і читає для себе.

## 2. Progress charts [PROG-002]
**Compact · Skeleton.** Time-series chart per metric. Backend агрегує (downsample для довгих періодів — наприклад, per week для year-view).

- API: `GET /clients/{id}/body-measurements/chart?metric=weight&period=3m&granularity=day`
- Response: array of `{ date, value }` для chart.

## 3. Personal Records & 1RM auto-detect [PROG-003]
**Full · Skeleton.** При `WorkoutLogSetCreated` → listener перевіряє чи це новий PR (max weight × reps). Для 1RM використовується Epley formula: `1RM = weight × (1 + reps/30)`.

- DB: `personal_records` (з `client_id`, `exercise_id`, `weight_kg`, `reps`, `estimated_1rm`, `achieved_at`, `workout_log_set_id` FK)
- Logic: on new set, compare estimated_1rm vs existing best for `(client_id, exercise_id)`. If new > old → upsert PR row + emit `PersonalRecordSet` event.
- Events: `PersonalRecordSet` → push клієнту "🏆 New PR!"

## 4. CSV export [PROG-004]
**Compact · Skeleton.** Експорт усіх body measurements + workout history + PRs у CSV (або ZIP з кількома файлами).

- API: `POST /clients/{id}/progress/export`
- Job: `BuildProgressExportJob` → email з signed URL.
