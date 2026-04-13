import { create } from 'zustand';

export type UserRole = 'client' | 'trainer';

interface AppState {
  isOnboarded: boolean;
  userRole: UserRole | null;
  userName: string | null;
  points: number;
  setOnboarded: (value: boolean) => void;
  setUserRole: (role: UserRole | null) => void;
  setUserName: (name: string | null) => void;
  addPoints: (amount: number) => void;
  reset: () => void;
}

const initialState = {
  isOnboarded: false,
  userRole: null as UserRole | null,
  userName: null as string | null,
  points: 0,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setOnboarded: (value) => set({ isOnboarded: value }),
  setUserRole: (role) => set({ userRole: role }),
  setUserName: (name) => set({ userName: name }),
  addPoints: (amount) => set((state) => ({ points: state.points + amount })),
  reset: () => set(initialState),
}));
