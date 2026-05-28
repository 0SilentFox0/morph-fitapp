# Features — Programs

**Модуль:** Programs · **Phase:** 1 · **Файлів-сусідів:** [`../programs.md`](../programs.md) (technical)

2 фічі.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | PRG-001 | Program management | full |
| 2 | PRG-002 | Program assignment to clients | full |

> **Skeleton.** Детальний контент — на Phase 1 checkpoint.

---

## 1. Program management [PRG-001]

**Phase:** 1 · **Стиль:** full · **Status:** skeleton

CRUD тренувальних програм: створення (з ім'ям, описом, обкладинкою, exercise list з sets/reps/weight defaults, video gallery), редагування, видалення (soft, бо може бути assigned), перегляд бібліотеки (list/grid з фільтрами по type, тривалості). Counters: views, likes.

**Заплановані user stories:**
- *Як trainer, я хочу створити програму тренування з набором вправ і параметрами.*
- *Як trainer, я хочу редагувати існуючу програму (зміни не порушують вже assigned).*
- *Як trainer, я хочу бачити популярні мої програми (views/likes).*

**Технічна спека:**
- API: [`../programs.md`](../programs.md) § `GET /programs`, `POST /programs`, `PATCH /programs/{id}`, `DELETE /programs/{id}`, `POST /programs/{id}/like`
- DB: `programs`, `program_exercises`, `program_videos`

---

## 2. Program assignment to clients [PRG-002]

**Phase:** 1 · **Стиль:** full · **Status:** skeleton

Тренер призначає програму клієнту → з'являється у client's home view. Один client може мати кілька активних програм. Зняття призначення — soft.

**Заплановані user stories:**
- *Як trainer, я хочу призначити програму одному або кільком клієнтам.*
- *Як trainer, я хочу зняти призначення.*
- *Як client, я хочу бачити свої поточні програми.*

**Технічна спека:**
- API: [`../programs.md`](../programs.md) § `POST /programs/{id}/assign`, `DELETE /client-programs/{id}`, `GET /me/programs` (для клієнта)
- DB: `client_programs` (з `client_id`, `program_id`, `assigned_at`, `removed_at`)
- Events: `ProgramAssigned`, `ProgramUnassigned`
