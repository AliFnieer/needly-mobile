import '../../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInter,
} from '@expo-google-fonts/inter';
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  useFonts as useTajawal,
} from '@expo-google-fonts/tajawal';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { initI18n } from '@/i18n/i18n';
import { AuthProvider } from '@/providers/auth-provider';
import { LanguageProvider } from '@/providers/language-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider, useTheme } from '@/providers/theme-provider';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: 'onboarding',
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { theme, ready: themeReady } = useTheme();
  const [interLoaded, interError] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [tajawalLoaded, tajawalError] = useTajawal({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().finally(() => setI18nReady(true));
  }, []);

  const fontsReady = (interLoaded || interError) && (tajawalLoaded || tajawalError);

  useEffect(() => {
    if (fontsReady && i18nReady && themeReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady, i18nReady, themeReady]);

  if (!fontsReady || !i18nReady || !themeReady) {
    return null;
  }

  const navigationTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <QueryProvider>
      <LanguageProvider>
        <AuthProvider>
          <NavigationThemeProvider value={navigationTheme}>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          </NavigationThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryProvider>
  );
}