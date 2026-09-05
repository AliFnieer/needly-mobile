import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, type PropsWithChildren } from 'react';

import {
  useForgotPasswordMutation,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useResendVerificationMutation,
  useResetPasswordMutation,
  useSessionQuery,
  useVerifyEmailMutation,
} from '@/hooks/use-auth';
import type { User } from '@/services/auth-api';
import { useAuthStore } from '@/stores/auth-store';

export type { User };

const ONBOARDED_KEY = 'needly.auth.onboarded';

type AuthContextValue = {
  isLoading: boolean;
  isSignedIn: boolean;
  onboarded: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (name: string, email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const user = useAuthStore((s) => s.user);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const onboarded = useAuthStore((s) => s.onboarded);
  const setUser = useAuthStore((s) => s.setUser);
  const setSignedIn = useAuthStore((s) => s.setSignedIn);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const sessionQuery = useSessionQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const verifyEmailMutation = useVerifyEmailMutation();
  const resendVerificationMutation = useResendVerificationMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  useEffect(() => {
    (async () => {
      const alreadyOnboarded = (await AsyncStorage.getItem(ONBOARDED_KEY)) === 'true';
      setOnboarded(alreadyOnboarded);
    })();
  }, [setOnboarded]);

  // A registered-but-unverified account must verify its email first, so a
  // restored session only counts once the email is confirmed.
  useEffect(() => {
    if (sessionQuery.data === undefined) return;
    const me = sessionQuery.data;
    if (me?.is_email_verified) {
      setUser(me);
      setSignedIn(true);
    }
    setLoading(false);
  }, [sessionQuery.data, setUser, setSignedIn, setLoading]);

  const signIn = async (email: string, password: string): Promise<User> => {
    const response = await loginMutation.mutateAsync({ email, password });
    return response.user;
  };

  const signUp = async (name: string, email: string, password: string): Promise<User> => {
    const response = await registerMutation.mutateAsync({ name, email, password });
    return response.user;
  };

  const signOut = async () => {
    await logoutMutation.mutateAsync();
  };

  const completeOnboarding = async () => {
    setOnboarded(true);
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isSignedIn,
        onboarded,
        user,
        signIn,
        signUp,
        signOut,
        completeOnboarding,
        verifyEmail: (token) => verifyEmailMutation.mutateAsync(token),
        resendVerification: (email) => resendVerificationMutation.mutateAsync(email),
        forgotPassword: (email) => forgotPasswordMutation.mutateAsync(email),
        resetPassword: (token, newPassword) => resetPasswordMutation.mutateAsync({ token, newPassword }),
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}