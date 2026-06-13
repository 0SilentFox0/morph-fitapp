import type { Session, TrainingProgram, ProgramExercise } from '../mocks';
import type { ActiveClient } from '../store/activeTrainingStore';

type Participant = Session['participants'][number];

/** Builds an ActiveClient seed from a session participant and an assigned program. */
export function seedActiveClient(
  participant: Participant,
  program: TrainingProgram,
): ActiveClient {
  const exercises = program.exercises ?? [];
  return {
    clientId: participant.id,
    name: participant.name,
    avatar: participant.avatar,
    programId: program.id,
    exerciseIndex: 0,
    setIndex: 0,
    setLog: Object.fromEntries(
      exercises.map((ex: ProgramExercise) => [ex.id, ex.sets.map((s) => ({ ...s }))]),
    ),
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
    s.participants.map((p) => ({ participant: p, programId: s.programId })),
  );

  return entries.map((entry, i) => {
    const program =
      withExercises.find((p) => p.id === entry.programId) ??
      withExercises[i % withExercises.length]!;
    return seedActiveClient(entry.participant, program);
  });
}
