# Clients API

**Related tasks:** CLNT-002, CLNT-003, CLNT-004, CLNT-005, CLNT-006, CLNT-008, LOGIC-010–014

## Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/clients` | List clients |
| GET | `/clients/:id` | Get client profile |
| GET | `/clients/:id/programs` | Get client's programs |
| POST | `/clients` | Create client |
| PATCH | `/clients/:id` | Update client |
| DELETE | `/clients/:id` | Delete client |
| GET | `/exercises/:id` | Get exercise detail |

---

## GET /clients

**Query params:**
- `q` (optional): search by name
- `training` (optional): filter by training type
- `payment` (optional): filter by payment status

**Response 200:**
```json
{
  "clients": [
    {
      "id": "string",
      "name": "string",
      "avatar": "url | null",
      "lastSession": "Dec 5, 14:00",
      "tag": "Personal | Group"
    }
  ]
}
```

---

## GET /clients/:id

**Response 200:**
```json
{
  "id": "string",
  "name": "string",
  "avatar": "url | null",
  "tag": "Personal | Group",
  "lastSession": "string",
  "nextSession": "string | null"
}
```

---

## GET /clients/:id/programs

**Response 200:**
```json
{
  "programs": [
    {
      "id": "string",
      "name": "string",
      "exercises": [
        { "id": "string", "name": "string", "sets": 3, "reps": "12" }
      ]
    }
  ]
}
```

---

## POST /clients

**Request body:**
```json
{
  "name": "string",
  "avatar": "url | null",
  "tag": "Personal | Group"
}
```

**Response 201:** Same shape as GET /clients/:id.

---

## PATCH /clients/:id

**Request body:** Partial update (name, avatar, tag).

**Response 200:** Same shape as GET /clients/:id.

---

## DELETE /clients/:id

**Response 204:** No body.

---

## GET /exercises/:id

Used for Exercise detail screen (CLNT-006).

**Response 200:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "sets": 3,
  "reps": "12",
  "videoUrl": "url | null"
}
```
