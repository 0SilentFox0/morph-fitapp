/**
 * Which backend modules are live and safe to call. The frontend is ahead of the
 * backend, so screens read these flags (via `withMockFallback`) and serve mock
 * data for any module whose endpoints aren't deployed yet — nothing breaks, and
 * we flip a flag here the moment an endpoint ships.
 *
 * Verified against the live OpenAPI spec at {API_BASE}/docs on 2026-06-15.
 * Present paths: /auth, /me, /clients, /client-packages, /package-templates,
 * /conversations, /exercises, /notifications, /programs, /sessions,
 * /transactions, /withdrawals, /workout-logs, /device-tokens.
 * Absent: /analytics/* (Phase 3 — not yet implemented).
 */
export const apiReadiness = {
  auth: true,
  users: true,
  clients: true,
  packages: true,
  /**
   * Endpoints exist and the schema is now typed, but the chat LIST and THREAD
   * are coupled through chatStore (mock). Migrating the list alone would break
   * navigation into store-backed threads, so chat stays on mock until the list
   * + thread are migrated together. See chat migration follow-up.
   */
  chat: false,
  exercises: true,
  notifications: true,
  programs: true,
  sessions: true,
  transactions: true,
  workouts: true,
  /** No /analytics/* endpoints on the server yet — dashboard aggregates stay on mock data. */
  analytics: false,
} as const;

export type ApiFeature = keyof typeof apiReadiness;

export function isApiReady(feature: ApiFeature): boolean {
  return apiReadiness[feature];
}
