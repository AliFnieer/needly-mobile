import { useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { typographyFor } from '@/constants/theme';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const { language } = useLanguage();
  const { colors, cls } = useTheme();
  const typography = typographyFor(language);
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      className={[
        'min-h-huge flex-row items-center justify-center rounded px-xl',
        variant === 'primary' && cls('bg-primary-container', 'bg-primary-container-dark'),
        variant === 'secondary' && cls('border border-outline', 'border border-outline-dark'),
        pressed && !isDisabled && 'opacity-85',
        isDisabled && 'opacity-50',
      ].join(' ')}>
      {loading ? (
        <ActivityIndicator color={colors['on-surface']} />
      ) : (
        <Text style={[typography['body-lg']]} className={cls('text-on-surface', 'text-on-surface-dark')}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}