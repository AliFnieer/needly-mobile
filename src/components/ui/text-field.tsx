import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, type KeyboardTypeOptions, type TextInputProps, View } from 'react-native';

import { typographyFor } from '@/constants/theme';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  editable?: boolean;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  editable = true,
}: TextFieldProps) {
  const { language } = useLanguage();
  const { colors, cls } = useTheme();
  const typography = typographyFor(language);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const hasError = Boolean(error);
  const showToggle = secureTextEntry;

  return (
    <View className="gap-xs">
      <Text
        style={[typography['label-md']]}
        className={[
          hasError
            ? cls('text-error', 'text-error-dark')
            : cls('text-on-surface', 'text-on-surface-dark'),
        ].join(' ')}>
        {label}
      </Text>
      <View
        className={[
          'flex-row items-center gap-sm rounded-md px-lg py-sm',
          cls('bg-surface-container-lowest', 'bg-surface-container-lowest-dark'),
          focused
            ? cls('border-2 border-primary-container', 'border-2 border-primary-container-dark')
            : cls('border border-outline-variant', 'border border-outline-variant-dark'),
          hasError && cls('border-error', 'border-error-dark'),
        ].join(' ')}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors['on-surface-variant']}
          secureTextEntry={secureTextEntry && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          editable={editable}
          className={cls('min-h-xl flex-1 p-0 text-on-surface', 'min-h-xl flex-1 p-0 text-on-surface-dark')}
          style={[typography['body-lg']]}
          accessibilityLabel={label}
        />
        {showToggle ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={12} accessibilityRole="button">
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors['on-surface-variant']}
            />
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <Text style={[typography['body-sm']]} className={cls('text-error', 'text-error-dark')}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}