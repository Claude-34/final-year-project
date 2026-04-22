import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useUiStore } from '@/store/ui.store';

import { type ThemeColors, lightColors, getPalette } from './palettes';

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDark = useUiStore((s) => s.darkMode);
  const value = useMemo(() => ({ colors: getPalette(isDark), isDark }), [isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
