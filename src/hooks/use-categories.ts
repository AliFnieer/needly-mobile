import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CreateCategoryInput,
  type ShoppingCategory,
  type UpdateCategoryInput,
} from '@/services/categories-api';
import { householdQueryKeys } from '@/hooks/use-households';
import { shoppingQueryKeys } from '@/hooks/use-shopping-lists';

export const categoryQueryKeys = {
  all: ['categories'] as const,
  list: (householdId: number) => ['categories', 'list', householdId] as const,
};

export function useCategoriesQuery(householdId: number) {
  return useQuery({
    queryKey: categoryQueryKeys.list(householdId),
    queryFn: () => listCategories(householdId),
    enabled: Number.isFinite(householdId) && householdId > 0,
  });
}

function useInvalidateCategories(householdId: number) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: householdQueryKeys.sync(householdId) });
  };
}

export function useCreateCategoryMutation(householdId: number) {
  const invalidate = useInvalidateCategories(householdId);
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(householdId, input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateCategoryMutation(householdId: number) {
  const invalidate = useInvalidateCategories(householdId);
  return useMutation({
    mutationFn: ({ categoryId, input }: { categoryId: number; input: UpdateCategoryInput }) =>
      updateCategory(householdId, categoryId, input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteCategoryMutation(householdId: number) {
  const invalidate = useInvalidateCategories(householdId);
  return useMutation({
    mutationFn: (categoryId: number) => deleteCategory(householdId, categoryId),
    onSuccess: () => invalidate(),
  });
}

export type { ShoppingCategory };