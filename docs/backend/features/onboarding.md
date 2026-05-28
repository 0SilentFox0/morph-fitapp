# Features — Onboarding

**Модуль:** Onboarding · **Phase:** 1 · **Файлів-сусідів:** `onboarding.md` (TBD) (technical), [`../../flows/onboarding.md`](../../flows/onboarding.md)

3 фічі. Onboarding виконується після `AUTH-001`/`AUTH-002` (registration/OAuth) і завершується перед першим використанням додатка.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | ONB-001 | Trainer onboarding flow (13 steps) | full |
| 2 | ONB-002 | Client onboarding flow (3 steps) | compact |
| 3 | ONB-003 | Skip / resume / preview / finalize | compact |

---

## 1. Trainer onboarding flow [ONB-001]

**Phase:** 1 · **Стиль:** full

### Контекст

13-крокова форма, в якій тренер заповнює свій профіль. Backend зберігає **partial state** при кожному кроці (щоб користувач міг продовжити з того ж місця, навіть якщо вийде з додатка чи перевстановить його). Поки `users.onboarding_completed_at IS NULL`, додаток показує onboarding-flow при кожному launch.

Кроки (узгоджено з фронтенд-flow в [`../../flows/onboarding.md`](../../flows/onboarding.md)):

1. **ChooseRole** (Client / Trainer cards) — задає `users.role`.
2. **WelcomeTrainer** — read-only welcome screen.
3. **WhatsYourName** — `users.name`.
4. **Experience** — `users.experience` (years string) + `users.certifications` (string[]).
5. **TrainingTypes** — `users.training_types` (string[], multi-select: HIIT, Cardio, Strength, ...).
6. **ClientTypes** — `users.client_types` (string[]: Personal, Group, Online).
7. **HavePrograms** — yes/no/skip; if yes → переходить до AddToLibrary, інакше пропускає.
8. **AddToLibrary** — створення першої програми (use case з модуля Programs, але опціонально).
9. **WhereTrain** — `users.locations` (string[]: gym names / addresses / "Online").
10. **WorkSchedule** — `users.work_schedule_start`, `users.work_schedule_end`, `users.work_schedule_days` (string[]: "mon"..."sun").
11. **ProfilePhoto** — `users.avatar_url` (через [`FIL-001`](files.md) pipeline).
12. **PreviewProfile** — read-only render фіналізованого профіля.
13. **YoureAllSet** — confirmation screen. На confirm → `users.onboarding_completed_at = now()`.

### User stories

- **US-ONB-001** — *Як новий trainer, я хочу пройти 13 кроків заповнення профіля, щоб мій профіль став повноцінним.*
- **US-ONB-002** — *Як trainer, я хочу зберігати progress онбордингу автоматично, щоб продовжити з того ж кроку, якщо вийду з додатка.*
- **US-ONB-003** — *Як trainer, я хочу повертатися назад до попередніх кроків і змінювати відповіді без втрати даних з наступних.*
- **US-ONB-004** — *Як trainer, я хочу побачити preview профіля перед фіналізацією.*

### User flow + UI mapping

1. Після `POST /v1/auth/register` або OAuth callback → frontend перевіряє `users.role` і `users.onboarding_completed_at`.
2. Якщо `role = null` → екран `ChooseRoleScreen.tsx`; вибір зберігається через `PATCH /v1/me/onboarding/step` з `{ step: "choose-role", data: { role: "trainer" } }`.
3. Після кожного кроку frontend викликає `PATCH /v1/me/onboarding/step` з `{ step: "<step_name>", data: {...} }`.
4. Backend:
   - Валідує `step` ∈ enum допустимих кроків.
   - Валідує `data` per step schema (Laravel Form Request).
   - Оновлює відповідні поля `users` + `onboarding_progress.last_completed_step`.
   - Респонс: `{ user, next_step, progress: { completed: N, total: 13 } }`.
5. Frontend читає `next_step` і навігує. Якщо `next_step = null` → перехід до PreviewProfile.
6. На PreviewProfile → `GET /v1/me/onboarding/preview` повертає render-ready дані.
7. На YoureAllSet → `POST /v1/me/onboarding/complete` → `users.onboarding_completed_at = now()`, video event `OnboardingCompleted`, redirect до Home.

### Acceptance criteria

- **AC-1** — *Given* logged-in user без `onboarding_completed_at` *When* `PATCH /v1/me/onboarding/step` зі step `choose-role` і data `{ role: "trainer" }` *Then* `200`, `users.role = "trainer"`, `onboarding_progress.steps.choose_role.completed_at = now()`, response містить `next_step: "welcome"`.
- **AC-2** — *Given* invalid step name *Then* `422 invalid_step`.
- **AC-3** — *Given* invalid data per step schema (e.g. `training_types` not array of strings) *Then* `422` з полем `errors`.
- **AC-4** — *Given* trainer заповнив все *When* `POST /v1/me/onboarding/complete` *Then* `200`, `users.onboarding_completed_at = now()`, наступний `GET /v1/me` повертає `onboarding_completed_at` non-null.
- **AC-5** — *Given* not all required steps завершені *When* `POST /v1/me/onboarding/complete` *Then* `409 onboarding_incomplete` з `{ missing_steps: [...] }`.
- **AC-6** — *Given* trainer на кроці 7 *When* `GET /v1/me/onboarding/state` *Then* `200` з `{ current_step: "have-programs", completed_steps: [...], pending_steps: [...] }`.
- **AC-7** — *Given* trainer закрив додаток на кроці 5 і запустив наново *When* frontend читає state *Then* отримує `current_step: <step_5>`, навігація відновлюється туди.
- **AC-8** — *Given* trainer повернувся на крок 3 (з кроку 8) і змінив name *Then* `200`, name оновлено, **інші кроки залишаються `completed`**, `next_step` після save → step 4 (повертає на лінію).

### Permissions

| Роль | Onboarding step | Complete | Read own state | Read other state |
|---|---|---|---|---|
| Anonymous | ❌ | ❌ | ❌ | ❌ |
| Authenticated (own, `onboarding_completed_at = null`) | ✅ | ✅ | ✅ | ❌ |
| Authenticated (own, completed) | ❌ (no-op, redirect to settings) | ❌ | ✅ | ❌ |
| Admin | ✅ за іншого юзера (audit) | ✅ за іншого юзера | ✅ будь-чий | ✅ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | User обрав role у choose-role, потім хоче поміняти на іншу | Поки `onboarding_completed_at = null` — дозволено через AC-8 (повернення назад). Після completion — недоступно (post-MVP: окремий admin-flow). |
| EC-2 | OAuth user без `name` (Apple Sign-In) | Перший крок: `whats-your-name` потрібен; завжди `null`-проверка. |
| EC-3 | Frontend має stale `next_step` (race з іншим device) | Backend завжди source of truth: на `PATCH .../step` backend перевіряє чи цей step очікується, але приймає out-of-order (AC-8 поведінка). |
| EC-4 | Trainer не хоче надати ProfilePhoto | Допустимо: `users.avatar_url` залишається null; default placeholder на фронті. |
| EC-5 | Trainer на HavePrograms обрав "yes", потім зайшов в AddToLibrary, але не створив програму | Дозволено пропустити (див. `ONB-003` skip). |
| EC-6 | TrainingTypes / ClientTypes empty array | `422 at_least_one_required`. |
| EC-7 | WorkSchedule end < start | `422 schedule_invalid`. |
| EC-8 | Concurrent PATCH'и (frontend retry) | DB-level upsert на `onboarding_progress`; idempotent. |
| EC-9 | User видалив акаунт під час onboarding | `account deletion (AUTH-005)` працює нормально; `onboarding_progress` cascade видаляється. |

### Зв'язок з технічною спекою

- API: `onboarding.md` (TBD) § `PATCH /me/onboarding/step`, `GET /me/onboarding/state`, `GET /me/onboarding/preview`, `POST /me/onboarding/complete`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `users` (всі trainer-specific поля); `onboarding_progress` (новий: `user_id`, `steps jsonb` зі статусами per step, `current_step`, `updated_at`)
- Events: `OnboardingStepCompleted`, `OnboardingCompleted`
- Listeners: на `OnboardingCompleted` → `NotifyTrainerWelcomeEmail` job (queue `default`)

---

## 2. Client onboarding flow [ONB-002]

**Phase:** 1 · **Стиль:** compact

### Контекст

Скорочений flow для клієнтів — у MVP 3 кроки: name → goals → current shape. Опційно — invitation code від тренера. Після MVP можна розширити (medical history, preferences, тощо).

### User stories

- **US-ONB-005** — *Як новий client, я хочу заповнити мінімальний профіль (ім'я, цілі, поточні параметри), щоб тренер бачив базову картину.*
- **US-ONB-006** — *Як client з invitation code від тренера, я хочу ввести його під час онбордингу і автоматично потрапити в roster тренера.*

### Acceptance criteria

- **AC-1** — *Given* user з `role = "client"` *When* `PATCH /v1/me/onboarding/step` зі step `whats-your-name` і валідним name *Then* `200`, `next_step: "goals"`.
- **AC-2** — *Given* step `goals` з payload `{ goals: ["lose_weight", "build_muscle"] }` *Then* `200`, `users.goals jsonb` оновлено.
- **AC-3** — *Given* step `current-shape` з валідними `{ height_cm, weight_kg, fitness_level }` *Then* `200`, створено перший запис у `body_measurements` (через крос-модульний event `BodyMeasurementRecorded`).
- **AC-4** — *Given* step `invitation` з валідним `{ code }` *Then* `200`, `clients.user_id` лінкується до тренера, `client_invitations.accepted_at = now()`.
- **AC-5** — *Given* invalid/expired invitation code *Then* `422 invitation_invalid`. Onboarding продовжується без link до тренера.
- **AC-6** — *Given* client завершив усі required steps *When* `POST /v1/me/onboarding/complete` *Then* `200`, `users.onboarding_completed_at = now()`.

### Permissions

| Роль | Доступ |
|---|---|
| Authenticated client (own, onboarding_completed_at = null) | ✅ |
| Admin | ✅ для іншого юзера (audit) |

### Edge cases

- **EC-1** — Client акцептує invitation, але цей тренер архівував його `clients` row: `422 client_archived`.
- **EC-2** — Двічі прийнятий invitation: ідемпотентно; `accepted_at` лишається з першого разу.
- **EC-3** — Client без invitation code → standalone onboarding; тренер не присвоєний.

### Технічна спека

- API: `onboarding.md` (TBD) § `PATCH /me/onboarding/step` (з client-specific step schemas), `POST /invitations/{code}/accept` (можна викликати з invitation step, виносить логіку у [`features/clients.md`](clients.md) → `CLT-002`)
- DB: `users` (з `goals jsonb`, `fitness_level enum`), `body_measurements` (initial entry), `clients` (link на акцепт invitation), `client_invitations`

---

## 3. Skip / resume / preview / finalize [ONB-003]

**Phase:** 1 · **Стиль:** compact

### Контекст

Меха-функції, що допомагають користувачу проходити onboarding комфортно: пропуск необов'язкових кроків, resume з того ж місця, перегляд preview, фіналізація.

### User stories

- **US-ONB-007** — *Як user, я хочу пропустити необов'язковий крок (наприклад, ProfilePhoto), щоб завершити onboarding швидше.*
- **US-ONB-008** — *Як user, я хочу повернутися до пропущеного кроку пізніше через settings.*
- **US-ONB-009** — *Як user, я хочу подивитися на preview мого профіля перед фіналізацією.*

### Acceptance criteria

- **AC-1** — *Given* user на optional step *When* `POST /v1/me/onboarding/skip-step` з `{ step }` *Then* `200`, step marked `skipped`, `next_step` — наступний.
- **AC-2** — *Given* required step *When* `POST .../skip-step` *Then* `422 step_not_skippable`.
- **AC-3** — *Given* user *When* `GET /v1/me/onboarding/state` *Then* `200` з `{ current_step, completed_steps: [...], skipped_steps: [...], pending_steps: [...], can_complete: bool }`.
- **AC-4** — *Given* user *When* `GET /v1/me/onboarding/preview` *Then* `200` з повністю-оформленим JSON профілем (як його побачать інші).
- **AC-5** — *Given* user з `onboarding_completed_at != null` *When* settings → "Continue onboarding" *Then* можна повернутися до skipped steps; `POST /v1/me/onboarding/step` працює навіть після completion для skipped.

### Permissions

| Роль | Доступ |
|---|---|
| Authenticated (own, onboarding active або skipped steps) | ✅ |
| Admin | ✅ за іншого (audit) |

### Edge cases

- **EC-1** — Optional vs required step list — config'oz определеяет:
  - **Trainer required:** choose-role, whats-your-name, experience, training-types, client-types, where-train, work-schedule.
  - **Trainer optional:** certifications (within experience), have-programs, add-to-library, profile-photo.
  - **Client required:** choose-role, whats-your-name, goals, current-shape.
  - **Client optional:** invitation.
- **EC-2** — Можна complete лише коли всі required completed (skipped — допустимо, completed — теж).

### Технічна спека

- API: `onboarding.md` (TBD) § `POST /me/onboarding/skip-step`, `GET /me/onboarding/state`, `GET /me/onboarding/preview`
- DB: `onboarding_progress.steps jsonb` — per-step `{ status: completed|skipped|pending, completed_at, skipped_at, data: {...} }`
- Config: `config/onboarding.php` — required-vs-optional lists per role

---

## Залежності модуля Onboarding

- **Залежить від:** Auth (user must be logged-in), Users (всі поля профіля), Files (для аватара), Clients (для invitation acceptance).
- **Залежать від нього:** усі модулі — `onboarding_completed_at` блокує більшість mutate-операцій до завершення.
