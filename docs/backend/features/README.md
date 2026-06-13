# Backend Features — Feature-Level Specifications

Папка містить feature-level специфікації по модулях. Парасолька — [`../TECH_TASK.md`](../TECH_TASK.md). Технічні API/DB деталі — у `../{module}.md` файлах.

## Карта модулів

| Phase | Модуль | Файл | Фіч |
|---|---|---|:-:|
| 0 | Auth & Identity | [auth.md](auth.md) | 5 |
| 0 | Users & Profile | [users.md](users.md) | 1 |
| 0 | Files & Media | [files.md](files.md) | 1 |
| 0 | Notifications | [notifications.md](notifications.md) | 2 |
| 1 | Onboarding | [onboarding.md](onboarding.md) | 3 |
| 1 | Clients (CRM) | [clients.md](clients.md) | 3 |
| 1 | Programs | [programs.md](programs.md) | 2 |
| 1 | Exercises | [exercises.md](exercises.md) | 2 |
| 1, 2 | Sessions & Calendar | [sessions.md](sessions.md) | 7 |
| 2 | Chat & Messaging | [chat.md](chat.md) | 6 |
| 2 | Workout Tracking | [workout-tracking.md](workout-tracking.md) | 5 |
| 2 | External Integrations | [integrations.md](integrations.md) | 3 |
| 3 | Packages & Subscriptions | [packages.md](packages.md) | 4 |
| 3 | Transactions | [transactions.md](transactions.md) | 4 |
| 3 | Progress Metrics | [progress.md](progress.md) | 4 |
| 3 | Analytics | [analytics.md](analytics.md) | 1 |
| 4 | Gamification | [gamification.md](gamification.md) | 8 |

**Total:** 61 фіча.

---

## Шаблон — FULL

Використовується для фіч із значимою бізнес-логікою (workout sync, packages, calendar, chat real-time, auth, sessions).

```markdown
### <NNN>. <Назва фічі> [<CODE>-NNN]

**Phase:** <0|1|2|3> · **Стиль:** full

#### Контекст
1-2 абзаци: що це, навіщо, бізнес-цінність, які проблеми розв'язує.

#### User stories
- **US-<CODE>-001** — *Як <роль>, я хочу <дію>, щоб <ціль>.*
- **US-<CODE>-002** — ...
- **US-<CODE>-003** — ...

#### User flow + UI mapping
1. Крок 1 (екран: `ScreenName.tsx`, дія).
2. Крок 2 (API call: `POST /v1/resource` з body).
3. Крок 3 (backend дія: транзакція, broadcast event, side effect).
4. ...

#### Acceptance criteria (Given/When/Then)
- **AC-1** — *Given* ... *When* ... *Then* ...
- **AC-2** — ...
- **AC-3** — ...
- **AC-4** — ...
- **AC-5** — ...

#### Permissions
| Роль | Дія A | Дія B | Дія C |
|---|---|---|---|
| Trainer | ✅ ... | ✅ ... | ❌ |
| Client | ❌ | ✅ ... | ❌ |
| Admin | ✅ | ✅ | ✅ |

#### Edge cases
| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | ... | ... |
| EC-2 | ... | ... |
| EC-3 | ... | ... |

#### Зв'язок з технічною спекою
- API: `../<module>.md` § `<endpoint>`
- DB: `../DB_STRUCTURE.md` § `<table>`
- Events: `../TECH_TASK.md` § Real-time → `<EventName>`
- Jobs: `<JobName>`
```

---

## Шаблон — COMPACT

Використовується для CRUD-операцій та простих use-case'ів.

```markdown
### <NNN>. <Назва фічі> [<CODE>-NNN]

**Phase:** <0|1|2|3> · **Стиль:** compact

#### Контекст
1 абзац: що це.

#### User stories
- **US-<CODE>-001** — *Як <роль>, я хочу <дію>, щоб <ціль>.*
- **US-<CODE>-002** — ...

#### Acceptance criteria
- **AC-1** — *Given* ... *When* ... *Then* ...
- **AC-2** — ...
- **AC-3** — ...

#### Permissions
| Роль | Доступ |
|---|---|
| Trainer | ✅ (обмеження) |
| Client | ❌ / ✅ обмежено |
| Admin | ✅ |

#### Edge cases
- **EC-1** — ...
- **EC-2** — ...

#### Технічна спека
- API: `../<module>.md` § `<endpoint>`
- DB: `../DB_STRUCTURE.md` § `<table>`
```

---

## Кодування фіч

Кожна фіча має код виду `<MODULE>-NNN`:

| Префікс | Модуль |
|---|---|
| AUTH | Auth & Identity |
| USR | Users & Profile |
| FIL | Files & Media |
| NTF | Notifications |
| ONB | Onboarding |
| CLT | Clients (CRM) |
| PRG | Programs |
| EXR | Exercises |
| SES | Sessions & Calendar |
| CHT | Chat |
| WT | Workout Tracking |
| INT | External Integrations |
| PKG | Packages & Subscriptions |
| TRX | Transactions |
| PROG | Progress Metrics |
| ANL | Analytics |
| GAME | Gamification |

User stories — `US-<CODE>-NNN`, acceptance criteria — `AC-N` (локально в фічі), edge cases — `EC-N`.
