# Chat API

**Related tasks:** CHAT-001–011, LOGIC-018, BCHAT-001–006

## Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/conversations` | List conversations |
| GET | `/conversations/:id/messages` | Get message thread |
| POST | `/conversations` | Create conversation |
| POST | `/conversations/:id/messages` | Send message |
| PATCH | `/conversations/:id/read` | Mark as read |

---

## GET /conversations

**Query params:**
- `q` (optional): search by participant name
- `unread` (optional): `true` to filter unread only (for badge count)

**Response 200:**
```json
{
  "conversations": [
    {
      "id": "string",
      "participant": {
        "id": "string",
        "name": "string",
        "avatar": "url | null"
      },
      "lastMessage": {
        "id": "string",
        "text": "string",
        "sentAt": "2025-03-01T14:30:00Z",
        "isFromMe": true
      },
      "unreadCount": 2
    }
  ]
}
```

---

## GET /conversations/:id/messages

**Query params:**
- `before` (optional): cursor for pagination (message id)
- `limit` (optional): default 50

**Response 200:**
```json
{
  "messages": [
    {
      "id": "string",
      "text": "string",
      "sentAt": "2025-03-01T14:30:00Z",
      "isFromMe": true,
      "status": "sent | delivered | read"
    }
  ],
  "hasMore": true,
  "nextCursor": "string"
}
```

---

## POST /conversations

Create a new conversation (e.g. trainer starts chat with client).

**Request body:**
```json
{
  "participantId": "string"
}
```

**Response 201:**
```json
{
  "id": "string",
  "participant": {
    "id": "string",
    "name": "string",
    "avatar": "url | null"
  },
  "lastMessage": null,
  "unreadCount": 0
}
```

---

## POST /conversations/:id/messages

**Request body:**
```json
{
  "text": "string"
}
```

**Response 201:**
```json
{
  "id": "string",
  "text": "string",
  "sentAt": "2025-03-01T14:30:00Z",
  "isFromMe": true,
  "status": "sent"
}
```

---

## PATCH /conversations/:id/read

Mark all messages in conversation as read.

**Response 204:** No body.

---

## Real-time (optional)

For live message delivery, consider:
- **WebSocket:** `wss://api.fitconnect.app/ws` — subscribe to conversation, receive `message.new` events
- **Polling:** Frontend polls `GET /conversations/:id/messages` with `since` param

**WebSocket message event:**
```json
{
  "type": "message.new",
  "payload": {
    "id": "string",
    "conversationId": "string",
    "text": "string",
    "sentAt": "2025-03-01T14:30:00Z",
    "isFromMe": false,
    "sender": { "id": "string", "name": "string", "avatar": "url | null" }
  }
}
```
