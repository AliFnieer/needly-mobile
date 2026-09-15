import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { useTheme } from '@/providers/theme-provider';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, colors, setPreference, cls } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <Pressable
      onPress={() => setPreference(next)}
      accessibilityRole="button"
      accessibilityLabel={t(`settings.options.${next}`)}
      hitSlop={8}
      className={cls(
        'h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low',
        'h-9 w-9 items-center justify-center rounded-full border border-outline-variant-dark bg-surface-container-low-dark',
      )}>
      <Ionicons
        name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'}
        size={18}
        color={colors['on-surface-variant']}
      />
    </Pressable>
  );
}