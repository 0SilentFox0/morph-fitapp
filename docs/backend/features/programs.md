# Features — Programs

**Модуль:** Programs · **Phase:** 1 · **Файлів-сусідів:** [`../programs.md`](../programs.md) (technical)

2 фічі. Тренувальна програма — шаблон, який можна призначити одному або багатьом клієнтам.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | PRG-001 | Program management | full |
| 2 | PRG-002 | Program assignment to clients | full |

---

## 1. Program management [PRG-001]

**Phase:** 1 · **Стиль:** full

### Контекст

CRUD тренувальних програм у бібліотеці тренера. Програма складається з: name, description, обкладинки (image file), list вправ через [`EXR-002`](exercises.md), optional video gallery, тривалість (estimated duration), difficulty level. Counters: views, likes — для популярності в бібліотеці. Soft delete (programs можуть бути assigned до клієнтів).

### User stories

- **US-PRG-001** — *Як trainer, я хочу створити програму тренування з набором вправ і параметрами, щоб призначити її клієнтам.*
- **US-PRG-002** — *Як trainer, я хочу бачити свою бібліотеку програм у списку/grid з мініатюрами.*
- **US-PRG-003** — *Як trainer, я хочу редагувати програму — зміни **не каскадуються** на вже-assigned клієнтів (вони мають snapshot).*
- **US-PRG-004** — *Як trainer, я хочу бачити популярність моїх програм (views, likes).*
- **US-PRG-005** — *Як client, я хочу лайкнути програму тренера як bookmark.*

### User flow + UI mapping

1. **List:** `TrainingLibraryScreen.tsx` → `GET /v1/programs?cursor=&q=`. Grid карток з cover, name, video count, views, likes.
2. **Create:** `+` button → `AddToLibraryFormScreen.tsx` → форма (name, description, difficulty, estimated_duration_min, cover_file_id, video_file_ids, exercises[]).
3. Submit → `POST /v1/programs`. Backend:
   - Валідує (`name` 1-255, `difficulty` enum: beginner/intermediate/advanced, `duration` 1-360 min).
   - Створює `programs` row + (опційно) `program_exercises` через batch insert + (опційно) `program_videos` linkage.
   - Усе в DB transaction.
   - Респонс: `201` з `{ program }` (з nested exercises).
4. **View:** `ProgramDetailScreen.tsx` → `GET /v1/programs/{id}` → render full program. Backend increment `programs.views_count` async (через event `ProgramViewed` → throttled per user 1/24h).
5. **Edit:** "Edit" → `EditProgramScreen.tsx` → `PATCH /v1/programs/{id}` з diff.
6. **Like:** `POST /v1/programs/{id}/like` (toggle). Backend: UPSERT у `program_likes`. UNIQUE on `(program_id, user_id)`.
7. **Delete:** confirmation → `DELETE /v1/programs/{id}`. Backend: 
   - Якщо програма assigned до active `client_programs` → `409 has_active_assignments` з options: detach і delete, або archive.
   - Якщо не assigned — hard delete + cascade `program_exercises`, `program_videos`, `program_likes`.
   - Якщо archived — soft, `archived_at = now()`. Assigned клієнти зберігають доступ до snapshot.
8. **Gallery:** `GalleryScreen.tsx` показує video_files програми (через signed URLs з [`FIL-001`](files.md)).

### Acceptance criteria

- **AC-1** — *Given* trainer *When* `POST /v1/programs` з валідним body *Then* `201` з `{ program }`. Якщо включає `exercises: [{exercise_id, sets, reps, ...}]` — `program_exercises` створено через batch insert.
- **AC-2** — *Given* `cover_file_id` що не належить трендеру або не purpose=`exercise_video`/`avatar` *Then* `422`.
- **AC-3** — *Given* exercise_id в `exercises[]` що належить іншому trainer *Then* `403`.
- **AC-4** — *Given* trainer *When* `PATCH /v1/programs/{id}` з `{ name, description }` *Then* `200`. Існуючі `client_programs` НЕ змінюються (snapshot integrity).
- **AC-5** — *Given* program з 0 assignments *When* `DELETE /v1/programs/{id}` *Then* `204`, cascade delete.
- **AC-6** — *Given* program з 3 active assignments *When* `DELETE` *Then* `409 has_active_assignments` з `{ assignments_count: 3 }`. Дозволено `POST /v1/programs/{id}/archive` замість.
- **AC-7** — *Given* archived program *When* `GET /v1/programs` (default filter `archived=false`) *Then* не з'являється; з фільтром `archived=true` — з'являється.
- **AC-8** — *Given* archived program *When* trainer пробує assign до нового client *Then* `409 program_archived`.
- **AC-9** — *Given* user (trainer або client) *When* `POST /v1/programs/{id}/like` *Then* `200`, `likes_count` incremented; повторний → toggle off.
- **AC-10** — *Given* program *When* `GET /v1/programs/{id}` *Then* `200` з {... `views_count`, `likes_count`, `liked_by_me: bool` ...}.
- **AC-11** — *Given* `ProgramViewed` event від same user двічі в 24h *Then* `views_count` increment лише один раз (throttle через Redis dedup key).

### Permissions

| Роль | Read library | Create | Update | Delete/Archive | Like |
|---|---|---|---|---|---|
| Trainer | ✅ свої | ✅ | ✅ свої | ✅ свої | ✅ свої та чужі (post-MVP) |
| Client | ✅ assigned programs тільки | ❌ | ❌ | ❌ | ✅ assigned тільки |
| Admin | ✅ всі | ✅ за trainer'а (audit) | ✅ (audit) | ✅ (audit) | ✅ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Trainer редагує program, що assigned 50 клієнтам | Дозволено; `programs` оновлюється, але `client_programs.program_snapshot jsonb` зберігає оригінал (assigning час). Клієнти бачать своє. Опційно — trainer може trigger "push update to assignments" → нова версія copied у all client_programs (post-MVP) |
| EC-2 | View counter spam | Rate limit through dedup key `program_view:{program_id}:{user_id}:{date}` (24h TTL). Throttled increment via background job |
| EC-3 | Like toggle race | UNIQUE на `(program_id, user_id)`; race resolved via UPSERT (`ON CONFLICT DO UPDATE SET deleted_at = ...`) |
| EC-4 | Program без exercises (порожня) | Дозволено створити; clean library state. Frontend може показати warning |
| EC-5 | Cover image видалено з S3 | Frontend fallback на placeholder; backend Returns `cover_url: null` |
| EC-6 | Concurrent edit (trainer на двох devices) | Last-write-wins на JSON-level fields; для exercises — окремі endpoints (`PATCH /program-exercises/{id}` тощо) |

### Зв'язок з технічною спекою

- API: [`../programs.md`](../programs.md) § `GET /programs`, `POST /programs`, `GET /programs/{id}`, `PATCH /programs/{id}`, `DELETE /programs/{id}`, `POST /programs/{id}/archive`, `POST /programs/{id}/like`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `programs` (з `trainer_id`, `name`, `description`, `difficulty enum`, `estimated_duration_min`, `cover_file_id`, `views_count`, `likes_count`, `archived_at`); `program_exercises` (див. EXR-002); `program_videos` (через `media_files`); `program_likes` (з `(program_id, user_id)` UNIQUE)
- Events: `ProgramCreated`, `ProgramUpdated`, `ProgramArchived`, `ProgramDeleted`, `ProgramViewed`, `ProgramLiked`, `ProgramUnliked`
- Listeners: `IncrementViewCounterListener` (throttled), `IncrementLikeCounterListener`

---

## 2. Program assignment to clients [PRG-002]

**Phase:** 1 · **Стиль:** full

### Контекст

Тренер призначає програму конкретному клієнту → з'являється у client's home view (`GET /v1/me/programs` для client'а). Один client може мати кілька активних програм одночасно. Зняття призначення — soft (для історії).

Снапшот: при assignment program data копіюється у `client_programs.program_snapshot jsonb`, щоб подальші edit'и trainer'ської програми не псували клієнтський план.

### User stories

- **US-PRG-006** — *Як trainer, я хочу призначити програму одному або кільком клієнтам.*
- **US-PRG-007** — *Як trainer, я хочу побачити, кому з клієнтів призначена ця програма.*
- **US-PRG-008** — *Як trainer, я хочу зняти призначення (без видалення історії).*
- **US-PRG-009** — *Як client, я хочу бачити список своїх поточних програм у Home.*
- **US-PRG-010** — *Як client, я хочу бачити детальний план програми з вправами.*

### User flow + UI mapping

1. **Assign:** `ProgramDetailScreen.tsx` → "Assign to client" → modal з multi-select клієнтів → submit `POST /v1/programs/{id}/assign` з `{ client_ids: [1, 2, 3] }`.
2. Backend:
   - Перевіряє: всі `client_ids` належать тренеру.
   - Перевіряє: program не archived.
   - Для кожного `client_id`:
     - Перевіряє чи вже немає **активного** assignment (`client_programs.removed_at IS NULL`).
     - Якщо є — `409 already_assigned` з `{ existing_assignment_id }` (або skip + warning, configurable).
     - Створює `client_programs` row з `program_snapshot jsonb = JSON dump of program з exercises`.
   - Dispatch `ProgramAssigned` event (per client).
   - Респонс: `201` з `{ assignments: [...], skipped: [...] }`.
3. **Client view:** client у Home → `GET /v1/me/programs?status=active` → list активних `client_programs` з resolved snapshot data.
4. **Detail:** client tap на програму → `GET /v1/me/programs/{client_program_id}` → render з snapshot, не з live program (захист від змін).
5. **Unassign:** trainer → `DELETE /v1/client-programs/{id}` → `removed_at = now()` (soft). Client не бачить у active list.
6. **Re-assign archived:** trainer може повторно assign (creates new `client_programs` row); історія — окремі rows.

### Acceptance criteria

- **AC-1** — *Given* trainer T, program P з T, clients C1, C2 з T *When* `POST /v1/programs/{P.id}/assign` з `{ client_ids: [C1.id, C2.id] }` *Then* `201`, дві `client_programs` rows; snapshot identical for both.
- **AC-2** — *Given* `client_ids` містить чужого клієнта *Then* `403 forbidden_client`.
- **AC-3** — *Given* C1 уже має active assignment P *Then* `409 already_assigned` з options: skip або replace.
- **AC-4** — *Given* archived program *When* assign *Then* `409 program_archived`.
- **AC-5** — *Given* assignment *When* trainer редагує P *Then* `client_programs.program_snapshot` НЕ змінюється; client бачить original.
- **AC-6** — *Given* assignment *When* `DELETE /v1/client-programs/{id}` *Then* `200`, `removed_at = now()`. Client у `GET /v1/me/programs?status=active` не бачить.
- **AC-7** — *Given* client *When* `GET /v1/me/programs?status=active` *Then* `200` з list активних з resolved snapshot data (exercises з sets/reps/weight/video).
- **AC-8** — *Given* client *When* `GET /v1/me/programs/{client_program_id}` для свого assignment *Then* `200`. Чужого — `404`.

### Permissions

| Роль | Assign | List own's | List client's | Unassign | Read assignment detail |
|---|---|---|---|---|---|
| Trainer | ✅ свої програми до своїх клієнтів | — | ✅ для своїх клієнтів | ✅ свої | ✅ свої |
| Client | ❌ | ✅ свої | ❌ | ❌ | ✅ свої |
| Admin | ✅ (audit) | ✅ всіх | ✅ всіх | ✅ (audit) | ✅ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Trainer редагує снапшот, кoли клієнт уже виконав частину workout | Snapshot не зачіпається — клієнт продовжує по старій версії; trainer може створити нову assignment з updated програмою |
| EC-2 | Client отримав assignment, тренер видалив client'а (CLT-001 delete) — assignments cascade? | Cascade: `client_programs` для цього client → delete; client (як user) втрачає доступ до програми |
| EC-3 | Trainer удалив program (hard) → AC-5 в PRG-001 захищає (409 has_active_assignments) | Trainer мусить спочатку unassign all або archive program |
| EC-4 | Client логиниться вперше (через invitation), trainer призначив програму до того, як він зареєструвався | Pre-assign до `clients` без user_id — допустимо; коли client лінкується через `InvitationAccepted`, assignments стають доступними автоматично |
| EC-5 | Concurrent assign + unassign | DB-level lock на `(client_id, program_id)`; виграє останній |
| EC-6 | Snapshot містить deleted exercise (FK SET NULL у EXR-002 EC-1) | `program_snapshot` все одно містить `name_snapshot`, `sets`, etc. — програма залишається working |

### Зв'язок з технічною спекою

- API: [`../programs.md`](../programs.md) § `POST /programs/{id}/assign`, `GET /programs/{id}/assignments`, `DELETE /client-programs/{id}`, `GET /me/programs`, `GET /me/programs/{client_program_id}`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `client_programs` (з `client_id` FK CASCADE, `program_id` FK SET NULL, `assigned_at`, `removed_at`, `program_snapshot jsonb`)
- UNIQUE partial: `(client_id, program_id) WHERE removed_at IS NULL` — захист від AC-3
- Events: `ProgramAssigned`, `ProgramUnassigned`
- Notifications: `NotifyOnProgramAssigned` listener → push клієнту (через [`notifications.md`](notifications.md))

---

## Залежності модуля Programs

- **Залежить від:** Auth, Users (trainer/client), Exercises, Files (cover, videos), Clients (target of assignment), Notifications (push).
- **Залежать від нього:** Sessions (опційно session pulls program template), Workout Tracking (структура вправ з програми), Analytics (programs popularity metrics).
