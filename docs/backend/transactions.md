# Transactions API

**Related tasks:** ANLY-007, ANLY-008, ANLY-009, ANLY-010, LOGIC-015

## Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/transactions` | List transactions |
| GET | `/transactions/:id` | Get single transaction (if needed) |

---

## GET /transactions

**Query params:**
- `q` (optional): search by client name
- `from` (optional): start date `YYYY-MM-DD`
- `to` (optional): end date `YYYY-MM-DD`
- `type` (optional): `Training | Subscription`
- `status` (optional): `completed | pending | canceled`

**Response 200:**
```json
{
  "transactions": [
    {
      "id": "string",
      "clientName": "string",
      "date": "YYYY-MM-DD",
      "amount": "string",
      "type": "Training | Subscription",
      "status": "completed | pending | canceled"
    }
  ]
}
```

**Note:** `amount` is displayed as-is (e.g. `"$65"`, `"$400"`). Backend can return numeric + currency or formatted string.
