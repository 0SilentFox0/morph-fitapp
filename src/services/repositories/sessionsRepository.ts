import { apiReadiness } from '../../config/apiReadiness';
import { mockSessions } from '../../mocks';
import type { Session as ApiSession } from '../../schemas/api/models';
import type { Session } from '../../types';
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
 * - participants are collected as free-text names with no client id, so
 *   `client_ids` is omitted; the trainer attaches clients once a real picker
 *   lands. The session is still created server-side.
 */
export function buildSessionInput(form: SessionFormInput): SessionInput {
  const start = mergeDateTime(form.date, form.time);

  const end = new Date(start.getTime() + (form.durationMinutes ?? 60) * 60_000);

  return {
    title: form.title.trim(),
    type: form.type,
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    ...(form.programId && UUID_RE.test(form.programId)
      ? { program_id: form.programId }
      : {}),
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
