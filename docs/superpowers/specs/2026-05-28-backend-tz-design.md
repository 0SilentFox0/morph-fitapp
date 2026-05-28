# Design Spec — Backend TZ для FitConnect

**Дата:** 2026-05-28
**Автор:** silentfox + Claude (brainstorming session)
**Статус:** Draft v2 (pending user review)

> **Зміна v1 → v2:** після уточнення з користувачем рівень деталізації підвищено до feature-level (user stories + flow + AC + permissions + edge cases для кожної фічі), файли розбиті помодульно.

## 1. Контекст

FitConnect — мобільний застосунок для фітнес-тренерів і їхніх клієнтів, об'єднує функції кількох інструментів, якими тренер користується в роботі: CRM, чат, бібліотека тренувань, програми, календар, відстеження прогресу клієнта, ручний облік платежів і пакетів.

Поточний стан:
- **Фронтенд:** React Native (Expo) + TypeScript + Zustand. ~25% готовий до прод (UI більшість зроблена, логіка частково підключена, бекенду немає).
- **Документація:** є `TECH_DOC.md` (загальний стек, застарілий в частині backend stack) та `docs/backend/` з DB-схемою і per-domain API-специфікаціями для sessions, programs, clients, transactions, analytics, user, chat. UI flows зафіксовані в `docs/flows/`.
- **Бекенд:** 0% реалізовано.

## 2. Ціль документа

Створити **повне feature-level ТЗ для бекенд-розробника (solo)**, де:
1. Кожна фіча описана повністю: user stories, user flow з UI mapping, acceptance criteria (Given/When/Then), permissions матриця, edge cases, посилання на технічну спеку.
2. Технічні API/DB деталі залишаються в існуючих per-domain specs (`docs/backend/{module}.md`).
3. Парасольковий документ містить архітектуру, NFR, безпеку, real-time, DevOps, roadmap.

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
| Calendar sync | Google Calendar API + Apple Calendar (через ICS feed) |
| OAuth providers | Google + Apple + Facebook (через Socialite) |
| SMS verification | **Не в MVP** |

### 3.2 Архітектура

- **Modular monolith** на Laravel з чіткими module boundaries.
- Service-layer pattern; контролери тонкі.
- **Event-driven WebSocket broadcasting** через Laravel Broadcasting + Reverb.
- Один моб-додаток з **role-based навігацією** (`role: trainer | client | admin`).
- **Idempotency keys** на критичні POST'и.
- **Offline-first** на стороні клієнта (mobile pendinguue + retry).

## 4. Скоуп MVP+ (НЕ змінився з v1)

### Включено

Auth · Onboarding (trainer + client) · Users/Profile · Sessions+Calendar · Programs · Exercises · Clients(CRM) · Workout Tracking (real-time) · Progress Metrics · Packages/Subscriptions · Transactions (manual) · Chat (real-time) · Analytics · Files/Media · Push Notifications · External Integrations (Google/Apple Calendar, OAuth providers)

### Не включено (post-MVP)

Nutrition · Фото-прогрес · Gamification · Live video · Прямі онлайн-оплати · SMS verification · Multi-tenancy · AI-генерація програм

## 5. Формат опису фічі

Кожна фіча в `docs/backend/features/{module}.md` має таку структуру:

```markdown
### Feature: <Назва фічі> [FE-CODE-NNN]

#### Контекст
1-2 абзаци — що це, навіщо, бізнес-цінність.

#### User stories
- **US-CODE-001** — *Як <роль>, я хочу <дію>, щоб <ціль>.*
- **US-CODE-002** — *Як <роль>, я хочу <дію>, щоб <ціль>.*

#### User flow + UI mapping
1. Крок 1 (екран: `ScreenName.tsx`, кнопка X)
2. Крок 2 (API call: `POST /v1/resource`)
3. Крок 3 (backend дія, broadcast event, side effect)
4. ...

#### Acceptance criteria (Given/When/Then)
- **AC-1** — *Given* ... *When* ... *Then* ...
- **AC-2** — ...

#### Permissions матриця
| Роль | Дія A | Дія B | Дія C |
|---|---|---|---|
| Trainer | ✅ обмеження | ✅ | ❌ |
| Client | ❌ | ✅ власне | ❌ |
| Admin | ✅ | ✅ | ✅ |

#### Edge cases
| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | ... | ... |
| EC-2 | ... | ... |

#### Зв'язок з технічною спекою
- API: `docs/backend/{module}.md` § <endpoint>
- DB: `docs/backend/DB_STRUCTURE.md` § <table>
- Events: `docs/backend/TZ_BACKEND.md` § Real-time → `EventName`
- Jobs: `JobName`
```

## 6. Структура артефакту

```
docs/backend/
├── TZ_BACKEND.md                ← НОВИЙ парасольковий документ (architecture, NFR, security, real-time, devops, roadmap, index)
├── README.md                    ← ОНОВИТИ (новий index)
├── DB_STRUCTURE.md              ← ОНОВИТИ (нові таблиці)
├── DB_SCHEMA_TREE.md            ← ОНОВИТИ (regenerate)
│
├── features/                    ← НОВА папка (feature-level ТЗ)
│   ├── README.md                ← індекс модулів
│   ├── auth.md
│   ├── onboarding.md
│   ├── users.md
│   ├── sessions.md
│   ├── programs.md
│   ├── exercises.md
│   ├── clients.md
│   ├── workout-tracking.md
│   ├── progress.md
│   ├── packages.md
│   ├── transactions.md
│   ├── chat.md
│   ├── analytics.md
│   ├── files.md
│   ├── notifications.md
│   └── integrations.md
│
├── auth.md                      ← НОВИЙ (technical API+DB)
├── onboarding.md                ← НОВИЙ (technical)
├── workout-tracking.md          ← НОВИЙ (technical)
├── progress.md                  ← НОВИЙ (technical)
├── packages.md                  ← НОВИЙ (technical)
├── files.md                     ← НОВИЙ (technical)
├── notifications.md             ← НОВИЙ (technical)
├── integrations.md              ← НОВИЙ (technical)
├── exercises.md                 ← НОВИЙ (technical, виділити з programs)
│
├── sessions.md                  ← ДОПОВНИТИ (calendar sync, packages link, statuses)
├── programs.md                  ← ДОПОВНИТИ
├── transactions.md              ← ДОПОВНИТИ (package_id link)
├── chat.md                      ← ДОПОВНИТИ (Reverb events)
└── clients.md, analytics.md, user.md  ← без істотних змін
```

## 7. Структура `TZ_BACKEND.md` (парасолька, ~30-50 сторінок)

1. **Контекст і цілі**
2. **Глосарій ролей і термінів** (Trainer, Client, Session, Program, Exercise, Package, Subscription, Transaction, WorkoutLog, Personal Record)
3. **Архітектура** — modular monolith, діаграма модулів, стек по шарах
4. **API conventions** — versioning, auth, pagination, error format, ISO 8601, idempotency
5. **Real-time (Laravel Reverb)** — канали, events, payloads, authorization
6. **Безпека** — refresh-token rotation, rate limiting, CORS, encryption, GDPR, RBAC, signed URLs
7. **NFR** — API p95, WS concurrent, uptime, бекапи, observability
8. **DevOps та інфраструктура (загально)** — Docker, CI/CD, env, queue workers, scheduled jobs
9. **Roadmap і фази** — Phase 0/1/2/3
10. **Index фіч** — лінки на всі `features/*.md` з коротким описом

## 8. Перелік фіч по модулях (повний)

Загальна оцінка: **~95-110 фіч**. По модулях:

### 8.1 Auth & Identity (`features/auth.md`) — 10 фіч
- AUTH-001: Реєстрація email+password з email verification
- AUTH-002: Логін email+password (з rate limiting + brute force protection)
- AUTH-003: OAuth login — Google
- AUTH-004: OAuth login — Apple
- AUTH-005: OAuth login — Facebook
- AUTH-006: Refresh token rotation
- AUTH-007: Logout (single session)
- AUTH-008: Logout all sessions
- AUTH-009: Forgot password / reset flow
- AUTH-010: Account deletion (GDPR right to erasure)
- AUTH-011: Change password
- AUTH-012: Email change з re-verification

### 8.2 Onboarding (`features/onboarding.md`) — 6 фіч
- ONB-001: Trainer onboarding flow (13 steps з збереженням progress)
- ONB-002: Client onboarding flow (skeleton — поки 3 кроки: name, goals, current shape; розширити post-MVP)
- ONB-003: Skip і resume onboarding
- ONB-004: Preview profile перед finalize
- ONB-005: Завершення onboarding → `onboarding_completed_at`
- ONB-006: Зміна role після onboarding (обмежено)

### 8.3 Users & Profile (`features/users.md`) — 6 фіч
- USR-001: Перегляд свого профіля
- USR-002: Перегляд чужого профіля (trainer↔client)
- USR-003: Редагування власного профіля
- USR-004: Зміна аватара
- USR-005: Налаштування (timezone, locale, notification preferences)
- USR-006: Перегляд points / experience badges

### 8.4 Sessions & Calendar (`features/sessions.md`) — 13 фіч
- SES-001: Створення сесії
- SES-002: Редагування сесії
- SES-003: Скасування сесії
- SES-004: Reschedule (перенесення)
- SES-005: Перегляд по місяцях (calendar view)
- SES-006: Перегляд по днях (day view)
- SES-007: Пошук сесій
- SES-008: Recurring sessions (щотижневі тощо)
- SES-009: Conflict detection
- SES-010: Прив'язка до package
- SES-011: Session statuses (planned/in-progress/completed/canceled/no-show)
- SES-012: Notifications / reminders (24h, 1h before)
- SES-013: Calendar sync (Google) — див. також integrations
- SES-014: Calendar sync (Apple via ICS) — див. також integrations

### 8.5 Programs (`features/programs.md`) — 7 фіч
- PRG-001: Створення програми
- PRG-002: Редагування програми
- PRG-003: Видалення програми
- PRG-004: Перегляд бібліотеки (list+grid)
- PRG-005: Призначення програми клієнту
- PRG-006: Перегляд призначеної програми (на клієнтській стороні)
- PRG-007: Views/likes counters

### 8.6 Exercises (`features/exercises.md`) — 5 фіч
- EXR-001: Створення вправи (з video upload)
- EXR-002: Редагування вправи
- EXR-003: Видалення вправи
- EXR-004: Пошук/фільтрація вправ
- EXR-005: Прикріплення до програми (з sets/reps/weight defaults)

### 8.7 Clients (CRM) (`features/clients.md`) — 8 фіч
- CLT-001: Список клієнтів (з фільтрами, search)
- CLT-002: Створення клієнта в roster
- CLT-003: Інвайт клієнта (email link з deep link)
- CLT-004: Профіль клієнта (overview)
- CLT-005: Notes (приватні нотатки тренера)
- CLT-006: Tags (категорії)
- CLT-007: Архівація клієнта
- CLT-008: Видалення (з cascade)

### 8.8 Workout Tracking (`features/workout-tracking.md`) — 7 фіч
- WT-001: Початок live workout session
- WT-002: Логування sets/reps/weight (тренер)
- WT-003: Логування клієнтом (real-time)
- WT-004: Real-time sync між сторонами (Reverb)
- WT-005: Завершення сесії (mark completed)
- WT-006: Перегляд історії workout logs
- WT-007: Offline mode + sync resolution (last-write-wins з version)

### 8.9 Progress Metrics (`features/progress.md`) — 6 фіч
- PRG-001: Логування ваги/росту/body fat
- PRG-002: Логування обмірів тіла (chest, waist, hips, biceps, thigh)
- PRG-003: Графіки прогресу (за period)
- PRG-004: Personal Records (auto-detected з workout log)
- PRG-005: 1RM calculation (Epley formula)
- PRG-006: Експорт даних (CSV)

### 8.10 Packages & Subscriptions (`features/packages.md`) — 7 фіч
- PKG-001: Створення package template (тренер)
- PKG-002: Призначення пакета клієнту (`client_packages`)
- PKG-003: Декрементування при completed session
- PKG-004: Нагадування про вичерпання (push + in-app)
- PKG-005: Перегляд статусу пакетів клієнта
- PKG-006: Архівація / закриття пакета
- PKG-007: Debt tracking (коли пакет вичерпано, оплата не прийшла)

### 8.11 Transactions (`features/transactions.md`) — 7 фіч
- TRX-001: Створення транзакції (manual)
- TRX-002: Прив'язка до package
- TRX-003: Редагування транзакції
- TRX-004: Видалення транзакції
- TRX-005: Пошук/фільтрація
- TRX-006: Експорт списку (CSV)
- TRX-007: Withdraw flow (TBD — потенційно тільки трекінг, що тренер вивів суму)

### 8.12 Chat (`features/chat.md`) — 9 фіч
- CHT-001: Список чатів (last message preview)
- CHT-002: Створення чату (1-to-1)
- CHT-003: Надсилання текстового повідомлення
- CHT-004: Надсилання медіа (фото, відео, документ)
- CHT-005: Read receipts (delivered, read)
- CHT-006: Typing indicators (real-time)
- CHT-007: Push notifications на нове повідомлення
- CHT-008: Пошук в історії чату
- CHT-009: Видалення повідомлень (soft delete)

### 8.13 Analytics (`features/analytics.md`) — 6 фіч
- ANL-001: Income over time chart
- ANL-002: Revenue by source chart
- ANL-003: Profile views (counter + chart)
- ANL-004: Trainings count metric
- ANL-005: Subscriptions / active packages metric
- ANL-006: Custom timeframe selector (week/month/custom)

### 8.14 Files & Media (`features/files.md`) — 5 фіч
- FIL-001: Upload через signed URL
- FIL-002: Image processing (thumbnails, resize)
- FIL-003: Video upload (pass-through, без transcoding в MVP)
- FIL-004: Видалення файлу
- FIL-005: Access control (private signed URLs з expiration)

### 8.15 Notifications (`features/notifications.md`) — 7 фіч
- NTF-001: Реєстрація device token (FCM)
- NTF-002: Push на майбутню сесію (24h, 1h before)
- NTF-003: Push на нове повідомлення
- NTF-004: Push на призначений пакет
- NTF-005: Push на нагадування про оплату
- NTF-006: In-app notification feed
- NTF-007: Налаштування notification preferences (per-channel toggle)

### 8.16 External Integrations (`features/integrations.md`) — 4 фічі
- INT-001: Google Calendar OAuth + bi-directional sync
- INT-002: Apple Calendar (subscribe to ICS feed)
- INT-003: OAuth providers connect/disconnect (Google, Apple, Facebook)
- INT-004: Webhook handling (calendar update events → update local)

**Total:** ~113 фіч (точні номери уточняться при написанні).

## 9. Послідовність роботи (для writing-plans)

1. Створити скелет `TZ_BACKEND.md` (заголовки 10 секцій з 1-2 реченнями кожна).
2. Створити `docs/backend/features/` + `README.md` з index'ом.
3. Створити скелети `features/*.md` для всіх 16 модулів — пустий шаблон з переліком фіч.
4. Заповнити `features/*.md` по черзі (рекомендована послідовність — за залежностями):
   1. auth → users → onboarding
   2. files → notifications
   3. clients → programs → exercises → sessions
   4. packages → transactions
   5. workout-tracking → progress
   6. chat
   7. analytics
   8. integrations
5. Створити нові technical specs: `auth.md`, `onboarding.md`, `workout-tracking.md`, `progress.md`, `packages.md`, `files.md`, `notifications.md`, `integrations.md`, `exercises.md`.
6. Доповнити існуючі: `sessions.md`, `programs.md`, `transactions.md`, `chat.md`.
7. Оновити `DB_STRUCTURE.md` + `DB_SCHEMA_TREE.md`.
8. Заповнити секції `TZ_BACKEND.md` (architecture, NFR, security, real-time, devops, roadmap).
9. Оновити `docs/backend/README.md` (індекс).
10. Оновити `TECH_DOC.md` — backend секція → PHP+Laravel.

## 10. Constraints і принципи

- **Не дублювати** інфо між feature-spec і technical-spec — посилатися.
- **Не описувати фронтенд** — лише вимоги до бекенду; UI-крок лише для контексту.
- **Прагматизм > повнота** — solo dev, Laravel "батареї в комплекті".
- **YAGNI** — без надлишкових абстракцій.
- **DB-first thinking** — модулі починаються з таблиць та інваріантів.
- **Events як перший клас** — cross-module → через Laravel Events.
- **Кожна фіча — атомарна** — окрема секція, окремий код (AUTH-001 і т.д.), легко цитувати в imp plan і PR.

## 11. Outputs цього проекту

- 1× `TZ_BACKEND.md` (~30-50 сторінок)
- 16× `features/*.md` (~10-30 сторінок кожен; total ~250-300 сторінок)
- 9× нових technical specs у `docs/backend/`
- 4× доповнених technical specs
- Оновлений `DB_STRUCTURE.md` + `DB_SCHEMA_TREE.md`
- Оновлені `README.md` і `TECH_DOC.md`

## 12. Відкриті питання (resolve пізніше)

- **Hosting / deployment** — відкладено; у ТЗ — лише вимоги.
- **Email / SMS / S3 провайдери** — вибір пізніше; у ТЗ — лише вимоги.
- **Apple Calendar deep dive** — рішення (ICS feed з token-based URL) при написанні `integrations.md`.
- **Client onboarding обсяг** — поки 3-5 кроків (name, goals, current shape, link до trainer); розширити post-MVP.
- **Withdraw flow** — TBD при написанні `transactions.md`; ймовірно тільки логування (без реального withdraw API).
- **Admin scope** — поки тільки Filament-панель з RBAC; admin user stories не описуються в MVP.
