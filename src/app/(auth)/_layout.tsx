import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/providers/auth-provider';

export const unstable_settings = {
  anchor: 'login',
};

export default function AuthLayout() {
  const { isLoading, isSignedIn, onboarded } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  if (!onboarded) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}