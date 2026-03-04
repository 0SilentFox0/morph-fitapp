# Analytics API

**Related tasks:** HOME-004, HOME-005, ANLY-001–006, ANLY-011

## Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/analytics/revenue` | Revenue stat (home) |
| GET | `/analytics/profile-views` | Profile views stat (home) |
| GET | `/analytics/summary` | Summary cards (Total Earnings, Subscriptions, Trainings) |
| GET | `/analytics/income-over-time` | Line chart data |
| GET | `/analytics/revenue-by-source` | Bar chart data (subscriptions vs trainings) |

---

## GET /analytics/revenue

**Query params:**
- `period` (optional): `week | month | year`

**Response 200:**
```json
{
  "value": 428,
  "change": 12.5,
  "period": "month"
}
```

---

## GET /analytics/profile-views

**Response 200:**
```json
{
  "value": 156,
  "change": -3.2
}
```

---

## GET /analytics/summary

**Query params:**
- `period` (optional): `week | month | custom`
- `from`, `to` (optional): for custom period

**Response 200:**
```json
{
  "totalEarnings": 428,
  "fromSubscriptions": 180,
  "fromTrainings": 248
}
```

---

## GET /analytics/income-over-time

**Query params:**
- `period`: `week | month`
- `from`, `to` (optional): for custom

**Response 200:**
```json
{
  "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "datasets": [
    { "data": [120, 85, 95, 140, 110, 75, 98] }
  ]
}
```

---

## GET /analytics/revenue-by-source

**Query params:**
- `period`: `week | month`

**Response 200:**
```json
{
  "subscriptions": 180,
  "trainings": 248
}
```
