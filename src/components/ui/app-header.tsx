import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useShoppingTokens } from '@/features/shopping-list/components/shopping-tokens';

type AppHeaderProps = {
  title: string;
  subtitle?: string | null;
  /** Show a back chevron and call onBack when pressed. */
  back?: boolean;
  onBack?: () => void;
  onBackLabel?: string;
  /** Wrap the title block in a Pressable (e.g. household picker). */
  onTitlePress?: () => void;
  titleLabel?: string;
  /** Trailing node next to the title inside the pressable (e.g. chevron). */
  titleAccessory?: ReactNode;
  /** Trailing action area on the right side of the bar. */
  right?: ReactNode;
};

/**
 * The shared 60px app bar used at the top of every main screen. Kept in one
 * place so titles, spacing, back affordances and RTL chevrons stay identical
 * across tabs and pushed screens.
 */
export function AppHeader({
  title,
  subtitle,
  back,
  onBack,
  onBackLabel,
  onTitlePress,
  titleLabel,
  titleAccessory,
  right,
}: AppHeaderProps) {
  const { colors, text, language } = useShoppingTokens();
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const titleBlock = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
      <View style={{ gap: 2, flexShrink: 1 }}>
        <Text style={[text.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[text.headerSubtitle, { color: colors.secondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {titleAccessory}
    </View>
  );

  const leftBlock = onTitlePress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titleLabel}
      hitSlop={8}
      onPress={onTitlePress}
      style={{ flexDirection: 'row', alignItems: 'center' }}>
      {titleBlock}
    </Pressable>
  ) : (
    titleBlock
  );

  return (
    <View
      style={{
        height: 60,
        paddingHorizontal: 20,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 }}>
        {back ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={onBackLabel}
            onPress={onBack}
            hitSlop={8}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.background,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconSymbol
              name={direction === 'rtl' ? 'chevron.right' : 'chevron.left'}
              size={16}
              color={colors.text}
            />
          </Pressable>
        ) : null}
        {leftBlock}
      </View>
      {right ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {right}
        </View>
      ) : null}
    </View>
  );
}