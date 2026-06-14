import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '../services/storage';
import { mockMeasurements } from '../mocks';
import type { MeasurementEntry } from '../types';

export type { MeasurementEntry };
export type MeasurementField = 'weightKg' | 'chestCm' | 'waistCm' | 'armCm';

export interface MeasurementPoint {
  date: string;
  value: number;
}

interface MeasurementsState {
  entries: MeasurementEntry[];
  /** Add a new measurement, keeping entries sorted oldest → newest by date. */
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
      entries: [...mockMeasurements],

      addEntry: (entry) =>
        set((state) => ({
          entries: [...state.entries, { ...entry, id: `m-${Date.now()}` }].sort(byDateAsc),
        })),

      getSeries: (field) =>
        get()
          .entries.map((e) => ({ date: e.date, value: e[field] }))
          .filter((p): p is MeasurementPoint => typeof p.value === 'number'),

      latest: () => {
        const { entries } = get();
        return entries.length ? entries[entries.length - 1]! : null;
      },
    }),
    { name: 'measurements-storage', storage: zustandStorage },
  ),
);
