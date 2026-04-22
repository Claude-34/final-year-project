export type AppLocale = 'en' | 'fr' | 'es' | 'pt' | 'de';

export type MessageDict = Record<string, string>;

export const LOCALE_OPTIONS: { id: AppLocale; label: string; nativeLabel: string }[] = [
  { id: 'en', label: 'English', nativeLabel: 'English' },
  { id: 'fr', label: 'French', nativeLabel: 'Français' },
  { id: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { id: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { id: 'de', label: 'German', nativeLabel: 'Deutsch' },
];
