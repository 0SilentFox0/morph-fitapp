# Programs API (Training Library)

**Related tasks:** TLIB-002, TLIB-003, TLIB-004, LOGIC-006–009

## Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/programs` | List programs |
| GET | `/programs/:id` | Get single program |
| GET | `/programs/:id/videos` | List videos in program |
| POST | `/programs` | Create program |
| PATCH | `/programs/:id` | Update program |
| DELETE | `/programs/:id` | Delete program |

---

## GET /programs

**Query params:**
- `q` (optional): search by name

**Response 200:**
```json
{
  "programs": [
    {
      "id": "string",
      "name": "string",
      "tag": "string",
      "videoCount": 10,
      "views": 24,
      "likes": 340,
      "thumbnail": "url | null"
    }
  ]
}
```

---

## GET /programs/:id

**Response 200:**
```json
{
  "id": "string",
  "name": "string",
  "tag": "string",
  "videoCount": 10,
  "views": 24,
  "likes": 340,
  "thumbnail": "url | null"
}
```

---

## GET /programs/:id/videos

Used for Gallery screen (TLIB-004).

**Response 200:**
```json
{
  "videos": [
    {
      "id": "string",
      "title": "string",
      "thumbnail": "url | null",
      "duration": 120
    }
  ]
}
```

---

## POST /programs

**Request body:**
```json
{
  "name": "string",
  "tag": "string",
  "thumbnail": "url | null",
  "videos": [
    { "title": "string", "thumbnail": "url | null", "duration": 120 }
  ]
}
```

**Response 201:**
```json
{
  "id": "string",
  "name": "string",
  "tag": "string",
  "videoCount": 10,
  "views": 0,
  "likes": 0,
  "thumbnail": "url | null"
}
```

---

## PATCH /programs/:id

**Request body:** Partial update (name, tag, thumbnail, videos).

**Response 200:** Same shape as GET /programs/:id.

---

## DELETE /programs/:id

**Response 204:** No body.
