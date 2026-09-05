import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { typographyFor } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

import { AuthScreen } from './auth-screen';

type VerifyCodeScreenProps = {
  mode: 'signup' | 'forgot';
  email: string;
};

export function VerifyCodeScreen({ mode, email }: VerifyCodeScreenProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const { verifyEmail, resendVerification } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [resendSent, setResendSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const codeComplete = code.length >= 6;

  const onVerify = async () => {
    if (!codeComplete || verifying) return;
    setError(undefined);
    setVerifying(true);
    try {
      await verifyEmail(code);
      router.replace('/(auth)/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.errors.generic'));
    } finally {
      setVerifying(false);
    }
  };

  const onResend = async () => {
    if (resending) return;
    setError(undefined);
    setResending(true);
    try {
      await resendVerification(email);
      setResendSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.errors.generic'));
    } finally {
      setResending(false);
    }
  };

  const goToLogin = () => {
    router.replace('/(auth)/login');
  };

  if (mode === 'forgot') {
    return (
      <AuthScreen
        title={t('auth.verify.forgotTitle')}
        subtitle={t('auth.verify.forgotSubtitle', { email })}
        footer={
          <Button title={t('auth.verify.backToLogin')} onPress={goToLogin} />
        }>
        <Text
          style={[typography['body-md']]}
          className={cls('text-center text-on-surface-variant', 'text-center text-on-surface-variant-dark')}>
          {t('auth.verify.forgotHelper')}
        </Text>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title={t('auth.verify.signupTitle')}
      subtitle={t('auth.verify.subtitle', { email })}
      footer={
        <Button title={t('auth.verify.confirm')} onPress={onVerify} disabled={!codeComplete} loading={verifying} />
      }>
      <OtpInput value={code} onChange={setCode} />
      <Text
        style={[typography['body-sm']]}
        className={cls('text-center', 'text-center')}
        accessibilityRole="alert">
        {resendSent ? t('auth.verify.resendSent') : '\u00a0'}
      </Text>
      <Text
        style={[typography['body-sm']]}
        className={cls('text-center text-on-surface-variant', 'text-center text-on-surface-variant-dark')}>
        {t('auth.verify.notReceived')}{' '}
        <Text
          className={cls('text-primary', 'text-primary-dark')}
          onPress={onResend}>
          {resending ? t('auth.verify.resending') : t('auth.verify.resend')}
        </Text>
      </Text>
      {error ? (
        <Text
          style={[typography['body-sm']]}
          className={cls('text-center text-error', 'text-center text-error-dark')}>
          {error}
        </Text>
      ) : null}
    </AuthScreen>
  );
}