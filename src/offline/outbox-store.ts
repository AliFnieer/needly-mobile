import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  CreateShoppingItemInput,
  ShoppingItem,
} from '@/services/shopping-lists-api';

export type OutboxUpdateItemInput = Partial<CreateShoppingItemInput> & { base_updated_at?: string };

export type OutboxOp =
  | { kind: 'create-list'; householdId: number; name: string }
  | { kind: 'rename-list'; householdId: number; listId: number; name: string }
  | { kind: 'delete-list'; householdId: number; listId: number }
  | { kind: 'add-item'; householdId: number; listId: number; clientItemId: number; item: CreateShoppingItemInput }
  | { kind: 'set-completed'; householdId: number; itemId: number; isCompleted: boolean }
  | { kind: 'update-item'; householdId: number; listId: number; itemId: number; input: OutboxUpdateItemInput }
  | { kind: 'delete-item'; householdId: number; itemId: number };

export type OutboxEntry = {
  id: string;
  createdAt: string;
  op: OutboxOp;
};

export type ConflictState = {
  outboxId: string;
  householdId: number;
  listId: number;
  itemId: number;
  local: OutboxUpdateItemInput;
  server: ShoppingItem;
};

type OutboxState = {
  entries: OutboxEntry[];
  conflict: ConflictState | null;
  isSyncing: boolean;
  enqueue: (op: OutboxOp) => void;
  removeEntry: (id: string) => void;
  setConflict: (conflict: ConflictState | null) => void;
  setSyncing: (isSyncing: boolean) => void;
};

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set) => ({
      entries: [],
      conflict: null,
      isSyncing: false,
      enqueue: (op) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
              createdAt: new Date().toISOString(),
              op,
            },
          ],
        })),
      removeEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),
      setConflict: (conflict) => set({ conflict }),
      setSyncing: (isSyncing) => set({ isSyncing }),
    }),
    {
      name: 'needly:outbox:v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function countPending(householdId?: number): number {
  const { entries } = useOutboxStore.getState();
  if (householdId === undefined) return entries.length;
  return entries.filter((entry) => entry.op.householdId === householdId).length;
}

export function usePendingCount(householdId?: number): number {
  return useOutboxStore((state) =>
    householdId === undefined
      ? state.entries.length
      : state.entries.filter((entry) => entry.op.householdId === householdId).length,
  );
}