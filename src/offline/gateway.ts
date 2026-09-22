import { ApiError } from '@/hooks/use-axios';
import { useOutboxStore, type OutboxOp } from '@/offline/outbox-store';
import { useNetworkStore } from '@/stores/network-store';

export function isOffline(): boolean {
  return !useNetworkStore.getState().isOnline;
}

// Offline-created items carry a negative temporary id until the create is
// flushed and remapped to the real server id.
export function isClientId(itemId: number): boolean {
  return itemId < 0;
}

export function enqueueOutbox(op: OutboxOp): void {
  useOutboxStore.getState().enqueue(op);
}

// Runs a mutation online, but if the device is unreachable it queues the
// operation and resolves so the UI can keep working offline.
export async function onlineOrQueue<T>(execute: () => Promise<T>, op: OutboxOp): Promise<T> {
  if (isOffline()) {
    enqueueOutbox(op);
    return undefined as T;
  }
  try {
    return await execute();
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) {
      enqueueOutbox(op);
      return undefined as T;
    }
    throw error;
  }
}