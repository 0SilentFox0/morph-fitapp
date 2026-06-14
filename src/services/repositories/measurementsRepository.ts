import { mockMeasurements } from '../../mocks';
import type { MeasurementEntry } from '../../types';

/** Seed body measurements for the store. Single swap point for the future backend. */
export function getSeedMeasurements(): MeasurementEntry[] {
  return mockMeasurements;
}
