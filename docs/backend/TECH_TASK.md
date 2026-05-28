# FitConnect — Технічне завдання для бекенду

> **Парасольковий документ.** Опис архітектури, конвенцій, нефункціональних вимог, безпеки, real-time, DevOps, roadmap. Деталі кожної фічі — у `docs/backend/features/{module}.md`. Технічні API/DB-специфікації по модулях — у `docs/backend/{module}.md`.

**Версія:** 0.1 (draft)
**Дата:** 2026-05-28
**Аудиторія:** один backend-розробник, що реалізовує MVP+.

---

## 1. Контекст і цілі

### 1.1 Що таке FitConnect

FitConnect — мобільний застосунок (React Native + Expo) для **фітнес-тренерів і їхніх клієнтів**, що замінює одночасно кілька інструментів, якими тренер користується в роботі: CRM, чат із клієнтом, бібліотеку тренувань, конструктор програм, календар, відстеження прогресу, ручний облік платежів і пакетів.

Один моб-додаток обслуговує **обидві ролі** через role-based навігацію: тренер і клієнт логіняться в той самий бінарник, але отримують різні tab-структури і екрани.

### 1.2 Бізнес-проблема, яку розв'язує бекенд

Тренер сьогодні веде клієнтів у 5+ окремих сервісах (Telegram/WhatsApp, Google Calendar, Excel, Notion, окремі fitness-додатки). FitConnect має:

1. **Уніфікувати дані** — один сорс правди про клієнта, його сесії, прогрес, оплати.
2. **Зменшити рутину** — автоматизувати декрементування пакетів, нагадування, синхронізацію календарів.
3. **Дати real-time-зв'язок** — чат і live-логування workout sync синхронно між тренером і клієнтом.
4. **Дати власнику бізнесу аналітику** — дохід, кількість сесій, активні підписки.

### 1.3 Що не входить у MVP

Зафіксовано **поза скоупом** цього ТЗ:

- Nutrition (раціони, KCAL/БЖВ, foods catalog, meal plans).
- Фото-прогрес клієнта (before/after).
- Gamification крім існуючого "You got paid" achievement.
- Live video / відеодзвінки.
- **Прямі онлайн-оплати** (Stripe/Paddle integration) — система лише веде облік.
- SMS verification.
- Multi-tenancy / team-акаунти для гімів.
- AI-генерація програм.

Ці пункти **не реалізовувати**; залишити архітектурні точки розширення на майбутнє лише там, де це безкоштовно (наприклад, `transactions.kind` enum, який можна розширити).

### 1.4 Гайдні принципи розробки

- **Прагматизм > повнота.** Solo dev, Laravel-першочергово, "батареї в комплекті". Не будувати власні аналоги Eloquent/Sanctum/Reverb.
- **YAGNI.** Будь-яка абстракція "на майбутнє" — поза скоупом, поки не існує другого користувача цієї абстракції.
- **DB-first thinking.** Кожна фіча починається з таблиць та інваріантів, потім сервіси, потім контролери.
- **Events як перший клас.** Cross-module зв'язки — через Laravel Events, не через прямі виклики сервісів інших модулів.
- **Idempotency на критичних POST.** Будь-який POST, що створює грошові/relationship-зав'язані сутності, приймає `Idempotency-Key` header.
- **Offline-first на клієнті.** Backend має бути толерантним до retry; всі mutate-операції ідемпотентні (через keys, через UNIQUE constraints, або обидва).

---

## 2. Глосарій ролей і термінів

### 2.1 Ролі

| Роль | Опис |
|---|---|
| **Trainer** | Тренер. Власник бізнесу, веде roster клієнтів, створює програми, проводить сесії, виставляє пакети, фіксує оплати. |
| **Client** | Клієнт тренера. Логиниться в той самий додаток, бачить свій розклад, програми, прогрес, чат з тренером. Може мати або не мати акаунт у додатку (у MVP — `clients` запис може існувати без `user_id`). |
| **Admin** | Власник платформи. Доступ через Filament admin-panel, не моб-додаток. Не описується в feature-spec'ах MVP. |

### 2.2 Бізнес-сутності

| Термін | Визначення |
|---|---|
| **Session** | Заплановане тренування з одним або кількома клієнтами в конкретний час. Має статус (`planned`, `in_progress`, `completed`, `canceled`, `no_show`), тип (Cardio, HIIT, ...), може бути прив'язана до пакета. |
| **Program** | Шаблон тренувальної програми — набір вправ із параметрами (sets/reps/weight defaults), що його тренер може призначити одному або багатьом клієнтам. |
| **Exercise** | Конкретна вправа з назвою, описом, опційним відео. Може існувати в бібліотеці тренера або глобальній (post-MVP). |
| **Package** (Template) | Шаблон пакета: "10 тренувань / місяць за X грн". Створюється тренером один раз. |
| **ClientPackage** | Конкретний пакет, призначений конкретному клієнту: має `remaining_sessions`, `expires_at`, статус. |
| **Subscription** | Альтернатива до пакета: безперервне місячне списання N сесій. У MVP моделюємо як **повторно створюваний** `ClientPackage` через scheduled job. |
| **Transaction** | Ручний запис про отриману оплату: `client_id`, `package_id` (опційно), `amount`, `currency`, `method` (cash, transfer, card, other), `status` (`paid`, `pending`, `canceled`), `paid_at`. |
| **WorkoutLog** | Лог фактично виконаної сесії: набір `WorkoutLogSet` (exercise + set_index + reps + weight_kg + performed_at + actor_id + version). |
| **BodyMeasurement** | Запис про фізичні параметри клієнта: weight, height, body_fat_percent, або обміри (chest, waist, hips, biceps, thigh). |
| **PersonalRecord (PR)** | Автоматично визначений рекорд клієнта на конкретній вправі: max weight × reps, обчислюваний `estimated_1rm` (Epley). |

---

## 3. Архітектура

### 3.1 Стек

| Шар | Технологія | Версія |
|---|---|---|
| Мова | PHP | 8.4 |
| Фреймворк | Laravel | 12.x |
| БД | PostgreSQL | 16+ |
| ORM | Eloquent | (входить у Laravel) |
| Auth API | Laravel Sanctum + custom refresh-token rotation | |
| OAuth | Laravel Socialite (Google, Apple, Facebook) | |
| Real-time | Laravel Reverb (WebSocket) + Broadcasting | |
| Cache & Queue driver | Redis | 7+ |
| Queue management | Laravel Queue + Laravel Horizon | |
| Storage | S3-compatible (Laravel Filesystem) | |
| Push | Firebase Cloud Messaging | |
| Admin panel | Filament | 3.x |
| Observability | Laravel Telescope (dev) + Laravel Pulse (prod) | |
| Calendar | Google Calendar API · Apple Calendar (ICS feed) | |
| HTTP client | Laravel HTTP / Guzzle | |
| Validation | Laravel Form Requests + DTOs | |
| Testing | Pest (рекомендовано) або PHPUnit | |

### 3.2 Архітектурний стиль — modular monolith

Один Laravel-додаток з чіткими module boundaries. Кожен модуль містить:

```
app/Modules/<ModuleName>/
├── Http/Controllers/
├── Http/Requests/
├── Http/Resources/
├── Models/
├── Services/
├── Events/
├── Listeners/
├── Jobs/
├── Policies/
├── Database/Migrations/ (опційно — можна тримати в стандартній директорії)
└── routes.php
```

**Принципи:**

1. **Контролери — тонкі.** Логіка живе в Services. Контролер: валідує (Form Request) → викликає Service → формує Resource.
2. **Cross-module зв'язки — лише через Events або через публічні facades модуля.** Не імпортувати моделі з іншого модуля напряму.
3. **Service-layer pattern.** Кожна use-case = метод сервісу (`SessionService::create`, `SessionService::cancel`, ...).
4. **Domain events.** Будь-яка mutation, що цікавить інший модуль, видає Laravel Event (`SessionCreated`, `WorkoutLogUpdated`, ...). Listeners — у відповідних модулях.
5. **WebSocket broadcasting** — через `ShouldBroadcast` інтерфейс на тих самих доменних подіях.

### 3.3 Перелік модулів і їхні залежності

```
Auth ────────────┐
                 ▼
              Users ◀────────────┐
                 │               │
                 ├──► Onboarding │
                 │               │
                 ├──► Files ◀────┼────────────────────┐
                 │               │                    │
                 └──► Notifications ◀──┐              │
                                       │              │
Clients ─────────┐                     │              │
                 │                     │              │
                 ├──► Sessions ────────┤              │
                 │       │             │              │
                 │       ├──► Workout Tracking        │
                 │       │             │              │
                 │       └──► Calendar Integration ───┤
                 │                     │              │
                 ├──► Programs ─► Exercises ◀─────────┤
                 │                                    │
                 ├──► Progress                        │
                 │                                    │
                 └──► Packages ─► Transactions        │
                                                      │
                                              Chat ◀──┤
                                                      │
                                              Analytics
```

**Залежності:**

- **Users** — основа; від нього залежить майже все.
- **Files** і **Notifications** — інфраструктурні, ними користуються всі модулі.
- **Sessions** залежить від **Clients**, **Programs**, **Packages**.
- **Workout Tracking** залежить від **Sessions** і **Exercises**.
- **Chat** залежить лише від **Users** і **Files**.
- **Analytics** — read-only consumer, залежить від **Transactions**, **Sessions**, **Users**.

### 3.4 Послідовність розробки

Рекомендована послідовність реалізації (для solo-dev):

1. **Phase 0 — Foundation:** Auth · Users · Files · Notifications.
2. **Phase 1 — Core CRM:** Clients · Onboarding · Programs · Exercises · Sessions (без real-time).
3. **Phase 2 — Real-time:** Chat · Workout Tracking · Reverb broadcasting · Calendar sync.
4. **Phase 3 — Business:** Packages · Transactions · Progress · Analytics · Integrations finalization.

---

## 4. API conventions

### 4.1 Загальні

- **Base URL:** `https://api.fitconnect.app/v1/` (production). У dev — `http://localhost:8000/v1/`.
- **Версіонування:** в URL prefix (`/v1/`). Breaking changes → `/v2/`.
- **Mime:** `application/json` для request/response. Multipart (`multipart/form-data`) — лише для file uploads.
- **Charset:** UTF-8.
- **Дати/час:** ISO 8601, з timezone (`2026-05-28T14:30:00Z` або `2026-05-28T17:30:00+03:00`). Дати без часу — `2026-05-28`.
- **Час зберігання у БД:** усі timestamp'и — `TIMESTAMPTZ` в UTC. Конвертація в timezone користувача — на бекенді при формуванні response.

### 4.2 Authentication

- Header: `Authorization: Bearer <access_token>`.
- Token формат: Laravel Sanctum personal access token або custom JWT-like (формат уточнити у `auth.md`).
- Access token TTL: **15 хвилин**.
- Refresh token TTL: **30 днів**, rotation при кожному refresh, попередній token invalidate.
- Logout — invalidate поточний refresh-token. `Logout all sessions` — invalidate всі refresh-tokens юзера.

### 4.3 Pagination

**Cursor-based** для всіх list-endpoints:

```
GET /v1/sessions?limit=20&cursor=eyJpZCI6IjAxSDIuLi4ifQ
```

Response:

```json
{
  "data": [ ... ],
  "meta": {
    "next_cursor": "eyJpZCI6IjAxSDMuLi4ifQ",
    "has_more": true
  }
}
```

- `limit` дефолт 20, max 100.
- Cursor — opaque base64-encoded JSON; клієнт не парсить.
- Offset pagination **не використовувати** (race conditions при додаванні нових записів).

### 4.4 Filtering і search

- Query params snake_case: `?status=planned&client_id=01H...&from=2026-05-01&to=2026-05-31`.
- Search: `?q=<text>`. Full-text — PostgreSQL `tsvector` для chat-history, простий `ILIKE` для коротких списків.
- Sort: `?sort=-start_at` (`-` для DESC).

### 4.5 Помилки — RFC 7807 Problem Details

```json
{
  "type": "https://api.fitconnect.app/errors/package_exhausted",
  "title": "Package has no remaining sessions",
  "status": 409,
  "detail": "ClientPackage 01H... has remaining_sessions=0",
  "code": "package_exhausted",
  "instance": "/v1/sessions",
  "errors": {
    "package_id": ["Package is exhausted"]
  }
}
```

- Завжди є `code` (machine-readable), `title` (human-readable), `status` (HTTP code).
- Для validation errors (`422`) — поле `errors` з map `field → [messages]` (стандартний Laravel format).
- `code` — snake_case, стабільний (не міняється між versions).

### 4.6 Idempotency

Endpoint'и, що приймають `Idempotency-Key` header:

- `POST /v1/sessions`
- `POST /v1/transactions`
- `POST /v1/workout-logs`
- `POST /v1/workout-log-sets`
- `POST /v1/client-packages`
- `POST /v1/messages`

**Реалізація:**

- Key — будь-який UUID або random string ≤ 64 chars.
- Зберігається в Redis 24h з мапою `key → response_body + status_code`.
- Повторний запит з тим самим ключем (від того ж user) повертає кешовану відповідь.
- Різний user з тим самим ключем — окрема row (collision impossible через namespacing).

### 4.7 Rate limiting

- Auth endpoints (login, register): **10 req/min/IP**.
- OAuth callbacks: **20 req/min/IP**.
- General API: **120 req/min/user** (через Sanctum middleware).
- WebSocket: **60 messages/min/connection**.
- File upload: **20/hour/user**.

Перевищення → `429 Too Many Requests` + header `Retry-After`.

### 4.8 Versioning і deprecation policy

- Будь-який breaking change потребує нової `/vN/` версії.
- Стара версія підтримується **≥ 6 місяців** після випуску нової.
- Soft deprecation — header `Sunset: <date>` у відповідях deprecated endpoints.

---

## 5. Real-time (Laravel Reverb)

### 5.1 Стек і інсталяція

- **Laravel Reverb** — нативний WebSocket-сервер Laravel.
- Запускається окремим процесом (`php artisan reverb:start`).
- Деплоїться як окремий сервіс (Docker container).
- Слухає на `:8080` за замовчуванням; за NGINX-проксі.
- Авторизація через broadcasting auth endpoint (`/broadcasting/auth`), що використовує Sanctum guard.

### 5.2 Канали

| Канал | Тип | Хто може subscribe | Призначення |
|---|---|---|---|
| `private-user.{userId}` | Private | Тільки сам user (`$userId === auth()->id()`) | Особисті події: новий чат, нова сесія, новий пакет |
| `private-conversation.{conversationId}` | Private | Учасники conversation | Chat messages, typing, read receipts |
| `private-session.{sessionId}` | Private | Тренер + усі участники сесії | Workout log updates, session status changes |
| `presence-conversation.{conversationId}` | Presence | Учасники conversation | Хто online (presence info) |
| `presence-session.{sessionId}` | Presence | Тренер + учасники | Хто зараз приєднався до live-сесії |

Авторизація — у `routes/channels.php` через Policy-методи.

### 5.3 Events

Кожна подія має `ShouldBroadcast` (через WS) і опційно `ShouldQueue` (через Redis queue для side-effects: push, calendar sync, analytics).

| Event | Канал(и) | Payload (shape) | Side-effects |
|---|---|---|---|
| `MessageSent` | `private-conversation.{id}` | `{ message: {id, conversation_id, sender_id, body, media[], sent_at} }` | Push до not-online учасників; unread counter increment |
| `MessageRead` | `private-conversation.{id}` | `{ conversation_id, user_id, read_at, last_read_message_id }` | Update read receipts |
| `UserTyping` | `private-conversation.{id}` | `{ conversation_id, user_id, typing: bool }` | None (TTL ~3s на клієнті) |
| `SessionCreated` | `private-user.{participantId}` × N | `{ session: {...} }` | Push, calendar sync |
| `SessionUpdated` | `private-user.{participantId}` × N | `{ session: {...}, changes: [...] }` | Push, calendar update |
| `SessionStatusChanged` | `private-session.{id}` | `{ session_id, old_status, new_status, changed_by }` | Push, package decrement (на `completed`) |
| `WorkoutLogUpdated` | `private-session.{id}` | `{ log: {...}, actor_id, version }` | None (UI sync) |
| `WorkoutLogSetCreated` | `private-session.{id}` | `{ set: {...}, actor_id, version }` | PR check, analytics ping |
| `WorkoutLogSetUpdated` | `private-session.{id}` | `{ set: {...}, actor_id, version }` | PR re-check |
| `PackageAssigned` | `private-user.{clientUserId}` | `{ client_package: {...} }` | Push |
| `PackageExhausted` | `private-user.{trainerId}`, `private-user.{clientUserId}` | `{ client_package: {...} }` | Push, in-app notif |
| `TransactionCreated` | `private-user.{trainerId}` | `{ transaction: {...} }` | Update analytics cache |
| `NotificationDelivered` | `private-user.{userId}` | `{ notification: {...} }` | Update in-app feed |

### 5.4 Reconnection і recovery

- Клієнт реконнектиться з exponential backoff (1s → 30s).
- При reconnect клієнт викликає `GET /v1/events/missed?since=<last_seen_at>` для отримання подій, що сталися offline. (Endpoint реалізує `EventReplay` service, що зберігає лог критичних подій 24h.)
- WebSocket — best-effort delivery; критичні стани (нова сесія, новий пакет) завжди підкріплюються persistent state, до якого можна піти через REST.

### 5.5 Конфлікт-резолюшен у workout sync

- Кожен `WorkoutLogSet` має `version` (monotonic increment per session).
- При concurrent update: last-write-wins на рівні `(workout_log_id, exercise_id, set_index)`.
- Подія `WorkoutLogSetUpdated` несе `version`; клієнт ігнорує події з версією ≤ власної.
- Резолюшен — на бекенді через SELECT FOR UPDATE у транзакції.

---

## 6. Безпека

### 6.1 Auth

- **Password storage:** Bcrypt (Laravel default, cost 12).
- **Access tokens:** Sanctum personal access tokens, TTL 15 хв, scope-based ability checks.
- **Refresh tokens:** окрема таблиця `refresh_tokens` (hash stored, не plain), rotation при кожному refresh.
- **OAuth:** через Laravel Socialite. Mapping у `oauth_identities`. Окремий аккаунт автоматично створюється або лінкується за email (з confirmation, якщо email верифікований у провайдера).
- **Sessions list:** користувач може бачити активні сесії і завершити окрему.

### 6.2 Rate limiting і brute force

- Login: 10 спроб / 5 хвилин / IP. Після 10 — IP block на 15 хвилин.
- Per-user lockout: 5 невдалих спроб → користувач блокується на 15 хвилин (email notification).
- OAuth callbacks: 20 / хв / IP.

### 6.3 CORS, CSRF

- **CORS:** дозволити origin'и моб-додатка (включно з `exp://` для dev), web-portal (post-MVP).
- **CSRF:** API stateless (Bearer auth), CSRF не потрібен. Web-routes (admin Filament) — використовують стандартний Laravel CSRF.

### 6.4 Encryption at rest

- DB-level: AES-256 на disk-encrypted volume (інфраструктурний рівень).
- Поля sensitive (е.g. OAuth refresh tokens провайдерів, calendar tokens) — Laravel encrypted casts (`encrypted` cast у моделях).
- Plaintext passwords — НЕ зберігаються ніде; лише bcrypt-хеш.

### 6.5 GDPR-готовність

- **Right to erasure:** ендпоінт `DELETE /v1/me/account` — soft delete (30 днів grace period) → hard delete. Cascade: сесії з участю, повідомлення, файли. Тренерські дані інших клієнтів — не видаляються (referenced data).
- **Right to export:** `GET /v1/me/export` → асинхронний job → email з ZIP-архівом (JSON-дамп профілю, сесій, повідомлень, метрик, транзакцій).
- **Data minimization:** не зберігати фото-прогрес, відеоповідомлення довше за потреби (configurable retention).
- **Consent:** при OAuth-логіні явно показати які scope'и запитуємо.

### 6.6 RBAC через Laravel Policies

Кожен модуль має Policy-клас з методами per-action:

```php
class SessionPolicy {
    public function view(User $user, Session $session): bool { ... }
    public function update(User $user, Session $session): bool { ... }
    public function cancel(User $user, Session $session): bool { ... }
}
```

Контролер: `$this->authorize('update', $session)`.

Загальні правила:

- **Trainer** бачить лише свої сесії, свій roster клієнтів, свої програми, свої транзакції.
- **Client** бачить тільки сесії, де він — учасник; свої measurements/PR; своїх тренерів і їхні програми, призначені йому.
- **Admin** має full read доступ; mutate — обмежено (без видалення фінансової історії).

### 6.7 File access control

- Усі файли в S3 з ACL **private**.
- Доступ через **signed URLs** (15-хвилинний TTL).
- Для media-повідомлень — окрема policy: тільки учасники conversation можуть отримати signed URL.
- Аватари — public-read (без signed URL), оскільки невелика чутливість.

### 6.8 Audit log (мінімальний у MVP)

Лог записується для критичних дій:

- Login (success/fail).
- Account deletion.
- Зміна email/паролю.
- OAuth connect/disconnect.
- Транзакції (create/edit/delete).

Таблиця `audit_logs` з `(user_id, action, entity_type, entity_id, ip, user_agent, metadata jsonb, created_at)`. Retention 1 рік.

---

## 7. Нефункціональні вимоги (NFR)

### 7.1 Performance

| Метрика | Target MVP | Target post-MVP |
|---|---|---|
| API p50 | < 100 ms | < 80 ms |
| API p95 | < 300 ms | < 200 ms |
| API p99 | < 800 ms | < 500 ms |
| WS message latency (broadcast → client receive) | < 500 ms | < 200 ms |
| Time to first byte (cold) | < 1.5 s | < 1 s |
| File upload (50 MB) | < 30 s | < 15 s |

### 7.2 Capacity

| Метрика | MVP | Post-MVP |
|---|---|---|
| Concurrent WS connections | 1 000 | 10 000 |
| Active users (monthly) | 5 000 | 50 000 |
| Requests/min (peak) | 5 000 | 50 000 |
| DB size (1 year) | < 50 GB | < 500 GB |
| Files storage (1 year) | < 500 GB | < 5 TB |

### 7.3 Reliability

- **Uptime SLO:** 99.5% (MVP) → 99.9% (post-MVP).
- **MTBF target:** ≥ 30 днів.
- **MTTR target:** < 30 хвилин для P1 incidents.
- **Backups:**
  - PostgreSQL: PITR (continuous WAL archiving) + daily snapshot, retention 30 днів.
  - Files (S3): versioning enabled + cross-region replication (post-MVP).
  - Restore drill — щомісяця.
- **Disaster Recovery:**
  - RPO (Recovery Point Objective): ≤ 15 хвилин.
  - RTO (Recovery Time Objective): ≤ 4 години (MVP), ≤ 1 година (post-MVP).

### 7.4 Observability

- **Logs:** structured JSON (Monolog), level INFO+, агрегація в централізований сервіс (Loki / CloudWatch / etc).
- **Metrics:** Laravel Pulse for app metrics (request count, latency, queue lag, exceptions).
- **Traces:** OpenTelemetry instrumentation (post-MVP).
- **Alerts:**
  - Error rate > 5% / 5 хв.
  - p95 latency > 800 ms / 10 хв.
  - Queue lag > 5 хв.
  - WS dropped connections > 10% / 5 хв.
  - DB CPU > 80% / 10 хв.
  - Disk usage > 80%.
- **Dashboards (Pulse або Grafana):**
  - Real-time RPS, latency, error rate.
  - Queue health (Horizon dashboard).
  - DB query time top-N.
  - Active WS connections.
  - Daily/weekly active users.

### 7.5 Compliance

- GDPR (див. §6.5).
- PCI DSS — **не застосовується** (немає прямих оплат у MVP).
- Зберігання даних — серверні локації у ЄС (рекомендовано).

---

## 8. DevOps та інфраструктура (загально)

> Конкретний вибір хостингу відкладено; нижче — лише вимоги до інфраструктури.

### 8.1 Інфраструктурні компоненти (must have)

| Компонент | Призначення |
|---|---|
| App servers (PHP-FPM + NGINX) | API, HTTP-обробка |
| Reverb server | WebSocket, окремий процес/контейнер |
| Queue workers (Horizon) | Async jobs, ≥ 2 worker процеси |
| Scheduler | Laravel Scheduler (`schedule:work`), для cron-jobs |
| PostgreSQL 16+ | Primary + standby (post-MVP) |
| Redis 7+ | Cache + queue driver + session-like state (idempotency keys) |
| S3-compatible storage | Files, media |
| FCM | Push notifications |
| Mail provider (SES / Postmark / SendGrid) | Email |
| Optional: CDN | Static assets, signed-URL caching |

### 8.2 Containerization

- Single `Dockerfile` (multi-stage) для app image.
- Окремий compose service per role: `app` (PHP-FPM), `nginx`, `reverb`, `queue`, `scheduler`.
- Образи build-яться в CI з tag = git SHA.
- Health checks: `/health` (app) і `/health` (reverb).

### 8.3 CI/CD (GitHub Actions / GitLab CI / etc)

Pipeline:

1. **Lint** — Pint (Laravel code style).
2. **Static analysis** — PHPStan (level 6+).
3. **Tests** — Pest unit + feature tests; coverage ≥ 60% (MVP) → ≥ 80% (post-MVP).
4. **Build** — Docker image, push до registry.
5. **Deploy** — staging автоматично, prod manual approval.
6. **Post-deploy** — smoke tests (5-10 critical endpoints).

### 8.4 Environment management

- Конфіги — лише через `.env` (12-factor).
- Секрети — через secret manager хостингу (НЕ commit'ити `.env.production`).
- `.env.example` оновлюється з кожною новою змінною.
- `php artisan config:cache` у production.

### 8.5 Database migrations

- **Forward-only migrations** — не делетати existing migrations; нові — додавати.
- Будь-яка breaking-change міграція (drop column, rename) — у дві фази:
  1. Релізи код, що пишеться в обидва старе і нове поле, читає з нового з fallback.
  2. Через ≥ 1 тиждень — drop старого поля.
- Запуск через `php artisan migrate --force` у CI/CD деплою.

### 8.6 Scheduled jobs (cron)

| Job | Розклад | Призначення |
|---|---|---|
| `SessionRemindersJob` | кожні 5 хв | Розіслати push 24h і 1h до сесії |
| `PackageExpirationJob` | щодня о 03:00 | Перевірити пакети що скоро end + push нагадування |
| `SubscriptionRenewalJob` | щодня о 00:30 | Створювати наступний `ClientPackage` для активних підписок |
| `CalendarSyncSyncJob` | кожні 15 хв | Re-sync external calendars (incremental) |
| `AnalyticsCacheRefreshJob` | щогодини | Перерахувати agg-кеш для analytics endpoints |
| `RefreshTokenCleanupJob` | щодня о 04:00 | Видалити expired refresh tokens |
| `FilesCleanupJob` | щодня о 04:30 | Видалити orphan files (unlinked > 7 днів) |
| `AuditLogRetentionJob` | щоквартально | Видалити audit logs старші 1 року |

### 8.7 Queue priorities

Horizon supervisor configurations:

| Queue | Priority | Workers | Use cases |
|---|---|---|---|
| `critical` | highest | 4 | Push notifications, email verification |
| `default` | normal | 4 | Calendar sync, analytics refresh |
| `low` | low | 2 | Cleanup jobs, exports, reports |

---

## 9. Roadmap і фази

### Phase 0 — Foundation (тиждень 1-3)

**Ціль:** Базова інфраструктура, auth, users, files, notifications.

**Deliverables:**

- Laravel-проєкт ініціалізовано, Docker compose локальний.
- PostgreSQL міграції для `users`, `oauth_identities`, `refresh_tokens`, `device_tokens`, `media_files`, `notifications`.
- Sanctum + Socialite + custom refresh-token rotation.
- File upload pipeline (signed URLs).
- FCM integration + базові push templates.
- CI/CD pipeline.

**Modules covered:** Auth · Users · Files · Notifications.

### Phase 1 — Core CRM (тиждень 4-7)

**Ціль:** Клієнти, програми, вправи, сесії (без real-time).

**Deliverables:**

- Clients CRM (roster, invite flow).
- Programs CRUD + assignment.
- Exercises library.
- Sessions CRUD (без live tracking, без calendar sync).
- Onboarding flow.

**Modules:** Onboarding · Clients · Programs · Exercises · Sessions (basic).

### Phase 2 — Real-time (тиждень 8-11)

**Ціль:** Чат і workout tracking з real-time sync, calendar sync.

**Deliverables:**

- Reverb setup, broadcasting auth.
- Chat (text + media, read receipts, typing).
- Workout tracking з real-time sync.
- Google Calendar OAuth + sync.
- Apple Calendar ICS feed.

**Modules:** Chat · Workout Tracking · External Integrations · Sessions (extended).

### Phase 3 — Business (тиждень 12-15)

**Ціль:** Пакети, транзакції, прогрес, аналітика.

**Deliverables:**

- Packages templates + assignment + auto-decrement.
- Transactions з прив'язкою до пакетів.
- Progress metrics (body measurements, PR/1RM).
- Analytics endpoints + cached views.
- Filament admin panel.

**Modules:** Packages · Transactions · Progress · Analytics.

### Total estimate

**~15 тижнів (3.5 місяця)** для solo PHP-дева повного робочого дня. Без багатотижневих затримок на DevOps/інфраструктуру.

### Ризики і запобігання

| Ризик | Impact | Запобігання |
|---|---|---|
| WS scaling під навантаженням | Високий | Pulse-monitoring з самого початку; load-test з 1000 connections перед prod |
| Calendar sync — конфлікти і delays | Середній | Async-tasks з retry; UI показує "last synced at"; degraded mode (тільки локальні events) |
| File storage costs | Низький | Lifecycle policies (старі media → cold storage); video size limits |
| Real-time inconsistency у workout sync | Середній | Версіонування подій; periodic full-sync як fallback; UI показує "out of sync" warning |
| Bcrypt cost високий на cheap CPU | Низький | Cost 12 — стандарт; profiling під час Phase 0 |
| Apple Calendar API без прямого write API | Високий (відомий) | Pull-only через ICS feed; не обіцяти write-back; чітко комунікувати в UI |

---

## 10. Index фіч

Усього **~53 укрупнені фічі**, розподілені по 16 модулях. Кожен модуль — окремий файл у `docs/backend/features/`. Фічі **об'єднані за бізнес-значенням**: серії CRUD-операцій або тісно зв'язаних use-case'ів описуються однією фічею з кількома user stories.

| Модуль | Файл | Фіч | Phase | Стиль | Опис |
|---|---|:-:|:-:|:-:|---|
| Auth & Identity | [features/auth.md](features/auth.md) | 5 | 0 | full | Local credentials + email verification · OAuth (Google/Apple/FB) · refresh-token lifecycle · password/email management · account deletion (GDPR) |
| Users & Profile | [features/users.md](features/users.md) | 1 | 0 | compact | Profile management — own/foreign view + edit + avatar + settings + points/experience |
| Files & Media | [features/files.md](features/files.md) | 1 | 0 | full | File upload pipeline — signed URL + image processing + video pass-through + ACL + cleanup |
| Notifications (Push) | [features/notifications.md](features/notifications.md) | 2 | 0 | full + compact | Push notification subsystem (FCM + delivery rules) · in-app notification feed |
| Onboarding | [features/onboarding.md](features/onboarding.md) | 3 | 1 | full + compact | Trainer 13-step flow · client onboarding skeleton · skip/resume/preview/finalize |
| Clients (CRM) | [features/clients.md](features/clients.md) | 3 | 1 | full + compact | Roster management · client invitation flow · notes/tags |
| Programs | [features/programs.md](features/programs.md) | 2 | 1 | full | Program management (CRUD + library + views/likes) · assignment to clients |
| Exercises | [features/exercises.md](features/exercises.md) | 2 | 1 | compact | Exercise library management · attachment to programs |
| Sessions & Calendar | [features/sessions.md](features/sessions.md) | 7 | 1, 2 | full + compact | Session management (CRUD) · schedule views · status lifecycle · recurring · conflict detection · reminders · package linkage |
| Chat & Messaging | [features/chat.md](features/chat.md) | 6 | 2 | full | Conversation management · text messaging · media messaging · read receipts/typing · search · push notifications |
| Workout Tracking | [features/workout-tracking.md](features/workout-tracking.md) | 5 | 2 | full | Live session lifecycle · workout log entry · real-time sync · offline mode · history |
| External Integrations | [features/integrations.md](features/integrations.md) | 3 | 2 | full + compact | Google Calendar bi-directional sync · Apple Calendar ICS feed · OAuth providers connect/disconnect |
| Packages & Subscriptions | [features/packages.md](features/packages.md) | 4 | 3 | full + compact | Templates · package assignment & lifecycle · subscription renewal · debt tracking |
| Transactions | [features/transactions.md](features/transactions.md) | 4 | 3 | compact | Transaction management · package linkage · search/filter/export · withdraw tracking |
| Progress Metrics | [features/progress.md](features/progress.md) | 4 | 3 | full + compact | Body measurements · charts · PR & 1RM auto-detect · CSV export |
| Analytics | [features/analytics.md](features/analytics.md) | 1 | 3 | compact | Trainer business analytics (income chart + revenue source + profile views + counts + timeframe) |

**Total: 53 фічі** (~70-110 сторінок документації).

### Стилі шаблонів

Кожна фіча використовує один із двох шаблонів — залежно від складності:

- **Full template** — для фіч із значимою бізнес-логікою (workout sync, packages auto-decrement, calendar sync, chat real-time, auth flows). Містить: контекст, 3-5 user stories, повний flow з UI mapping, 5-8 acceptance criteria, permissions матрицю, 5-10 edge cases, посилання на технічну спеку. ~3-5 сторінок.
- **Compact template** — для CRUD-операцій та простих use-case'ів. Містить: контекст, 2-3 user stories, 3-4 acceptance criteria, permissions, 1-3 edge cases, посилання на технічну спеку. ~0.5-1 сторінка.

Точні шаблони наведені у [features/README.md](features/README.md).

### Як читати feature-spec

Кожна фіча в `features/{module}.md` описується за єдиним шаблоном (full або compact):

1. **Заголовок** з кодом (`SES-001`, `WT-003`, ...).
2. **Контекст** — навіщо ця фіча.
3. **User stories** (`US-XXX-NNN`).
4. (full only) **User flow + UI mapping** — крок-за-кроком з посиланнями на екрани (`SessionFormScreen.tsx` і т.д.).
5. **Acceptance criteria** (`AC-1`, `AC-2`, ...) у форматі Given/When/Then.
6. **Permissions матриця** (Trainer / Client / Admin × actions).
7. **Edge cases** (`EC-1`, `EC-2`, ...) — нештатні сценарії.
8. **Зв'язок з технічною спекою** — посилання на API, DB, events, jobs.

### Залежності між модулями

```
Phase 0:  auth → users → files → notifications
Phase 1:  onboarding → clients → exercises → programs → sessions
Phase 2:  workout-tracking ← sessions
          chat
          integrations → sessions
Phase 3:  packages → transactions
          progress
          analytics ← sessions, transactions
```

---

## 11. Документи-сусіди

| Документ | Призначення |
|---|---|
| [`README.md`](README.md) | Індекс і конвенції папки `docs/backend/` |
| [`DB_STRUCTURE.md`](DB_STRUCTURE.md) | Повна схема БД, таблиці, FK, індекси |
| [`DB_SCHEMA_TREE.md`](DB_SCHEMA_TREE.md) | Mermaid ER + ASCII tree |
| `features/*.md` | Feature-level специфікації по модулях |
| `auth.md`, `sessions.md`, ... (per-domain) | Technical specs: API endpoints, request/response shapes, DB transactions |
| [`../TASKS.md`](../TASKS.md) | Jira-style завдання фронту, що відповідають API |
| [`../PROGRESS.md`](../PROGRESS.md) | Прогрес-трекер по флоу |
| [`../../TECH_DOC.md`](../../TECH_DOC.md) | Загальний technical document (потребує оновлення в частині backend → PHP) |

---

## 12. Відкриті питання

| Питання | Поточне рішення / план |
|---|---|
| Hosting/deployment platform | Відкладено; ТЗ описує лише вимоги до інфраструктури |
| Email provider (SES / Postmark / SendGrid) | Вирішити перед Phase 0 deploy |
| S3-сумісний провайдер (AWS / R2 / Spaces / MinIO) | Вирішити перед Phase 0 deploy |
| Apple Calendar write-back | Не передбачено через відсутність API; pull-only via ICS feed |
| Client onboarding обсяг | 3-5 кроків у MVP, розширити post-MVP |
| Withdraw flow | Тільки логування, без реальної API-інтеграції до payout-провайдера |
| Multi-currency | MVP — single currency per trainer (`users.currency`); FX conversion — post-MVP |
| Backup hosting region | Узгодити з GDPR-локацією primary DB |
