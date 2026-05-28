# Features — Packages & Subscriptions

**Модуль:** Packages & Subscriptions · **Phase:** 3 · **Файлів-сусідів:** [`../packages.md`](../packages.md) (technical)

4 фічі.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | PKG-001 | Package templates | compact |
| 2 | PKG-002 | Package assignment & lifecycle | full |
| 3 | PKG-003 | Subscription auto-renewal | full |
| 4 | PKG-004 | Debt tracking & notifications | compact |

> **Skeleton.** Детальний контент — на Phase 3 checkpoint.

---

## 1. Package templates [PKG-001]
**Compact · Skeleton.** CRUD шаблонів пакетів: "10 тренувань / місяць за X грн", "Місячна підписка з 8 тренувань", "Single session pass".

- API: `GET /packages/templates`, `POST /packages/templates`, `PATCH /packages/templates/{id}`, `DELETE /packages/templates/{id}`
- DB: `package_templates` (з `trainer_id`, `name`, `kind: count_based | time_based | hybrid`, `sessions_count`, `validity_days`, `price`, `currency`, `archived_at`)

## 2. Package assignment & lifecycle [PKG-002]
**Full · Skeleton.** Тренер створює `ClientPackage` для конкретного клієнта (з template або custom): `remaining_sessions`, `expires_at`, `status`. При `SessionCompleted` → `OnSessionCompleted` listener декрементує. При remaining=0 → status `exhausted`, event + push. При expires_at — `expired`.

- API: `POST /client-packages`, `GET /clients/{id}/packages`, `PATCH /client-packages/{id}`, `POST /client-packages/{id}/archive`
- DB: `client_packages` (з `client_id`, `template_id` nullable, `remaining_sessions`, `total_sessions`, `expires_at`, `status enum`, `assigned_at`, `archived_at`)
- Events: `PackageAssigned`, `PackageDecremented`, `PackageExhausted`, `PackageExpired`
- Edge case: відміна `completed` session → пакет повертає decrement (`remaining_sessions += 1`).

## 3. Subscription auto-renewal [PKG-003]
**Full · Skeleton.** Підписка = recurring `ClientPackage` створюється автоматично через job. Налаштовується `auto_renew: bool`, `next_renewal_at`.

- Jobs: `SubscriptionRenewalJob` (scheduled daily 00:30) — створює наступний `ClientPackage` для тих з `auto_renew = true` і `expires_at < tomorrow`.
- Edge cases: trainer вимкнув subscription mid-cycle → renewal cancelled.

## 4. Debt tracking & notifications [PKG-004]
**Compact · Skeleton.** Якщо пакет exhausted, а нової транзакції немає N днів — флаг `is_in_debt`. Push нагадування тренеру і клієнту. (Не блокує жодних дій; це bookkeeping.)

- DB: `client_packages.debt_since` nullable timestamp
- Jobs: `PackageDebtCheckJob` (daily)
- Notifications: `PackageOverdue` push trigger.
