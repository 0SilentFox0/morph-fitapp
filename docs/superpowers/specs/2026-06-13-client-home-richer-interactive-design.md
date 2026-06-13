# Client Home — Richer & Interactive (design)

**Date:** 2026-06-13
**Scope:** Moderate enrichment of the client Home screen, reusing the trainer's `ScheduleCard` and adding tasteful interactivity — without regressing UX or the trainer side.

## Goal

Make `ClientHomeScreen` more interesting and interactive in the app's own visual
language. Reuse the trainer `ScheduleCard` for the client's upcoming sessions
(instead of the current bespoke inline card), add a motivation banner, a quick-actions
row, an upcoming-sessions carousel, and subtle motion. All changes stay within the
existing dark theme token system and add **zero new dependencies**.

## Non-goals (YAGNI)

- No goals/targets data model. There is no goal data in `Session`/stores today;
  motivation is delivered via the streak banner using the existing
  `computeWeekStreak`. A goals system is explicitly out of scope.
- No new animation library. Motion uses React Native's built-in `Animated` +
  `LayoutAnimation`.
- No dedicated client "session detail" screen. The card tap reuses existing
  navigation handlers; a detail screen is a separate future spec.
- No changes to trainer-side screens or behavior.

## Current state (reference)

- `src/screens/client/home/ClientHomeScreen.tsx` — renders an inline "Next session"
  card, a "This week" stat row, a "Your trainer" card, and a "Your progress" snapshot
  (BodyMap). Wrapped in `HorizontalSwipe` for client tab switching.
- `src/components/ui/ScheduleCard.tsx` — the rich, reusable session card used by the
  trainer (`HomeScreen`, `ScheduleScreen`): colored status bar, title + `⋯` options,
  calendar/date row, participant pill, type tag, `StatusBadge` (with a `logo-usd` `$`
  icon), and an optional "Start training" button for pending sessions.
- `Session` shape (`src/mocks/data.ts`): `{ id, title, type, date, time, status,
  participants[], programId?, plannedSets? }`. **No trainer reference.**
- Theme tokens: `src/theme/{colors,spacing,radius,typography}.ts`. Styling via
  `StyleSheet.create` + tokens. Dark theme only.
- Tests: `@testing-library/react-native` + `jest-expo`; existing
  `src/__tests__/screens/client/`.

## Architecture

### 1. `ScheduleCard` — add a `variant`

Make `ScheduleCard` serve both sides from one component.

```ts
interface ScheduleCardProps {
  session: Session;
  variant?: 'trainer' | 'client'; // default 'trainer'
  trainerName?: string;           // client variant only: renders a "w/ {name}" pill
  onPress?: (session: Session) => void;
  onOptionsPress?: (session: Session) => void;
  onStart?: (session: Session) => void;
}
```

- **Default is `'trainer'`** → all existing trainer call sites are unchanged
  (no prop added, identical render and behavior). This is the regression guard.
- **`client` variant** renders the same card shell but:
  - hides the `⋯` options menu (ignores `onOptionsPress`),
  - hides the "Start training" button (ignores `onStart`),
  - `StatusBadge` renders **without** the `logo-usd` `$` icon — plain status
    (`Completed` / `Pending` / `Canceled`),
  - **hides the participant pill by default** (participants are other clients, not
    meaningful to the viewer). If `trainerName` is provided, render a single pill
    `w/ {trainerName}` in its place.
  - whole-card tap → `onPress` (home wires it to its existing detail/nav handler).
- Keep `React.memo`. Keep the asymmetric radius + left status bar visual identity.

### 2. `ClientHomeScreen` layout (top → bottom)

1. **Header** — existing greeting + avatar. Unchanged.
2. **`StreakBanner`** *(new)* — accent-styled card: flame icon + "🔥 N-week streak"
   and a slim "sessions this week" progress sliver (`weekTotals.sessionCount`).
   Tappable → `ProgressTab`. Uses existing `streak` / `weekTotals` already computed
   in the screen's `useMemo`.
3. **`UpcomingCarousel`** *(new — replaces the single inline next-session card)* —
   horizontal **paged** `ScrollView` of `ScheduleCard variant="client"` for the next
   up-to-5 `upcoming` sessions; cards ~88% of content width so the next card peeks;
   `PagerDots` underneath. Passes `trainerName={myTrainer?.name}`. **Empty state** =
   the existing dashed "Book your next session" CTA (preserved).
4. **`QuickActions`** *(new)* — a row of 3 compact buttons:
   - **Book** → `navigation.navigate('BookSession')`
   - **Message** → `goToTab('ChatTab')`
   - **Progress** → `goToTab('ProgressTab')`
5. **This week** — existing stat row; numbers animate via `AnimatedCounter`.
6. **Your trainer** — existing card. Unchanged.
7. **Your progress** — existing BodyMap snapshot. Unchanged.

### 3. Motion (built-in `Animated`)

- `FadeInUp` wrapper: staggered fade + translateY on mount, applied per section.
- `AnimatedCounter`: counts a number up to its target (This-week stats; banner sliver).
- `PagerDots`: active dot animates width/opacity on page change.
- `useReduceMotion` hook (wraps `AccessibilityInfo.isReduceMotionEnabled` +
  change listener): when reduce-motion is on, all of the above render their final
  state immediately. Tests force this on for determinism.

### 4. New units (each small, single-purpose)

| Unit | Path | Responsibility |
|------|------|----------------|
| `ScheduleCard` (edit) | `src/components/ui/ScheduleCard.tsx` | add `variant`/`trainerName` |
| `StreakBanner` | `src/components/ui/StreakBanner.tsx` | streak + weekly-progress banner |
| `QuickActions` | `src/components/ui/QuickActions.tsx` | 3-button action row |
| `UpcomingCarousel` | `src/screens/client/home/UpcomingCarousel.tsx` | paged ScheduleCards + dots + empty CTA |
| `PagerDots` | `src/components/ui/PagerDots.tsx` | pagination dots |
| `FadeInUp` | `src/components/ui/FadeInUp.tsx` | mount entrance animation wrapper |
| `AnimatedCounter` | `src/components/ui/AnimatedCounter.tsx` | count-up number |
| `useReduceMotion` | `src/hooks/useReduceMotion.ts` | reduce-motion flag |

New UI components are exported from `src/components/ui/index.ts` to match the existing
barrel pattern.

## Data flow

`ClientHomeScreen` already derives everything needed; no store changes:
- `upcoming = getUpcomingSessions()` → carousel (slice to 5).
- `streak`, `weekTotals` (from the existing `useMemo`) → `StreakBanner`.
- `myTrainer` → `UpcomingCarousel` `trainerName` prop.
- Navigation handlers already present (`navigation`, `goToTab`) → `QuickActions`.

## UX safeguards

- **Carousel vs. tab-swipe gesture:** `HorizontalSwipe` uses *non-capturing*
  `onMoveShouldSetPanResponder`, so the inner horizontal `ScrollView` becomes the
  responder for horizontal pans first — swiping the carousel pages cards, not tabs.
  Use paging (`pagingEnabled` / `snapToInterval`) so it feels deliberate. Verify on
  device that tab switching still works from the rest of the screen.
- **No layout jank:** card peek width and dot row are fixed-height; empty state keeps
  the same vertical rhythm as a populated carousel.
- Animations are short (≤300ms), respect reduce-motion, and never block interaction.
- All values from theme tokens — no hardcoded colors/spacing. (Per project memory,
  verify any accent fills against the intended palette rather than assuming.)

## Error / edge handling

- 0 upcoming sessions → dashed "Book your next session" CTA (unchanged behavior).
- 1 session → carousel renders a single card, no dots.
- 0 streak / 0 weekly sessions → banner shows an encouraging "Start your first session
  this week" state instead of "0-week streak".
- No connected trainer → carousel omits the `w/ …` pill; "Your trainer" section keeps
  its existing "Find a trainer" CTA; Message quick-action still routes to `ChatTab`.

## Testing

Following `src/__tests__/screens/client/` patterns with `@testing-library/react-native`:

- **`ScheduleCard` client variant:** renders status without the `$` icon; does **not**
  render `⋯` or "Start training"; renders `w/ {trainerName}` pill when provided and
  omits it otherwise. Trainer variant snapshot/behavior unchanged.
- **`ClientHomeScreen`:** renders `StreakBanner`, `QuickActions`, and a carousel with N
  cards; empty `upcoming` → "Book your next session" CTA; quick-action presses call the
  right navigation targets.
- Animation hooks run with reduce-motion forced on for deterministic output.

## Out of scope / future

- Client session-detail screen, reschedule/cancel actions.
- Achievements/goals surfaces beyond the streak banner.
- Trainer-side visual changes.
