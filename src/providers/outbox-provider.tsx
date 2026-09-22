import { useEffect } from 'react';

import { flushOutbox } from '@/offline/outbox';
import { useOutboxStore } from '@/offline/outbox-store';
import { useIsOnline } from '@/providers/network-provider';

export function OutboxProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useIsOnline();
  const entries = useOutboxStore((state) => state.entries.length);
  const conflict = useOutboxStore((state) => state.conflict);

  useEffect(() => {
    if (isOnline && entries > 0 && !conflict) void flushOutbox();
  }, [isOnline, entries, conflict]);

  return <>{children}</>;
}