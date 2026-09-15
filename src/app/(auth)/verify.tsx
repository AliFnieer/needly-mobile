import { useLocalSearchParams } from 'expo-router';

import { VerifyCodeScreen } from '@/features/auth/components/verify-code-screen';

export default function VerifyRoute() {
  const { mode, email } = useLocalSearchParams<{ mode?: string; email?: string }>();
  const verifyMode = mode === 'forgot' ? 'forgot' : 'signup';

  return <VerifyCodeScreen mode={verifyMode} email={email ?? ''} />;
}