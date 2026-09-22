import { useQuery } from '@tanstack/react-query';

import { listHouseholdNotifications, type ActivityNotification } from '@/services/notifications-api';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  household: (householdId: number) => ['notifications', 'household', householdId] as const,
};

export function useHouseholdNotificationsQuery(householdId: number) {
  return useQuery({
    queryKey: notificationQueryKeys.household(householdId),
    queryFn: () => listHouseholdNotifications(householdId),
    enabled: Number.isFinite(householdId) && householdId > 0,
  });
}

export type { ActivityNotification };