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
  shoppingLists: {
    list: (householdId: string | number) => `/households/${householdId}/lists`,
    create: (householdId: string | number) => `/households/${householdId}/lists`,
    get: (listId: string | number) => `/lists/${listId}`,
    update: (listId: string | number) => `/lists/${listId}`,
    delete: (listId: string | number) => `/lists/${listId}`,
  },
  shoppingItems: {
    list: (listId: string | number) => `/lists/${listId}/items`,
    create: (listId: string | number) => `/lists/${listId}/items`,
    get: (itemId: string | number) => `/items/${itemId}`,
    update: (itemId: string | number) => `/items/${itemId}`,
    setCompleted: (itemId: string | number) => `/items/${itemId}/completed`,
    delete: (itemId: string | number) => `/items/${itemId}`,
  },
  categories: {
    list: (householdId: string | number) => `/households/${householdId}/categories`,
    create: (householdId: string | number) => `/households/${householdId}/categories`,
    get: (householdId: string | number, categoryId: string | number) =>
      `/households/${householdId}/categories/${categoryId}`,
    update: (householdId: string | number, categoryId: string | number) =>
      `/households/${householdId}/categories/${categoryId}`,
    delete: (householdId: string | number, categoryId: string | number) =>
      `/households/${householdId}/categories/${categoryId}`,
    reorder: (householdId: string | number) => `/households/${householdId}/categories/order`,
  },
  history: {
    household: (householdId: string | number) => `/households/${householdId}/history`,
    list: (listId: string | number) => `/lists/${listId}/history`,
    entry: (entryId: string | number) => `/history/${entryId}`,
  },
  notifications: {
    household: (householdId: string | number) => `/households/${householdId}/notifications`,
  },
} as const;

export function serverHealthUrl(apiBaseUrl: string): string {
  return `${apiBaseUrl.replace(/\/api\/v1\/?$/, '')}/health`;
}