import { mockTrainers } from '../../mocks';
import type { Trainer } from '../../types';

/** Seed trainers for the store. Single swap point for the future backend. */
export function getSeedTrainers(): Trainer[] {
  return mockTrainers;
}
