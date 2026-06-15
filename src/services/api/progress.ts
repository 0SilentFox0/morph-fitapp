import { api } from './client';

export {
  listMeasurements,
  listPersonalRecords,
  measurementHistory,
  recordMeasurement,
} from './clients';

/** Delete a measurement by its own id (not nested under a client). */
export const deleteMeasurement = (id: string) =>
  api.delete(`/measurements/${id}`);
