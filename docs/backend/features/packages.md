# Features — Packages & Subscriptions

**Модуль:** Packages & Subscriptions · **Phase:** 3 · **Файлів-сусідів:** `packages.md` (TBD) (technical)

4 фічі. Покриває облік пакетів тренувань і підписок — без прямих оплат (див. [`features/transactions.md`](transactions.md) для оплат).

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | PKG-001 | Package templates | compact |
| 2 | PKG-002 | Package assignment & lifecycle | full |
| 3 | PKG-003 | Subscription auto-renewal | full |
| 4 | PKG-004 | Debt tracking & notifications | compact |

---

## 1. Package templates [PKG-001]

**Phase:** 3 · **Стиль:** compact

### Контекст

Тренер створює **шаблони** пакетів, які потім multi-assign'ять клієнтам. Приклади: "10 тренувань / 1 місяць за 5000 грн", "Місячна підписка з 12 тренувань", "Single session pass". Шаблон визначає `kind` (`count_based` / `time_based` / `hybrid`), `sessions_count`, `validity_days`, `price`, `currency`, `auto_renew` default.

### User stories

- **US-PKG-001** — *Як trainer, я хочу створити шаблон пакета і використати його для всіх своїх клієнтів, не вводячи деталі щоразу.*
- **US-PKG-002** — *Як trainer, я хочу архівувати застарілий шаблон, не видаляючи історичні assignments.*

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `POST /v1/packages/templates` з `{ name: "10x/month", kind: "hybrid", sessions_count: 10, validity_days: 30, price: 5000, currency: "UAH", auto_renew_default: false }` *Then* `201`.
- **AC-2** — *Given* trainer *When* `GET /v1/packages/templates?archived=false` *Then* `200` з list своїх активних templates.
- **AC-3** — *Given* invalid kind / sessions_count < 0 / validity_days > 365 *Then* `422`.
- **AC-4** — *Given* template з existing assignments *When* `DELETE /v1/packages/templates/{id}` *Then* `409 has_assignments`. Запропонується archive.
- **AC-5** — *Given* archived template *When* trainer пробує assign *Then* `409 template_archived`.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ свої templates (CRUD) |
| Client | ❌ |
| Admin | ✅ (audit) |

### Edge cases

- **EC-1** — `kind = "count_based"`: лише `sessions_count`; `validity_days` ignored (pure count).
- **EC-2** — `kind = "time_based"`: лише `validity_days`; unlimited sessions у window (rarely useful, supports e.g. "All-you-can-train for a week").
- **EC-3** — `kind = "hybrid"`: обидва (sessions_count + expires_at). Whichever first triggered — закриває пакет.
- **EC-4** — Currency enum (UAH/USD/EUR за MVP); cross-currency аналітика — окрема задача.

### Технічна спека

- API: `packages.md` (TBD) § `GET /packages/templates`, `POST /packages/templates`, `PATCH /packages/templates/{id}`, `DELETE /packages/templates/{id}`, `POST /packages/templates/{id}/archive`
- DB: `package_templates` (з `trainer_id`, `name`, `kind enum: count_based|time_based|hybrid`, `sessions_count int nullable`, `validity_days int nullable`, `price numeric(10,2)`, `currency varchar(3)`, `auto_renew_default boolean`, `archived_at`)

---

## 2. Package assignment & lifecycle [PKG-002]

**Phase:** 3 · **Стиль:** full

### Контекст

Конкретний пакет, призначений конкретному клієнту → `client_packages` row. Має `remaining_sessions`, `expires_at`, `status` (`active`, `exhausted`, `expired`, `archived`). При `SessionCompleted` event (з [`SES-007`](sessions.md)) — decrement remaining. Якщо стало 0 (для count_based/hybrid) — `exhausted`. Якщо `expires_at < now()` — `expired`.

### User stories

- **US-PKG-003** — *Як trainer, я хочу призначити пакет клієнту, обираючи з template або custom-входом.*
- **US-PKG-004** — *Як trainer, я хочу побачити всі активні/exhausted пакети клієнта для прийняття рішення про новий.*
- **US-PKG-005** — *Як client, я хочу бачити свої пакети, скільки залишилось сесій і коли expires.*
- **US-PKG-006** — *Як system, я хочу автоматично декрементувати при completed session, без manual intervention.*
- **US-PKG-007** — *Як trainer, я хочу archive exhausted package, щоб не забивав список.*

### User flow + UI mapping

1. **Assign:** `ClientProfileScreen.tsx` → "Packages" tab → "+ New package" → modal з template-picker АБО "Custom".
2. Якщо template — pre-fill from template; trainer може override fields (sessions_count, validity_days, price).
3. `POST /v1/client-packages` з `{ client_id, template_id (optional), kind, sessions_count, validity_days, price, currency, assigned_at? = now(), auto_renew }`.
4. Backend:
   - Перевіряє: client належить trainer'у.
   - Перевіряє: template (якщо given) належить trainer'у, не archived.
   - Створює `client_packages` row:
     - `remaining_sessions = sessions_count` (для count_based/hybrid).
     - `expires_at = assigned_at + validity_days` (для time_based/hybrid).
     - `status = "active"`.
   - Dispatch `PackageAssigned` event.
   - Respond: `201` з `{ client_package }`.
5. **Auto-decrement:** на `SessionCompleted` listener (`DecrementPackageOnSessionCompletedListener`):
   - Пакет (`session.client_package_id`) має `SELECT ... FOR UPDATE`.
   - `remaining_sessions -= 1`.
   - Якщо `remaining_sessions = 0` AND `kind IN ("count_based", "hybrid")` → `status = "exhausted"`, dispatch `PackageExhausted` event.
6. **Auto-expire:** `PackageExpirationJob` (scheduled hourly):
   - Знаходить `active` packages з `expires_at < now()` → `status = "expired"`, dispatch `PackageExpired` event.
   - Знаходить `active` packages з `expires_at - now() < 3 days` → push reminder (тільки once per package — flag `expiry_reminded_at`).
7. **List per client:** `GET /v1/clients/{id}/packages?status=active|all|archived` → list з aggregates.
8. **Archive:** `POST /v1/client-packages/{id}/archive` (для exhausted/expired) → `archived_at = now()`.

### Acceptance criteria

- **AC-1** — *Given* trainer T, client C from T, valid template T_pkg *When* `POST /v1/client-packages` *Then* `201`, `client_packages` row з status `active`, remaining = template.sessions_count.
- **AC-2** — *Given* `client_id` чужого клієнта *Then* `403`.
- **AC-3** — *Given* template archived *Then* `409 template_archived`.
- **AC-4** — *Given* custom без template — `template_id IS NULL`, інші поля валідуються manually.
- **AC-5** — *Given* completed session з прив'язаним пакетом *Then* `client_packages.remaining_sessions` decremented атомарно (SELECT FOR UPDATE).
- **AC-6** — *Given* remaining після decrement = 0 *Then* `status = "exhausted"`, `PackageExhausted` event broadcast, push до клієнта і тренера.
- **AC-7** — *Given* expired package *When* `PackageExpirationJob` runs *Then* `status = "expired"`, event broadcast.
- **AC-8** — *Given* expired package, але `remaining > 0` *Then* event `PackageExpired`, push "Your package expired, remaining 3 sessions lost" (UX-важлива інформація).
- **AC-9** — *Given* exhausted/expired *When* спроба link до нової сесії (SES-007) *Then* `409 package_not_active`.
- **AC-10** — *Given* completed session reverted до canceled (через SES-003 reverse) *Then* package decrement reversed (`remaining_sessions += 1`); якщо був `exhausted` → `active`.
- **AC-11** — *Given* trainer *When* `POST /v1/client-packages/{id}/archive` (для exhausted/expired) *Then* `200`, `archived_at = now()`; client не бачить у дефолтному списку.

### Permissions

| Роль | Assign | List own packages | List client's packages | Archive |
|---|---|---|---|---|
| Trainer | ✅ для свого client'а | — | ✅ свого client'а | ✅ свого client'а |
| Client | ❌ | ✅ свої | ❌ (тільки свої) | ❌ (запитує trainer'а) |
| Admin | ✅ (audit) | ✅ всі | ✅ всі | ✅ (audit) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Concurrent completion 2 sessions з одним package, remaining = 1 | DB-lock на client_packages.id; перша transaction decrement'ить до 0; друга — `409 package_exhausted` (listener emit'нув би це поверх через SES-003 retry); admin notification (rare) |
| EC-2 | Trainer assign'нув package на minуле час (`assigned_at` in past) | Дозволено для record-keeping; `expires_at` обчислюється від `assigned_at`; може одразу бути expired |
| EC-3 | Client має 2 active packages, які обидва підходять для session | UI пропонує trainer'у вибрати (priority: earliest expires_at); backend не вирішує автоматично |
| EC-4 | Package without кваoting в transactions — `is_in_debt` flag (див. PKG-004) | Окрема фіча |
| EC-5 | Package reverted to active після canceled session — race з PackageExpirationJob | SELECT FOR UPDATE на package row у listener і у job |
| EC-6 | Sessions_count = 0 при create (sentinel)?  | Дозволено для time_based; для count_based — `422` |

### Зв'язок з технічною спекою

- API: `packages.md` (TBD) § `POST /client-packages`, `GET /clients/{id}/packages`, `GET /me/packages` (client view), `PATCH /client-packages/{id}` (limited edits — admin only), `POST /client-packages/{id}/archive`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `client_packages` (з `client_id` FK, `template_id` FK SET NULL, `kind`, `sessions_count`, `remaining_sessions`, `validity_days`, `expires_at`, `price`, `currency`, `status enum: active|exhausted|expired|archived`, `assigned_at`, `archived_at`, `auto_renew`, `expiry_reminded_at`, `debt_since`)
- Events: `PackageAssigned`, `PackageDecremented`, `PackageRestored` (на reverse), `PackageExhausted`, `PackageExpired`, `PackageArchived`
- Listeners: `DecrementPackageOnSessionCompletedListener`, `RestorePackageOnSessionReversedListener`, `EmitPushOnPackageStatusChangeListener`
- Jobs: `PackageExpirationJob` (scheduled hourly), `PackageExpiryReminderJob` (scheduled daily 09:00 — 3 day warning)

---

## 3. Subscription auto-renewal [PKG-003]

**Phase:** 3 · **Стиль:** full

### Контекст

Subscription = recurring `ClientPackage` створюється автоматично через scheduled job. Trainer marked `client_packages.auto_renew = true` → коли package expires або exhausted (last day), система автоматично створює наступний package (same parameters) і dispatches event для notification.

Це **bookkeeping** — без реальної оплати. Тренер пізніше manually записує `Transaction` (з [`TRX-001`](transactions.md)) як підтвердження.

### User stories

- **US-PKG-008** — *Як trainer, я хочу налаштувати auto-renew для клієнта, щоб не забувати оновлювати пакети.*
- **US-PKG-009** — *Як trainer, я хочу побачити upcoming renewals на наступному тижні.*
- **US-PKG-010** — *Як client, я хочу бачити, що мій package буде renewed автоматично.*
- **US-PKG-011** — *Як trainer, я хочу вимкнути auto-renew, якщо клієнт більше не платитиме.*

### User flow + UI mapping

1. **Enable:** `ClientPackageDetailScreen` → toggle "Auto-renew" → `PATCH /v1/client-packages/{id}` з `{ auto_renew: true }`.
2. Backend updates `client_packages.auto_renew = true`. На активних пакетах `next_renewal_at = expires_at - 1 day` (для time_based/hybrid) АБО `null + триггер на exhaustion` (для count_based).
3. **`SubscriptionRenewalJob`** (scheduled daily 00:30):
   - Знаходить `client_packages` з `auto_renew = true` AND (`status = "expired"` OR `status = "exhausted"`) AND `auto_renewed_at IS NULL`.
   - Для кожного:
     - У transaction:
       - Створює нову `client_packages` row (clone with same `template_id`, `kind`, `sessions_count`, `validity_days`, `price`, `currency`, `auto_renew = true`).
       - Set `client_packages.assigned_at = now()`, `expires_at = now() + validity_days`.
       - Old package marked `auto_renewed_at = now()` + `auto_renewed_to_id = new.id` (for tracing).
     - Dispatch `PackageRenewed` event (push до client + trainer).
4. **Disable:** toggle off → `PATCH .../{ auto_renew: false }`. Існуючий active package залишається до exhaustion/expiration без renewal.
5. **Upcoming renewals view:** `GET /v1/me/packages/upcoming-renewals?within_days=7` (trainer view).

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `PATCH /v1/client-packages/{id}` з `{ auto_renew: true }` *Then* `200`.
- **AC-2** — *Given* `expired` package з `auto_renew = true` *When* `SubscriptionRenewalJob` runs *Then* створено новий `client_packages` row (clone); old marked `auto_renewed_to_id = new.id`.
- **AC-3** — *Given* package з `auto_renew = false` *When* expires/exhausts *Then* JOB skip's; no renewal.
- **AC-4** — *Given* renewal occurred *Then* push до клієнта і trainer'а "Your package was renewed for another month" (через listener).
- **AC-5** — *Given* renewal'нувся, але trainer вимкнув template (archived) *Then* renewal все одно proceeds (parameters copied at assignment time, не fetched з template).
- **AC-6** — *Given* concurrent renewal attempts (job race) *Then* `SELECT FOR UPDATE` lock; second skip.
- **AC-7** — *Given* trainer *When* `GET /v1/me/packages/upcoming-renewals?within_days=7` *Then* `200` з list pending renewals.
- **AC-8** — *Given* client *When* `PATCH /v1/me/packages/{id}` з `{ auto_renew: false }` *Then* `200`, **тільки якщо trainer дозволив client-controlled auto-renew opt-out** (config: post-MVP).
- **AC-9** — *Given* renewal failed (DB error) *Then* job retries 3× з backoff; failure — admin notification, original package status unchanged.

### Permissions

| Роль | Toggle own (trainer-side) | Toggle opt-out (client-side) | View upcoming |
|---|---|---|---|
| Trainer | ✅ свої | ❌ (post-MVP) | ✅ свої |
| Client | ❌ (post-MVP — за дозволу) | — | ✅ свої own |
| Admin | ✅ (audit) | ✅ | ✅ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Renewal створив package, але trainer одразу скасував клієнта | Cascade на DELETE client — нове teryp package видаляється; це consistent з PKG-002 EC-1 |
| EC-2 | Auto-renew без жодного payment (debt) | Безперечно: renewal не залежить від payment; ні автоматичної блокади. `PKG-004` debt tracking все ще працює |
| EC-3 | Currency template'а змінилась між renewals | Не змінюється: snapshot price/currency у момент initial assignment копіюється на renew |
| EC-4 | Renewal day = leap day / DST transition | Backend computes `expires_at` через interval (`assigned_at + INTERVAL '30 days'`) — handles correctly |
| EC-5 | Sessions_count update'нувся у template — старий чи новий? | Старий (snapshot). Якщо trainer хоче новий — manually edit upcoming renewal |
| EC-6 | Hybrid package exhausted before expiry — renewal triggers одразу | OK; user отримує "Renewed early due to exhaustion" notification |

### Зв'язок з технічною спекою

- API: `PATCH /v1/client-packages/{id}` (з `auto_renew` field), `GET /v1/me/packages/upcoming-renewals`
- DB: `client_packages.auto_renew bool`, `auto_renewed_at`, `auto_renewed_to_id FK SELF SET NULL`, `auto_renew_chain_root_id` (для зведеної історії — post-MVP)
- Events: `AutoRenewToggled`, `PackageRenewed`, `RenewalFailed`
- Jobs: `SubscriptionRenewalJob` (scheduled daily 00:30), `NotifyUpcomingRenewalsJob` (scheduled weekly Monday 09:00 — list digest для тренера)

---

## 4. Debt tracking & notifications [PKG-004]

**Phase:** 3 · **Стиль:** compact

### Контекст

Якщо пакет exhausted (або renewed автоматично), а нової `Transaction` (з [`TRX-002`](transactions.md)) у межах N днів немає — флаг `is_in_debt = true`. Push до тренера ("Client X has overdue payment for 5 days"). Це **soft warning** — не блокує операцій, лише сигналізує.

### User stories

- **US-PKG-012** — *Як trainer, я хочу автоматично отримувати нагадування, якщо клієнт не заплатив за пакет.*
- **US-PKG-013** — *Як trainer, я хочу бачити список клієнтів з боргами в одному місці.*

### Acceptance criteria

- **AC-1** — *Given* пакет exhausted/renewed *When* `PackageDebtCheckJob` runs (daily) *Then* перевіряє чи є `Transaction` (через `transactions.client_package_id` link) для цього пакета зі статусом `paid`. Якщо немає AND `days_since_exhaustion > debt_threshold_days` (config, default 3) → `client_packages.debt_since = now()`.
- **AC-2** — *Given* package у debt *Then* push до тренера "Payment overdue for [Client] - X days"; також in-app notification.
- **AC-3** — *Given* trainer записав transaction → `client_packages.debt_since = null` (cleared); event `DebtCleared`.
- **AC-4** — *Given* trainer *When* `GET /v1/me/packages/in-debt` *Then* `200` з list (cross-client view).
- **AC-5** — *Given* debt > 30 days *Then* escalated push (rarely) — конфігурований stages (post-MVP).

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ свої клієнти |
| Client | ❌ (не повідомляємо клієнту "у вас борг" — це trainer-tool) |
| Admin | ✅ |

### Edge cases

- **EC-1** — Партіальна оплата (`Transaction` з меншою сумою ніж package.price) — `is_in_debt` стается? **Простіше:** будь-яка `paid` transaction linked до package clear's debt; over/under payment tracking — post-MVP.
- **EC-2** — Transaction unlinked from package post-factum — debt re-triggered next job run.
- **EC-3** — Multiple consecutive packages without payment — debt flag залишається; UI показує "X days, Y packages".

### Технічна спека

- API: `packages.md` (TBD) § `GET /me/packages/in-debt`
- DB: `client_packages.debt_since timestamp nullable`; index `(trainer_id, debt_since)` для quick filter
- Jobs: `PackageDebtCheckJob` (scheduled daily 10:00)
- Events: `DebtDetected`, `DebtCleared`
- Listeners: на `TransactionCreated` (TRX-002) → clear debt if linked to package; на `TransactionDeleted` → re-evaluate

---

## Залежності модуля Packages

- **Залежить від:** Auth, Users, Clients, Sessions (decrements via SES-003 status changes).
- **Залежать від нього:** Sessions (через `client_package_id` link), Transactions (через `client_package_id` link), Analytics (active subscriptions metric).
