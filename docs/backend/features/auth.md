# Features — Auth & Identity

**Модуль:** Auth & Identity · **Phase:** 0 · **Файлів-сусідів:** [`../auth.md`](../auth.md) (technical), [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) (tables)

5 фіч, що покривають усі сценарії автентифікації та керування ідентичністю користувача.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | AUTH-001 | Local credentials authentication | full |
| 2 | AUTH-002 | OAuth providers | full |
| 3 | AUTH-003 | Refresh token lifecycle | full |
| 4 | AUTH-004 | Password & email management | compact |
| 5 | AUTH-005 | Account deletion (GDPR) | full |

---

## 1. Local credentials authentication [AUTH-001]

**Phase:** 0 · **Стиль:** full

### Контекст

Базовий шлях реєстрації і логіну через email + пароль. Підтримує обидві ролі (trainer, client). При реєстрації email обов'язково верифікується через лист з токеном; до верифікації акаунт існує, але не може робити mutate-операції. Реєстрація та логін захищені rate limiting'ом і brute-force lockout'ом.

### User stories

- **US-AUTH-001** — *Як новий користувач, я хочу зареєструватися через email і пароль, щоб мати власний акаунт.*
- **US-AUTH-002** — *Як зареєстрований користувач, я хочу підтвердити свій email через посилання з листа, щоб отримати повний доступ до додатку.*
- **US-AUTH-003** — *Як існуючий користувач, я хочу логінитись email'ом і паролем, щоб працювати з додатком.*
- **US-AUTH-004** — *Як користувач, я хочу, щоб система блокувала підозрілі brute-force спроби, щоб мій акаунт був захищеним.*

### User flow + UI mapping

1. **Реєстрація:** користувач відкриває `RegisterScreen` → вводить email, password, role (`trainer | client`) → `POST /v1/auth/register`.
2. Backend:
   - Валідує (`email` unique, `password` ≥ 8 chars + 1 digit + 1 letter).
   - Створює `users` row з `email_verified_at = null`, `password_hash` (bcrypt cost 12).
   - Створює запис `email_verifications` з `token` (32 random bytes, hex) + `expires_at = +24h`.
   - Енкуює `SendEmailVerificationJob` (queue: `critical`).
3. Frontend показує `CheckEmailScreen` з кнопкою "Open email app".
4. Користувач відкриває лист → тапає посилання → deep link у додаток → `POST /v1/auth/verify-email` з `token`.
5. Backend: знаходить unexpired token → `users.email_verified_at = now()` → видаляє запис → респонс з access+refresh tokens.
6. **Логін:** користувач відкриває `LoginScreen` → вводить email/password → `POST /v1/auth/login`.
7. Backend:
   - Перевіряє `users.email_verified_at` not null. Якщо null → `403 email_not_verified` з підказкою на resend.
   - Перевіряє пароль (`Hash::check`).
   - Перевіряє rate limit (per IP, per user).
   - Генерує access token (Sanctum, TTL 15хв) + refresh token (random 64 bytes, hash зберігається у `refresh_tokens`, TTL 30 днів).
   - Видає event `UserLoggedIn` для audit log.
   - Респонс: `{ access_token, refresh_token, user: {...}, expires_in: 900 }`.

### Acceptance criteria

- **AC-1** — *Given* email не в БД *When* `POST /v1/auth/register` валідними даними *Then* `201` з `{ user_id, email, email_verified_at: null }`, лист з token у inbox.
- **AC-2** — *Given* email уже в БД *When* `POST /v1/auth/register` *Then* `422 email_taken` (не розкриваючи деталей).
- **AC-3** — *Given* slabky пароль (< 8 chars або no digit/letter) *When* `POST /v1/auth/register` *Then* `422 password_weak` з полем `errors.password`.
- **AC-4** — *Given* валідний `token` з листа, не expired *When* `POST /v1/auth/verify-email` *Then* `200`, `email_verified_at` set, повертаються access+refresh tokens.
- **AC-5** — *Given* expired/invalid `token` *When* `POST /v1/auth/verify-email` *Then* `410 verification_expired` з підказкою resend.
- **AC-6** — *Given* верифікований email + правильний пароль *When* `POST /v1/auth/login` *Then* `200` з tokens, `Audit log` запис створений.
- **AC-7** — *Given* unverified email *When* `POST /v1/auth/login` *Then* `403 email_not_verified` з полем `next_action: "verify_email"`.
- **AC-8** — *Given* 10 невдалих login-спроб з одного IP за 5хв *Then* IP блокується на 15хв, відповідь `429 too_many_attempts` + header `Retry-After: 900`.
- **AC-9** — *Given* 5 невдалих login-спроб для одного email *Then* користувач блокується на 15хв; email-уведомлення про підозрілу активність.

### Permissions

| Роль | Реєстрація | Логін | Verify email |
|---|---|---|---|
| Anonymous | ✅ | ✅ | ✅ |
| Authenticated | ❌ (already in) | ❌ | ✅ для свого pending |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Подвійний submit реєстрації (network slow → user тапнув двічі) | `Idempotency-Key` header у POST; повторний запит за 24h повертає той самий `201` без створення дубля |
| EC-2 | Email-провайдер не доставив лист (bounce, spam) | Endpoint `POST /v1/auth/resend-verification` з rate limit 1/хв; tracking delivery status у `email_verifications.last_send_status` |
| EC-3 | Користувач намагається verify expired token | `410` → frontend показує "Send new link"; стара verification row не видаляється до replacement |
| EC-4 | Користувач спробував login одночасно у двох пристроях | Видаються два незалежні access+refresh пари; список активних сесій бачний у settings |
| EC-5 | Конкурентна реєстрація з тим самим email (race) | DB UNIQUE constraint → `422 email_taken` для другого |
| EC-6 | Користувач забув пароль до verification | Endpoint `POST /v1/auth/forgot-password` працює навіть для unverified акаунтів (та сама обмеженість, що й AUTH-004) |
| EC-7 | SQL injection / malicious email format | Laravel Form Request validation з `email` rule + sanitization; rejected з `422` |

### Зв'язок з технічною спекою

- API: [`../auth.md`](../auth.md) § `POST /auth/register`, `POST /auth/login`, `POST /auth/verify-email`, `POST /auth/resend-verification`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `users`, `email_verifications`, `audit_logs`
- Events: `UserRegistered`, `EmailVerified`, `UserLoggedIn`, `UserLockedOut`
- Jobs: `SendEmailVerificationJob` (queue `critical`)

---

## 2. OAuth providers [AUTH-002]

**Phase:** 0 · **Стиль:** full

### Контекст

Альтернативний (і паралельний) шлях логіну через **Google**, **Apple Sign-In**, **Facebook** — через Laravel Socialite. Підтримує і реєстрацію (перший OAuth login → автоматичне створення `users` row), і login. Один user може мати кілька linked OAuth identities (через `oauth_identities`). Підтверджений провайдером email вважається верифікованим (без email confirmation flow).

### User stories

- **US-AUTH-005** — *Як новий користувач, я хочу швидко зареєструватись через Google/Apple/Facebook, без введення пароля.*
- **US-AUTH-006** — *Як існуючий користувач з email-акаунтом, я хочу прив'язати OAuth-провайдер, щоб логінитись швидше.*
- **US-AUTH-007** — *Як користувач, я хочу від'єднати OAuth-провайдер, якщо більше не хочу його використовувати.*
- **US-AUTH-008** — *Як користувач Apple Sign-In, я хочу зберегти приватність свого email (Apple's private email relay).*

### User flow + UI mapping

1. На `LoginScreen` / `RegisterScreen` користувач тапає кнопку "Continue with Google" (екран: `LoginScreen.tsx`, `OAuthButton` компонент).
2. Клієнт відкриває native OAuth flow (через `expo-auth-session` або native SDK) → отримує `id_token` від провайдера.
3. Клієнт викликає `POST /v1/auth/oauth/{provider}` з `{ id_token }` (provider: `google` | `apple` | `facebook`).
4. Backend:
   - Валідує `id_token` через Socialite (`Socialite::driver($provider)->userFromToken($id_token)`).
   - Отримує `provider_subject` (id юзера в провайдера), email, name, avatar.
   - **Шукає** запис у `oauth_identities` за `(provider, provider_subject)`.
     - Якщо знайдено → бере `user_id` → видає tokens.
     - Якщо ні → шукає user за email (якщо email returned і `email_verified`).
       - Знайшов → лінкує: створює `oauth_identities` row.
       - Не знайшов → створює нового `users` (email_verified_at = now, role = `client` за дефолтом; роль уточнюється в onboarding), потім лінкує.
   - Видає event `OAuthLoggedIn`.
   - Респонс: `{ access_token, refresh_token, user, expires_in, is_new_user: bool }`.
5. **Apple Private Relay:** якщо Apple повертає email вигляду `*@privaterelay.appleid.com`, backend зберігає його без особливої обробки; вихідні листи проходять.
6. **Disconnect:** `DELETE /v1/me/oauth/{provider}` від залогіненого користувача → видаляє `oauth_identities` row. Якщо це остання login-method (немає пароля і немає інших OAuth), запит відхиляється `409 last_login_method`.

### Acceptance criteria

- **AC-1** — *Given* валідний Google `id_token` для нового користувача *When* `POST /v1/auth/oauth/google` *Then* `200` з `is_new_user: true`, створено `users`+`oauth_identities`, `email_verified_at` set.
- **AC-2** — *Given* існуючий user з тим самим email + Google `id_token` (verified email) *Then* `200`, новий запис у `oauth_identities` (link), `is_new_user: false`.
- **AC-3** — *Given* провайдер повернув не-verified email *When* attempt link до існуючого user *Then* `409 email_not_verified_at_provider` (захист від takeover).
- **AC-4** — *Given* invalid/expired `id_token` *Then* `401 oauth_invalid_token`.
- **AC-5** — *Given* Apple повертає `email = null` (повторний login без consent) *Then* пошук user'а за `oauth_identities.provider_subject`; новий user НЕ створюється без email.
- **AC-6** — *Given* user має пароль + 2 OAuth *When* `DELETE /v1/me/oauth/google` *Then* `200`, лишилось 2 методи login.
- **AC-7** — *Given* user має тільки OAuth Google (no password) *When* `DELETE /v1/me/oauth/google` *Then* `409 last_login_method`.
- **AC-8** — *Given* OAuth rate limit перевищений (20 req/хв/IP) *Then* `429`.

### Permissions

| Роль | OAuth login | Link до акаунта | Unlink |
|---|---|---|---|
| Anonymous | ✅ | ❌ | — |
| Authenticated | — | ✅ для свого | ✅ для свого (якщо є інший login method) |
| Admin | — | ✅ за іншого юзера (rare) | ✅ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Один OAuth-провайдер прив'язаний до двох local акаунтів через race | DB UNIQUE на `(provider, provider_subject)` → fallback на error message; admin manual resolve |
| EC-2 | Apple Sign-In private email — користувач забув з якого Apple ID логінився | Login flow знаходить за `provider_subject`, не за email; UX fine |
| EC-3 | Facebook OAuth deprecated / disabled провайдером | Health-check endpoint `GET /v1/auth/oauth/providers` повертає `{ google: ok, apple: ok, facebook: disabled }` |
| EC-4 | Користувач відкликав OAuth permission у провайдера | При наступному login видає новий `id_token`; backend перевалідує → OK |
| EC-5 | Подвійний OAuth callback (network retry) | Idempotency через UNIQUE `(provider, provider_subject)` constraint; повторний запит видає той самий результат |
| EC-6 | Спроба підмінити email через OAuth (akciя linking без verification) | AC-3 захищає (vendor email_verified=false → reject) |

### Зв'язок з технічною спекою

- API: [`../auth.md`](../auth.md) § `POST /auth/oauth/{provider}`, `GET /auth/oauth/providers`, `DELETE /me/oauth/{provider}`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `users`, `oauth_identities`
- Events: `OAuthLoggedIn`, `OAuthLinked`, `OAuthUnlinked`
- Config: `config/services.php` для credentials Google/Apple/Facebook; secrets у `.env`

---

## 3. Refresh token lifecycle [AUTH-003]

**Phase:** 0 · **Стиль:** full

### Контекст

Короткоживучий **access token** (15хв, Sanctum) + довгоживучий **refresh token** (30 днів) у пар. Refresh token використовується для отримання нового access token, **ротується при кожному використанні** (попередній invalidate). Стара ротація — захист від крадіжки refresh token'а.

### User stories

- **US-AUTH-009** — *Як користувач, я хочу не вводити пароль кожні 15 хвилин — додаток сам поновлює сесію.*
- **US-AUTH-010** — *Як користувач, я хочу бачити список активних сесій (пристрої) і завершити окрему, якщо забув logout.*
- **US-AUTH-011** — *Як користувач, я хочу одночасно вийти з усіх пристроїв, якщо підозрюю, що мій пароль скомпрометовано.*
- **US-AUTH-012** — *Як система, я хочу автоматично invalidate refresh token, якщо хтось спробує використати вже використаний refresh.*

### User flow + UI mapping

1. **Refresh flow:** клієнт зберігає `access_token` (in-memory) + `refresh_token` (Keychain/Keystore secure storage).
2. При отриманні `401 token_expired` від API клієнт викликає `POST /v1/auth/refresh` з `{ refresh_token }`.
3. Backend:
   - Хеширує `refresh_token`, шукає в `refresh_tokens` table.
   - Перевіряє `expires_at > now()` і `revoked_at IS NULL`.
   - Створює новий access token (Sanctum, 15хв) + новий refresh token (32 random bytes, hash зберігається; old marked `revoked_at = now()`, `replaced_by_id = new.id`).
   - Респонс: `{ access_token, refresh_token, expires_in: 900 }`.
4. Клієнт оновлює tokens і повторює оригінальний запит.
5. **Logout single:** `POST /v1/auth/logout` з access token → invalidate поточний refresh token (`revoked_at = now()`).
6. **Logout all:** `POST /v1/auth/logout-all` → invalidate всі refresh-tokens юзера → broadcast `LoggedOutEverywhere` event → email notification.
7. **Sessions list:** `GET /v1/me/sessions` → list non-revoked refresh tokens з `device_label`, `ip`, `user_agent`, `last_used_at`. `DELETE /v1/me/sessions/{id}` invalidate конкретну.

### Acceptance criteria

- **AC-1** — *Given* валідний non-expired refresh token *When* `POST /v1/auth/refresh` *Then* `200` з новими токенами; старий refresh marked revoked.
- **AC-2** — *Given* expired refresh token *Then* `401 refresh_expired`, клієнт показує LoginScreen.
- **AC-3** — *Given* вже використаний (revoked) refresh token *When* `POST /v1/auth/refresh` *Then* `401 refresh_reused`. Token вже invalidated. **Усі активні refresh tokens юзера invalidate'ні** (захист від крадіжки). User отримує email "suspicious activity detected".
- **AC-4** — *Given* invalid refresh token (random string) *Then* `401 refresh_invalid`.
- **AC-5** — *Given* logged-in user *When* `POST /v1/auth/logout` *Then* `204`, поточний refresh revoked, access token продовжує працювати до natural expiry (15хв max).
- **AC-6** — *Given* logged-in user *When* `POST /v1/auth/logout-all` *Then* `204`, всі refresh revoked, email "Logged out everywhere" надіслано, WS connections примусово закриваються.
- **AC-7** — *Given* `GET /v1/me/sessions` *Then* `200` з list активних сесій (`current: true` для поточної).
- **AC-8** — *Given* `DELETE /v1/me/sessions/{id}` для чужої сесії *Then* `404` (without revealing existence).

### Permissions

| Роль | Refresh | Logout (own) | Logout all (own) | List sessions | Revoke session |
|---|---|---|---|---|---|
| Authenticated | ✅ | ✅ | ✅ | ✅ власні | ✅ власні |
| Admin | — | — | — | ✅ для будь-кого | ✅ для будь-кого (з audit) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Подвійний refresh (network race — клієнт викликав двічі одночасно) | Перший виграє, другий отримує `401 refresh_reused`. Клієнт має використовувати mutex локально |
| EC-2 | Refresh-token вкрадено + використано викрадачем | При наступній легітимній спробі — AC-3: всі tokens revoked, email + force re-login |
| EC-3 | Refresh tokens table зростає | `RefreshTokenCleanupJob` (daily) видаляє expired та revoked > 30 днів |
| EC-4 | Користувач не використовував додаток > 30 днів | Refresh expired → forced re-login. Список сесій показує `last_used_at` як indicator |
| EC-5 | Logout-all з активним WS connection | Listener на `LoggedOutEverywhere` event у Reverb розриває всі WS connections юзера |
| EC-6 | Concurrent логін з кількох пристроїв | Кожен пристрій має власний refresh — паралельні tokens нормальні |

### Зв'язок з технічною спекою

- API: [`../auth.md`](../auth.md) § `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/logout-all`, `GET /me/sessions`, `DELETE /me/sessions/{id}`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `refresh_tokens` (з полями `replaced_by_id`, `revoked_at`, `device_label`, `last_used_at`, `ip`, `user_agent`)
- Events: `TokenRefreshed`, `LoggedOut`, `LoggedOutEverywhere`, `SuspiciousActivityDetected`
- Jobs: `RefreshTokenCleanupJob` (scheduled daily 04:00)

---

## 4. Password & email management [AUTH-004]

**Phase:** 0 · **Стиль:** compact

### Контекст

Класичні self-service операції: зміна пароля, забув-пароль, зміна email (з re-verification). Усі — у settings screen.

### User stories

- **US-AUTH-013** — *Як logged-in користувач, я хочу змінити свій пароль зі знанням старого.*
- **US-AUTH-014** — *Як користувач, я хочу скинути пароль через email, якщо його забув.*
- **US-AUTH-015** — *Як користувач, я хочу змінити свій email з підтвердженням нового.*

### Acceptance criteria

- **AC-1** — *Given* logged-in user *When* `POST /v1/me/password` з `{ current_password, new_password }` *Then* `204`, пароль оновлено, всі refresh tokens крім поточного revoked, email-уведомлення про зміну.
- **AC-2** — *Given* неправильний `current_password` *Then* `422 wrong_password`.
- **AC-3** — *Given* email є в БД *When* `POST /v1/auth/forgot-password` *Then* `204` (не розкриваючи існування), `password_resets` row створено, лист з token (TTL 1h) надіслано. Rate limit 1/15хв/email.
- **AC-4** — *Given* валідний reset token *When* `POST /v1/auth/reset-password` з `{ token, new_password }` *Then* `204`, пароль оновлено, всі refresh tokens revoked, email-уведомлення.
- **AC-5** — *Given* logged-in user *When* `POST /v1/me/email` з `{ new_email, current_password }` *Then* `204`, `email_change_requests` запис створено, лист з confirmation token (TTL 24h) на **новий** email. Старий email отримує уведомлення "Email change requested".
- **AC-6** — *Given* валідний email-change token *When* `POST /v1/auth/confirm-email-change` *Then* `204`, `users.email` оновлено, change request видалено.

### Permissions

| Роль | Доступ |
|---|---|
| Authenticated | ✅ для свого |
| Anonymous | ✅ forgot-password / reset-password |

### Edge cases

- **EC-1** — Forgot-password для unverified акаунта: працює (дозволяє reset навіть без верифікації — корисно якщо verification email був втрачено).
- **EC-2** — Email change на email що вже зайнятий: `422 email_taken` при request (без leak про існування — generic "this email cannot be used").
- **EC-3** — Race: одночасний `change-password` і `reset-password` — DB-level optimistic locking на `users.password_hash`; виграє останній.

### Технічна спека

- API: [`../auth.md`](../auth.md) § `POST /me/password`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /me/email`, `POST /auth/confirm-email-change`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `password_resets`, `email_change_requests`
- Events: `PasswordChanged`, `EmailChanged`, `PasswordResetRequested`
- Jobs: `SendPasswordResetEmailJob`, `SendEmailChangeConfirmationJob`, `NotifyOldEmailAboutChangeJob`

---

## 5. Account deletion (GDPR) [AUTH-005]

**Phase:** 0 · **Стиль:** full

### Контекст

GDPR "right to erasure" + "right to export". Користувач може:
1. **Експортувати** всі свої дані (профіль, сесії, повідомлення, метрики, транзакції) у ZIP-архіві.
2. **Видалити** свій акаунт. Видалення — **soft delete з grace period 30 днів** (відновлення через support), потім — **hard delete**.

При hard delete тренерські дані інших клієнтів НЕ видаляються (referenced data: сесії з участю, повідомлення в чатах); особисті дані анонімізуються (name → "Deleted user", avatar → null, email → null).

### User stories

- **US-AUTH-016** — *Як користувач, я хочу запитати експорт усіх моїх даних у читабельному форматі (JSON).*
- **US-AUTH-017** — *Як користувач, я хочу видалити свій акаунт, щоб дані були стерті з системи.*
- **US-AUTH-018** — *Як користувач, я хочу мати 30 днів на скасування deletion, якщо передумав.*
- **US-AUTH-019** — *Як тренер, я хочу, щоб видалення мого клієнта не ламало мою історію сесій і чат.*

### User flow + UI mapping

1. **Export:** `SettingsScreen.tsx` → "Export my data" → `POST /v1/me/export`.
2. Backend:
   - Створює row у `data_exports` зі status `pending`.
   - Енкуює `BuildDataExportJob` (queue `low`).
   - Респонс: `202 Accepted` з `{ export_id }`.
3. Job збирає JSON-дамп: profile, sessions (where user is participant), messages, body measurements, workout logs, transactions; пакує в ZIP; завантажує в S3 з signed URL (TTL 7 днів); надсилає email "Your export is ready" з URL.
4. **Delete request:** `SettingsScreen.tsx` → "Delete account" → modal з confirm (тип `current_password` + reason optional) → `DELETE /v1/me/account`.
5. Backend:
   - Верифікує пароль (якщо є; OAuth-only — confirmation через 2FA-like email link).
   - Set `users.deleted_at = now()`, `users.deletion_scheduled_at = now() + 30days`.
   - Invalidate всі refresh tokens.
   - Broadcast `AccountDeletionRequested` event.
   - Email "Your account will be deleted in 30 days" зі скасуванням URL.
   - Респонс: `200` з `{ scheduled_deletion_at }`.
6. **Cancel request:** користувач може залогінитись протягом grace period → `POST /v1/me/account/restore`.
   - Backend: `deleted_at = null`, `deletion_scheduled_at = null`.
7. **Hard delete:** `HardDeleteScheduledAccountsJob` (daily 03:30) знаходить users з `deletion_scheduled_at <= now()`:
   - Видаляє: `refresh_tokens`, `oauth_identities`, `password_resets`, `email_change_requests`, `email_verifications`, `device_tokens`, `body_measurements`, `personal_records`, `data_exports`, `audit_logs`.
   - Тренерські дані (сесії, програми, клієнти roster, транзакції) — **залишаються**.
   - Анонімізує `users` row: `name = "Deleted user"`, `email = null`, `avatar_url = null`, `password_hash = null`, `phone = null`, `bio = null`. Row не видаляється, бо FK з усіх таблиць (sessions, messages...).
   - Видаляє файли з S3 (avatars + media owned by user, що не shared).

### Acceptance criteria

- **AC-1** — *Given* logged-in user *When* `POST /v1/me/export` *Then* `202` з `export_id`, job у queue, email "Export ready" в межах 24h з signed URL.
- **AC-2** — *Given* export URL *When* GET по URL у межах 7 днів *Then* `200` з ZIP-файлом; після 7 днів — `403 expired`.
- **AC-3** — *Given* logged-in user з валідним паролем *When* `DELETE /v1/me/account` з правильним `current_password` *Then* `200`, `users.deleted_at` set, refresh tokens revoked.
- **AC-4** — *Given* deleted (soft) user *When* `POST /v1/auth/login` *Then* `200` (login дозволений!), але `user.deletion_pending: true`.
- **AC-5** — *Given* soft-deleted user *When* `POST /v1/me/account/restore` *Then* `200`, `deleted_at` cleared, email "Account restored".
- **AC-6** — *Given* user з `deletion_scheduled_at < now()` *When* `HardDeleteScheduledAccountsJob` runs *Then* всі personal data видалено, `users` row анонімізовано, тренерські дані інших — недоторкані.
- **AC-7** — *Given* hard-deleted user *When* інший user намагається send message у conversation з ним *Then* `409 user_deleted`.
- **AC-8** — *Given* hard-deleted client був учасником сесії *When* trainer відкриває session detail *Then* у списку participants `name = "Deleted user"`, аватар placeholder.

### Permissions

| Роль | Запит export | Запит deletion | Cancel deletion | Hard delete |
|---|---|---|---|---|
| Authenticated | ✅ власне | ✅ власне | ✅ власне (в grace period) | ❌ |
| Admin | ✅ для будь-кого (з audit) | ❌ (за запитом юзера тільки) | ✅ (з audit) | ✅ (manual override) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Користувач у grace period намагається переєструватися з тим самим email | `422 email_taken_pending_deletion` з підказкою restore замість register |
| EC-2 | OAuth-only user (no password) запитує deletion | Замість password — email-link confirmation (token TTL 1h) |
| EC-3 | Export job падає (S3 timeout) | Retry 3× з backoff; після failure — email "Export failed, contact support" |
| EC-4 | Export для user з > 10 GB media | `data_exports` row має `size_estimate`; для exports > 5 GB — email warning "Export може зайняти > 24h"; job pre-streams без full memory load |
| EC-5 | Hard delete user, що має активні subscriptions (client_packages) | Subscriptions cancelled, trainer notified; transactions залишаються (referenced FK з `transactions.client_id` SET NULL) |
| EC-6 | Hard delete trainer | Усі його `clients` рядки → soft-delete; `sessions` його учасників → cancel-future; `programs` → archive (не видаляти, бо assigned до клієнтів) |
| EC-7 | Concurrent restore + hard-delete job | Job перевіряє `deleted_at IS NOT NULL AND deletion_scheduled_at < now()` у select-for-update; race window мінімальний |
| EC-8 | Дані в audit_logs хочемо зберегти для compliance | `audit_logs` row для user-id залишається з анонімізованим referencing; `user_id` set NULL, `user_email_at_event` зберігається як plaintext snapshot |

### Зв'язок з технічною спекою

- API: [`../auth.md`](../auth.md) § `POST /me/export`, `GET /me/exports/{id}`, `DELETE /me/account`, `POST /me/account/restore`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `users` (з `deleted_at`, `deletion_scheduled_at`), `data_exports`
- Events: `AccountDeletionRequested`, `AccountRestored`, `AccountHardDeleted`, `DataExportReady`
- Jobs: `BuildDataExportJob` (queue `low`), `HardDeleteScheduledAccountsJob` (scheduled daily 03:30), `NotifyTrainerAboutClientDeletionJob`

---

## Залежності модуля Auth

- **Залежить від:** Users (для FK), Files (для avatar S3 cleanup на hard delete), Notifications (для email/push при login/logout/deletion)
- **Залежать від нього:** усі інші модулі (через `auth()->user()` middleware)
