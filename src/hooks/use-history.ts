import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { householdQueryKeys } from '@/hooks/use-households';
import {
  deleteHistoryEntry,
  listHouseholdHistory,
  type ShoppingHistoryEntry,
} from '@/services/history-api';

export const historyQueryKeys = {
  all: ['history'] as const,
  household: (householdId: number) => ['history', 'household', householdId] as const,
};

export function useHouseholdHistoryQuery(householdId: number) {
  return useQuery({
    queryKey: historyQueryKeys.household(householdId),
    queryFn: () => listHouseholdHistory(householdId),
    enabled: Number.isFinite(householdId) && householdId > 0,
  });
}

export function useDeleteHistoryEntryMutation(householdId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: number) => deleteHistoryEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: householdQueryKeys.sync(householdId) });
    },
  });
}

export type { ShoppingHistoryEntry };