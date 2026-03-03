import { create } from 'zustand';

export type UserRole = 'client' | 'trainer';

interface AppState {
  isOnboarded: boolean;
  userRole: UserRole | null;
  userName: string | null;
  setOnboarded: (value: boolean) => void;
  setUserRole: (role: UserRole | null) => void;
  setUserName: (name: string | null) => void;
  reset: () => void;
}

const initialState = {
  isOnboarded: false,
  userRole: null,
  userName: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setOnboarded: (value) => set({ isOnboarded: value }),
  setUserRole: (role) => set({ userRole: role }),
  setUserName: (name) => set({ userName: name }),
  reset: () => set(initialState),
}));
