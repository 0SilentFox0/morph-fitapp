# FitConnect

A React Native (Expo) fitness trainer and client management platform.

## Tech Stack

- **Framework:** Expo with TypeScript (strict mode)
- **Navigation:** React Navigation 6 (stack + bottom tabs)
- **State:** Zustand
- **Forms:** react-hook-form + zod
- **Charts:** react-native-chart-kit

## Design System

| Token      | Hex     | Usage                        |
| ---------- | ------- | ---------------------------- |
| Accent1    | #A65F62 | Primary buttons, active nav  |
| Accent2    | #291113 | Availability card            |
| Secondary1 | #141414 | Main background              |
| Secondary2 | #1D1D1D | Cards, inputs                |
| Success    | #8BBB11 | Completed status             |
| Warning    | #E89A3C | Pending status               |
| Error      | #F37370 | Canceled status              |

## Getting Started

```bash
npm install
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator.

## Project Structure

```
src/
├── components/     # Reusable UI (Button, Input, Card, etc.)
├── screens/        # Screen components
│   ├── onboarding/
│   ├── main/
│   ├── clients/
│   └── stats/
├── navigation/     # React Navigation setup
├── store/          # Zustand stores
├── theme/          # Colors, typography, spacing
├── mocks/          # Mock data
└── types/
```

## Features

- **Onboarding:** 13-step trainer onboarding flow
- **Home:** Dashboard with revenue, training library, schedule
- **Schedule:** Month/day picker, session list, context menu
- **Training Library:** Program list, add form, gallery
- **Clients:** Client list, filters, profiles, programs
- **Stats:** Business analytics, transactions, achievements

## Scripts

- `npm start` - Start Expo dev server
- `npm run ios` - Run on iOS
- `npm run android` - Run on Android
- `npm run lint` - Run ESLint
- `npm run format` - Format with Prettier
