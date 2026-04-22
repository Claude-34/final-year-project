import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const MAX_ITEMS = 80;

export type AppNotificationKind =
  | 'capture'
  | 'report'
  | 'route'
  | 'reminder'
  | 'authority'
  | 'community'
  | 'system';

export type AppNotification = {
  id: string;
  createdAt: string;
  read: boolean;
  title: string;
  body: string;
  kind: AppNotificationKind;
  /** Expo Router path, e.g. `/reports/demo-1` */
  href?: string;
};

type NotificationsState = {
  items: AppNotification[];
  pushNotification: (input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      items: [],
      pushNotification: (input) => {
        const n: AppNotification = {
          ...input,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((s) => ({ items: [n, ...s.items].slice(0, MAX_ITEMS) }));
      },
      markRead: (id) =>
        set((s) => ({
          items: s.items.map((x) => (x.id === id ? { ...x, read: true } : x)),
        })),
      markAllRead: () =>
        set((s) => ({
          items: s.items.map((x) => ({ ...x, read: true })),
        })),
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'pothole-app-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
