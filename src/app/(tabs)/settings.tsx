import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, palette, radii, spacing, typographyFor } from '@/constants/theme';
import type { LanguageChoice } from '@/i18n/i18n';
import { useLanguage } from '@/providers/language-provider';

type Option = {
  value: LanguageChoice;
  labelKey:
    | 'settings.options.system'
    | 'settings.options.english'
    | 'settings.options.arabic';
};

const OPTIONS: Option[] = [
  { value: 'system', labelKey: 'settings.options.system' },
  { value: 'en', labelKey: 'settings.options.english' },
  { value: 'ar', labelKey: 'settings.options.arabic' },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, choice, setLanguage } = useLanguage();
  const typography = typographyFor(language);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={[styles.title, typography.h2]}>{t('settings.title')}</Text>
      <Text style={[styles.description, typography['body-sm']]}>{t('settings.description')}</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, typography['label-md']]}>
          {t('settings.languageSection')}
        </Text>
        <View style={styles.card}>
          {OPTIONS.map((option, index) => {
            const selected = choice === option.value;
            return (
              <Pressable
                key={option.value}
                disabled={selected}
                onPress={() => setLanguage(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.row, index > 0 && styles.rowBorder]}>
                <Text style={[styles.optionLabel, typography['body-lg']]}>
                  {t(option.labelKey)}
                </Text>
                {selected ? <View style={styles.check} /> : null}
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.note, typography['body-sm']]}>{t('settings.restartNote')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    color: Colors.light.text,
  },
  description: {
    color: Colors.light.icon,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: Colors.light.text,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: palette['surface-container-lowest'],
    borderColor: palette['outline-variant'],
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: spacing.huge,
  },
  rowBorder: {
    borderTopColor: palette['outline-variant'],
    borderTopWidth: 1,
  },
  optionLabel: {
    color: Colors.light.text,
  },
  check: {
    width: spacing.md,
    height: spacing.md,
    borderRadius: radii.full,
    backgroundColor: Colors.light.tint,
  },
  note: {
    color: Colors.light.icon,
  },
});