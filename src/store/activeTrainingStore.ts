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
  openExercise: (participantId: string, programId: string | null, exerciseIndex: number, exercises?: ProgramExercise[]) => void;
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

  openExercise: (participantId, programId, exerciseIndex, exercises) =>
    set((state) => ({
      participants: mapParticipant(state.participants, participantId, (c) => ({
        ...c,
        programId,
        exerciseIndex,
        setIndex: 0,
        ...(exercises ? { exercises } : {}),
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
