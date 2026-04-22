/**
 * @deprecated Prefer `useTheme().colors` from `@/theme/ThemeProvider` for screens that react to dark mode.
 * Static export stays as the light palette for any legacy imports during migration.
 */
export { lightColors as colors } from './palettes';
export type { ThemeColors } from './palettes';
