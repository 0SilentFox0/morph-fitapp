# Features — Clients (CRM)

**Модуль:** Clients (CRM) · **Phase:** 1 · **Файлів-сусідів:** `clients.md` (TBD) (technical)

3 фічі. Тренерський "roster" — центральна CRM-сутність системи. Один `clients` row може існувати як **standalone** (тільки запис тренера, без user account) або **linked** (з `user_id` до акаунта клієнта в системі).

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | CLT-001 | Client roster management | full |
| 2 | CLT-002 | Client invitation flow | full |
| 3 | CLT-003 | Notes & tags | compact |

---

## 1. Client roster management [CLT-001]

**Phase:** 1 · **Стиль:** full

### Контекст

Базові CRUD-операції з roster'ом клієнтів тренера. Дозволяє тренеру вести список незалежно від того, чи мають клієнти акаунт у додатку. Підтримує статуси (`active`, `archived`), типи (`personal`, `group`, `online`), search по name/email, фільтри.

### User stories

- **US-CLT-001** — *Як trainer, я хочу бачити список всіх своїх клієнтів з можливістю search і фільтрації по типу/статусу.*
- **US-CLT-002** — *Як trainer, я хочу додати нового клієнта в roster, ввівши лише name (без email) — для офлайн-клієнтів, які не користуються додатком.*
- **US-CLT-003** — *Як trainer, я хочу додати клієнта з email, щоб пізніше надіслати запрошення (див. CLT-002).*
- **US-CLT-004** — *Як trainer, я хочу редагувати дані клієнта (name, email, phone, type).*
- **US-CLT-005** — *Як trainer, я хочу архівувати клієнта, щоб приховати з активного списку, але зберегти історію (сесії, транзакції).*
- **US-CLT-006** — *Як trainer, я хочу видалити клієнта остаточно (тільки якщо немає активних сесій або пакетів).*

### User flow + UI mapping

1. **List view:** `ClientsListScreen.tsx` → `GET /v1/clients?q=&status=&type=&cursor=`. Карточки клієнтів з аватаром, name, type tag, "next session" (lookahead запит у бекенді).
2. **Add client:** `+` button → `AddClientModal` → форма (name required, email optional, phone optional, type, notes optional).
3. Submit → `POST /v1/clients`. Backend:
   - Валідує (`name` 1-255, `email` valid format if present, `type` enum).
   - Якщо `email` дано і існує `users` з таким email → `409 email_belongs_to_user`, frontend пропонує надіслати invitation замість create.
   - Створює `clients` row з `trainer_id = auth()->id()`, `status = "active"`.
   - Дисптчить `ClientAdded` event.
   - Респонс: `201` з `{ client }`.
4. **Edit:** `ClientProfileScreen.tsx` → "Edit" → `PATCH /v1/clients/{id}` з diff polями.
5. **Archive:** confirmation modal → `POST /v1/clients/{id}/archive`. Backend: `status = "archived"`, `archived_at = now()`. Не видаляє нічого; client зникає з default list (фільтр `status=active`).
6. **Unarchive:** `POST /v1/clients/{id}/unarchive`.
7. **Delete:** confirmation з warning + checkbox "I understand" → `DELETE /v1/clients/{id}`. Backend:
   - Перевіряє чи немає активних сесій (`status IN ("planned", "in_progress")`) або активних пакетів — якщо є → `409 has_active_dependencies` з list.
   - Видаляє `clients` row + cascade на `client_programs`, `client_packages.archived_at = now()`, `notes`, `tags`.
   - Якщо linked (`user_id`) — НЕ видаляє акаунт user'а; лише видаляє link.

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `POST /v1/clients` з `{ name: "Іван", type: "personal" }` *Then* `201` з `client`, `clients.trainer_id = auth()`, `status = "active"`.
- **AC-2** — *Given* email вже належить існуючому user *When* `POST /v1/clients` з тим email *Then* `409 email_belongs_to_user` з полем `{ existing_user_id }`. Frontend пропонує invite-flow.
- **AC-3** — *Given* email не належить нікому *When* `POST /v1/clients` з email *Then* `201`; `clients.email` set, `user_id` null. Tренер пізніше може надіслати invitation (див. CLT-002).
- **AC-4** — *Given* trainer T і client C тренера T *When* `PATCH /v1/clients/{C.id}` з `{ name: "New" }` *Then* `200`, name оновлено.
- **AC-5** — *Given* trainer T і client C інших тренерів *When* `PATCH /v1/clients/{C.id}` *Then* `404 not_found` (не розкриваємо існування).
- **AC-6** — *Given* trainer T і active client C *When* `POST /v1/clients/{C.id}/archive` *Then* `200`, `status = "archived"`, `archived_at = now()`.
- **AC-7** — *Given* archived client *When* `GET /v1/clients` (default filter `status=active`) *Then* client не з'являється в списку.
- **AC-8** — *Given* archived client *When* `GET /v1/clients?status=archived` *Then* з'являється.
- **AC-9** — *Given* client з activeсію `planned` сесією *When* `DELETE /v1/clients/{id}` *Then* `409 has_active_dependencies` з `{ blockers: { sessions: 1, packages: 2 } }`.
- **AC-10** — *Given* client без активних залежностей *When* `DELETE /v1/clients/{id}` *Then* `204`, row видалено, cascade застосовано.
- **AC-11** — *Given* trainer *When* `GET /v1/clients?q=Іва` *Then* список фільтрований ILIKE по `name`, `email`.
- **AC-12** — *Given* response *Then* кожен `client` має `next_session` (найближча планована сесія за datetime DESC) і `active_packages_count`.

### Permissions

| Роль | List own | List others | Create | Update | Archive | Delete |
|---|---|---|---|---|---|---|
| Trainer | ✅ | ❌ | ✅ свої | ✅ свої | ✅ свої | ✅ свої (з depend-check) |
| Client | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Admin | ✅ всіх | ✅ всіх | ✅ за trainer'а (audit) | ✅ (audit) | ✅ | ✅ (audit) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Trainer створює клієнта з email, який вже належить іншому тренеру | `409 email_taken_by_other_client` — frontend пояснює; може запропонувати створити без email |
| EC-2 | Linked client (з `user_id`) → trainer видалив акаунт клієнта (через AUTH-005) | `clients.user_id` SET NULL через FK; row залишається, але без link до user'а |
| EC-3 | Race: одночасний archive і delete | DB-level lock на `clients` row; виграє перший; другий получить `409` або `404` |
| EC-4 | Trainer хоче видалити клієнта з > 100 минулих completed сесій | Дозволено (вони not active); сесії залишаються (FK SET NULL), client_id у session_participants стає NULL |
| EC-5 | Search query з special characters (`%`, `_`) | ILIKE escape automatic у Laravel query builder |
| EC-6 | Trainer створює дублікат клієнта з тим же name (без email) | Допустимо: name не унікальний. Frontend може показати warning "Already exists?" з suggestion |
| EC-7 | Cursor pagination з фільтрами — кеш стейлий | Cursor opaque (encodes filters); stale cursor → `400 invalid_cursor` |
| EC-8 | Client з активним пакетом + delete request | `409` з `blockers.packages`; trainer мусить спочатку archive пакети |

### Зв'язок з технічною спекою

- API: `clients.md` (TBD) § `GET /clients`, `POST /clients`, `GET /clients/{id}`, `PATCH /clients/{id}`, `DELETE /clients/{id}`, `POST /clients/{id}/archive`, `POST /clients/{id}/unarchive`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `clients` (з `trainer_id`, `name`, `email`, `phone`, `type enum`, `status enum`, `user_id` FK nullable, `notes text`, `tags jsonb`, `archived_at`, `created_at`)
- Events: `ClientAdded`, `ClientUpdated`, `ClientArchived`, `ClientUnarchived`, `ClientDeleted`
- Index: `(trainer_id, status, name)` для list+search

---

## 2. Client invitation flow [CLT-002]

**Phase:** 1 · **Стиль:** full

### Контекст

Дозволяє тренеру **запросити** клієнта в додаток — через email з deep link або через invitation code (вводиться при реєстрації/онбордингу). Після акцепту invitation `clients.user_id` лінкується до registered user; клієнт стає повноцінним учасником.

Підтримує два механіки:
1. **Email invitation** — backend генерує `code`, відправляє email; клієнт тапає посилання → deep link → registration → автоматичний accept.
2. **Manual code entry** — клієнт може ввести `code` у профілі (post-MVP) або під час onboarding (див. ONB-002 `invitation` step).

### User stories

- **US-CLT-007** — *Як trainer, я хочу надіслати email-запрошення клієнту, щоб він зареєструвався і з'явився в моєму додатку.*
- **US-CLT-008** — *Як trainer, я хочу побачити список pending invitations і скасувати, якщо клієнт не зареєструвався.*
- **US-CLT-009** — *Як client, я хочу прийняти invitation під час реєстрації або введенням коду в онбордингу.*
- **US-CLT-010** — *Як trainer, я хочу повторно надіслати invitation, якщо клієнт втратив лист (resend).*

### User flow + UI mapping

1. **Invite:** `ClientProfileScreen.tsx` → "Invite" button (visible тільки якщо `user_id IS NULL`) → `POST /v1/clients/{id}/invite`.
2. Backend:
   - Перевіряє: `clients.email` not null (інакше `422 email_required`).
   - Перевіряє: немає вже-active invitation для цього `client_id` (`expires_at > now() AND accepted_at IS NULL` AND `revoked_at IS NULL`).
   - Якщо є — `409 already_invited` з `{ existing_invitation_id, expires_at }`.
   - Генерує `code` (32 random bytes, base32-encoded → URL-friendly).
   - Створює `client_invitations` row: `code`, `client_id`, `trainer_id`, `email`, `expires_at = now() + 14d`.
   - Dispatch `SendClientInvitationJob` (queue `critical`) → email з deep link `https://app.fitconnect.app/invite/{code}`.
   - Респонс: `201` з `{ invitation }`.
3. **Client receives email** → тап → deep link відкриває додаток (або web fallback).
4. Якщо app installed & user НЕ logged in: показує LoginScreen з prefilled email + banner "You've been invited by [Trainer Name]".
5. Після login/register → клієнт автоматично проходить onboarding (ONB-002), де `invitation` step pre-filled з code.
6. **Manual accept:** `POST /v1/invitations/{code}/accept` (без auth → потрібний `email` + `password` або auth-after-registration).
7. Backend:
   - Знаходить invitation → перевіряє `expires_at > now()`, `accepted_at IS NULL`, `revoked_at IS NULL`.
   - Якщо expired/revoked/accepted → `410 invitation_invalid`.
   - Перевіряє, що current user (або щойно створений) має email = invitation.email (захист від кражі invitation).
   - Якщо емейли не збігаються — `403 invitation_email_mismatch`.
   - Атомарно:
     - `client_invitations.accepted_at = now()`.
     - `clients.user_id = current_user.id`.
   - Dispatch `InvitationAccepted` event.
   - Респонс: `200` з `{ client, trainer }`.
8. **Revoke:** `DELETE /v1/invitations/{id}` тренером → `revoked_at = now()`.
9. **Resend:** `POST /v1/invitations/{id}/resend` → новий email; rate limit 1/15хв per invitation.

### Acceptance criteria

- **AC-1** — *Given* trainer T і client C тренера T з `email` set, без `user_id`, без active invitation *When* `POST /v1/clients/{C.id}/invite` *Then* `201`, `client_invitations` row created з `expires_at = now() + 14d`, email job enqueued.
- **AC-2** — *Given* client без email *When* `POST /v1/clients/{id}/invite` *Then* `422 email_required` з підказкою додати email.
- **AC-3** — *Given* існує active invitation *When* `POST /v1/clients/{id}/invite` *Then* `409 already_invited`.
- **AC-4** — *Given* invitation з валідним code *When* `POST /v1/invitations/{code}/accept` (auth as user з matching email) *Then* `200`, `clients.user_id = user.id`, `accepted_at = now()`.
- **AC-5** — *Given* expired invitation *When* `POST /v1/invitations/{code}/accept` *Then* `410 invitation_invalid` з reason `expired`.
- **AC-6** — *Given* invitation для email A, auth as user з email B *When* accept *Then* `403 invitation_email_mismatch`.
- **AC-7** — *Given* trainer T і invitation його клієнта *When* `DELETE /v1/invitations/{id}` *Then* `200`, `revoked_at = now()`; подальший accept → `410`.
- **AC-8** — *Given* resend rate limit (1/15хв) *When* повторний `POST .../resend` *Then* `429 rate_limited`.
- **AC-9** — *Given* trainer T *When* `GET /v1/invitations?status=pending` *Then* `200` з list pending invitations T.

### Permissions

| Роль | Create invite | Cancel/revoke | Resend | Accept |
|---|---|---|---|---|
| Trainer | ✅ для свого client'а з email | ✅ свої | ✅ свої | ❌ |
| Client (target) | ❌ | ❌ | ❌ | ✅ з matching email |
| Admin | ✅ (audit) | ✅ (audit) | ✅ | ✅ (audit) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Client прийняв invitation, потім інший trainer запрошує — той самий user, але інший client row | Допустимо: один user може бути client у багатьох trainer'ів через окремі `clients` rows |
| EC-2 | Invitation email був отримано на інший device, де у клієнта вже є акаунт під іншим email | Frontend під час accept перевіряє match; якщо ні — пропонує switch account |
| EC-3 | Trainer видалив client row, поки invitation pending | FK on delete → invitation row deleted (CASCADE); accept після цього — `410` |
| EC-4 | Email доставлено в spam, клієнт не помічає 14 днів | Expiry → auto revoke; trainer бачить `expired` у списку, може resend (creates new invitation) |
| EC-5 | Race: client одночасно accept'ить invitation і trainer revoke'ить | DB-level lock на `client_invitations`; виграє той, хто перший update'ить (SELECT FOR UPDATE) |
| EC-6 | Invitation email подвійно надіслано (network retry) | Idempotency через UNIQUE на `(client_id, expires_at)` — race-window мінімальний |
| EC-7 | Client отримав 5 invitation'ів від різних trainer'ів | Кожен — окремий invitation. UI показує bell з count. Прийом одного не блокує інші |

### Зв'язок з технічною спекою

- API: `clients.md` (TBD) § `POST /clients/{id}/invite`, `GET /invitations`, `DELETE /invitations/{id}`, `POST /invitations/{id}/resend`, `POST /invitations/{code}/accept`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `client_invitations` (з `code` UNIQUE, `client_id` FK CASCADE, `trainer_id`, `email`, `expires_at`, `accepted_at`, `revoked_at`, `last_sent_at`)
- Events: `ClientInvited`, `InvitationAccepted`, `InvitationRevoked`, `InvitationResent`
- Jobs: `SendClientInvitationJob` (queue `critical`), `RevokeExpiredInvitationsJob` (scheduled daily 02:00)
- Deep link: схема `app.fitconnect.app/invite/{code}` має бути зареєстрована в `app.json` (Expo)

---

## 3. Notes & tags [CLT-003]

**Phase:** 1 · **Стиль:** compact

### Контекст

Тренерські **приватні нотатки** про клієнта (markdown text — улюблені вправи, mood, спеціальні потреби) + **tags** (string array) для категоризації / фільтрації roster'а. Клієнт нотатки **не бачить**; tags теж приватні.

### User stories

- **US-CLT-011** — *Як trainer, я хочу зберігати приватні нотатки про клієнта.*
- **US-CLT-012** — *Як trainer, я хочу позначати клієнтів тегами (наприклад "VIP", "Newbie", "ProSeries") і фільтрувати list.*

### Acceptance criteria

- **AC-1** — *Given* trainer і свій client *When* `PATCH /v1/clients/{id}` з `{ notes: "Likes squats" }` *Then* `200`, notes оновлено.
- **AC-2** — *Given* notes length > 10000 chars *Then* `422 notes_too_long`.
- **AC-3** — *Given* tags array з 21+ елементів *Then* `422 too_many_tags`.
- **AC-4** — *Given* trainer *When* `GET /v1/clients?tags=VIP,Newbie` *Then* response містить клієнтів, що мають хоч один з tag'ів (OR-filter).
- **AC-5** — *Given* client API *When* `GET /v1/me` або `GET /v1/users/{trainerId}` *Then* response **НЕ містить** `notes` ані `tags` його тренера (приватність).

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ read/write для свого client |
| Client | ❌ (повністю приховано) |
| Admin | ✅ read (audit) |

### Edge cases

- **EC-1** — Trainer передає `tags = []` → tags обнулюються.
- **EC-2** — Tag містить spaces / unicode → дозволено; стандартизуємо trim().
- **EC-3** — Duplicates у tags → backend dedupes (case-insensitive).

### Технічна спека

- API: `clients.md` (TBD) § `PATCH /clients/{id}` (з полями `notes`, `tags`), `GET /clients?tags=tag1,tag2`
- DB: `clients.notes text`, `clients.tags jsonb` (string array), GIN index на `tags`
- Validation: `notes` max 10000, `tags` max 20 elements, kожен max 32 chars

---

## Залежності модуля Clients

- **Залежить від:** Auth (auth()->user() trainer), Users (linked user_id), Notifications (для invitation emails).
- **Залежать від нього:** Sessions (participant), Programs (assignment), Packages (assignment), Transactions, Workout Tracking, Progress.
