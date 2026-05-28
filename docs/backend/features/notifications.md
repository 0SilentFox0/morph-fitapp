# Features — Notifications (Push & In-App)

**Модуль:** Notifications · **Phase:** 0 (registration + scaffold), 2 (chat push), 3 (packages/transactions push) · **Файлів-сусідів:** `notifications.md` (TBD) (technical), [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md)

2 фічі — підсистема push-доставки і in-app notification feed.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | NTF-001 | Push notification subsystem | full |
| 2 | NTF-002 | In-app notification feed | compact |

---

## 1. Push notification subsystem [NTF-001]

**Phase:** 0 (foundation), 1+ (per-trigger expansion) · **Стиль:** full

### Контекст

Єдина точка delivery всіх push-уведомлень до iOS/Android клієнтів через **Firebase Cloud Messaging (FCM)**. Включає:

1. Реєстрацію device token при login / app launch.
2. Тригери (`SessionReminderJob`, `MessageSentListener`, `PackageExhaustedListener`, ...) — кожен формує `Notification` запис і `SendPushJob`.
3. Доставку через FCM з обробкою failures (token invalid → cleanup).
4. Per-user preferences (per-channel toggle: sessions, chat, packages, marketing).
5. Localization payload (через `users.locale`).

Push'і — лише сповіщення; **state of truth** залишається в БД, push не використовується як єдиний transport (через unreliability).

### User stories

- **US-NTF-001** — *Як user, я хочу отримувати push на мобільний пристрій про важливі події (нова сесія, повідомлення, нагадування).*
- **US-NTF-002** — *Як user, я хочу налаштувати, які типи push'ів я отримую (per-channel toggle).*
- **US-NTF-003** — *Як user, я хочу, щоб push приходив на тій мові, що я обрав.*
- **US-NTF-004** — *Як user, я хочу, щоб push не дублювали себе якщо я onLine у додатку (нет повторного in-app banner для уже-побаченого).*

### User flow + UI mapping

1. **Token registration:**
   - При login/app launch клієнт отримує FCM token з SDK.
   - `POST /v1/me/device-tokens` з `{ token, platform: "ios" | "android", device_label: optional, app_version }`.
   - Backend: UPSERT у `device_tokens` (UNIQUE на `(user_id, token)`); set `last_seen_at = now()`.
2. **Tригерування push:** будь-який event у системі може мати listener, що видає `SendPushJob`:
   - Listener (наприклад `NotifyOnMessageSent`): формує `Notification` row у БД (`type`, `recipient_id`, `payload jsonb`, `read_at = null`).
   - Dispatch `SendPushJob` з `notification_id`.
3. **`SendPushJob`** (queue `critical`):
   - Loads `Notification` + `recipient` user.
   - Перевіряє `notification_preferences`: якщо канал disabled → skip push (БД-запис залишається для in-app feed).
   - Loads всі `device_tokens` для recipient.
   - Формує FCM payload з localized title/body (через `__('notifications.session_reminder_title')` + locale).
   - Викликає FCM API (multicast: до 500 tokens per request).
   - Обробляє response: для tokens з error `NOT_REGISTERED` / `INVALID_REGISTRATION` → видаляє з `device_tokens`.
4. **Delivery confirmation:** клієнт при отриманні push формує `MessageReceived` callback (якщо app у foreground); FCM data payload містить `notification_id`, який клієнт відмічає як `delivered_at`. Це не gateway-критично, але дає метрику доставки.
5. **Foreground suppression:** клієнт активний → клієнт сам показує in-app banner (не FCM); push payload містить `suppress_in_foreground: true`.

### Acceptance criteria

- **AC-1** — *Given* logged-in user *When* `POST /v1/me/device-tokens` з валідним token *Then* `200`, UPSERT у `device_tokens`. Повторний запит з тим самим token → не створює дубль, оновлює `last_seen_at`.
- **AC-2** — *Given* invalid platform value *Then* `422 platform_invalid`.
- **AC-3** — *Given* user logged out (`POST /auth/logout`) *Then* `device_tokens.deleted_at` set для tokens з цього пристрою (по передаваному `device_label` або поточному token).
- **AC-4** — *Given* event `MessageSent` для конкретного conversation *When* listener fires *Then* `Notification` row створено для не-онлайн учасника; `SendPushJob` enqueued.
- **AC-5** — *Given* user з `notification_preferences.chat = false` *When* trigger push для chat *Then* `Notification` row існує (для in-app feed), але push **не надсилається**.
- **AC-6** — *Given* FCM повертає error `NOT_REGISTERED` для token *Then* `device_tokens.deleted_at` set; наступний trigger для цього user skip's invalid token.
- **AC-7** — *Given* `users.locale = 'uk'` *Then* push title/body локалізовані на українську.
- **AC-8** — *Given* `SendPushJob` падає (FCM down) *Then* retry 3× exponential backoff (10s, 60s, 300s); після failure — запис у `failed_jobs`.
- **AC-9** — *Given* multicast > 500 tokens *Then* розбити на batches.

### Permissions

| Роль | Register token | Delete own token | Read other's tokens |
|---|---|---|---|
| Authenticated | ✅ свій | ✅ свої | ❌ |
| Admin | ❌ | ✅ (audit) | ✅ (audit) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | User вийшов з акаунта на пристрої А, але token не invalidated (network fail) | `LogoutListener` set `device_tokens.deleted_at`; якщо fail — старий token буде marked invalid при FCM `NOT_REGISTERED` |
| EC-2 | User login'нувся в нового акаунта на тому самому пристрої | FCM token той самий, але `user_id` інший. UPSERT з old `user_id` → видаляє стару прив'язку; new row створюється |
| EC-3 | Tom самий FCM token прив'язано до двох user'ів через race | UNIQUE на `token` (без user_id) — `ON CONFLICT (token)` UPDATE з новим `user_id` |
| EC-4 | Спам push'ами під час масового події (наприклад, broadcast trainer'ом) | Rate limiting per recipient: max 50 push/година; решта — у in-app feed |
| EC-5 | Apple APNs обмежує payload розмір 4KB | Form payload з `data` (мінімум) + `notification` (title/body); великий контекст лишається в БД, push несе тільки `notification_id` як deep link |
| EC-6 | DoNotDisturb hours користувача (post-MVP) | `notification_preferences.quiet_hours = { from: "22:00", to: "08:00", timezone }`; push delayed до end of quiet hours або silent push (notification без sound) |
| EC-7 | Job-failure не повинно блокувати оригінальну transaction | Listener діє після transaction commit (через Laravel `afterCommit()` для events); push delivery — best-effort |
| EC-8 | FCM token expiration (Apple змінив після рестарта device) | Detected через `NOT_REGISTERED`; cleanup; на наступному app launch клієнт re-register |

### Зв'язок з технічною спекою

- API: `notifications.md` (TBD) § `POST /me/device-tokens`, `DELETE /me/device-tokens/{id}`, `PATCH /me/settings` (notification_preferences)
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `device_tokens`, `notifications`
- Events / Listeners (приклади): `MessageSent` → `NotifyOnMessageSent`, `SessionCreated` → `NotifyOnSessionCreated`, `PackageExhausted` → `NotifyOnPackageExhausted`, `TransactionCreated` → `NotifyOnTransactionCreated`
- Jobs: `SendPushJob` (queue `critical`), `SessionRemindersJob` (scheduled every 5 min)
- Config: `config/services.php` для FCM credentials; `resources/lang/{locale}/notifications.php` для текстів

### Тригери (повний перелік для MVP)

| Тригер | Канал | Коли надсилається |
|---|---|---|
| `SessionRemindersJob` 24h before | `sessions` | За 24h до `session.start_at` (per participant) |
| `SessionRemindersJob` 1h before | `sessions` | За 1h до `session.start_at` |
| `SessionCreated` (manually by trainer) | `sessions` | Одразу при створенні (тільки для не-creator учасників) |
| `SessionUpdated` (rescheduled/canceled) | `sessions` | Одразу при зміні (для всіх учасників крім ініціатора) |
| `MessageSent` | `chat` | Одразу, якщо recipient offline у conversation |
| `PackageAssigned` | `packages` | Trainer призначив пакет — push клієнту |
| `PackageExhausted` | `packages` | `client_package.remaining = 0` — push клієнту і тренеру |
| `PackageExpiring` (3 дні до кінця) | `packages` | Daily job — push клієнту |
| `TransactionCreated` | `payments` | Тренер записав transaction — push клієнту (factura) |
| `WorkoutCompleted` | `workouts` | Сесія marked `completed` — підтвердження клієнту |

---

## 2. In-app notification feed [NTF-002]

**Phase:** 0 · **Стиль:** compact

### Контекст

Кожна push-уведомлення також зберігається як `Notification` row → користувач бачить feed у додатку (icon з badge counter). Підтримує mark-as-read, mark-all-read, фільтр по типу. Якщо push не доставлено (offline/disabled), in-app feed залишається source of truth.

### User stories

- **US-NTF-005** — *Як user, я хочу бачити список уведомлень у додатку, включаючи ті, що пропустив.*
- **US-NTF-006** — *Як user, я хочу позначити окрему уведомлення як прочитану.*
- **US-NTF-007** — *Як user, я хочу очистити весь feed одним тапом.*

### Acceptance criteria

- **AC-1** — *Given* logged-in user *When* `GET /v1/me/notifications?cursor=...&limit=20` *Then* `200` з cursor-paginated list (сортовано DESC по `created_at`).
- **AC-2** — *Given* response *Then* response має `meta.unread_count` для badge.
- **AC-3** — *Given* notification *When* `PATCH /v1/me/notifications/{id}` з `{ read: true }` *Then* `200`, `read_at = now()`.
- **AC-4** — *Given* user *When* `POST /v1/me/notifications/mark-all-read` *Then* `200`, всі `read_at = now()` для свого юзера.
- **AC-5** — *Given* WS event `NotificationDelivered` на канал `private-user.{id}` *Then* клієнт оновлює feed і badge real-time.

### Permissions

| Роль | Доступ |
|---|---|
| Authenticated | ✅ свої тільки |
| Admin | ✅ (audit) |

### Edge cases

- **EC-1** — Notification feed може швидко розрастатися — retention 90 днів (cleanup job `NotificationsRetentionJob`); старіші — auto-delete.
- **EC-2** — Race: user marked notification read у двох devices одночасно — idempotent (other no-op).

### Технічна спека

- API: `notifications.md` (TBD) § `GET /me/notifications`, `PATCH /me/notifications/{id}`, `POST /me/notifications/mark-all-read`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `notifications` (з `type`, `recipient_id`, `payload jsonb`, `read_at`, `delivered_at`, `created_at`)
- Events: `NotificationDelivered` (broadcast)
- Jobs: `NotificationsRetentionJob` (scheduled weekly, retention 90 днів)

---

## Залежності модуля Notifications

- **Залежить від:** Auth (recipient_id), Users (locale, preferences), FCM API.
- **Залежать від нього:** Sessions, Chat, Packages, Transactions, Workout Tracking — всі вони dispatch'ять events, на які listeners модуля реагують.
