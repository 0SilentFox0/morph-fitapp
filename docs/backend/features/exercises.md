# Features — Exercises

**Модуль:** Exercises · **Phase:** 1 · **Файлів-сусідів:** [`../exercises.md`](../exercises.md) (technical)

2 фічі.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | EXR-001 | Exercise library management | compact |
| 2 | EXR-002 | Attachment to programs | compact |

> **Skeleton.** Детальний контент — на Phase 1 checkpoint.

---

## 1. Exercise library management [EXR-001]

**Phase:** 1 · **Стиль:** compact · **Status:** skeleton

CRUD вправ у бібліотеці тренера: створення (name, description, муязні групи, video upload через [Files](files.md)), редагування, видалення, search/filter.

**User stories:**
- *Як trainer, я хочу зберігати власну бібліотеку вправ з відео-інструкціями.*
- *Як trainer, я хочу шукати вправу по name або фільтрувати по м'язовій групі.*

**Технічна спека:**
- API: [`../exercises.md`](../exercises.md) § `GET /exercises?q=&muscle_group=`, `POST /exercises`, `PATCH /exercises/{id}`, `DELETE /exercises/{id}`
- DB: `exercises` (з `trainer_id`, `name`, `description`, `muscle_groups jsonb`, `video_file_id` FK)

---

## 2. Attachment to programs [EXR-002]

**Phase:** 1 · **Стиль:** compact · **Status:** skeleton

Прикріплення вправи до програми зі специфічними defaults: sets, reps, weight, rest time, order у програмі.

**User stories:**
- *Як trainer, я хочу додати вправу в програму з конкретними параметрами sets/reps.*
- *Як trainer, я хочу змінити порядок вправ у програмі (drag-and-drop → reorder).*

**Технічна спека:**
- API: [`../exercises.md`](../exercises.md) § `POST /programs/{id}/exercises`, `PATCH /program-exercises/{id}`, `DELETE /program-exercises/{id}`, `POST /programs/{id}/exercises/reorder`
- DB: `program_exercises` (з `program_id`, `exercise_id`, `order`, `sets`, `reps`, `weight_kg`, `rest_seconds`)
