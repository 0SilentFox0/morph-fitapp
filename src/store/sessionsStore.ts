import { create } from 'zustand';

import { loadSessions as loadSessionsFromApi } from '../services/repositories/sessionsRepository';
import type { Session, SessionStatus } from '../types';
import { searchItems } from '../utils/common/search';
import { removeById, updateById } from './collection';

export type { Session, SessionStatus };

interface SessionsState {
  sessions: Session[];
  /** True once the API list has been pulled at least once this session. */
  loaded: boolean;
  /**
   * Load the trainer's sessions from the API (no-ops after first success unless
   * forced, so locally-created sessions aren't wiped on re-entry). Trainer-only:
   * client screens keep their locally-booked sessions (no client-self endpoint).
   */
  loadSessions: (force?: boolean) => Promise<Session[]>;
  addSession: (session: Omit<Session, 'id'>) => void;
  updateSession: (id: string, updates: Partial<Omit<Session, 'id'>>) => void;
  deleteSession: (id: string) => void;
  getSessionsByDateKey: (dateKey: string) => Session[];
  searchSessions: (query: string) => Session[];
  getTodaySessions: () => Session[];
  getUpcomingSessions: () => Session[];
}

let nextId = 1;

export const useSessionsStore = create<SessionsState>((set, get) => ({
  // Starts empty: no seeded sessions for a fresh account.
  sessions: [],
  loaded: false,

  loadSessions: async (force = false) => {
    if (get().loaded && !force) return get().sessions;

    const sessions = await loadSessionsFromApi();

    set({ sessions, loaded: true });

    return sessions;
  },

  addSession: (session) => {
    const id = String(nextId++);

    set((state) => ({
      sessions: [...state.sessions, { ...session, id }],
    }));
  },

  updateSession: (id, updates) => {
    set((state) => ({ sessions: updateById(state.sessions, id, updates) }));
  },

  deleteSession: (id) => {
    set((state) => ({ sessions: removeById(state.sessions, id) }));
  },

  getSessionsByDateKey: (dateKey) => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const todayKey = today.toISOString().slice(0, 10);

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowKey = tomorrow.toISOString().slice(0, 10);

    return get().sessions.filter((s) => {
      if (s.date === 'Today' && dateKey === todayKey) return true;

      if (s.date === 'Tomorrow' && dateKey === tomorrowKey) return true;

      if (s.date === dateKey) return true;

      return false;
    });
  },

  searchSessions: (query) =>
    searchItems(query, get().sessions, (s) => [
      s.title,
      s.type,
      ...s.participants.map((p) => p.name),
    ]),

  getTodaySessions: () => {
    return get().sessions.filter((s) => s.date === 'Today');
  },

  getUpcomingSessions: () => {
    return get().sessions.filter((s) => s.status !== 'canceled');
  },
}));
