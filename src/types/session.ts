/** Scheduled training session models. */

import type { ExerciseSet } from './training';

export type SessionStatus = 'completed' | 'pending' | 'canceled';

export interface Session {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  status: SessionStatus;
  participants: { id: string; name: string; avatar?: string }[];
  programId?: string;
  /**
   * Planned (target) sets per exercise id, computed at creation from the
   * client's previous training + progression %. Seeds the live defaults.
   */
  plannedSets?: Record<number, ExerciseSet[]>;
}
