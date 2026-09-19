import { apiClient } from '@/hooks/use-axios';
import { API_ENDPOINTS } from '@/utils/util';

export type UserLookup = {
  id: number;
  first_name: string;
  last_name: string;
};

export async function lookupUser(userId: string | number): Promise<UserLookup> {
  const response = await apiClient.get<UserLookup>(API_ENDPOINTS.users.get(userId), {
    requiresAuth: true,
  });
  return response.data;
}