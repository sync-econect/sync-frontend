import { api } from '@/lib/axios';
import type { Remittance, RemittanceLog, RemittanceStatus, ModuleType } from '@/types';

export interface RemittanceFilters {
  status?: RemittanceStatus;
  module?: ModuleType;
  competency?: string;
  unitId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface RemittanceStats {
  total: number;
  byStatus: Record<string, number>;
  byModule: Record<string, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateRemittanceInput {
  rawDataId: number;
}

export interface SendResult {
  success: boolean;
  protocol?: string;
  errorMsg?: string;
}

// Backend retorna ids como number
interface ApiRemittance {
  id: number;
  unitId: number;
  unit?: {
    id: number;
    code: string;
    name: string;
    ambiente: string;
    active: boolean;
    createdAt: string;
  };
  rawDataId?: number;
  module: ModuleType;
  competency: string;
  status: RemittanceStatus;
  payload: Record<string, unknown>;
  protocol?: string;
  errorMsg?: string;
  createdAt: string;
  sentAt?: string;
}

interface ApiRemittanceLog {
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

const transformRemittance = (r: ApiRemittance): Remittance => ({
  id: String(r.id),
  unitId: String(r.unitId),
  unit: r.unit
    ? {
        id: String(r.unit.id),
        code: r.unit.code,
        name: r.unit.name,
        ambiente: r.unit.ambiente as 'PRODUCAO' | 'HOMOLOGACAO',
        active: r.unit.active,
        createdAt: r.unit.createdAt,
      }
    : undefined,
  rawDataId: r.rawDataId ? String(r.rawDataId) : '',
  module: r.module,
  competency: r.competency,
  status: r.status,
  payload: r.payload,
  protocol: r.protocol,
  errorMsg: r.errorMsg,
  createdAt: r.createdAt,
  sentAt: r.sentAt,
});

const transformLog = (log: ApiRemittanceLog): RemittanceLog => ({
  id: String(log.id),
  remittanceId: String(log.remittanceId),
  direction: log.direction,
  url: log.url,
  method: log.method,
  statusCode: log.statusCode,
  headers: log.headers,
  body: log.body,
  duration: log.duration,
  createdAt: log.createdAt,
});

export const remittancesApi = {
  async getAll(filters?: RemittanceFilters): Promise<PaginatedResponse<Remittance>> {
    const params: Record<string, string | number | undefined> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.module) params.module = filters.module;
    if (filters?.competency) params.competency = filters.competency;
    if (filters?.unitId) params.unitId = filters.unitId;
    if (filters?.from) params.from = filters.from;
    if (filters?.to) params.to = filters.to;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    const { data } = await api.get<{
      data: ApiRemittance[];
      total: number;
      page: number;
      limit: number;
    }>('/remittances', { params });

    return {
      data: data.data.map(transformRemittance),
      total: data.total,
      page: data.page,
      limit: data.limit,
    };
  },

  async getById(id: string): Promise<Remittance> {
    const { data } = await api.get<ApiRemittance>(`/remittances/${id}`);
    return transformRemittance(data);
  },

  async getStats(): Promise<RemittanceStats> {
    const { data } = await api.get<RemittanceStats>('/remittances/stats');
    return data;
  },

  async getLogs(id: string): Promise<RemittanceLog[]> {
    const { data } = await api.get<ApiRemittanceLog[]>(`/remittances/${id}/logs`);
    return data.map(transformLog);
  },

  async create(input: CreateRemittanceInput): Promise<Remittance> {
    const { data } = await api.post<ApiRemittance>('/remittances', input);
    return transformRemittance(data);
  },

  async send(id: string): Promise<SendResult> {
    const { data } = await api.post<SendResult>(`/remittances/${id}/send`);
    return data;
  },

  async cancel(id: string): Promise<Remittance> {
    const { data } = await api.post<ApiRemittance>(`/remittances/${id}/cancel`);
    return transformRemittance(data);
  },

  async retry(id: string): Promise<Remittance> {
    const { data } = await api.post<ApiRemittance>(`/remittances/${id}/retry`);
    return transformRemittance(data);
  },
};

