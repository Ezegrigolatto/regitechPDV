import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CashSession } from '@/services/cash-sessions.service';

interface CajaStore {
  currentSession: CashSession | null;
  snoozeUntil: number | null; // timestamp
  setCurrentSession: (session: CashSession | null) => void;
  snooze: () => void;
  clearSnooze: () => void;
  isSnoozed: () => boolean;
}

export const useCajaStore = create<CajaStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      snoozeUntil: null,

      setCurrentSession: (session) => set({ currentSession: session }),

      snooze: () => {
        const snoozeUntil = Date.now() + 5 * 60 * 1000; // 5 minutos
        set({ snoozeUntil });
      },

      clearSnooze: () => set({ snoozeUntil: null }),

      isSnoozed: () => {
        const { snoozeUntil } = get();
        if (!snoozeUntil) return false;
        return Date.now() < snoozeUntil;
      },
    }),
    { name: 'caja-store' }
  )
);