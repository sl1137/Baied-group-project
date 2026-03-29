import { createContext, useContext } from 'react';
import type { Lang } from '../i18n';
import { translations } from '../i18n';

export const LangContext = createContext<Lang>('zh');

export function useLang() {
  const lang = useContext(LangContext);
  return { lang, tr: translations[lang] };
}
