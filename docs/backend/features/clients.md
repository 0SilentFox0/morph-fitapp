# Features — Clients (CRM)

**Модуль:** Clients (CRM) · **Phase:** 1 · **Файлів-сусідів:** [`../clients.md`](../clients.md) (technical)

3 фічі. Тренерський "roster" клієнтів — central CRM-сутність FitConnect.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | CLT-001 | Client roster management | full |
| 2 | CLT-002 | Client invitation flow | full |
| 3 | CLT-003 | Notes & tags | compact |

> **Skeleton.** Детальний контент — на Phase 1 checkpoint.

---

## 1. Client roster management [CLT-001]

**Phase:** 1 · **Стиль:** full · **Status:** skeleton

CRUD клієнтів у тренерському roster'і: list (з фільтрами по type, status, search), create (без user account: email+name; або link до існуючого user), edit, archive, delete.

**Заплановані user stories:**
- *Як trainer, я хочу бачити список всіх своїх клієнтів з можливістю пошуку і фільтрації.*
- *Як trainer, я хочу додати нового клієнта в roster без обов'язкового invite.*
- *Як trainer, я хочу архівувати клієнта (зберегти історію), але прибрати з активного списку.*
- *Як trainer, я хочу видалити клієнта (з cascade на сесії-майбутнє → cancel; історія — лишається).*

**Технічна спека:**
- API: [`../clients.md`](../clients.md) § `GET /clients`, `POST /clients`, `PATCH /clients/{id}`, `DELETE /clients/{id}`, `POST /clients/{id}/archive`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `clients` (з `trainer_id`, `name`, `email`, `user_id` nullable, `type`, `status enum`, `archived_at`)

---

## 2. Client invitation flow [CLT-002]

**Phase:** 1 · **Стиль:** full · **Status:** skeleton

Тренер створює invitation для клієнта → клієнт отримує email з deep link → реєструється/логиниться → автоматично лінкується до тренера як `clients.user_id`. Альтернатива: invitation code (вводиться вручну в client onboarding).

**Заплановані user stories:**
- *Як trainer, я хочу надіслати запрошення email'ом клієнту, щоб він зареєструвався і з'явився у моєму roster'і.*
- *Як trainer, я хочу скасувати pending invitation, якщо клієнт не зареєструвався.*
- *Як client, я хочу прийняти invitation під час реєстрації.*

**Технічна спека:**
- API: [`../clients.md`](../clients.md) § `POST /clients/{id}/invite`, `POST /invitations/{code}/accept`, `DELETE /invitations/{id}`
- DB: `client_invitations` (новий, з `code`, `email`, `trainer_id`, `client_id`, `expires_at`, `accepted_at`)
- Events: `ClientInvited`, `InvitationAccepted`

---

## 3. Notes & tags [CLT-003]

**Phase:** 1 · **Стиль:** compact · **Status:** skeleton

Приватні нотатки тренера про клієнта (markdown text) + tags (string array) для категоризації. Notes — лише тренер може читати/писати; client не бачить.

**Заплановані user stories:**
- *Як trainer, я хочу робити приватні нотатки про клієнта (mood, прогрес, спеціальні потреби).*
- *Як trainer, я хочу позначати клієнтів тегами для фільтрації.*

**Технічна спека:**
- API: [`../clients.md`](../clients.md) § `PATCH /clients/{id}` (з полями `notes`, `tags`)
- DB: `clients.notes text`, `clients.tags jsonb` (string array)
