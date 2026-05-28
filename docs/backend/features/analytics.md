# Features — Analytics

**Модуль:** Analytics · **Phase:** 3 · **Файлів-сусідів:** [`../analytics.md`](../analytics.md) (technical)

1 фіча.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | ANL-001 | Trainer business analytics | compact |

> **Skeleton.** Детальний контент — на Phase 3 checkpoint.

---

## 1. Trainer business analytics [ANL-001]
**Compact · Skeleton.** Read-only aggregations для trainer's dashboard: income chart over time, revenue by source (per client), profile views counter, trainings count, active subscriptions count. Custom timeframe selector (week/month/custom).

**User stories:**
- *Як trainer, я хочу бачити графік доходу за період.*
- *Як trainer, я хочу бачити, які клієнти приносять більше доходу.*
- *Як trainer, я хочу бачити, скільки разів мій профіль переглядали (для marketing).*

**Технічна спека:**
- API: [`../analytics.md`](../analytics.md) § `GET /analytics/summary`, `GET /analytics/income-over-time?from=&to=&granularity=`, `GET /analytics/revenue-by-source`, `GET /analytics/profile-views`
- DB: `analytics_cache` (precomputed aggregates, refreshed by `AnalyticsCacheRefreshJob` hourly); `profile_view_events` (append-only event log).
- Jobs: `AnalyticsCacheRefreshJob` (scheduled hourly).
- Permissions: тільки тренер бачить свої аналітики; client — ні.
