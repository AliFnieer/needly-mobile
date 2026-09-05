import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

import ar from './locales/ar.json';
import en from './locales/en.json';

export type LanguageChoice = 'system' | 'en' | 'ar';
export type Language = 'en' | 'ar';

export const LANGUAGE_STORAGE_KEY = 'needly.language';

const RTL_LANGUAGE: Language = 'ar';

export function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return code === 'ar' ? 'ar' : 'en';
}

export function resolveLanguage(choice: LanguageChoice): Language {
  return choice === 'system' ? deviceLanguage() : choice;
}

// Layout direction is derived per-screen from the active language (Yoga
// `direction` via `useLanguage()`), so RTL flips immediately on change. On web
// this also mirrors the `dir` attribute so scrollbars/overflow follow.
export function applyLayoutDirection(language: Language): void {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const dir = language === RTL_LANGUAGE ? 'rtl' : 'ltr';
    document.documentElement?.setAttribute('dir', dir);
    document.body?.setAttribute('dir', dir);
  }
}

let readPromise: Promise<LanguageChoice> | null = null;
function readStoredChoice(): Promise<LanguageChoice> {
  if (!readPromise) {
    readPromise = AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((value) => (value === 'system' || value === 'en' || value === 'ar' ? value : 'system'))
      .catch(() => 'system');
  }
  return readPromise;
}

export let currentChoice: LanguageChoice = 'system';

let initPromise: Promise<Language> | null = null;
export function initI18n(): Promise<Language> {
  if (!initPromise) {
    initPromise = (async () => {
      const choice = await readStoredChoice();
      currentChoice = choice;
      const language = resolveLanguage(choice);
      applyLayoutDirection(language);
      // eslint-disable-next-line import/no-named-as-default-member
      await i18n.use(initReactI18next).init({
        resources: { en: { translation: en }, ar: { translation: ar } },
        lng: language,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
      });
      return language;
    })();
  }
  return initPromise;
}

export async function setLanguage(choice: LanguageChoice): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, choice);
  currentChoice = choice;

  const active: Language = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const language = resolveLanguage(choice);
  if (language !== active) {
    // eslint-disable-next-line import/no-named-as-default-member
    await i18n.changeLanguage(language);
  }
  applyLayoutDirection(language);
}