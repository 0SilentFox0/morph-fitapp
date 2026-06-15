import { create } from 'zustand';

import { getSeedTrainers } from '../services/repositories';
import type { ConnectionStatus, Trainer } from '../types';
import { searchItems } from '../utils/common/search';

export type { ConnectionStatus, Trainer };

interface TrainersState {
  trainers: Trainer[];
  /** Shared filters, edited on the Filters screen and applied on the list. */
  filterSpecialty: string | null;
  onlineOnly: boolean;
  getTrainer: (id: string) => Trainer | undefined;
  /** Filter by free-text query (name/headline/specialty) and optional specialty. */
  search: (query: string, specialty?: string | null) => Trainer[];
  /** Search combined with the currently-applied shared filters. */
  visibleTrainers: (query: string) => Trainer[];
  setFilterSpecialty: (specialty: string | null) => void;
  setOnlineOnly: (value: boolean) => void;
  clearFilters: () => void;
  /** Number of active shared filters (for a badge on the filter button). */
  activeFilterCount: () => number;
  /** Send a connection request (none → pending). Idempotent for other states. */
  connect: (id: string) => void;
}

export const useTrainersStore = create<TrainersState>((set, get) => ({
  trainers: getSeedTrainers(),
  filterSpecialty: null,
  onlineOnly: false,

  getTrainer: (id) => get().trainers.find((t) => t.id === id),

  search: (query, specialty) => {
    const bySpecialty = specialty
      ? get().trainers.filter((t) => t.specialties.includes(specialty))
      : get().trainers;

    return searchItems(query, bySpecialty, (t) => [
      t.name,
      t.headline,
      ...t.specialties,
    ]);
  },

  visibleTrainers: (query) => {
    const { search, filterSpecialty, onlineOnly } = get();

    return search(query, filterSpecialty).filter((t) =>
      onlineOnly ? t.online : true
    );
  },

  setFilterSpecialty: (specialty) => set({ filterSpecialty: specialty }),
  setOnlineOnly: (value) => set({ onlineOnly: value }),
  clearFilters: () => set({ filterSpecialty: null, onlineOnly: false }),
  activeFilterCount: () => {
    const { filterSpecialty, onlineOnly } = get();

    return (filterSpecialty ? 1 : 0) + (onlineOnly ? 1 : 0);
  },

  connect: (id) =>
    set((state) => ({
      trainers: state.trainers.map((t) =>
        t.id === id && t.connection === 'none'
          ? { ...t, connection: 'pending' as ConnectionStatus }
          : t
      ),
    })),
}));
