import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { typographyFor } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

import { AuthScreen } from './auth-screen';

export function SignupScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const canSubmit = name.length > 1 && email.length > 3 && password.length >= 6 && !loading;

  const onSubmit = async () => {
    if (!canSubmit) return;
    if (password !== confirm) {
      setError(t('auth.signup.passwordMismatch'));
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await signUp(name, email, password);
      router.replace({ pathname: '/(auth)/verify', params: { mode: 'signup', email } });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.errors.generic'));
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title={t('auth.signup.title')}
      subtitle={t('auth.signup.subtitle')}
      footer={
        <View className="gap-lg">
          <Button title={t('auth.signup.submit')} onPress={onSubmit} disabled={!canSubmit} loading={loading} />
          <View className="flex-row items-center justify-center gap-xs">
            <Text
              style={[typography['body-md']]}
              className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
              {t('auth.signup.hasAccount')}
            </Text>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text
                style={[typography['body-md']]}
                className={cls('font-semibold text-primary', 'font-semibold text-primary-dark')}>
                {t('auth.signup.loginLink')}
              </Text>
            </Pressable>
          </View>
        </View>
      }>
      <TextField
        label={t('auth.form.name')}
        value={name}
        onChangeText={setName}
        placeholder={t('auth.form.namePlaceholder')}
        autoComplete="name"
        textContentType="name"
        editable={!loading}
      />
      <TextField
        label={t('auth.form.email')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.form.emailPlaceholder')}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        editable={!loading}
      />
      <TextField
        label={t('auth.form.password')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.form.passwordPlaceholder')}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        editable={!loading}
      />
      <TextField
        label={t('auth.form.confirmPassword')}
        value={confirm}
        onChangeText={setConfirm}
        placeholder={t('auth.form.confirmPasswordPlaceholder')}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        error={error}
        editable={!loading}
      />
    </AuthScreen>
  );
}