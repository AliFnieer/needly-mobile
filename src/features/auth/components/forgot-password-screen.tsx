import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/providers/auth-provider';

import { AuthScreen } from './auth-screen';

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const canSubmit = email.length > 3 && !loading;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(undefined);
    setLoading(true);
    try {
      await forgotPassword(email);
      router.replace({ pathname: '/(auth)/verify', params: { mode: 'forgot', email } });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.errors.generic'));
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title={t('auth.forgot.title')}
      subtitle={t('auth.forgot.subtitle')}
      footer={<Button title={t('auth.forgot.submit')} onPress={onSubmit} disabled={!canSubmit} loading={loading} />}>
      <TextField
        label={t('auth.form.email')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.form.emailPlaceholder')}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        error={error}
        editable={!loading}
      />
    </AuthScreen>
  );
}