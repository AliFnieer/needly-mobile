import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type PropsWithChildren } from 'react';

import { attachCachePersister, hydrateQueryCache } from '@/offline/cache';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;
    void (async () => {
      await hydrateQueryCache(queryClient);
      if (cancelled) return;
      unsubscribe = attachCachePersister(queryClient);
      setReady(true);
    })();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  if (!ready) return null;

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}