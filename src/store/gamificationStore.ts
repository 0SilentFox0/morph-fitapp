import { create } from 'zustand';

import {
  type CanonicalExercise,
  fetchCanonicalExercises,
  fetchCanonicalLeaderboard,
  fetchCompositeLeaderboard,
  fetchMyGamification,
  fetchPointsLedger,
  fetchTrainerGamification,
  fetchTrainerLeaderboard,
  type GamificationState,
  type LeaderboardEntry,
  type PointsLedgerEntry,
  type TrainerGamificationState,
} from '../services/gamificationApi';

interface GamificationStoreState {
  overview: GamificationState | null;
  composite: LeaderboardEntry[];
  canonical: Record<string, LeaderboardEntry[]>;
  canonicalExercises: CanonicalExercise[];
  ledger: PointsLedgerEntry[];
  trainerOverview: TrainerGamificationState | null;
  trainerBoard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;

  /** Loads the headline state + canonical catalog (for the League / overview UI). */
  loadOverview: () => Promise<void>;
  loadComposite: () => Promise<void>;
  loadCanonical: (canonicalKey: string) => Promise<void>;
  loadLedger: () => Promise<void>;
  /** Trainer league + trainer leaderboard (GAME-007). */
  loadTrainer: () => Promise<void>;
}

const MESSAGE = 'Could not load gamification data. Pull to retry.';

export const useGamificationStore = create<GamificationStoreState>(
  (set, get) => ({
    overview: null,
    composite: [],
    canonical: {},
    canonicalExercises: [],
    ledger: [],
    trainerOverview: null,
    trainerBoard: [],
    loading: false,
    error: null,

    loadOverview: async () => {
      set({ loading: true, error: null });
      try {
        const [overview, canonicalExercises] = await Promise.all([
          fetchMyGamification(),
          fetchCanonicalExercises(),
        ]);

        set({ overview, canonicalExercises, loading: false });
      } catch {
        set({ loading: false, error: MESSAGE });
      }
    },

    loadComposite: async () => {
      set({ loading: true, error: null });
      try {
        const page = await fetchCompositeLeaderboard();

        set({ composite: page.data, loading: false });
      } catch {
        set({ loading: false, error: MESSAGE });
      }
    },

    loadCanonical: async (canonicalKey) => {
      set({ loading: true, error: null });
      try {
        const page = await fetchCanonicalLeaderboard(canonicalKey);

        set({
          canonical: { ...get().canonical, [canonicalKey]: page.data },
          loading: false,
        });
      } catch {
        set({ loading: false, error: MESSAGE });
      }
    },

    loadLedger: async () => {
      try {
        const page = await fetchPointsLedger();

        set({ ledger: page.data });
      } catch {
        set({ error: MESSAGE });
      }
    },

    loadTrainer: async () => {
      set({ loading: true, error: null });
      try {
        const [trainerOverview, board] = await Promise.all([
          fetchTrainerGamification(),
          fetchTrainerLeaderboard(),
        ]);

        set({ trainerOverview, trainerBoard: board.data, loading: false });
      } catch {
        set({ loading: false, error: MESSAGE });
      }
    },
  })
);
