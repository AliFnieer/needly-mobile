export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: (token: string) => `/auth/verify-email?token=${encodeURIComponent(token)}`,
    resendVerification: '/auth/resend-verification',
  },
  users: {
    get: (userId: string | number) => `/users/${userId}`,
  },
  households: {
    list: '/households',
    create: '/households',
    get: (householdId: string | number) => `/households/${householdId}`,
    update: (householdId: string | number) => `/households/${householdId}`,
    delete: (householdId: string | number) => `/households/${householdId}`,
    addMember: (householdId: string | number) => `/households/${householdId}/members`,
    removeMember: (householdId: string | number, userId: string | number) =>
      `/households/${householdId}/members/${userId}`,
    sync: (householdId: string | number) => `/households/${householdId}/sync`,
  },
} as const;

export function serverHealthUrl(apiBaseUrl: string): string {
  return `${apiBaseUrl.replace(/\/api\/v1\/?$/, '')}/health`;
}