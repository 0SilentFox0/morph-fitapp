import { apiReadiness } from '../../config/apiReadiness';
import { mockSessions } from '../../mocks';
import type { Session as ApiSession } from '../../schemas/api/models';
import type { Session, SessionStatus } from '../../types';
import { formatTime } from '../../utils';
import * as meApi from '../api/me';
import type { SessionInput } from '../api/sessions';
import * as sessionsApi from '../api/sessions';
import { withMockFallback } from '../mockFallback';

/**
 * Seed sessions for the store. This is the single swap point for the future
 * backend: replace the mock delegation here (likely with an async fetch) without
 * touching the store. Synchronous for now to preserve current behavior.
 */
export function getSeedSessions(): Session[] {
  return mockSessions;
}

// The 5-value backend lifecycle collapses onto the UI's 3 display states.
const STATUS_FROM_API: Record<ApiSession['status'], SessionStatus> = {
  planned: 'pending',
  in_progress: 'pending',
  completed: 'completed',
  canceled: 'canceled',
  no_show: 'canceled',
};

const dateKeyOf = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

/**
 * Render an ISO instant the way the rest of the app expects a session date:
 * 'Today' / 'Tomorrow' for the next two days, else a YYYY-MM-DD key. This keeps
 * the store's date queries (getTodaySessions / getSessionsByDateKey) working
 * unchanged.
 */
function relativeDateLabel(iso: string, now: Date): string {
  const key = dateKeyOf(new Date(iso));

  const today = new Date(now);

  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);

  tomorrow.setDate(tomorrow.getDate() + 1);

  if (key === dateKeyOf(today)) return 'Today';

  if (key === dateKeyOf(tomorrow)) return 'Tomorrow';

  return key;
}

/** Adapt a backend session to the UI session shape used by Home / Schedule. */
export function apiSessionToUi(s: ApiSession, now: Date = new Date()): Session {
  return {
    id: s.id,
    title: s.title,
    type: s.type ?? '',
    date: s.start_at ? relativeDateLabel(s.start_at, now) : '',
    time: s.start_at ? formatTime(s.start_at) : '',
    status: STATUS_FROM_API[s.status],
    participants: s.participants.map((p) => ({
      id: p.client_id,
      name: p.client?.name ?? 'Client',
      avatar: p.client?.avatar_url ?? undefined,
    })),
    programId: s.program_id ?? undefined,
  };
}

/**
 * Load the trainer's sessions. Behind the `sessions` readiness flag. Trainer-
 * scoped (`GET /sessions`); there is no client-self endpoint yet, so the client
 * experience keeps its locally-booked sessions instead of calling this.
 */
export async function loadSessions(): Promise<Session[]> {
  return withMockFallback(
    apiReadiness.sessions,
    async () => {
      const res = await sessionsApi.listSessions({ per_page: 100 });

      return res.data.map((s) => apiSessionToUi(s));
    },
    () => mockSessions
  );
}

/**
 * Load the authenticated client's own sessions (`GET /me/sessions`), behind the
 * `clientSessions` readiness flag. Self-scoped counterpart of {@link loadSessions}
 * (which is trainer-only). Booking writes stay local until `POST /me/sessions`
 * ships (see `apiReadiness.clientBooking`).
 */
export async function loadClientSessions(): Promise<Session[]> {
  return withMockFallback(
    apiReadiness.clientSessions,
    async () => {
      const res = await meApi.getMySessions({ per_page: 100 });

      return res.data.map((s) => apiSessionToUi(s));
    },
    () => mockSessions
  );
}

/** Raw values the session form provides for a create/update. */
export interface SessionFormInput {
  title: string;
  type: string;
  /** Calendar day (Date) selected in the picker. */
  date: Date;
  /** Time-of-day (Date) selected in the picker. */
  time: Date;
  programId?: string;
  /** Session length; defaults to 60 minutes. */
  durationMinutes?: number;
  /** Real client UUIDs to attach as participants. Non-UUIDs are dropped. */
  clientIds?: string[];
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mergeDateTime(date: Date, time: Date): Date {
  const merged = new Date(date);

  merged.setHours(time.getHours(), time.getMinutes(), 0, 0);

  return merged;
}

/**
 * Adapt the session form to the backend `SessionInput`. Pure + validated.
 *
 * Known limitations until the matching screens are API-backed (P1.1):
 * - `program_id` is only forwarded when it is a real UUID; mock program ids
 *   ("p1") are dropped so a live create doesn't 422.
 * - participants collected as free-text names carry no client id and are
 *   dropped; pass real client UUIDs via `clientIds` (from a real client picker)
 *   to attach them. Non-UUID ids are filtered out so a live create doesn't 422.
 */
export function buildSessionInput(form: SessionFormInput): SessionInput {
  const start = mergeDateTime(form.date, form.time);

  const end = new Date(start.getTime() + (form.durationMinutes ?? 60) * 60_000);

  const clientIds = (form.clientIds ?? []).filter((id) => UUID_RE.test(id));

  return {
    title: form.title.trim(),
    type: form.type,
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    ...(form.programId && UUID_RE.test(form.programId)
      ? { program_id: form.programId }
      : {}),
    ...(clientIds.length > 0 ? { client_ids: clientIds } : {}),
  };
}

function echoSession(input: SessionInput): ApiSession {
  return {
    id: `mock-${input.start_at}`,
    trainer_id: 'mock-trainer',
    title: input.title,
    type: input.type,
    start_at: input.start_at,
    end_at: input.end_at,
    status: 'planned',
    status_changed_at: null,
    cancellation_reason: null,
    notes: input.notes ?? null,
    program_id: input.program_id ?? null,
    client_package_id: null,
    series_id: null,
    google_event_id: null,
    participants: [],
    created_at: null,
  } as ApiSession;
}

/** Persist a new session. Lives behind the `sessions` readiness flag. */
export async function createSession(
  form: SessionFormInput
): Promise<ApiSession> {
  const input = buildSessionInput(form);

  return withMockFallback(
    apiReadiness.sessions,
    async () => (await sessionsApi.createSession(input)).data,
    () => echoSession(input)
  );
}

/**
 * Cancel a session on the backend so the other party sees it. No-op for local/
 * mock sessions (non-UUID ids), which only ever lived in the local store.
 */
export async function cancelSession(
  id: string,
  reason = 'Canceled by trainer'
): Promise<void> {
  if (!UUID_RE.test(id)) return;

  await withMockFallback(
    apiReadiness.sessions,
    async () => {
      await sessionsApi.cancelSession(id, reason);
    },
    () => undefined
  );
}

/** Persist an edit to an existing session. */
export async function updateSession(
  id: string,
  form: SessionFormInput
): Promise<ApiSession> {
  const input = buildSessionInput(form);

  return withMockFallback(
    apiReadiness.sessions,
    async () => (await sessionsApi.updateSession(id, input)).data,
    () => ({ ...echoSession(input), id })
  );
}
