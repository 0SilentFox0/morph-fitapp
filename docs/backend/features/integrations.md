# Features — External Integrations

**Модуль:** External Integrations · **Phase:** 2 · **Файлів-сусідів:** [`../integrations.md`](../integrations.md) (technical)

3 фічі.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | INT-001 | Google Calendar bi-directional sync | full |
| 2 | INT-002 | Apple Calendar ICS feed | full |
| 3 | INT-003 | OAuth providers connect/disconnect | compact |

> **Skeleton.** Детальний контент — на Phase 2 checkpoint.

---

## 1. Google Calendar bi-directional sync [INT-001]
**Full · Skeleton.** OAuth до Google → коли trainer створює FitConnect session → автоматично push до Google Calendar. Коли calendar event update'ний у Google → webhook → update locally (best-effort, конфлікти resolved за updated_at).

- API: `POST /me/integrations/google/connect`, `DELETE /me/integrations/google`, `POST /webhooks/google-calendar`
- DB: `calendar_integrations` (з `user_id`, `provider`, `access_token enc`, `refresh_token enc`, `calendar_id`, `sync_token`, `last_synced_at`)
- Jobs: `SyncSessionToGoogleCalendarJob`, `IncrementalGoogleCalendarPullJob` (every 15 min)
- Events: `SessionCreated`, `SessionUpdated`, `SessionCanceled` → listener pushes to Google

## 2. Apple Calendar ICS feed [INT-002]
**Full · Skeleton.** Apple не має write API → надаємо **read-only ICS feed** per trainer з token-based URL: `https://api.fitconnect.app/v1/calendars/{trainer_id}/{secret_token}.ics`. Trainer додає URL у Apple Calendar → автоматично оновлюється кожні 15-60 хв (Apple's pull frequency).

- API: `GET /calendars/{trainer_id}/{token}.ics` (public, без auth, але з secret token); `POST /me/integrations/apple/rotate-token`
- DB: `calendar_integrations` з `feed_token` (rotatable)
- Content-Type: `text/calendar; charset=utf-8`; RFC 5545.

## 3. OAuth providers connect/disconnect [INT-003]
**Compact · Skeleton.** UI для management всіх OAuth providers (Google/Apple/Facebook для login + Google для Calendar). Див. також [`auth.md`](auth.md) AUTH-002.

- API: `GET /me/integrations`, `POST /me/integrations/{provider}/connect`, `DELETE /me/integrations/{provider}`
