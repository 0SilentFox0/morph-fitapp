import type { Session, TrainingProgram, ProgramExercise, ExerciseSet } from '../types';
import type { ActiveClient } from '../store/activeTrainingStore';

type Participant = Session['participants'][number];

/** Looks up a client's previous logged sets for an exercise (e.g. training history). */
export type PrevSetsLookup = (clientName: string, exerciseId: number) => ExerciseSet[] | null;

export interface SeedOptions {
  /** Planned targets per exercise id (from session creation), used as defaults. */
  plannedSets?: Record<number, ExerciseSet[]>;
  /** Resolves the client's previous sets for an exercise. */
  lookupPrevSets?: PrevSetsLookup;
}

/**
 * Builds an ActiveClient seed from a session participant and an assigned program.
 * Editable defaults (`setLog`) come from planned targets → previous training →
 * program template, in that order. `prevSets` keeps the previous values for the
 * live "Last time" comparison.
 */
export function seedActiveClient(
  participant: Participant,
  program: TrainingProgram,
  opts: SeedOptions = {},
): ActiveClient {
  const exercises = program.exercises ?? [];
  const { plannedSets, lookupPrevSets } = opts;

  const prevSets: Record<number, ExerciseSet[]> = {};
  const setLog: Record<number, ExerciseSet[]> = {};

  for (const ex of exercises as ProgramExercise[]) {
    const prev = lookupPrevSets?.(participant.name, ex.id) ?? null;
    if (prev) prevSets[ex.id] = prev.map((s) => ({ ...s }));

    const base = plannedSets?.[ex.id] ?? prev ?? ex.sets;
    setLog[ex.id] = base.map((s) => ({ ...s }));
  }

  return {
    clientId: participant.id,
    name: participant.name,
    avatar: participant.avatar,
    programId: program.id,
    exerciseIndex: 0,
    setIndex: 0,
    setLog,
    prevSets,
    rest: { running: false, remainingSec: 0, durationSec: 0 },
  };
}

/**
 * Derives the currently-active training group from scheduled sessions:
 * groups today's pending sessions by time slot and picks the busiest slot,
 * so multiple personal sessions booked at the same time auto-group into one
 * switchable set of clients. Each client is assigned its session's program
 * (falling back to a program that has exercises).
 */
export function deriveActiveGroup(
  sessions: Session[],
  programs: TrainingProgram[],
  lookupPrevSets?: PrevSetsLookup,
): ActiveClient[] {
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
    s.participants.map((p) => ({
      participant: p,
      programId: s.programId,
      plannedSets: s.plannedSets,
    })),
  );

  return entries.map((entry, i) => {
    const program =
      withExercises.find((p) => p.id === entry.programId) ??
      withExercises[i % withExercises.length]!;
    return seedActiveClient(entry.participant, program, {
      plannedSets: entry.plannedSets,
      lookupPrevSets,
    });
  });
}

/**
 * Builds the active group for ONE specific session (its participants + program
 * + planned sets), so a training can be started directly from a schedule card
 * or a client profile instead of auto-picking today's busiest slot.
 */
export function deriveGroupFromSession(
  session: Session,
  programs: TrainingProgram[],
  lookupPrevSets?: PrevSetsLookup,
): ActiveClient[] {
  const withExercises = programs.filter((p) => p.exercises && p.exercises.length > 0);
  const program =
    programs.find((p) => p.id === session.programId && (p.exercises?.length ?? 0) > 0) ??
    withExercises[0];
  if (!program) return [];

  return session.participants.map((participant) =>
    seedActiveClient(participant, program, {
      plannedSets: session.plannedSets,
      lookupPrevSets,
    }),
  );
}
