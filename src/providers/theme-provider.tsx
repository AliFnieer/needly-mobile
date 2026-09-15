import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { darkPalette, palette, type Theme, type ThemePreference } from '@/constants/theme';

export type { Theme, ThemePreference };

const THEME_STORAGE_KEY = 'needly.theme';

type ThemeContextValue = {
  preference: ThemePreference;
  theme: Theme;
  colors: typeof palette;
  ready: boolean;
  setPreference: (preference: ThemePreference) => void;
  cls: (light: string, dark: string) => string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(preference: ThemePreference, system: ReturnType<typeof useColorScheme>): Theme {
  if (preference === 'system') {
    return system === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

// Persists the light/dark preference and resolves the active scheme. Theming is
// component-driven via `cls()` (full literal class per scheme); NativeWind's
// `dark:` variants and CSS-variable overrides don't switch manually on native,
// so the resolved theme also drives React Navigation and the status bar.
export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((value) => {
        if (value === 'light' || value === 'dark' || value === 'system') {
          setPreferenceState(value);
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const theme = resolveTheme(preference, system);
  const colors = theme === 'dark' ? darkPalette : palette;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    document.documentElement.style.backgroundColor = colors.surface;
    if (document.body) {
      document.body.style.backgroundColor = colors.surface;
    }
  }, [colors.surface]);

  const value = useMemo<ThemeContextValue>(() => {
    const setPreference = (next: ThemePreference) => {
      setPreferenceState(next);
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => undefined);
    };
    const cls = (light: string, dark: string): string => (theme === 'dark' ? dark : light);
    return { preference, theme, colors, ready, setPreference, cls };
  }, [preference, theme, colors, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}