import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandStorage } from '../services/storage';
import type { Units } from '../utils/format/units';

export type UserRole = 'client' | 'trainer';

interface AppState {
  isOnboarded: boolean;
  userRole: UserRole | null;
  userName: string | null;
  points: number;
  /** Weight display/entry unit (values are always stored in kg). */
  units: Units;
  setOnboarded: (value: boolean) => void;
  setUserRole: (role: UserRole | null) => void;
  setUserName: (name: string | null) => void;
  addPoints: (amount: number) => void;
  setUnits: (units: Units) => void;
  reset: () => void;
}

const initialState = {
  isOnboarded: false,
  userRole: null as UserRole | null,
  userName: null as string | null,
  points: 0,
  units: 'metric' as Units,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setOnboarded: (value) => set({ isOnboarded: value }),
      setUserRole: (role) => set({ userRole: role }),
      setUserName: (name) => set({ userName: name }),
      addPoints: (amount) =>
        set((state) => ({ points: state.points + amount })),
      setUnits: (units) => set({ units }),
      reset: () => set(initialState),
    }),
    { name: 'app-storage', storage: zustandStorage }
  )
);
