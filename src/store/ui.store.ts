import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { VehicleType } from '@/features/vehicle/vehicle-adjustment';
import { guessDeviceLocale } from '@/i18n/deviceLocale';
import type { AppLocale } from '@/i18n/types';

type UiState = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  vehicleType: VehicleType;
  setVehicleType: (v: VehicleType) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      darkMode: false,
      setDarkMode: (value) => set({ darkMode: value }),
      locale: guessDeviceLocale(),
      setLocale: (locale) => set({ locale }),
      vehicleType: 'car',
      setVehicleType: (vehicleType) => set({ vehicleType }),
    }),
    {
      name: 'pothole-ui',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ darkMode: s.darkMode, locale: s.locale, vehicleType: s.vehicleType }),
    },
  ),
);
