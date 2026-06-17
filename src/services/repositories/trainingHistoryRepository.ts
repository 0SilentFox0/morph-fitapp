import { apiReadiness } from '../../config/apiReadiness';
import { CURRENT_USER_NAME, mockTrainingHistory } from '../../mocks';
import type { WorkoutLog } from '../../schemas/api/models';
import type { CompletedTraining } from '../../types';
import * as meApi from '../api/me';
import { withMockFallback } from '../mockFallback';

/** Seed completed-training history for the store. Single swap point for the backend. */
export function getSeedTrainingHistory(): CompletedTraining[] {
  return mockTrainingHistory;
}

/**
 * Stable non-negative number from a UUID. The UI keys exercises by a numeric id
 * (the mock catalog / muscle map), while the backend uses UUIDs; hashing keeps
 * live exercises distinct without colliding with the small numeric muscle map.
 * Consequence (known, deferred): live logs contribute to volume/session totals
 * but not the per-muscle body-map until a UUID→catalog join exists.
 */
function hashId(uuid: string): number {
  let h = 0;

  for (let i = 0; i < uuid.length; i++) {
    h = (h * 31 + uuid.charCodeAt(i)) | 0;
  }

  return Math.abs(h);
}

/**
 * Adapt a backend workout log to the UI's CompletedTraining. `clientName` is
 * tagged with the current-user join key so the store's `getClientHistory`
 * filter matches; `programId` falls back to the session id (logs link to a
 * session, not a program).
 */
export function apiWorkoutLogToCompletedTraining(
  log: WorkoutLog
): CompletedTraining {
  return {
    id: log.id,
    clientName: getCurrentUserName(),
    programId: log.session_id,
    date: log.finished_at ?? log.started_at ?? log.created_at ?? '',
    exercises: log.exercises.map((ex) => ({
      exerciseId: hashId(ex.exercise_id),
      sets: ex.sets.map((s) => ({ weight: s.weight_kg, reps: s.reps })),
    })),
  };
}

/**
 * Load the signed-in client's training history (`GET /me/workout-logs`), behind
 * the `trainingHistory` readiness flag. Oldest → newest to match seed chronology.
 */
export async function loadClientWorkoutLogs(): Promise<CompletedTraining[]> {
  return withMockFallback(
    apiReadiness.trainingHistory,
    async () => {
      const res = await meApi.getMyWorkoutLogs({ per_page: 200 });

      return res.data
        .map(apiWorkoutLogToCompletedTraining)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    () => mockTrainingHistory
  );
}

/**
 * The signed-in client's name. With a real backend this comes from the auth
 * session; for now it's the seed identity.
 */
export function getCurrentUserName(): string {
  return CURRENT_USER_NAME;
}

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
