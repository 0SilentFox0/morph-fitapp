/** Body measurement history (client progress). */

export interface MeasurementEntry {
  id: string;
  /** ISO date the measurement was taken. */
  date: string;
  weightKg: number;
  chestCm?: number;
  waistCm?: number;
  armCm?: number;
}
