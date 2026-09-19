import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmericanFlag, LibyanFlag } from '@/components/ui/flags';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { typographyFor } from '@/constants/theme';
import type { LanguageChoice } from '@/i18n/i18n';
import { useLanguage } from '@/providers/language-provider';
import { useTheme, type ThemePreference } from '@/providers/theme-provider';

type OptionIcon =
  | 'globe'
  | 'circle.lefthalf.filled'
  | 'sun.max.fill'
  | 'moon.fill';

type ThemeOption = {
  value: ThemePreference;
  labelKey: 'settings.theme.system' | 'settings.theme.light' | 'settings.theme.dark';
  icon: OptionIcon;
};

type LanguageOption = {
  value: LanguageChoice;
  labelKey: 'settings.options.system' | 'settings.options.english' | 'settings.options.arabic';
};

const SETTINGS_ICON = 'gearshape.fill';

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'system', labelKey: 'settings.options.system' },
  { value: 'en', labelKey: 'settings.options.english' },
  { value: 'ar', labelKey: 'settings.options.arabic' },
];

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'system', labelKey: 'settings.theme.system', icon: 'circle.lefthalf.filled' },
  { value: 'light', labelKey: 'settings.theme.light', icon: 'sun.max.fill' },
  { value: 'dark', labelKey: 'settings.theme.dark', icon: 'moon.fill' },
];

function themeIcon(value: ThemePreference): OptionIcon {
  return THEME_OPTIONS.find((option) => option.value === value)?.icon ?? 'circle.lefthalf.filled';
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, choice, setLanguage } = useLanguage();
  const { preference, setPreference, cls, colors } = useTheme();
  const typography = typographyFor(language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const [pressedIcon, setPressedIcon] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const version = Constants.expoConfig?.version;
  const appName = Constants.expoConfig?.name ?? 'Needly';

  const renderLanguageIcon = (value: LanguageChoice, isSelected: boolean) => {
    if (value === 'en') return <AmericanFlag width={22} />;
    if (value === 'ar') return <LibyanFlag width={22} />;
    return (
      <IconSymbol
        name="globe"
        size={18}
        color={isSelected ? colors['on-primary-container'] : colors['on-surface-variant']}
      />
    );
  };

  const renderThemeIcon = (value: ThemePreference, isSelected: boolean) => (
    <IconSymbol
      name={themeIcon(value)}
      size={18}
      color={isSelected ? colors['on-primary-container'] : colors['on-surface-variant']}
    />
  );

  return (
    <SafeAreaView
      className={cls('flex-1 bg-surface', 'flex-1 bg-surface-dark')}
      edges={['top']}
      style={{ direction }}>
      <ScrollView
        className={cls('flex-1', 'flex-1')}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="my-14 gap-xl px-xl pt-md pb-xxl">
        <View className="flex-row items-center gap-md">
          <Pressable
            onPressIn={() => setPressedIcon(true)}
            onPressOut={() => setPressedIcon(false)}
            className={[
              'h-12 w-12 items-center justify-center rounded-2xl',
              cls('bg-primary-container', 'bg-primary-container-dark'),
              pressedIcon && 'opacity-80',
            ].join(' ')}>
            <IconSymbol name={SETTINGS_ICON} size={24} color={colors['on-primary-container']} />
          </Pressable>
          <View className="shrink gap-xs">
            <Text style={[typography.h1]} className={cls('text-on-surface', 'text-on-surface-dark')}>
              {t('settings.title')}
            </Text>
            <Text
              style={[typography['body-sm']]}
              className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
              {t('settings.caption')}
            </Text>
          </View>
        </View>

        <OptionDropdown
          caption={t('settings.appearanceSection')}
          note={t('settings.appearanceNote')}
          open={appearanceOpen}
          onToggle={() => setAppearanceOpen((value) => !value)}
          options={THEME_OPTIONS}
          selected={preference}
          onSelect={setPreference}
          renderIcon={renderThemeIcon}
          rippleColor={`${colors['on-surface']}22`}
          colors={colors}
          typography={typography}
          t={t}
          cls={cls}
        />

        <OptionDropdown
          caption={t('settings.languageSection')}
          note={t('settings.restartNote')}
          open={languageOpen}
          onToggle={() => setLanguageOpen((value) => !value)}
          options={LANGUAGE_OPTIONS}
          selected={choice}
          onSelect={setLanguage}
          renderIcon={renderLanguageIcon}
          rippleColor={`${colors['on-surface']}22`}
          colors={colors}
          typography={typography}
          t={t}
          cls={cls}
        />
      </ScrollView>

      <View
        className={[
          'items-center gap-xs px-xl py-sm',
        ].join(' ')}>
        <Text style={[typography['label-md']]} className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
          {appName}
        </Text>
        {version ? (
          <Text style={[typography['body-sm']]} className={cls('text-outline', 'text-outline-dark')}>
            {t('settings.appVersion', { version })}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

type OptionDropdownProps<T extends string> = {
  caption: string;
  note?: string;
  open: boolean;
  onToggle: () => void;
  options: { value: T; labelKey: string }[];
  selected: T;
  onSelect: (value: T) => void;
  renderIcon: (value: T, isSelected: boolean) => React.ReactNode;
  rippleColor: string;
  colors: Record<string, string>;
  typography: ReturnType<typeof typographyFor>;
  t: ReturnType<typeof useTranslation>['t'];
  cls: (light: string, dark: string) => string;
};

function OptionDropdown<T extends string>({
  caption,
  note,
  open,
  onToggle,
  options,
  selected,
  onSelect,
  renderIcon,
  rippleColor,
  colors,
  typography,
  t,
  cls,
}: OptionDropdownProps<T>) {
  const selectedOption = options.find((option) => option.value === selected) ?? options[0];

  const select = (value: T) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    onSelect(value);
  };

  return (
    <View className="gap-md">
      <Text
        style={[typography['label-md']]}
        className={cls('uppercase text-on-surface-variant', 'uppercase text-on-surface-variant-dark')}>
        {caption}
      </Text>

      <View
        className={cls(
          'overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest',
          'overflow-hidden rounded-xl border border-outline-variant-dark bg-surface-container-lowest-dark',
        )}>
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          android_ripple={{ color: rippleColor }}
          className="min-h-16 flex-row items-center gap-md px-md">
          <View className={cls('h-9 w-9 items-center justify-center rounded-lg bg-surface-container', 'h-9 w-9 items-center justify-center rounded-lg bg-surface-container-dark')}>
            {renderIcon(selectedOption.value, true)}
          </View>
          <View className="shrink flex-1 gap-xs">
            <Text
              style={[typography['body-lg']]}
              className={cls('text-on-surface', 'text-on-surface-dark')}>
              {t(selectedOption.labelKey)}
            </Text>
            <Text
              style={[typography['body-sm']]}
              className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
              {t('settings.selectedHint')}
            </Text>
          </View>
          <IconSymbol
            name={open ? 'chevron.up' : 'chevron.down'}
            size={20}
            color={colors['on-surface-variant']}
          />
        </Pressable>

        {open ? (
          <View>
            <View className={cls('border-t border-outline-variant', 'border-t border-outline-variant-dark')} />
            {options.map((option, index) => {
              const isSelected = option.value === selected;
              return (
                <Pressable
                  key={option.value}
                  disabled={isSelected}
                  onPress={() => select(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  android_ripple={{ color: rippleColor }}
                  className={[
                    'min-h-16 flex-row items-center gap-md px-md',
                    index > 0 &&
                      cls('border-t border-outline-variant', 'border-t border-outline-variant-dark'),
                    isSelected && cls('bg-surface-container-low', 'bg-surface-container-low-dark'),
                  ].join(' ')}>
                  <View
                    className={cls(
                      'h-9 w-9 items-center justify-center rounded-lg',
                      isSelected ? 'bg-primary-container' : cls('bg-surface-container', 'bg-surface-container-dark'),
                    )}>
                    {renderIcon(option.value, isSelected)}
                  </View>
                  <Text
                    style={[typography['body-lg']]}
                    className={cls('flex-1 text-on-surface', 'flex-1 text-on-surface-dark')}>
                    {t(option.labelKey)}
                  </Text>
                  <View
                    className={[
                      'h-5 w-5 items-center justify-center rounded-full border-2',
                      isSelected
                        ? cls('border-primary', 'border-primary-dark')
                        : cls('border-outline-variant', 'border-outline-variant-dark'),
                    ].join(' ')}>
                    {isSelected ? (
                      <View className={cls('h-2.5 w-2.5 rounded-full bg-primary', 'h-2.5 w-2.5 rounded-full bg-primary-dark')} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      {open && note ? (
        <Text
          style={[typography['body-sm']]}
          className={cls('px-sm text-on-surface-variant', 'px-sm text-on-surface-variant-dark')}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}