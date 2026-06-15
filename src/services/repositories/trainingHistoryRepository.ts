import { CURRENT_USER_NAME, mockTrainingHistory } from '../../mocks';
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
