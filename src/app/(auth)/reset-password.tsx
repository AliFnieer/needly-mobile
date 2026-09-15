import { useLocalSearchParams } from 'expo-router';

import { ResetPasswordScreen } from '@/features/auth/components/reset-password-screen';

export default function ResetPasswordRoute() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  return <ResetPasswordScreen token={token ?? ''} />;
}