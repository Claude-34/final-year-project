export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
};

/** Default light theme (also exported as legacy `colors` alias). */
export const lightColors: ThemeColors = {
  background: '#F4F6FA',
  surface: '#FFFFFF',
  text: '#0B1220',
  mutedText: '#667085',
  border: '#E4E7EC',
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primarySoft: '#EFF6FF',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  success: '#16A34A',
  successSoft: '#ECFDF5',
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
};

export const darkColors: ThemeColors = {
  background: '#0F1419',
  surface: '#1A222C',
  text: '#F3F4F6',
  mutedText: '#9CA3AF',
  border: '#2D3748',
  primary: '#60A5FA',
  primaryDark: '#3B82F6',
  primarySoft: '#1E3A5F',
  danger: '#F87171',
  dangerSoft: '#3F1D1D',
  success: '#4ADE80',
  successSoft: '#14532D',
  warning: '#FBBF24',
  warningSoft: '#422006',
};

export function getPalette(isDark: boolean): ThemeColors {
  return isDark ? darkColors : lightColors;
}
