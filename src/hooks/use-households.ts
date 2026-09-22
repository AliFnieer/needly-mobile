import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addHouseholdMember,
  createHousehold,
  deleteHousehold,
  getHousehold,
  listHouseholds,
  removeHouseholdMember,
  syncHousehold,
  updateHouseholdName,
  type Household,
  type HouseholdMember,
  type HouseholdRole,
  type SyncSnapshot,
} from '@/services/households-api';

export const householdQueryKeys = {
  all: ['households'] as const,
  list: ['households', 'list'] as const,
  detail: (householdId: number) => ['households', 'detail', householdId] as const,
  sync: (householdId: number) => ['households', 'sync', householdId] as const,
};

export function useHouseholdsQuery(enabled = true) {
  return useQuery({
    queryKey: householdQueryKeys.list,
    queryFn: listHouseholds,
    enabled,
  });
}

export function useHouseholdQuery(householdId: number) {
  return useQuery({
    queryKey: householdQueryKeys.detail(householdId),
    queryFn: () => getHousehold(householdId),
    enabled: Number.isFinite(householdId),
  });
}

export function useSyncHouseholdQuery(householdId: number, enabled: boolean) {
  return useQuery({
    queryKey: householdQueryKeys.sync(householdId),
    queryFn: () => syncHousehold(householdId),
    enabled,
  });
}

function useInvalidateHouseholds() {
  const queryClient = useQueryClient();
  return (householdId?: number) => {
    queryClient.invalidateQueries({ queryKey: householdQueryKeys.all });
    if (householdId) {
      queryClient.invalidateQueries({ queryKey: householdQueryKeys.sync(householdId) });
    }
  };
}

export function useCreateHouseholdMutation() {
  const invalidate = useInvalidateHouseholds();
  return useMutation({
    mutationFn: (name: string) => createHousehold(name),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateHouseholdMutation() {
  const invalidate = useInvalidateHouseholds();
  return useMutation({
    mutationFn: ({ housegroupId, name }: { housegroupId: number; name: string }) =>
      updateHouseholdName(housegroupId, name),
    onSuccess: (_data, variables) => invalidate(variables.housegroupId),
  });
}

export function useDeleteHouseholdMutation() {
  const invalidate = useInvalidateHouseholds();
  return useMutation({
    mutationFn: (housegroupId: number) => deleteHousehold(housegroupId),
    onSuccess: () => invalidate(),
  });
}

export function useAddHouseholdMemberMutation() {
  const invalidate = useInvalidateHouseholds();
  return useMutation({
    mutationFn: ({
      householdId,
      userId,
      role,
    }: {
      householdId: number;
      userId: number;
      role?: HouseholdRole;
    }) => addHouseholdMember(householdId, userId, role),
    onSuccess: (_data, variables) => invalidate(variables.householdId),
  });
}

export function useRemoveHouseholdMemberMutation() {
  const invalidate = useInvalidateHouseholds();
  return useMutation({
    mutationFn: ({ householdId, userId }: { householdId: number; userId: number }) =>
      removeHouseholdMember(householdId, userId),
    onSuccess: (_data, variables) => invalidate(variables.householdId),
  });
}

export type { Household, HouseholdMember, HouseholdRole, SyncSnapshot };