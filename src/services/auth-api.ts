import { apiRequest, setAuthHooks } from './api-client';
import { clearTokens, getRefreshToken, getValidAccessToken, hasRefreshToken, storeTokens } from './auth-token-store';

const ACCESS_TOKEN_TTL_S = 3600;

export type User = {
  id: string;
  name: string;
  email: string;
  is_email_verified: boolean;
  created_at: string;
};

export type AuthResponse = {
  user_id: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
};

type RegisterParams = {
  name: string;
  email: string;
  password: string;
};

let refreshPromise: Promise<boolean> | null = null;

function persistPair(response: AuthResponse): Promise<void> {
  return storeTokens({
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresIn: response.expires_in || ACCESS_TOKEN_TTL_S,
  });
}

// Single-flight: concurrent callers share one refresh attempt.
export function refreshAccessTokens(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = doRefresh()
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearTokens();
    return false;
  }
  try {
    const response = await apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
      auth: false,
    });
    await persistPair(response);
    return true;
  } catch {
    await clearTokens();
    return false;
  }
}

setAuthHooks({
  getAccessToken: async () => {
    const current = getValidAccessToken();
    if (current) return current;
    if (!(await hasRefreshToken())) return null;
    const ok = await refreshAccessTokens();
    return ok ? getValidAccessToken() : null;
  },
  onUnauthorized: () => refreshAccessTokens(),
});

export async function register(params: RegisterParams): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: params,
    auth: false,
  });
  await persistPair(response);
  return response;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  await persistPair(response);
  return response;
}

export async function fetchMe(): Promise<User> {
  return apiRequest<User>('/auth/me', { auth: true });
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  const body = refreshToken ? { refresh_token: refreshToken } : {};
  await apiRequest<void>('/auth/logout', { method: 'POST', body, auth: true }).catch(() => undefined);
  await clearTokens();
}

export async function forgotPassword(email: string): Promise<void> {
  await apiRequest<void>('/auth/forgot-password', { method: 'POST', body: { email }, auth: false });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiRequest<void>('/auth/reset-password', {
    method: 'POST',
    body: { token, new_password: newPassword },
    auth: false,
  });
}

export async function verifyEmail(token: string): Promise<void> {
  await apiRequest<void>(`/auth/verify-email?token=${encodeURIComponent(token)}`, { auth: false });
}

export async function resendVerification(email: string): Promise<void> {
  await apiRequest<void>('/auth/resend-verification', { method: 'POST', body: { email }, auth: false });
}

export async function restoreSession(): Promise<User | null> {
  if (!(await hasRefreshToken())) return null;
  const ok = await refreshAccessTokens();
  if (!ok) return null;
  try {
    return await fetchMe();
  } catch {
    await clearTokens();
    return null;
  }
}