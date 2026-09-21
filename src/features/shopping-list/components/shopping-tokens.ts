import { useMemo } from 'react';
import { type TextStyle } from 'react-native';

import { Inter, Tajawal, type Language } from '@/constants/theme';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

export type ShoppingTokens = ReturnType<typeof useShoppingTokens>;

export type TextStyles = ReturnType<typeof buildTextStyles>;

/**
 * Color + type values lifted from the Figma "shopping" screens
 * (lists-overview / list-detail). The app's tokens already map most of them
 * (`surface` = #F8F9FF, `on-surface` = #131C26, amber accent = #F5B82E),
 * with a few neutrals the palette calls differently (#E6E2DE border,
 * #5C6470 secondary text, #7B5800 amber-on-dark). Kept in one hook so both
 * shopping screens render identically and stay theme-aware.
 */
export function useShoppingTokens() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const dark = theme === 'dark';

  const colors = useMemo(
    () => ({
      background: dark ? '#16140d' : '#F8F9FF',
      card: dark ? '#0d0c06' : '#FFFFFF',
      border: dark ? '#4c463a' : '#E6E2DE',
      borderStrong: dark ? '#f5b82e' : '#7B5800',
      text: dark ? '#ece9df' : '#131C26',
      secondary: dark ? '#cfc6b5' : '#5C6470',
      accent: '#F5B82E',
      accentText: dark ? '#3f2b00' : '#131C26',
      success: dark ? '#69dca1' : '#006C45',
      track: dark ? '#4c463a' : '#E6E2DE',
      avatarStroke: dark ? '#0d0c06' : '#FFFFFF',
      badge: dark ? '#38362b' : '#E6E2DE',
      error: dark ? '#ff9d9d' : '#C0392B',
    }),
    [dark],
  );

  const text = useMemo(() => buildTextStyles(language), [language]);

  return { colors, text, language };
}

/**
 * The exact type scale the Figma screens use (Inter, weights 800/700/600/500).
 * The app only bundles 400–700, so 800 renders as 700 (`fontWeight` clamps).
 */
function buildTextStyles(language: Language) {
  const fam = language === 'ar' ? Tajawal : Inter;
  const f = (weight: number, fontKey: 'bold' | 'semiBold' | 'medium' | 'regular') =>
    fam[fontKey];

  const b = (size: number, fontKey: 'bold' | 'semiBold' | 'medium' | 'regular'): TextStyle => ({
    fontFamily: f(size, fontKey),
    fontSize: size,
    lineHeight: Math.round(size * 1.3),
  });

  // Extra Bold (800) → bunded Bold (700)
  const xb = (size: number): TextStyle => ({ fontFamily: fam.bold, fontSize: size, lineHeight: Math.round(size * 1.3) });
  const bold = (size: number): TextStyle => b(size, 'bold');
  const semi = (size: number): TextStyle => b(size, 'semiBold');
  const med = (size: number): TextStyle => b(size, 'medium');

  return {
    headerTitle: xb(18),
    headerSubtitle: med(12),
    eyebrow: xb(14),
    cardTitle: xb(17),
    cardSubtitle: semi(13),
    ringLabel: bold(11),
    footer: med(12),
    fabLabel: xb(15),
    categoryLabel: xb(13),
    itemName: bold(15),
    badge: semi(11),
    quantity: xb(14),
    completedToggle: xb(14),
    completedMeta: semi(12),
    quickAdd: med(14),
    toastTitle: bold(13),
    toastMeta: semi(11),
  };
}