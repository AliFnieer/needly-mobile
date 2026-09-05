import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { typographyFor } from '@/constants/theme';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

type BrandMarkProps = {
  size?: 'sm' | 'lg';
};

export function BrandMark({ size = 'sm' }: BrandMarkProps) {
  const { language } = useLanguage();
  const { colors, cls } = useTheme();
  const typography = typographyFor(language);
  const iconColor = colors['on-primary-fixed'];

  if (size === 'lg') {
    return (
      <View className="items-center gap-lg">
        <View className={cls('h-[56px] w-[56px] items-center justify-center rounded-full bg-primary-fixed', 'h-[56px] w-[56px] items-center justify-center rounded-full bg-primary-fixed-dark')}>
          <Ionicons name="cart-outline" size={44} color={iconColor} />
        </View>
        <Text style={[typography.h1]} className={cls('text-on-surface', 'text-on-surface-dark')}>
          Needly
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-sm">
      <View className={cls('h-xxl w-xxl items-center justify-center rounded-full bg-primary-fixed', 'h-xxl w-xxl items-center justify-center rounded-full bg-primary-fixed-dark')}>
        <Ionicons name="cart-outline" size={18} color={iconColor} />
      </View>
      <Text style={[typography.h2]} className={cls('text-on-surface', 'text-on-surface-dark')}>
        Needly
      </Text>
    </View>
  );
}