# Features — Exercises

**Модуль:** Exercises · **Phase:** 1 · **Файлів-сусідів:** [`../exercises.md`](../exercises.md) (technical)

2 фічі. Exercises — будівельні блоки тренувальних програм.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | EXR-001 | Exercise library management | compact |
| 2 | EXR-002 | Attachment to programs | compact |

---

## 1. Exercise library management [EXR-001]

**Phase:** 1 · **Стиль:** compact

### Контекст

Кожен trainer має власну бібліотеку вправ: `name`, `description` (markdown), `muscle_groups` (string[]), опційне `video_file` (через [`FIL-001`](files.md) — purpose `exercise_video`), опційні `equipment` tags. Підтримує search по name і фільтр по muscle group.

### User stories

- **US-EXR-001** — *Як trainer, я хочу створити власну бібліотеку вправ з відео-інструкціями і описом.*
- **US-EXR-002** — *Як trainer, я хочу шукати вправу по name (autocomplete у session form).*
- **US-EXR-003** — *Як trainer, я хочу фільтрувати вправи по м'язових групах при додаванні до програми.*
- **US-EXR-004** — *Як trainer, я хочу редагувати вправу (зміна не порушує програми, де вона використовується).*

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `POST /v1/exercises` з `{ name: "Squat", description: "...", muscle_groups: ["quads", "glutes"], video_file_id: <fileId> }` *Then* `201`, exercise створено.
- **AC-2** — *Given* trainer *When* `GET /v1/exercises?q=squ&muscle_group=quads&cursor=` *Then* `200` з cursor-paginated list, фільтр ILIKE по name + JSON-contains для muscle group.
- **AC-3** — *Given* trainer *When* `PATCH /v1/exercises/{id}` з diff *Then* `200`; зміни **не каскадуються** на існуючі `program_exercises` (там захоплено snapshot).
- **AC-4** — *Given* exercise з активним usage у програмах *When* `DELETE /v1/exercises/{id}` *Then* `409 has_dependencies` з `{ programs_count: 3 }`. Запропоновано: archive instead.
- **AC-5** — *Given* exercise без використання *When* `DELETE` *Then* `204`. Video file (якщо є) → видаляється async через `OrphanFileCleanupJob`.
- **AC-6** — *Given* invalid `video_file_id` (не існує / не своє / не purpose=exercise_video) *Then* `422`.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ для своїх (CRUD) |
| Client | ✅ read для exercises у своїх призначених programs (через `client_programs`) |
| Admin | ✅ |

### Edge cases

- **EC-1** — Trainer reassigned video (PATCH з новим `video_file_id`) — старий file → orphan → cleanup.
- **EC-2** — Concurrent edit з різних device — last-write-wins; optimistic locking — post-MVP.
- **EC-3** — `muscle_groups` enum: defined у config (`config/exercises.php`: chest, back, shoulders, biceps, triceps, quads, hamstrings, glutes, calves, abs, cardio, mobility, full_body). Invalid values → `422`.

### Технічна спека

- API: [`../exercises.md`](../exercises.md) § `GET /exercises?q=&muscle_group=&cursor=`, `POST /exercises`, `PATCH /exercises/{id}`, `DELETE /exercises/{id}`
- DB: `exercises` (з `trainer_id`, `name`, `description text`, `muscle_groups jsonb`, `equipment jsonb`, `video_file_id` FK nullable, `archived_at`)
- Index: `(trainer_id, name)`, GIN on `muscle_groups`
- Events: `ExerciseCreated`, `ExerciseUpdated`, `ExerciseDeleted`

---

## 2. Attachment to programs [EXR-002]

**Phase:** 1 · **Стиль:** compact

### Контекст

Прикріплення вправи до програми зі специфічними **defaults** (sets, reps, weight, rest, notes), а також **порядком** (для drag-and-drop у frontend). `program_exercises` — це snapshot-зв'язок: якщо exercise edited пізніше, програма зберігає стару конфігурацію (а не каскадно оновлюється — це захищає тренерів від несподіваних змін у assigned клієнтам програмам).

### User stories

- **US-EXR-005** — *Як trainer, я хочу додати вправу до програми з конкретними sets/reps/weight.*
- **US-EXR-006** — *Як trainer, я хочу змінити порядок вправ у програмі (drag-and-drop).*
- **US-EXR-007** — *Як trainer, я хочу видалити вправу зі специфічної програми (інші програми не зачіпаються).*

### Acceptance criteria

- **AC-1** — *Given* program і exercise тренера *When* `POST /v1/programs/{programId}/exercises` з `{ exercise_id, sets: 3, reps: 10, weight_kg: 50, rest_seconds: 90, notes: "warm up first" }` *Then* `201`. `program_exercises.order` = max(existing order) + 1.
- **AC-2** — *Given* trainer *When* `PATCH /v1/program-exercises/{id}` з `{ sets: 4 }` *Then* `200`; зміна впливає тільки на цю програму, не на сам exercise.
- **AC-3** — *Given* trainer *When* `POST /v1/programs/{programId}/exercises/reorder` з `{ ordered_ids: [3, 1, 2] }` *Then* `200`, `program_exercises.order` оновлено per masks.
- **AC-4** — *Given* trainer *When* `DELETE /v1/program-exercises/{id}` *Then* `204`. Інші `program_exercises` re-numbered? — Ні, дозволяємо gaps (next add fills max+1).
- **AC-5** — *Given* attempt прикріпити exercise з іншого trainer'а *Then* `403`.
- **AC-6** — *Given* sets/reps/weight negative або > limits *Then* `422` (limits: sets 1-50, reps 1-1000, weight_kg 0-1000, rest_seconds 0-3600).

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ для своїх programs |
| Client | ✅ read для своїх assigned programs |
| Admin | ✅ |

### Edge cases

- **EC-1** — Trainer видалив exercise, що використовується в кількох programs: FK на `program_exercises.exercise_id` → SET NULL? Или CASCADE? **Запропонована поведінка:** SET NULL — програма зберігає snapshot (`name`, `sets`, `reps`...) у локальних полях `program_exercises.name_snapshot`, отже program залишиться working навіть з deleted exercise.
- **EC-2** — Order collision (race коли двоє додають exercise одночасно до тієї ж program): UNIQUE на `(program_id, order)` + retry в Service із max+1 розрахунком всередині transaction.
- **EC-3** — Reorder з `ordered_ids` що містить чужі або відсутні `program_exercises.id`: `422 invalid_ordered_ids`.

### Технічна спека

- API: [`../exercises.md`](../exercises.md) § `POST /programs/{programId}/exercises`, `PATCH /program-exercises/{id}`, `DELETE /program-exercises/{id}`, `POST /programs/{programId}/exercises/reorder`
- DB: `program_exercises` (з `program_id` FK CASCADE, `exercise_id` FK SET NULL, `order int`, `sets`, `reps`, `weight_kg numeric(6,2)`, `rest_seconds`, `notes text`, `name_snapshot`, `created_at`)
- UNIQUE: `(program_id, order)` (deferred constraint для reorder transaction)
- Events: `ProgramExerciseAdded`, `ProgramExerciseUpdated`, `ProgramExerciseRemoved`, `ProgramExercisesReordered`

---

## Залежності модуля Exercises

- **Залежить від:** Auth, Files (для video), Programs (бо program_exercises — link).
- **Залежать від нього:** Programs (через `program_exercises`), Workout Tracking (через `workout_log_sets.exercise_id`), Progress (через PR per exercise).
