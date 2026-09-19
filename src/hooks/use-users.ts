import { useQuery } from '@tanstack/react-query';

import { lookupUser, type UserLookup } from '@/services/users-api';

export const userQueryKeys = {
  detail: (userId: string | number) => ['users', 'detail', String(userId)] as const,
};

export function useUserLookupQuery(userId: string | number | undefined) {
  return useQuery({
    queryKey: userQueryKeys.detail(String(userId)),
    queryFn: () => lookupUser(String(userId)),
    enabled: userId !== undefined && userId !== '' && Number.isFinite(Number(userId)),
    retry: false,
  });
}

export type { UserLookup };