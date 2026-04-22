import { de } from './dicts/de';
import { en } from './dicts/en';
import { es } from './dicts/es';
import { fr } from './dicts/fr';
import { pt } from './dicts/pt';
import type { AppLocale } from './types';

const DICTS: Record<AppLocale, Record<string, string>> = {
  en,
  fr,
  es,
  pt,
  de,
};

export function translate(
  locale: AppLocale,
  key: string,
  params?: Record<string, string | number>,
): string {
  let template = DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      template = template.split(`{{${k}}}`).join(String(v));
    }
  }
  return template;
}
