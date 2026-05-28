# Features — Transactions

**Модуль:** Transactions · **Phase:** 3 · **Файлів-сусідів:** [`../transactions.md`](../transactions.md) (technical)

4 фічі. Без прямих оплат — тільки облік.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | TRX-001 | Transaction management | compact |
| 2 | TRX-002 | Package linkage | compact |
| 3 | TRX-003 | Search, filter, export | compact |
| 4 | TRX-004 | Withdraw tracking | compact |

> **Skeleton.** Детальний контент — на Phase 3 checkpoint.

---

## 1. Transaction management [TRX-001]
**Compact · Skeleton.** Manual entry: тренер створює запис після отримання коштів зовні.

- API: `POST /transactions`, `PATCH /transactions/{id}`, `DELETE /transactions/{id}`
- DB: `transactions` (з `trainer_id`, `client_id` nullable, `amount`, `currency`, `method enum: cash|transfer|card|other`, `status enum: paid|pending|canceled`, `paid_at`, `note`, `client_package_id` FK nullable)
- Idempotency: `Idempotency-Key` header.

## 2. Package linkage [TRX-002]
**Compact · Skeleton.** Прив'язка transaction до конкретного `ClientPackage` (1-to-1 опційно). Це закриває debt для пакета.

- API: `PATCH /transactions/{id}` з `client_package_id`
- Logic: на link → `client_packages.is_in_debt = false`.

## 3. Search, filter, export [TRX-003]
**Compact · Skeleton.** List з фільтрами (client, status, method, date range). Export to CSV.

- API: `GET /transactions?client_id=&status=&from=&to=&method=`, `POST /transactions/export`
- Export: async job `BuildTransactionsExportJob` → email з signed URL до CSV.

## 4. Withdraw tracking [TRX-004]
**Compact · Skeleton.** Тренер фіксує, що зняв N грн з рахунку (cash withdrawal або bank transfer outside). Лише logging — без реального API до payout-провайдера.

- API: `POST /withdrawals` з `{ amount, currency, withdrawn_at, note }`
- DB: `withdrawals` (з `trainer_id`, `amount`, `currency`, `withdrawn_at`, `note`)
- Analytics: вираховує "Available balance" = sum(`transactions.paid`) − sum(`withdrawals`).
