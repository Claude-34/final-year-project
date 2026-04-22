import { useCallback } from 'react';

import { useUiStore } from '@/store/ui.store';

import { translate } from './translate';
import type { AppLocale } from './types';
import { LOCALE_OPTIONS } from './types';

export function useTranslation() {
  const locale = useUiStore((s) => s.locale);
  const setLocale = useUiStore((s) => s.setLocale);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  return {
    t,
    locale,
    setLocale,
    locales: LOCALE_OPTIONS,
  } as const;
}

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

/** Outside React (e.g. notifications): use current persisted locale. */
export function translateForUser(key: string, params?: Record<string, string | number>): string {
  const loc = useUiStore.getState().locale;
  return translate(loc, key, params);
}
