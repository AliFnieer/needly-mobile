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
  households: {
    sync: (householdId: string) => `/households/${householdId}/sync`,
  },
} as const;