import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import {
  forgotPassword,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  restoreSession,
  verifyEmail,
  type User,
} from '@/services/auth-api';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const alreadyOnboarded = (await AsyncStorage.getItem(ONBOARDED_KEY)) === 'true';
      setOnboarded(alreadyOnboarded);

      // A registered-but-unverified account must verify its email first, so a
      // restored session only counts once the email is confirmed.
      const me = await restoreSession();
      if (me?.is_email_verified) {
        setUser(me);
        setIsSignedIn(true);
      }
      setIsLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    const response = await login(email, password);
    setUser(response.user);
    // Unverified logins stay signed out so the flow can redirect to verification.
    if (response.user.is_email_verified) {
      setIsSignedIn(true);
    }
    return response.user;
  };

  const signUp = async (name: string, email: string, password: string): Promise<User> => {
    const response = await register({ name, email, password });
    setUser(response.user);
    return response.user;
  };

  const signOut = async () => {
    setIsSignedIn(false);
    setUser(null);
    await logout();
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
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
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