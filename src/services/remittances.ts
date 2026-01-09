import { api } from '@/lib/axios';
import type {
  Remittance,
  RemittanceLog,
  RemittanceStatus,
  ModuleType,
  RemittanceStats,
} from '@/types';
import type { UnitResponse } from './units';

// Tipos para o backend (IDs numéricos)
export interface RemittanceResponse {
  id: number;
  unitId: number;
  unit?: UnitResponse;
  rawDataId: number;
  transformedDataId?: number;
  module: ModuleType;
  competency: string;
  status: RemittanceStatus;
  payload: Record<string, unknown>;
  protocol?: string;
  errorMsg?: string;
  cancelReason?: string;
  createdAt: string;
  sentAt?: string;
  cancelledAt?: string;
}

export interface RemittanceLogResponse {
  id: number;
  remittanceId: number;
  direction: 'REQUEST' | 'RESPONSE';
  url: string;
  method: string;
  statusCode?: number;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  duration?: number;
  createdAt: string;
}

export interface CreateRemittancePayload {
  rawDataId: number;
}

export interface CancelRemittancePayload {
  id: number;
  reason: string;
}

export interface RemittanceFilters {
  status?: string;
  module?: string;
  competency?: string;
  unitId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SendResult {
  success: boolean;
  protocol?: string;
  message: string;
  remittance: RemittanceResponse;
}

export interface BatchSendResult {
  total: number;
  successful: number;
  failed: number;
  results: {
    id: number;
    success: boolean;
    protocol?: string;
    message: string;
  }[];
}

// Mapeia resposta do backend para o tipo do frontend
const mapRemittanceResponse = (remittance: RemittanceResponse): Remittance => ({
  ...remittance,
  id: String(remittance.id),
  unitId: String(remittance.unitId),
  rawDataId: String(remittance.rawDataId),
  unit: remittance.unit
    ? {
        ...remittance.unit,
        id: String(remittance.unit.id),
      }
    : undefined,
});

const mapRemittanceLogResponse = (
  log: RemittanceLogResponse
): RemittanceLog => ({
  ...log,
  id: String(log.id),
  remittanceId: String(log.remittanceId),
});

export const remittancesService = {
  async getAll(
    filters?: RemittanceFilters
  ): Promise<PaginatedResponse<Remittance>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.module) params.append('module', filters.module);
    if (filters?.competency) params.append('competency', filters.competency);
    if (filters?.unitId) params.append('unitId', String(filters.unitId));
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const { data } = await api.get<PaginatedResponse<RemittanceResponse>>(
      '/remittances',
      { params }
    );
    return {
      ...data,
      data: data.data.map(mapRemittanceResponse),
    };
  },

  async getById(id: number): Promise<Remittance> {
    const { data } = await api.get<RemittanceResponse>(`/remittances/${id}`);
    return mapRemittanceResponse(data);
  },

  async getStats(): Promise<RemittanceStats> {
    const { data } = await api.get<RemittanceStats>('/remittances/stats');
    return data;
  },

  async getLogs(id: number): Promise<RemittanceLog[]> {
    const { data } = await api.get<RemittanceLogResponse[]>(
      `/remittances/${id}/logs`
    );
    return data.map(mapRemittanceLogResponse);
  },

  async create(payload: CreateRemittancePayload): Promise<Remittance> {
    const { data } = await api.post<RemittanceResponse>(
      '/remittances',
      payload
    );
    return mapRemittanceResponse(data);
  },

  async send(id: number): Promise<SendResult> {
    const { data } = await api.post<SendResult>(`/remittances/${id}/send`);
    return {
      ...data,
      remittance: {
        ...data.remittance,
        id: String(data.remittance.id),
        unitId: String(data.remittance.unitId),
        rawDataId: String(data.remittance.rawDataId),
      } as unknown as RemittanceResponse,
    };
  },

  async cancel(id: number, reason: string): Promise<Remittance> {
    const { data } = await api.post<RemittanceResponse>(
      `/remittances/${id}/cancel`,
      { reason }
    );
    return mapRemittanceResponse(data);
  },

  async retry(id: number): Promise<Remittance> {
    const { data } = await api.post<RemittanceResponse>(
      `/remittances/${id}/retry`
    );
    return mapRemittanceResponse(data);
  },

  async sendBatch(ids: number[]): Promise<BatchSendResult> {
    const { data } = await api.post<BatchSendResult>(
      '/remittances/send-batch',
      { ids }
    );
    return data;
  },
};
