# FitApp Audit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реалізувати всі фікси з аудиту `docs/AUDIT_2026-05-28.md` — від quick wins до архітектурних змін, у послідовності що мінімізує конфлікти й дає шипабельний код на кожному кроці.

**Architecture:** Робота розділена на 5 фаз. Кожна фаза = окремий PR (можна об'єднати дрібні). Фази впорядковані: квік-вінс (нульовий ризик) → перфоманс (локальні зміни) → критична архітектура (persistence, error boundary, draft-lifecycle) → UI-декомпозиція (більший рефактор) → polish.

**Tech Stack:** Expo 55, React Native 0.83, React 19, TypeScript (strict), Zustand 5, React Navigation 7, react-hook-form 7.71 + zod 4.3 (вже у package.json, але не використовуються), react-native-safe-area-context, AsyncStorage (буде додано в Phase 3).

**Verification без тестів:** Проект не має Jest. Кожен task верифікується через: (1) `npx tsc --noEmit`, (2) `npm run lint`, (3) для UI-змін — `npm start` + ручне натискання на симуляторі, (4) grep на патерни що мали зникнути.

**Branching strategy:** Гілка `refactor/audit-phaseN-<topic>` на фазу. Якщо PR розростається — розбити на під-PR за номером task.

---

## File Map

**Нові файли:**
- `src/utils/date.ts` — `formatDate`, `formatTime`
- `src/utils/validation.ts` — пере-форма-валідатори (тимчасово, до react-hook-form)
- `src/constants/training.ts` — `TRAINING_TYPES`, `SET_NOTES`, `EXERCISE_CATEGORIES`
- `src/theme/radius.ts` — токени радіусів
- `src/config/env.ts` — API URL та env-flags
- `src/services/apiClient.ts` — fetch з timeout (shared)
- `src/services/storage.ts` — AsyncStorage adapter для zustand persist
- `src/schemas/exerciseApi.ts` — zod-схеми API-відповідей
- `src/components/ErrorBoundary.tsx` — global error boundary
- `src/components/ui/ChoiceCard.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/SectionHeader.tsx`
- `src/components/ui/StatusBadge.tsx`
- `src/components/ui/ParticipantGroup.tsx`
- `src/components/ui/ExerciseCard.tsx` — винесений з AddToLibraryFormScreen
- `src/screens/home/screens/SessionForm/DateTimePickerSection.tsx`
- `src/screens/home/screens/SessionForm/ParticipantsSection.tsx`
- `src/screens/home/screens/SessionForm/ProgramSelectorSection.tsx`
- `src/screens/home/screens/SessionForm/TypeSelectorSection.tsx`
- `src/screens/home/screens/SessionForm/index.tsx` — orchestrator (заміна SessionFormScreen)

**Модифіковані файли (основні):**
- `tsconfig.json` — додати strict-прапори
- `package.json` — додати `@react-native-async-storage/async-storage`
- `App.tsx` — обгорнути в ErrorBoundary
- `src/theme/index.ts` — експорт radius
- `src/theme/spacing.ts` — НЕ змінюємо (radius окремо)
- `src/store/appStore.ts` — persist middleware
- `src/store/onboardingStore.ts` — persist middleware + `currentStepIndex`
- `src/store/draftProgramStore.ts` — persist (опційно)
- `src/store/exerciseStore.ts` — typed catch, deduplication, retry
- `src/services/exerciseApi.ts` — використати apiClient + zod
- `src/store/chatStore.ts:81` — використати утиліту з `utils/date.ts`
- `src/screens/home/screens/SessionFormScreen.tsx` — повна декомпозиція
- `src/screens/home/screens/AddToLibraryFormScreen.tsx` — винести ExerciseCard, useShallow
- `src/screens/home/screens/GalleryScreen.tsx` — FlatList opt-props, useMemo
- `src/screens/home/screens/CardioClassFormScreen.tsx` — використати mockClients з store
- `src/screens/onboarding/steps/ChooseRoleScreen.tsx`, `TrainingTypesScreen.tsx`, `HaveProgramsScreen.tsx`, `ExperienceScreen.tsx` — ChoiceCard
- `src/screens/home/screens/TrainingLibraryScreen.tsx`, `chat/ChatListScreen.tsx` — EmptyState
- `src/components/ui/ScheduleCard.tsx` — винести ParticipantGroup, StatusBadge
- `src/components/ui/index.ts` — re-exports

---

# Phase 1 — Quick Wins (1 day, 1 PR)

Прибирає дублі коду й покращує error-handling. Нульовий ризик регресій.

---

### Task 1: Date utilities

**Files:**
- Create: `src/utils/date.ts`
- Create: `src/utils/index.ts`
- Modify: `src/screens/home/screens/SessionFormScreen.tsx:53-64`
- Modify: `src/store/chatStore.ts:81`

- [ ] **Step 1.1: Create `src/utils/date.ts`**

```ts
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}
```

- [ ] **Step 1.2: Create `src/utils/index.ts`**

```ts
export * from './date';
```

- [ ] **Step 1.3: Replace local `formatDate`/`formatTime` in `SessionFormScreen.tsx`**

Видалити локальні функції на рядках 53-64. Додати імпорт зверху файлу:
```ts
import { formatDate, formatTime } from '../../../utils';
```

- [ ] **Step 1.4: Replace `formatTime` in `chatStore.ts`**

Локальна реалізація на рядку 81 — замінити імпортом. Перевірити сигнатуру (приймає string або Date).

- [ ] **Step 1.5: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
grep -rn "function formatDate\|function formatTime" src  # has 0 hits
git add src/utils src/screens/home/screens/SessionFormScreen.tsx src/store/chatStore.ts
git commit -m "refactor: extract formatDate/formatTime into src/utils/date"
```

---

### Task 2: Training constants

**Files:**
- Create: `src/constants/training.ts`
- Create: `src/constants/index.ts`
- Modify: `src/screens/home/screens/SessionFormScreen.tsx:29` (TYPE_OPTIONS)
- Modify: `src/screens/home/screens/AddToLibraryFormScreen.tsx:29` (TAG_OPTIONS) and lines 31-37 (SET_NOTES)

- [ ] **Step 2.1: Create `src/constants/training.ts`**

```ts
export const TRAINING_TYPES = ['Cardio', 'HIIT', 'Strength', 'Yoga', 'Mobility', 'Pilates'] as const;
export type TrainingType = typeof TRAINING_TYPES[number];

export const SET_NOTES = [
  { key: 'regular', label: 'Regular', icon: 'checkmark-circle-outline' },
  { key: 'warmup', label: 'Warm-up', icon: 'flame-outline' },
  { key: 'dropset', label: 'Drop set', icon: 'trending-down-outline' },
  { key: 'failure', label: 'Failure', icon: 'alert-circle-outline' },
  { key: 'pause', label: 'Pause', icon: 'pause-circle-outline' },
] as const;
export type SetNoteKey = typeof SET_NOTES[number]['key'];
```

- [ ] **Step 2.2: Create `src/constants/index.ts`**

```ts
export * from './training';
```

- [ ] **Step 2.3: Replace `TYPE_OPTIONS` in `SessionFormScreen.tsx`**

Видалити локальний масив. Імпортувати:
```ts
import { TRAINING_TYPES } from '../../../constants';
```
Знайти всі вживання `TYPE_OPTIONS` у файлі (grep усередині) і замінити на `TRAINING_TYPES`.

- [ ] **Step 2.4: Replace `TAG_OPTIONS` and `SET_NOTES` in `AddToLibraryFormScreen.tsx`**

```ts
import { TRAINING_TYPES, SET_NOTES } from '../../../constants';
```
Видалити локальні `TAG_OPTIONS` і `SET_NOTES`. Замінити вживання `TAG_OPTIONS` → `TRAINING_TYPES`.

- [ ] **Step 2.5: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
grep -rn "TYPE_OPTIONS\|TAG_OPTIONS" src  # has 0 hits
git add src/constants src/screens/home/screens/SessionFormScreen.tsx src/screens/home/screens/AddToLibraryFormScreen.tsx
git commit -m "refactor: consolidate TRAINING_TYPES and SET_NOTES into src/constants"
```

---

### Task 3: Radius tokens

**Files:**
- Create: `src/theme/radius.ts`
- Modify: `src/theme/index.ts`

- [ ] **Step 3.1: Create `src/theme/radius.ts`**

```ts
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  pill: 80,
  full: 9999,
} as const;
```

- [ ] **Step 3.2: Re-export from `src/theme/index.ts`**

Read `src/theme/index.ts` first. Додати `export * from './radius';` (зберігаючи решту експортів).

- [ ] **Step 3.3: Verify and commit**

```bash
npx tsc --noEmit
git add src/theme/radius.ts src/theme/index.ts
git commit -m "feat(theme): add radius tokens (sm/md/lg/xl/2xl/pill/full)"
```

---

### Task 4: Replace hardcoded `borderRadius` values

**Files:** ~30 files across `src/screens/`, `src/components/`, `src/navigation/`. Загалом 121 співпадінь.

**Strategy:** заміна за value-mapping (8→sm, 10→sm or md, 12→md, 16→lg, 20→xl, 24→2xl, 32→2xl, 80→pill, 96→pill). Виключення для `4`, `6` залишити числовими (мінорні). 9-12 нестандартних значень — переглянути вручну.

- [ ] **Step 4.1: Generate full list with line numbers**

```bash
grep -rn "borderRadius:" src --include="*.tsx" --include="*.ts" > /tmp/radius_list.txt
wc -l /tmp/radius_list.txt   # ~121
```

- [ ] **Step 4.2: Replace value-by-value, file-by-file**

Для кожного файлу зі списку:
1. Open file
2. Add import at top (or merge into existing theme import): `import { radius } from '../../theme';` (relative path varies)
3. Replace inline: `borderRadius: 8` → `borderRadius: radius.sm`, `borderRadius: 12` → `borderRadius: radius.md`, тощо
4. Save

Не партіями через sed — занадто легко зламати щось у складних виразах (`borderRadius: someVar ? 8 : 12`). Робити по файлу, переглядаючи зміни.

- [ ] **Step 4.3: Run typecheck after each ~5 files**

```bash
npx tsc --noEmit
```

- [ ] **Step 4.4: Final sweep verification**

```bash
grep -rn "borderRadius: [0-9]" src --include="*.tsx" --include="*.ts"
# Expected: ≤10 hits (only intentional outliers like borderRadius: 4)
```

- [ ] **Step 4.5: Manual smoke test on simulator**

```bash
npm start
# Open Expo Go on simulator/device
# Navigate through: Onboarding → Home → Schedule → Training Library → Gallery → Add to Library → Session Form → Profile → Chat → Clients → Stats
# Look for visual regressions (corner rounding shifts)
```

- [ ] **Step 4.6: Commit**

```bash
git add src
git commit -m "refactor(theme): replace 121 hardcoded borderRadius with radius tokens"
```

---

### Task 5: Type-safe catches + remove swallowed errors

**Files:**
- Modify: `src/store/exerciseStore.ts:47, 64-66, 73-75`
- Modify: `src/services/exerciseApi.ts:102` (searchExercises)

- [ ] **Step 5.1: Add error helper**

In `src/utils/error.ts`:
```ts
export function toErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
```
Add `export * from './error';` to `src/utils/index.ts`.

- [ ] **Step 5.2: Fix `exerciseStore.ts`**

Read current file. Замінити блоки:

```ts
// loadExercises catch (~line 47):
catch (e) {
  set({ error: toErrorMessage(e), loading: false });
}

// loadMore catch (~line 64):
catch (e) {
  console.warn('[exerciseStore] loadMore failed', toErrorMessage(e));
  set({ loadingMore: false });
}

// loadCategories catch (~line 73):
catch (e) {
  console.warn('[exerciseStore] loadCategories failed', toErrorMessage(e));
}
```

Imports:
```ts
import { toErrorMessage } from '../utils';
```

- [ ] **Step 5.3: Fix `exerciseApi.ts:102`**

`searchExercises` повертає `[]` на `!res.ok`. Замінити на `throw new Error(\`API error: \${res.status}\`)` для консистентності з іншими fetch-функціями. Caller (якщо є) повинен обробляти.

```ts
if (!res.ok) throw new Error(`API error: ${res.status}`);
```

Перевірити: `grep -rn "searchExercises" src` — чи є caller. Якщо є — переконатися що він у try/catch.

- [ ] **Step 5.4: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
grep -rn "catch (e: any)" src   # 0 hits expected
grep -rn "catch {" src           # check no empty catches remain
git add src
git commit -m "fix(errors): type-safe catches, log instead of swallow API errors"
```

---

### Task 6: Fetch timeout via shared apiClient

**Files:**
- Create: `src/services/apiClient.ts`
- Create: `src/config/env.ts`
- Modify: `src/services/exerciseApi.ts` — використати apiClient, видалити `BASE_URL`

- [ ] **Step 6.1: Create `src/config/env.ts`**

```ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://wger.de/api/v2';
export const API_TIMEOUT_MS = 10_000;
```

- [ ] **Step 6.2: Create `src/services/apiClient.ts`**

```ts
import { API_BASE_URL, API_TIMEOUT_MS } from '../config/env';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

- [ ] **Step 6.3: Migrate `exerciseApi.ts`**

Видалити `const BASE_URL = ...`. Замінити три fetch-блоки на `apiFetch`:

```ts
import { apiFetch } from './apiClient';

export async function fetchExercises(limit = 20, offset = 0) {
  const data = await apiFetch<{ results: ApiExerciseInfo[]; count: number; next: string | null }>(
    `/exerciseinfo/?format=json&limit=${limit}&offset=${offset}`,
  );
  const exercises = data.results.map(mapExercise).filter((e): e is Exercise => e !== null);
  return { exercises, total: data.count ?? 0, hasMore: !!data.next };
}

export async function fetchCategories() {
  const data = await apiFetch<{ results: ExerciseCategory[] }>(`/exercisecategory/?format=json`);
  return data.results ?? [];
}

export async function searchExercises(term: string) {
  const data = await apiFetch<{ suggestions: { data: { id: number; name: string } }[] }>(
    `/exercise/search/?format=json&language=english&term=${encodeURIComponent(term)}`,
  );
  return (data.suggestions ?? []).map((s) => ({ id: s.data.id, name: s.data.name }));
}
```

- [ ] **Step 6.4: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
# Manual: launch app, open Gallery screen, verify exercises load
# Manual: simulate slow network (Network Link Conditioner) — verify timeout after 10s
git add src/config src/services
git commit -m "feat(api): shared apiClient with timeout, env-based base URL"
```

**End of Phase 1.** PR title: `refactor: phase 1 — quick wins (utils, constants, radius tokens, typed catches, apiClient)`.

---

# Phase 2 — Performance hotspots (1 day, 1 PR)

Локальні зміни в існуючих компонентах. Низький ризик, помітне покращення.

---

### Task 7: useShallow for multi-field selectors

**Files:**
- Modify: `src/screens/home/screens/AddToLibraryFormScreen.tsx:156-163`
- Modify: `src/screens/onboarding/steps/ChooseRoleScreen.tsx:52`
- Modify: `src/screens/onboarding/steps/YoureAllSetScreen.tsx:13`
- Modify: `src/screens/home/screens/ProfileScreen.tsx:17-28`

- [ ] **Step 7.1: Update AddToLibraryFormScreen**

Замість 5+ окремих `useDraftProgramStore((s) => s.X)`:
```ts
import { useShallow } from 'zustand/react/shallow';

const { title, tag, description, exercises, setTitle, setTag, setDescription, addSet, removeSet, updateSet, removeExercise } =
  useDraftProgramStore(useShallow((s) => ({
    title: s.title,
    tag: s.tag,
    description: s.description,
    exercises: s.exercises,
    setTitle: s.setTitle,
    setTag: s.setTag,
    setDescription: s.setDescription,
    addSet: s.addSet,
    removeSet: s.removeSet,
    updateSet: s.updateSet,
    removeExercise: s.removeExercise,
  })));
```

- [ ] **Step 7.2: Update ChooseRoleScreen, YoureAllSetScreen**

```ts
// ChooseRoleScreen
const setUserRole = useAppStore((s) => s.setUserRole);

// YoureAllSetScreen
const setOnboarded = useAppStore((s) => s.setOnboarded);
const addPoints = useAppStore((s) => s.addPoints);
```

- [ ] **Step 7.3: Update ProfileScreen**

```ts
import { useShallow } from 'zustand/react/shallow';

const { name, profilePhotoUri, trainingTypes, clientTypes, locations, experienceYears, workDays, workTimeStart, workTimeEnd, certifications } =
  useOnboardingStore(useShallow((s) => ({
    name: s.name,
    profilePhotoUri: s.profilePhotoUri,
    trainingTypes: s.trainingTypes,
    clientTypes: s.clientTypes,
    locations: s.locations,
    experienceYears: s.experienceYears,
    workDays: s.workDays,
    workTimeStart: s.workTimeStart,
    workTimeEnd: s.workTimeEnd,
    certifications: s.certifications,
  })));
```

- [ ] **Step 7.4: Audit remaining stores for the same pattern**

```bash
grep -rn "= use[A-Z][a-zA-Z]*Store()" src/screens src/components
# Each hit is a wholesale subscription — fix or document
```

Виправити кожен hit аналогічно. Якщо потрібен лише 1 метод — `useAppStore(s => s.setX)`. Якщо більше — `useShallow`.

- [ ] **Step 7.5: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
git add src/screens
git commit -m "perf(state): replace wholesale store subscriptions with useShallow/selectors"
```

---

### Task 8: React.memo for list items

**Files:**
- Modify: `src/components/ui/ScheduleCard.tsx` — обгорнути експорт у `React.memo`
- Modify: `src/screens/home/screens/AddToLibraryFormScreen.tsx` — обгорнути `ExerciseCard` у `React.memo`
- Modify: `src/screens/home/screens/HomeScreen.tsx:216-223` — useCallback для onPress
- Modify: `src/screens/home/screens/ScheduleScreen.tsx` (callers of ScheduleCard)

- [ ] **Step 8.1: Memoize ScheduleCard**

Read current export. Замінити:
```ts
export const ScheduleCard = ...
// →
const ScheduleCardComponent = (...) => ...
export const ScheduleCard = React.memo(ScheduleCardComponent);
```
(Якщо це функціональний компонент — обгорнути напряму: `export const ScheduleCard = React.memo(function ScheduleCard(props) {...})`.)

- [ ] **Step 8.2: Memoize ExerciseCard inside AddToLibraryFormScreen**

Знайти `function ExerciseCard(...)` (~рядки 39-145). Замінити:
```ts
const ExerciseCard = React.memo(function ExerciseCard({ exercise }: { exercise: ProgramExercise }) {
  // ...
});
```

**Note:** У Task 14 цей компонент буде винесено в окремий файл — поки достатньо memo всередині форми.

- [ ] **Step 8.3: useCallback for navigation handlers**

`HomeScreen.tsx:216-223` — `upcomingSessions.slice(0, 4).map((session) => (...))`:
```ts
const handleSessionPress = React.useCallback(
  (session: Session) => navigation.navigate('SessionForm', { session }),
  [navigation],
);
const handleOptionsPress = React.useCallback(
  () => navigation.navigate('Schedule'),
  [navigation],
);
// ...
upcomingSessions.slice(0, 4).map((session) => (
  <ScheduleCard
    key={session.id}
    session={session}
    onPress={() => handleSessionPress(session)}  // Inline бо потрібен param
    onOptionsPress={handleOptionsPress}
  />
))
```

Для `onPress` зі specific session — закрити в useCallback не вдасться без передачі id у memo. Альтернатива: всередині `ScheduleCard` приймати `onPress: (session: Session) => void` і викликати `onPress(session)`. Зробити цю невелику зміну API.

- [ ] **Step 8.4: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
# Manual: open Home screen, scroll through sessions, profile React DevTools if available
git add src
git commit -m "perf: memoize ScheduleCard and ExerciseCard in lists"
```

---

### Task 9: FlatList optimization props

**Files:**
- Modify: `src/screens/home/screens/GalleryScreen.tsx:266-283`
- Audit: всі інші `FlatList` у `src/screens`

- [ ] **Step 9.1: Update GalleryScreen FlatList**

Додати props:
```tsx
<FlatList
  data={displayExercises}
  keyExtractor={(item) => String(item.id)}
  numColumns={2}
  initialNumToRender={12}
  windowSize={5}
  maxToRenderPerBatch={10}
  removeClippedSubviews
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  renderItem={renderExerciseItem}
/>
```

- [ ] **Step 9.2: Audit інші FlatList**

```bash
grep -rn "<FlatList" src/screens src/components
```

Для кожного FlatList перевірити: чи має `keyExtractor`, чи дані великі (>50 елементів), чи варто додати opt-props. Малі списки (≤20) — opt-props зайві.

- [ ] **Step 9.3: Verify and commit**

```bash
npx tsc --noEmit
# Manual: open Gallery screen, scroll through 100+ exercises, observe smooth scroll
git add src
git commit -m "perf(gallery): FlatList opt-props (initialNumToRender, windowSize, removeClippedSubviews)"
```

---

### Task 10: useMemo for derived/expensive data

**Files:**
- Modify: `src/screens/home/screens/GalleryScreen.tsx:124`
- Modify: `src/screens/stats/BusinessAnalyticsScreen.tsx:118-142`

- [ ] **Step 10.1: Memoize `displayExercises` in GalleryScreen**

```tsx
const exercises = useExerciseStore(s => s.exercises);
const searchQuery = useExerciseStore(s => s.searchQuery);
const selectedCategory = useExerciseStore(s => s.selectedCategory);

const displayExercises = React.useMemo(() => {
  let result = exercises;
  if (selectedCategory) result = result.filter((e) => e.categoryId === selectedCategory);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter((e) => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
  }
  return result;
}, [exercises, searchQuery, selectedCategory]);
```

**Бонус:** Це робить метод `filteredExercises()` у `exerciseStore` непотрібним. Видалити його зі store (звертайте увагу на інші місця використання).

- [ ] **Step 10.2: Memoize chart data and width**

```tsx
const chartWidth = React.useMemo(
  () => Dimensions.get('window').width - spacing.lg * 2 - 32,
  [],
);
const incomeData = React.useMemo(() => mockAnalyticsData.incomeOverTime, []);
// Передати у <LineChart data={incomeData} width={chartWidth} />
```

- [ ] **Step 10.3: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
git add src
git commit -m "perf: useMemo for derived exercise list and chart data/width"
```

**End of Phase 2.** PR title: `perf: phase 2 — selectors, memo, FlatList opt-props, useMemo`.

---

# Phase 3 — Critical Architecture (3-5 days, 3-4 PRs)

**🔴 Найважливіша фаза.** Persistence + Error Boundary + draft lifecycle + рішення про react-hook-form.

---

### Task 11: AsyncStorage + zustand persist

**Files:**
- Modify: `package.json` — додати `@react-native-async-storage/async-storage`
- Create: `src/services/storage.ts`
- Modify: `src/store/appStore.ts`
- Modify: `src/store/onboardingStore.ts`
- Modify: `src/store/draftProgramStore.ts`

- [ ] **Step 11.1: Install AsyncStorage**

```bash
npx expo install @react-native-async-storage/async-storage
```

Перевірити що `package.json` оновлено. Запустити `npm install` якщо потрібно.

- [ ] **Step 11.2: Create `src/services/storage.ts`**

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

export const zustandStorage = createJSONStorage(() => AsyncStorage);
```

- [ ] **Step 11.3: Add persist to `appStore.ts`**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../services/storage';

export type UserRole = 'client' | 'trainer';

interface AppState {
  isOnboarded: boolean;
  userRole: UserRole | null;
  userName: string | null;
  points: number;
  setOnboarded: (value: boolean) => void;
  setUserRole: (role: UserRole | null) => void;
  setUserName: (name: string | null) => void;
  addPoints: (amount: number) => void;
  reset: () => void;
}

const initialState = {
  isOnboarded: false,
  userRole: null as UserRole | null,
  userName: null as string | null,
  points: 0,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setOnboarded: (value) => set({ isOnboarded: value }),
      setUserRole: (role) => set({ userRole: role }),
      setUserName: (name) => set({ userName: name }),
      addPoints: (amount) => set((state) => ({ points: state.points + amount })),
      reset: () => set(initialState),
    }),
    { name: 'app-storage', storage: zustandStorage },
  ),
);
```

- [ ] **Step 11.4: Add persist to `onboardingStore.ts`**

Аналогічно — обгорнути `create<OnboardingState>()(persist(...))` з `name: 'onboarding-storage'`. Зберігати тільки data-fields, не сетери — `partialize`:

```ts
persist(
  (set) => ({ /* як зараз */ }),
  {
    name: 'onboarding-storage',
    storage: zustandStorage,
    partialize: (state) => ({
      name: state.name,
      experienceYears: state.experienceYears,
      hasCertifications: state.hasCertifications,
      certifications: state.certifications,
      trainingTypes: state.trainingTypes,
      clientTypes: state.clientTypes,
      hasPrograms: state.hasPrograms,
      programTitle: state.programTitle,
      programDescription: state.programDescription,
      freePreview: state.freePreview,
      accessSetting: state.accessSetting,
      locations: state.locations,
      workDays: state.workDays,
      workTimeStart: state.workTimeStart,
      workTimeEnd: state.workTimeEnd,
      sameSlotsEveryWeek: state.sameSlotsEveryWeek,
      profilePhotoUri: state.profilePhotoUri,
    }),
  },
)
```

- [ ] **Step 11.5: Add persist to `draftProgramStore.ts`**

Аналогічно з `name: 'draft-program-storage'`. Persistitь тільки `title`, `tag`, `description`, `exercises` (через `partialize`).

- [ ] **Step 11.6: Manual integration test**

```bash
npm start
# 1. Open app on simulator
# 2. Set username in onboarding, complete it
# 3. Force-close app
# 4. Re-open — should land on Home (not onboarding restart)
# 5. Open Gallery, add 2 exercises to draft
# 6. Force-close app
# 7. Re-open Add to Library — draft exercises should still be there
```

- [ ] **Step 11.7: Commit**

```bash
git add package.json package-lock.json src/services/storage.ts src/store
git commit -m "feat(state): persist appStore, onboardingStore, draftProgramStore via AsyncStorage"
```

---

### Task 12: Global Error Boundary

**Files:**
- Create: `src/components/ErrorBoundary.tsx`
- Modify: `App.tsx`

- [ ] **Step 12.1: Create `ErrorBoundary.tsx`**

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

interface Props { children: React.ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    // TODO: send to crash-reporting service in production
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <TouchableOpacity style={styles.button} onPress={this.reset}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.screenBg },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.md },
  message: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  button: { backgroundColor: colors.accent, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: radius.md },
  buttonText: { color: colors.text, fontWeight: '600' },
});
```

(Перевірити що `colors.textMuted` існує у `theme/colors.ts` — якщо ні, замінити на `colors.text`.)

- [ ] **Step 12.2: Wrap RootNavigator in App.tsx**

Read `App.tsx`. Імпортувати ErrorBoundary і обгорнути:
```tsx
import { ErrorBoundary } from './src/components/ErrorBoundary';

// In return:
<ErrorBoundary>
  <NavigationContainer theme={AppTheme}>
    <StatusBar style="light" />
    <RootNavigator />
  </NavigationContainer>
</ErrorBoundary>
```

- [ ] **Step 12.3: Verification — intentional crash**

Додати тимчасово в будь-який екран:
```tsx
throw new Error('Test boundary');
```
Відкрити цей екран — переконатися що показано fallback-UI. Прибрати тестовий throw.

- [ ] **Step 12.4: Commit**

```bash
git add src/components/ErrorBoundary.tsx App.tsx
git commit -m "feat: global ErrorBoundary with retry"
```

---

### Task 13: draftProgramStore lifecycle (cleanup + transactional save)

**Files:**
- Modify: `src/screens/home/screens/GalleryScreen.tsx`
- Modify: `src/screens/home/screens/AddToLibraryFormScreen.tsx`
- Modify: `src/store/programsStore.ts`

- [ ] **Step 13.1: Add `addProgramFromDraft` to programsStore**

```ts
// In src/store/programsStore.ts — додати до interface:
addProgramFromDraft: (draft: { title: string; tag: string; description: string; exercises: ProgramExercise[] }) => TrainingProgram;

// Implementation:
addProgramFromDraft: (draft) => {
  const id = String(nextId++);
  const thumbIndex = (nextId - 1) % TRAINING_IMAGES.length;
  const newProgram: TrainingProgram = {
    id,
    name: draft.title,
    tag: draft.tag,
    description: draft.description,
    exercises: draft.exercises,
    videoCount: draft.exercises.length,
    views: 0,
    likes: 0,
    thumbnail: TRAINING_IMAGES[thumbIndex],
    price: '$5/month',
  };
  set((state) => ({ programs: [newProgram, ...state.programs] }));
  return newProgram;
},
```

(Точна shape TrainingProgram — перевірити у `src/mocks/data.ts`.)

- [ ] **Step 13.2: Use `useFocusEffect` cleanup in GalleryScreen**

```tsx
import { useFocusEffect } from '@react-navigation/native';

const resetDraft = useDraftProgramStore((s) => s.reset);

useFocusEffect(
  React.useCallback(() => {
    // На вхід — нічого не робимо
    return () => {
      // На вихід — НЕ скидаємо тут, бо це може бути перехід до AddToLibraryForm
      // Скидання робимо в AddToLibraryForm після save/cancel
    };
  }, []),
);
```

Або (краще) — додати `clearOnBack` логіку в навігаційний stack-listener. Подумати про сценарій: Gallery → user picks exercises → goes to AddToLibrary → user cancels → back to Gallery. Чи бачить він вибрані exercises? Зараз — так. Це bug чи feature? Зробити feature: drafts зберігаються поки не save/discard явно.

**Decision:** не очищувати на back-navigation. Очищення відбувається тільки в `addProgramFromDraft` success або через явну кнопку "Discard draft".

- [ ] **Step 13.3: Replace `getState()` setters in AddToLibraryFormScreen**

Знайти `useDraftProgramStore.getState().setX(...)` (рядки 171-172). Замінити на нормальні селектори (вже зроблено в Task 7) і виклики:

```tsx
React.useEffect(() => {
  if (isEdit && program) {
    setTitle(program.name);
    setTag(program.tag);
    setDescription(program.description ?? '');
    setExercises(program.exercises ?? []);
  }
}, [isEdit, program?.id]);
```

- [ ] **Step 13.4: Use addProgramFromDraft on save**

У `AddToLibraryFormScreen` save-handler:
```tsx
const addProgramFromDraft = useProgramsStore((s) => s.addProgramFromDraft);
const resetDraft = useDraftProgramStore((s) => s.reset);

const handleSave = () => {
  if (!title.trim()) { setTitleError('Required'); return; }
  addProgramFromDraft({ title, tag, description, exercises });
  resetDraft();
  navigation.navigate('TrainingLibrary');
};
```

Замінити старий послідовний виклик `addProgram` + потенційно дубльовану логіку.

- [ ] **Step 13.5: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
# Manual flow:
# 1. Gallery → pick 3 exercises → continue → AddToLibrary
# 2. Type title, save → should land on TrainingLibrary with new program
# 3. Open Gallery again → no stale draft exercises
git add src
git commit -m "fix(state): transactional addProgramFromDraft, replace getState setters"
```

---

### Task 14: Decision — react-hook-form + zod (Option A) OR remove (Option B)

**Decision required.** Обговорити з власником проекту перед стартом. План містить **обидва варіанти**.

**Option A** — інтегрувати rhf+zod (recommended, але +1-2 дні роботи)
**Option B** — видалити невикористані залежності

#### Option A — Integrate rhf+zod

**Files (per form):** SessionFormScreen, AddToLibraryFormScreen, CardioClassFormScreen, profile screens

- [ ] **Step 14A.1: Create schemas**

`src/schemas/session.ts`:
```ts
import { z } from 'zod';

export const sessionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  programId: z.string().min(1, 'Program is required'),
  date: z.date(),
  time: z.date(),
  type: z.string(),
  participants: z.array(z.string()).min(0),
});
export type SessionFormValues = z.infer<typeof sessionSchema>;
```

`src/schemas/program.ts`:
```ts
import { z } from 'zod';

export const programDraftSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  tag: z.string(),
  description: z.string().optional(),
});
export type ProgramDraftValues = z.infer<typeof programDraftSchema>;
```

- [ ] **Step 14A.2: Migrate SessionFormScreen**

Замінити локальний `useState` для кожного поля на `useForm` + `Controller`:

```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sessionSchema, SessionFormValues } from '../../../schemas/session';

const { control, handleSubmit, formState: { errors } } = useForm<SessionFormValues>({
  resolver: zodResolver(sessionSchema),
  defaultValues: {
    title: session?.title ?? '',
    programId: session?.programId ?? '',
    date: session?.date ? new Date(session.date) : new Date(),
    time: session?.time ? new Date(session.time) : new Date(),
    type: session?.type ?? 'Cardio',
    participants: session?.participants ?? [],
  },
});

// Replace each input with:
<Controller
  control={control}
  name="title"
  render={({ field: { onChange, value } }) => (
    <FormInput label="Title" value={value} onChange={onChange} error={errors.title?.message} />
  )}
/>

const onSubmit = (data: SessionFormValues) => {
  // save logic
};

// On button:
<Button onPress={handleSubmit(onSubmit)} />
```

- [ ] **Step 14A.3: Migrate AddToLibraryFormScreen, CardioClassFormScreen**

Аналогічно. `draftProgramStore` лишається — як store для exercises (не form-state).

- [ ] **Step 14A.4: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
# Manual: відкрити кожну форму, перевірити валідацію (порожній title → error)
git add src
git commit -m "refactor(forms): migrate to react-hook-form + zod"
```

#### Option B — Remove unused deps

- [ ] **Step 14B.1: Uninstall**

```bash
npm uninstall react-hook-form @hookform/resolvers zod
```

- [ ] **Step 14B.2: Verify**

```bash
npx tsc --noEmit
grep -rn "react-hook-form\|hookform\|from 'zod'" src   # 0 hits expected
```

- [ ] **Step 14B.3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove unused react-hook-form + zod dependencies"
```

---

### Task 15: Onboarding resumability

**Files:**
- Modify: `src/store/onboardingStore.ts` — додати `currentStepIndex`
- Modify: `src/navigation/OnboardingNavigator.tsx` — використати при mount

- [ ] **Step 15.1: Add `currentStepIndex` to onboardingStore**

```ts
interface OnboardingState {
  // ... existing fields
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
}

// initialState:
currentStepIndex: 0,

// action:
setCurrentStepIndex: (index) => set({ currentStepIndex: index }),

// partialize: додати currentStepIndex до persisted fields
```

- [ ] **Step 15.2: Update step screens to bump index**

У кожному кроці onboarding-екрана при переході на next:
```ts
const setCurrentStepIndex = useOnboardingStore((s) => s.setCurrentStepIndex);
const handleNext = () => {
  setCurrentStepIndex(currentIndex + 1);
  navigation.navigate('NextStepName');
};
```

(Альтернатива простіша: винести в helper `useOnboardingProgress(stepIndex)` що сам пише currentStepIndex.)

- [ ] **Step 15.3: Resume in OnboardingNavigator**

Read `OnboardingNavigator.tsx`. У вершинному useEffect:
```tsx
const currentStepIndex = useOnboardingStore((s) => s.currentStepIndex);
const isOnboarded = useAppStore((s) => s.isOnboarded);

React.useEffect(() => {
  if (!isOnboarded && currentStepIndex > 0) {
    // Navigate to step at currentStepIndex
    const stepNames = ['ChooseRole', 'WhatsYourName', /* ... */];
    navigation.navigate(stepNames[currentStepIndex]);
  }
}, []);
```

- [ ] **Step 15.4: Verify and commit**

```bash
npx tsc --noEmit
# Manual:
# 1. Start fresh (clear app data on simulator)
# 2. Go through onboarding to step 4
# 3. Force-close app
# 4. Re-open — should resume at step 4, not step 1
git add src
git commit -m "feat(onboarding): resume from last step on app restart"
```

**End of Phase 3.** Multiple PRs recommended:
- PR A: Tasks 11-12 (persistence + error boundary)
- PR B: Task 13 (draft lifecycle)
- PR C: Task 14 (form library decision — own PR for visibility)
- PR D: Task 15 (onboarding resumability)

---

# Phase 4 — UI Components & Decomposition (3-4 days, 2-3 PRs)

---

### Task 16: ChoiceCard component + migrate 4 onboarding screens

**Files:**
- Create: `src/components/ui/ChoiceCard.tsx`
- Modify: `src/components/ui/index.ts`
- Modify: `src/screens/onboarding/steps/ChooseRoleScreen.tsx`
- Modify: `src/screens/onboarding/steps/TrainingTypesScreen.tsx`
- Modify: `src/screens/onboarding/steps/HaveProgramsScreen.tsx`
- Modify: `src/screens/onboarding/steps/ExperienceScreen.tsx`

- [ ] **Step 16.1: Create `ChoiceCard.tsx`**

```tsx
import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

export interface ChoiceCardProps {
  selected: boolean;
  onPress: () => void;
  variant?: 'card' | 'chip';
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  testID?: string;
}

export const ChoiceCard = React.memo(function ChoiceCard({
  selected, onPress, variant = 'card', icon, title, subtitle, testID,
}: ChoiceCardProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[
        variant === 'card' ? styles.card : styles.chip,
        selected && (variant === 'card' ? styles.cardSelected : styles.chipSelected),
      ]}
    >
      {icon && <Ionicons name={icon} size={variant === 'card' ? 28 : 18} color={selected ? colors.accent : colors.text} />}
      <View style={styles.textWrap}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.neutral2, borderRadius: radius.lg, borderWidth: 1, borderColor: 'transparent' },
  cardSelected: { borderColor: colors.accent, backgroundColor: colors.neutral3 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.neutral2, borderRadius: radius.pill, borderWidth: 1, borderColor: 'transparent' },
  chipSelected: { borderColor: colors.accent, backgroundColor: colors.accent + '20' },
  textWrap: { flex: 1 },
  title: { color: colors.text, fontWeight: '600' },
  titleSelected: { color: colors.accent },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
```

(Перевірити що `colors.neutral2`, `neutral3`, `textMuted`, `accent` існують у вашій палітрі — інакше адаптувати.)

- [ ] **Step 16.2: Re-export from `src/components/ui/index.ts`**

```ts
export * from './ChoiceCard';
```

- [ ] **Step 16.3: Migrate ChooseRoleScreen**

Read current file. Замінити inline `RoleCard` на:
```tsx
<ChoiceCard
  selected={selectedRole === 'trainer'}
  onPress={() => setSelectedRole('trainer')}
  variant="card"
  icon="fitness"
  title="I'm a trainer"
  subtitle="Manage clients and run sessions"
/>
```
Видалити локальний `RoleCard` компонент. Перенести описи у відповідні props.

- [ ] **Step 16.4: Migrate TrainingTypesScreen (chip variant)**

Замінити inline chips на:
```tsx
{TRAINING_TYPES.map((type) => (
  <ChoiceCard
    key={type}
    selected={trainingTypes.includes(type)}
    onPress={() => toggleTrainingType(type)}
    variant="chip"
    title={type}
  />
))}
```

- [ ] **Step 16.5: Migrate HaveProgramsScreen, ExperienceScreen**

Аналогічно. Для ExperienceScreen (4 radio-варіанти) — card variant.

- [ ] **Step 16.6: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
# Manual: пройти весь onboarding, перевірити selected-стани, переходи
git add src
git commit -m "refactor(ui): introduce ChoiceCard, migrate 4 onboarding screens"
```

---

### Task 17: EmptyState component + migrate 3 list screens

**Files:**
- Create: `src/components/ui/EmptyState.tsx`
- Modify: `src/components/ui/index.ts`
- Modify: `src/screens/home/screens/TrainingLibraryScreen.tsx`
- Modify: `src/screens/home/screens/GalleryScreen.tsx`
- Modify: `src/screens/chat/ChatListScreen.tsx`

- [ ] **Step 17.1: Create `EmptyState.tsx`**

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

export interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.button}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  title: { color: colors.text, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  subtitle: { color: colors.textMuted, textAlign: 'center' },
  button: { marginTop: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, backgroundColor: colors.accent, borderRadius: radius.md },
  buttonText: { color: colors.text, fontWeight: '600' },
});
```

- [ ] **Step 17.2: Migrate TrainingLibraryScreen**

Знайти inline empty-блок. Замінити:
```tsx
<EmptyState
  icon="library-outline"
  title="No programs yet"
  subtitle="Create your first training program"
  actionLabel="Create program"
  onAction={() => navigation.navigate('Gallery')}
/>
```

- [ ] **Step 17.3: Migrate GalleryScreen, ChatListScreen**

Аналогічно.

- [ ] **Step 17.4: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
# Manual: видалити всі програми/чати на симуляторі → побачити EmptyState
git add src
git commit -m "refactor(ui): introduce EmptyState, migrate 3 list screens"
```

---

### Task 18: Extract ExerciseCard to shared component

**Files:**
- Create: `src/components/ui/ExerciseCard.tsx`
- Modify: `src/screens/home/screens/AddToLibraryFormScreen.tsx` — видалити inline ExerciseCard, імпортувати з нового місця
- Modify: `src/components/ui/index.ts`

- [ ] **Step 18.1: Extract content**

Read `AddToLibraryFormScreen.tsx` рядки 39-145 (зараз `function ExerciseCard`). Скопіювати весь компонент + його стилі в новий файл `src/components/ui/ExerciseCard.tsx`. Експортувати як `React.memo`-обгорнутий.

Імпорти переробити (відносні шляхи стануть `../../theme/...`).

- [ ] **Step 18.2: Видалити з form-екрана**

Видалити локальний `function ExerciseCard` блок з `AddToLibraryFormScreen.tsx`. Додати:
```ts
import { ExerciseCard } from '../../../components/ui';
```

- [ ] **Step 18.3: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
git add src
git commit -m "refactor(ui): extract ExerciseCard to src/components/ui"
```

---

### Task 19: Decompose SessionFormScreen

**Files:**
- Create: `src/screens/home/screens/SessionForm/DateTimePickerSection.tsx`
- Create: `src/screens/home/screens/SessionForm/ParticipantsSection.tsx`
- Create: `src/screens/home/screens/SessionForm/ProgramSelectorSection.tsx`
- Create: `src/screens/home/screens/SessionForm/TypeSelectorSection.tsx`
- Create: `src/screens/home/screens/SessionForm/styles.ts` — shared styles
- Create: `src/screens/home/screens/SessionForm/index.tsx` — orchestrator
- Delete: `src/screens/home/screens/SessionFormScreen.tsx` (після міграції)
- Modify: `src/navigation/HomeStackNavigator.tsx` — оновити import path

- [ ] **Step 19.1: Plan the split — re-read current file**

Read `SessionFormScreen.tsx` full file (698 рядків). Виділити логічні блоки:
- Imports, hooks, helpers (top)
- Form state (title, dateObj, timeObj, programId, type, participants)
- Date/Time pickers + their modals → DateTimePickerSection
- Participants search + list + add-new → ParticipantsSection
- Program selector + modal → ProgramSelectorSection
- Type selector (chip row) → TypeSelectorSection (потенційно просто `<ChoiceCard variant="chip">` mapping)
- Save handler + main JSX

- [ ] **Step 19.2: Створити порожні section-файли з контрактами**

Кожен з 4 файлів отримує props-інтерфейс що описує що секція приймає/повертає. Приклад для DateTimePickerSection:
```tsx
export interface DateTimePickerSectionProps {
  date: Date;
  time: Date;
  onDateChange: (d: Date) => void;
  onTimeChange: (t: Date) => void;
}
export function DateTimePickerSection(props: DateTimePickerSectionProps) { /* ... */ }
```

- [ ] **Step 19.3: Перенести код по секціях**

Один файл за раз. Після кожного — typecheck + commit.

Послідовність:
1. **TypeSelectorSection** (найпростіший — може бути ChoiceCard mapping)
2. **DateTimePickerSection**
3. **ProgramSelectorSection**
4. **ParticipantsSection** (найскладніший — search логіка)

Для кожної секції:
- Винести JSX блок
- Винести relevant styles (або повний StyleSheet перемістити у styles.ts і шарити)
- Винести handlers — якщо потребують form-state, передати через props

- [ ] **Step 19.4: Створити orchestrator `index.tsx`**

```tsx
export function SessionFormScreen({ route, navigation }: Props) {
  // form state (hooks)
  // save handler
  return (
    <ScreenBackground>
      <ScreenHeader title={isEdit ? 'Edit session' : 'New session'} onBack={() => navigation.goBack()} />
      <ScrollView>
        <FormInput label="Title" value={title} onChangeText={setTitle} error={titleError} />
        <DateTimePickerSection date={dateObj} time={timeObj} onDateChange={setDateObj} onTimeChange={setTimeObj} />
        <ProgramSelectorSection value={programId} onChange={setProgramId} />
        <TypeSelectorSection value={type} onChange={setType} />
        <ParticipantsSection value={participants} onChange={setParticipants} />
        <Button label="Save" onPress={handleSave} />
      </ScrollView>
    </ScreenBackground>
  );
}
```
Розмір: ~150 рядків замість 698.

- [ ] **Step 19.5: Update navigator import**

`src/navigation/HomeStackNavigator.tsx` — замінити `import { SessionFormScreen } from '../screens/home/screens/SessionFormScreen'` на `'../screens/home/screens/SessionForm'`.

- [ ] **Step 19.6: Delete old file**

```bash
rm src/screens/home/screens/SessionFormScreen.tsx
```

- [ ] **Step 19.7: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
# Manual: open SessionForm both for new session and edit existing — full happy path
# - Pick date/time
# - Select program
# - Choose type
# - Add 2 participants (existing + new)
# - Save → verify session appears in Schedule
git add src
git commit -m "refactor(SessionForm): decompose 698-line screen into 4 sections"
```

---

### Task 20: Extract ParticipantGroup + StatusBadge from ScheduleCard

**Files:**
- Create: `src/components/ui/ParticipantGroup.tsx`
- Create: `src/components/ui/StatusBadge.tsx`
- Modify: `src/components/ui/ScheduleCard.tsx`
- Modify: `src/components/ui/index.ts`

- [ ] **Step 20.1: Create ParticipantGroup**

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface Participant { id: string; name: string; avatar?: string }

export interface ParticipantGroupProps {
  participants: Participant[];
  maxVisible?: number;
}

export const ParticipantGroup = React.memo(function ParticipantGroup({ participants, maxVisible = 3 }: ParticipantGroupProps) {
  const visible = participants.slice(0, maxVisible);
  const overflow = participants.length - maxVisible;
  return (
    <View style={styles.stack}>
      {visible.map((p, i) => (
        <View key={p.id} style={[styles.avatarWrap, { marginLeft: i === 0 ? 0 : -8 }]}>
          <Avatar name={p.name} uri={p.avatar} size={28} />
        </View>
      ))}
      {overflow > 0 && (
        <View style={[styles.avatarWrap, styles.overflow]}>
          <Text style={styles.overflowText}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  stack: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { borderWidth: 2, borderColor: colors.screenBg, borderRadius: 14 },
  overflow: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.neutral3, marginLeft: -8 },
  overflowText: { color: colors.text, fontSize: 12, fontWeight: '600' },
});
```

(Перевірити що `Avatar` приймає `{ name, uri, size }`.)

- [ ] **Step 20.2: Create StatusBadge**

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

type BadgeColor = 'success' | 'warning' | 'error' | 'accent' | 'neutral';

export interface StatusBadgeProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: BadgeColor;
}

const colorMap: Record<BadgeColor, { bg: string; fg: string }> = {
  success: { bg: colors.success + '20', fg: colors.success },
  warning: { bg: colors.warning + '20', fg: colors.warning },
  error: { bg: colors.error + '20', fg: colors.error },
  accent: { bg: colors.accent + '20', fg: colors.accent },
  neutral: { bg: colors.neutral2, fg: colors.text },
};

export function StatusBadge({ icon, label, color = 'neutral' }: StatusBadgeProps) {
  const { bg, fg } = colorMap[color];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon && <Ionicons name={icon} size={12} color={fg} />}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: 2, paddingHorizontal: spacing.sm, borderRadius: radius.pill },
  label: { fontSize: 12, fontWeight: '600' },
});
```

- [ ] **Step 20.3: Use in ScheduleCard**

Read `ScheduleCard.tsx`. Знайти inline avatar-stack та inline paymentBadge — замінити на нові компоненти.

- [ ] **Step 20.4: Verify and commit**

```bash
npx tsc --noEmit
npm run lint
# Manual: Schedule screen — переконатися що картки виглядають однаково
git add src
git commit -m "refactor(ScheduleCard): extract ParticipantGroup and StatusBadge"
```

**End of Phase 4.** PRs:
- PR A: Tasks 16-17 (ChoiceCard + EmptyState)
- PR B: Task 18 (ExerciseCard extraction)
- PR C: Task 19 (SessionForm decomposition — own PR for review)
- PR D: Task 20 (ScheduleCard split)

---

# Phase 5 — Polish & Hardening (optional, 1-2 days)

---

### Task 21: Zod schemas for API responses

**Files:**
- Create: `src/schemas/exerciseApi.ts`
- Modify: `src/services/exerciseApi.ts`

(Залежить від рішення в Task 14: якщо Option B — zod видалено — цей task відпадає. Якщо Option A — реально корисний.)

- [ ] **Step 21.1: Create schemas**

```ts
import { z } from 'zod';

export const ApiExerciseTranslationSchema = z.object({
  name: z.string(),
  description: z.string(),
  language: z.number(),
});

export const ExerciseCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const ApiExerciseInfoSchema = z.object({
  id: z.number(),
  category: ExerciseCategorySchema.nullable().optional(),
  images: z.array(z.object({ id: z.number(), image: z.string(), is_main: z.boolean() })),
  translations: z.array(ApiExerciseTranslationSchema),
  muscles: z.array(z.object({ id: z.number(), name_en: z.string() })),
});

export const ExercisesPageSchema = z.object({
  count: z.number().optional(),
  next: z.string().nullable().optional(),
  results: z.array(ApiExerciseInfoSchema),
});

export const CategoriesPageSchema = z.object({
  results: z.array(ExerciseCategorySchema),
});
```

- [ ] **Step 21.2: Parse in apiClient calls**

```ts
const raw = await apiFetch<unknown>('/exerciseinfo/?...');
const data = ExercisesPageSchema.parse(raw);
```
(Якщо `parse` кине — apiClient catch підхопить.)

- [ ] **Step 21.3: Commit**

```bash
git add src
git commit -m "feat(api): zod schemas for runtime validation of exerciseApi responses"
```

---

### Task 22: Strict tsconfig flags

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 22.1: Add strict flags incrementally**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

- [ ] **Step 22.2: Fix resulting errors**

```bash
npx tsc --noEmit
# Очікувано: 20-50 нових помилок (переважно `array[i]` стане `T | undefined`)
```

Виправляти за патернами:
- `array[i]` → `const item = array[i]; if (!item) return;`
- Невикористані змінні — додати `_` префікс або видалити
- Missing returns у switch — додати `default:` або `throw`

Це може зайняти 4-6 годин. Якщо забагато — починати з 1-2 прапорів і додавати поступово, по 1 на PR.

- [ ] **Step 22.3: Commit per fixed flag**

```bash
git commit -m "fix(types): enable noUncheckedIndexedAccess and fix array access patterns"
```

---

### Task 23: Source-of-truth cleanup

**Files:**
- Modify: `src/screens/home/screens/CardioClassFormScreen.tsx:17-24` — видалити локальний `CLIENTS`
- Можливо: `src/mocks/data.ts` — додати `mockClients` якщо нема
- Modify: `src/store/sessionsStore.ts` або новий `src/store/clientsStore.ts` — централізувати

- [ ] **Step 23.1: Audit current state**

```bash
grep -rn "const CLIENTS\|mockClients" src
```
Зрозуміти, де живе джерело клієнтів. Якщо вже в `mocks/data.ts` — переконатися експортується.

- [ ] **Step 23.2: Use central source in CardioClassFormScreen**

```ts
import { mockClients } from '../../../mocks';
// видалити локальний const CLIENTS
```

- [ ] **Step 23.3: Commit**

```bash
git add src
git commit -m "refactor(data): single source for mock clients across screens"
```

---

# Final Verification (after all phases)

- [ ] **Run full type-check + lint:**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Run app, test critical flows on simulator:**
1. Fresh install (clear AsyncStorage) → onboarding complete → home
2. Force-close mid-onboarding → reopen → resume from correct step
3. Create program: Gallery → pick exercises → AddToLibrary → save → Training Library
4. Create session: SessionForm → fill all fields → save → Schedule
5. Open Chat → send message → verify
6. Profile → see persisted data
7. Trigger error (temporary throw) → see ErrorBoundary fallback → reset works
8. Toggle airplane mode → trigger Gallery API call → see error state (not infinite loading)

- [ ] **Check no residual issues:**
```bash
grep -rn "borderRadius: [0-9]" src --include="*.tsx" --include="*.ts" | wc -l   # ≤10
grep -rn "catch (e: any)\|catch {}" src   # 0
grep -rn "function formatDate\|function formatTime" src   # 0
grep -rn "= use[A-Z][a-zA-Z]*Store()" src/screens src/components   # 0
```

- [ ] **Update audit doc with status:**
Mark items in `docs/AUDIT_2026-05-28.md` as ✅ resolved (optional, для tracking).

---

## Self-Review Notes

This plan covers all 19 audit items from `docs/AUDIT_2026-05-28.md`:

| Audit item | Task | Notes |
|---|---|---|
| 1.1 ChoiceCard | 16 | ✓ |
| 1.2 EmptyState | 17 | ✓ |
| 1.3 SectionHeader | — | **Skipped** — low priority, can add later |
| 1.4 ParticipantGroup | 20 | ✓ |
| 1.5 StatusBadge | 20 | ✓ |
| 1.6 ListItemCard | — | **Skipped** by audit recommendation (over-engineering risk) |
| 1.7 FormSection | — | **Skipped** — value-add unclear; reassess after Task 14 form migration |
| 2.1 SessionForm decomposition | 19 | ✓ |
| 2.2 Extract ExerciseCard | 18 | ✓ |
| 2.3 Sets logic unification | 13/14 | Partially via draftProgramStore + rhf migration |
| 3.1 radius tokens | 3, 4 | ✓ |
| 3.2 Spacing magic numbers | — | Spot-fixes during Task 4 sweep; not a separate task |
| 3.3 Constants dedup | 2 | ✓ |
| 4.1 Date utils | 1 | ✓ |
| 4.2 Validation utils | 14 | Via rhf+zod migration (or N/A if Option B) |
| 4.3 Program stores lifecycle | 13 | ✓ |
| 4.4 API config | 6 | ✓ |
| 5.x Performance | 7-10 | ✓ |
| 6.x TypeScript/errors | 5, 6, 12, 21, 22 | ✓ |
| 7.x State/persistence | 11, 13, 15 | ✓ |

**Skipped items justification:** SectionHeader і FormSection — низький ROI зараз. ListItemCard — попередження в аудиті проти over-engineering. Усі інші покриті.

**Risks / open questions:**
- **Task 14 (Option A vs B)** потребує рішення власника. Default — Option A (інтегрувати rhf+zod), бо інакше залежності викинуто і zod-схеми (Task 21) теж відпадають.
- **Phase 4 порядок:** Task 16 (ChoiceCard) використовується в Task 19 (TypeSelectorSection). Якщо PR-и зливаються нелінійно — звертати увагу.
- **Task 22 (strict flags)** може породити каскад помилок. Робити останнім або окремою фокусованою сесією.

---

**Plan complete and saved to `docs/AUDIT_2026-05-28_PLAN.md`.**
