import { apiReadiness } from '../../config/apiReadiness';
import { mockMeasurements } from '../../mocks';
import type { BodyMeasurement } from '../../schemas/api/models';
import type { MeasurementEntry } from '../../types';
import type { MeasurementInput } from '../api/clients';
import * as meApi from '../api/me';
import { withMockFallback } from '../mockFallback';

/** Seed body measurements for the store (mock fallback / first paint). */
export function getSeedMeasurements(): MeasurementEntry[] {
  return mockMeasurements;
}

const dayKey = (iso: string | null | undefined): string =>
  (iso ?? '').slice(0, 10);

/**
 * Adapt the backend's per-metric measurement rows to the UI's per-day entries.
 * The API stores one row per (metric, value); the UI groups a day's metrics into
 * a single entry. Metrics with no UI field (height, body_fat_percent, hips,
 * thigh) are dropped; `biceps` maps to the UI's "arm".
 */
export function apiMeasurementsToUi(
  rows: BodyMeasurement[]
): MeasurementEntry[] {
  const byDay = new Map<string, MeasurementEntry>();

  for (const row of rows) {
    const key = dayKey(row.measured_at) || row.id;

    const entry = byDay.get(key) ?? {
      id: `m-${key}`,
      date: row.measured_at ?? key,
    };

    switch (row.metric_type) {
      case 'weight':
        entry.weightKg = row.value;
        break;
      case 'chest':
        entry.chestCm = row.value;
        break;
      case 'waist':
        entry.waistCm = row.value;
        break;
      case 'biceps':
        entry.armCm = row.value;
        break;
      default:
        break; // height / body_fat_percent / hips / thigh — no UI field
    }

    byDay.set(key, entry);
  }

  return [...byDay.values()].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Load the signed-in client's own measurements (`GET /me/measurements`), behind
 * the `measurements` readiness flag. Falls back to seed data in mock mode.
 */
export async function loadClientMeasurements(): Promise<MeasurementEntry[]> {
  return withMockFallback(
    apiReadiness.measurements,
    async () => {
      const res = await meApi.getMyMeasurements({ per_page: 200 });

      return apiMeasurementsToUi(res.data);
    },
    () => mockMeasurements
  );
}

/** Map a UI entry's present fields to per-metric `POST /me/measurements` inputs. */
function entryToInputs(entry: Omit<MeasurementEntry, 'id'>): MeasurementInput[] {
  const at = entry.date;

  const inputs: MeasurementInput[] = [];

  if (entry.weightKg != null)
    inputs.push({
      metric_type: 'weight',
      value: entry.weightKg,
      unit: 'kg',
      measured_at: at,
    });

  if (entry.chestCm != null)
    inputs.push({
      metric_type: 'chest',
      value: entry.chestCm,
      unit: 'cm',
      measured_at: at,
    });

  if (entry.waistCm != null)
    inputs.push({
      metric_type: 'waist',
      value: entry.waistCm,
      unit: 'cm',
      measured_at: at,
    });

  if (entry.armCm != null)
    inputs.push({
      metric_type: 'biceps',
      value: entry.armCm,
      unit: 'cm',
      measured_at: at,
    });

  return inputs;
}

/**
 * Persist a new measurement entry to `POST /me/measurements` (one request per
 * recorded metric), behind the `measurements` flag. No-op in mock mode.
 */
export async function recordClientMeasurement(
  entry: Omit<MeasurementEntry, 'id'>
): Promise<void> {
  await withMockFallback(
    apiReadiness.measurements,
    async () => {
      await Promise.all(
        entryToInputs(entry).map((input) => meApi.recordMyMeasurement(input))
      );
    },
    () => undefined
  );
}
