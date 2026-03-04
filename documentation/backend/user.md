# User API

**Related tasks:** HOME-003, ONB-012, LOGIC-016

## Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/user/profile` | Get current user profile |
| PATCH | `/user/profile` | Update profile |
| POST | `/user/avatar` | Upload profile photo |

---

## GET /user/profile

**Response 200:**
```json
{
  "id": "string",
  "name": "string",
  "avatar": "url | null",
  "role": "client | trainer",
  "points": 0,
  "experience": "string",
  "certifications": ["string"],
  "trainingTypes": ["string"],
  "clientTypes": ["string"],
  "locations": ["string"],
  "workSchedule": {
    "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    "startTime": "09:00",
    "endTime": "18:00"
  }
}
```

---

## PATCH /user/profile

**Request body:** Partial update of profile fields.

**Response 200:** Same shape as GET /user/profile.

---

## POST /user/avatar

**Request:** `multipart/form-data` with `file` (image).

**Response 200:**
```json
{
  "avatar": "url"
}
```
