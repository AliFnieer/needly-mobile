import { AxiosError, AxiosInstance, create as createAxiosClient, isAxiosError } from 'axios';
import { Platform } from 'react-native';

const DEV_API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://localhost:8080/api/v1';


const REQUEST_TIMEOUT_MS = 15_000;

declare module 'axios' {
  export interface AxiosRequestConfig {
    requiresAuth?: boolean;
    _retried?: boolean;
  }
}

export const API_BASE_URL: string = process.env.EXPO_PUBLIC_API_URL ?? DEV_API_BASE_URL;

export class ApiError extends Error {
  readonly status: number;
  readonly retryAfter?: number;

  constructor(status: number, message: string, retryAfter?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function fallbackMessage(status: number): string {
  if (status === 400) return 'Invalid request.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have access to perform this action.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 409) return 'This conflicts with an existing resource.';
  if (status === 422) return 'The submitted data is invalid.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status >= 500) return 'The server had a problem. Please try again later.';
  return 'Something went wrong. Please try again.';
}

// Registered by the auth layer at module init, so this module stays free of
// token imports (avoids a circular dependency) while still handling auth.
let getAccessTokenRef: (() => Promise<string | null>) | null = null;
let onUnauthorizedRef: (() => Promise<boolean>) | null = null;

export function setAuthHooks(handlers: {
  getAccessToken: () => Promise<string | null>;
  onUnauthorized: () => Promise<boolean>;
}): void {
  getAccessTokenRef = handlers.getAccessToken;
  onUnauthorizedRef = handlers.onUnauthorized;
}

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return new ApiError(0, 'The server took too long to respond. Please try again.');
      }
      return new ApiError(0, 'Could not reach the server. Check your connection and try again.');
    }
    const payload = error.response.data as { error?: unknown } | string | undefined;
    const message =
      payload && typeof payload === 'object' && typeof payload.error === 'string'
        ? payload.error
        : fallbackMessage(error.response.status);
    const retryAfterRaw = error.response.headers?.['retry-after'];
    const retryAfter = retryAfterRaw ? Number(retryAfterRaw) : undefined;
    return new ApiError(
      error.response.status,
      message,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    );
  }
  return new ApiError(0, 'Could not reach the server. Check your connection and try again.');
}

export const apiClient: AxiosInstance = createAxiosClient({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  if (config.requiresAuth) {
    const token = await getAccessTokenRef?.();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;
    if (config?.requiresAuth && error.response?.status === 401 && !config._retried) {
      config._retried = true;
      const refreshed = await onUnauthorizedRef?.();
      if (refreshed) return apiClient.request(config);
    }
    return Promise.reject(normalizeError(error));
  },
);

export function useAxios(): AxiosInstance {
  return apiClient;
}