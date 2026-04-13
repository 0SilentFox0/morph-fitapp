import { create } from 'zustand';
import { mockSessions } from '../mocks';
import type { Session, SessionStatus } from '../mocks';

export type { Session, SessionStatus };

interface SessionsState {
  sessions: Session[];
  addSession: (session: Omit<Session, 'id'>) => void;
  updateSession: (id: string, updates: Partial<Omit<Session, 'id'>>) => void;
  deleteSession: (id: string) => void;
  getSessionsByDateKey: (dateKey: string) => Session[];
  searchSessions: (query: string) => Session[];
  getTodaySessions: () => Session[];
  getUpcomingSessions: () => Session[];
}

let nextId = mockSessions.length + 1;

export const useSessionsStore = create<SessionsState>((set, get) => ({
  sessions: mockSessions,

  addSession: (session) => {
    const id = String(nextId++);
    set((state) => ({
      sessions: [...state.sessions, { ...session, id }],
    }));
  },

  updateSession: (id, updates) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    }));
  },

  deleteSession: (id) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    }));
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

  searchSessions: (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return get().sessions;
    return get().sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.participants.some((p) => p.name.toLowerCase().includes(q)),
    );
  },

  getTodaySessions: () => {
    return get().sessions.filter((s) => s.date === 'Today');
  },

  getUpcomingSessions: () => {
    return get().sessions.filter((s) => s.status !== 'canceled');
  },
}));
