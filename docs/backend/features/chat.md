# Features — Chat & Messaging

**Модуль:** Chat · **Phase:** 2 · **Файлів-сусідів:** [`../chat.md`](../chat.md) (technical)

6 фіч.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | CHT-001 | Conversation management | compact |
| 2 | CHT-002 | Text messaging | full |
| 3 | CHT-003 | Media messaging | full |
| 4 | CHT-004 | Read receipts & typing indicators | full |
| 5 | CHT-005 | Chat search | compact |
| 6 | CHT-006 | Push notifications for chat | compact |

> **Skeleton.** Детальний контент — на Phase 2 checkpoint.

---

## 1. Conversation management [CHT-001]
**Compact · Skeleton.** Створення 1-to-1 conversation (тренер ↔ клієнт), список з last message preview, soft-delete (для current user — приховує, але other side ще бачить).

- API: [`../chat.md`](../chat.md) § `GET /conversations`, `POST /conversations`, `DELETE /conversations/{id}`
- DB: `conversations`, `conversation_participants`

## 2. Text messaging [CHT-002]
**Full · Skeleton.** Send text message → store + broadcast `MessageSent` event → push до offline учасників.

- API: `POST /conversations/{id}/messages`, `GET /conversations/{id}/messages?cursor=`
- DB: `messages`, `conversation_reads`
- Events: `MessageSent` (Reverb broadcast on `private-conversation.{id}`)
- Permissions: тільки учасники conversation.

## 3. Media messaging [CHT-003]
**Full · Skeleton.** Media upload через [Files](files.md) pipeline (chat_media purpose) → attach до повідомлення.

- API: те саме `POST /conversations/{id}/messages` з `media_file_ids[]`
- Access: signed URLs через `GET /v1/files/{id}/signed-url` (тільки учасники)

## 4. Read receipts & typing indicators [CHT-004]
**Full · Skeleton.** Read state per user: `conversation_reads.last_read_message_id`. Typing — ephemeral event без persistence (TTL 3s).

- API: `POST /conversations/{id}/mark-read`, WS event `UserTyping`
- Events: `MessageRead`, `UserTyping` (Reverb broadcast)

## 5. Chat search [CHT-005]
**Compact · Skeleton.** Full-text search у власних повідомленнях (PostgreSQL tsvector).

- API: `GET /conversations/{id}/messages?q=`
- DB: `messages.body_tsv tsvector` + GIN index

## 6. Push notifications for chat [CHT-006]
**Compact · Skeleton.** Listener `NotifyOnMessageSent` для не-онлайн учасників (presence через Reverb). Див. [`notifications.md`](notifications.md).
