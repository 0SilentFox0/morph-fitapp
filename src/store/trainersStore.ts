import { create } from 'zustand';
import { mockTrainers, type Trainer, type ConnectionStatus } from '../mocks';

export type { Trainer, ConnectionStatus };

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
  trainers: mockTrainers,
  filterSpecialty: null,
  onlineOnly: false,

  getTrainer: (id) => get().trainers.find((t) => t.id === id),

  search: (query, specialty) => {
    const q = query.trim().toLowerCase();
    return get().trainers.filter((t) => {
      if (specialty && !t.specialties.includes(specialty)) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.headline.toLowerCase().includes(q) ||
        t.specialties.some((s) => s.toLowerCase().includes(q))
      );
    });
  },

  visibleTrainers: (query) => {
    const { search, filterSpecialty, onlineOnly } = get();
    return search(query, filterSpecialty).filter((t) => (onlineOnly ? t.online : true));
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
          : t,
      ),
    })),
}));
