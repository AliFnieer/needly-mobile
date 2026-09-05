import { Platform } from 'react-native';

export const palette = {
  surface: '#f8f9ff',
  'surface-dim': '#d2dbe9',
  'surface-bright': '#f8f9ff',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#eef4ff',
  'surface-container': '#e5effd',
  'surface-container-high': '#e0e9f7',
  'surface-container-highest': '#dae3f1',
  'on-surface': '#131c26',
  'on-surface-variant': '#504534',
  'inverse-surface': '#28313c',
  'inverse-on-surface': '#e9f1ff',
  outline: '#827561',
  'outline-variant': '#d4c4ad',
  'surface-tint': '#7b5800',
  primary: '#7b5800',
  'on-primary': '#ffffff',
  'primary-container': '#f5b82e',
  'on-primary-container': '#684a00',
  'inverse-primary': '#fabc33',
  secondary: '#006c45',
  'on-secondary': '#ffffff',
  'secondary-container': '#86f9bc',
  'on-secondary-container': '#00734a',
  tertiary: '#815600',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#fdb436',
  'on-tertiary-container': '#6d4800',
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
  'primary-fixed': '#ffdea5',
  'primary-fixed-dim': '#fabc33',
  'on-primary-fixed': '#261900',
  'on-primary-fixed-variant': '#5d4200',
  'secondary-fixed': '#86f9bc',
  'secondary-fixed-dim': '#69dca1',
  'on-secondary-fixed': '#002112',
  'on-secondary-fixed-variant': '#005233',
  'tertiary-fixed': '#ffddb1',
  'tertiary-fixed-dim': '#ffba49',
  'on-tertiary-fixed': '#291800',
  'on-tertiary-fixed-variant': '#614000',
  background: '#f8f9ff',
  'on-background': '#131c26',
  'surface-variant': '#dae3f1',
};

/** Brand hues named in the style guide but not in the token palette. */
export const brand = {
  gold: '#FFF4D6',
  deepGold: '#D99512',
  border: '#E5E7EB',
  canvas: '#F8F9FA',
};

/** Material dark scheme mirror of the light `palette`. Same keys; keep in sync. */
export const darkPalette = {
  surface: '#16140d',
  'surface-dim': '#0f0e07',
  'surface-bright': '#3d3a2f',
  'surface-container-lowest': '#0d0c06',
  'surface-container-low': '#1e1c14',
  'surface-container': '#232219',
  'surface-container-high': '#2d2b21',
  'surface-container-highest': '#38362b',
  'on-surface': '#ece9df',
  'on-surface-variant': '#cfc6b5',
  'inverse-surface': '#28313c',
  'inverse-on-surface': '#e9f1ff',
  outline: '#98917f',
  'outline-variant': '#4c463a',
  'surface-tint': '#f5b82e',
  primary: '#f5b82e',
  'on-primary': '#3f2b00',
  'primary-container': '#5d4200',
  'on-primary-container': '#ffdfa3',
  'inverse-primary': '#7b5800',
  secondary: '#69dca1',
  'on-secondary': '#00391f',
  'secondary-container': '#005233',
  'on-secondary-container': '#86f9bc',
  tertiary: '#ffba49',
  'on-tertiary': '#452a00',
  'tertiary-container': '#614000',
  'on-tertiary-container': '#ffddb1',
  error: '#ffb4ab',
  'on-error': '#690005',
  'error-container': '#93000a',
  'on-error-container': '#ffdad6',
  'primary-fixed': '#ffdea5',
  'primary-fixed-dim': '#fabc33',
  'on-primary-fixed': '#261900',
  'on-primary-fixed-variant': '#5d4200',
  'secondary-fixed': '#86f9bc',
  'secondary-fixed-dim': '#69dca1',
  'on-secondary-fixed': '#002112',
  'on-secondary-fixed-variant': '#005233',
  'tertiary-fixed': '#ffddb1',
  'tertiary-fixed-dim': '#ffba49',
  'on-tertiary-fixed': '#291800',
  'on-tertiary-fixed-variant': '#614000',
  background: '#16140d',
  'on-background': '#ece9df',
  'surface-variant': '#49453a',
} as const;

export const schemes = { light: palette, dark: darkPalette } as const;

export type Theme = keyof typeof schemes;
export type ThemePreference = 'system' | Theme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
};

export const radii = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Inter = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const Tajawal = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  semiBold: 'Tajawal_700Bold',
  bold: 'Tajawal_700Bold',
} as const;

export type Language = 'en' | 'ar';

type TypographyToken = {
  fontFamily: string;
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700';
  lineHeight: number;
  letterSpacing?: number;
};

export const typography: Record<string, TypographyToken> = {
  display: { fontFamily: Inter.bold, fontSize: 32, fontWeight: '700', lineHeight: 40, letterSpacing: -0.64 },
  h1: { fontFamily: Inter.bold, fontSize: 28, fontWeight: '700', lineHeight: 34, letterSpacing: -0.28 },
  'h1-mobile': { fontFamily: Inter.bold, fontSize: 24, fontWeight: '700', lineHeight: 30, letterSpacing: -0.24 },
  h2: { fontFamily: Inter.bold, fontSize: 24, fontWeight: '700', lineHeight: 30 },
  h3: { fontFamily: Inter.semiBold, fontSize: 20, fontWeight: '600', lineHeight: 26 },
  'body-lg': { fontFamily: Inter.regular, fontSize: 17, fontWeight: '400', lineHeight: 24 },
  'body-md': { fontFamily: Inter.regular, fontSize: 16, fontWeight: '400', lineHeight: 22 },
  'body-sm': { fontFamily: Inter.regular, fontSize: 14, fontWeight: '400', lineHeight: 20 },
  'label-md': { fontFamily: Inter.medium, fontSize: 12, fontWeight: '500', lineHeight: 16, letterSpacing: 0.24 },
};

/**
 * Arabic Unicode blocks (incl. presentation forms). Inter has no Arabic
 * glyphs, so strings matching this pick the Tajawal family even in an English
 * UI: mixed-script lists (e.g. an Arabic item name under English chrome) then
 * render in the design's Arabic font instead of a system fallback.
 * Tajawal covers Latin + Arabic; any residual glyph gap falls back to system.
 */
const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/** Classify a string's script so content text can pick its own family:
 * `typographyFor(scriptOf(text))`. UI chrome should use `typographyFor(language)`. */
export function scriptOf(text: string): Language {
  return ARABIC_RE.test(text) ? 'ar' : 'en';
}

/** Same scale as `typography`, with the `fontFamily` resolved for a language.
 * Arabic sets no `letterSpacing`: spacing between Arabic glyphs breaks their
 * cursive joins. */
export function typographyFor(language: Language): Record<string, TypographyToken> {
  const family = language === 'ar' ? Tajawal : Inter;
  return Object.fromEntries(
    Object.entries(typography).map(([name, token]) => [
      name,
      {
        ...token,
        fontFamily:
          token.fontWeight === '700'
            ? family.bold
            : token.fontWeight === '600'
              ? family.semiBold
              : token.fontWeight === '500'
                ? family.medium
                : family.regular,
        letterSpacing: language === 'ar' ? undefined : token.letterSpacing,
      },
    ])
  );
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});