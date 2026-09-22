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
  type CreateShoppingItemInput,
  type ShoppingItem,
  type ShoppingList,
} from '@/services/shopping-lists-api';
import { householdQueryKeys } from '@/hooks/use-households';
import { enqueueOutbox, isClientId, isOffline, onlineOrQueue } from '@/offline/gateway';
import type { OutboxUpdateItemInput } from '@/offline/outbox-store';
import { useShoppingStore } from '@/stores/shopping-store';

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
  const queryClientInstance = useQueryClient();
  return () => {
    queryClientInstance.invalidateQueries({ queryKey: shoppingQueryKeys.all });
    queryClientInstance.invalidateQueries({ queryKey: householdQueryKeys.sync(householdId) });
  };
}

function makeOptimisticItem(listId: number, input: Partial<CreateShoppingItemInput>): ShoppingItem {
  return {
    id: -Math.abs(Date.now() + Math.round(Math.random() * 10_000)),
    list_id: listId,
    category_id: input.category_id ?? null,
    name: input.name ?? '',
    quantity: input.quantity ?? 1,
    unit: input.unit ?? '',
    is_completed: false,
    recurrence_rule: input.recurrence_rule ?? '',
    next_due_at: null,
    created_by: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function optimisticUpdateItem(current: ShoppingItem | undefined, input: OutboxUpdateItemInput): ShoppingItem {
  if (!current) return makeOptimisticItem(0, input);
  return {
    ...current,
    name: input.name ?? current.name,
    quantity: input.quantity ?? current.quantity,
    unit: input.unit ?? current.unit,
    category_id: input.category_id !== undefined ? input.category_id : current.category_id,
    recurrence_rule: input.recurrence_rule ?? current.recurrence_rule,
    updated_at: new Date().toISOString(),
  };
}

export function useCreateShoppingListMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: async (name: string) =>
      onlineOrQueue(
        () => createShoppingList(householdId, { name: name.trim() }),
        { kind: 'create-list', householdId, name: name.trim() },
      ),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateShoppingListMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: ({ listId, name }: { listId: number; name: string }) =>
      onlineOrQueue(
        () => updateShoppingList(listId, { name: name.trim() }),
        { kind: 'rename-list', householdId, listId, name: name.trim() },
      ),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteShoppingListMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: (listId: number) =>
      onlineOrQueue(
        () => deleteShoppingList(listId),
        { kind: 'delete-list', householdId, listId },
      ),
    onSuccess: () => invalidate(),
  });
}

export function useCreateShoppingItemMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: async ({
      listId,
      item,
    }: {
      listId: number;
      item: CreateShoppingItemInput;
    }): Promise<ShoppingItem> => {
      if (isOffline()) {
        const optimistic = makeOptimisticItem(listId, item);
        enqueueOutbox({ kind: 'add-item', householdId, listId, clientItemId: optimistic.id, item });
        useShoppingStore.getState().applyAdd(optimistic);
        return optimistic;
      }
      return createShoppingItem(listId, item);
    },
    onSuccess: () => invalidate(),
  });
}

export function useToggleShoppingItemMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: ({ itemId, isCompleted }: { itemId: number; isCompleted: boolean }) => {
      if (isOffline() || isClientId(itemId)) {
        enqueueOutbox({ kind: 'set-completed', householdId, itemId, isCompleted });
        return Promise.resolve({} as ShoppingItem);
      }
      return setShoppingItemCompleted(itemId, isCompleted);
    },
    onSuccess: () => invalidate(),
  });
}

export function useUpdateShoppingItemMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: async ({
      itemId,
      input,
    }: {
      itemId: number;
      input: Parameters<typeof updateShoppingItem>[1];
    }): Promise<ShoppingItem> => {
      if (isOffline() || isClientId(itemId)) {
        const current = useShoppingStore.getState().items.find((item) => item.id === itemId);
        enqueueOutbox({
          kind: 'update-item',
          householdId,
          listId: current?.list_id ?? 0,
          itemId,
          input,
        });
        return optimisticUpdateItem(current, input);
      }
      return updateShoppingItem(itemId, input);
    },
    onSuccess: () => invalidate(),
  });
}

export function useDeleteShoppingItemMutation(householdId: number) {
  const invalidate = useInvalidateShopping(householdId);
  return useMutation({
    mutationFn: (itemId: number) => {
      if (isOffline() || isClientId(itemId)) {
        enqueueOutbox({ kind: 'delete-item', householdId, itemId });
        return Promise.resolve();
      }
      return deleteShoppingItem(itemId);
    },
    onSuccess: () => invalidate(),
  });
}

export type { ShoppingItem, ShoppingList, CreateShoppingItemInput, OutboxUpdateItemInput };