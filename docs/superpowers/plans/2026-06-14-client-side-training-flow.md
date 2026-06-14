# Client-Side Training Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give clients a live workout experience — start a trainer-assigned workout, a ready-made program, or a self-built one — reusing the trainer's live-training flow through one shared session model.

**Architecture:** Extract the live-training screens into a neutral `src/screens/training/` module and generalize `activeTrainingStore` from "trainer's clients" to role-agnostic "session participants" (each participant carries its own `exercises`, so ad-hoc workouts need no global program lookup). The client gets a new `Train` tab whose three entry paths all converge on `startTraining([participant])` with a single participant (the client themself) and then drive the shared `ExerciseDetail` → `TrainingSummary` screens.

**Tech Stack:** React Native 0.83 / Expo 55, TypeScript, Zustand, React Navigation (native-stack + bottom-tabs), Jest. No backend — mock data + in-memory stores.

**Spec:** `docs/superpowers/specs/2026-06-14-client-side-training-flow-design.md`

---

## File Structure

**Generalized (Part 1 — trainer side keeps working):**
- `src/store/activeTrainingStore.ts` — rename `ActiveClient`→`SessionParticipant`, `clientId`→`participantId`, `clients`→`participants`, `activeClientId`→`activeParticipantId`; add `exercises` field.
- `src/utils/activeTraining.ts` — `seedActiveClient`→`seedParticipant` (populates `exercises`); add `seedCustomParticipant` for ad-hoc workouts.
- `src/hooks/useRestTimer.ts` — follow renamed state.
- `src/navigation/types.ts` — add shared `LiveTrainingParamList` fragment; `ClientsStackParamList` reuses it; add `TrainStackParamList`, extend `ClientTabParamList`.
- `src/screens/training/ExerciseDetailScreen.tsx` — relocated from `screens/clients/`; reads `participant.exercises`.
- `src/screens/training/TrainingSummaryScreen.tsx` — relocated; reads `participant.exercises`; adds "Done" that saves history + ends the session.
- `src/screens/training/ExerciseDetail/SetEditor.tsx` — relocated unchanged.
- `src/store/trainingHistoryStore.ts` — add `addCompletedTraining`.
- `src/services/repositories/trainingHistoryRepository.ts` — add `getCurrentUser`.

**New (Part 2 — client Train tab):**
- `src/navigation/client/TrainStackNavigator.tsx`
- `src/screens/client/train/TrainHomeScreen.tsx`
- `src/screens/client/train/WorkoutOverviewScreen.tsx`
- `src/screens/client/train/WorkoutBuilderScreen.tsx`
- `src/utils/exerciseCatalog.ts` — dedup exercise catalog for the builder.
- `src/components/icons/TabBarIcons.tsx` — add `TrainTabIcon`.

**Updated consumers (import/route only):** `src/navigation/ClientsStackNavigator.tsx`, `src/screens/clients/ClientProfileScreen.tsx`, `src/screens/clients/ClientsProfileExtendedScreen.tsx`, `src/screens/home/screens/HomeScreen.tsx`, `src/components/ui/ScheduleCard.tsx` (only if it references store fields — verify), `src/navigation/ClientTabNavigator.tsx`.

---

# PART 1 — Generalize the shared session model

## Task 1: Generalize `activeTrainingStore`

**Files:**
- Modify: `src/store/activeTrainingStore.ts`
- Modify: `src/hooks/useRestTimer.ts`
- Modify: `src/__tests__/store/activeTrainingStore.test.ts`

This rename is atomic — the store and its direct consumers must change together to keep `tsc` green. Consumer screens are updated in Task 3 and the util in Task 2; to keep this task's commit green, we run `tsc` only after Task 3. Therefore **commit Tasks 1–3 together** (a single green commit at the end of Task 3). Run the store test in isolation after this task.

- [ ] **Step 1: Update the store test to the new API**

Replace the entire contents of `src/__tests__/store/activeTrainingStore.test.ts`:

```ts
import { useActiveTrainingStore, type SessionParticipant } from '../../store/activeTrainingStore';

function makeParticipant(over: Partial<SessionParticipant> = {}): SessionParticipant {
  return {
    participantId: 'c1',
    name: 'Alice',
    programId: 'p1',
    exercises: [
      { id: 1, name: 'Ex', category: 'C', imageUrl: null, sets: [{ weight: 40, reps: 10 }] },
    ],
    exerciseIndex: 0,
    setIndex: 0,
    setLog: { 1: [{ weight: 40, reps: 10 }, { weight: 45, reps: 8 }] },
    prevSets: {},
    rest: { running: false, remainingSec: 0, durationSec: 0 },
    ...over,
  };
}

beforeEach(() => {
  useActiveTrainingStore.setState({ participants: [], activeParticipantId: null });
});

describe('useActiveTrainingStore', () => {
  it('startTraining selects the first participant by default', () => {
    const a = makeParticipant({ participantId: 'c1' });
    const b = makeParticipant({ participantId: 'c2', name: 'Bob' });
    useActiveTrainingStore.getState().startTraining([a, b]);
    expect(useActiveTrainingStore.getState().activeParticipantId).toBe('c1');
  });

  it('startTraining honors an explicit active participant when present', () => {
    const a = makeParticipant({ participantId: 'c1' });
    const b = makeParticipant({ participantId: 'c2' });
    useActiveTrainingStore.getState().startTraining([a, b], 'c2');
    expect(useActiveTrainingStore.getState().activeParticipantId).toBe('c2');
  });

  it('keeps each participant’s set index independent when switching', () => {
    useActiveTrainingStore
      .getState()
      .startTraining([makeParticipant({ participantId: 'c1' }), makeParticipant({ participantId: 'c2' })]);
    const store = useActiveTrainingStore.getState();
    store.setSetIndex('c1', 1);
    store.setSetIndex('c2', 0);

    const participants = useActiveTrainingStore.getState().participants;
    expect(participants.find((c) => c.participantId === 'c1')!.setIndex).toBe(1);
    expect(participants.find((c) => c.participantId === 'c2')!.setIndex).toBe(0);
  });

  it('updateSet edits only the targeted set of the targeted participant', () => {
    useActiveTrainingStore.getState().startTraining([makeParticipant()]);
    useActiveTrainingStore.getState().updateSet('c1', 1, 0, { weight: 50 });
    const sets = useActiveTrainingStore.getState().participants[0]!.setLog[1]!;
    expect(sets[0]).toEqual({ weight: 50, reps: 10 });
    expect(sets[1]).toEqual({ weight: 45, reps: 8 });
  });

  it('toggleRepToFailure flips the failure note', () => {
    useActiveTrainingStore.getState().startTraining([makeParticipant()]);
    useActiveTrainingStore.getState().toggleRepToFailure('c1', 1, 0);
    expect(useActiveTrainingStore.getState().participants[0]!.setLog[1]![0]!.note).toBe('failure');
    useActiveTrainingStore.getState().toggleRepToFailure('c1', 1, 0);
    expect(useActiveTrainingStore.getState().participants[0]!.setLog[1]![0]!.note).toBe('regular');
  });

  it('tickRest decrements every running participant and stops each at zero', () => {
    useActiveTrainingStore
      .getState()
      .startTraining([makeParticipant({ participantId: 'c1' }), makeParticipant({ participantId: 'c2' })], 'c1');
    const store = useActiveTrainingStore.getState();
    store.startRest('c1', 2);
    store.startRest('c2', 3);

    useActiveTrainingStore.getState().tickRest();
    let participants = useActiveTrainingStore.getState().participants;
    expect(participants.find((c) => c.participantId === 'c1')!.rest.remainingSec).toBe(1);
    expect(participants.find((c) => c.participantId === 'c2')!.rest.remainingSec).toBe(2);

    useActiveTrainingStore.getState().tickRest();
    participants = useActiveTrainingStore.getState().participants;
    const c1 = participants.find((c) => c.participantId === 'c1')!;
    expect(c1.rest.remainingSec).toBe(0);
    expect(c1.rest.running).toBe(false);
    expect(participants.find((c) => c.participantId === 'c2')!.rest.running).toBe(true);
  });

  it('openExercise points a participant at a program + exercise and resets the set', () => {
    useActiveTrainingStore.getState().startTraining([makeParticipant({ setIndex: 2 })]);
    useActiveTrainingStore.getState().openExercise('c1', 'p9', 3);
    const c = useActiveTrainingStore.getState().participants[0]!;
    expect(c.programId).toBe('p9');
    expect(c.exerciseIndex).toBe(3);
    expect(c.setIndex).toBe(0);
  });
});
```

- [ ] **Step 2: Run the store test to verify it fails**

Run: `npx jest src/__tests__/store/activeTrainingStore.test.ts`
Expected: FAIL — `SessionParticipant` / `participants` / `participantId` not exported.

- [ ] **Step 3: Rewrite `src/store/activeTrainingStore.ts`**

Replace the entire file:

```ts
import { create } from 'zustand';
import type { ExerciseSet, ProgramExercise } from '../types';

export type { ExerciseSet };

/** Rest-timer state, tracked per participant so each can rest independently. */
export interface RestState {
  running: boolean;
  remainingSec: number;
  durationSec: number;
}

/**
 * One participant in the currently-active training session. Role-agnostic: a
 * trainer-led session may hold several (a switchable group), a client's own
 * session holds exactly one (themself).
 */
export interface SessionParticipant {
  participantId: string;
  name: string;
  avatar?: string;
  /** Source program id, or null for an ad-hoc (hand-built) workout. */
  programId: string | null;
  /** The exercises this participant is working through — the source of truth
   *  for the live screens (no global program lookup, so ad-hoc works). */
  exercises: ProgramExercise[];
  exerciseIndex: number;
  setIndex: number;
  /** Editable set values logged during the session, keyed by exercise id. */
  setLog: Record<number, ExerciseSet[]>;
  /** Read-only reference: the same exercises' sets from the previous training. */
  prevSets: Record<number, ExerciseSet[]>;
  rest: RestState;
}

interface ActiveTrainingState {
  participants: SessionParticipant[];
  activeParticipantId: string | null;

  startTraining: (participants: SessionParticipant[], activeParticipantId?: string) => void;
  endTraining: () => void;
  setActiveParticipant: (participantId: string) => void;

  setExerciseIndex: (participantId: string, index: number) => void;
  setSetIndex: (participantId: string, index: number) => void;
  /** Points a participant at a specific program + exercise (used when an exercise is tapped). */
  openExercise: (participantId: string, programId: string | null, exerciseIndex: number) => void;
  /** Seeds an editable set log for an exercise the first time it is opened. */
  ensureSetLog: (participantId: string, exerciseId: number, sets: ExerciseSet[]) => void;
  updateSet: (
    participantId: string,
    exerciseId: number,
    setIndex: number,
    patch: Partial<ExerciseSet>,
  ) => void;
  toggleRepToFailure: (participantId: string, exerciseId: number, setIndex: number) => void;

  startRest: (participantId: string, durationSec: number) => void;
  /** Advances every running participant's rest timer by one second. Driven by useRestTimer. */
  tickRest: () => void;
  stopRest: (participantId: string) => void;
}

function mapParticipant(
  participants: SessionParticipant[],
  participantId: string,
  fn: (c: SessionParticipant) => SessionParticipant,
): SessionParticipant[] {
  return participants.map((c) => (c.participantId === participantId ? fn(c) : c));
}

export const useActiveTrainingStore = create<ActiveTrainingState>((set, get) => ({
  participants: [],
  activeParticipantId: null,

  startTraining: (participants, activeParticipantId) => {
    const fallback = participants[0]?.participantId ?? null;
    const exists = participants.some((c) => c.participantId === activeParticipantId);
    set({ participants, activeParticipantId: exists ? activeParticipantId! : fallback });
  },

  endTraining: () => set({ participants: [], activeParticipantId: null }),

  setActiveParticipant: (participantId) => {
    if (get().participants.some((c) => c.participantId === participantId)) {
      set({ activeParticipantId: participantId });
    }
  },

  setExerciseIndex: (participantId, index) =>
    set((state) => ({
      participants: mapParticipant(state.participants, participantId, (c) => ({
        ...c,
        exerciseIndex: index,
        setIndex: 0,
      })),
    })),

  setSetIndex: (participantId, index) =>
    set((state) => ({
      participants: mapParticipant(state.participants, participantId, (c) => ({ ...c, setIndex: index })),
    })),

  openExercise: (participantId, programId, exerciseIndex) =>
    set((state) => ({
      participants: mapParticipant(state.participants, participantId, (c) => ({
        ...c,
        programId,
        exerciseIndex,
        setIndex: 0,
      })),
    })),

  ensureSetLog: (participantId, exerciseId, sets) =>
    set((state) => ({
      participants: mapParticipant(state.participants, participantId, (c) =>
        c.setLog[exerciseId]
          ? c
          : { ...c, setLog: { ...c.setLog, [exerciseId]: sets.map((s) => ({ ...s })) } },
      ),
    })),

  updateSet: (participantId, exerciseId, setIndex, patch) =>
    set((state) => ({
      participants: mapParticipant(state.participants, participantId, (c) => {
        const sets = c.setLog[exerciseId];
        if (!sets || !sets[setIndex]) return c;
        const nextSets = sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s));
        return { ...c, setLog: { ...c.setLog, [exerciseId]: nextSets } };
      }),
    })),

  toggleRepToFailure: (participantId, exerciseId, setIndex) =>
    set((state) => ({
      participants: mapParticipant(state.participants, participantId, (c) => {
        const sets = c.setLog[exerciseId];
        if (!sets || !sets[setIndex]) return c;
        const nextSets = sets.map(
          (s, i): ExerciseSet =>
            i === setIndex
              ? { ...s, note: s.note === 'failure' ? 'regular' : 'failure' }
              : s,
        );
        return { ...c, setLog: { ...c.setLog, [exerciseId]: nextSets } };
      }),
    })),

  startRest: (participantId, durationSec) =>
    set((state) => ({
      participants: mapParticipant(state.participants, participantId, (c) => ({
        ...c,
        rest: { running: true, remainingSec: durationSec, durationSec },
      })),
    })),

  tickRest: () =>
    set((state) => ({
      participants: state.participants.map((c) => {
        if (!c.rest.running) return c;
        const remainingSec = Math.max(0, c.rest.remainingSec - 1);
        return { ...c, rest: { ...c.rest, remainingSec, running: remainingSec > 0 } };
      }),
    })),

  stopRest: (participantId) =>
    set((state) => ({
      participants: mapParticipant(state.participants, participantId, (c) => ({
        ...c,
        rest: { ...c.rest, running: false },
      })),
    })),
}));
```

- [ ] **Step 4: Update `src/hooks/useRestTimer.ts`**

Change the selector to the renamed state:

```ts
import { useEffect } from 'react';
import { useActiveTrainingStore } from '../store/activeTrainingStore';

/**
 * Drives rest countdowns for the whole session: while ANY participant's timer
 * is running, ticks the store once per second (tickRest decrements every
 * running participant). Mount this exactly once high in each live-training
 * stack so timers keep counting regardless of which screen is on top.
 */
export function useRestTimer() {
  const tickRest = useActiveTrainingStore((s) => s.tickRest);
  const anyRunning = useActiveTrainingStore((s) => s.participants.some((c) => c.rest.running));

  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(() => tickRest(), 1000);
    return () => clearInterval(id);
  }, [anyRunning, tickRest]);
}
```

- [ ] **Step 5: Run the store test to verify it passes**

Run: `npx jest src/__tests__/store/activeTrainingStore.test.ts`
Expected: PASS. (Project-wide `tsc` is still red until Task 3 — that is expected.)

_Do not commit yet — commit happens at the end of Task 3._

---

## Task 2: Generalize the seed util

**Files:**
- Modify: `src/utils/activeTraining.ts`
- Modify: `src/__tests__/utils/activeTraining.test.ts`
- Verify export: `src/utils/index.ts` (re-exports `./activeTraining` — update names if it lists symbols explicitly)

- [ ] **Step 1: Update the util test**

Replace the entire contents of `src/__tests__/utils/activeTraining.test.ts`:

```ts
import { deriveActiveGroup, seedParticipant, seedCustomParticipant } from '../../utils/activeTraining';
import type { Session, TrainingProgram, ProgramExercise } from '../../types';

const programs: TrainingProgram[] = [
  {
    id: 'p1',
    name: 'Prog 1',
    tag: 'HIIT',
    videoCount: 1,
    views: 0,
    likes: 0,
    exercises: [
      { id: 1, name: 'Ex', category: 'C', imageUrl: null, sets: [{ weight: 40, reps: 10 }] },
    ],
  },
  {
    id: 'p2',
    name: 'Prog 2',
    tag: 'Cardio',
    videoCount: 1,
    views: 0,
    likes: 0,
    exercises: [{ id: 2, name: 'Ex2', category: 'C', imageUrl: null, sets: [{ weight: 0, reps: 20 }] }],
  },
  { id: 'p3', name: 'No exercises', tag: 'X', videoCount: 0, views: 0, likes: 0 },
];

function session(over: Partial<Session>): Session {
  return {
    id: 'x',
    title: 'Personal Session',
    type: 'HIIT',
    date: 'Today',
    time: '2:00pm',
    status: 'pending',
    participants: [{ id: 'c1', name: 'Alice' }],
    ...over,
  };
}

describe('deriveActiveGroup', () => {
  it('returns empty when there are no pending sessions today', () => {
    expect(deriveActiveGroup([session({ status: 'completed' })], programs)).toEqual([]);
    expect(deriveActiveGroup([session({ date: 'Tomorrow' })], programs)).toEqual([]);
  });

  it('groups by time slot and picks the busiest slot', () => {
    const sessions: Session[] = [
      session({ id: 'a', time: '10:00am', participants: [{ id: 'c1', name: 'Alice' }] }),
      session({ id: 'b', time: '2:00pm', participants: [{ id: 'c2', name: 'Bob' }], programId: 'p1' }),
      session({ id: 'c', time: '2:00pm', participants: [{ id: 'c3', name: 'Cara' }], programId: 'p2' }),
    ];
    const group = deriveActiveGroup(sessions, programs);
    expect(group.map((c) => c.participantId)).toEqual(['c2', 'c3']);
  });

  it('assigns each participant its session program, falling back to one with exercises', () => {
    const sessions: Session[] = [
      session({ id: 'a', participants: [{ id: 'c1', name: 'Alice' }], programId: 'p2' }),
      session({ id: 'b', participants: [{ id: 'c2', name: 'Bob' }], programId: 'p3' }),
    ];
    const group = deriveActiveGroup(sessions, programs);
    expect(group[0]!.programId).toBe('p2');
    expect(['p1', 'p2']).toContain(group[1]!.programId);
  });
});

describe('seedParticipant', () => {
  it('copies the program exercises onto the participant', () => {
    const p = seedParticipant({ id: 'c1', name: 'Alice' }, programs[0]!);
    expect(p.exercises).toHaveLength(1);
    expect(p.programId).toBe('p1');
  });

  it('clones each exercise set into the editable setLog', () => {
    const p = seedParticipant({ id: 'c1', name: 'Alice' }, programs[0]!);
    expect(p.setLog[1]).toEqual([{ weight: 40, reps: 10 }]);
    p.setLog[1]![0]!.weight = 99;
    expect(programs[0]!.exercises![0]!.sets[0]!.weight).toBe(40);
  });

  it('seeds prevSets from the lookup and defaults setLog to previous values', () => {
    const lookup = (_name: string, exerciseId: number) =>
      exerciseId === 1 ? [{ weight: 35, reps: 12 }] : null;
    const p = seedParticipant({ id: 'c1', name: 'Alice' }, programs[0]!, { lookupPrevSets: lookup });
    expect(p.prevSets[1]).toEqual([{ weight: 35, reps: 12 }]);
    expect(p.setLog[1]).toEqual([{ weight: 35, reps: 12 }]);
  });

  it('prefers planned sets over previous and template for setLog', () => {
    const lookup = () => [{ weight: 35, reps: 12 }];
    const p = seedParticipant({ id: 'c1', name: 'Alice' }, programs[0]!, {
      plannedSets: { 1: [{ weight: 50, reps: 9 }] },
      lookupPrevSets: lookup,
    });
    expect(p.setLog[1]).toEqual([{ weight: 50, reps: 9 }]);
    expect(p.prevSets[1]).toEqual([{ weight: 35, reps: 12 }]);
  });
});

describe('seedCustomParticipant', () => {
  const customExercises: ProgramExercise[] = [
    { id: 7, name: 'Custom', category: 'C', imageUrl: null, sets: [{ weight: 20, reps: 15 }] },
  ];

  it('builds an ad-hoc participant with programId null and the given exercises', () => {
    const p = seedCustomParticipant({ id: 'me', name: 'You' }, customExercises);
    expect(p.programId).toBeNull();
    expect(p.exercises).toHaveLength(1);
    expect(p.setLog[7]).toEqual([{ weight: 20, reps: 15 }]);
  });

  it('does not mutate the source exercises', () => {
    const p = seedCustomParticipant({ id: 'me', name: 'You' }, customExercises);
    p.setLog[7]![0]!.weight = 99;
    expect(customExercises[0]!.sets[0]!.weight).toBe(20);
  });
});
```

- [ ] **Step 2: Run the util test to verify it fails**

Run: `npx jest src/__tests__/utils/activeTraining.test.ts`
Expected: FAIL — `seedParticipant` / `seedCustomParticipant` not exported.

- [ ] **Step 3: Rewrite `src/utils/activeTraining.ts`**

Replace the entire file:

```ts
import type { Session, TrainingProgram, ProgramExercise, ExerciseSet } from '../types';
import type { SessionParticipant } from '../store/activeTrainingStore';

type Participant = Session['participants'][number];

/** Looks up a participant's previous logged sets for an exercise (e.g. training history). */
export type PrevSetsLookup = (name: string, exerciseId: number) => ExerciseSet[] | null;

export interface SeedOptions {
  /** Planned targets per exercise id (from session creation), used as defaults. */
  plannedSets?: Record<number, ExerciseSet[]>;
  /** Resolves the participant's previous sets for an exercise. */
  lookupPrevSets?: PrevSetsLookup;
}

/** Builds the prevSets / setLog maps shared by program and custom seeding. */
function buildLogs(
  name: string,
  exercises: ProgramExercise[],
  opts: SeedOptions,
): { prevSets: Record<number, ExerciseSet[]>; setLog: Record<number, ExerciseSet[]> } {
  const { plannedSets, lookupPrevSets } = opts;
  const prevSets: Record<number, ExerciseSet[]> = {};
  const setLog: Record<number, ExerciseSet[]> = {};

  for (const ex of exercises) {
    const prev = lookupPrevSets?.(name, ex.id) ?? null;
    if (prev) prevSets[ex.id] = prev.map((s) => ({ ...s }));
    const base = plannedSets?.[ex.id] ?? prev ?? ex.sets;
    setLog[ex.id] = base.map((s) => ({ ...s }));
  }
  return { prevSets, setLog };
}

/**
 * Builds a SessionParticipant from a session participant + an assigned program.
 * Editable defaults (`setLog`) come from planned targets → previous training →
 * program template, in that order. `prevSets` keeps the previous values for the
 * live "Last time" comparison. The program's exercises are copied onto the
 * participant so the live screens read from the session, not a global lookup.
 */
export function seedParticipant(
  participant: Participant,
  program: TrainingProgram,
  opts: SeedOptions = {},
): SessionParticipant {
  const exercises = (program.exercises ?? []).map((e) => ({ ...e }));
  const { prevSets, setLog } = buildLogs(participant.name, exercises, opts);

  return {
    participantId: participant.id,
    name: participant.name,
    avatar: participant.avatar,
    programId: program.id,
    exercises,
    exerciseIndex: 0,
    setIndex: 0,
    setLog,
    prevSets,
    rest: { running: false, remainingSec: 0, durationSec: 0 },
  };
}

/**
 * Builds an ad-hoc SessionParticipant from a hand-picked exercise list (the
 * client's "build your own" path). No source program → `programId` is null and
 * the exercises live directly on the participant.
 */
export function seedCustomParticipant(
  participant: Participant,
  exercises: ProgramExercise[],
  opts: SeedOptions = {},
): SessionParticipant {
  const copied = exercises.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
  const { prevSets, setLog } = buildLogs(participant.name, copied, opts);

  return {
    participantId: participant.id,
    name: participant.name,
    avatar: participant.avatar,
    programId: null,
    exercises: copied,
    exerciseIndex: 0,
    setIndex: 0,
    setLog,
    prevSets,
    rest: { running: false, remainingSec: 0, durationSec: 0 },
  };
}

/**
 * Derives the currently-active training group from scheduled sessions: groups
 * today's pending sessions by time slot and picks the busiest slot.
 */
export function deriveActiveGroup(
  sessions: Session[],
  programs: TrainingProgram[],
  lookupPrevSets?: PrevSetsLookup,
): SessionParticipant[] {
  const pendingToday = sessions.filter((s) => s.date === 'Today' && s.status === 'pending');
  if (pendingToday.length === 0) return [];

  const byTime = new Map<string, Session[]>();
  for (const s of pendingToday) {
    const slot = byTime.get(s.time) ?? [];
    slot.push(s);
    byTime.set(s.time, slot);
  }

  let bestSlot: Session[] = [];
  let bestCount = -1;
  for (const slot of byTime.values()) {
    const count = slot.reduce((n, s) => n + s.participants.length, 0);
    if (count > bestCount) {
      bestCount = count;
      bestSlot = slot;
    }
  }

  const withExercises = programs.filter((p) => p.exercises && p.exercises.length > 0);
  if (withExercises.length === 0) return [];

  const entries = bestSlot.flatMap((s) =>
    s.participants.map((p) => ({ participant: p, programId: s.programId, plannedSets: s.plannedSets })),
  );

  return entries.map((entry, i) => {
    const program =
      withExercises.find((p) => p.id === entry.programId) ??
      withExercises[i % withExercises.length]!;
    return seedParticipant(entry.participant, program, {
      plannedSets: entry.plannedSets,
      lookupPrevSets,
    });
  });
}

/**
 * Builds the active group for ONE specific session (its participants + program
 * + planned sets), so a training can be started directly from a schedule card.
 */
export function deriveGroupFromSession(
  session: Session,
  programs: TrainingProgram[],
  lookupPrevSets?: PrevSetsLookup,
): SessionParticipant[] {
  const withExercises = programs.filter((p) => p.exercises && p.exercises.length > 0);
  const program =
    programs.find((p) => p.id === session.programId && (p.exercises?.length ?? 0) > 0) ??
    withExercises[0];
  if (!program) return [];

  return session.participants.map((participant) =>
    seedParticipant(participant, program, {
      plannedSets: session.plannedSets,
      lookupPrevSets,
    }),
  );
}
```

- [ ] **Step 4: Check `src/utils/index.ts` for explicit symbol re-exports**

Run: `grep -n "seedActiveClient\|activeTraining" src/utils/index.ts`
If it re-exports `seedActiveClient` by name, rename it to `seedParticipant` and add `seedCustomParticipant`. If it uses `export * from './activeTraining'`, no change is needed.

- [ ] **Step 5: Run the util test to verify it passes**

Run: `npx jest src/__tests__/utils/activeTraining.test.ts`
Expected: PASS.

_Do not commit yet._

---

## Task 3: Relocate live screens, add shared nav types, update trainer consumers

**Files:**
- Add nav fragment: `src/navigation/types.ts`
- Move: `src/screens/clients/ExerciseDetailScreen.tsx` → `src/screens/training/ExerciseDetailScreen.tsx`
- Move: `src/screens/clients/TrainingSummaryScreen.tsx` → `src/screens/training/TrainingSummaryScreen.tsx`
- Move: `src/screens/clients/ExerciseDetail/` → `src/screens/training/ExerciseDetail/`
- Modify: `src/navigation/ClientsStackNavigator.tsx`
- Modify: `src/screens/clients/ClientProfileScreen.tsx`
- Modify: `src/screens/clients/ClientsProfileExtendedScreen.tsx`
- Modify: `src/screens/home/screens/HomeScreen.tsx`

- [ ] **Step 1: Add the shared `LiveTrainingParamList` fragment to `src/navigation/types.ts`**

Replace the `ClientsStackParamList` block (lines ~46-54) with:

```ts
/**
 * Live-training routes shared by the trainer Clients stack and the client Train
 * stack — both mount the same ExerciseDetail/TrainingSummary screens.
 */
export type LiveTrainingParamList = {
  ExerciseDetail: { participantId: string; programId: string | null; exerciseIndex: number };
  TrainingSummary: { participantId?: string };
};

export type ClientsStackParamList = LiveTrainingParamList & {
  ClientsList: undefined;
  Filters: undefined;
  ClientProfile: { clientId?: string } | undefined;
  ProgramDetail: { programId: string };
  ClientsProfileExtended: { clientId?: string } | undefined;
};
```

- [ ] **Step 2: Move the live-training files**

```bash
mkdir -p src/screens/training
git mv src/screens/clients/ExerciseDetailScreen.tsx src/screens/training/ExerciseDetailScreen.tsx
git mv src/screens/clients/TrainingSummaryScreen.tsx src/screens/training/TrainingSummaryScreen.tsx
git mv src/screens/clients/ExerciseDetail src/screens/training/ExerciseDetail
```

(Relative import depth is unchanged — both folders are two levels under `src/` — so `../../` imports stay valid.)

- [ ] **Step 3: Generalize `src/screens/training/ExerciseDetailScreen.tsx`**

Apply these edits:

Change the type import (remove `mockTrainingPrograms`, switch param-list):

```ts
// Replace:
//   import type { ClientsStackParamList } from '../../navigation/types';
//   import { mockTrainingPrograms } from '../../mocks';
import type { LiveTrainingParamList } from '../../navigation/types';
```

Update the route/nav generics and store selectors:

```ts
type Route = RouteProp<LiveTrainingParamList, 'ExerciseDetail'>;
type Nav = NativeStackNavigationProp<LiveTrainingParamList, 'ExerciseDetail'>;
```

Replace the destructured params and store hooks block (the `routeClientId`/`clients`/`activeClientId` section) with:

```ts
  const {
    participantId: routeParticipantId,
    programId: routeProgramId,
    exerciseIndex: routeExerciseIndex,
  } = route.params ?? {};

  const participants = useActiveTrainingStore((s) => s.participants);
  const activeParticipantId = useActiveTrainingStore((s) => s.activeParticipantId);
  const setActiveParticipant = useActiveTrainingStore((s) => s.setActiveParticipant);
  const openExercise = useActiveTrainingStore((s) => s.openExercise);
  const setSetIndex = useActiveTrainingStore((s) => s.setSetIndex);
  const setExerciseIndex = useActiveTrainingStore((s) => s.setExerciseIndex);
  const ensureSetLog = useActiveTrainingStore((s) => s.ensureSetLog);
  const updateSet = useActiveTrainingStore((s) => s.updateSet);
  const toggleRepToFailure = useActiveTrainingStore((s) => s.toggleRepToFailure);
  const startRest = useActiveTrainingStore((s) => s.startRest);
  const stopRest = useActiveTrainingStore((s) => s.stopRest);
```

Replace the entry effect:

```ts
  React.useEffect(() => {
    if (routeParticipantId && routeExerciseIndex != null) {
      openExercise(routeParticipantId, routeProgramId ?? null, routeExerciseIndex);
      setActiveParticipant(routeParticipantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

Replace the participant/exercises resolution (drops the `mockTrainingPrograms` lookup):

```ts
  const participant =
    participants.find((c) => c.participantId === activeParticipantId) ?? participants[0] ?? null;
  const exercises = participant?.exercises ?? [];
```

Replace every remaining `client` reference in the render with `participant`, every `.clientId` with `.participantId`, and the seed effect's deps. Specifically:

```ts
  const currentParticipantId = participant?.participantId;
  const currentExerciseIndex = participant?.exerciseIndex;
  React.useEffect(() => {
    if (!currentParticipantId || currentExerciseIndex == null) return;
    const ex = exercises[Math.min(currentExerciseIndex, exercises.length - 1)];
    if (ex) ensureSetLog(currentParticipantId, ex.id, ex.sets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParticipantId, currentExerciseIndex, exercises.length]);
```

Guard clause and downstream: `if (!participant || exercises.length === 0)`, then use `participant.exerciseIndex`, `participant.setLog`, `participant.prevSets`, `participant.rest`, `participant.participantId`. The switcher mapping becomes:

```ts
  const switcherClients: SwitcherClient[] = participants.map((c) => ({
    id: c.participantId,
    name: c.name,
    avatar: c.avatar,
    badge: c.rest.running ? formatClock(c.rest.remainingSec) : undefined,
  }));
```

The Finish button navigates with the renamed param:

```ts
            onPress={() => navigation.navigate('TrainingSummary', { participantId: participant.participantId })}
```

The switcher still renders only when `participants.length > 1`, the `onSelect={setActiveParticipant}`.

- [ ] **Step 4: Generalize `src/screens/training/TrainingSummaryScreen.tsx`**

Apply these edits:

Type import:

```ts
import type { LiveTrainingParamList } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTrainingHistoryStore } from '../../store/trainingHistoryStore';
```

(Keep `mockTrainingPrograms` import — it is still used to resolve the program tag when `programId` is set. The "Done" control is a plain `TouchableOpacity`+`Text`, so no `Button` import is added.)

Route/nav generics + selectors:

```ts
type Route = RouteProp<LiveTrainingParamList, 'TrainingSummary'>;
type Nav = NativeStackNavigationProp<LiveTrainingParamList, 'TrainingSummary'>;
```

Replace the `clientId` / `client` resolution:

```ts
  const navigation = useNavigation<Nav>();
  const participantId = route.params?.participantId;
  const participant = useActiveTrainingStore(
    (s) => s.participants.find((c) => c.participantId === participantId) ?? s.participants[0] ?? null,
  );
  const addCompletedTraining = useTrainingHistoryStore((s) => s.addCompletedTraining);
  const endTraining = useActiveTrainingStore((s) => s.endTraining);
```

Replace the program/exercises resolution (program is now optional; ad-hoc has none):

```ts
  const program = participant?.programId
    ? mockTrainingPrograms.find((p) => p.id === participant.programId)
    : undefined;
  const exercises = participant?.exercises ?? [];
  const typeLabel = program?.tag ?? 'Custom';
```

Update `history`, `rows`, and the `program.tag` usage to use `participant` and `typeLabel`:

```ts
  const history = participant ? getClientHistory(participant.name) : [];
```

```ts
  const rows = exercises.map((ex) => {
    const sets = participant?.setLog[ex.id] ?? ex.sets;
    const top = topSet(sets);
    return {
      id: ex.id,
      name: ex.name,
      weight: top ? `${top.weight}kg` : '—',
      sets: sets.length,
      reps: top ? top.reps : 0,
    };
  });
```

Replace `{program.tag}` in the Type card with `{typeLabel}`.

Add a "Done" handler before the return and a Done button in the header `rightElement` (alongside the existing pencil/ellipsis):

```ts
  const handleDone = () => {
    if (participant) {
      addCompletedTraining({
        id: `ct-${participant.participantId}-${participant.exercises.length}`,
        clientName: participant.name,
        programId: participant.programId ?? 'custom',
        date: 'Today',
        exercises: participant.exercises.map((ex) => ({
          exerciseId: ex.id,
          sets: (participant.setLog[ex.id] ?? ex.sets).map((s) => ({ ...s })),
        })),
      });
    }
    endTraining();
    navigation.popToTop();
  };
```

In the header `rightElement`, add as the first child:

```tsx
            <TouchableOpacity onPress={handleDone} hitSlop={8}>
              <Text style={{ color: colors.accent, fontWeight: typography.weights.semibold, fontSize: typography.sizes.base }}>
                Done
              </Text>
            </TouchableOpacity>
```

(The id is deterministic — no `Date.now()` — to stay test- and resume-friendly.)

- [ ] **Step 5: Update `src/navigation/ClientsStackNavigator.tsx` imports**

Change the two import paths:

```ts
import { ExerciseDetailScreen } from '../screens/training/ExerciseDetailScreen';
import { TrainingSummaryScreen } from '../screens/training/TrainingSummaryScreen';
```

(The `<Stack.Screen name="ExerciseDetail" ... />` and `"TrainingSummary"` entries stay — those route names are now part of `ClientsStackParamList` via the fragment.)

- [ ] **Step 6: Update trainer callers to the renamed param/store API**

`src/screens/clients/ClientProfileScreen.tsx` — update store selectors and the `ExerciseDetail` navigation:
- `s.clients` → `s.participants`, `s.activeClientId` → `s.activeParticipantId`, `s.setActiveClient` → `s.setActiveParticipant`.
- `useActiveTrainingStore.getState().clients` → `.participants`.
- `activeClient` local var may keep its name, but `.clientId` → `.participantId` throughout.
- The `ExerciseDetail` navigate call:

```ts
            navigation.navigate('ExerciseDetail', {
              participantId: activeClient.participantId,
              programId: selectedProgram.id,
              exerciseIndex: index,
            })
```

- The `switcherClients` map: `id: c.participantId`.

`src/screens/clients/ClientsProfileExtendedScreen.tsx` — it calls `startTraining([client], client.clientId)` and seeds via `seedActiveClient`. Update:
- `seedActiveClient(...)` → `seedParticipant(...)`.
- `startTraining([participant], participant.participantId)`.
- Any `.clientId` on the seeded object → `.participantId`.

`src/screens/home/screens/HomeScreen.tsx` — it calls `deriveGroupFromSession` + `startTraining(group)` and navigates to `ClientProfile`. `deriveGroupFromSession` now returns `SessionParticipant[]`; `startTraining(group)` signature is unchanged. Only update any direct `.clientId` field access on the returned group (e.g. the navigate that picks the first client):

```ts
// e.g. group[0]?.clientId  ->  group[0]?.participantId
```

- [ ] **Step 7: Grep for any leftover references**

Run: `grep -rn "ActiveClient\|seedActiveClient\|\.clientId\|activeClientId\|s.clients\b\|setActiveClient" src --include=*.ts --include=*.tsx | grep -v "__tests__"`
Expected: only legitimate hits remain (e.g. `Client` domain type unrelated to the store, `route.params?.clientId` on trainer-only `ClientProfile`/`ClientsProfileExtended` param lists which still use `clientId`). Fix any store/seed leftovers.

Note: the trainer route params `ClientProfile: { clientId?: string }` and `ClientsProfileExtended: { clientId?: string }` intentionally keep `clientId` — they identify a managed client, not a session participant.

- [ ] **Step 8: Typecheck and run the full test suite**

Run: `npm run typecheck && npm test`
Expected: PASS (0 type errors; all tests green).

- [ ] **Step 9: Commit Tasks 1–3**

```bash
git add -A
git commit -m "refactor(training): generalize active session to role-agnostic participants

Rename ActiveClient->SessionParticipant (clientId->participantId), relocate
ExerciseDetail/TrainingSummary into src/screens/training/, and let each
participant carry its own exercises so ad-hoc workouts need no program lookup.
Adds seedCustomParticipant and a shared LiveTrainingParamList fragment.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Add `addCompletedTraining` to the history store

**Files:**
- Modify: `src/store/trainingHistoryStore.ts`
- Modify: `src/__tests__/store/trainingHistoryStore.test.ts`

- [ ] **Step 1: Add a failing test**

Append inside the top-level `describe` block of `src/__tests__/store/trainingHistoryStore.test.ts` (match the file's existing import of `useTrainingHistoryStore`):

```ts
  it('addCompletedTraining appends a training so getLastSets returns its sets', () => {
    const before = useTrainingHistoryStore.getState().history.length;
    useTrainingHistoryStore.getState().addCompletedTraining({
      id: 'ct-new',
      clientName: 'You',
      programId: 'custom',
      date: 'Today',
      exercises: [{ exerciseId: 9999, sets: [{ weight: 77, reps: 5 }] }],
    });
    expect(useTrainingHistoryStore.getState().history.length).toBe(before + 1);
    expect(useTrainingHistoryStore.getState().getLastSets('You', 9999)).toEqual([
      { weight: 77, reps: 5 },
    ]);
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest src/__tests__/store/trainingHistoryStore.test.ts -t addCompletedTraining`
Expected: FAIL — `addCompletedTraining is not a function`.

- [ ] **Step 3: Implement the action**

In `src/store/trainingHistoryStore.ts`, add to the interface (after `getLastSets`):

```ts
  /** Appends a completed training (newest last, matching seed chronology). */
  addCompletedTraining: (training: CompletedTraining) => void;
```

And to the store object (after `getLastSets`):

```ts
  addCompletedTraining: (training) =>
    set((state) => ({ history: [...state.history, training] })),
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest src/__tests__/store/trainingHistoryStore.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/trainingHistoryStore.ts src/__tests__/store/trainingHistoryStore.test.ts
git commit -m "feat(history): add addCompletedTraining action

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Expose the current user identity

**Files:**
- Modify: `src/services/repositories/trainingHistoryRepository.ts`

- [ ] **Step 1: Add `getCurrentUser`**

Append to `src/services/repositories/trainingHistoryRepository.ts`:

```ts
export interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
}

/**
 * The signed-in client's identity. With a real backend this comes from the auth
 * session; for now it's the seed identity (id mirrors gamification's 'me').
 */
export function getCurrentUser(): CurrentUser {
  return { id: 'me', name: CURRENT_USER_NAME };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS. (`getCurrentUser` is re-exported automatically via `repositories/index.ts`'s `export *`.)

- [ ] **Step 3: Commit**

```bash
git add src/services/repositories/trainingHistoryRepository.ts
git commit -m "feat(repositories): expose getCurrentUser identity

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

# PART 2 — Client Train tab

## Task 6: Train navigation + tab wiring + icon

**Files:**
- Modify: `src/navigation/types.ts`
- Modify: `src/components/icons/TabBarIcons.tsx`
- Create: `src/navigation/client/TrainStackNavigator.tsx`
- Modify: `src/navigation/ClientTabNavigator.tsx`

- [ ] **Step 1: Add Train param lists to `src/navigation/types.ts`**

In the client-side section, extend `ClientTabParamList` and add `TrainStackParamList`:

```ts
export type ClientTabParamList = {
  ClientHomeTab: undefined;
  TrainersTab: undefined;
  TrainTab: undefined;
  ChatTab: undefined;
  ProgressTab: undefined;
};

export type TrainStackParamList = LiveTrainingParamList & {
  TrainHome: undefined;
  WorkoutBuilder: undefined;
  WorkoutOverview:
    | { source: 'program'; programId: string }
    | { source: 'assigned'; sessionId: string }
    | { source: 'custom'; exercises: ProgramExercise[] };
};
```

(`ProgramExercise` is already imported at the top of `types.ts`. Replace the old `ClientAddTab` key with `TrainTab`.)

- [ ] **Step 2: Add `TrainTabIcon` to `src/components/icons/TabBarIcons.tsx`**

Append (a simple dumbbell glyph; uses the same `ACTIVE_FILL`/`SIZE` conventions):

```tsx
export function TrainTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const strokeColor = focused ? ACTIVE_FILL : color;
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 32 32" fill="none">
        <Path
          d="M6.667 12v8M9.333 9.333v13.334M22.667 12v8M25.333 9.333v13.334M9.333 16h13.334"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
```

- [ ] **Step 3: Create `src/navigation/client/TrainStackNavigator.tsx`**

```tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TrainStackParamList } from '../types';
import { ScreenBackground } from '../../components/layout';
import { useRestTimer } from '../../hooks/useRestTimer';

import { TrainHomeScreen } from '../../screens/client/train/TrainHomeScreen';
import { WorkoutOverviewScreen } from '../../screens/client/train/WorkoutOverviewScreen';
import { WorkoutBuilderScreen } from '../../screens/client/train/WorkoutBuilderScreen';
import { ExerciseDetailScreen } from '../../screens/training/ExerciseDetailScreen';
import { TrainingSummaryScreen } from '../../screens/training/TrainingSummaryScreen';

const Stack = createNativeStackNavigator<TrainStackParamList>();

export function TrainStackNavigator() {
  // Keep rest countdowns ticking across the whole Train stack (mirrors the
  // trainer's ClientsStackNavigator).
  useRestTimer();

  return (
    <Stack.Navigator
      screenLayout={({ children }) => <ScreenBackground>{children}</ScreenBackground>}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="TrainHome" component={TrainHomeScreen} />
      <Stack.Screen name="WorkoutBuilder" component={WorkoutBuilderScreen} />
      <Stack.Screen name="WorkoutOverview" component={WorkoutOverviewScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="TrainingSummary" component={TrainingSummaryScreen} />
    </Stack.Navigator>
  );
}
```

- [ ] **Step 4: Wire the Train tab into `src/navigation/ClientTabNavigator.tsx`**

- Add imports:

```ts
import { TrainStackNavigator } from './client/TrainStackNavigator';
import { HomeTabIcon, ProfileTabIcon, ChatTabIcon, StatsTabIcon, TrainTabIcon } from '../components/icons/TabBarIcons';
```

- Delete the `AddTabScreen`, `AddButton`, and the `makeClientPlaceholder` import (booking now lives only on Home/Trainers). Remove the `addButton` style.
- Replace the entire `<Tab.Screen name="ClientAddTab" ... />` block with the Train tab in the same center position:

```tsx
      <Tab.Screen
        name="TrainTab"
        component={TrainStackNavigator}
        options={{
          tabBarLabel: 'Train',
          tabBarIcon: ({ focused, color }) => <TrainTabIcon color={color} focused={focused} />,
        }}
      />
```

- [ ] **Step 5: Typecheck (screens not yet created — expect failures only about missing screen modules)**

Run: `npm run typecheck`
Expected: errors limited to the not-yet-created `TrainHomeScreen` / `WorkoutOverviewScreen` / `WorkoutBuilderScreen` imports. These resolve in Tasks 7–9. (No commit yet.)

---

## Task 7: `WorkoutBuilderScreen` + exercise catalog util

Built before the others so `WorkoutOverview` and `TrainHome` can link to it. Includes a tested util.

**Files:**
- Create: `src/utils/exerciseCatalog.ts`
- Create: `src/__tests__/utils/exerciseCatalog.test.ts`
- Modify: `src/utils/index.ts` (export the new util if it lists symbols)
- Create: `src/screens/client/train/WorkoutBuilderScreen.tsx`

- [ ] **Step 1: Write the failing catalog test**

Create `src/__tests__/utils/exerciseCatalog.test.ts`:

```ts
import { buildExerciseCatalog } from '../../utils/exerciseCatalog';
import type { TrainingProgram } from '../../types';

const programs: TrainingProgram[] = [
  {
    id: 'p1', name: 'A', tag: 'X', videoCount: 0, views: 0, likes: 0,
    exercises: [
      { id: 1, name: 'Squat', category: 'Legs', imageUrl: null, sets: [{ weight: 40, reps: 10 }] },
      { id: 2, name: 'Bench', category: 'Chest', imageUrl: null, sets: [{ weight: 50, reps: 8 }] },
    ],
  },
  {
    id: 'p2', name: 'B', tag: 'Y', videoCount: 0, views: 0, likes: 0,
    exercises: [
      { id: 1, name: 'Squat', category: 'Legs', imageUrl: null, sets: [{ weight: 60, reps: 6 }] },
    ],
  },
  { id: 'p3', name: 'C', tag: 'Z', videoCount: 0, views: 0, likes: 0 },
];

describe('buildExerciseCatalog', () => {
  it('dedupes exercises by id, keeping the first occurrence', () => {
    const catalog = buildExerciseCatalog(programs);
    expect(catalog.map((e) => e.id)).toEqual([1, 2]);
    expect(catalog.find((e) => e.id === 1)!.sets[0]!.weight).toBe(40);
  });

  it('ignores programs without exercises', () => {
    const catalog = buildExerciseCatalog([programs[2]!]);
    expect(catalog).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest src/__tests__/utils/exerciseCatalog.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/utils/exerciseCatalog.ts`**

```ts
import type { TrainingProgram, ProgramExercise } from '../types';

/**
 * Flattens all program exercises into a deduped catalog (by exercise id, first
 * occurrence wins) — the pool a client picks from when building a custom workout.
 */
export function buildExerciseCatalog(programs: TrainingProgram[]): ProgramExercise[] {
  const byId = new Map<number, ProgramExercise>();
  for (const program of programs) {
    for (const ex of program.exercises ?? []) {
      if (!byId.has(ex.id)) byId.set(ex.id, ex);
    }
  }
  return [...byId.values()];
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest src/__tests__/utils/exerciseCatalog.test.ts`
Expected: PASS. If `src/utils/index.ts` lists explicit exports, add `export * from './exerciseCatalog';`.

- [ ] **Step 5: Create `src/screens/client/train/WorkoutBuilderScreen.tsx`**

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TrainStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { ChoiceCard, Button } from '../../../components/ui';
import { buildExerciseCatalog } from '../../../utils/exerciseCatalog';
import { mockTrainingPrograms } from '../../../mocks';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';

type Nav = NavigationProp<TrainStackParamList, 'WorkoutBuilder'>;

const CATALOG = buildExerciseCatalog(mockTrainingPrograms);

export function WorkoutBuilderScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = React.useState<number[]>([]);

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onContinue = () => {
    const exercises = CATALOG.filter((e) => selected.includes(e.id));
    navigation.navigate('WorkoutOverview', { source: 'custom', exercises });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Build workout" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing['2xl'] + insets.bottom + 64 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hint}>Pick the exercises for your session.</Text>
        {CATALOG.map((ex) => (
          <View key={ex.id} style={styles.cardWrap}>
            <ChoiceCard
              title={ex.name}
              subtitle={ex.category}
              selected={selected.includes(ex.id)}
              onPress={() => toggle(ex.id)}
            />
          </View>
        ))}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
        <Button
          title={selected.length > 0 ? `Continue (${selected.length})` : 'Continue'}
          onPress={onContinue}
          disabled={selected.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  hint: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.md },
  cardWrap: { marginBottom: spacing.sm },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.neutral1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
```

- [ ] **Step 6: Commit**

```bash
git add src/utils/exerciseCatalog.ts src/__tests__/utils/exerciseCatalog.test.ts src/screens/client/train/WorkoutBuilderScreen.tsx src/utils/index.ts
git commit -m "feat(client): workout builder + exercise catalog util

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: `WorkoutOverviewScreen`

Resolves the chosen workout (program / assigned session / custom), previews its exercises, and starts the live session with a single participant (the client).

**Files:**
- Create: `src/screens/client/train/WorkoutOverviewScreen.tsx`

- [ ] **Step 1: Create `src/screens/client/train/WorkoutOverviewScreen.tsx`**

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TrainStackParamList } from '../../../navigation/types';
import type { ProgramExercise, TrainingProgram } from '../../../types';
import { ScreenHeader } from '../../../components/layout';
import { ProgramExerciseList, Button } from '../../../components/ui';
import { useActiveTrainingStore } from '../../../store/activeTrainingStore';
import { useSessionsStore } from '../../../store/sessionsStore';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { seedParticipant, seedCustomParticipant } from '../../../utils';
import { getCurrentUser } from '../../../services/repositories';
import { mockTrainingPrograms } from '../../../mocks';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';

type Nav = NavigationProp<TrainStackParamList, 'WorkoutOverview'>;
type Route = RouteProp<TrainStackParamList, 'WorkoutOverview'>;

/** Builds a one-off TrainingProgram so the preview list can render custom workouts. */
function customProgram(exercises: ProgramExercise[]): TrainingProgram {
  return { id: 'custom', name: 'Custom workout', tag: 'Custom', videoCount: 0, views: 0, likes: 0, exercises };
}

export function WorkoutOverviewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const params = route.params;

  const startTraining = useActiveTrainingStore((s) => s.startTraining);
  const getLastSets = useTrainingHistoryStore((s) => s.getLastSets);
  const sessions = useSessionsStore((s) => s.sessions);

  // Resolve the program/exercises for whichever path led here.
  const { program, exercises } = React.useMemo(() => {
    if (params.source === 'custom') {
      const prog = customProgram(params.exercises);
      return { program: prog, exercises: params.exercises };
    }
    if (params.source === 'assigned') {
      const session = sessions.find((s) => s.id === params.sessionId);
      const prog =
        mockTrainingPrograms.find((p) => p.id === session?.programId && (p.exercises?.length ?? 0) > 0) ??
        mockTrainingPrograms.find((p) => (p.exercises?.length ?? 0) > 0)!;
      return { program: prog, exercises: prog.exercises ?? [] };
    }
    const prog =
      mockTrainingPrograms.find((p) => p.id === params.programId) ??
      mockTrainingPrograms.find((p) => (p.exercises?.length ?? 0) > 0)!;
    return { program: prog, exercises: prog.exercises ?? [] };
  }, [params, sessions]);

  const start = (exerciseIndex: number) => {
    const me = getCurrentUser();
    const lookup = (name: string, exId: number) => getLastSets(name, exId);
    const participant =
      params.source === 'custom'
        ? seedCustomParticipant(me, exercises, { lookupPrevSets: lookup })
        : seedParticipant(me, program, { lookupPrevSets: lookup });
    startTraining([participant]);
    navigation.navigate('ExerciseDetail', {
      participantId: me.id,
      programId: participant.programId,
      exerciseIndex,
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={program.name} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing['2xl'] + insets.bottom + 64 }]}
        showsVerticalScrollIndicator={false}
      >
        {exercises.length === 0 ? (
          <Text style={styles.empty}>This workout has no exercises yet.</Text>
        ) : (
          <ProgramExerciseList program={program} onSelectExercise={(i) => start(i)} />
        )}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
        <Button title="Start training" onPress={() => start(0)} disabled={exercises.length === 0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  empty: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.neutral1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: errors limited to the still-missing `TrainHomeScreen` import (resolved in Task 9).

- [ ] **Step 3: Commit**

```bash
git add src/screens/client/train/WorkoutOverviewScreen.tsx
git commit -m "feat(client): workout overview that starts a single-participant session

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: `TrainHomeScreen`

The Train tab landing with the three start paths.

**Files:**
- Create: `src/screens/client/train/TrainHomeScreen.tsx`

- [ ] **Step 1: Create `src/screens/client/train/TrainHomeScreen.tsx`**

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TrainStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { Card, SectionTitle, Tag, Button, EmptyState } from '../../../components/ui';
import { useSessionsStore } from '../../../store/sessionsStore';
import { mockTrainingPrograms } from '../../../mocks';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';

type Nav = NavigationProp<TrainStackParamList, 'TrainHome'>;

const PROGRAMS = mockTrainingPrograms.filter((p) => (p.exercises?.length ?? 0) > 0);

export function TrainHomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const sessions = useSessionsStore((s) => s.sessions);

  // Assigned workouts = pending sessions that carry a program.
  const assigned = sessions.filter((s) => s.status === 'pending' && !!s.programId);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Train" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing['2xl'] + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle>Assigned by your trainer</SectionTitle>
        {assigned.length === 0 ? (
          <EmptyState title="No assigned workouts" subtitle="Your trainer hasn't assigned a session yet." />
        ) : (
          assigned.map((s) => {
            const program = mockTrainingPrograms.find((p) => p.id === s.programId);
            return (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('WorkoutOverview', { source: 'assigned', sessionId: s.id })}
              >
                <Card style={styles.assignedCard}>
                  <Text style={styles.assignedTitle}>{program?.name ?? s.title}</Text>
                  <View style={styles.tagsRow}>
                    <Tag label={s.time} variant="default" />
                    <Tag label={program?.tag ?? s.type} variant="default" />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        <SectionTitle>Ready-made programs</SectionTitle>
        {PROGRAMS.map((p) => (
          <TouchableOpacity
            key={p.id}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WorkoutOverview', { source: 'program', programId: p.id })}
          >
            <Card style={styles.programCard}>
              <Text style={styles.assignedTitle}>{p.name}</Text>
              <View style={styles.tagsRow}>
                <Tag label={`${p.exercises!.length} exercises`} variant="default" />
                <Tag label={p.tag} variant="default" />
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <SectionTitle>Build your own</SectionTitle>
        <Text style={styles.hint}>Pick exercises and start a custom session.</Text>
        <Button title="Build a workout" variant="outline" onPress={() => navigation.navigate('WorkoutBuilder')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  assignedCard: { marginBottom: spacing.md },
  programCard: { marginBottom: spacing.md },
  assignedTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagsRow: { flexDirection: 'row', gap: spacing.sm },
  hint: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.md },
});
```

(Note: verify `EmptyState` props against `src/components/ui/EmptyState.tsx` — it exports `EmptyStateProps`. If its prop names differ from `title`/`subtitle`, adjust this call to match; the rest of the screen is unaffected.)

- [ ] **Step 2: Typecheck the whole project**

Run: `npm run typecheck`
Expected: PASS (0 errors).

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no new errors. Fix any unused imports introduced by the tab-navigator edits (e.g. removed `makeClientPlaceholder`).

- [ ] **Step 5: Commit**

```bash
git add src/screens/client/train/TrainHomeScreen.tsx
git commit -m "feat(client): Train tab landing with three start paths

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Manual verification

**Files:** none (verification only)

- [ ] **Step 1: Boot the app as a client**

Run: `npm start` (then open iOS/web). In onboarding choose **I'm a client** (or set `userRole: 'client'` if already onboarded).
Expected: the bottom tab bar shows **Home · Trainers · Train · Chat · Progress**.

- [ ] **Step 2: Ready-made program path**

Open **Train** → tap a program under "Ready-made programs" → **WorkoutOverview** shows its exercises → tap **Start training** → **ExerciseDetail** opens with no participant switcher (single participant) → edit weight/reps, start a rest timer (counts down) → **Finish** → **TrainingSummary** shows the logged sets → **Done** returns to **TrainHome**.

- [ ] **Step 3: Build-your-own path**

**Train** → **Build a workout** → select 2–3 exercises → **Continue** → **WorkoutOverview** titled "Custom workout" → **Start training** → live flow works → **Done**.

- [ ] **Step 4: Assigned path**

If an assigned (pending + programId) session exists, it appears under "Assigned by your trainer"; tapping it starts that program. (If none, the empty state shows — acceptable.)

- [ ] **Step 5: Trainer regression**

Switch to **trainer** role. From Home/ScheduleCard start a training; the multi-client switcher, set logging, rest timers, and the summary still work unchanged. The summary's new **Done** ends the session and returns to the Clients list.

- [ ] **Step 6: Verify history loop**

After a client **Done**, open **Progress** → **Training history**: the just-completed session should appear (written via `addCompletedTraining` for "You").

---

## Notes & Known Simplifications

- **Single global store, one role per app instance.** The app is either trainer or client (role-based navigation), so the shared `activeTrainingStore` singleton is safe. "Shared model" here means one type/store/screen set, not cross-device sync.
- **Completion on multi-participant trainer sessions.** "Done" saves the *currently shown* participant and ends the whole session. This matches the existing "Finish→Summary" implication and is acceptable for the mock; a real backend would persist per-participant.
- **`prevSets` for custom workouts** are looked up from the current user's history by `exerciseId`, so previously-trained exercises still show "Last time".
- **No network sync** — out of scope per the spec; the `SessionParticipant` structure is the seam a future PHP backend will sync.
