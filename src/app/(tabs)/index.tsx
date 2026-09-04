import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, typographyFor } from '@/constants/theme';
import { useLanguage } from '@/providers/language-provider';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const typography = typographyFor(language);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">{t('home.welcome')}</Text>
    </View>
  );
}