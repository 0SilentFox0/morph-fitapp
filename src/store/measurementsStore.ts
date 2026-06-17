import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { logger } from '../services/logger';
import {
  getSeedMeasurements,
  loadClientMeasurements,
  recordClientMeasurement,
} from '../services/repositories';
import { zustandStorage } from '../services/storage';
import type { MeasurementEntry } from '../types';

export type { MeasurementEntry };
export type MeasurementField = 'weightKg' | 'chestCm' | 'waistCm' | 'armCm';

export interface MeasurementPoint {
  date: string;
  value: number;
}

interface MeasurementsState {
  entries: MeasurementEntry[];
  /** True once the client's own measurements have been pulled at least once. */
  loaded: boolean;
  /**
   * Load the signed-in client's measurements from `GET /me/measurements`
   * (no-ops after first success unless forced). Falls back to seed in mock mode.
   */
  load: (force?: boolean) => Promise<void>;
  /**
   * Add a new measurement, keeping entries sorted oldest → newest by date.
   * Optimistic: updates locally, then persists to `POST /me/measurements`.
   */
  addEntry: (entry: Omit<MeasurementEntry, 'id'>) => void;
  /** Points for one field across all entries that recorded it, chronological. */
  getSeries: (field: MeasurementField) => MeasurementPoint[];
  /** Most recent entry, or null. */
  latest: () => MeasurementEntry | null;
}

function byDateAsc(a: MeasurementEntry, b: MeasurementEntry): number {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

export const useMeasurementsStore = create<MeasurementsState>()(
  persist(
    (set, get) => ({
      entries: [...getSeedMeasurements()],
      loaded: false,

      load: async (force = false) => {
        if (get().loaded && !force) return;

        const entries = await loadClientMeasurements();

        set({ entries: [...entries].sort(byDateAsc), loaded: true });
      },

      addEntry: (entry) => {
        set((state) => ({
          entries: [...state.entries, { ...entry, id: `m-${Date.now()}` }].sort(
            byDateAsc
          ),
        }));

        // Persist in the background; a failure leaves the optimistic entry in
        // place (the user can retry) rather than blocking the UI.
        void recordClientMeasurement(entry).catch((e) =>
          logger.warn('measurementsStore: failed to persist measurement', {
            error: String(e),
          })
        );
      },

      getSeries: (field) =>
        get()
          .entries.map((e) => ({ date: e.date, value: e[field] }))
          .filter((p): p is MeasurementPoint => typeof p.value === 'number'),

      latest: () => {
        const { entries } = get();

        return entries.length ? entries[entries.length - 1]! : null;
      },
    }),
    { name: 'measurements-storage', storage: zustandStorage }
  )
);
