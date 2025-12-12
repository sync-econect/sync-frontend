import { api } from '@/lib/axios';
import type { User, UserRole } from '@/types';

interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLogin?: string;
  lastActivity?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

const mapUser = (u: BackendUser): User => ({
  ...u,
  id: String(u.id),
});

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  active?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  active?: boolean;
}

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get<BackendUser[]>('/users');
    return data.map(mapUser);
  },

  async getById(id: number): Promise<User> {
    const { data } = await api.get<BackendUser>(`/users/${id}`);
    return mapUser(data);
  },

  async create(user: CreateUserRequest): Promise<User> {
    const { data } = await api.post<BackendUser>('/users', user);
    return mapUser(data);
  },

  async update(id: number, user: UpdateUserRequest): Promise<User> {
    const { data } = await api.patch<BackendUser>(`/users/${id}`, user);
    return mapUser(data);
  },

  async delete(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/users/${id}`);
    return data;
  },

  async unlock(id: number): Promise<User> {
    const { data } = await api.post<BackendUser>(`/users/${id}/unlock`);
    return mapUser(data);
  },
};
