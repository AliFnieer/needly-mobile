import { useEffect, useRef } from 'react';
import { Text, TextInput, View } from 'react-native';

import { typographyFor } from '@/constants/theme';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

type OtpInputProps = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
};

export function OtpInput({ value, onChange, length = 6, autoFocus = true }: OtpInputProps) {
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const inputRef = useRef<TextInput>(null);
  const nativeTextRef = useRef('');

  useEffect(() => {
    if (value === '' && nativeTextRef.current !== '') {
      nativeTextRef.current = '';
      inputRef.current?.clear();
    }
  }, [value]);

  const digits = value.split('');
  const activeIndex = Math.min(digits.length, length - 1);

  return (
    <View
      className="items-center self-stretch"
      onStartShouldSetResponder={() => {
        inputRef.current?.focus();
        return false;
      }}>
      <TextInput
        ref={inputRef}
        defaultValue=""
        onChangeText={(text) => {
          const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
          nativeTextRef.current = cleaned;
          onChange(cleaned);
        }}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        className="absolute h-px w-px opacity-0"
        accessibilityLabel="Verification code"
      />
      <View className="flex-row justify-center gap-sm">
        {Array.from({ length }).map((_, index) => {
          const isFilled = index < digits.length;
          const isActive = !isFilled && index === activeIndex;
          return (
            <View
              key={index}
              className={[
                'h-10 w-10 items-center justify-center rounded-md',
                cls('bg-surface-container-lowest', 'bg-surface-container-lowest-dark'),
                isActive
                  ? cls('border-2 border-primary-container', 'border-2 border-primary-container-dark')
                  : cls('border border-outline-variant', 'border border-outline-variant-dark'),
                isFilled && cls('border-outline', 'border-outline-dark'),
              ].join(' ')}>
              <Text
                style={[typography.h2]}
                className={cls('text-center text-on-surface', 'text-center text-on-surface-dark')}>
                {digits[index] ?? ''}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}