import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';

import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

export function LanguageToggle() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { colors, cls } = useTheme();
  const other = language === 'ar' ? ('en' as const) : ('ar' as const);

  return (
    <Pressable
      onPress={() => setLanguage(other)}
      accessibilityRole="button"
      accessibilityLabel={t(`settings.options.${other}`)}
      hitSlop={8}
      className={cls(
        'h-9 flex-row items-center gap-xs rounded-full border border-outline-variant bg-surface-container-low px-sm',
        'h-9 flex-row items-center gap-xs rounded-full border border-outline-variant-dark bg-surface-container-low-dark px-sm',
      )}>
      <Ionicons name="language-outline" size={14} color={colors['on-surface-variant']} />
      <Text
        className={cls('text-xs font-semibold uppercase text-on-surface-variant', 'text-xs font-semibold uppercase text-on-surface-variant-dark')}>
        {language}
      </Text>
    </Pressable>
  );
}