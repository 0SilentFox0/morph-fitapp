# Features — Chat & Messaging

**Модуль:** Chat · **Phase:** 2 · **Файлів-сусідів:** `chat.md` (TBD) (technical)

6 фіч. Real-time чат тренер↔клієнт через Laravel Reverb broadcasting. Підтримує текст, медіа (фото/відео/документи), read receipts, typing indicators, push до offline учасників, full-text search, soft delete.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | CHT-001 | Conversation management | compact |
| 2 | CHT-002 | Text messaging | full |
| 3 | CHT-003 | Media messaging | full |
| 4 | CHT-004 | Read receipts & typing indicators | full |
| 5 | CHT-005 | Chat search | compact |
| 6 | CHT-006 | Push notifications for chat | compact |

---

## 1. Conversation management [CHT-001]

**Phase:** 2 · **Стиль:** compact

### Контекст

Conversation — це канал зв'язку між двома учасниками (один-to-один: trainer↔client). У MVP кожна пара trainer-client має максимум одну conversation. Створюється implicit (при першому message) або explicit (через UI button). Soft-delete видаляє conversation з UI лише для current user — інша сторона ще бачить.

### User stories

- **US-CHT-001** — *Як user, я хочу бачити список своїх чатів з last message preview і unread counter.*
- **US-CHT-002** — *Як trainer, я хочу почати чат з конкретним клієнтом одним тапом.*
- **US-CHT-003** — *Як user, я хочу прибрати чат зі свого списку без видалення його у іншого.*

### Acceptance criteria

- **AC-1** — *Given* user *When* `GET /v1/conversations?cursor=&limit=20` *Then* `200` з cursor-paginated list, сортовано DESC по `last_message_at`; per-conversation `unread_count`, `last_message`, `participants`.
- **AC-2** — *Given* trainer T і його client C (linked з `user_id`) *When* `POST /v1/conversations` з `{ participant_user_id: C.user_id }` *Then* `200` або `201`: якщо вже існує — повертає існуючу (idempotent), якщо ні — створює нову.
- **AC-3** — *Given* sproba створити з не-related user'ом (не свій client / не свій trainer) *Then* `403 not_authorized`.
- **AC-4** — *Given* user *When* `DELETE /v1/conversations/{id}` *Then* `200`; `conversation_participants.deleted_at = now()` лише для цього user'а; інший учасник продовжує бачити.
- **AC-5** — *Given* user раніше soft-deleted conversation *When* отримує нове повідомлення *Then* `deleted_at` reset → conversation повертається в список.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ зі своїми clients (linked) |
| Client | ✅ зі своїми trainers |
| Stranger | ❌ |
| Admin | ✅ (audit) |

### Edge cases

- **EC-1** — Client linked до 2 тренерів — окремі conversations per pair.
- **EC-2** — Trainer видалив client (CLT-001 delete) → conversation cascade'ом теж видаляється; messages history — теж (це частина client deletion cascade).
- **EC-3** — Конкурентне створення (race з двома message'ами одночасно) → UNIQUE на pair (user_id ASC, user_id DESC) → один conversation row.

### Технічна спека

- API: `chat.md` (TBD) § `GET /conversations`, `POST /conversations`, `GET /conversations/{id}`, `DELETE /conversations/{id}`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `conversations` (з `id`, `created_at`, `last_message_at`); `conversation_participants` (з `conversation_id`, `user_id`, `deleted_at`, `last_read_message_id`)
- UNIQUE constraint: партіція "canonical pair" — `(LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))` через generated column або service-level check
- Events: `ConversationCreated`, `ConversationDeleted`

---

## 2. Text messaging [CHT-002]

**Phase:** 2 · **Стиль:** full

### Контекст

Базовий send/receive text повідомлень. Real-time delivery через Reverb broadcasting (`MessageSent` event на `private-conversation.{id}`). Persistence у `messages` table. Cursor pagination для history. Передбачає offline storage (mobile pendinguue) + idempotency keys.

### User stories

- **US-CHT-004** — *Як user, я хочу надіслати текстове повідомлення іншому учаснику чату.*
- **US-CHT-005** — *Як user, я хочу одразу побачити повідомлення в чаті, що інша сторона надіслала (без refresh).*
- **US-CHT-006** — *Як user, я хочу гортати історію чату вгору (infinite scroll).*
- **US-CHT-007** — *Як user, я хочу, щоб моє повідомлення доставилося, навіть якщо я тимчасово офлайн (queue + retry).*

### User flow + UI mapping

1. **Send:** `ChatThreadScreen.tsx` → input "Type a message" → submit → `POST /v1/conversations/{id}/messages` з `Idempotency-Key` header, body `{ body: "Hello", client_message_id: UUID }`.
2. Backend:
   - Перевіряє auth user — учасник conversation (`conversation_participants.deleted_at IS NULL`).
   - Idempotency: якщо `Idempotency-Key` уже використовується в межах 24h — повертає той самий response.
   - Створює `messages` row з `conversation_id`, `sender_id`, `body`, `client_message_id`, `sent_at = now()`.
   - Оновлює `conversations.last_message_at`.
   - Reset `conversation_participants.deleted_at` для всіх учасників (re-appears у списку, AC-5 у CHT-001).
   - Dispatch `MessageSent` event → broadcast на `private-conversation.{id}`.
   - Респонс: `201` з `{ message }`.
3. **Receive (real-time):** клієнт subscribed на `private-conversation.{id}` → отримує `MessageSent` event payload → додає у local store + scroll to bottom.
4. **History:** `GET /v1/conversations/{id}/messages?cursor=&limit=50` — cursor-paginated, сортовано DESC по `sent_at`.
5. **Reconnect:** після reconnect клієнт викликає `GET /v1/conversations/{id}/messages?since=<last_seen_message_id>` — отримує усі messages після last seen.

### Acceptance criteria

- **AC-1** — *Given* user — учасник conversation *When* `POST /v1/conversations/{id}/messages` з `{ body: "Hello" }` і unique `Idempotency-Key` *Then* `201` з `{ message }`. `MessageSent` event broadcasts протягом 1с.
- **AC-2** — *Given* not-participant *When* same POST *Then* `403`.
- **AC-3** — *Given* body довший за 4000 chars *Then* `422 message_too_long`.
- **AC-4** — *Given* empty body *Then* `422 body_required`.
- **AC-5** — *Given* той самий `Idempotency-Key` повторно (network retry) *Then* той самий response (з тим самим `message.id`).
- **AC-6** — *Given* подвійний submit з різним `Idempotency-Key` *Then* два окремі messages.
- **AC-7** — *Given* інший учасник conversation з active WS subscription *When* message sent *Then* отримує WS event протягом 1с з payload `{ message }`.
- **AC-8** — *Given* інший учасник offline *Then* push надсилається (через [`CHT-006`](#6-push-notifications-for-chat-cht-006)).
- **AC-9** — *Given* `GET .../messages?cursor=&limit=50` *Then* `200` з list DESC по sent_at; cursor encodes last message id.
- **AC-10** — *Given* `GET .../messages?since=<message_id>` *Then* всі messages з `id > since.id` (для reconnect catchup).
- **AC-11** — *Given* sender видалив свій акаунт (AUTH-005 hard delete) *Then* messages залишаються; `sender_id` SET NULL, у UI sender відображається як "Deleted user".

### Permissions

| Роль | Send | Read history | Mark read | Delete |
|---|---|---|---|---|
| Participant | ✅ | ✅ | ✅ свої | ✅ власні (soft) |
| Non-participant | ❌ | ❌ | ❌ | ❌ |
| Admin | ✅ (audit) | ✅ | — | ✅ (audit) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Mobile втратив connection після POST | Resend з тим самим `Idempotency-Key` → отримує `201` з cached response, без duplicate |
| EC-2 | Дуже довге повідомлення (4000 chars limit) | Frontend може робити "Send as note" (post-MVP) або просто truncate |
| EC-3 | Sender soft-deleted conversation, потім надіслав message | `conversation_participants.deleted_at` reset для нього; conversation з'являється знов |
| EC-4 | Message з emoji / non-BMP unicode | DB collation `utf8mb4_unicode_ci` (PostgreSQL — UTF-8 за дефолтом); поддержка повна |
| EC-5 | Rate limit перевищено (60/min на WS message) | Per-user rate limit (через middleware); `429 too_many_requests` |
| EC-6 | Message edit (post-MVP) | MVP — не дозволено; PATCH відсутній. Soft delete можливий через DELETE endpoint |
| EC-7 | Sender видалив message — інший вже прочитав | Soft delete (`deleted_at` set); UI показує "Message deleted" placeholder |
| EC-8 | Реверб з'єднання було розірвано і user пропустив події | Reconnect → `GET /messages?since=` — gap filling |

### Зв'язок з технічною спекою

- API: `chat.md` (TBD) § `POST /conversations/{id}/messages`, `GET /conversations/{id}/messages?cursor=&since=`, `DELETE /messages/{id}`
- DB: `messages` (з `id`, `conversation_id` FK CASCADE, `sender_id` FK SET NULL, `body text`, `client_message_id UUID`, `sent_at`, `deleted_at`, `body_tsv tsvector` for search [CHT-005])
- UNIQUE: `(conversation_id, client_message_id)` — додатковий idempotency layer
- Index: `(conversation_id, sent_at DESC)`
- Events: `MessageSent` (broadcasts on `private-conversation.{id}`), `MessageDeleted`
- Listeners: `NotifyOnMessageSent` (push for offline participants)
- Real-time channel auth: у `routes/channels.php` — перевіряє `conversation_participants.user_id = auth()->id() AND deleted_at IS NULL`

---

## 3. Media messaging [CHT-003]

**Phase:** 2 · **Стиль:** full

### Контекст

Розширення CHT-002: повідомлення може містити media (фото/відео/документ). Upload — через [`FIL-001`](files.md) (purpose `chat_media`, private storage). Message має `media_file_ids[]` jsonb. Доступ до media — лише через signed URL для учасників conversation.

### User stories

- **US-CHT-008** — *Як user, я хочу надіслати фото у чат з тапу attach button.*
- **US-CHT-009** — *Як user, я хочу надіслати відео або документ (PDF, DOCX) у чат.*
- **US-CHT-010** — *Як user, я хочу побачити preview (thumbnail) для фото/відео у списку повідомлень.*
- **US-CHT-011** — *Як user, я хочу безпечно завантажити media, не показуючи його стороннім.*

### User flow + UI mapping

1. User тапає attach button → image/file picker (`expo-image-picker` / `expo-document-picker`).
2. Frontend викликає `POST /v1/files/upload-url` з `{ purpose: "chat_media", mime, size, original_name, context: { conversation_id } }` → отримує signed PUT URL.
3. Frontend PUT файл у S3 з progress callbacks.
4. Frontend `POST /v1/files/{file_id}/complete` → backend перевіряє існування + size + dispatch `FileReady` event.
5. Frontend `POST /v1/conversations/{id}/messages` з `{ body?, media_file_ids: [<file_id>] }` + `Idempotency-Key`.
6. Backend:
   - Як у CHT-002 + перевіряє: всі `media_file_ids` мають `purpose = chat_media`, `status = ready`, `owner_id = sender_id` АБО `context.conversation_id = current_conversation_id` (захист від використання чужих files).
   - Створює `messages` row з `media_file_ids jsonb`.
   - У broadcast payload включає signed URLs для media (TTL 1h — щоб клієнт встиг завантажити).
7. Receiver:
   - Отримує WS event з `media_file_ids` і pre-signed URLs.
   - Для зображень — eager-завантажує thumbnail (з `thumbnails` field).
   - Якщо URL expired — request `GET /v1/files/{id}/signed-url` (відновлення).

### Acceptance criteria

- **AC-1** — *Given* ready chat_media file власника-sender *When* `POST .../messages` з `{ media_file_ids: [<id>] }` *Then* `201`. Broadcast event містить `media: [{ file_id, mime, signed_url, thumbnails }]`.
- **AC-2** — *Given* file з status `pending` *Then* `422 file_not_ready`.
- **AC-3** — *Given* file з `purpose != chat_media` *Then* `422 wrong_purpose`.
- **AC-4** — *Given* file належить іншому user'у *Then* `403 forbidden_file`.
- **AC-5** — *Given* `media_file_ids` має > 10 elements *Then* `422 too_many_attachments` (limit 10 per message).
- **AC-6** — *Given* receiver запитує `GET /v1/files/{id}/signed-url` для media з conversation, де він учасник *Then* `200` з URL (TTL 15хв).
- **AC-7** — *Given* receiver запитує signed URL для media з чужого conversation *Then* `403`.
- **AC-8** — *Given* image media *Then* `thumbnails` має `{ "120": "...", "240": "..."}` URLs (thumbnails generated `FIL-001`).
- **AC-9** — *Given* video media *Then* `thumbnails` має один poster frame URL (extracted at 1s).

### Permissions

| Роль | Доступ |
|---|---|
| Participant | ✅ send/read media у своїх conversations |
| Stranger | ❌ |
| Admin | ✅ (audit) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Sender upload'нув file, але не attach до message (crash) | File cleanup через `FilesCleanupJob` (7 днів TTL для unreferenced) |
| EC-2 | File розміром 100MB на slow network | Upload progress UI; client retry на failure; idempotency через [`FIL-001`](files.md) |
| EC-3 | Receiver має slow network — thumbnail completed раніше за full image | Progressive load: thumbnail спочатку, потім full |
| EC-4 | Sender видалив повідомлення — media file orphan | `OrphanFileCleanupJob` детектує (file referenced from deleted message) — видаляє з S3 |
| EC-5 | Video file без preview thumbnail (failure ffmpeg) | UI fallback на generic video icon |
| EC-6 | Sender надіслав 10 фото у одне повідомлення | Допустимо (limit 10); UI gallery view |
| EC-7 | Receiver не має дозволу на signed URL (race з conversation delete) | `403`; UI показує "Message no longer available" |

### Зв'язок з технічною спекою

- API: `POST /v1/conversations/{id}/messages` з полем `media_file_ids[]`; `GET /v1/files/{id}/signed-url` (з [`FIL-001`](files.md))
- DB: `messages.media_file_ids jsonb` (array of media_files.id); `media_files.context jsonb` містить `{ conversation_id }` для ACL check
- Permissions check: `MediaFilePolicy::view` — учасник conversation OR власник OR admin
- Real-time: WS event `MessageSent` payload включає resolved media з signed URLs (1h TTL — match expected delivery window)

---

## 4. Read receipts & typing indicators [CHT-004]

**Phase:** 2 · **Стиль:** full

### Контекст

Дві окремі real-time UX-фічі:

**Read receipts:** кожен учасник tracks `conversation_participants.last_read_message_id`. UI показує "delivered" (сервер отримав), "delivered to other side" (broadcast'нуто на other client's WS), "read" (other side update'нув `last_read_message_id`).

**Typing indicators:** ephemeral state через WS broadcast без persistence; TTL 3s на UI-side.

### User stories

- **US-CHT-012** — *Як sender, я хочу бачити, чи моє повідомлення прочитано іншою стороною (indicator).*
- **US-CHT-013** — *Як user, я хочу мати unread counter у списку чатів (badge).*
- **US-CHT-014** — *Як user, я хочу бачити "TypingScreen typing..." коли інша сторона набирає повідомлення.*
- **US-CHT-015** — *Як user, я хочу, щоб typing indicator зникав автоматично через 3с без update.*

### User flow + UI mapping

**Read receipts:**

1. User відкриває `ChatThreadScreen.tsx` → frontend дізнається `last_visible_message_id` (через scroll position).
2. Frontend `POST /v1/conversations/{id}/mark-read` з `{ message_id }`.
3. Backend:
   - `conversation_participants.last_read_message_id = message_id`, `last_read_at = now()`.
   - Dispatch `MessageRead` event на `private-conversation.{id}`.
4. Sender's frontend отримує event → updates UI ("Read" indicator).

**Typing:**

1. User typing у input → frontend throttle (1с) → WS пише на `private-conversation.{id}` event `client-typing` (через Reverb).
2. Reverb broadcasts до інших учасників.
3. Receiver: показує indicator → set timeout 3s → clear.

### Acceptance criteria

- **AC-1** — *Given* user — учасник *When* `POST /v1/conversations/{id}/mark-read` з валідним `message_id` *Then* `200`; `conversation_participants.last_read_message_id` = max(current, new). `MessageRead` event broadcast'ить.
- **AC-2** — *Given* `message_id` що не існує у цій conversation *Then* `404`.
- **AC-3** — *Given* `message_id` старший за поточний `last_read_message_id` *Then* `200` (no-op; не понижуємо).
- **AC-4** — *Given* sender активний у conversation *When* receiver mark-read *Then* sender отримує WS event протягом 1с з `{ user_id, last_read_message_id, last_read_at }`.
- **AC-5** — *Given* sender дивиться на повідомлення, що receiver не читав *Then* UI показує "Delivered" indicator. Після receiver mark-read — "Read".
- **AC-6** — *Given* unread_count у `GET /conversations` *Then* count повідомлень де `id > my_last_read_message_id AND sender_id != me`.
- **AC-7** — *Given* user отримує message protected з offline *When* online повертається і `GET /conversations` *Then* unread_count точний.
- **AC-8** — *Given* user typing *When* fires `client-typing` event *Then* інші учасники отримують event з `user_id, typing: true`.
- **AC-9** — *Given* user перестав typing > 3s *When* frontend припиняє відправку (debounced) *Then* receiver UI сам clear'ить через timeout.

### Permissions

| Роль | Доступ |
|---|---|
| Participant | ✅ свій read state + WS-typing |
| Non-participant | ❌ |
| Admin | ✅ read (audit) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Користувач скролить дуже швидко через 100 повідомлень | Frontend throttle mark-read (1 виклик на 500ms або на scroll-stop) |
| EC-2 | Concurrent mark-read з 2 devices (mobile + web) | Backend max(current, new) — race safe |
| EC-3 | Typing event spam (frontend bug) | Server-side rate limit 5/sec/user/conversation; > → drop |
| EC-4 | User typing у одному чаті, переключився на інший | Frontend дотримує throttle; інший чат не отримує false typing |
| EC-5 | "Read" UI у sender застаріле (stale WS) | Reconnect → frontend pulls `GET /conversations/{id}` → field `last_read_by_other` оновлюється |
| EC-6 | Message без sender (deleted user) — як показати read? | UI: indicator показується для будь-якого учасника, незалежно sender alive чи ні |

### Зв'язок з технічною спекою

- API: `chat.md` (TBD) § `POST /conversations/{id}/mark-read`, WS channel client events (`client-typing`)
- DB: `conversation_participants.last_read_message_id`, `last_read_at`
- Events: `MessageRead` (broadcast), `client-typing` (whisper — no persistence)
- WS auth: `private-conversation.{id}` як у CHT-002
- Configuration `config/broadcasting.php` enable client events (whisper) для presence/typing

---

## 5. Chat search [CHT-005]

**Phase:** 2 · **Стиль:** compact

### Контекст

Full-text пошук у повідомленнях конкретного conversation (search в межах однієї conversation, не global cross-conversations у MVP — для simplicity).

### User stories

- **US-CHT-016** — *Як user, я хочу шукати слово в історії чату.*

### Acceptance criteria

- **AC-1** — *Given* user — учасник *When* `GET /v1/conversations/{id}/messages?q=squat&cursor=&limit=20` *Then* `200` з cursor-paginated matches; relevance-sorted (PostgreSQL `ts_rank`).
- **AC-2** — *Given* query < 2 chars *Then* `422 query_too_short`.
- **AC-3** — *Given* search підсвічує hits у frontend (response містить `body` як є — без HTML-стрижки; frontend сам highlight).
- **AC-4** — *Given* search rate limit 30/min/user *Then* `429` over.

### Permissions

| Роль | Доступ |
|---|---|
| Participant | ✅ свої conversations |
| Інші | ❌ |

### Edge cases

- **EC-1** — Special chars у query (e.g. `&`, `|`, `:`) — escape перед `plainto_tsquery` (Laravel built-in).
- **EC-2** — Великі чати з 100K+ повідомлень — index GIN на `body_tsv` забезпечує performance.
- **EC-3** — Soft-deleted messages не повертаються в search (`WHERE deleted_at IS NULL`).
- **EC-4** — Multilingual content (ru/uk/en) — використовувати `simple` text search config (без stemming) для уникнення мовних специфік; alternatively per-locale (post-MVP).

### Технічна спека

- API: `GET /v1/conversations/{id}/messages?q=&cursor=&limit=`
- DB: `messages.body_tsv tsvector` (auto-generated через trigger or generated column); GIN index
- Generated column: `body_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', body)) STORED`
- Search query: `WHERE body_tsv @@ plainto_tsquery('simple', :q) ORDER BY ts_rank(body_tsv, query) DESC, sent_at DESC`

---

## 6. Push notifications for chat [CHT-006]

**Phase:** 2 · **Стиль:** compact

### Контекст

Інтеграція з [`notifications.md`](notifications.md) → коли `MessageSent` event broadcast'нувся, listener `NotifyOnMessageSent` визначає чи інший учасник offline у conversation (через Reverb presence або general online state) — і enqueue'є push job для нього.

### User stories

- **US-CHT-017** — *Як user, я хочу отримувати push, якщо мені прислали повідомлення, а додаток закритий.*
- **US-CHT-018** — *Як user, я не хочу отримувати push, якщо я зараз дивлюся на цей самий чат (foreground suppression).*

### Acceptance criteria

- **AC-1** — *Given* `MessageSent` event *When* listener `NotifyOnMessageSent` runs *Then* для кожного recipient'а (інший учасник):
  - Якщо recipient subscribed на `presence-conversation.{id}` (онлайн в чаті) — НЕ створювати push.
  - Інакше — створити `Notification` row + `SendPushJob`.
- **AC-2** — *Given* recipient має `notification_preferences.chat = false` *Then* `Notification` row створюється (для in-app feed), push skip.
- **AC-3** — *Given* push payload *Then* містить `{ type: "chat_message", conversation_id, sender_name, body_preview (≤100 chars), notification_id }` — deep link до chat thread.
- **AC-4** — *Given* sender — group/spam (рідкісно) надсилає 50 повідомлень за хвилину *Then* per-recipient rate limit (50 push/година); зведення в bulk "5 new messages from X" — post-MVP.

### Permissions

— Internal listener.

### Edge cases

- **EC-1** — Recipient у foreground у іншому conversation — push приходить (бо presence на specific conversation, не на весь додаток).
- **EC-2** — Sender видалив message протягом 5с — push job вже у queue; deliver'ить outdated. Frontend handles ("Message deleted").
- **EC-3** — body_preview містить sensitive data — на iOS show рrivacy mode (Notification Service Extension — post-MVP).

### Технічна спека

- Listener: `NotifyOnMessageSent` (queued listener) → реєструється на `MessageSent`
- Presence check: Reverb API `presence:conversation.{id}` users list
- Notification through [`notifications.md`](notifications.md) `NTF-001`

---

## Залежності модуля Chat

- **Залежить від:** Auth, Users, Clients (для дозволу trainer↔client matching), Files (для media), Notifications (push), Reverb (broadcasting).
- **Залежать від нього:** жоден інший модуль не пише в chat, але інші модулі можуть запускати system messages у чат (post-MVP, e.g. "Trainer scheduled new session" — пост у чат).
