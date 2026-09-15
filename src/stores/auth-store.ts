import { create } from 'zustand';

import type { User } from '@/services/auth-api';

type UserUpdater = User | null | ((user: User | null) => User | null);

type AuthStore = {
  user: User | null;
  isSignedIn: boolean;
  isLoading: boolean;
  onboarded: boolean;
  setUser: (userOrUpdater: UserUpdater) => void;
  setSignedIn: (isSignedIn: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isSignedIn: false,
  isLoading: true,
  onboarded: false,
  setUser: (userOrUpdater) =>
    set((state) => ({
      user: typeof userOrUpdater === 'function' ? userOrUpdater(state.user) : userOrUpdater,
    })),
  setSignedIn: (isSignedIn) => set({ isSignedIn }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnboarded: (onboarded) => set({ onboarded }),
}));