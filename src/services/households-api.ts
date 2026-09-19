import { apiClient } from '@/hooks/use-axios';
import { API_ENDPOINTS } from '@/utils/util';

export type HouseholdRole = 'owner' | 'member';

export type HouseholdMember = {
  id: number;
  household_id: number;
  user_id: number;
  role: HouseholdRole;
  created_at: string;
  updated_at: string;
};

export type Household = {
  id: number;
  name: string;
  owner_id: number;
  members: HouseholdMember[];
  created_at: string;
  updated_at: string;
};

export type SyncSnapshot = {
  household_id: number;
  server_time: string;
  lists: unknown[];
  items: unknown[];
};

export async function listHouseholds(): Promise<Household[]> {
  const response = await apiClient.get<Household[]>(API_ENDPOINTS.households.list, {
    requiresAuth: true,
  });
  return response.data;
}

export async function getHousehold(householdId: number): Promise<Household> {
  const response = await apiClient.get<Household>(API_ENDPOINTS.households.get(householdId), {
    requiresAuth: true,
  });
  return response.data;
}

export async function createHousehold(name: string): Promise<Household> {
  const response = await apiClient.post<Household>(
    API_ENDPOINTS.households.create,
    { name: name.trim() },
    { requiresAuth: true },
  );
  return response.data;
}

export async function updateHouseholdName(householdId: number, name: string): Promise<Household> {
  const response = await apiClient.put<Household>(
    API_ENDPOINTS.households.update(householdId),
    { name: name.trim() },
    { requiresAuth: true },
  );
  return response.data;
}

export async function deleteHousehold(householdId: number): Promise<void> {
  await apiClient.delete<void>(API_ENDPOINTS.households.delete(householdId), {
    requiresAuth: true,
  });
}

export async function addHouseholdMember(
  householdId: number,
  userId: number,
  role: HouseholdRole = 'member',
): Promise<HouseholdMember> {
  const response = await apiClient.post<HouseholdMember>(
    API_ENDPOINTS.households.addMember(householdId),
    { user_id: userId, role },
    { requiresAuth: true },
  );
  return response.data;
}

export async function removeHouseholdMember(householdId: number, userId: number): Promise<void> {
  await apiClient.delete<void>(API_ENDPOINTS.households.removeMember(householdId, userId), {
    requiresAuth: true,
  });
}

export async function syncHousehold(householdId: number): Promise<SyncSnapshot> {
  const response = await apiClient.get<SyncSnapshot>(API_ENDPOINTS.households.sync(householdId), {
    requiresAuth: true,
  });
  return response.data;
}