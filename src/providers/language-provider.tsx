import { createContext, useContext, type PropsWithChildren } from 'react';

import {
  currentChoice,
  deviceLanguage,
  setLanguage as applyLanguage,
  type Language,
  type LanguageChoice,
} from '@/i18n/i18n';

type LanguageContextValue = {
  /** Resolved language currently in effect (system choices already resolved). */
  language: Language;
  /** Raw user choice, including 'system'. */
  choice: LanguageChoice;
  setLanguage: (choice: LanguageChoice) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveLanguage(): Language {
  return currentChoice === 'ar' || currentChoice === 'en' ? currentChoice : deviceLanguage();
}

/**
 * Language state is effectively static: changing the language reloads the app
 * (required so the New Architecture applies the new layout direction), so the
 * value is derived once from the i18n module.
 */
export function LanguageProvider({ children }: PropsWithChildren) {
  const value: LanguageContextValue = {
    language: resolveLanguage(),
    choice: currentChoice,
    setLanguage: applyLanguage,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}