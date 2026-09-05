import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { typographyFor } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

import { AuthScreen } from './auth-screen';

const FEATURE_COUNT = 3;

export function OnboardingScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [active, setActive] = useState(0);

  const isLast = active === FEATURE_COUNT - 1;

  const handleNext = () => {
    if (!isLast) {
      setActive((current) => current + 1);
      return;
    }
    completeOnboarding().then(() => {
      router.replace('/(auth)/login');
    });
  };

  const current = active + 1;

  return (
    <AuthScreen
      title={t('onboarding.title')}
      subtitle={t('onboarding.subtitle')}
      footer={
        <Button title={isLast ? t('onboarding.cta') : t('onboarding.next')} onPress={handleNext} />
      }>
      <View
        className={[
          'flex-row items-start gap-lg rounded-lg border p-lg',
          cls('bg-surface-container-lowest', 'bg-surface-container-lowest-dark'),
          cls('border-primary-container', 'border-primary-container-dark'),
        ].join(' ')}>
        <View
          className={cls(
            'h-16 w-16 items-center justify-center rounded-lg bg-primary-fixed',
            'h-16 w-16 items-center justify-center rounded-lg bg-primary-fixed-dark',
          )}>
          <Text className="text-[28px]">{t(`onboarding.feature.${current}.emoji`)}</Text>
        </View>
        <View className="flex-1 gap-xs">
          <Text style={[typography.h3]} className={cls('text-on-surface', 'text-on-surface-dark')}>
            {t(`onboarding.feature.${current}.title`)}
          </Text>
          <Text
            style={[typography['body-md']]}
            className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
            {t(`onboarding.feature.${current}.body`)}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-center gap-sm">
        {Array.from({ length: FEATURE_COUNT }).map((_, index) => {
          const isActive = active === index;
          return (
            <Pressable
              key={index}
              onPress={() => setActive(index)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t(`onboarding.feature.${index + 1}.title`)}>
              <View
                className={[
                  cls('rounded-full bg-outline-variant', 'rounded-full bg-outline-variant-dark'),
                  isActive ? 'w-lg h-sm' : 'w-sm h-sm',
                ].join(' ')}
              />
            </Pressable>
          );
        })}
      </View>
    </AuthScreen>
  );
}