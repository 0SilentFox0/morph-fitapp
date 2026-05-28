# Features — Onboarding

**Модуль:** Onboarding · **Phase:** 1 · **Файлів-сусідів:** [`../onboarding.md`](../onboarding.md) (technical), [`../../flows/onboarding.md`](../../flows/onboarding.md)

3 фічі.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | ONB-001 | Trainer onboarding flow (13 steps) | full |
| 2 | ONB-002 | Client onboarding flow (skeleton) | compact |
| 3 | ONB-003 | Skip / resume / preview / finalize | compact |

> **Skeleton.** Детальний контент буде написаний на Phase 1 checkpoint. UI-flow вже існує у [`../../flows/onboarding.md`](../../flows/onboarding.md) (504 рядки) — звідти беруться кроки. Кожна фіча матиме user stories, AC, edge cases, permissions, technical link на технічну спеку.

---

## 1. Trainer onboarding flow [ONB-001]

**Phase:** 1 · **Стиль:** full · **Status:** skeleton

13 кроків: ChooseRole → WelcomeTrainer → WhatsYourName → Experience → TrainingTypes → ClientTypes → HavePrograms → AddToLibrary → WhereTrain → WorkSchedule → ProfilePhoto → PreviewProfile → YoureAllSet.

**Заплановані user stories:**
- *Як новий trainer, я хочу заповнити свій профіль у кілька простих кроків, щоб не зіткнутися з порожнім додатком.*
- *Як trainer, я хочу зберігати progress онбордингу, щоб продовжити з того ж місця.*
- *Як trainer, я хочу пропустити деякі необов'язкові кроки і повернутися до них пізніше.*

**Технічна спека (запланована):**
- API: [`../onboarding.md`](../onboarding.md) § `PATCH /me/onboarding/step/{step}`, `POST /me/onboarding/complete`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `users` (поля experience, certifications, training_types, client_types, locations, work_schedule_*); `onboarding_progress` (новий, для resume)

---

## 2. Client onboarding flow (skeleton) [ONB-002]

**Phase:** 1 · **Стиль:** compact · **Status:** skeleton

**MVP скоуп — 3-5 кроків:** name → goals (multi-select) → current shape (height/weight/fitness level) → optional link до тренера (через invitation code). Post-MVP: розширити.

**Заплановані user stories:**
- *Як новий client, я хочу заповнити мінімальний профіль, щоб почати працювати з тренером.*
- *Як client, я хочу ввести invitation code від тренера при онбордингу.*

**Технічна спека:**
- API: ті самі endpoints, з role-specific валідацією.
- DB: `users` (client-specific поля); `client_invitations` (новий, для invitation flow).

---

## 3. Skip / resume / preview / finalize [ONB-003]

**Phase:** 1 · **Стиль:** compact · **Status:** skeleton

**Поведінка:** Skip-кнопка → marks step as skipped, дозволяє продовжити. Resume → API повертає `current_step`. Preview → render-only view фіналізованого профіля. Finalize → `onboarding_completed_at` set, redirect до Home.

**Технічна спека:**
- API: [`../onboarding.md`](../onboarding.md) § `GET /me/onboarding/state`, `POST /me/onboarding/skip-step`
- DB: `onboarding_progress` (поля per step status), `users.onboarding_completed_at`
