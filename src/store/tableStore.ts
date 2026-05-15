import { create } from 'zustand';
import { TableSession } from '@/hooks/useOptimizedTableSessions';

interface TableStore {
  sessions: TableSession[];
  setSessions: (sessions: TableSession[]) => void;
  updateSession: (id: string, patch: Partial<TableSession>) => void;
  removeSession: (id: string) => void;
  addSession: (session: TableSession) => void;
  paidSessionIds: Set<string>;
  markPaid: (id: string) => void;
  rollbackPaid: (id: string) => void;
}

export const useTableStore = create<TableStore>((set) => ({
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  updateSession: (id, patch) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })),
  removeSession: (id) =>
    set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),
  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions.filter((s) => s.id !== session.id)],
    })),
  paidSessionIds: new Set(),
  markPaid: (id) =>
    set((state) => ({ paidSessionIds: new Set([...state.paidSessionIds, id]) })),
  rollbackPaid: (id) =>
    set((state) => {
      const next = new Set(state.paidSessionIds);
      next.delete(id);
      return { paidSessionIds: next };
    }),
}));
