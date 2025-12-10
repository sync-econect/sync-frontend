import { api } from '@/lib/axios';
import type { AuditLog, AuditAction } from '@/types';

// Tipos para o backend (IDs numéricos)
export interface AuditLogResponse {
  id: number;
  entity: string;
  entityId: number;
  action: AuditAction;
  userId?: number;
  user?: string;
  ip?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditFilters {
  entity?: string;
  entityId?: number;
  action?: string;
  userId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAuditResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

// Mapeia resposta do backend para o tipo do frontend
const mapAuditLogResponse = (log: AuditLogResponse): AuditLog => ({
  ...log,
  id: String(log.id),
  entityId: String(log.entityId),
  user: log.user || undefined,
});

export const auditService = {
  async getAll(filters?: AuditFilters): Promise<PaginatedAuditResponse> {
    const params = new URLSearchParams();
    if (filters?.entity) params.append('entity', filters.entity);
    if (filters?.entityId) params.append('entityId', String(filters.entityId));
    if (filters?.action) params.append('action', filters.action);
    if (filters?.userId) params.append('userId', String(filters.userId));
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const { data } = await api.get<{ data: AuditLogResponse[]; total: number; page: number; limit: number }>('/audit', { params });
    return {
      ...data,
      data: data.data.map(mapAuditLogResponse),
    };
  },

  async getById(id: number): Promise<AuditLog> {
    const { data } = await api.get<AuditLogResponse>(`/audit/${id}`);
    return mapAuditLogResponse(data);
  },
};

