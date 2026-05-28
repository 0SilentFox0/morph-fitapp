# Features — Transactions

**Модуль:** Transactions · **Phase:** 3 · **Файлів-сусідів:** [`../transactions.md`](../transactions.md) (technical)

4 фічі. **Без прямих оплат** — тільки ручний облік. Тренер вводить факт оплати після того, як отримав кошти зовні (cash, transfer, card terminal, інший сервіс). Прив'язка до пакета (PKG-002) clear's debt (PKG-004).

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | TRX-001 | Transaction management | compact |
| 2 | TRX-002 | Package linkage | compact |
| 3 | TRX-003 | Search, filter, export | compact |
| 4 | TRX-004 | Withdraw tracking | compact |

---

## 1. Transaction management [TRX-001]

**Phase:** 3 · **Стиль:** compact

### Контекст

Manual create/edit/delete record'ів про отриману оплату. Status (`paid`/`pending`/`canceled`), method (`cash`/`transfer`/`card`/`other`), `paid_at`, optional note, optional `client_id`, optional `client_package_id` (TRX-002).

### User stories

- **US-TRX-001** — *Як trainer, я хочу записати, що отримав оплату від клієнта.*
- **US-TRX-002** — *Як trainer, я хочу відредагувати помилковий запис.*
- **US-TRX-003** — *Як trainer, я хочу видалити запис (з audit log).*
- **US-TRX-004** — *Як trainer, я хочу позначити очікувану оплату як `pending` і потім marked як `paid`.*

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `POST /v1/transactions` з `{ client_id?, amount: 5000, currency: "UAH", method: "transfer", status: "paid", paid_at, note?, client_package_id? }` і `Idempotency-Key` *Then* `201` з `{ transaction }`. `TransactionCreated` event broadcasts.
- **AC-2** — *Given* `amount <= 0` *Then* `422 amount_invalid`.
- **AC-3** — *Given* `currency` not in supported list (`UAH/USD/EUR`) *Then* `422 currency_unsupported`.
- **AC-4** — *Given* `client_id` чужого client'а *Then* `403`.
- **AC-5** — *Given* `client_package_id` що не належить `client_id` (mismatch) *Then* `422 package_client_mismatch`.
- **AC-6** — *Given* trainer T і transaction T's *When* `PATCH /v1/transactions/{id}` з diff *Then* `200`, оновлено. `TransactionUpdated` event.
- **AC-7** — *Given* `DELETE /v1/transactions/{id}` *Then* `200` (soft delete `deleted_at`); audit log entry. Якщо був linked до package — re-evaluate `debt_since`.
- **AC-8** — *Given* status change `pending → paid` *Then* events `TransactionStatusChanged`; `paid_at = now()` якщо ще NULL.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ свої (CRUD) |
| Client | ❌ (не бачить amount, але бачить fact of payment receipt через notif. PKG-002 cleared debt) |
| Admin | ✅ всі (audit) |

### Edge cases

- **EC-1** — Idempotent: той самий `Idempotency-Key` за 24h повертає cached response (захист від double-submit).
- **EC-2** — `paid_at` у майбутньому: `422 paid_at_in_future`.
- **EC-3** — Editing `amount` після linked до package — package's debt re-evaluation triggers.
- **EC-4** — Delete тільки з status `paid` що cleared package — debt може re-triggernutьcя.

### Технічна спека

- API: [`../transactions.md`](../transactions.md) § `POST /transactions`, `PATCH /transactions/{id}`, `DELETE /transactions/{id}`, `GET /transactions/{id}`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `transactions` (з `trainer_id`, `client_id` FK SET NULL, `client_package_id` FK SET NULL, `amount numeric(10,2)`, `currency varchar(3)`, `method enum`, `status enum: paid|pending|canceled`, `paid_at`, `note text`, `deleted_at`)
- Events: `TransactionCreated`, `TransactionUpdated`, `TransactionStatusChanged`, `TransactionDeleted`
- Listeners: `ClearDebtOnTransactionPaidListener`, `ReEvaluateDebtOnTransactionDeletedListener`

---

## 2. Package linkage [TRX-002]

**Phase:** 3 · **Стиль:** compact

### Контекст

Optional 1-to-1 link `transactions.client_package_id` → один пакет може мати один (або жоден) `paid` transaction. Link clear's debt (PKG-004).

### User stories

- **US-TRX-005** — *Як trainer, я хочу прив'язати transaction до конкретного пакета клієнта, щоб система знала, що цей пакет оплачено.*
- **US-TRX-006** — *Як trainer, я хочу побачити "Unpaid packages" і швидко створити transaction для одного.*

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `PATCH /v1/transactions/{id}` з `{ client_package_id: X }` де X — package клієнта *Then* `200`, link встановлено; `client_packages.debt_since = null`; `DebtCleared` event.
- **AC-2** — *Given* package вже linked to інший paid transaction *Then* `409 package_already_paid` з `{ existing_transaction_id }`.
- **AC-3** — *Given* unlink (`client_package_id = null` у PATCH) *Then* `200`; re-evaluate debt.
- **AC-4** — *Given* trainer *When* `GET /v1/me/packages/unpaid?client_id=` *Then* `200` з list пакетів без paid transaction.
- **AC-5** — *Given* transaction з status != "paid" linked до package *Then* package debt НЕ cleared (тільки paid).

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ свої transactions і packages |
| Інші | ❌ |

### Edge cases

- **EC-1** — UNIQUE partial index: `(client_package_id) WHERE status = "paid" AND deleted_at IS NULL` — гарантує що тільки один paid transaction per package.
- **EC-2** — Перетворення `pending → paid` після link — debt clearing triggered тільки на perехід до `paid`.
- **EC-3** — Multiple partial transactions для одного package (e.g. 2x by 2500 з 5000) — MVP не підтримує; trainer створює один transaction зі сумою-сумою.

### Технічна спека

- API: `PATCH /v1/transactions/{id}` (з `client_package_id` field), `GET /v1/me/packages/unpaid`
- DB: UNIQUE partial index above; foreign key `transactions.client_package_id` FK SET NULL → `client_packages.id`
- Listeners: `ClearDebtOnTransactionPaidListener`, `RestoreDebtOnUnlinkListener`

---

## 3. Search, filter, export [TRX-003]

**Phase:** 3 · **Стиль:** compact

### Контекст

List transactions з фільтрами (client, status, method, period, amount range, currency). Search по `note`. Експорт у CSV через async job.

### User stories

- **US-TRX-007** — *Як trainer, я хочу шукати transactions по полю note або клієнту.*
- **US-TRX-008** — *Як trainer, я хочу фільтрувати: за період, status, method, client.*
- **US-TRX-009** — *Як trainer, я хочу експортувати transactions у CSV (за період), щоб подати у бухгалтерію.*

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `GET /v1/transactions?client_id=&status=&method=&from=&to=&q=&min_amount=&max_amount=&cursor=` *Then* `200` cursor-paginated list, filtered.
- **AC-2** — *Given* `from > to` *Then* `422 invalid_range`.
- **AC-3** — *Given* trainer *When* `POST /v1/transactions/export` з body filters *Then* `202 accepted` з `{ export_id }`; `BuildTransactionsExportJob` enqueued.
- **AC-4** — *Given* job completed *Then* user отримує email "Export ready" з signed URL до CSV (TTL 7 днів).
- **AC-5** — *Given* CSV *Then* має columns: `date, client, amount, currency, method, status, package, note`.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ свої |
| Client | ❌ |
| Admin | ✅ всі |

### Edge cases

- **EC-1** — Export з > 10K rows — chunk-streaming для memory efficiency.
- **EC-2** — Cross-currency у CSV — кожен row має свою currency (без conversion).
- **EC-3** — Search query на UAH-кирилицю — ILIKE з UTF-8 indexes.

### Технічна спека

- API: `GET /v1/transactions`, `POST /v1/transactions/export`, `GET /v1/me/exports/{id}` (status check + download URL коли ready — спільний endpoint з [`AUTH-005`](auth.md) data export)
- DB: `transactions` index `(trainer_id, paid_at DESC)`, GIN on `note tsvector` для search
- Jobs: `BuildTransactionsExportJob` (queue `low`)

---

## 4. Withdraw tracking [TRX-004]

**Phase:** 3 · **Стиль:** compact

### Контекст

Тренер фіксує, що зняв N грн з рахунку (cash withdrawal, bank transfer outside, "вивіз" cash). Лише **logging** — система не інтегрується з payout API. Використовується в аналітиці для розрахунку "available balance" = sum(`transactions.paid`) − sum(`withdrawals`).

### User stories

- **US-TRX-010** — *Як trainer, я хочу фіксувати withdrawals, щоб бачити свій актуальний balance в додатку.*

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `POST /v1/withdrawals` з `{ amount, currency, withdrawn_at, note? }` *Then* `201`.
- **AC-2** — *Given* `amount > current_balance` *Then* `200` (дозволено, just bookkeeping; warning у response: `warnings: ["overdraft"]`).
- **AC-3** — *Given* trainer *When* `GET /v1/withdrawals?from=&to=&cursor=` *Then* cursor-paginated list.
- **AC-4** — *Given* trainer *When* `PATCH /v1/withdrawals/{id}` *Then* `200`, оновлено.
- **AC-5** — *Given* `DELETE /v1/withdrawals/{id}` *Then* `200` (soft).
- **AC-6** — *Given* user `GET /v1/me/balance` *Then* `200` з `{ by_currency: { UAH: { earned, withdrawn, balance } } }`.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ свої (CRUD) |
| Інші | ❌ |
| Admin | ✅ всі (audit) |

### Edge cases

- **EC-1** — Multi-currency: balance окремо per currency.
- **EC-2** — Soft-deleted transactions/withdrawals не входять у balance.
- **EC-3** — Concurrent edit балансу не критично — це aggregate query, eventual consistency.

### Технічна спека

- API: [`../transactions.md`](../transactions.md) § `POST /withdrawals`, `GET /withdrawals`, `PATCH /withdrawals/{id}`, `DELETE /withdrawals/{id}`, `GET /me/balance`
- DB: `withdrawals` (з `trainer_id`, `amount`, `currency`, `withdrawn_at`, `note`, `deleted_at`)
- Service: `BalanceCalculator` (sum transactions paid − sum withdrawals per currency)

---

## Залежності модуля Transactions

- **Залежить від:** Auth, Users, Clients, Packages.
- **Залежать від нього:** Packages (debt clear), Analytics (revenue charts).
