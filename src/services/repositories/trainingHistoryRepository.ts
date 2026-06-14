import { mockTrainingHistory, CURRENT_USER_NAME } from '../../mocks';
import type { CompletedTraining } from '../../types';

/** Seed completed-training history for the store. Single swap point for the backend. */
export function getSeedTrainingHistory(): CompletedTraining[] {
  return mockTrainingHistory;
}

/**
 * The signed-in client's name. With a real backend this comes from the auth
 * session; for now it's the seed identity.
 */
export function getCurrentUserName(): string {
  return CURRENT_USER_NAME;
}
