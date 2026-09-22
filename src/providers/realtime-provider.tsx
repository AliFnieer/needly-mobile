import { useEffect, useRef } from 'react';

import { categoryQueryKeys } from '@/hooks/use-categories';
import { householdQueryKeys, useHouseholdsQuery } from '@/hooks/use-households';
import { shoppingQueryKeys } from '@/hooks/use-shopping-lists';
import { useAuth } from '@/providers/auth-provider';
import { queryClient } from '@/providers/query-provider';
import { RealtimeConnection, type RealtimePushEvent } from '@/services/websocket/realtime-client';

const INVALIDATE_DEBOUNCE_MS = 400;

type InvalidateTarget = 'shopping' | 'households';

const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function scheduleInvalidate(key: InvalidateTarget, householdId?: number): void {
  const timerKey = householdId === undefined ? key : `${key}:${householdId}`;
  if (debounceTimers[timerKey]) return;

  debounceTimers[timerKey] = setTimeout(() => {
    delete debounceTimers[timerKey];

    if (key === 'shopping') {
      queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.all });
      if (householdId !== undefined) {
        queryClient.invalidateQueries({ queryKey: householdQueryKeys.sync(householdId) });
        queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      }
      return;
    }

    queryClient.invalidateQueries({ queryKey: householdQueryKeys.all });
  }, INVALIDATE_DEBOUNCE_MS);
}

function handleEvent(event: RealtimePushEvent): void {
  const householdId = event.household_id ? Number(event.household_id) : undefined;

  if (event.type.startsWith('household.')) {
    scheduleInvalidate('households');
    return;
  }

  if (event.type.startsWith('list.') || event.type.startsWith('item.')) {
    scheduleInvalidate('shopping', householdId);
  }
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const householdsQuery = useHouseholdsQuery(isSignedIn);
  const connectionsRef = useRef<Map<number, RealtimeConnection>>(new Map());

  const householdIdKey = (householdsQuery.data ?? [])
    .map((household) => household.id)
    .filter((id: number) => Number.isFinite(id) && id > 0)
    .sort((a, b) => a - b)
    .join(',');

  useEffect(() => {
    if (!isSignedIn) return;

    const connections = connectionsRef.current;
    const activeIds = new Set(householdIdKey ? householdIdKey.split(',').map(Number) : []);

    for (const id of activeIds) {
      if (connections.has(id)) continue;
      connections.set(id, new RealtimeConnection({ householdId: id, onEvent: handleEvent }));
    }

    for (const [id, connection] of connections) {
      if (!activeIds.has(id)) {
        connection.close();
        connections.delete(id);
      }
    }

    return () => {
      for (const connection of connections.values()) {
        connection.close();
      }
      connections.clear();
    };
  }, [isSignedIn, householdIdKey]);

  return <>{children}</>;
}