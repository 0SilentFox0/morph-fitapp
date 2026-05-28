# Design Spec — Backend TZ для FitConnect

**Дата:** 2026-05-28
**Автор:** silentfox + Claude (brainstorming session)
**Статус:** Draft (pending user review)

## 1. Контекст

FitConnect — мобільний застосунок для фітнес-тренерів і їхніх клієнтів, об'єднує функції кількох інструментів, якими тренер користується в роботі: CRM, чат, бібліотека тренувань, програми, календар, відстеження прогресу клієнта, ручний облік платежів і пакетів.

Поточний стан:
- **Фронтенд:** React Native (Expo) + TypeScript + Zustand. ~25% готовий до прод (UI більшість зроблена, логіка частково підключена, бекенду немає).
- **Документація:** є `TECH_DOC.md` (загальний стек) та `docs/backend/` з DB-схемою і per-domain API-специфікаціями для sessions, programs, clients, transactions, analytics, user, chat. UI flows зафіксовані в `docs/flows/`.
- **Бекенд:** 0% реалізовано.
- **TECH_DOC.md розходиться з рішенням:** там Node.js, але рішення — PHP 8.4 + Laravel 12.

## 2. Ціль документа

Створити **повне ТЗ для одного бекенд-розробника**, що:
1. Закриває прогалини в існуючій документації (auth деталі, нові модулі, NFR, безпека, real-time, інфраструктура).
2. Виступає **парасолькою** над існуючими per-domain specs у `docs/backend/`.
3. Дає прагматичний план реалізації MVP+, без надлишкового boilerplate.

## 3. Зафіксований стек і архітектура

### 3.1 Стек

| Шар | Технологія |
|---|---|
| Мова | PHP 8.4 |
| Фреймворк | Laravel 12 |
| БД | PostgreSQL |
| ORM | Eloquent |
| Auth | Laravel Sanctum (API tokens) + custom refresh-token rotation + Laravel Socialite (OAuth) |
| Real-time | Laravel Reverb (WebSocket + Broadcasting) |
| Cache / Queue driver | Redis |
| Queue management | Laravel Queue + Laravel Horizon |
| Storage | S3-compatible (через Laravel Filesystem) |
| Push | Firebase Cloud Messaging |
| Admin panel | Filament |
| Observability | Laravel Telescope (dev) + Laravel Pulse (prod) |
| Calendar sync | Google Calendar API + Apple Calendar (CalDAV або native через клієнт) |
| OAuth providers | Google + Apple + Facebook (через Socialite) |
| SMS verification | **Не входить в MVP** |

### 3.2 Архітектура

- **Modular monolith** на Laravel.
- Чіткі **module boundaries** (один модуль = одна доменна область).
- Service-layer pattern всередині модуля; контролери лишаються тонкими.
- **Event-driven WebSocket broadcasting** через Laravel Broadcasting + Reverb.
- Один моб-додаток з **role-based навігацією** (`role: trainer | client | admin`).

## 4. Скоуп MVP+

### 4.1 Включено

| Модуль | Існуюча документація | Потрібна нова |
|---|---|---|
| Auth & Identity | частково в `user.md` | **Так** (`auth.md`) |
| Users & Profile | `user.md` | Доповнити |
| Onboarding (trainer + client) | — | **Так** (`onboarding.md`) |
| Sessions & Calendar | `sessions.md` | Доповнити calendar sync |
| Programs & Exercises Library | `programs.md` | Доповнити exercises CRUD |
| Clients (CRM) | `clients.md` | — |
| Workout Tracking | — | **Так** (`workout-tracking.md`) |
| Progress Metrics | — | **Так** (`progress.md`) |
| Packages & Subscriptions | — | **Так** (`packages.md`) |
| Transactions & Payments (manual) | `transactions.md` | Доповнити packages-link |
| Chat & Messaging | `chat.md` | Доповнити Reverb events |
| Analytics | `analytics.md` | — |
| Files & Media | — | **Так** (`files.md`) |
| Push Notifications | — | **Так** (`notifications.md`) |
| External Integrations (Calendar, OAuth) | — | **Так** (`integrations.md`) |

### 4.2 Не включено (post-MVP)

- Nutrition (раціони, KCAL/БЖВ, foods catalog, meal plans)
- Фото-прогрес (before/after photo upload)
- Gamification / achievements (крім "You got paid" що вже в analytics)
- Live video (відеодзвінки в чаті)
- Прямі онлайн-оплати (Stripe/Paddle integration)
- SMS verification
- Multi-tenancy / team accounts
- AI-генерація програм

## 5. Бізнес-моделі ключових механік

### 5.1 Оплати — без прямих чарджів

Дві комбіновані моделі:
1. **Ручна фіксація транзакцій** — тренер вводить факт оплати (клієнт, сума, дата, тип, статус, метод) після отримання коштів зовні.
2. **Пакети/підписки з трекінгом** — тренер створює пакет (наприклад "10 тренувань / місяць за X грн"), система автоматично декрементує лічильник із кожною проведеною сесією, нагадує про вичерпання, нараховує "борг" коли пакет закінчився.

Транзакції можуть бути прив'язані до пакета (`package_id` опціональний FK у `transactions`).

### 5.2 Workout tracking — real-time двостороння синхронізація

- І тренер, і клієнт можуть логувати виконання вправ під час сесії.
- WebSocket-канал на сесію (`private-session.{sessionId}`).
- Конфлікт-resolution: last-write-wins на рівні (`exercise_id`, `set_index`); подія `WorkoutLogUpdated` містить `actor_id`, `version`.
- Offline-first: клієнт пише локально, синхронізує при відновленні зв'язку (idempotency keys на POST).

### 5.3 Progress metrics

- **Body measurements:** вага, ріст, body fat % + обміри (груди, талія, стегна, біцепс, стегно) — таблиця `body_measurements` з `(client_id, measured_at, metric_type, value)`.
- **Personal Records / 1RM:** автоматичний підрахунок із workout log (Epley formula); таблиця `personal_records` з `(client_id, exercise_id, weight_kg, reps, performed_at, estimated_1rm)`.
- Без фото-прогресу в MVP.

## 6. Структура артефакту

Створити документ-парасольку **`docs/backend/TZ_BACKEND.md`** і доповнити папку `docs/backend/` новими per-domain specs:

```
docs/backend/
├── TZ_BACKEND.md             ← новий парасольковий документ
├── README.md                 ← оновити: додати посилання на нові файли
├── DB_STRUCTURE.md           ← оновити: додати нові таблиці
├── DB_SCHEMA_TREE.md         ← оновити: regenerate ER + ASCII tree
├── auth.md                   ← новий
├── onboarding.md             ← новий
├── workout-tracking.md       ← новий
├── progress.md               ← новий
├── packages.md               ← новий
├── files.md                  ← новий
├── notifications.md          ← новий
├── integrations.md           ← новий
├── sessions.md               ← доповнити calendar sync
├── programs.md               ← доповнити exercises CRUD
├── transactions.md           ← доповнити package_id link
├── chat.md                   ← доповнити Reverb events
├── analytics.md, clients.md, user.md  ← без змін або косметика
```

## 7. Структура `TZ_BACKEND.md`

10 секцій:

1. **Контекст і цілі** — бізнес-задача, бачення MVP, не-MVP, глосарій.
2. **Архітектура** — modular monolith, діаграма модулів, стек по шарах, принципи (service-layer, event-driven broadcasting, domain modules).
3. **Модулі і функціональні вимоги** — для кожного: призначення → use-cases → доменна модель → endpoints (посилання на per-domain spec) → events → permissions.
4. **Модель даних (доповнення)** — нові таблиці (`workout_logs`, `workout_log_sets`, `body_measurements`, `personal_records`, `packages`, `client_packages`, `media_files`, `device_tokens`, `notifications`, `calendar_integrations`) + ER-діаграма.
5. **API conventions** — версіонування (`/v1/`), Bearer-auth, cursor pagination, RFC 7807 errors, ISO 8601 дати, idempotency keys.
6. **Real-time (Laravel Reverb)** — канали, naming, payloads, авторизація, reconnection. Конкретні events: `MessageSent`, `WorkoutLogUpdated`, `SessionStatusChanged`, `NotificationDelivered`.
7. **Безпека** — refresh-token rotation, rate limiting, CSRF/CORS, encryption at rest, GDPR (стирання + експорт), RBAC через Policies, signed URLs для S3.
8. **NFR** — API p95 < 300 ms (MVP), WS ≥ 1000 concurrent (MVP target — поріг для перевірки масштабування), uptime 99.5% (MVP) / 99.9% (post-MVP), бекапи (PITR, daily snapshot, retention 30 днів), observability targets (alerting на error rate, latency, queue lag, WS connections).
9. **DevOps та інфраструктура (загально)** — Docker images, GitHub Actions CI/CD, env management, Postgres backups, queue workers (Horizon), scheduled jobs. **Без вибору хостингу** — перелік сервісів які потрібні (DB, Redis, S3, Reverb instance, app servers, optional CDN).
10. **Roadmap і ризики** — фази (Phase 0: foundation → Phase 1: core CRM → Phase 2: real-time → Phase 3: progress + packages + analytics). Ризики: WS scaling, calendar sync conflicts, file storage costs.

## 8. Структура кожного per-domain spec

Шаблон уже зафіксований існуючими specs (sessions.md, programs.md). Дотримуватись:
- Огляд модуля (1-2 абзаци).
- Endpoints — таблиця (method, path, auth, опис) + детальні шейпи (request/response JSON).
- Помилки.
- Зв'язок з frontend (TASKS, screens).
- Зв'язок з DB-таблицями.
- Events (для модулів з real-time).
- Permissions / role visibility.

## 9. Послідовність роботи (implementation outline)

Цей spec — основа для writing-plans skill. Очікувана послідовність кроків:

1. Створити **скелет** `TZ_BACKEND.md` з усіма 10 секціями (заголовки + 1-2 речення про що буде).
2. Записати **нові per-domain specs** (auth → onboarding → files → notifications → workout-tracking → progress → packages → integrations).
3. Доповнити **існуючі specs** (sessions, programs, transactions, chat).
4. Оновити **DB_STRUCTURE.md** і **DB_SCHEMA_TREE.md** з новими таблицями.
5. Заповнити **секції `TZ_BACKEND.md`** (архітектура, NFR, безпека, real-time, DevOps, roadmap).
6. Оновити `docs/backend/README.md` (індекс).
7. Оновити `TECH_DOC.md` — переписати "Backend" і Auth/Real-time секції під PHP+Laravel.

## 10. Constraints і принципи

- **Не дублювати** інформацію з існуючих specs; посилатись.
- **Не описувати фронтенд** — лише вимоги до бекенду і їхні відповідності з TASKS.md.
- **Прагматизм > повнота** — solo dev, Laravel "батареї в комплекті".
- **YAGNI** — без надлишкових абстракцій, multi-tenancy, generic frameworks.
- **DB-first thinking** — кожен модуль починається з таблиць і інваріантів.
- **Events як перший клас** — будь-що, що cross-module, проходить через Laravel Events.

## 11. Outputs цього проекту

Після виконання writing-plans і implementation:

- 1× новий парасольковий документ — `docs/backend/TZ_BACKEND.md`.
- 7× нових per-domain specs — auth, onboarding, workout-tracking, progress, packages, files, notifications, integrations.
- 4× доповнених specs — sessions, programs, transactions, chat.
- Оновлений `DB_STRUCTURE.md` + `DB_SCHEMA_TREE.md`.
- Оновлений `README.md` (індекс).
- Оновлений `TECH_DOC.md` (backend секція → PHP+Laravel).

## 12. Що залишилось відкритим (resolve пізніше)

- **Hosting / deployment** — конкретний вибір (Forge / Docker+VPS / Kubernetes) — користувач відклав на пізніше; в ТЗ описуємо лише вимоги до інфраструктури.
- **Email provider** — SES / Postmark / SendGrid (вибір пізніше; у ТЗ — лише вимога мати SMTP-провайдер).
- **S3-сумісний провайдер** — AWS S3 / Cloudflare R2 / DigitalOcean Spaces / MinIO (вибір пізніше).
- **Apple Calendar sync deep dive** — Apple не має прямого API як Google. Або через CalDAV, або через iOS calendar permissions на клієнті з ICS-feeds від бекенду. Рішення зафіксуємо при написанні `integrations.md`.
