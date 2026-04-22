import { create } from 'zustand';

type AppState = {
  /**
   * Feature flags / global toggles for the MVP scaffold.
   */
  enableOfflineQueue: boolean;
  setEnableOfflineQueue: (value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  enableOfflineQueue: true,
  setEnableOfflineQueue: (value) => set({ enableOfflineQueue: value }),
}));
