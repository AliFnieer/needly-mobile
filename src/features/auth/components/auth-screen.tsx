import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageToggle } from '@/components/ui/language-toggle';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { typographyFor } from '@/constants/theme';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

import { BrandMark } from './brand-mark';

type AuthScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreen({ title, subtitle, children, footer }: AuthScreenProps) {
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <SafeAreaView
      className={cls('flex-1 bg-surface', 'flex-1 bg-surface-dark')}
      style={{ direction }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerClassName="grow px-xl py-xl gap-xl"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-row items-end justify-end gap-sm">
            <LanguageToggle />
            <ThemeToggle />
          </View>
          <View className="gap-md items-start">
            <BrandMark />
            <Text style={[typography.h1]} className={cls('mt-lg text-on-surface', 'mt-lg text-on-surface-dark')}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[typography['body-lg']]}
                className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View className="gap-lg">{children}</View>

          {footer ? <View className="mt-auto gap-lg pt-xl">{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}