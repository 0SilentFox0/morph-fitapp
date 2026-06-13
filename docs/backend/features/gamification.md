# Features — Gamification

**Модуль:** Gamification · **Phase:** 4 (post-MVP) · **Парасолька:** [`../TECH_TASK.md`](../TECH_TASK.md)

Гейміфікація для обох ролей. **Клієнти** отримують поінти за тренування, їхні рекорди по вазі формують силовий рейтинг, а композитний бал (стабільність + сила) визначає лігу. **Тренери** ростуть за к-стю тренувань, рекордами клієнтів і к-стю клієнтів (дохід **виключено**). Окрема фіча — анонімні підказки по цінах для тренерів.

Система розділяє **чотири незалежні концепти** — це робить анти-чіт, тюнінг і майбутні фази (гео, монетизація) дешевими:

| Концепт | Що це | Джерело | Анти-чіт |
|---|---|---|---|
| **Points** | Валюта залученості, бейдж | завершені тренування + PR + майлстоуни | само-лог рахується |
| **Consistency** | Тривалість/стрик/частота з затуханням | усі завершені сесії | само-лог рахується |
| **Strength** | Перцентиль 1RM по канонічних вправах | `personal_records` | **лише верифіковані** |
| **League** | Перцентильний тір композитного балу в пулі | `gamification_scores` | похідне |

| # | Код | Назва | Стиль | Phase |
|:-:|---|---|:-:|:-:|
| 1 | GAME-001 | Points & ledger | full | 4 |
| 2 | GAME-002 | Scoring — consistency / strength / composite | full | 4 |
| 3 | GAME-003 | Leagues — percentile tiers | full | 4 |
| 4 | GAME-004 | Leaderboards — composite + per-canonical | full | 4 |
| 5 | GAME-005 | Canonical exercises & mapping | compact | 4 |
| 6 | GAME-006 | Anti-cheat — verified records | compact | 4 |
| 7 | GAME-007 | Trainer gamification | compact | 4.1 |
| 8 | GAME-008 | Pricing insights | compact | 4.1 |

**Фазовий порядок реалізації:** клієнт (GAME-001…006) → тренер + ціни (GAME-007/008) → гео-пули → монетизація. Деталі — § «Phasing».

---

## 1. Points & ledger [GAME-001]

**Phase:** 4 · **Стиль:** full

### Контекст

`users.points` уже існує як колонка, але нічого її не інкрементить. Робимо її **денормалізованим кешем** над append-only `points_ledger`, який є джерелом істини й дає аудит + ідемпотентність. Поінти нараховуються за завершене тренування, новий PR і майлстоуни стриків. Само-логовані тренування **рахуються** (поінти — про залученість, не про верифіковану силу).

### User stories

- **US-GAME-001** — *Як client, я хочу отримувати поінти за кожне завершене тренування, щоб бачити прогрес залученості.*
- **US-GAME-002** — *Як client, я хочу бонусні поінти за новий персональний рекорд.*
- **US-GAME-003** — *Як client, я хочу бачити історію нарахувань (за що скільки), щоб довіряти системі.*

### User flow + UI mapping

1. Клієнт завершує тренування (`POST /v1/sessions/{id}/workout-log/finish`) → backend емітить `SessionCompleted`.
2. `AwardSessionPointsListener` вставляє row у `points_ledger` (`reason=session_completed`, `dedup_key=session_completed:{session_id}:{user_id}`) і в **тій самій транзакції** робить `UPDATE users SET points = points + :amount`.
3. На кожен `PersonalRecordSet` → `AwardPrPointsListener` (`reason=pr_set`, dedup на PR id).
4. Стрик-майлстоуни (4/12/52 тижні поспіль) → `StreakMilestoneReached` → award + row у `achievements`.
5. Клієнт відкриває `AchievementsScreen` → `GET /v1/me/gamification` (баланс) і `GET /v1/me/points/ledger` (історія).
6. Кожне нарахування → `PointsAwarded` broadcast на `private-user.{id}` для живого оновлення бейджа.

### Acceptance criteria (Given/When/Then)

- **AC-1** — *Given* завершене тренування *When* `SessionCompleted` *Then* для кожного client-учасника створюється ledger row і `users.points` зростає на `config(gamification.points.session_completed)`.
- **AC-2** — *Given* той самий `SessionCompleted` доставлений двічі (at-least-once) *When* друга обробка *Then* `UNIQUE(dedup_key)` блокує дубль — поінти нараховані один раз.
- **AC-3** — *Given* новий PR *When* `PersonalRecordSet` *Then* award `points.pr_set`, dedup на `pr_set:{personal_record_id}`.
- **AC-4** — *Given* досягнуто 4-тижневий стрик *When* перевірка майлстоунів *Then* award + `achievements(key='streak_4')`, повторно не нараховується.
- **AC-5** — *Given* client *When* `GET /v1/me/points/ledger?cursor=&limit=` *Then* `200` cursor-paginated історія (DESC за `created_at`).
- **AC-6** — *Given* реверс (видалення сесії/скасування PR) *When* потрібно відкотити *Then* додається **негативний** ledger row (`reason=reversal`), `users.points` зменшується; рядки ніколи не оновлюються/видаляються.

### Permissions

| Роль | Читати свій баланс/ledger | Читати чужий | Нараховувати |
|---|---|---|---|
| Client | ✅ | ❌ | ❌ (тільки система) |
| Trainer | ✅ свій | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ (ручні корекції) |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Тренування завершено, потім видалено | reversal row компенсує награду |
| EC-2 | PR побитий, потім сет видалено й PR перераховано вниз | award за новий PR не відкочується (нагорода за досягнення в момент); лише явне скасування дає reversal |
| EC-3 | Груповá сесія (кілька client-учасників) | окремий ledger row + dedup_key на кожного учасника |
| EC-4 | Ручна адмін-корекція | ledger row `reason=admin_adjustment` з `metadata.admin_id` |

### Зв'язок з технічною спекою

- API: `GET /v1/me/points/ledger`, баланс через `GET /v1/me/gamification`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `points_ledger`, `users.points`
- Events: `../TECH_TASK.md` § Real-time → `PointsAwarded`, `StreakMilestoneReached`; хук `SessionCompleted`, `PersonalRecordSet`
- Config: `config/gamification.php` → `points.*`
- Listeners: `AwardSessionPointsListener`, `AwardPrPointsListener`, `EvaluateStreakMilestonesListener`

---

## 2. Scoring — consistency / strength / composite [GAME-002]

**Phase:** 4 · **Стиль:** full

### Контекст

Композитний бал — **домінує стабільність** + бонус за силу відносно інших. Клієнт, що тренується стабільно 2 роки, має ранжуватись вище за того, хто ходить 1 тиждень; водночас, хто піднімає більше за ~99% інших — отримує помітний буст. Усі ваги/константи — у `config/gamification.php` (тюнабельні без міграцій).

**Формули:**

```
consistency = w_long·log1p(active_weeks)            // тижні з ≥1 сесією від першої сесії
            + w_streak·streak_weeks                  // поточний стрик тижнів, capped
            + w_freq·sessions_per_active_week        // частота за трейлінг-вікно (12 тиж), capped
            + w_points·log1p(lifetime_points)
consistency *= exp(-days_since_last_session / tau)   // tau ≈ 21д → інактив знижує бал → демоушн

strength    = Σ_canonical ( strength_weight_c · percentile_c(best_verified_1rm) )
              / Σ_canonical strength_weight_c          // 0..1; топ-1% → ~0.99
              // для is_bodyweight вправ 1RM нормалізується по вазі тіла (body_measurements)

composite   = w_consistency · normalize(consistency) + w_strength · strength
              // напр. w_consistency = 0.75, w_strength = 0.25
```

`active_weeks`, `streak_weeks`, `sessions_per_active_week`, `lifetime_points`, `days_since_last_session` — це **per-user** величини (дешеві запити). `percentile_c` і `normalize(consistency)` — **популяційні**, тож беруться з останнього снапшота (GAME-004), не рахуються per-user.

### User stories

- **US-GAME-004** — *Як client, я хочу, щоб тривале регулярне тренування цінувалось найбільше.*
- **US-GAME-005** — *Як client, я хочу, щоб мій силовий результат відносно інших підвищував мій бал.*
- **US-GAME-006** — *Як client, я хочу, щоб бал природно знижувався, якщо я перестав тренуватись (інакше топ «застрягає» назавжди).*

### User flow + UI mapping

1. На `SessionCompleted` / `PersonalRecordSet` / `PointsAwarded` → `MarkGamificationDirtyListener` додає `user_id` у Redis-set `gamification:dirty`.
2. `GamificationScoreDrainJob` (cron `*/5 min`) дренить set, диспатчить `ComputeUserGamificationScoreJob(userId, role)` на чергу `low`.
3. Job перераховує consistency й strength (strength читає популяційні перцентилі з останнього `leaderboard_snapshots` batch), пише `gamification_scores.consistency_score|strength_score|composite_score|inputs|scored_at`.
4. Перцентиль композита й ліга призначаються окремо популяційним job-ом (GAME-003/004).
5. UI читає підсумок із `GET /v1/me/gamification` (один індексований рядок).

### Acceptance criteria

- **AC-1** — *Given* двоє клієнтів з однаковою силою, але різною тривалістю (104 vs 1 active_week) *Then* `composite` довшого істотно вищий (домінанта стабільності).
- **AC-2** — *Given* клієнт у топ-1% за verified 1RM канонічної вправи *Then* його `strength` для цієї вправи ≈ 0.99.
- **AC-3** — *Given* клієнт не тренувався 42 дні (`2·tau`) *Then* множник decay ≈ `e^-2 ≈ 0.135` → бал і ліга падають.
- **AC-4** — *Given* `frequency_factor` перевищує cap (грайнд) *Then* він обрізається до `config(consistency.freq_cap)`.
- **AC-5** — *Given* зміна ваг у `config/gamification.php` *Then* після наступного перерахунку бали відображають нові ваги без міграцій.
- **AC-6** — *Given* серія з 10 сетів за одне тренування *Then* завдяки debounce користувач перераховується один раз, не 10×.

### Permissions

| Роль | Доступ |
|---|---|
| Client | ✅ читає свій бал/складові |
| Trainer | ✅ свій (GAME-007) |
| Admin | ✅ усі |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Нема жодної сесії | `consistency=0`, `strength=0`, `composite=0`, ліга — найнижчий тір |
| EC-2 | Є PR, але всі само-логовані | `strength` рахується лише з verified → 0; consistency/поінти нараховані |
| EC-3 | Нема ваги тіла для bodyweight-вправи | bodyweight-нормалізація пропускається, береться абсолютний 1RM |
| EC-4 | Канонічних вправ у юзера нема | `strength=0`, бал визначається лише стабільністю |

### Зв'язок з технічною спекою

- DB: `../DB_STRUCTURE.md` § `gamification_scores`
- Config: `config/gamification.php` → `consistency.*`, `strength.*`, `composite.*`, `tau`
- Jobs: `GamificationScoreDrainJob` (scheduled), `ComputeUserGamificationScoreJob`
- Services: `ScoringService`
- Listeners: `MarkGamificationDirtyListener`

---

## 3. Leagues — percentile tiers [GAME-003]

**Phase:** 4 · **Стиль:** full

### Контекст

Ліги — **перцентильні тіри зі сталими назвами** (деревʼяна → платинова). Ліга юзера = у який перцентильний діапазон попадає його `composite_percentile` у межах пулу. Можна підніматись **і падати** (бо інактив знижує composite через decay). Тіри — конфіг-керовані рядки `league_tiers` (окремий набір на `subject_role`), діапазони тайлять `[0,1)` без проміжків.

**6 тірів (тюнабельні; верхні вужчі, щоб лишались амбітними):**

| Тір | key | ordinal | діапазон перцентиля |
|---|---|:-:|---|
| Деревʼяна | `wooden` | 1 | [0.00, 0.40) |
| Бронзова | `bronze` | 2 | [0.40, 0.65) |
| Срібна | `silver` | 3 | [0.65, 0.82) |
| Золота | `gold` | 4 | [0.82, 0.93) |
| Діамантова | `diamond` | 5 | [0.93, 0.99) |
| Платинова | `platinum` | 6 | [0.99, 1.00] |

### User stories

- **US-GAME-007** — *Як client, я хочу бачити свою лігу й перцентиль, щоб розуміти, де я серед усіх.*
- **US-GAME-008** — *Як client, я хочу бачити прогрес до наступного тіру, щоб мати ціль.*
- **US-GAME-009** — *Як client, я хочу отримати сповіщення про промоушн/демоушн.*

### User flow + UI mapping

1. `RebuildLeaderboardsJob` (GAME-004) рахує `composite_percentile` для пулу й join-ом по `league_tiers` визначає тір.
2. Під час атомарного swap-у порівнюється `ordinal` нового тіру з `previous_league_tier_id`.
3. ordinal ↑ → `LeaguePromoted`; ordinal ↓ → `LeagueDemoted`; обидва → `notifications` + FCM + broadcast на `private-user.{id}`.
4. UI: `LeagueScreen.tsx` (поточний тір, перцентиль, прогрес-бар до наступного, драбина 6 тірів) читає `GET /v1/me/gamification` + `GET /v1/leagues`.

### Acceptance criteria

- **AC-1** — *Given* `composite_percentile = 0.995` *Then* `league = platinum`.
- **AC-2** — *Given* перцентиль рівно на межі (`0.40`) *Then* потрапляє у верхній тір (`min` inclusive, `max` exclusive) → `bronze`.
- **AC-3** — *Given* перцентиль зріс через межу тіру між снапшотами *Then* `LeaguePromoted{from,to,percentile,rank}`.
- **AC-4** — *Given* перцентиль впав через межу *Then* `LeagueDemoted` (м'якша копія сповіщення).
- **AC-5** — *Given* `GET /v1/leagues?role=client` *Then* `200` з конфігом тірів (key/name/ordinal/bands/icon) для рендера драбини.
- **AC-6** — *Given* пул < `config(leagues.min_pool_size)` (напр. < 20) *Then* перцентилі нестабільні → усі в найнижчому тірі + прапор `provisional=true` у відповіді.

### Permissions

| Роль | Своя ліга | Конфіг тірів | Редагування тірів |
|---|---|---|---|
| Client | ✅ | ✅ (read) | ❌ |
| Trainer | ✅ (GAME-007) | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Новий юзер без даних | `wooden`, `provisional=true` доки не набереться історія/пул |
| EC-2 | Зміна меж тірів у конфігу | застосовується з наступним снапшотом; промо/демо-події на зсунутих межах |
| EC-3 | Ties у композиті | `percent_rank()` ділить ранг — однаковий бал = однаковий перцентиль = однаковий тір |

### Зв'язок з технічною спекою

- API: `GET /v1/leagues`, ліга в `GET /v1/me/gamification`
- DB: `../DB_STRUCTURE.md` § `league_tiers`, `gamification_scores.league_tier_id|previous_league_tier_id`
- Events: `LeaguePromoted`, `LeagueDemoted`
- Config: `config/gamification.php` → `leagues.tiers`, `leagues.min_pool_size`

---

## 4. Leaderboards — composite + per-canonical [GAME-004]

**Phase:** 4 · **Стиль:** full

### Контекст

Дві сімʼї таблиць лідерів, обидві **матеріалізовані** (precompute, не рахуються в рантаймі): **композитний** рейтинг (загальний бал) і **по канонічній вправі** (verified 1RM). На старті — лише пул `world`; модель пулу одразу розширювана (`scope_type` + `scope_id` для gym/city/region пізніше). Перцентилі рахуються **виключно в Postgres** одним set-based запитом, пишуться під новий `batch_id` й атомарно свопаються.

```sql
-- композитний борд, один scope/role
INSERT INTO leaderboard_snapshots (batch_id, board_type, scope_type, scope_id, subject_role,
                                   user_id, rank, score, percentile, league_tier_id)
SELECT :batch, 'composite', :scope_type, :scope_id, :role,
       user_id,
       row_number()  OVER w,
       composite_score,
       percent_rank() OVER w,
       (SELECT id FROM league_tiers t WHERE t.subject_role = :role
          AND percent_rank() OVER w >= t.min_percentile
          AND percent_rank() OVER w <  t.max_percentile)
FROM gamification_scores
WHERE scope_type = :scope_type AND scope_id IS NOT DISTINCT FROM :scope_id
  AND subject_role = :role
WINDOW w AS (ORDER BY composite_score);
-- потім: UPDATE gamification_scores SET rank, composite_percentile, league_tier_id,
--        previous_league_tier_id, pool_size, ranked_at FROM нового batch (атомарний swap).
```

### User stories

- **US-GAME-010** — *Як client, я хочу бачити світовий топ за загальним балом.*
- **US-GAME-011** — *Як client, я хочу таблицю рекордів по конкретній базовій вправі (напр. жим).*
- **US-GAME-012** — *Як client, я хочу бачити «ви тут» — мій ранг і сусідів, навіть якщо я не в топі.*

### User flow + UI mapping

1. `RebuildLeaderboardsJob(scope, role)` за розкладом (composite — щогодини на MVP / щодня off-peak; canonical — щодня). Canonical-борди білдяться **перед** composite (силовий суб-бал їх споживає).
2. UI `LeaderboardScreen.tsx`: таб «Загальний» → `GET /v1/leaderboards/composite?scope=world`; таб на вправу → `GET /v1/leaderboards/canonical/{key}`.
3. Рядок «ви тут» → `GET /v1/leaderboards/composite/me` (мій ранг + вікно rank-2..rank+2).
4. Пагінація — cursor = `rank` (range-scan по індексу, O(1) на сторінку незалежно від розміру пулу).

### Acceptance criteria

- **AC-1** — *Given* `GET /v1/leaderboards/composite?scope=world&limit=50` *Then* `200`, відсортовано за `rank`, `{ data:[{rank,user,score,percentile,league}], meta:{next_cursor,has_more} }`.
- **AC-2** — *Given* `GET /v1/leaderboards/canonical/bench_press` *Then* `200`, відсортовано за verified `estimated_1rm` DESC.
- **AC-3** — *Given* невідомий/неактивний canonical key *Then* `404 canonical_exercise_not_found`.
- **AC-4** — *Given* `GET /v1/leaderboards/composite/me` *Then* `200`, мій ранг + вузьке вікно сусідів.
- **AC-5** — *Given* запит під час перерахунку *Then* читач завжди бачить узгоджений попередній `batch_id` (atomic swap, без часткових даних).
- **AC-6** — *Given* користувач без verified-рекордів *Then* він **відсутній** у canonical-бордах, але присутній у composite.

### Permissions

| Роль | Composite world | Canonical world | Чужий профіль у борді |
|---|---|---|---|
| Client | ✅ | ✅ | лише публічні поля (name, avatar, league) |
| Trainer | ✅ (свій трек GAME-007) | ✅ | те саме |
| Admin | ✅ | ✅ | повний |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Користувач приватний / видалений | виключається з бордів (фільтр на побудові snapshot) |
| EC-2 | Великий пул (50k+) | один віконний сорт по індексу `(scope,role,composite_score DESC)`; гео-скоупи шардять роботу природно |
| EC-3 | Старі batch-и | `LeaderboardSnapshotPruneJob` лишає latest+1, решту чистить |
| EC-4 | Ties за 1RM | `row_number()` дає детермінований порядок (tie-break за `achieved_at` ASC) |

### Зв'язок з технічною спекою

- API: `GET /v1/leaderboards/composite`, `/v1/leaderboards/composite/me`, `/v1/leaderboards/canonical/{key}`, `/v1/leaderboards/canonical/{key}/me`
- DB: `../DB_STRUCTURE.md` § `leaderboard_snapshots`, `gamification_scores`
- Events: `LeaderboardRankChanged` (throttled)
- Jobs: `RebuildLeaderboardsJob`, `LeaderboardSnapshotPruneJob`

---

## 5. Canonical exercises & mapping [GAME-005]

**Phase:** 4 · **Стиль:** compact

### Контекст

`exercises` належать тренеру (`trainer_id`) — спільного каталогу нема, тож глобальний рейтинг «по вправі» неможливий без канонічних вправ. Вводимо **невеликий адмін-курований глобальний каталог** `canonical_exercises` (жим, присід, тяга, OHP, тяга в нахилі тощо). Тренерська вправа мапиться на ≤1 канонічну (`exercises.canonical_exercise_id`, nullable) — це єдиний міст приватних вправ у глобальні силові борди.

### User stories

- **US-GAME-013** — *Як trainer, я хочу повʼязати свою вправу з канонічною, щоб результати клієнтів потрапляли у світовий рейтинг.*
- **US-GAME-014** — *Як система, я хочу авто-пропонувати мапінг за назвою при створенні вправи.*

### Acceptance criteria

- **AC-1** — *Given* trainer редагує вправу *When* `PATCH /v1/exercises/{id}` з `canonical_exercise_id` *Then* `200`, мапінг збережено.
- **AC-2** — *Given* створення вправи з назвою «Bench Press» *Then* backend пропонує `canonical_exercise_id` (fuzzy name match), тренер підтверджує.
- **AC-3** — *Given* `GET /v1/canonical-exercises` *Then* `200` список активних канонічних вправ.
- **AC-4** — *Given* `canonical_exercise_id` неактивної/неіснуючої вправи *Then* `422`.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ мапить свої вправи; читає каталог |
| Client | ✅ read каталог |
| Admin | ✅ CRUD канонічних вправ |

### Edge cases

- **EC-1** — Канонічну вправу деактивовано → її борд ховається, мапінги лишаються (`ON DELETE SET NULL` тільки при видаленні).
- **EC-2** — Дві тренерські вправи мапляться на одну канонічну → нормально (агрегуються в борді через `personal_records`).

### Технічна спека

- API: `GET /v1/canonical-exercises`, `PATCH /v1/exercises/{id}` (поле `canonical_exercise_id`)
- DB: `../DB_STRUCTURE.md` § `canonical_exercises`, `exercises.canonical_exercise_id`

---

## 6. Anti-cheat — verified records [GAME-006]

**Phase:** 4 · **Стиль:** compact

### Контекст

Тренування можуть логуватись самим клієнтом (соло) — якщо такі рекорди йдуть у світовий рейтинг сили, це відкриває накрутки. **Гібрид:** само-лог рахується для поінтів / особистого прогресу / ліг (через consistency), АЛЕ силовий суб-бал і canonical-борди читають **лише верифіковані** (тренерські) рекорди. Прапор `is_trainer_verified` на сесії копіюється в сет при вставці й у PR при детекті — без дорогих join-ів у популяційному запиті.

### User stories

- **US-GAME-015** — *Як платформа, я хочу, щоб світові силові рейтинги відображали лише верифіковані тренером результати.*
- **US-GAME-016** — *Як client, що тренується соло, я все одно хочу рости в лізі через стабільність.*

### Acceptance criteria

- **AC-1** — *Given* тренерська сесія (`sessions.trainer_id` present, `is_trainer_verified=true`) *Then* її сети мають `workout_log_sets.is_verified=true`.
- **AC-2** — *Given* соло само-лог (сесія створена клієнтом, `is_trainer_verified=false`) *Then* сети `is_verified=false`.
- **AC-3** — *Given* PR з verified-сету *Then* `personal_records.is_verified=true`, потрапляє у canonical-борд і силовий суб-бал.
- **AC-4** — *Given* PR з unverified-сету *Then* показується клієнту як особистий рекорд + дає поінти, але **не** впливає на світову силу.
- **AC-5** — *Given* спроба підмінити прапор з клієнта *Then* `is_verified` встановлюється виключно сервером із джерела (session), клієнтський payload ігнорується.

### Permissions

| Роль | Доступ |
|---|---|
| Client | ✅ бачить свій `is_verified` статус рекорду |
| Trainer | ✅ його сесії — джерело верифікації |
| Admin | ✅ може ре-верифікувати/інвалідувати рекорд |

### Edge cases

- **EC-1** — Тренер приєднався до соло-сесії заднім числом → ре-верифікація рекорду через адмін/тренер-флоу (перерахунок canonical-борда наступним job).
- **EC-2** — Bodyweight-вправа без ваги тіла → у силовий бал іде абсолютний 1RM (нормалізація пропускається).
- **EC-3** — Аномально велика вага у verified-сесії → м'який anomaly-flag у `metadata` для адмін-рев'ю (не блокує, але позначає).

### Технічна спека

- DB: `sessions.is_trainer_verified`, `workout_log_sets.is_verified`, `personal_records.is_verified` + `canonical_exercise_id`
- Listeners: розширення `DetectPRListener` (стампить `is_verified` + `canonical_exercise_id` у PR)

---

## 7. Trainer gamification [GAME-007]

**Phase:** 4.1 · **Стиль:** compact

### Контекст

Тренери мають **власні** перцентильні ліги (`subject_role='trainer'`), та сама механіка, інший вхід балу: **# завершених тренувань**, **# активних клієнтів**, **рекорди клієнтів** (verified PR-и їхніх клієнтів). **Дохід виключено** — він вводиться вручну й піддається маніпуляції, тож несправедливий для рейтингу (рішення продукту).

### User stories

- **US-GAME-017** — *Як trainer, я хочу рости в лізі за обсяг роботи й результати клієнтів.*
- **US-GAME-018** — *Як trainer, я хочу бачити свій ранг серед тренерів.*

### Acceptance criteria

- **AC-1** — *Given* тренер завершив тренування *Then* його trainer-composite зростає (внесок # тренувань).
- **AC-2** — *Given* у клієнта тренера новий verified PR *Then* внесок «рекорди клієнтів» зростає.
- **AC-3** — *Given* дохід/`transactions` *Then* він **не** впливає на бал (виключено за дизайном).
- **AC-4** — *Given* `GET /v1/me/trainer-gamification` / `GET /v1/leaderboards/trainers?scope=world` *Then* `200`.

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ свій бал + борд тренерів |
| Client | ❌ (борд тренерів — окремий) |
| Admin | ✅ |

### Edge cases

- **EC-1** — Тренер з 0 активних клієнтів → бал лише з власних тренувань.
- **EC-2** — Клієнт пішов до іншого тренера → історичні рекорди лишаються за тренером на момент досягнення (snapshot-семантика).

### Технічна спека

- API: `GET /v1/me/trainer-gamification`, `GET /v1/leaderboards/trainers`
- DB: `gamification_scores` з `subject_role='trainer'`, `league_tiers` з `subject_role='trainer'`
- Config: `config/gamification.php` → `trainer.*`

---

## 8. Pricing insights [GAME-008]

**Phase:** 4.1 · **Стиль:** compact

### Контекст

Замість використання доходу в рейтингу — корисна підказка тренеру при встановленні ціни: показати, як його ціна співвідноситься з іншими (анонімно), на кшталт DOU при пошуку роботи («очікувана ЗП вища ніж у більшості»). Допомагає адекватно оцінювати ціни. Дані — **анонімні перцентильні агрегати** `package_templates.price` по валюті (й опційно `kind`), без показу чужих сум.

### User stories

- **US-GAME-019** — *Як trainer, при встановленні ціни пакета я хочу бачити, що вона «нижча ніж у 35% тренерів», щоб не недооцінити себе.*

### Acceptance criteria

- **AC-1** — *Given* trainer вводить ціну *When* `GET /v1/pricing-insights?currency=UAH&kind=count_based&price=1200` *Then* `200` з `{ sample_size, your_percentile, label_key, comparison:{p25,p50,p75} }`.
- **AC-2** — *Given* `sample_size < config(pricing.min_sample)` (напр. < 20) *Then* `{ insufficient_data: true }` (без показу).
- **AC-3** — *Given* будь-який запит *Then* **ніколи** не повертаються сирі ціни інших тренерів — лише перцентилі/букети.
- **AC-4** — *Given* агрегати застарілі *Then* `PricingInsightAggregateJob` (daily) їх оновлює (`percentile_cont`).

### Permissions

| Роль | Доступ |
|---|---|
| Trainer | ✅ |
| Client | ❌ |
| Admin | ✅ |

### Edge cases

- **EC-1** — Нова валюта з малою вибіркою → `insufficient_data`.
- **EC-2** — Викид (екстремальна ціна) → `percentile_cont` стійкий до викидів, додатково обрізаємо min/max відображення.

### Технічна спека

- API: `GET /v1/pricing-insights?currency=&kind=&price=`
- DB: `../DB_STRUCTURE.md` § `pricing_insight_aggregates`
- Jobs: `PricingInsightAggregateJob` (daily)
- Config: `config/gamification.php` → `pricing.min_sample`

---

## Events (нові) — `Gamification/Events`

| Event | Channel | Payload | Side-effects | Broadcast |
|---|---|---|---|:-:|
| `PointsAwarded` | `private-user.{id}` | `{amount,reason,total_points,source}` | mark dirty | ✅ |
| `StreakMilestoneReached` | `private-user.{id}` | `{streak_weeks,milestone}` | award + `achievements` | ✅ |
| `LeaguePromoted` | `private-user.{id}` | `{from_tier,to_tier,percentile,rank}` | notification + FCM | ✅ |
| `LeagueDemoted` | `private-user.{id}` | `{from_tier,to_tier,percentile}` | notification (soft) | ✅ |
| `LeaderboardRankChanged` | `private-user.{id}` | `{board_type,old_rank,new_rank}` | throttled | ✅ |

**Хук наявних подій:** `SessionCompleted` (→ award + dirty), `PersonalRecordSet` (→ award + stamp verified/canonical + dirty). Broadcast — best-effort; джерело істини — REST (клієнт може перечитати `GET /v1/me/gamification`).

## Jobs / Schedule (доповнення до cron-таблиці)

| Job | Розклад | Черга | Призначення |
|---|---|---|---|
| `GamificationScoreDrainJob` | `*/5 min` | low | дренить dirty-set → per-user scoring |
| `ComputeUserGamificationScoreJob` | on-demand | low | per-user consistency/strength/composite |
| `RebuildLeaderboardsJob` (composite) | hourly (MVP) / daily off-peak | low | популяційні перцентилі + ліги + swap |
| `RebuildLeaderboardsJob` (canonical) | daily 03:00 | low | bords по канонічних вправах (перед composite) |
| `PricingInsightAggregateJob` | daily | low | анонімні цінові перцентилі |
| `LeaderboardSnapshotPruneJob` | daily | low | чистка старих batch-ів (latest+1) |

## API summary (`/v1`, cursor-пагінація, RFC7807)

| Метод | Шлях | Опис |
|---|---|---|
| GET | `/me/gamification` | мій баланс, ліга, перцентиль, ранг, прогрес до тіру |
| GET | `/me/points/ledger?cursor=&limit=` | історія нарахувань |
| GET | `/leagues?role=client\|trainer` | конфіг тірів (драбина) |
| GET | `/leaderboards/composite?scope=world&cursor=&limit=` | світовий композитний топ |
| GET | `/leaderboards/composite/me` | мій ранг + сусіди |
| GET | `/leaderboards/canonical/{key}?cursor=&limit=` | топ по канонічній вправі |
| GET | `/leaderboards/canonical/{key}/me` | мій ранг у вправі + сусіди |
| GET | `/canonical-exercises` | каталог канонічних вправ |
| GET | `/me/trainer-gamification` | (GAME-007) бал тренера |
| GET | `/leaderboards/trainers?scope=world` | (GAME-007) топ тренерів |
| GET | `/pricing-insights?currency=&kind=&price=` | (GAME-008) перцентиль ціни |

## Config — `config/gamification.php` (тюнабельно без міграцій)

```php
return [
    'points' => ['session_completed' => 20, 'pr_set' => 15, 'streak_milestone' => 50],
    'consistency' => [
        'w_long' => 1.0, 'w_streak' => 0.5, 'w_freq' => 0.8, 'w_points' => 0.3,
        'tau_days' => 21, 'freq_window_weeks' => 12, 'freq_cap' => 6, 'streak_cap' => 52,
    ],
    'strength' => ['bodyweight_normalize' => true],
    'composite' => ['w_consistency' => 0.75, 'w_strength' => 0.25],
    'leagues' => [
        'min_pool_size' => 20,
        'tiers' => [ /* wooden..platinum: key,name,ordinal,min_percentile,max_percentile,icon */ ],
    ],
    'streak_milestones' => [4, 12, 26, 52], // weeks
    'pricing' => ['min_sample' => 20],
];
```

## Phasing

- **G0 — Client core (перша реалізація):** GAME-001…006. Міграції (canonical, points_ledger, gamification_scores, league_tiers+seed, leaderboard_snapshots, verification columns) → points/ledger → scoring → rebuild job + ліги + борди → read API + Reverb.
- **G1 — Trainer + pricing:** GAME-007, GAME-008.
- **G2 — Geo pools:** заповнити `scope_type`/`scope_id` (gym/city/region), фан-аут `RebuildLeaderboardsJob` по скоупах. Схема вже готова — потрібне лише джерело належності (gym membership) + мінімальна гео-модель.
- **G3 — Monetization hooks:** косметика ліг (рамки/бейджі), бустери видимості, преміум-аналітика рейтингу, спонсорські лідерборди залів. Архітектурні гачки лишаємо; реалізація — пізніше.

## Найризикованіше

1. **Популяційний перцентильний перерахунок** (віконний сорт `gamification_scores` + atomic swap) — головний perf/correctness ризик. Мітигація: single set-based statement, індекс `(scope,role,composite_score DESC)`, batch+swap, off-peak кадеданс.
2. **Наскрізна коректність `is_verified`** (session → set → PR → strength query): один пропущений копі-крок зливає само-лог у світову силу. Потрібні явні тести.
3. **Подвійне нарахування поінтів** під at-least-once delivery → `points_ledger.dedup_key` UNIQUE з першого дня.
4. **Циклічність strength ↔ canonical snapshot:** canonical-борди білдяться перед composite (eventual consistency прийнятна для денних ліг).
