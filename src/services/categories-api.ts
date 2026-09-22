import { apiClient } from '@/hooks/use-axios';
import type { ShoppingCategory } from '@/services/shopping-lists-api';
import { API_ENDPOINTS } from '@/utils/util';

export type CreateCategoryInput = {
  name: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export async function listCategories(householdId: number): Promise<ShoppingCategory[]> {
  const response = await apiClient.get<ShoppingCategory[]>(
    API_ENDPOINTS.categories.list(householdId),
    { requiresAuth: true },
  );
  return response.data;
}

export async function getCategory(householdId: number, categoryId: number): Promise<ShoppingCategory> {
  const response = await apiClient.get<ShoppingCategory>(
    API_ENDPOINTS.categories.get(householdId, categoryId),
    { requiresAuth: true },
  );
  return response.data;
}

export async function createCategory(
  householdId: number,
  input: CreateCategoryInput,
): Promise<ShoppingCategory> {
  const response = await apiClient.post<ShoppingCategory>(
    API_ENDPOINTS.categories.create(householdId),
    input,
    { requiresAuth: true },
  );
  return response.data;
}

export async function updateCategory(
  householdId: number,
  categoryId: number,
  input: UpdateCategoryInput,
): Promise<ShoppingCategory> {
  const response = await apiClient.put<ShoppingCategory>(
    API_ENDPOINTS.categories.update(householdId, categoryId),
    input,
    { requiresAuth: true },
  );
  return response.data;
}

export async function deleteCategory(householdId: number, categoryId: number): Promise<void> {
  await apiClient.delete<void>(API_ENDPOINTS.categories.delete(householdId, categoryId), {
    requiresAuth: true,
  });
}

export async function reorderCategories(householdId: number, categoryIds: number[]): Promise<void> {
  await apiClient.put<void>(API_ENDPOINTS.categories.reorder(householdId), { category_ids: categoryIds }, {
    requiresAuth: true,
  });
}

export type { ShoppingCategory };