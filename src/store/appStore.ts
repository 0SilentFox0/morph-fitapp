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
  /**
   * True while a brand-new user is signing up: the onboarding flow runs from the
   * unauthenticated state, and the account (email/password) is created at the
   * end. Lets RootNavigator show onboarding before auth. Reset on completion/logout.
   */
  signupMode: boolean;
  /** Whether the user has linked a Google account (enables Google sign-in). */
  googleLinked: boolean;
  setOnboarded: (value: boolean) => void;
  setUserRole: (role: UserRole | null) => void;
  setUserName: (name: string | null) => void;
  addPoints: (amount: number) => void;
  setUnits: (units: Units) => void;
  setSignupMode: (value: boolean) => void;
  setGoogleLinked: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  isOnboarded: false,
  userRole: null as UserRole | null,
  userName: null as string | null,
  points: 0,
  units: 'metric' as Units,
  signupMode: false,
  googleLinked: false,
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
      setSignupMode: (value) => set({ signupMode: value }),
      setGoogleLinked: (value) => set({ googleLinked: value }),
      reset: () => set(initialState),
    }),
    {
      name: 'app-storage',
      storage: zustandStorage,
      // signupMode is transient navigation state — never resume into it on a
      // cold start; everything else persists.
      partialize: ({ signupMode: _signupMode, ...rest }) => rest,
    }
  )
);
