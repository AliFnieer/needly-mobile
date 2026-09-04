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

export const typography = {
  display: { fontSize: 32, fontWeight: '700', lineHeight: 40, letterSpacing: -0.64 },
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 34, letterSpacing: -0.28 },
  'h1-mobile': { fontSize: 24, fontWeight: '700', lineHeight: 30, letterSpacing: -0.24 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  'body-lg': { fontSize: 17, fontWeight: '400', lineHeight: 24 },
  'body-md': { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  'body-sm': { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  'label-md': { fontSize: 12, fontWeight: '500', lineHeight: 16, letterSpacing: 0.24 },
};

/**
 * Semantic colors consumed by the component layer (`useThemeColor`,
 * tab bar, themed components). Keys are required by those consumers.
 */
export const Colors = {
  light: {
    text: palette['on-surface'],
    background: palette.surface,
    tint: palette.primary,
    icon: palette['on-surface-variant'],
    tabIconDefault: palette['on-surface-variant'],
    tabIconSelected: palette.primary,
  },
  dark: {
    text: palette['inverse-on-surface'],
    background: palette['inverse-surface'],
    tint: palette['inverse-primary'],
    icon: palette['inverse-on-surface'],
    tabIconDefault: palette['inverse-on-surface'],
    tabIconSelected: palette['inverse-primary'],
  },
};

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