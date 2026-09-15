import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { typographyFor } from '@/constants/theme';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <View
      className={cls('flex-1 items-center justify-center bg-surface', 'flex-1 items-center justify-center bg-surface-dark')}
      style={{ direction }}>
      <Text style={[typography['body-lg']]} className={cls('text-on-surface', 'text-on-surface-dark')}>
        {t('home.welcome')}
      </Text>
    </View>
  );
}