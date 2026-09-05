import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  forgotPassword,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  restoreSession,
  verifyEmail,
  type AuthResponse,
  type User,
} from '@/services/auth-api';
import { useAuthStore } from '@/stores/auth-store';

export const authQueryKeys = {
  session: ['auth', 'session'] as const,
};

export function useSessionQuery() {
  return useQuery({
    queryKey: authQueryKeys.session,
    queryFn: restoreSession,
    staleTime: Infinity,
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { email: string; password: string }) => login(params.email, params.password),
    onSuccess: (response: AuthResponse) => {
      const store = useAuthStore.getState();
      store.setUser(response.user);
      // Unverified logins stay signed out so the flow can redirect to verification.
      if (response.user.is_email_verified) {
        store.setSignedIn(true);
      }
      queryClient.setQueryData(authQueryKeys.session, response.user);
    },
  });
}

export function useRegisterMutation() {
  const store = useAuthStore.getState();
  return useMutation({
    mutationFn: (params: { name: string; email: string; password: string }) => register(params),
    onSuccess: (response: AuthResponse) => {
      store.setUser(response.user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      useAuthStore.getState().setSignedIn(false);
      useAuthStore.getState().setUser(null);
      queryClient.removeQueries({ queryKey: authQueryKeys.session });
    },
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: () => {
      const store = useAuthStore.getState();
      store.setUser((user) => (user ? { ...user, is_email_verified: true } : user));
    },
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: (email: string) => resendVerification(email),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (params: { token: string; newPassword: string }) =>
      resetPassword(params.token, params.newPassword),
  });
}

export type { User };