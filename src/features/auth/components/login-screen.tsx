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

export function LoginScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const canSubmit = email.length > 3 && password.length > 0 && !loading;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(undefined);
    setLoading(true);
    try {
      const user = await signIn(email, password);
      if (!user.is_email_verified) {
        router.replace({ pathname: '/(auth)/verify', params: { mode: 'signup', email } });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <View className="gap-lg">
          <Button title={t('auth.login.submit')} onPress={onSubmit} disabled={!canSubmit} loading={loading} />
          <View className="flex-row items-center justify-center gap-xs">
            <Text
              style={[typography['body-md']]}
              className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
              {t('auth.login.noAccount')}
            </Text>
            <Pressable onPress={() => router.push('/(auth)/signup')} hitSlop={8}>
              <Text
                style={[typography['body-md']]}
                className={cls('font-semibold text-primary', 'font-semibold text-primary-dark')}>
                {t('auth.login.signupLink')}
              </Text>
            </Pressable>
          </View>
        </View>
      }>
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
      <View className="gap-sm">
        <TextField
          label={t('auth.form.password')}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.form.passwordPlaceholder')}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          error={error}
          editable={!loading}
        />
        <Pressable onPress={() => router.push('/(auth)/forgot-password')} hitSlop={8}>
          <Text
            style={[typography['body-sm']]}
            className={cls('text-end text-primary', 'text-end text-primary-dark')}>
            {t('auth.login.forgotPassword')}
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}