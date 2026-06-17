import { paginatedEnvelope } from '../../schemas/api/envelope';
import {
  BodyMeasurementSchema,
  SessionSchema,
  WorkoutLogSchema,
} from '../../schemas/api/models';
import type { Query } from './client';
import { api } from './client';
import type { MeasurementInput } from './clients';

/**
 * Self-scoped (`/me/*`) endpoints — the authenticated *client's* own data.
 * These are the client-side counterparts of the trainer-scoped resources
 * (`/sessions`, `/clients/{id}/measurements`, `/workout-logs`), shipped by the
 * backend so client screens can move off local mock. See FRONTEND_INTEGRATION_CHANGES.
 */

/** Sessions the authenticated client participates in. */
export const getMySessions = (query?: Query) =>
  api.get('/me/sessions', { query, schema: paginatedEnvelope(SessionSchema) });

/** The authenticated client's own body measurements. */
export const getMyMeasurements = (query?: Query) =>
  api.get('/me/measurements', {
    query,
    schema: paginatedEnvelope(BodyMeasurementSchema),
  });

/**
 * Record a body measurement for the authenticated client. The response shape is
 * not relied upon (the store updates optimistically), so no schema is attached.
 */
export const recordMyMeasurement = (body: MeasurementInput) =>
  api.post('/me/measurements', { body });

/** The authenticated client's workout-log (training) history. */
export const getMyWorkoutLogs = (query?: Query) =>
  api.get('/me/workout-logs', {
    query,
    schema: paginatedEnvelope(WorkoutLogSchema),
  });
