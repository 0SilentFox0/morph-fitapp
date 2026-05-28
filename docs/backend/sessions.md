# Sessions API

**Related tasks:** SCHED-005, SCHED-008, SCHED-009, SCHED-010, SFORM-004, LOGIC-001–005

## Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/sessions` | List sessions (with filters) |
| GET | `/sessions/:id` | Get single session |
| POST | `/sessions` | Create session |
| PATCH | `/sessions/:id` | Update session |
| DELETE | `/sessions/:id` | Delete session |
| GET | `/sessions/:id/summary` | Get training summary for session |

---

## GET /sessions

**Query params:**
- `q` (optional): search by title
- `date` (optional): filter by date `YYYY-MM-DD`
- `from` (optional): start date `YYYY-MM-DD`
- `to` (optional): end date `YYYY-MM-DD`

**Response 200:**
```json
{
  "sessions": [
    {
      "id": "string",
      "title": "string",
      "type": "Cardio | HIIT | Strength | Yoga | Mobility | Pilates",
      "date": "YYYY-MM-DD",
      "time": "HH:mm",
      "status": "completed | pending | canceled",
      "participants": [
        { "id": "string", "name": "string", "avatar": "url | null" }
      ]
    }
  ]
}
```

---

## GET /sessions/:id

**Response 200:**
```json
{
  "id": "string",
  "title": "string",
  "type": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "status": "completed | pending | canceled",
  "participants": [
    { "id": "string", "name": "string", "avatar": "url | null" }
  ]
}
```

---

## POST /sessions

**Request body:**
```json
{
  "title": "string",
  "type": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "participantIds": ["string"]
}
```

**Response 201:**
```json
{
  "id": "string",
  "title": "string",
  "type": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "status": "pending",
  "participants": [
    { "id": "string", "name": "string", "avatar": "url | null" }
  ]
}
```

---

## PATCH /sessions/:id

**Request body:** Same as POST, all fields optional (partial update).

**Response 200:** Same shape as GET /sessions/:id.

---

## DELETE /sessions/:id

**Response 204:** No body.

---

## GET /sessions/:id/summary

Used for Training Summary screen (CLNT-009).

**Response 200:**
```json
{
  "sessionId": "string",
  "title": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "clientName": "string",
  "exercises": [
    { "id": "string", "name": "string", "sets": 3, "reps": "12" }
  ]
}
```
