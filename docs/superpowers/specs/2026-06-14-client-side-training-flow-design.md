# Client-Side Training Flow — Design

**Date:** 2026-06-14
**Status:** Approved (design), pending implementation plan
**Branch:** refactor/architecture-cleanup

## Problem

The client side of the app has no way to *do* a workout. Today a client can only
discover trainers, book sessions, and review past progress (read-only). The live
training experience — going through exercises, logging sets/reps/weight, rest
timers, finishing — exists **only on the trainer side**
(`src/screens/clients/` + `activeTrainingStore`).

A client must be able to:

1. **Compose their own workout** (from ready-made programs *and* from individual
   exercises), or
2. **Receive a ready-made workout from their trainer**, then
3. Press **Start training** and get **the same live training flow the trainer has**.

Trainer and client must share the **same session model** so the two stay
consistent. (Decision below.)

## Decisions (from brainstorming)

- **Synchronization meaning:** *Shared session model (mock).* Both roles work
  against one session data structure / one store. We do **not** build real-time
  over-the-network sync now — there is no live backend yet (PHP backend is
  in progress). The shared structure is what a future backend will sync.
- **Self-composed workout source:** *Ready-made programs **and** individual
  exercises.* A client can start a ready `TrainingProgram`, or assemble an
  ad-hoc workout from individual exercises.
- **Architecture:** *Extract a shared live-training module + generalize the
  store* (chosen over parallel client screens or unrefactored reuse). This is
  the only option that honestly realizes the "shared session model" with a
  single source of truth.
- **Entry point:** *A dedicated "Train" tab/stack* in the client navigation.

## Architecture

Create a neutral, role-agnostic live-training module shared by both roles.

```
src/screens/training/                ← NEW (relocated from screens/clients/)
  ExerciseDetailScreen.tsx           ← relocated, types generalized
  TrainingSummaryScreen.tsx          ← relocated
  ExerciseDetail/SetEditor.tsx       ← relocated
src/store/activeTrainingStore.ts     ← generalized (see Data model)
src/utils/activeTraining.ts          ← generalized seed logic
```

`ExerciseDetailScreen` and `TrainingSummaryScreen` become role-agnostic:

- Read the active session from the store.
- Show the participant switcher **only when participants > 1** (already the
  behavior via `clients.length > 1`).
- Resolve exercises **from the session participant itself**, not from the global
  `mockTrainingPrograms` lookup — this is required so ad-hoc workouts (which have
  no mock program) work.

**Stays trainer-side** (these are client-management screens, not live training):
`ClientProfileScreen`, `ClientsProfileExtendedScreen`, `ProgramDetailScreen`,
`ClientsListScreen`, `FiltersScreen`. They only update imports to the relocated
shared screens.

### Shared navigation typing

Both stacks register the route names `ExerciseDetail` and `TrainingSummary`. The
shared screens are typed against a shared fragment so they navigate correctly
inside either stack:

- Trainer: `ClientsStackParamList` includes `ExerciseDetail` + `TrainingSummary`.
- Client: `TrainStackParamList` includes `ExerciseDetail` + `TrainingSummary`.

Define a shared `LiveTrainingParamList` fragment and include it in both
param-lists so the screens are not coupled to `ClientsStackParamList`.

## Data model (store generalization)

Rename `ActiveClient` → `SessionParticipant`, `clientId` → `participantId`. The
participant now carries **its own exercises**, so ad-hoc workouts need no global
program lookup:

```ts
export interface SessionParticipant {
  participantId: string;
  name: string;
  avatar?: string;
  programId: string | null;       // null for ad-hoc (hand-built) workouts
  exercises: ProgramExercise[];    // NEW: source of truth for live screens
  exerciseIndex: number;
  setIndex: number;
  setLog: Record<number, ExerciseSet[]>;
  prevSets: Record<number, ExerciseSet[]>;
  rest: RestState;
}
```

Store renames:

- State: `clients` → `participants`, `activeClientId` → `activeParticipantId`.
- Actions: keep `startTraining` / `endTraining`; `setActiveClient` →
  `setActiveParticipant`; all per-client action signatures take `participantId`.
- `RestState` unchanged.

The rename is mechanical, guarded by `tsc --noEmit` + Jest. All trainer callers
update in the same pass: `HomeScreen`, `ScheduleCard` handler,
`ClientsProfileExtendedScreen`, `ClientProfileScreen`, `ExerciseDetailScreen`,
`TrainingSummaryScreen`, `src/utils/activeTraining.ts`, and existing tests.

`seedActiveClient` (renamed `seedParticipant`) now also populates `exercises`
from the program (or from the ad-hoc exercise list). Live screens read
`participant.exercises` instead of `mockTrainingPrograms.find(...)`.

## Client navigation & screens

New `TrainStackNavigator`, mounted as a **Train** tab in `ClientTabNavigator`.
To stay at 5 tabs, the center slot (currently the FAB placeholder
"Book a session", `ClientAddTab`) becomes **Train** (dumbbell icon, same
prominent styling). "Book a session" is reached from the existing Home card and
`TrainerProfile` "Book Session" entry points, which already exist.

```
TrainStackParamList = {
  TrainHome           // landing: three start paths
  WorkoutOverview     // chosen workout's exercise list + "Start"
  WorkoutBuilder      // assemble an ad-hoc workout from individual exercises
  ProgramPicker       // pick a ready-made program (optional/inline)
  ExerciseDetail      // SHARED screen
  TrainingSummary     // SHARED screen
}
```

**TrainHome** offers three start paths:

1. **Assigned by trainer** — the client's pending sessions that have a
   `programId` (from `sessionsStore`).
2. **Ready-made program** — pick from `mockTrainingPrograms`.
3. **Build your own** — `WorkoutBuilder`: add exercises, set their sets /
   weight / reps.

All three converge on **WorkoutOverview** → `seedParticipant(currentUser, …)`
with **one** participant (the client themself) → **Start** → `ExerciseDetail` →
**Finish** → `TrainingSummary`. The switcher is hidden (single participant).

`currentUser` (id / name / avatar) comes from the existing client profile / mock
(resolve against current client mock data).

## Data flow, completion, testing

- **Start:** every path reduces to `startTraining([participant])`. `useRestTimer`
  is mounted in `TrainStackNavigator` (mirrors `ClientsStackNavigator`).
- **Completion:** `Finish` → `TrainingSummary`. Today `endTraining()` is not
  wired to completion (pre-existing trainer-side gap). Add: on the summary's
  "Done", write a `CompletedTraining` to `trainingHistoryStore` for the current
  user, then call `endTraining()`. This closes the loop
  *training → history → progress*, which the client Progress tab already reads.
- **Ad-hoc workouts:** `programId: null`, `exercises` from the builder;
  `prevSets` looked up from history by `exerciseId` when available.
- **Scope:** frontend-only on mocks. A future PHP backend syncs exactly this one
  session structure.

### Testing (TDD)

- Update existing `activeTrainingStore` tests to the renamed API (regression
  guard for the refactor).
- New tests:
  - seed a single participant (client themself) from a program.
  - ad-hoc seed: `programId === null`, exercises sourced from the builder.
  - completion writes a `CompletedTraining` to history and clears the session.
  - switcher hidden when participants.length === 1.

## Out of scope

- Real-time over-the-network sync between trainer and client devices.
- Backend persistence (PHP) — the shared model is the seam for it later.
- Trainer-side UI changes beyond the mechanical rename and import updates.
```

