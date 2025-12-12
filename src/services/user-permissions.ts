import { api } from '@/lib/axios';
import type {
  UserPermission,
  CreateUserPermissionRequest,
  UpdateUserPermissionRequest,
  PermissionAction,
} from '@/types';

// Backend retorna IDs numéricos, frontend usa strings
interface BackendUserPermission {
  id: number;
  userId: number;
  unitId: number | null;
  module: string | null;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canTransmit: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  unit?: {
    id: number;
    code: string;
    name: string;
  } | null;
}

const mapPermission = (p: BackendUserPermission): UserPermission => ({
  ...p,
  id: String(p.id),
  userId: String(p.userId),
  unitId: p.unitId ? String(p.unitId) : null,
  module: p.module as UserPermission['module'],
});

export interface UserPermissionFilters {
  userId?: number;
  unitId?: number;
  module?: string;
}

export const userPermissionsService = {
  async getAll(filters?: UserPermissionFilters): Promise<UserPermission[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', String(filters.userId));
    if (filters?.unitId) params.append('unitId', String(filters.unitId));
    if (filters?.module) params.append('module', filters.module);

    const { data } = await api.get<BackendUserPermission[]>(
      `/user-permissions${params.toString() ? `?${params}` : ''}`
    );
    return data.map(mapPermission);
  },

  async getByUser(userId: number): Promise<UserPermission[]> {
    const { data } = await api.get<BackendUserPermission[]>(
      `/user-permissions/user/${userId}`
    );
    return data.map(mapPermission);
  },

  async getById(id: number): Promise<UserPermission> {
    const { data } = await api.get<BackendUserPermission>(
      `/user-permissions/${id}`
    );
    return mapPermission(data);
  },

  async create(
    permission: CreateUserPermissionRequest
  ): Promise<UserPermission> {
    const { data } = await api.post<BackendUserPermission>(
      '/user-permissions',
      permission
    );
    return mapPermission(data);
  },

  async createBulk(
    userId: number,
    permissions: Omit<CreateUserPermissionRequest, 'userId'>[]
  ): Promise<UserPermission[]> {
    const { data } = await api.post<BackendUserPermission[]>(
      `/user-permissions/bulk/${userId}`,
      permissions
    );
    return data.map(mapPermission);
  },

  async update(
    id: number,
    permission: UpdateUserPermissionRequest
  ): Promise<UserPermission> {
    const { data } = await api.patch<BackendUserPermission>(
      `/user-permissions/${id}`,
      permission
    );
    return mapPermission(data);
  },

  async delete(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(
      `/user-permissions/${id}`
    );
    return data;
  },

  async deleteAllByUser(userId: number): Promise<{ count: number }> {
    const { data } = await api.delete<{ count: number }>(
      `/user-permissions/user/${userId}`
    );
    return data;
  },

  async checkPermission(params: {
    userId: number;
    action: PermissionAction;
    unitId?: number;
    module?: string;
  }): Promise<{ hasPermission: boolean }> {
    const queryParams = new URLSearchParams();
    queryParams.append('userId', String(params.userId));
    queryParams.append('action', params.action);
    if (params.unitId) queryParams.append('unitId', String(params.unitId));
    if (params.module) queryParams.append('module', params.module);

    const { data } = await api.get<{ hasPermission: boolean }>(
      `/user-permissions/check?${queryParams}`
    );
    return data;
  },

  async getPermittedUnits(
    userId: number,
    action: PermissionAction
  ): Promise<{ units: number[] | 'all' }> {
    const { data } = await api.get<{ units: number[] | 'all' }>(
      `/user-permissions/permitted-units/${userId}?action=${action}`
    );
    return data;
  },

  async getPermittedModules(
    userId: number,
    action: PermissionAction,
    unitId?: number
  ): Promise<{ modules: string[] | 'all' }> {
    const params = new URLSearchParams();
    params.append('action', action);
    if (unitId) params.append('unitId', String(unitId));

    const { data } = await api.get<{ modules: string[] | 'all' }>(
      `/user-permissions/permitted-modules/${userId}?${params}`
    );
    return data;
  },
};
