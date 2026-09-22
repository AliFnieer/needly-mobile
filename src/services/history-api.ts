import { apiClient } from '@/hooks/use-axios';
import { API_ENDPOINTS } from '@/utils/util';

export type HistoryEntryCategory = {
  id: number;
  name: string;
};

export type ShoppingHistoryEntry = {
  id: number;
  list_id: number;
  item_id: number | null;
  name: string;
  quantity: number;
  unit: string;
  category_id: number | null;
  category?: HistoryEntryCategory;
  completed_by: number;
  completed_at: string;
  created_at: string;
  updated_at: string;
};

export async function listHouseholdHistory(
  householdId: number,
  limit = 100,
): Promise<ShoppingHistoryEntry[]> {
  const response = await apiClient.get<ShoppingHistoryEntry[]>(
    API_ENDPOINTS.history.household(householdId),
    { requiresAuth: true, params: { limit } },
  );
  return response.data;
}

export async function deleteHistoryEntry(entryId: number): Promise<void> {
  await apiClient.delete<void>(API_ENDPOINTS.history.entry(entryId), {
    requiresAuth: true,
  });
}