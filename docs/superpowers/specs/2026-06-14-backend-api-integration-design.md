# Дизайн: Інтеграція бекенду FitConnect API

**Дата:** 2026-06-14
**Гілка:** `refactor/architecture-cleanup`
**Статус:** затверджено для написання плану

## Контекст

Застосунок (Expo / React Native) сьогодні повністю керується моками: Zustand-стори
читають `src/mocks/data.ts`. Єдиний реальний мережевий виклик — `exerciseApi.ts` до
`wger.de`. `apiClient.ts` — це голий `fetch`-обгортка без авторизації. `config/env.ts`
за замовчуванням вказує на `wger.de` і читає `EXPO_PUBLIC_API_BASE_URL`. Файлу `.env`
немає (він у `.gitignore`). Екрана логіну немає — застосунок одразу стартує в моковому
онбордингу.

З'явився реальний бекенд: **Laravel + Sanctum (bearer-токен)** за адресою
`https://morph-server.desmait.tech/api/v1`. Документація (Swagger UI) — за
`/api/documentation`, сирий OpenAPI-спек — за `/docs?format=json`. **72 ендпоінти** у
11 доменах, **25 компонентних схем**.

## Мета цього етапу

Збудувати **фундамент інтеграції + повний типізований сервісний шар на всі 72
ендпоінти + екран логіну**. Бекенд стає повністю придатним до використання
(автентифікований, типобезпечні виклики) без переписування кожного екрана зараз.
Заміна моків на реальні дані по екранах — окремі подальші задачі.

## Контракт API (підтверджено зі спеку)

- **Базовий URL:** `https://morph-server.desmait.tech/api/v1`
- **Авторизація:** `sanctum`, схема `http bearer` → заголовок `Authorization: Bearer <access_token>`.
- **Конверти відповідей:**
  - один ресурс → `{ "data": { ... } }`
  - список → `{ "data": [ ... ] }`
  - курсорний список → `{ "data": [ ... ], "meta": { "next_cursor": string|null, "has_more": boolean } }`
  - помилка валідації (422) → `{ "message": string, "errors": { "<field>": string[] } }`
- **Логін** `POST /auth/login` ← `{ email, password, device_label? }` → `{ data: TokenResponse }`,
  де `TokenResponse = { access_token, refresh_token, expires_at (date-time), token_type }`.
- **Публічні ендпоінти (без security):** `POST /auth/login`, `/auth/register`,
  `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`,
  `/auth/confirm-email-change`. Решта 86 операцій вимагають bearer-токен.
- **Модель `User`** (з `/me`): `{ id (uuid), email, name, avatar_url?, role: 'client'|'trainer', timezone?, locale?, currency?, points?, experience?, certifications?[] }`.

## Архітектура

Підхід **A — рукописний типізований сервісний шар + Zod** (обраний серед трьох:
A — рукописний; B — codegen openapi-typescript/orval; C — тонкий нетипізований клієнт).
A узгоджується з наявною конвенцією репозиторію (`exerciseApi.ts` + `src/schemas`),
повністю tree-shakeable, без кроку кодогенерації; слабкі `data: object` місця спеку не
змушують породжувати погані типи.

### Карта модулів

```
.env                         (новий, у .gitignore)  EXPO_PUBLIC_API_BASE_URL=…/api/v1
.env.example                 (новий, комітиться)
src/config/env.ts            змінити дефолт → morph-server /api/v1; зберегти EXPO_PUBLIC_ префікс
src/services/
  apiClient.ts               ЗАЛИШАЄТЬСЯ БЕЗ ЗМІН (legacy wger.de — див. рішення №1)
  api/
    client.ts                новий клієнт з авторизацією
    tokenStore.ts            persist access/refresh/expires у AsyncStorage; single-flight refresh
    auth.ts users.ts clients.ts clientInvitations.ts packages.ts programs.ts
    sessions.ts workouts.ts exercises.ts progress.ts chat.ts transactions.ts notifications.ts
    index.ts                 ре-експорт усього шару
src/schemas/api/
    models.ts                Zod для 25 компонентних схем
    envelope.ts              dataEnvelope(schema), paginated(schema), парсер ValidationError
src/store/authStore.ts       status: loading|unauthenticated|authenticated; user; login/register/logout/loadSession
src/screens/auth/
    LoginScreen.tsx          email + password, посилання на реєстрацію
src/navigation/AuthNavigator.tsx
src/navigation/RootNavigator.tsx   шлюз автентифікації
```

### `client.ts` — клієнт з авторизацією

Сигнатура на кшталт `request<T>(method, path, { body?, query?, schema?, auth? })`:

- Базовий URL з `env` (окремий від legacy wger).
- Вставляє `Authorization: Bearer <accessToken>`, коли `auth !== false` (дефолт `true`).
- Тайм-аут через `AbortController` (повторно використати патерн із `apiClient.ts`).
- Розгортає конверт: повертає `data`; для курсорних списків повертає `{ data, meta }`.
- 422 → кидає `ApiError` з `message` + `fieldErrors: Record<string,string[]>`.
- Інші не-2xx → `ApiError` з повідомленням.
- Опційна Zod-валідація `data` (як у `exerciseApi.parseResponse`).
- **401-обробка (single-flight refresh):** на 401 для будь-якого виклику, окрім
  `/auth/login` та `/auth/refresh`, виконується один `POST /auth/refresh` із
  `refresh_token`, оригінальний запит повторюється один раз. Якщо refresh падає —
  токени очищаються, `authStore` переходить у `unauthenticated`. Паралельні 401
  чекають на той самий refresh (зберігаємо проміс, щоб не було «штампування»).

### `tokenStore.ts`

In-memory кеш + AsyncStorage. API: `getAccessToken()`, `getRefreshToken()`,
`setTokens(TokenResponse)`, `clear()`, `load()` (гідрація на старті). Зберігає
single-flight-проміс рефрешу, щоб уникати конкурентних рефрешів.

### `authStore.ts` (zustand)

`status: 'loading' | 'unauthenticated' | 'authenticated'`, `user: User | null`.
Дії: `login(email, password)`, `register(...)`, `logout()`, `loadSession()`.
На старті застосунку `loadSession()` гідрує токени і тягне `/me`; роль користувача
синхронізується в `appStore.userRole`.

### Сервісний шар

Один модуль на домен; функції повертають типізовані результати, валідовані Zod.
Покриває всі 72 ендпоінти, згруповані за тегами OpenAPI:

| Модуль | Домени/ендпоінти |
|---|---|
| `auth.ts` | 11 ендпоінтів `/auth/*` |
| `users.ts` | `/me`, `/me/avatar`, `/me/settings`, `/me/onboarding*`, `/users/{id}` |
| `clients.ts` | `/clients*` (CRUD, archive, restore, invite, measurements, PR) |
| `clientInvitations.ts` | `/client-invitations/*` |
| `packages.ts` | `/client-packages*`, `/package-templates*` |
| `programs.ts` | `/programs*`, `/client-programs/*` |
| `sessions.ts` | `/sessions*`, `/session-series`, `/sessions/schedule` |
| `workouts.ts` | `/workout-logs*`, `/workout-log-sets/*`, `/sessions/{id}/workout` |
| `exercises.ts` | `/exercises*` (новий бекенд, окремо від wger) |
| `progress.ts` | вимірювання та персональні рекорди клієнта |
| `chat.ts` | `/conversations*`, `/messages/*` |
| `transactions.ts` | `/transactions*`, `/withdrawals*` |
| `notifications.ts` | `/notifications*`, `/device-tokens*` |

### Екран логіну + навігація

`LoginScreen` — мінімальний email/password з посиланням на реєстрацію; помилки 422
показуються під полями. `AuthNavigator` — стек для auth-екранів.

`RootNavigator` стає шлюзом:
- `status === 'loading'` → splash/заставка
- `unauthenticated` → `AuthNavigator`
- `authenticated && !isOnboarded` → наявний `OnboardingNavigator`
- інакше → таб-дерево за `user.role` (`ClientTabNavigator` / `MainTabNavigator`)

## Ключові рішення

1. **wger лишається окремо.** `exerciseApi.ts` використовує `apiFetch` із
   `API_BASE_URL`=wger. Перенацілення дефолта зламало б екрани вправ. Тому **новий**
   бекенд отримує власний `src/services/api/client.ts` (власний базовий URL з env), а
   legacy `apiClient.ts` лишається з wger. Жоден наявний екран не ламається.
2. **Роль із `/me`**, а не з мокового перемикача — на логіні/гідрації сесії `user.role`
   керує `appStore.userRole`. Наявний онбординг збережено (auth шлюзує *до* нього).
3. **Refresh — single-flight** (див. `client.ts`).
4. **Тестування:** jest-юніт-тести на `client.ts` (розгортання конверта,
   401→refresh→retry, парсинг 422), `tokenStore`, `authStore` і один репрезентативний
   сервіс із замоканим `fetch` — у стилі наявного тест-сетапу.

## Поза межами цього етапу (подальші задачі)

- Заміна моків на реальні дані по конкретних екранах (clients, sessions, programs тощо).
- Екрани forgot/reset password, verify-email, прийняття запрошення за кодом.
- Push-нотифікації (реєстрація device-token є в шарі, інтеграція з нативом — окремо).
- WebSocket/реалтайм для чату (API — REST-polling).

## Критерії успіху

- `EXPO_PUBLIC_API_BASE_URL` додано в `.env` (+ `.env.example` у репо); дефолт у
  `env.ts` указує на morph-server.
- Можна автентифікуватися через `LoginScreen`; токен зберігається й переживає
  перезапуск; `/me` повертає профіль; роль керує таб-деревом.
- Будь-який із 72 ендпоінтів можна викликати типобезпечно через `src/services/api`.
- 401 прозоро рефрешиться; провал рефрешу розлогінює.
- `yarn typecheck`, `yarn lint`, `yarn test` — зелені.
