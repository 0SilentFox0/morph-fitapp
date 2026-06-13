import { create } from 'zustand';
import { mockTrainingHistory, CURRENT_USER_NAME } from '../mocks';
import type { CompletedTraining, ExerciseSet } from '../mocks';

export type { CompletedTraining };

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

interface TrainingHistoryState {
  history: CompletedTraining[];
  /** All completed trainings for a client, oldest → newest (seed order). */
  getClientHistory: (clientName: string) => CompletedTraining[];
  /** The signed-in client's own trainings, oldest → newest. */
  getCurrentUserHistory: () => CompletedTraining[];
  /** Sets logged for an exercise in the client's most recent training, or null. */
  getLastSets: (clientName: string, exerciseId: number) => ExerciseSet[] | null;
}

export const useTrainingHistoryStore = create<TrainingHistoryState>((set, get) => ({
  history: mockTrainingHistory,

  getClientHistory: (clientName) => {
    const key = normalizeName(clientName);
    return get().history.filter((h) => normalizeName(h.clientName) === key);
  },

  getCurrentUserHistory: () => get().getClientHistory(CURRENT_USER_NAME),

  getLastSets: (clientName, exerciseId) => {
    const key = normalizeName(clientName);
    const matches = get().history.filter(
      (h) =>
        normalizeName(h.clientName) === key &&
        h.exercises.some((e) => e.exerciseId === exerciseId),
    );
    if (matches.length === 0) return null;
    // Seed order is chronological, so the last match is the most recent.
    const newest = matches[matches.length - 1]!;
    return newest.exercises.find((e) => e.exerciseId === exerciseId)?.sets ?? null;
  },
}));
