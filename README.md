# FitConnect

A React Native (Expo) fitness platform with separate **trainer** and **client**
experiences — client management, programs, scheduling, live training, chat,
analytics and progress tracking — backed by the FitConnect API.

## Tech Stack

- **Framework:** Expo (~55) + React Native 0.83, React 19, TypeScript (strict mode)
- **Navigation:** React Navigation 7 (native-stack + bottom tabs; separate trainer/client tab trees)
- **State:** Zustand 5
- **Forms & validation:** react-hook-form + Zod
- **Networking:** custom `fetch` client + Zod-validated responses (see below)
- **Charts:** react-native-chart-kit
- **Storage:** AsyncStorage (token + persisted app state)
- **Testing:** Jest + jest-expo + @testing-library/react-native
- **Backend:** FitConnect API (PHP 8.4 / Laravel, Sanctum auth) — separate repo

## Architecture highlights

- **API layer** (`src/services/api/`): one typed service per domain over a custom
  `fetch` client with single-flight token refresh, 15s timeout, automatic
  `Idempotency-Key` on mutations, and an injected unauthorized handler. Every
  response is validated against Zod schemas (`src/schemas/api/`).
- **Reliability:** structured `logger` with a pluggable sink (crash-reporter ready),
  connectivity detection with an offline banner, and a cold-start retry screen that
  preserves the session on transient (non-401) failures.
- **Data fetching:** `useAsyncResource` + `<AsyncBoundary>` give every screen
  consistent loading / error+retry / empty states with request cancellation.
- **Mock fallback:** screens read `apiReadiness` flags via `withMockFallback`, so any
  endpoint not yet deployed on the backend transparently serves mock data.
- **State:** per-domain Zustand stores; auth state mirrors role + onboarding into the app store.

## Features

- **Auth:** login / register, token refresh, session restore, cold-start offline retry.
- **Onboarding:** 13-step trainer flow and a shorter client flow (backend-aware once deployed).
- **Home (trainer):** dashboard, training library, schedule, gallery, profile.
- **Schedule:** day / week / month views with vertical-swipe cycling and session management.
- **Training Library:** program list + create/edit program (draft) + exercise gallery.
- **Clients (CRM):** list, search, filters, extended profile, assigned programs.
- **Live training:** start-from-session, per-set logging, rest timer, multi-client switcher, summary.
- **Chat:** conversation list + thread (message / session-invite / system cards).
- **Stats:** business analytics (income, revenue split) + transactions (live) + add transaction.
- **Progress (client):** body-map heat map, volume charts, measurements, personal records.
- **Gamification:** leagues, leaderboards, achievements, points.

## Getting Started

```bash
npm install
npm start          # then press i (iOS) or a (Android)
```

The API base URL is read from `EXPO_PUBLIC_API_BASE_URL` (see `src/config/env.ts`),
defaulting to the hosted FitConnect backend.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run ios` / `npm run android` / `npm run web` | Run on a platform |
| `npm run export:web` | Build the web bundle (`dist/`) for deployment |
| `npm run lint` | ESLint (TS/React + import sorting + `import/no-cycle`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `npm run test:watch` | Unit tests (Jest) |
| `npm run test:integration` | Gated contract tests vs the live backend (`RUN_INTEGRATION=1`) |
| `npm run format` | Format with Prettier (printWidth 80) |

## Project Structure

```
src/
├── components/      # Reusable UI (ui/, layout/, icons/) incl. AsyncBoundary, EmptyState
├── screens/         # auth, onboarding, home, clients, stats, chat, client, training
├── navigation/      # Root + trainer/client tab trees, stack navigators
├── services/        # api/ (typed domain services + client), logger, mockFallback, analytics…
├── store/           # Zustand stores (auth, app, sessions, programs, chat, connectivity…)
├── hooks/           # data/ (useAsyncResource, useNetworkStatus), ui/, datetime/, training/
├── schemas/         # api/ (Zod models + envelopes), form schemas
├── utils/           # format/, training/, progress/, game/, common/  (barrel: src/utils)
├── config/          # env + apiReadiness flags
├── theme/           # design tokens (default export; see below), chart config
├── constants/  types/  mocks/
```

## Design System

Tokens live in `src/theme` and are consumed grouped:

```ts
import theme from '../theme';
const { colors, spacing, typography, radius } = theme;
```

| Token      | Hex     | Usage                        |
| ---------- | ------- | ---------------------------- |
| Accent1    | #A65F62 | Primary buttons, active nav  |
| Accent2    | #291113 | Availability card            |
| Secondary1 | #141414 | Main background              |
| Secondary2 | #1D1D1D | Cards, inputs                |
| Success    | #8BBB11 | Completed status             |
| Warning    | #E89A3C | Pending status               |
| Error      | #F37370 | Canceled status              |

## Testing

- **Unit:** `npm test` — services, stores, hooks, utils, and key screens/components.
- **Integration/contract:** `npm run test:integration` — runs only with `RUN_INTEGRATION=1`,
  exercises the live backend with a disposable account, and validates responses against the Zod schemas.

## Deployment

- **Web:** see [documentation/DEPLOYMENT.md](documentation/DEPLOYMENT.md) for Vercel setup.
