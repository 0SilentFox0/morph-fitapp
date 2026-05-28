# FitConnect Backend Documentation

Папка містить всю документацію для backend-розробника. Стек: **PHP 8.4 + Laravel 12 + PostgreSQL** (modular monolith).

## Точка входу

**→ [`TECH_TASK.md`](TECH_TASK.md)** — головне технічне завдання. Архітектура, конвенції API, real-time (Reverb), безпека, NFR, DevOps, roadmap, index фіч.

## Структура

```
docs/backend/
├── TECH_TASK.md             ← головний umbrella документ (старт читання)
├── README.md                ← цей файл
├── DB_STRUCTURE.md          ← повна схема БД (таблиці, поля, FK, індекси)
├── DB_SCHEMA_TREE.md        ← Mermaid ER + ASCII tree
└── features/                ← feature-level специфікації (бізнес-логіка)
    ├── README.md            ← карта модулів + шаблони (full / compact)
    └── {module}.md × 16     ← user stories, AC, edge cases, permissions
```

Detailed per-module API specs (endpoints, JSON shapes, validation, DB transactions) **поки не вилучені** в окремі файли — пишуться разом з реалізацією і фіксуються або у відповідному `features/{module}.md` секції "Технічна спека", або у docstrings контролерів/Form Requests / згенерованому OpenAPI.

## Карта модулів (16 шт., 53 фічі)

| Phase | Модуль | Feature spec | Фіч |
|---|---|---|:-:|
| 0 | Auth & Identity | [features/auth.md](features/auth.md) | 5 |
| 0 | Users & Profile | [features/users.md](features/users.md) | 1 |
| 0 | Files & Media | [features/files.md](features/files.md) | 1 |
| 0 | Notifications | [features/notifications.md](features/notifications.md) | 2 |
| 1 | Onboarding | [features/onboarding.md](features/onboarding.md) | 3 |
| 1 | Clients (CRM) | [features/clients.md](features/clients.md) | 3 |
| 1 | Programs | [features/programs.md](features/programs.md) | 2 |
| 1 | Exercises | [features/exercises.md](features/exercises.md) | 2 |
| 1, 2 | Sessions & Calendar | [features/sessions.md](features/sessions.md) | 7 |
| 2 | Chat & Messaging | [features/chat.md](features/chat.md) | 6 |
| 2 | Workout Tracking | [features/workout-tracking.md](features/workout-tracking.md) | 5 |
| 2 | External Integrations | [features/integrations.md](features/integrations.md) | 3 |
| 3 | Packages & Subscriptions | [features/packages.md](features/packages.md) | 4 |
| 3 | Transactions | [features/transactions.md](features/transactions.md) | 4 |
| 3 | Progress Metrics | [features/progress.md](features/progress.md) | 4 |
| 3 | Analytics | [features/analytics.md](features/analytics.md) | 1 |

**Total: 53 фічі** у 4 фазах розробки (~15 тижнів solo dev). Деталі — у [`TECH_TASK.md`](TECH_TASK.md) §9.

## Глобальні конвенції

- **Base URL:** `{API_BASE}/v1/` (наприклад `https://api.fitconnect.app/v1`).
- **Auth:** Bearer token у `Authorization` header (Sanctum + custom refresh-token rotation).
- **Дати:** ISO 8601 з timezone.
- **Errors:** RFC 7807 Problem Details (див. [`TECH_TASK.md`](TECH_TASK.md) §4.5).
- **Idempotency:** `Idempotency-Key` header на критичних POST.

Повний перелік — у [`TECH_TASK.md`](TECH_TASK.md) §4.

## Документи-сусіди (поза backend/)

| Документ | Призначення |
|---|---|
| [`../flows/`](../flows/) | UI flows (home-dashboard, onboarding) — корисні для розуміння frontend-flow |
| [`../TASKS.md`](../TASKS.md) | Jira-style завдання фронту, що відповідають API |
| [`../PROGRESS.md`](../PROGRESS.md) | Прогрес-трекер реалізації по флоу |
| [`../../TECH_DOC.md`](../../TECH_DOC.md) | Загальний high-level tech document (PHP/Laravel) |
