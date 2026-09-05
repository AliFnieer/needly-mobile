import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { typographyFor } from '@/constants/theme';
import type { LanguageChoice } from '@/i18n/i18n';
import { useLanguage } from '@/providers/language-provider';
import { useTheme, type ThemePreference } from '@/providers/theme-provider';

type LanguageOption = { value: LanguageChoice; labelKey: 'settings.options.system' | 'settings.options.english' | 'settings.options.arabic' };
type ThemeOption = { value: ThemePreference; labelKey: 'settings.theme.system' | 'settings.theme.light' | 'settings.theme.dark' };

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'system', labelKey: 'settings.options.system' },
  { value: 'en', labelKey: 'settings.options.english' },
  { value: 'ar', labelKey: 'settings.options.arabic' },
];

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'system', labelKey: 'settings.theme.system' },
  { value: 'light', labelKey: 'settings.theme.light' },
  { value: 'dark', labelKey: 'settings.theme.dark' },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, choice, setLanguage } = useLanguage();
  const { preference, theme, setPreference, cls } = useTheme();
  const typography = typographyFor(language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <ScrollView
      className={cls('flex-1 bg-surface', 'flex-1 bg-surface-dark')}
      contentContainerClassName="gap-lg px-xl py-xl"
      style={{ direction }}>
      <Text style={[typography.h2]} className={cls('text-on-surface', 'text-on-surface-dark')}>
        {t('settings.title')}
      </Text>
      <Text
        style={[typography['body-sm']]}
        className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
        {t('settings.description')}
      </Text>

      <OptionSection
        label={t('settings.appearanceSection')}
        note={t('settings.appearanceNote')}
        options={THEME_OPTIONS}
        selected={preference}
        onSelect={setPreference}
        typography={typography}
        t={t}
        cls={cls}
      />

      <OptionSection
        label={t('settings.languageSection')}
        note={t('settings.restartNote')}
        options={LANGUAGE_OPTIONS}
        selected={choice}
        onSelect={setLanguage}
        typography={typography}
        t={t}
        cls={cls}
      />

      <Text style={[typography['body-sm']]} className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
        {t('settings.themeStatus', { theme: t(`settings.theme.${theme}`) })}
      </Text>
    </ScrollView>
  );
}

type OptionSectionProps<T extends string> = {
  label: string;
  note?: string;
  options: { value: T; labelKey: string }[];
  selected: T;
  onSelect: (value: T) => void;
  typography: ReturnType<typeof typographyFor>;
  t: ReturnType<typeof useTranslation>['t'];
  cls: (light: string, dark: string) => string;
};

function OptionSection<T extends string>({
  label,
  note,
  options,
  selected,
  onSelect,
  typography,
  t,
  cls,
}: OptionSectionProps<T>) {
  return (
    <View className="gap-sm">
      <Text
        style={[typography['label-md']]}
        className={cls('uppercase text-on-surface', 'uppercase text-on-surface-dark')}>
        {label}
      </Text>
      <View
        className={cls(
          'rounded-lg border border-outline-variant bg-surface-container-lowest px-lg',
          'rounded-lg border border-outline-variant-dark bg-surface-container-lowest-dark px-lg',
        )}>
        {options.map((option, index) => {
          const isSelected = selected === option.value;
          return (
            <Pressable
              key={option.value}
              disabled={isSelected}
              onPress={() => onSelect(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              className={[
                'min-h-huge flex-row items-center justify-between',
                index > 0 &&
                  cls('border-t border-outline-variant', 'border-t border-outline-variant-dark'),
              ].join(' ')}>
              <Text style={[typography['body-lg']]} className={cls('text-on-surface', 'text-on-surface-dark')}>
                {t(option.labelKey)}
              </Text>
              {isSelected ? <View className={cls('h-md w-md rounded-full bg-primary', 'h-md w-md rounded-full bg-primary-dark')} /> : null}
            </Pressable>
          );
        })}
      </View>
      {note ? (
        <Text
          style={[typography['body-sm']]}
          className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}