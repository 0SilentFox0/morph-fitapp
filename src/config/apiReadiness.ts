/**
 * Which backend modules are live and safe to call. The frontend is ahead of the
 * backend, so screens read these flags (via `withMockFallback`) and serve mock
 * data for any module whose endpoints aren't deployed yet — nothing breaks, and
 * we flip a flag here the moment an endpoint ships.
 *
 * Verified against the live OpenAPI spec at {API_BASE}/docs on 2026-06-17.
 * Present paths: /auth, /me, /me/onboarding/complete, /me/sessions,
 * /me/measurements, /me/workout-logs, /clients, /client-packages,
 * /package-templates, /conversations, /exercises, /notifications, /programs,
 * /sessions, /transactions, /withdrawals, /workout-logs, /device-tokens.
 * Absent: /analytics/* (Phase 3), /trainers (B2), POST /me/sessions (client
 * self-booking — only GET shipped), /auth/google.
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
  /** Client's own sessions via `GET /me/sessions` (read). Booking write is still local — see `clientBooking`. */
  clientSessions: true,
  /** Client's own body measurements via `GET`/`POST /me/measurements`. */
  measurements: true,
  /** Client's own training history via `GET /me/workout-logs`. */
  trainingHistory: true,
  /** No /analytics/* endpoints on the server yet — dashboard aggregates stay on mock data. */
  analytics: false,
  /**
   * Google OAuth sign-in. The frontend plumbing (button → store → authApi) is in
   * place behind `withMockFallback`; flip to true once the backend exposes
   * `POST /auth/google` (exchange a Google id_token for our Sanctum tokens) and
   * the expo-auth-session client IDs are configured. See services/auth/googleAuth.ts.
   */
  google: false,
  /**
   * Client-initiated session booking. There is no client-self booking endpoint
   * yet (see FRONTEND_INTEGRATION_CHANGES.md — no `POST /me/sessions`), so the
   * request is mirrored locally for now. Flip once the self-scoped endpoint ships.
   */
  clientBooking: false,
  /**
   * Client → trainer connection requests. No endpoint yet; the request stays
   * local (status `pending`) until the backend adds connection requests.
   */
  trainerConnect: false,
} as const;

export type ApiFeature = keyof typeof apiReadiness;

export function isApiReady(feature: ApiFeature): boolean {
  return apiReadiness[feature];
}
