import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { typographyFor } from '@/constants/theme';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

export default function ModalScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <View
      className={cls('flex-1 items-center justify-center p-lg bg-surface', 'flex-1 items-center justify-center p-lg bg-surface-dark')}
      style={{ direction }}>
      <Text style={[typography.h3]} className={cls('text-on-surface', 'text-on-surface-dark')}>
        {t('modal.title')}
      </Text>
      <Link href="/" dismissTo>
        <Text
          style={[typography['body-md']]}
          className={cls(
            'mt-lg px-xl py-md font-semibold text-primary',
            'mt-lg px-xl py-md font-semibold text-primary-dark',
          )}>
          {t('modal.goHome')}
        </Text>
      </Link>
    </View>
  );
}