import { create } from 'zustand';

interface NotificationStore {
  unreadOrders: number;
  lastSeenOrderId: string | null;
  increment: () => void;
  reset: () => void;
  setLastSeenOrderId: (id: string | null) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadOrders: 0,
  lastSeenOrderId: null,
  increment: () => set((s) => ({ unreadOrders: s.unreadOrders + 1 })),
  reset: () => set({ unreadOrders: 0 }),
  setLastSeenOrderId: (id) => set({ lastSeenOrderId: id }),
}));
