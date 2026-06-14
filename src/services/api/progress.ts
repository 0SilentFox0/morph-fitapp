import { api } from './client';
import { dataEnvelope } from '../../schemas/api/envelope';
import { BodyMeasurementSchema } from '../../schemas/api/models';

export {
  listMeasurements,
  recordMeasurement,
  measurementHistory,
  listPersonalRecords,
} from './clients';

/** Delete a measurement by its own id (not nested under a client). */
export const deleteMeasurement = (id: string) =>
  api.delete(`/measurements/${id}`).then(() => undefined);

/** Re-exported for callers that want the schema directly. */
export { BodyMeasurementSchema, dataEnvelope };
