import { ApiError } from '@/hooks/use-axios';
import { categoryQueryKeys } from '@/hooks/use-categories';
import { householdQueryKeys } from '@/hooks/use-households';
import { shoppingQueryKeys } from '@/hooks/use-shopping-lists';
import { useOutboxStore, type OutboxOp } from '@/offline/outbox-store';
import { queryClient } from '@/providers/query-provider';
import {
  createShoppingItem,
  createShoppingList,
  deleteShoppingItem,
  deleteShoppingList,
  getShoppingItem,
  setShoppingItemCompleted,
  updateShoppingItem,
  updateShoppingList,
  type ShoppingItem,
  type ShoppingList,
} from '@/services/shopping-lists-api';
import { useNetworkStore } from '@/stores/network-store';

let flushing = false;

// Rewrites queued ops that referenced a temporary client id so they point at
// the real server item, and swaps the optimistic item in the cached list.
function remapClientItem(clientItemId: number, created: ShoppingItem, listId: number): void {
  useOutboxStore.setState((state) => ({
    entries: state.entries.map((entry) => {
      const { op } = entry;
      if (op.kind === 'set-completed' && op.itemId === clientItemId) {
        return { ...entry, op: { ...op, itemId: created.id } };
      }
      if (op.kind === 'delete-item' && op.itemId === clientItemId) {
        return { ...entry, op: { ...op, itemId: created.id } };
      }
      if (op.kind === 'update-item' && op.itemId === clientItemId) {
        return {
          ...entry,
          op: { ...op, itemId: created.id, input: { ...op.input, base_updated_at: created.updated_at } },
        };
      }
      return entry;
    }),
  }));

  const listKey = shoppingQueryKeys.list(listId);
  const cached = queryClient.getQueryData<ShoppingList>(listKey);
  if (cached?.items) {
    queryClient.setQueryData<ShoppingList>(listKey, {
      ...cached,
      items: cached.items.map((item) => (item.id === clientItemId ? created : item)),
    });
  }
}

async function executeOp(op: OutboxOp): Promise<void> {
  switch (op.kind) {
    case 'create-list':
      await createShoppingList(op.householdId, { name: op.name });
      return;
    case 'rename-list':
      await updateShoppingList(op.listId, { name: op.name });
      return;
    case 'delete-list':
      await deleteShoppingList(op.listId);
      return;
    case 'add-item':
      return createShoppingItem(op.listId, op.item).then((created) =>
        remapClientItem(op.clientItemId, created, op.listId),
      );
    case 'set-completed':
      await setShoppingItemCompleted(op.itemId, op.isCompleted);
      return;
    case 'delete-item':
      await deleteShoppingItem(op.itemId);
      return;
    case 'update-item':
      await updateShoppingItem(op.itemId, op.input);
      return;
  }
}

function invalidateAfterSync(): void {
  queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: householdQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
}

export async function resolveConflictKeepMine(): Promise<void> {
  const { conflict } = useOutboxStore.getState();
  if (!conflict) return;
  await updateShoppingItem(conflict.itemId, {
    ...conflict.local,
    base_updated_at: conflict.server.updated_at,
  });
  useOutboxStore.getState().removeEntry(conflict.outboxId);
  useOutboxStore.getState().setConflict(null);
  invalidateAfterSync();
}

export function resolveConflictUseTheirs(): void {
  const { conflict } = useOutboxStore.getState();
  if (!conflict) return;
  useOutboxStore.getState().removeEntry(conflict.outboxId);
  useOutboxStore.getState().setConflict(null);
  invalidateAfterSync();
}

export async function flushOutbox(): Promise<void> {
  if (flushing) return;
  if (!useNetworkStore.getState().isOnline) return;
  if (useOutboxStore.getState().entries.length === 0) return;

  flushing = true;
  useOutboxStore.getState().setSyncing(true);
  let changed = false;

  try {
    while (true) {
      const store = useOutboxStore.getState();
      if (store.conflict) break;
      const entry = store.entries[0];
      if (!entry) break;

      try {
        await executeOp(entry.op);
        useOutboxStore.getState().removeEntry(entry.id);
        changed = true;
      } catch (error) {
        if (error instanceof ApiError && error.status === 409 && entry.op.kind === 'update-item') {
          let server: Awaited<ReturnType<typeof getShoppingItem>> | null = null;
          try {
            server = await getShoppingItem(entry.op.itemId);
          } catch {
            /* server item unreachable; defer until next flush */
          }
          if (server) {
            useOutboxStore.getState().setConflict({
              outboxId: entry.id,
              householdId: entry.op.householdId,
              listId: entry.op.listId,
              itemId: entry.op.itemId,
              local: entry.op.input,
              server,
            });
          }
          break;
        }
        // Transient failure: keep the entry at the front and retry on the next flush.
        break;
      }
    }

    if (changed) invalidateAfterSync();
  } finally {
    flushing = false;
    useOutboxStore.getState().setSyncing(false);
  }
}