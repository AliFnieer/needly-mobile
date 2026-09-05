import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/providers/auth-provider';

import { AuthScreen } from './auth-screen';

type ResetPasswordScreenProps = {
  token: string;
};

export function ResetPasswordScreen({ token }: ResetPasswordScreenProps) {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const canSubmit = password.length >= 6 && !loading && token.length > 0;

  const onSubmit = async () => {
    if (!canSubmit) return;
    if (password !== confirm) {
      setError(t('auth.signup.passwordMismatch'));
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await resetPassword(token, password);
      router.replace('/(auth)/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.errors.generic'));
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title={t('auth.reset.title')}
      subtitle={t('auth.reset.subtitle')}
      footer={<Button title={t('auth.reset.submit')} onPress={onSubmit} disabled={!canSubmit} loading={loading} />}>
      <TextField
        label={t('auth.form.newPassword')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.form.newPasswordPlaceholder')}
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