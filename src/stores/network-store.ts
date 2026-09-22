import { create } from 'zustand';

type NetworkState = {
  isOnline: boolean;
  setOnline: (isOnline: boolean) => void;
};

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  setOnline: (isOnline) => set({ isOnline }),
}));

export function useIsOnline(): boolean {
  return useNetworkStore((state) => state.isOnline);
}