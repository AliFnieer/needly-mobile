import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import {
  currentChoice,
  setLanguage as applyLanguage,
  type Language,
  type LanguageChoice,
} from '@/i18n/i18n';

type LanguageContextValue = {
  language: Language;
  choice: LanguageChoice;
  setLanguage: (choice: LanguageChoice) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Language state is reactive: switching re-renders this provider (via
// `useTranslation`) and every consumer, so strings and per-screen layout
// `direction` flip immediately — no app reload.
export function LanguageProvider({ children }: PropsWithChildren) {
  const { i18n } = useTranslation();
  const [choice, setChoice] = useState<LanguageChoice>(() => currentChoice);

  const language: Language = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      choice,
      setLanguage: async (next) => {
        setChoice(next);
        await applyLanguage(next);
      },
    }),
    [language, choice],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}