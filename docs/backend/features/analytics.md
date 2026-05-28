# Features — Analytics

**Модуль:** Analytics · **Phase:** 3 · **Файлів-сусідів:** [`../analytics.md`](../analytics.md) (technical)

1 фіча. Read-only dashboard для тренера: income chart, revenue by source, trainings count, active subscriptions, profile views. Базується на агрегаціях з transactions/sessions/profile_view_events.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | ANL-001 | Trainer business analytics | compact |

---

## 1. Trainer business analytics [ANL-001]

**Phase:** 3 · **Стиль:** compact

### Контекст

Один dashboard з кількома widgets для тренера: загальна сума заробленого, revenue by source (per client), тренувань за період, активних підписок, profile views. Custom timeframe selector (week/month/custom). Дані — aggregations з transactions, sessions, profile_view_events; кешуються через `AnalyticsCacheRefreshJob` (hourly) для performance.

### User stories

- **US-ANL-001** — *Як trainer, я хочу бачити графік доходу за період, щоб розуміти business trend.*
- **US-ANL-002** — *Як trainer, я хочу бачити, які клієнти приносять найбільше доходу (для priority management).*
- **US-ANL-003** — *Як trainer, я хочу бачити, скільки разів мій профіль переглядали (для marketing analytics).*
- **US-ANL-004** — *Як trainer, я хочу швидко перемикати timeframe (Week / Month / Custom).*
- **US-ANL-005** — *Як trainer, я хочу побачити кількість conducted сесій і active subscriptions за період.*

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `GET /v1/analytics/summary?from=&to=` *Then* `200` з `{ total_earnings: { UAH: 50000, USD: 200 }, sessions_count: 42, active_subscriptions: 15, profile_views: 234, currency_summary: [...] }`.
- **AC-2** — *Given* `GET /v1/analytics/income-over-time?from=&to=&granularity=day|week|month&currency=UAH` *Then* `200` з array `[{ date, amount }]`.
- **AC-3** — *Given* `GET /v1/analytics/revenue-by-source?from=&to=&currency=UAH` *Then* `200` з array `[{ client_id, client_name, total_amount, transactions_count }]` sorted DESC.
- **AC-4** — *Given* `GET /v1/analytics/profile-views?from=&to=&granularity=day` *Then* `200` з array `[{ date, count }]`.
- **AC-5** — *Given* timeframe > 1 рік *Then* `422 range_too_wide`.
- **AC-6** — *Given* trainer *Then* response містить **тільки його** дані (filter through `transactions.trainer_id = auth()`).
- **AC-7** — *Given* `AnalyticsCacheRefreshJob` ran in last 1h *Then* response served from cache; if not — computed on-the-fly + cached.
- **AC-8** — *Given* cache invalidation на `TransactionCreated`/`SessionCompleted`/`PackageAssigned` *Then* affected cache keys deleted (ETag bumped); next read recomputes.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ свої тільки |
| Client | ❌ (не має access до аналітики; своя progress — в [`progress.md`](progress.md)) |
| Admin | ✅ всі (platform-level analytics — post-MVP) |

### Edge cases

- **EC-1** — Cross-currency aggregation: response розділяє по currencies; не конвертує (FX rates — post-MVP).
- **EC-2** — Soft-deleted transactions і canceled sessions — НЕ враховуються в analytics.
- **EC-3** — Profile views — anonymous и authenticated (each visitor лише 1× per day per profile через dedup key у Redis).
- **EC-4** — Self-views (trainer переглядає свій profile) — НЕ враховуються.
- **EC-5** — Cold start аналітики (no data) — повертає zeros, не error.
- **EC-6** — Cache miss + heavy computation на peak hour — `dispatch_sync` для perd-user мізні, але heavy aggregations через async job → response `202 cached_pending` з ETA (rare).

### Технічна спека

- API: [`../analytics.md`](../analytics.md) § `GET /analytics/summary`, `GET /analytics/income-over-time`, `GET /analytics/revenue-by-source`, `GET /analytics/profile-views`, `GET /analytics/sessions-by-status`, `GET /analytics/subscriptions-active`
- DB: 
  - `transactions` (для earnings) — index `(trainer_id, paid_at, status, currency)`
  - `sessions` (для sessions count) — index `(trainer_id, status, start_at)`
  - `client_packages` (для active subscriptions) — index `(trainer_id, status)` (потрібно denormalize trainer_id або JOIN через clients)
  - `profile_view_events` (append-only log: `viewed_user_id, viewer_user_id?, viewed_at, ip_hash`)
  - `analytics_cache` (key-value кеш: `key`, `payload jsonb`, `computed_at`, `expires_at`)
- Jobs: `AnalyticsCacheRefreshJob` (scheduled hourly), `IncrementProfileViewJob` (queue `low`, throttled через dedup)
- Listeners: cache invalidation на `TransactionCreated`/`Updated`/`Deleted`, `SessionCompleted`/`StatusChanged`, `PackageAssigned`/`Exhausted`/`Expired`
- Service: `AnalyticsAggregator` (повертає cached or fresh)

---

## Залежності модуля Analytics

- **Залежить від:** Auth, Users, Transactions, Sessions, Packages, Workout Tracking (для total volume metric, post-MVP).
- **Залежать від нього:** жоден — read-only consumer.
