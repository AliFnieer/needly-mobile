import { apiClient } from '@/hooks/use-axios';
import { API_ENDPOINTS } from '@/utils/util';

export type ActivityNotification = {
  type: string;
  title: string;
  body: string;
  household_id: number;
  list_id?: number;
  item_id?: number;
  actor_id?: number;
  item_name?: string;
  list_name?: string;
  household_name?: string;
  created_at: string;
};

export async function listHouseholdNotifications(householdId: number): Promise<ActivityNotification[]> {
  const response = await apiClient.get<ActivityNotification[]>(
    API_ENDPOINTS.notifications.household(householdId),
    { requiresAuth: true },
  );
  return response.data;
}