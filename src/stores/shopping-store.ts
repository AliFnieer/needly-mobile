import { create } from 'zustand';

import type { ShoppingItem } from '@/services/shopping-lists-api';

type ShoppingState = {
  items: ShoppingItem[];
  setItems: (items: ShoppingItem[]) => void;
  applyAdd: (item: ShoppingItem) => void;
  applyToggle: (itemId: number, isCompleted: boolean) => void;
  applyRemove: (itemId: number) => void;
  applyUpdate: (item: ShoppingItem) => void;
};

export const useShoppingStore = create<ShoppingState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  applyAdd: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
  applyToggle: (itemId, isCompleted) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, is_completed: isCompleted } : item,
      ),
    })),
  applyRemove: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
  applyUpdate: (item) =>
    set((state) => ({
      items: state.items.map((existing) => (existing.id === item.id ? item : existing)),
    })),
}));
