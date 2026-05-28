# Features — External Integrations

**Модуль:** External Integrations · **Phase:** 2 · **Файлів-сусідів:** [`../integrations.md`](../integrations.md) (technical)

3 фічі. Інтеграції з зовнішніми сервісами: календарі (Google bi-directional, Apple via ICS), OAuth providers connect/disconnect (Google/Apple/Facebook).

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | INT-001 | Google Calendar bi-directional sync | full |
| 2 | INT-002 | Apple Calendar ICS feed | full |
| 3 | INT-003 | OAuth providers connect/disconnect | compact |

---

## 1. Google Calendar bi-directional sync [INT-001]

**Phase:** 2 · **Стиль:** full

### Контекст

Двостороння синхронізація сесій з Google Calendar тренера:

- **Push:** при створенні/edit/cancel `session` → backend pushes Google Calendar event.
- **Pull:** webhook від Google при event update у Google's UI → backend оновлює `session` локально.

Лінкування через OAuth (Google Calendar API scope). Кожен trainer може connect один Google акаунт; обирає конкретний calendar для sync.

### User stories

- **US-INT-001** — *Як trainer, я хочу підключити свій Google Calendar, щоб FitConnect-сесії автоматично з'являлися там.*
- **US-INT-002** — *Як trainer, я хочу, щоб зміни сесій у FitConnect автоматично відображалися у Google Calendar.*
- **US-INT-003** — *Як trainer, я хочу, що якщо я перенесу подію у Google Calendar, FitConnect-сесія теж перенеслась.*
- **US-INT-004** — *Як trainer, я хочу обрати, в який саме Calendar (із кількох доступних) робити sync.*
- **US-INT-005** — *Як trainer, я хочу відключити інтеграцію будь-коли — Google events лишаються, але sync зупиняється.*

### User flow + UI mapping

**Connect:**

1. `SettingsScreen.tsx` → "Integrations" → "Connect Google Calendar" → `GET /v1/me/integrations/google/auth-url` → redirect URL.
2. User проходить Google OAuth у external WebView → Google redirects to callback URL з code.
3. App або web app deeplink'ом → `POST /v1/me/integrations/google/callback` з `{ code, state }`.
4. Backend:
   - Через Socialite (`Socialite::driver('google')->stateless()->user(...)`) exchange'ує code на tokens.
   - Зберігає `calendar_integrations` row: `user_id`, `provider: "google"`, `access_token enc`, `refresh_token enc`, `expires_at`, `provider_email`, `last_synced_at: null`.
   - Pulls list of calendars → frontend показує picker.
5. User обирає calendar → `PATCH /v1/me/integrations/google` з `{ calendar_id }`.
6. Backend: `calendar_integrations.calendar_id = X`, `webhook_subscription = ... (Google watch)`.
7. **Initial sync:** enqueues `InitialGoogleCalendarSyncJob` — pushes existing future FitConnect sessions у Google calendar.

**Push sync:**

8. На `SessionCreated` / `SessionUpdated` / `SessionCanceled` event → listener `SyncSessionToGoogleCalendarListener` enqueues `PushSessionToGoogleCalendarJob`.
9. Job: builds Google Calendar event (`summary` = title, `start/end`, `attendees`, `description` зі URL до session), створює/оновлює/видаляє через Google Calendar API.
10. Зберігає mapping `session.google_event_id`.

**Pull sync:**

11. Google sends webhook на `POST /v1/webhooks/google-calendar` зі channel ID + resource ID.
12. Backend верифікує webhook signature, знаходить `calendar_integrations` за webhook channel_id.
13. Enqueues `PullGoogleCalendarChangesJob` з sync_token.
14. Job: викликає Google Calendar API events.list з sync_token → отримує delta → apply'ить changes на local sessions (через `google_event_id` mapping).

**Disconnect:**

15. User → "Disconnect" → `DELETE /v1/me/integrations/google`.
16. Backend: revokes webhook subscription, deletes `calendar_integrations` row. Sessions intact (з `google_event_id`, але без active sync).

### Acceptance criteria

- **AC-1** — *Given* trainer без активної інтеграції *When* `POST /v1/me/integrations/google/callback` з валідним code *Then* `201`, `calendar_integrations` row created, response містить list calendars для picker.
- **AC-2** — *Given* invalid code *Then* `401 oauth_invalid`.
- **AC-3** — *Given* connected user *When* `PATCH /v1/me/integrations/google` з `{ calendar_id }` *Then* `200`, calendar_id збережено, webhook channel subscribed.
- **AC-4** — *Given* trainer створив session *When* `SessionCreated` event fires *Then* протягом 30с appearance у Google Calendar (через job в queue `default`).
- **AC-5** — *Given* trainer редагує session (start_at, title) *When* listener fires *Then* Google event також оновлюється.
- **AC-6** — *Given* trainer cancel'ив session *When* listener fires *Then* Google event also marked cancelled (або deleted, configurable).
- **AC-7** — *Given* trainer змінив event у Google Calendar UI *When* webhook fires *Then* протягом 30с FitConnect session оновлюється (`SessionUpdated` event broadcast).
- **AC-8** — *Given* `DELETE /v1/me/integrations/google` *Then* `200`, integration видалено, webhook unsubscribed. Sessions залишаються intact.
- **AC-9** — *Given* token expired (Google refresh failed) *Then* user отримує in-app notification "Reconnect Google Calendar", sync paused; `calendar_integrations.last_error` set.
- **AC-10** — *Given* concurrent push and pull (race) *Then* using `updated_at` as conflict source: latest wins.

### Permissions

| Роль | Connect | Choose calendar | Trigger sync | Disconnect |
|---|---|---|---|---|
| Trainer | ✅ own | ✅ | ✅ (implicit via session events) | ✅ |
| Client | ❌ (post-MVP — client own calendar) | — | — | — |
| Admin | — | — | — | ✅ (audit) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Google API rate limit (1M/day per project) — масові updates | Job throttling per integration (max 1 push/2 sec); queue retry на 429 errors |
| EC-2 | User revoked permissions through Google account | Detected via API 401; integration paused, push notification "Reconnect" |
| EC-3 | Sync conflict: Google event edited, FitConnect session edited near-simultaneously | Last write wins (latest updated_at у comparison); user info notice "Conflict resolved" |
| EC-4 | Webhook delivery fails (network) | Google retries з exponential backoff; backend idempotent (по `event_id`) |
| EC-5 | User deletes Google calendar entirely | Webhook fires; backend deactivates integration (calendar_id NULL), notifies user |
| EC-6 | Event у Google створено, не пов'язано з FitConnect (manual event) | Backend ignores (no matching `google_event_id`); не створює нових sessions з Google events (one-way creation from FitConnect) |
| EC-7 | Token rotation (Google requires periodic refresh) | `RefreshGoogleTokenJob` (scheduled hourly) updates `access_token`; failure → user notification |

### Зв'язок з технічною спекою

- API: [`../integrations.md`](../integrations.md) § `GET /me/integrations/google/auth-url`, `POST /me/integrations/google/callback`, `PATCH /me/integrations/google`, `DELETE /me/integrations/google`, `POST /webhooks/google-calendar`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `calendar_integrations` (з `user_id`, `provider`, `provider_user_email`, `access_token enc`, `refresh_token enc`, `expires_at`, `calendar_id`, `sync_token`, `webhook_channel_id`, `webhook_resource_id`, `webhook_expires_at`, `last_synced_at`, `last_error text`); `sessions.google_event_id` (FK indirect)
- Events: `IntegrationConnected`, `IntegrationDisconnected`, `SyncSucceeded`, `SyncFailed`
- Jobs: `InitialGoogleCalendarSyncJob` (queue `default`), `PushSessionToGoogleCalendarJob`, `PullGoogleCalendarChangesJob`, `RefreshGoogleTokenJob` (scheduled hourly), `RenewWebhookSubscriptionJob` (scheduled daily — Google webhooks expire after 7 днів)
- Listeners: `SyncSessionToGoogleCalendarListener` (queued, on `SessionCreated`/`Updated`/`Canceled`)
- Config: `config/services.php` для Google credentials; scope `https://www.googleapis.com/auth/calendar.events`

---

## 2. Apple Calendar ICS feed [INT-002]

**Phase:** 2 · **Стиль:** full

### Контекст

Apple **не має write API** для Calendar (тільки read через CalDAV або local). У MVP — підписний ICS feed:

- Backend генерує `.ics` файл per trainer.
- User додає URL (`https://api.fitconnect.app/v1/calendars/{trainer_id}/{secret_token}.ics`) у Apple Calendar як subscribed calendar.
- Apple's Calendar app pulls feed every 5min-1h (Apple controls frequency).
- One-way: FitConnect → Apple. Зміни в Apple Calendar НЕ синкаються назад.

### User stories

- **US-INT-006** — *Як trainer, я хочу мати subscribable URL для Apple Calendar, щоб мої сесії автоматично з'являлися там.*
- **US-INT-007** — *Як trainer, я хочу інвалідувати ICS URL, якщо випадково поділився ним (rotate token).*

### User flow + UI mapping

1. `Settings → Integrations → Apple Calendar` → "Get Subscribe URL".
2. `POST /v1/me/integrations/apple/enable` (якщо ще не enabled).
3. Backend генерує secret token (32 bytes hex), створює `calendar_integrations` row для `provider: "apple"`.
4. Response: `{ url: "https://api.fitconnect.app/v1/calendars/123/ABC...DEF.ics" }`.
5. UI показує URL з copy button + інструкція "Add to Apple Calendar".
6. User на iOS Calendar → "+ Add Account" → "Other" → "Add Subscribed Calendar" → paste URL.
7. iOS pulls ICS.

**ICS endpoint:**

8. `GET /v1/calendars/{trainer_id}/{secret_token}.ics` (public, без auth але з secret token validation).
9. Backend:
   - Знаходить `calendar_integrations` за `(user_id = trainer_id, provider = "apple", feed_token = secret_token, deleted_at IS NULL)`.
   - Якщо немає → `404` (генерує генеричну ICS з error message? Або просто `404`).
   - Генерує ICS (RFC 5545) з усіма future sessions цього трендера в межах +/- 6 місяців.
   - Content-Type: `text/calendar; charset=utf-8`.
   - Cache 5хв (через `Cache-Control: max-age=300`).

**Rotate:**

10. User → "Rotate URL" → `POST /v1/me/integrations/apple/rotate` → новий token; старий URL стає invalid.

**Disable:**

11. User → "Disable" → `DELETE /v1/me/integrations/apple` → soft delete `calendar_integrations`.

### Acceptance criteria

- **AC-1** — *Given* trainer без integration *When* `POST /v1/me/integrations/apple/enable` *Then* `201` з `{ url, feed_token (масковано — лише останні 4 chars) }`.
- **AC-2** — *Given* trainer (інший) має 5 future sessions *When* `GET /v1/calendars/{their_id}/{token}.ics` *Then* `200` з Content-Type `text/calendar`; ICS містить 5 VEVENT.
- **AC-3** — *Given* invalid token *Then* `404` (no body — захист від enumeration).
- **AC-4** — *Given* disabled integration *Then* `404`.
- **AC-5** — *Given* rotated token *When* старий URL використовується *Then* `404`.
- **AC-6** — *Given* ICS response *Then* містить:
  - `BEGIN:VCALENDAR`, `VERSION:2.0`, `PRODID:-//FitConnect//ScheduleFeed//EN`
  - Per session: `BEGIN:VEVENT`, `UID:session-{id}@fitconnect.app`, `DTSTAMP`, `DTSTART`, `DTEND`, `SUMMARY` (title), `DESCRIPTION` (з URL до session), `STATUS` (CONFIRMED/CANCELLED)
  - `END:VEVENT`, `END:VCALENDAR`
- **AC-7** — *Given* canceled session *Then* VEVENT з `STATUS:CANCELLED`, `METHOD:CANCEL`.
- **AC-8** — *Given* ICS request rate > 60/min per token *Then* `429`.
- **AC-9** — *Given* trainer змінив timezone *When* ICS regenerated *Then* DTSTART/DTEND adjusted (TZID або UTC depending on iOS compatibility).

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ власна integration |
| Public (with token) | ✅ read-only ICS |
| Без token | ❌ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Feed token leaked у спам / public — масові requests | Per-IP rate limit на ICS endpoint (60/min); per-token cumulative limit; on detection trainer notification |
| EC-2 | iOS Calendar caches occurrence (наступна sync — через години) — recently canceled session не зникає | Use `METHOD:CANCEL` для canceled events; iOS зазвичай respect'ить |
| EC-3 | Recurring sessions у Apple — backend генерує VEVENT з RRULE? | MVP — materialized (один VEVENT per session), без RRULE — простіше і consistent з internal model |
| EC-4 | Дуже багато sessions (1000+) — ICS file > 1MB | Limit window ± 6 місяців; додатково можна compression (gzip); response truncated to 500 events з warning у DESCRIPTION |
| EC-5 | Session edited після iOS pulled — outdated state на phone | Apple pulls every ~15 min — eventually consistent. Користувач знає це обмеження |
| EC-6 | Trainer rotated token у момент iOS sync | iOS просто не оновлюється — на наступному pull виявляє 404; user додає URL знову. Warning на rotate UI |

### Зв'язок з технічною спекою

- API: [`../integrations.md`](../integrations.md) § `POST /me/integrations/apple/enable`, `POST /me/integrations/apple/rotate`, `DELETE /me/integrations/apple`, `GET /calendars/{user_id}/{token}.ics` (public route)
- DB: same `calendar_integrations` table; `provider: "apple"`, `feed_token` (UNIQUE per trainer)
- Service: `ICSGenerator` (RFC 5545 builder)
- Caching: ICS response cached в Redis 5хв per `(trainer_id, version)` (invalidate on session change)
- Route: окремий public route без auth middleware

---

## 3. OAuth providers connect/disconnect [INT-003]

**Phase:** 2 · **Стиль:** compact

### Контекст

Меню для управління OAuth-провайдерами як login methods (з [`AUTH-002`](auth.md)) і integration (Google Calendar з INT-001). Show status of each, button connect/disconnect.

### User stories

- **US-INT-008** — *Як user, я хочу бачити, які OAuth providers (Google, Apple, Facebook) connected до мого акаунта.*
- **US-INT-009** — *Як user, я хочу connect новий provider або disconnect існуючий.*

### Acceptance criteria

- **AC-1** — *Given* user *When* `GET /v1/me/integrations` *Then* `200` з `{ login: [{ provider, connected: bool, email_at_provider }], calendar: [{ provider, connected, ... }] }`.
- **AC-2** — *Given* `POST /v1/me/oauth/{provider}/connect` з valid id_token (як у AUTH-002) *Then* `200`, додається до `oauth_identities`.
- **AC-3** — *Given* `DELETE /v1/me/oauth/{provider}` (як у AUTH-002 AC-6/AC-7) — same rules.
- **AC-4** — *Given* user намагається disconnect last login method (нет password + лише цей OAuth) *Then* `409 last_login_method`.

### Permissions

| Роль | Доступ |
|---|---|
| Authenticated | ✅ свої тільки |
| Admin | ✅ (audit) |

### Edge cases

- **EC-1** — Provider deprecated (Facebook ban) — show у list з status `disabled`; disconnect possible, connect — no.
- **EC-2** — Email at provider змінився (rare) — frontend може показати diff; backend update'ить `provider_user_email` field на next login.

### Технічна спека

- API: [`../integrations.md`](../integrations.md) § `GET /me/integrations`, `POST /me/oauth/{provider}/connect`, `DELETE /me/oauth/{provider}` (alias на AUTH-002 endpoints)
- DB: `oauth_identities` (з AUTH-002), `calendar_integrations` (з INT-001)
- Service: `IntegrationsAggregator` (зliepує дані з двох таблиць)

---

## Залежності модуля Integrations

- **Залежить від:** Auth (для OAuth), Sessions (data source для Calendar), Users (timezone, email).
- **Залежать від нього:** Sessions (через listeners що push'ять до Google), Notifications (для повідомлень про failures інтеграції).
