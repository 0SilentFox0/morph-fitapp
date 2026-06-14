# Client Home — Richer & Interactive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the client Home screen richer and more interactive — reuse the trainer `ScheduleCard` for upcoming sessions, add a streak banner, quick-actions row, a paged upcoming-sessions carousel, and subtle built-in motion — without regressing the trainer side or UX.

**Architecture:** Add a `variant` prop to the existing `ScheduleCard` (default `'trainer'`, so trainer call sites are untouched) and build small, single-purpose UI pieces (`StreakBanner`, `QuickActions`, `PagerDots`, `UpcomingCarousel`) plus reusable animation primitives (`FadeInUp`, `AnimatedCounter`, `useReduceMotion`). Compose them into `ClientHomeScreen`. Motion uses React Native's built-in `Animated`/`AccessibilityInfo` only.

**Tech Stack:** React Native 0.83 + Expo 55, TypeScript, Zustand stores, `@expo/vector-icons` (Ionicons), theme tokens in `src/theme`, tests with `@testing-library/react-native` + `jest-expo`.

**Reference spec:** `docs/superpowers/specs/2026-06-13-client-home-richer-interactive-design.md`

**Conventions used below:**
- Run a single test file: `npx jest <path>`
- Typecheck: `npm run typecheck`  •  Lint: `npm run lint`
- New `ui/` components are exported from `src/components/ui/index.ts` (barrel).

---

### Task 1: `useReduceMotion` hook

**Files:**
- Create: `src/hooks/useReduceMotion.ts`
- Test: `src/__tests__/hooks/useReduceMotion.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/hooks/useReduceMotion.test.ts
import { renderHook } from '@testing-library/react-native';
import { useReduceMotion } from '../../hooks/useReduceMotion';

describe('useReduceMotion', () => {
  it('defaults to false before the async query resolves', async () => {
    const { result } = await renderHook(() => useReduceMotion());
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/hooks/useReduceMotion.test.ts`
Expected: FAIL — cannot find module `../../hooks/useReduceMotion`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/hooks/useReduceMotion.ts
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Tracks the OS "reduce motion" accessibility setting. Components use this to
 * skip animations (render their final state immediately). Defaults to false
 * until the async query resolves.
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduceMotion;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/__tests__/hooks/useReduceMotion.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useReduceMotion.ts src/__tests__/hooks/useReduceMotion.test.ts
git commit -m "feat(client): add useReduceMotion hook"
```

---

### Task 2: `FadeInUp` entrance wrapper

**Files:**
- Create: `src/components/ui/FadeInUp.tsx`
- Modify: `src/components/ui/index.ts`
- Test: `src/__tests__/components/FadeInUp.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/components/FadeInUp.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { FadeInUp } from '../../components/ui/FadeInUp';

describe('FadeInUp', () => {
  it('renders its children', async () => {
    await render(
      <FadeInUp>
        <Text>hello</Text>
      </FadeInUp>,
    );
    expect(screen.getByText('hello')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/components/FadeInUp.test.tsx`
Expected: FAIL — cannot find module `../../components/ui/FadeInUp`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/ui/FadeInUp.tsx
import React, { useEffect, useState } from 'react';
import { Animated, type ViewProps } from 'react-native';
import { useReduceMotion } from '../../hooks/useReduceMotion';

interface FadeInUpProps extends ViewProps {
  /** Stagger delay (ms) before this element animates in. */
  delay?: number;
  children: React.ReactNode;
}

/** Fades + slides its children up on mount. No-op when reduce-motion is on. */
export function FadeInUp({ delay = 0, children, style, ...rest }: FadeInUpProps) {
  const reduceMotion = useReduceMotion();
  // Held in state (lazy init) rather than a ref so it is not a ref read during
  // render — satisfies the react-hooks/refs lint rule while staying stable.
  const [progress] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 280,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [delay, progress, reduceMotion]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]} {...rest}>
      {children}
    </Animated.View>
  );
}
```

- [ ] **Step 4: Add the barrel export**

Add this line to `src/components/ui/index.ts` (after the `HorizontalSwipe` exports):

```ts
export { FadeInUp } from './FadeInUp';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/__tests__/components/FadeInUp.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/FadeInUp.tsx src/components/ui/index.ts src/__tests__/components/FadeInUp.test.tsx
git commit -m "feat(client): add FadeInUp entrance animation wrapper"
```

---

### Task 3: `AnimatedCounter`

**Files:**
- Create: `src/components/ui/AnimatedCounter.tsx`
- Modify: `src/components/ui/index.ts`
- Test: `src/__tests__/components/AnimatedCounter.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/components/AnimatedCounter.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

// With reduce-motion on, the counter renders its final formatted value immediately.
jest.mock('../../hooks/useReduceMotion', () => ({ useReduceMotion: () => true }));

describe('AnimatedCounter', () => {
  it('renders the formatted target value when reduce-motion is on', async () => {
    await render(<AnimatedCounter value={2100} format={(n) => `${n}kg`} />);
    expect(screen.getByText('2100kg')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/components/AnimatedCounter.test.tsx`
Expected: FAIL — cannot find module `../../components/ui/AnimatedCounter`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/ui/AnimatedCounter.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, type TextProps } from 'react-native';
import { useReduceMotion } from '../../hooks/useReduceMotion';

interface AnimatedCounterProps extends TextProps {
  value: number;
  /** Formats the (rounded) interpolated number into display text. */
  format?: (n: number) => string;
  duration?: number;
}

/** Counts a number up to `value` on change. Snaps to final when reduce-motion is on. */
export function AnimatedCounter({
  value,
  format = (n) => `${n}`,
  duration = 600,
  style,
  ...rest
}: AnimatedCounterProps) {
  const reduceMotion = useReduceMotion();
  // Keep latest formatter without retriggering the animation effect.
  const formatRef = useRef(format);
  formatRef.current = format;

  const anim = useRef(new Animated.Value(reduceMotion ? value : 0)).current;
  const [display, setDisplay] = useState(() => formatRef.current(reduceMotion ? value : 0));

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(formatRef.current(value));
      return;
    }
    const id = anim.addListener(({ value: v }) => setDisplay(formatRef.current(Math.round(v))));
    const animation = Animated.timing(anim, { toValue: value, duration, useNativeDriver: false });
    animation.start();
    return () => {
      animation.stop();
      anim.removeListener(id);
    };
  }, [value, duration, reduceMotion, anim]);

  return (
    <Text style={style} {...rest}>
      {display}
    </Text>
  );
}
```

- [ ] **Step 4: Add the barrel export**

Add to `src/components/ui/index.ts`:

```ts
export { AnimatedCounter } from './AnimatedCounter';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/__tests__/components/AnimatedCounter.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/AnimatedCounter.tsx src/components/ui/index.ts src/__tests__/components/AnimatedCounter.test.tsx
git commit -m "feat(client): add AnimatedCounter count-up component"
```

---

### Task 4: `PagerDots`

**Files:**
- Create: `src/components/ui/PagerDots.tsx`
- Modify: `src/components/ui/index.ts`
- Test: `src/__tests__/components/PagerDots.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/components/PagerDots.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PagerDots } from '../../components/ui/PagerDots';

describe('PagerDots', () => {
  it('renders one dot per page', async () => {
    await render(<PagerDots count={3} activeIndex={1} />);
    expect(screen.getAllByTestId('pager-dot')).toHaveLength(3);
  });

  it('renders nothing for a single page', async () => {
    await render(<PagerDots count={1} activeIndex={0} />);
    expect(screen.queryByTestId('pager-dot')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/components/PagerDots.test.tsx`
Expected: FAIL — cannot find module `../../components/ui/PagerDots`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/ui/PagerDots.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';

interface PagerDotsProps {
  count: number;
  activeIndex: number;
}

/** Pagination dots for a carousel. Renders nothing when there is one page or fewer. */
export function PagerDots({ count, activeIndex }: PagerDotsProps) {
  if (count <= 1) return null;
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          testID="pager-dot"
          style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { height: 6, borderRadius: radius.pill },
  dotActive: { width: 18, backgroundColor: colors.accent },
  dotInactive: { width: 6, backgroundColor: colors.neutral4 },
});
```

- [ ] **Step 4: Add the barrel export**

Add to `src/components/ui/index.ts`:

```ts
export { PagerDots } from './PagerDots';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/__tests__/components/PagerDots.test.tsx`
Expected: PASS (both cases).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/PagerDots.tsx src/components/ui/index.ts src/__tests__/components/PagerDots.test.tsx
git commit -m "feat(client): add PagerDots pagination component"
```

---

### Task 5: `ScheduleCard` — add `variant` / `trainerName`

**Files:**
- Modify: `src/components/ui/ScheduleCard.tsx`
- Test: `src/__tests__/components/ScheduleCard.test.tsx`

The default `variant='trainer'` keeps every existing trainer call site byte-for-byte unchanged. The `client` variant hides the `⋯` menu, the "Start training" button, and the `$` payment icon, and shows an optional `w/ {trainerName}` pill instead of the participant pill.

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/components/ScheduleCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ScheduleCard } from '../../components/ui/ScheduleCard';
import type { Session } from '../../mocks';

const session: Session = {
  id: 's1',
  title: 'Upper body strength',
  type: 'HIIT',
  date: 'Mon 16 Jun',
  time: '18:00',
  status: 'pending',
  participants: [{ id: 'c1', name: 'Alex' }],
};

describe('ScheduleCard client variant', () => {
  it('renders the status label and title', async () => {
    await render(<ScheduleCard session={session} variant="client" />);
    expect(screen.getByText('Upper body strength')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('hides the options menu and start button', async () => {
    await render(
      <ScheduleCard session={session} variant="client" onStart={jest.fn()} onOptionsPress={jest.fn()} />,
    );
    expect(screen.queryByTestId('schedule-card-options')).toBeNull();
    expect(screen.queryByText('Start training')).toBeNull();
  });

  it('shows the trainer pill only when trainerName is provided', async () => {
    await render(<ScheduleCard session={session} variant="client" />);
    expect(screen.queryByText('w/ Coach Sam')).toBeNull();
    await render(<ScheduleCard session={session} variant="client" trainerName="Coach Sam" />);
    expect(screen.getByText('w/ Coach Sam')).toBeTruthy();
  });

  it('trainer variant still shows the options menu', async () => {
    await render(<ScheduleCard session={session} variant="trainer" onOptionsPress={jest.fn()} />);
    expect(screen.getByTestId('schedule-card-options')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/components/ScheduleCard.test.tsx`
Expected: FAIL — `variant` not supported; options menu has no testID; trainer pill logic absent.

- [ ] **Step 3: Update the props interface**

In `src/components/ui/ScheduleCard.tsx`, replace the `ScheduleCardProps` interface (lines ~11-17) with:

```tsx
interface ScheduleCardProps {
  session: Session;
  /** 'trainer' (default) keeps the full trainer UI; 'client' hides trainer-only bits. */
  variant?: 'trainer' | 'client';
  /** Client variant only: renders a "w/ {trainerName}" pill in place of participants. */
  trainerName?: string;
  onPress?: (session: Session) => void;
  onOptionsPress?: (session: Session) => void;
  /** When provided (trainer variant), a "Start training" button shows for pending sessions. */
  onStart?: (session: Session) => void;
}
```

- [ ] **Step 4: Update the component body**

Replace the function signature and the derived-values block (lines ~31-38) with:

```tsx
function ScheduleCardImpl({
  session,
  variant = 'trainer',
  trainerName,
  onPress,
  onOptionsPress,
  onStart,
}: ScheduleCardProps) {
  const isClient = variant === 'client';
  const barColor = statusBarColor[session.status];
  const statusLabel = session.status.charAt(0).toUpperCase() + session.status.slice(1);
  const isGroup = session.participants.length !== 1;
  const nameLabel = isGroup ? 'Group' : session.participants[0]?.name ?? 'Group';
  const handlePress = onPress ? () => onPress(session) : undefined;
  const handleOptionsPress = onOptionsPress ? () => onOptionsPress(session) : undefined;
  const canStart = !isClient && !!onStart && session.status === 'pending';
```

- [ ] **Step 5: Gate the options menu (add testID)**

Replace the options `TouchableOpacity` in the `topRow` (lines ~46-51) with:

```tsx
          {!isClient && (
            <TouchableOpacity
              testID="schedule-card-options"
              onPress={handleOptionsPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
```

- [ ] **Step 6: Swap the bottom-left pill for client/trainer**

Replace the `bottomLeft` block (lines ~60-64) with:

```tsx
          <View style={styles.bottomLeft}>
            {isClient ? (
              trainerName ? (
                <View style={[styles.namePill, styles.namePillSingle]}>
                  <Text style={styles.nameText}>w/ {trainerName}</Text>
                </View>
              ) : null
            ) : (
              <View style={[styles.namePill, isGroup ? styles.namePillGroup : styles.namePillSingle]}>
                <Text style={styles.nameText}>{nameLabel}</Text>
              </View>
            )}
          </View>
```

- [ ] **Step 7: Drop the `$` icon for the client StatusBadge**

Replace the `StatusBadge` in the `bottomRight` block (lines ~69-73) with:

```tsx
            <StatusBadge
              icon={isClient ? undefined : 'logo-usd'}
              label={statusLabel}
              color={statusBadgeColor[session.status]}
            />
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx jest src/__tests__/components/ScheduleCard.test.tsx`
Expected: PASS (all four cases).

- [ ] **Step 9: Run the full suite to confirm no trainer-side regression**

Run: `npx jest`
Expected: PASS — existing trainer screen/card tests unaffected (default variant unchanged).

- [ ] **Step 10: Commit**

```bash
git add src/components/ui/ScheduleCard.tsx src/__tests__/components/ScheduleCard.test.tsx
git commit -m "feat(client): add client variant to ScheduleCard"
```

---

### Task 6: `StreakBanner`

**Files:**
- Create: `src/components/ui/StreakBanner.tsx`
- Modify: `src/components/ui/index.ts`
- Test: `src/__tests__/components/StreakBanner.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/components/StreakBanner.test.tsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StreakBanner } from '../../components/ui/StreakBanner';

describe('StreakBanner', () => {
  it('shows the streak count when there is a streak', async () => {
    await render(<StreakBanner streak={3} sessionsThisWeek={2} />);
    expect(screen.getByText('3-week streak')).toBeTruthy();
    expect(screen.getByText('2/3 sessions this week')).toBeTruthy();
  });

  it('shows an encouraging message when there is no streak', async () => {
    await render(<StreakBanner streak={0} sessionsThisWeek={0} />);
    expect(screen.getByText('Start your streak this week')).toBeTruthy();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<StreakBanner streak={1} sessionsThisWeek={1} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('streak-banner'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/components/StreakBanner.test.tsx`
Expected: FAIL — cannot find module `../../components/ui/StreakBanner`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/ui/StreakBanner.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';

interface StreakBannerProps {
  streak: number;
  sessionsThisWeek: number;
  weeklyTarget?: number;
  onPress?: () => void;
}

/** Motivation banner: current week-streak + weekly session progress. */
export function StreakBanner({ streak, sessionsThisWeek, weeklyTarget = 3, onPress }: StreakBannerProps) {
  const pct = weeklyTarget > 0 ? Math.min(1, sessionsThisWeek / weeklyTarget) : 0;
  const hasStreak = streak > 0;

  return (
    <TouchableOpacity style={styles.banner} activeOpacity={0.85} onPress={onPress} testID="streak-banner">
      <View style={styles.flame}>
        <Ionicons name="flame" size={22} color={colors.accent} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>
          {hasStreak ? `${streak}-week streak` : 'Start your streak this week'}
        </Text>
        <Text style={styles.sub}>
          {sessionsThisWeek}/{weeklyTarget} sessions this week
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  flame: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 4 },
  title: { fontSize: typography.sizes.base, color: colors.text, fontWeight: typography.weights.semibold },
  sub: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.neutral3, overflow: 'hidden', marginTop: 2 },
  fill: { height: 6, borderRadius: radius.pill, backgroundColor: colors.accent },
});
```

- [ ] **Step 4: Add the barrel export**

Add to `src/components/ui/index.ts`:

```ts
export { StreakBanner } from './StreakBanner';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/__tests__/components/StreakBanner.test.tsx`
Expected: PASS (all three cases).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/StreakBanner.tsx src/components/ui/index.ts src/__tests__/components/StreakBanner.test.tsx
git commit -m "feat(client): add StreakBanner component"
```

---

### Task 7: `QuickActions`

**Files:**
- Create: `src/components/ui/QuickActions.tsx`
- Modify: `src/components/ui/index.ts`
- Test: `src/__tests__/components/QuickActions.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/components/QuickActions.test.tsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { QuickActions } from '../../components/ui/QuickActions';

describe('QuickActions', () => {
  it('fires the matching handler for each action', async () => {
    const onBook = jest.fn();
    const onMessage = jest.fn();
    const onProgress = jest.fn();
    await render(<QuickActions onBook={onBook} onMessage={onMessage} onProgress={onProgress} />);

    fireEvent.press(screen.getByTestId('quick-action-book'));
    fireEvent.press(screen.getByTestId('quick-action-message'));
    fireEvent.press(screen.getByTestId('quick-action-progress'));

    expect(onBook).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/components/QuickActions.test.tsx`
Expected: FAIL — cannot find module `../../components/ui/QuickActions`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/ui/QuickActions.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';

interface QuickActionsProps {
  onBook: () => void;
  onMessage: () => void;
  onProgress: () => void;
}

/** Row of one-tap shortcuts to the most common client tasks. */
export function QuickActions({ onBook, onMessage, onProgress }: QuickActionsProps) {
  const items = [
    { key: 'book', icon: 'add-circle-outline', label: 'Book', onPress: onBook },
    { key: 'message', icon: 'chatbubble-ellipses-outline', label: 'Message', onPress: onMessage },
    { key: 'progress', icon: 'stats-chart-outline', label: 'Progress', onPress: onProgress },
  ] as const;

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          testID={`quick-action-${item.key}`}
          style={styles.action}
          activeOpacity={0.8}
          onPress={item.onPress}
        >
          <Ionicons name={item.icon} size={22} color={colors.accent} />
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  action: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: { fontSize: typography.sizes.sm, color: colors.text },
});
```

- [ ] **Step 4: Add the barrel export**

Add to `src/components/ui/index.ts`:

```ts
export { QuickActions } from './QuickActions';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/__tests__/components/QuickActions.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/QuickActions.tsx src/components/ui/index.ts src/__tests__/components/QuickActions.test.tsx
git commit -m "feat(client): add QuickActions row"
```

---

### Task 8: `UpcomingCarousel`

**Files:**
- Create: `src/screens/client/home/UpcomingCarousel.tsx`
- Test: `src/__tests__/screens/client/UpcomingCarousel.test.tsx`

Lives next to the screen (composition specific to client home), and reuses `ScheduleCard` + `PagerDots` from the `ui` barrel.

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/screens/client/UpcomingCarousel.test.tsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { UpcomingCarousel } from '../../../screens/client/home/UpcomingCarousel';
import type { Session } from '../../../mocks';

const make = (id: string, title: string): Session => ({
  id,
  title,
  type: 'HIIT',
  date: 'Mon 16 Jun',
  time: '18:00',
  status: 'pending',
  participants: [{ id: 'c1', name: 'Alex' }],
});

describe('UpcomingCarousel', () => {
  it('shows the book CTA when there are no sessions', async () => {
    const onBook = jest.fn();
    await render(<UpcomingCarousel sessions={[]} onPressSession={jest.fn()} onBook={onBook} />);
    fireEvent.press(screen.getByTestId('book-cta'));
    expect(onBook).toHaveBeenCalled();
  });

  it('renders a card per session with pagination dots', async () => {
    await render(
      <UpcomingCarousel
        sessions={[make('1', 'Leg day'), make('2', 'Push day')]}
        onPressSession={jest.fn()}
        onBook={jest.fn()}
      />,
    );
    expect(screen.getByText('Leg day')).toBeTruthy();
    expect(screen.getByText('Push day')).toBeTruthy();
    expect(screen.getAllByTestId('pager-dot')).toHaveLength(2);
  });

  it('calls onPressSession when a card is tapped', async () => {
    const onPressSession = jest.fn();
    await render(
      <UpcomingCarousel sessions={[make('1', 'Leg day')]} onPressSession={onPressSession} onBook={jest.fn()} />,
    );
    fireEvent.press(screen.getByText('Leg day'));
    expect(onPressSession).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/screens/client/UpcomingCarousel.test.tsx`
Expected: FAIL — cannot find module `../../../screens/client/home/UpcomingCarousel`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/screens/client/home/UpcomingCarousel.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScheduleCard, PagerDots } from '../../../components/ui';
import type { Session } from '../../../mocks';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';

interface UpcomingCarouselProps {
  sessions: Session[];
  trainerName?: string;
  onPressSession: (session: Session) => void;
  onBook: () => void;
}

const GAP = spacing.sm;

/** Horizontal paged carousel of the client's upcoming sessions (client ScheduleCard). */
export function UpcomingCarousel({ sessions, trainerName, onPressSession, onBook }: UpcomingCarouselProps) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  // Card peeks the next one; screen content has spacing.lg horizontal padding.
  const cardWidth = Math.round((width - spacing.lg * 2) * 0.88);
  const interval = cardWidth + GAP;

  if (sessions.length === 0) {
    return (
      <TouchableOpacity style={styles.cta} activeOpacity={0.8} onPress={onBook} testID="book-cta">
        <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
        <Text style={styles.ctaText}>Book your next session</Text>
      </TouchableOpacity>
    );
  }

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / interval));
  };

  return (
    <View testID="upcoming-carousel">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={interval}
        snapToAlignment="start"
        onMomentumScrollEnd={onScrollEnd}
      >
        {sessions.map((s) => (
          <View key={s.id} style={{ width: cardWidth, marginRight: GAP }}>
            <ScheduleCard session={s} variant="client" trainerName={trainerName} onPress={onPressSession} />
          </View>
        ))}
      </ScrollView>
      <PagerDots count={sessions.length} activeIndex={index} />
    </View>
  );
}

const styles = StyleSheet.create({
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral4,
    borderStyle: 'dashed',
  },
  ctaText: { fontSize: typography.sizes.base, color: colors.text },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/__tests__/screens/client/UpcomingCarousel.test.tsx`
Expected: PASS (all three cases).

- [ ] **Step 5: Commit**

```bash
git add src/screens/client/home/UpcomingCarousel.tsx src/__tests__/screens/client/UpcomingCarousel.test.tsx
git commit -m "feat(client): add UpcomingCarousel section"
```

---

### Task 9: Integrate into `ClientHomeScreen`

**Files:**
- Modify: `src/screens/client/home/ClientHomeScreen.tsx`
- Test: `src/__tests__/screens/client/clientScreens.test.tsx` (extend)

Compose the new pieces: streak banner → upcoming carousel → quick actions → animated "This week" → existing trainer/progress sections, each wrapped in `FadeInUp` with a staggered delay. The card tap and quick-action "Message" both route to `ChatTab` (no client session-detail screen exists yet — see spec out-of-scope).

- [ ] **Step 1: Replace the whole screen file**

Replace the entire contents of `src/screens/client/home/ClientHomeScreen.tsx` with:

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ClientHomeStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import {
  BodyMap,
  Avatar,
  SectionTitle,
  HorizontalSwipe,
  StreakBanner,
  QuickActions,
  FadeInUp,
  AnimatedCounter,
} from '../../../components/ui';
import { UpcomingCarousel } from './UpcomingCarousel';
import { useClientTabSwipe } from '../useClientTabSwipe';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useAppStore } from '../../../store/appStore';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { useSessionsStore } from '../../../store/sessionsStore';
import { useTrainersStore } from '../../../store/trainersStore';
import { exerciseMuscleMap } from '../../../mocks';
import { computeMuscleStats, toIntensities, computeTotals, filterByTimeframe } from '../../../utils/muscleStats';
import { computeWeekStreak } from '../../../utils/achievements';
import { MUSCLE_GROUPS, MUSCLE_LABELS } from '../../../constants/muscles';

type Nav = NativeStackNavigationProp<ClientHomeStackParamList, 'ClientHome'>;
type TabNav = { navigate: (name: string, params?: object) => void };

const formatKg = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n)}kg`);

export function ClientHomeScreen() {
  const navigation = useNavigation<Nav>();
  const userName = useAppStore((s) => s.userName);
  // Select stable method refs and the raw state they depend on; calling a getter
  // *inside* the selector returns a fresh array each render → infinite loop.
  const getCurrentUserHistory = useTrainingHistoryStore((s) => s.getCurrentUserHistory);
  useTrainingHistoryStore((s) => s.history);
  const getUpcomingSessions = useSessionsStore((s) => s.getUpcomingSessions);
  useSessionsStore((s) => s.sessions);
  const trainers = useTrainersStore((s) => s.trainers);
  const history = getCurrentUserHistory();
  const upcoming = getUpcomingSessions();

  const tabNav = navigation.getParent() as unknown as TabNav | undefined;
  const goToTab = (tab: string) => tabNav?.navigate(tab);
  const tabSwipe = useClientTabSwipe('ClientHomeTab');

  const { intensities, totals, weekTotals, streak, topMuscle } = React.useMemo(() => {
    const now = new Date();
    const stats = computeMuscleStats(history, exerciseMuscleMap);
    const top = MUSCLE_GROUPS.filter((g) => stats[g].exerciseCount > 0).sort(
      (a, b) => stats[b].totalWeight - stats[a].totalWeight,
    )[0];
    return {
      intensities: toIntensities(stats),
      totals: computeTotals(history),
      weekTotals: computeTotals(filterByTimeframe(history, 'week', now)),
      streak: computeWeekStreak(history, now),
      topMuscle: top ? MUSCLE_LABELS[top] : null,
    };
  }, [history]);

  const nextSessions = React.useMemo(() => upcoming.slice(0, 5), [upcoming]);
  const myTrainer = trainers.find((t) => t.connection !== 'none');

  return (
    <HorizontalSwipe style={styles.container} onSwipeLeft={tabSwipe.onSwipeLeft} onSwipeRight={tabSwipe.onSwipeRight}>
      <ScreenHeader
        title={userName ? `Hi, ${userName}` : 'Hi there'}
        showBack={false}
        transparent
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('ClientProfile')}>
            <Avatar name={userName ?? 'You'} size={32} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Streak / motivation */}
        <FadeInUp delay={0}>
          <StreakBanner
            streak={streak}
            sessionsThisWeek={weekTotals.sessionCount}
            onPress={() => goToTab('ProgressTab')}
          />
        </FadeInUp>

        {/* Next sessions */}
        <FadeInUp delay={60}>
          <SectionTitle>Next sessions</SectionTitle>
          <UpcomingCarousel
            sessions={nextSessions}
            trainerName={myTrainer?.name}
            onPressSession={() => goToTab('ChatTab')}
            onBook={() => navigation.navigate('BookSession')}
          />
        </FadeInUp>

        {/* Quick actions */}
        <FadeInUp delay={120}>
          <QuickActions
            onBook={() => navigation.navigate('BookSession')}
            onMessage={() => goToTab('ChatTab')}
            onProgress={() => goToTab('ProgressTab')}
          />
        </FadeInUp>

        {/* This week */}
        <FadeInUp delay={180}>
          <SectionTitle>This week</SectionTitle>
          <View style={styles.weekRow}>
            <WeekTile value={<AnimatedCounter style={styles.weekValue} value={weekTotals.sessionCount} />} label="Sessions" />
            <WeekTile value={formatKg(weekTotals.tonnage)} label="Volume" />
            <WeekTile value={<AnimatedCounter style={styles.weekValue} value={streak} />} label="Streak" />
            <WeekTile value={topMuscle ?? '—'} label="Top muscle" />
          </View>
        </FadeInUp>

        {/* My trainer */}
        <FadeInUp delay={240}>
          <SectionTitle>Your trainer</SectionTitle>
          {myTrainer ? (
            <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => goToTab('ChatTab')}>
              <Avatar name={myTrainer.name} uri={myTrainer.avatar} size={44} />
              <View style={styles.cardMain}>
                <Text style={styles.cardTitle}>{myTrainer.name}</Text>
                <Text style={styles.cardSub}>{myTrainer.headline}</Text>
              </View>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.ctaCard} activeOpacity={0.8} onPress={() => goToTab('TrainersTab')}>
              <Ionicons name="search-outline" size={22} color={colors.accent} />
              <Text style={styles.ctaText}>Find a trainer</Text>
            </TouchableOpacity>
          )}
        </FadeInUp>

        {/* Progress snapshot */}
        <FadeInUp delay={300}>
          <SectionTitle>Your progress</SectionTitle>
          <TouchableOpacity style={styles.progressCard} activeOpacity={0.9} onPress={() => goToTab('ProgressTab')}>
            <View style={styles.miniMap}>
              <BodyMap intensities={intensities} view="front" scale={0.6} />
            </View>
            <View style={styles.progressStats}>
              <Stat value={formatKg(totals.tonnage)} label="Total volume" />
              <Stat value={`${totals.sessionCount}`} label="Sessions" />
              <Stat value={`${streak}`} label="Week streak" />
              <View style={styles.viewMore}>
                <Text style={styles.viewMoreText}>View details</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accent} />
              </View>
            </View>
          </TouchableOpacity>
        </FadeInUp>
      </ScrollView>
    </HorizontalSwipe>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function WeekTile({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <View style={styles.weekTile}>
      {typeof value === 'string' ? (
        <Text style={styles.weekValue} numberOfLines={1}>
          {value}
        </Text>
      ) : (
        value
      )}
      <Text style={styles.weekLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardMain: { flex: 1, gap: 2 },
  cardTitle: { fontSize: typography.sizes.base, color: colors.text, fontWeight: typography.weights.semibold },
  cardSub: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral4,
    borderStyle: 'dashed',
  },
  ctaText: { fontSize: typography.sizes.base, color: colors.text },
  progressCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.neutral1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  miniMap: { width: 110, alignItems: 'center', justifyContent: 'center' },
  progressStats: { flex: 1, gap: spacing.sm },
  stat: { gap: 0 },
  statValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  weekRow: { flexDirection: 'row', gap: spacing.xs },
  weekTile: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
  },
  weekValue: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.text },
  weekLabel: { fontSize: 10, color: colors.textSecondary },
  viewMore: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  viewMoreText: { fontSize: typography.sizes.sm, color: colors.accent, fontWeight: typography.weights.semibold },
});
```

- [ ] **Step 2: Extend the screen test with content assertions**

Add this `describe` block to the end of `src/__tests__/screens/client/clientScreens.test.tsx`:

```tsx
import { fireEvent, screen } from '@testing-library/react-native';
import { useSessionsStore } from '../../../store/sessionsStore';

describe('ClientHomeScreen enriched home', () => {
  it('renders the streak banner and quick actions', async () => {
    await render(<ClientHomeScreen />);
    expect(screen.getByTestId('streak-banner')).toBeTruthy();
    expect(screen.getByTestId('quick-action-book')).toBeTruthy();
    expect(screen.getByTestId('quick-action-message')).toBeTruthy();
    expect(screen.getByTestId('quick-action-progress')).toBeTruthy();
  });

  it('shows the book CTA when there are no upcoming sessions', async () => {
    useSessionsStore.setState({ sessions: [] });
    await render(<ClientHomeScreen />);
    expect(screen.getByTestId('book-cta')).toBeTruthy();
  });

  it('routes Book quick action to BookSession', async () => {
    await render(<ClientHomeScreen />);
    fireEvent.press(screen.getByTestId('quick-action-book'));
    expect(mockNavigate).toHaveBeenCalledWith('BookSession');
  });
});
```

- [ ] **Step 3: Run the screen tests**

Run: `npx jest src/__tests__/screens/client/clientScreens.test.tsx`
Expected: PASS — including the existing "no infinite render loop" guard for `ClientHomeScreen`.

- [ ] **Step 4: Run the full suite**

Run: `npx jest`
Expected: PASS across all files.

- [ ] **Step 5: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/screens/client/home/ClientHomeScreen.tsx src/__tests__/screens/client/clientScreens.test.tsx
git commit -m "feat(client): richer interactive home screen"
```

---

### Task 10: Manual verification & final pass

**Files:** none (verification only)

- [ ] **Step 1: Launch the app**

Run: `npm run ios` (or `npm run web`) and open the client Home screen.

- [ ] **Step 2: Verify behavior**

Confirm visually:
- Streak banner shows the current streak (or the "Start your streak this week" empty state) and weekly progress sliver fills.
- "Next sessions" shows the trainer-style `ScheduleCard`(s) in a carousel; swiping pages cards and the pager dots track the active card.
- Swiping **outside** the carousel still switches client tabs (carousel swipe does not break tab swipe).
- Quick actions navigate: Book → Book session, Message → Chat, Progress → Progress.
- Sections fade/slide in on mount; "This week" Sessions/Streak numbers count up.
- The empty state (no upcoming sessions) shows the dashed "Book your next session" CTA.

- [ ] **Step 3: Verify reduce-motion**

Enable "Reduce Motion" in the simulator (Settings → Accessibility → Motion) and reload. Confirm sections appear in their final state immediately and numbers show their final values with no animation.

- [ ] **Step 4: Final full verification**

Run: `npx jest && npm run typecheck && npm run lint`
Expected: all pass.

---

## Self-Review notes (author)

- **Spec coverage:** ScheduleCard variant (Task 5) ✓; streak banner (6) ✓; upcoming carousel (8) ✓; quick actions (7) ✓; motion + reduce-motion (1–3, 9) ✓; integration + edge cases (9) ✓; testing (each task) ✓; gesture-conflict verification (10) ✓. No goals model (out of scope) ✓.
- **Type consistency:** `variant`/`trainerName` props match across Tasks 5/8/9; `StreakBanner`, `QuickActions`, `UpcomingCarousel`, `PagerDots`, `AnimatedCounter`, `FadeInUp` signatures are identical wherever referenced.
- **Naming note:** quick-action testIDs are `quick-action-{book|message|progress}` consistently in Tasks 7 and 9.
