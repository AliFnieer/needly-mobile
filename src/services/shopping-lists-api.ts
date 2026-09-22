import { apiClient } from '@/hooks/use-axios';
import { API_ENDPOINTS } from '@/utils/util';

export type RecurrenceRule = '' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export type ShoppingCategory = {
  id: number;
  name: string;
  sort_order?: number;
};

export type ShoppingItem = {
  id: number;
  list_id: number;
  category_id: number | null;
  name: string;
  quantity: number;
  unit: string;
  is_completed: boolean;
  recurrence_rule: RecurrenceRule;
  next_due_at: string | null;
  created_by: number;
  category?: ShoppingCategory;
  created_at: string;
  updated_at: string;
};

export type ShoppingList = {
  id: number;
  household_id: number;
  name: string;
  created_by: number;
  items?: ShoppingItem[];
  created_at: string;
  updated_at: string;
};

export type CreateShoppingListInput = {
  name: string;
};

export type UpdateShoppingListInput = {
  name: string;
};

export type CreateShoppingItemInput = {
  name: string;
  quantity?: number;
  unit?: string;
  category_id?: number | null;
  recurrence_rule?: RecurrenceRule;
};

export async function listShoppingLists(householdId: number): Promise<ShoppingList[]> {
  const response = await apiClient.get<ShoppingList[]>(API_ENDPOINTS.shoppingLists.list(householdId), {
    requiresAuth: true,
  });
  return response.data;
}

export async function getShoppingList(listId: number): Promise<ShoppingList> {
  const response = await apiClient.get<ShoppingList>(API_ENDPOINTS.shoppingLists.get(listId), {
    requiresAuth: true,
  });
  return response.data;
}

export async function createShoppingList(
  householdId: number,
  input: CreateShoppingListInput,
): Promise<ShoppingList> {
  const response = await apiClient.post<ShoppingList>(
    API_ENDPOINTS.shoppingLists.create(householdId),
    input,
    { requiresAuth: true },
  );
  return response.data;
}

export async function updateShoppingList(
  listId: number,
  input: UpdateShoppingListInput,
): Promise<ShoppingList> {
  const response = await apiClient.put<ShoppingList>(
    API_ENDPOINTS.shoppingLists.update(listId),
    input,
    { requiresAuth: true },
  );
  return response.data;
}

export async function deleteShoppingList(listId: number): Promise<void> {
  await apiClient.delete<void>(API_ENDPOINTS.shoppingLists.delete(listId), {
    requiresAuth: true,
  });
}

export async function listShoppingItems(listId: number): Promise<ShoppingItem[]> {
  const response = await apiClient.get<ShoppingItem[]>(API_ENDPOINTS.shoppingItems.list(listId), {
    requiresAuth: true,
  });
  return response.data;
}

export async function getShoppingItem(itemId: number): Promise<ShoppingItem> {
  const response = await apiClient.get<ShoppingItem>(API_ENDPOINTS.shoppingItems.get(itemId), {
    requiresAuth: true,
  });
  return response.data;
}

export async function createShoppingItem(
  listId: number,
  input: CreateShoppingItemInput,
): Promise<ShoppingItem> {
  const response = await apiClient.post<ShoppingItem>(
    API_ENDPOINTS.shoppingItems.create(listId),
    input,
    { requiresAuth: true },
  );
  return response.data;
}

export async function updateShoppingItem(
  itemId: number,
  input: Partial<CreateShoppingItemInput> & { base_updated_at?: string },
): Promise<ShoppingItem> {
  const response = await apiClient.put<ShoppingItem>(
    API_ENDPOINTS.shoppingItems.update(itemId),
    input,
    { requiresAuth: true },
  );
  return response.data;
}

export async function setShoppingItemCompleted(itemId: number, isCompleted: boolean): Promise<ShoppingItem> {
  const response = await apiClient.patch<ShoppingItem>(
    API_ENDPOINTS.shoppingItems.setCompleted(itemId),
    { is_completed: isCompleted },
    { requiresAuth: true },
  );
  return response.data;
}

export async function deleteShoppingItem(itemId: number): Promise<void> {
  await apiClient.delete<void>(API_ENDPOINTS.shoppingItems.delete(itemId), {
    requiresAuth: true,
  });
}