import * as Localization from 'expo-localization';

import type { AppLocale } from './types';

/** Pick a supported locale from the device, defaulting to English. */
export function guessDeviceLocale(): AppLocale {
  const primary = Localization.getLocales()[0];
  const tag = (primary?.languageCode ?? primary?.languageTag ?? 'en').toLowerCase();
  const base = tag.split('-')[0] ?? 'en';
  if (base === 'fr') return 'fr';
  if (base === 'es') return 'es';
  if (base === 'pt') return 'pt';
  if (base === 'de') return 'de';
  return 'en';
}
