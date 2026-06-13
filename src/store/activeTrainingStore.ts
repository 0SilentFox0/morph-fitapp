import { create } from 'zustand';
import type { ExerciseSet } from '../mocks';

export type { ExerciseSet };

/** Rest-timer state, tracked per client so each can rest independently. */
export interface RestState {
  running: boolean;
  remainingSec: number;
  durationSec: number;
}

/** One client in the currently-active (possibly multi-client) training group. */
export interface ActiveClient {
  clientId: string;
  name: string;
  avatar?: string;
  programId: string;
  exerciseIndex: number;
  setIndex: number;
  /** Editable set values logged during the session, keyed by exercise id. */
  setLog: Record<number, ExerciseSet[]>;
  /** Read-only reference: the same exercises' sets from the client's previous training. */
  prevSets: Record<number, ExerciseSet[]>;
  rest: RestState;
}

interface ActiveTrainingState {
  clients: ActiveClient[];
  activeClientId: string | null;

  startTraining: (clients: ActiveClient[], activeClientId?: string) => void;
  endTraining: () => void;
  setActiveClient: (clientId: string) => void;

  setExerciseIndex: (clientId: string, index: number) => void;
  setSetIndex: (clientId: string, index: number) => void;
  /** Points a client at a specific program + exercise (used when an exercise is tapped). */
  openExercise: (clientId: string, programId: string, exerciseIndex: number) => void;
  /** Seeds an editable set log for an exercise the first time it is opened. */
  ensureSetLog: (clientId: string, exerciseId: number, sets: ExerciseSet[]) => void;
  updateSet: (
    clientId: string,
    exerciseId: number,
    setIndex: number,
    patch: Partial<ExerciseSet>,
  ) => void;
  toggleRepToFailure: (clientId: string, exerciseId: number, setIndex: number) => void;

  startRest: (clientId: string, durationSec: number) => void;
  /** Advances the active client's rest timer by one second. Driven by useRestTimer. */
  tickRest: () => void;
  stopRest: (clientId: string) => void;
}

function mapClient(
  clients: ActiveClient[],
  clientId: string,
  fn: (c: ActiveClient) => ActiveClient,
): ActiveClient[] {
  return clients.map((c) => (c.clientId === clientId ? fn(c) : c));
}

export const useActiveTrainingStore = create<ActiveTrainingState>((set, get) => ({
  clients: [],
  activeClientId: null,

  startTraining: (clients, activeClientId) => {
    const fallback = clients[0]?.clientId ?? null;
    const exists = clients.some((c) => c.clientId === activeClientId);
    set({ clients, activeClientId: exists ? activeClientId! : fallback });
  },

  endTraining: () => set({ clients: [], activeClientId: null }),

  setActiveClient: (clientId) => {
    if (get().clients.some((c) => c.clientId === clientId)) {
      set({ activeClientId: clientId });
    }
  },

  setExerciseIndex: (clientId, index) =>
    set((state) => ({
      clients: mapClient(state.clients, clientId, (c) => ({
        ...c,
        exerciseIndex: index,
        setIndex: 0,
      })),
    })),

  setSetIndex: (clientId, index) =>
    set((state) => ({
      clients: mapClient(state.clients, clientId, (c) => ({ ...c, setIndex: index })),
    })),

  openExercise: (clientId, programId, exerciseIndex) =>
    set((state) => ({
      clients: mapClient(state.clients, clientId, (c) => ({
        ...c,
        programId,
        exerciseIndex,
        setIndex: 0,
      })),
    })),

  ensureSetLog: (clientId, exerciseId, sets) =>
    set((state) => ({
      clients: mapClient(state.clients, clientId, (c) =>
        c.setLog[exerciseId]
          ? c
          : { ...c, setLog: { ...c.setLog, [exerciseId]: sets.map((s) => ({ ...s })) } },
      ),
    })),

  updateSet: (clientId, exerciseId, setIndex, patch) =>
    set((state) => ({
      clients: mapClient(state.clients, clientId, (c) => {
        const sets = c.setLog[exerciseId];
        if (!sets || !sets[setIndex]) return c;
        const nextSets = sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s));
        return { ...c, setLog: { ...c.setLog, [exerciseId]: nextSets } };
      }),
    })),

  toggleRepToFailure: (clientId, exerciseId, setIndex) =>
    set((state) => ({
      clients: mapClient(state.clients, clientId, (c) => {
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

  startRest: (clientId, durationSec) =>
    set((state) => ({
      clients: mapClient(state.clients, clientId, (c) => ({
        ...c,
        rest: { running: true, remainingSec: durationSec, durationSec },
      })),
    })),

  // Ticks every running client — a client's rest keeps counting down even
  // while the trainer is looking at someone else, so their avatar badge stays live.
  tickRest: () =>
    set((state) => ({
      clients: state.clients.map((c) => {
        if (!c.rest.running) return c;
        const remainingSec = Math.max(0, c.rest.remainingSec - 1);
        return { ...c, rest: { ...c.rest, remainingSec, running: remainingSec > 0 } };
      }),
    })),

  stopRest: (clientId) =>
    set((state) => ({
      clients: mapClient(state.clients, clientId, (c) => ({
        ...c,
        rest: { ...c.rest, running: false },
      })),
    })),
}));
