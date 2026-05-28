# Features — Files & Media

**Модуль:** Files & Media · **Phase:** 0 · **Файлів-сусідів:** `files.md` (TBD) (technical), [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md)

1 фіча, що покриває весь pipeline завантаження, обробки і delivery медіа-файлів (аватари, exercise videos, chat media).

| # | Код | Назва | Стиль |
|:-:|---|---|:-:|
| 1 | FIL-001 | File upload pipeline | full |

---

## 1. File upload pipeline [FIL-001]

**Phase:** 0 · **Стиль:** full

### Контекст

Загальний механізм завантаження файлів у S3-сумісне сховище з контролем доступу. Підтримує:

- **Аватари** (jpg/png, ≤ 5 MB) — public-read.
- **Exercise videos** (mp4/mov, ≤ 200 MB) — public-read.
- **Chat media** (фото jpg/png/webp ≤ 10 MB, відео mp4 ≤ 100 MB, документи pdf/doc/xls/docx/xlsx ≤ 20 MB) — private, доступ лише через signed URL для учасників conversation.

Підхід — **two-phase upload**:
1. Клієнт запитує signed upload URL (`POST /v1/files/upload-url`) → backend створює `media_files` row зі статусом `pending` і повертає URL.
2. Клієнт PUT файл напряму до S3 через цей URL.
3. Клієнт повідомляє про завершення (`POST /v1/files/{id}/complete`) → backend перевіряє існування об'єкта в S3, оновлює `media_files.status = ready`, при потребі — enqueue процесинг (resize thumbnails для image).

Цей підхід знімає навантаження з backend (файл не проходить через app server) і дає кращу UX (progress bar).

### User stories

- **US-FIL-001** — *Як trainer, я хочу завантажити відео для вправи без чекання, поки backend його обробить.*
- **US-FIL-002** — *Як trainer чи client, я хочу надіслати фото в чат — інша сторона отримує його швидко.*
- **US-FIL-003** — *Як user, я хочу мати thumbnail для медіа в списках чату/exercise library — без завантаження повного файлу.*
- **US-FIL-004** — *Як адмін системи, я хочу автоматичне очищення orphan-файлів (upload, що не завершився).*

### User flow + UI mapping

1. **Pre-signed URL request:** клієнт (`ChatScreen.tsx`, attach button → `expo-image-picker`) → `POST /v1/files/upload-url` з `{ purpose, mime, size, original_name }`.
2. Backend:
   - Валідує: `purpose` ∈ {`avatar`, `exercise_video`, `chat_media`}; `mime` / `size` обмеження per purpose.
   - Генерує S3 key (`<purpose>/<user_id>/<uuid>.<ext>`).
   - Створює `media_files` row: `id`, `owner_id`, `purpose`, `mime`, `size`, `s3_key`, `status: pending`, `created_at`. Опційно `context` (наприклад `{ conversation_id, exercise_id }`) для access control later.
   - Генерує **presigned PUT URL** (TTL 15хв) до S3 з obov'якiv content-type/content-length.
   - Респонс: `{ file_id, upload_url, upload_method: "PUT", upload_headers: { "Content-Type": "...", "Content-Length": "..." }, expires_in: 900 }`.
3. **Upload to S3:** клієнт PUT файл напряму, з progress callbacks.
4. **Confirm completion:** `POST /v1/files/{file_id}/complete`.
5. Backend:
   - Verify S3 object exists (HEAD request).
   - Перевіряє `size` фактичний vs очікуваний (захист від size-cheat).
   - Set `media_files.status = ready`, `media_files.uploaded_at = now()`.
   - Якщо `purpose = avatar` або `exercise_video` (image part) → enqueue `GenerateThumbnailsJob`.
   - Видає event `FileReady` (cross-module: chat picks up для broadcasting MessageSent з media).
   - Респонс: `{ id, url_or_signed_url, thumbnail_url (null поки), metadata }`.
6. **Read flow:**
   - Public files (аватари, exercise videos): public S3 URL у response.
   - Private files (chat media): backend перевіряє permission (учасник conversation?) і генерує **presigned GET URL** (TTL 15хв) per request. Endpoint: `GET /v1/files/{id}/signed-url`.
7. **Cleanup:** `FilesCleanupJob` (scheduled daily 04:30):
   - Знаходить `media_files` з `status = pending` і `created_at < now() - 7 days` → видаляє S3 object + DB row.
   - Знаходить `status = ready`, але `not referenced` (orphan: avatar replaced, conversation deleted, exercise deleted) → видаляє.

### Acceptance criteria

- **AC-1** — *Given* logged-in user *When* `POST /v1/files/upload-url` з валідним `{ purpose: "chat_media", mime: "image/jpeg", size: 1500000 }` *Then* `200` з `{ file_id, upload_url, upload_headers, expires_in: 900 }`. `media_files` row створено зі status `pending`.
- **AC-2** — *Given* invalid `mime` для purpose (е.g. `application/exe` для `chat_media`) *Then* `422 mime_not_allowed`.
- **AC-3** — *Given* `size` > limit per purpose *Then* `422 file_too_large` з полем `errors.size = ["Max 10485760 bytes for chat_media"]`.
- **AC-4** — *Given* pending file, S3 PUT успішний *When* `POST /v1/files/{id}/complete` *Then* `200`, status `ready`, event `FileReady` видано.
- **AC-5** — *Given* S3 object не існує (клієнт упав до upload) *When* `POST /v1/files/{id}/complete` *Then* `404 upload_not_found`. `media_files` row позначено `status = failed`.
- **AC-6** — *Given* S3 size відрізняється від оголошеного > 5% *Then* `422 size_mismatch`. Object видаляється; row → `failed`.
- **AC-7** — *Given* private file (chat_media) *When* user-учасник conversation викликає `GET /v1/files/{id}/signed-url` *Then* `200` з URL TTL 15хв.
- **AC-8** — *Given* user НЕ учасник conversation *When* `GET /v1/files/{id}/signed-url` *Then* `403`.
- **AC-9** — *Given* `purpose = avatar`, ready file *When* `GenerateThumbnailsJob` завершився *Then* `media_files.thumbnails` jsonb має `{ "120": "...", "240": "..." }` URLs.
- **AC-10** — *Given* pending файл старіший за 7 днів *When* `FilesCleanupJob` runs *Then* S3 object і DB row видалено.

### Permissions

| Роль | Request upload URL | Complete upload (own) | Read public file | Read private file (chat) | Delete file |
|---|---|---|---|---|---|
| Trainer | ✅ | ✅ | ✅ | ✅ (учасник) | ✅ свої |
| Client | ✅ | ✅ | ✅ | ✅ (учасник) | ✅ свої |
| Admin | ✅ | ✅ за будь-кого | ✅ | ✅ (з audit) | ✅ |

### Edge cases

| # | Сценарій | Поведінка |
|---|---|---|
| EC-1 | Клієнт upload'нув файл, але `complete` не викликав (app crashed) | `FilesCleanupJob` через 7 днів очистить orphan |
| EC-2 | Клієнт upload'нув з різним content-type ніж заявлений | S3 policy `Content-Type` хедер у signed URL = expected; S3 reject upload, якщо не збігається |
| EC-3 | Великий video upload — клієнт втратив з'єднання | Frontend має retry на тому самому URL (TTL 15хв) з resume; якщо expired — request новий URL з тим самим `file_id`? Ні: новий request створює нову `media_files` row; стара cleanup'не |
| EC-4 | Подвійний `complete` (network retry) | Idempotent: повторний виклик повертає той самий response (200) без re-enqueue job |
| EC-5 | Thumbnail generation падає | Retry job 3× з backoff. Після — file залишається без thumbnails; UI fallback на full image |
| EC-6 | Користувач видалив conversation; chat_media files мають FK на conversation | FK ON DELETE SET NULL у `media_files.conversation_id`; orphan детектується cleanup'ом |
| EC-7 | Avatar replaced — старий файл treba очистити | При `POST /me/avatar` старий S3 object видаляється синхронно; якщо delete S3 падає — async retry через `OrphanFileCleanupJob` (не плутати з general cleanup) |
| EC-8 | S3 bucket недоступний (outage) | App повертає `503 storage_unavailable` для upload-url request; existing public-read links продовжують працювати (CDN cache) |
| EC-9 | Malicious upload: фейковий image з PHP-payload (поліглот) | S3 не виконує файли; usage — лише через signed URL (не direct execution). Додатково: server-side scan-on-read (post-MVP, через Lambda або equivalent) |

### Зв'язок з технічною спекою

- API: `files.md` (TBD) § `POST /files/upload-url`, `POST /files/{id}/complete`, `GET /files/{id}/signed-url`, `DELETE /files/{id}`
- DB: [`../DB_STRUCTURE.md`](../DB_STRUCTURE.md) § `media_files` (з `purpose`, `mime`, `size`, `s3_key`, `status`, `thumbnails jsonb`, `context jsonb`, `owner_id`, `conversation_id`, `exercise_id`, `message_id` — soft FK)
- Events: `FileUploadRequested`, `FileReady`, `FileFailed`, `FileDeleted`
- Jobs: `GenerateThumbnailsJob` (queue `default`), `FilesCleanupJob` (scheduled daily 04:30), `OrphanFileCleanupJob` (queue `low`)
- Config: `config/filesystems.php` (S3 driver), `config/files.php` (limits, mime whitelist per purpose)

### S3 bucket policy (рекомендована)

- Окремий bucket per environment.
- Public-read prefix: `avatars/`, `exercise-videos/`.
- Private prefix: `chat-media/`, `data-exports/`.
- CORS: дозволити `PUT` з origin'ів додатка.
- Lifecycle:
  - `pending-uploads/`: видалити через 7 днів.
  - `chat-media/`: переміщати в cold storage (S3 IA) через 90 днів (post-MVP).
- Versioning: enabled (backup safety).

---

## Залежності модуля Files

- **Залежить від:** Auth (через owner_id), S3 storage.
- **Залежать від нього:** Users (avatar), Exercises (video), Chat (media), Auth (data export ZIP), Progress (CSV export).
