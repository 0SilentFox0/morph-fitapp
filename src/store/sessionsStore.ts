import { create } from 'zustand';
import { mockSessions } from '../mocks';
import type { Session, SessionStatus } from '../types';
import { searchItems } from '../utils/search';
import { updateById, removeById } from './collection';

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
