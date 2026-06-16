/** Body measurement history (client progress). */

export interface MeasurementEntry {
  id: string;
  /** ISO date the measurement was taken. */
  date: string;
  /** Optional: an entry may record only body measures (chest/waist/arm). */
  weightKg?: number;
  chestCm?: number;
  waistCm?: number;
  armCm?: number;
}
