import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const REFRESH_TOKEN_KEY = 'needly.auth.refreshToken';

// The access token is never persisted; the refresh token goes to secure
// storage on native and stays in memory on web (never localStorage).
let accessToken: string | null = null;
let accessTokenExpiresAt: number | null = null;
let webRefreshToken: string | null = null;

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export async function storeTokens({ accessToken: access, refreshToken, expiresIn }: StoredTokens): Promise<void> {
  accessToken = access;
  accessTokenExpiresAt = Date.now() + expiresIn * 1000;
  if (Platform.OS === 'web') {
    webRefreshToken = refreshToken;
  } else {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  accessTokenExpiresAt = null;
  webRefreshToken = null;
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => undefined);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === 'web') return webRefreshToken;
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY).catch(() => null);
}

const PROACTIVE_REFRESH_MS = 60_000;

export function getValidAccessToken(): string | null {
  if (!accessToken || accessTokenExpiresAt === null) return null;
  if (Date.now() >= accessTokenExpiresAt - PROACTIVE_REFRESH_MS) return null;
  return accessToken;
}

export async function hasRefreshToken(): Promise<boolean> {
  return (await getRefreshToken()) !== null;
}