import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const COOLDOWN_MS = 42_000;

type PassRecord = { count: number; lastAt: number };

type DrivingProximityState = {
  records: Record<string, PassRecord>;
  /** Returns new count and whether this increment hit the 5th pass (for smart reminders). */
  recordNearPass: (potholeId: string) => { count: number; hitFive: boolean };
  resetPothole: (potholeId: string) => void;
};

export const useDrivingProximityStore = create<DrivingProximityState>()(
  persist(
    (set, get) => ({
      records: {},
      recordNearPass: (potholeId) => {
        const now = Date.now();
        const prev = get().records[potholeId];
        if (prev && now - prev.lastAt < COOLDOWN_MS) {
          return { count: prev.count, hitFive: false };
        }
        const nextCount = (prev?.count ?? 0) + 1;
        set((s) => ({
          records: {
            ...s.records,
            [potholeId]: { count: nextCount, lastAt: now },
          },
        }));
        return { count: nextCount, hitFive: nextCount === 5 };
      },
      resetPothole: (potholeId) =>
        set((s) => {
          const { [potholeId]: _, ...rest } = s.records;
          return { records: rest };
        }),
    }),
    {
      name: 'pothole-driving-proximity',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ records: s.records }),
    },
  ),
);
