# Features — Users & Profile

**Модуль:** Users & Profile · **Phase:** 0 · **Файлів-сусідів:** [`../users.md`](../users.md) (technical), [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md)

1 фіча, що покриває керування власним профілем і перегляд чужих профілів.

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | USR-001 | Profile management | compact |

---

## 1. Profile management [USR-001]

**Phase:** 0 · **Стиль:** compact

### Контекст

Профіль користувача — central entity платформи. Тренер бачить свій профіль (з повним набором полів: bio, experience, certifications, training_types, locations, work_schedule) і профілі своїх клієнтів (обмежений view). Клієнт бачить свій профіль і профілі своїх тренерів (public view). Поля профіля editable owner'ом; завантаження аватара — окремий endpoint. Налаштування (timezone, locale, notification preferences) — частина профіля.

### User stories

- **US-USR-001** — *Як користувач, я хочу переглянути і редагувати свій профіль.*
- **US-USR-002** — *Як trainer, я хочу переглянути профіль свого клієнта (з обмеженням до polя, які клієнт зробив видимими).*
- **US-USR-003** — *Як client, я хочу побачити публічний профіль тренера, з яким працюю.*
- **US-USR-004** — *Як користувач, я хочу завантажити/змінити аватар.*
- **US-USR-005** — *Як користувач, я хочу налаштувати timezone, мову інтерфейсу і preferences по push-уведомленнях.*

### Acceptance criteria

- **AC-1** — *Given* logged-in user *When* `GET /v1/me` *Then* `200` з повним JSON profile (включаючи private fields).
- **AC-2** — *Given* logged-in user *When* `PATCH /v1/me` з допустимими полями *Then* `200`, оновлено лише надіслані поля. Validation per field (`name` length 1-255, `bio` ≤ 1000, `timezone` IANA-valid).
- **AC-3** — *Given* trainer T і client C, де C ∈ T's roster *When* T викликає `GET /v1/users/{C.id}` *Then* `200` з public+trainer-visible полями (name, avatar, age, goals, body_measurements visible_to_trainer). Інше — приховано.
- **AC-4** — *Given* trainer T і client C, де C ∉ T's roster *Then* `403 not_authorized`.
- **AC-5** — *Given* client *When* `GET /v1/users/{trainerId}` для свого тренера *Then* `200` з public-полями trainer'а (name, avatar, bio, experience, training_types, certifications).
- **AC-6** — *Given* user *When* `POST /v1/me/avatar` з multipart-file (jpg/png ≤ 5 MB) *Then* `200` з `{ avatar_url }`. Старий avatar файл видаляється з S3.
- **AC-7** — *Given* user *When* `PATCH /v1/me/settings` з `{ timezone, locale, notification_preferences }` *Then* `200`, settings збережено; наступні push'і використовують нові preferences.

### Permissions

| Роль | Read own | Read other (trainer↔client) | Read other (stranger) | Write own | Write other |
|---|---|---|---|---|---|
| Trainer | ✅ повний | ✅ свій клієнт (обмежений view) | ❌ | ✅ | ❌ |
| Client | ✅ повний | ✅ свій тренер (public view) | ❌ | ✅ | ❌ |
| Admin | ✅ будь-який | ✅ будь-який | — | ✅ будь-який (audit) | ✅ |

### Edge cases

- **EC-1** — Avatar > 5 MB або wrong mime: `422 file_too_large` / `422 mime_not_allowed`. Frontend має робити client-side image compression перед upload.
- **EC-2** — Invalid timezone string: `422 timezone_invalid` (валідація через PHP `DateTimeZone::listIdentifiers`).
- **EC-3** — Race: одночасний PATCH з frontend і admin panel — last-write-wins; рекомендовано optimistic locking через `If-Match: <etag>` header (post-MVP).
- **EC-4** — Read profile soft-deleted (pending hard delete) user'а: name = "Deleted user", avatar = placeholder; `deleted: true` flag в response.

### Технічна спека

- API: [`../users.md`](../users.md) § `GET /me`, `PATCH /me`, `GET /users/{id}`, `POST /me/avatar`, `PATCH /me/settings`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `users` (всі поля профіля + `timezone`, `locale`, `notification_preferences jsonb`)
- Events: `ProfileUpdated`, `AvatarChanged`, `SettingsUpdated`
- Залежності: Files (для аватара upload pipeline)
