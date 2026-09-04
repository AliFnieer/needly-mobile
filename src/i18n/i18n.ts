import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import * as Updates from 'expo-updates';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

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

/**
 * `I18nManager.forceRTL` is the single source of truth for layout direction so
 * a user-chosen language always wins, even when it contradicts the device
 * locale. Must run before first render: on the New Architecture changing
 * direction later only fully applies from a fresh launch.
 */
export function applyLayoutDirection(language: Language): void {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(language === RTL_LANGUAGE);
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

/**
 * Persist the user's choice and apply it. The New Architecture only applies
 * layout direction from a cold/JS launch, so a reload is required.
 */
export async function setLanguage(choice: LanguageChoice): Promise<void> {
  const language = resolveLanguage(choice);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, choice);
  currentChoice = choice;
  // eslint-disable-next-line import/no-named-as-default-member
  await i18n.changeLanguage(language);
  // New Architecture only applies layout direction from a fresh launch; if the
  // reload fails, translated strings still switch immediately.
  await Updates.reloadAsync().catch(() => undefined);
}