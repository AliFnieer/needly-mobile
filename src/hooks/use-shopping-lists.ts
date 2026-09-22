import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createShoppingItem,
  createShoppingList,
  deleteShoppingItem,
  deleteShoppingList,
  getShoppingList,
  listShoppingLists,
  setShoppingItemCompleted,
  updateShoppingItem,
  updateShoppingList,
  type ShoppingItem,
  type ShoppingList,
} from '@/services/shopping-lists-api';
import { householdQueryKeys } from '@/hooks/use-households';

export const shoppingQueryKeys = {
  all: ['shopping'] as const,
  lists: (householdId: number) => ['shopping', 'lists', householdId] as const,
  list: (listId: number) => ['shopping', 'list', listId] as const,
};

export function useShoppingListsQuery(householdId: number) {
  return useQuery({
    queryKey: shoppingQueryKeys.lists(householdId),
    queryFn: () => listShoppingLists(householdId),
    enabled: Number.isFinite(householdId) && householdId > 0,
  });
}

export function useShoppingListQuery(listId: number) {
  return useQuery({
    queryKey: shoppingQueryKeys.list(listId),
    queryFn: () => getShoppingList(listId),
    enabled: Number.isFinite(listId) && listId > 0,
  });
}

function useInvalidateShopping(householdId: number) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: householdQueryKeys.sync(householdId) });
  };
}

export function useCreateShoppingListMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: (name: string) => createShoppingList(householdId, { name: name.trim() }),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateShoppingListMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: ({ listId, name }: { listId: number; name: string }) =>
      updateShoppingList(listId, { name: name.trim() }),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteShoppingListMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: (listId: number) => deleteShoppingList(listId),
    onSuccess: () => invalidate(),
  });
}

export function useCreateShoppingItemMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: ({
      listId,
      item,
    }: {
      listId: number;
      item: { name: string; quantity?: number; unit?: string };
    }) => createShoppingItem(listId, item),
    onSuccess: () => invalidate(),
  });
}

export function useToggleShoppingItemMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: ({ itemId, isCompleted }: { itemId: number; isCompleted: boolean }) =>
      setShoppingItemCompleted(itemId, isCompleted),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateShoppingItemMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: number; input: Parameters<typeof updateShoppingItem>[1] }) =>
      updateShoppingItem(itemId, input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteShoppingItemMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: (itemId: number) => deleteShoppingItem(itemId),
    onSuccess: () => invalidate(),
  });
}

export type { ShoppingItem, ShoppingList };