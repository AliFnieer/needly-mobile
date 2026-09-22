import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { flushOutbox } from '@/offline/outbox';
import { useNetworkStore } from '@/stores/network-store';

function toOnline(state: { isConnected: boolean | null; isInternetReachable: boolean | null }): boolean {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

function applyConnectivity(next: boolean): void {
  const previous = useNetworkStore.getState().isOnline;
  useNetworkStore.getState().setOnline(next);
  if (next && !previous) void flushOutbox();
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => applyConnectivity(toOnline(state)));
    void NetInfo.fetch().then((state) => applyConnectivity(toOnline(state)));

    const onAppStateChange = (status: AppStateStatus) => {
      if (status !== 'active') return;
      void NetInfo.fetch().then((state) => applyConnectivity(toOnline(state)));
    };
    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => {
      unsubscribeNetInfo();
      subscription.remove();
    };
  }, []);

  return <>{children}</>;
}

export function useIsOnline(): boolean {
  return useNetworkStore((state) => state.isOnline);
}