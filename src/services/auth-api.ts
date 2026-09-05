import { apiClient, setAuthHooks } from '@/hooks/use-axios';
import { API_ENDPOINTS } from '@/utils/api-endpoints';
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
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.refresh, {
      refresh_token: refreshToken,
    });
    await persistPair(response.data);
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
  const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, params);
  await persistPair(response.data);
  return response.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, {
    email,
    password,
  });
  await persistPair(response.data);
  return response.data;
}

export async function fetchMe(): Promise<User> {
  const response = await apiClient.get<User>(API_ENDPOINTS.auth.me, { requiresAuth: true });
  return response.data;
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  const body = refreshToken ? { refresh_token: refreshToken } : {};
  await apiClient.post<void>(API_ENDPOINTS.auth.logout, body, { requiresAuth: true }).catch(() => undefined);
  await clearTokens();
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post<void>(API_ENDPOINTS.auth.forgotPassword, { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post<void>(API_ENDPOINTS.auth.resetPassword, {
    token,
    new_password: newPassword,
  });
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.get<void>(API_ENDPOINTS.auth.verifyEmail(token));
}

export async function resendVerification(email: string): Promise<void> {
  await apiClient.post<void>(API_ENDPOINTS.auth.resendVerification, { email });
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