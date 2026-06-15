/**
 * Helpers for training programs and session participants — shared by the
 * session form and the program picker.
 */

import type { Session, TrainingProgram } from '../../types';

type SessionParticipant = Session['participants'][number];

/** One-line "tag · N exercises" summary shown under a program. */
export function programMeta(
  program: Pick<TrainingProgram, 'tag' | 'videoCount' | 'exercises'>
): string {
  const count = program.exercises?.length ?? program.videoCount;

  return `${program.tag} · ${count} exercises`;
}

/** Deterministic participant id derived from a display name. */
export function participantIdForName(name: string): string {
  return `p-${name.replace(/\s+/g, '-').toLowerCase()}`;
}

/**
 * Build session participants from display names, preserving id/avatar of any
 * already-existing participant with the same name.
 */
export function buildParticipants(
  names: string[],
  existing?: SessionParticipant[]
): SessionParticipant[] {
  return names.map((name) => {
    const prev = existing?.find((p) => p.name === name);

    if (prev) return { id: prev.id, name: prev.name, avatar: prev.avatar };

    return { id: participantIdForName(name), name };
  });
}
