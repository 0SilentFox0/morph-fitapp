import { mockSessions } from '../../mocks';
import type { Session } from '../../types';

/**
 * Seed sessions for the store. This is the single swap point for the future
 * backend: replace the mock delegation here (likely with an async fetch) without
 * touching the store. Synchronous for now to preserve current behavior.
 */
export function getSeedSessions(): Session[] {
  return mockSessions;
}
