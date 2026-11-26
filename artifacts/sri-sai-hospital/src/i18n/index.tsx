/*
  English | Telugu language switch.
  - English is the default. The choice is saved in localStorage ("sbh-lang") and shared with the service pages,
    so it is kept while moving between the home page, the gallery and the service pages.
  - t('English text') returns the Telugu from ./te.json when Telugu is selected, otherwise the English as written.
    Placeholders like {n} are filled from the second argument.
  - Department and service names live in src/data/services.json (each department has a "te" block).
*/
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import teStrings from './te.json';

export type Lang = 'en' | 'te';
export const LANG_KEY = 'sbh-lang';

const te = teStrings as Record<string, string>;

function readStoredLang(): Lang {
  try {
    return window.localStorage.getItem(LANG_KEY) === 'te' ? 'te' : 'en';
  } catch {
    return 'en';
  }
}

type LangContextValue = { lang: Lang; setLang: (lang: Lang) => void };
const LangContext = createContext<LangContextValue>({ lang: 'en', setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch {
      // Private mode or blocked storage: the switch still works for this visit.
    }
  }, [lang]);
  const value = useMemo(() => ({ lang, setLang: setLangState }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

const reportedMissing = new Set<string>();

export function translate(lang: Lang, text: string, vars?: Record<string, string | number>) {
  let out = text;
  if (lang === 'te') {
    const found = te[text];
    if (found !== undefined) out = found;
    else if (import.meta.env.DEV && !reportedMissing.has(text)) {
      reportedMissing.add(text);
      console.warn(`[i18n] Missing Telugu for: "${text}"`);
    }
  }
  if (vars) for (const [key, value] of Object.entries(vars)) out = out.split(`{${key}}`).join(String(value));
  return out;
}

export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  const t = useCallback((text: string, vars?: Record<string, string | number>) => translate(lang, text, vars), [lang]);
  return { lang, setLang, t };
}

// Link to a service page in the current language: /neurology-tanuku or /te/neurology-tanuku.
export function pageHref(lang: Lang, slug: string) {
  return lang === 'te' ? `/te/${slug}` : `/${slug}`;
}

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <div className={`lang-toggle ${className}`} role="group" aria-label={t('Language')}>
      <button type="button" aria-pressed={lang === 'en'} lang="en" onClick={() => setLang('en')}>English</button>
      <span aria-hidden="true">|</span>
      <button type="button" aria-pressed={lang === 'te'} lang="te" onClick={() => setLang('te')}>తెలుగు</button>
    </div>
  );
}
