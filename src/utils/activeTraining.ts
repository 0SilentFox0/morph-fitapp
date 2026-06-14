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
  const exercises = (program.exercises ?? []).map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
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
