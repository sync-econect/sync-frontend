import { api } from '@/lib/axios';
import type { RawData, RawDataStatus, ModuleType } from '@/types';
import type { UnitResponse } from './units';

// Tipos para o backend (IDs numéricos)
export interface RawDataResponse {
  id: number;
  unitId: number;
  unit?: UnitResponse;
  module: ModuleType;
  competency: string;
  payload: Record<string, unknown>;
  status: RawDataStatus;
  createdAt: string;
}

export interface CreateRawDataPayload {
  unitId: number;
  module: ModuleType;
  competency: string;
  payload: Record<string, unknown>;
}

export interface UpdateRawDataPayload extends Partial<CreateRawDataPayload> {
  status?: RawDataStatus;
}

export interface RawDataFilters {
  unitId?: number;
  module?: string;
  status?: string;
  competency?: string;
}

// Mapeia resposta do backend para o tipo do frontend
const mapRawDataResponse = (rawData: RawDataResponse): RawData => ({
  ...rawData,
  id: String(rawData.id),
  unitId: String(rawData.unitId),
  unit: rawData.unit
    ? {
        ...rawData.unit,
        id: String(rawData.unit.id),
      }
    : undefined,
});

export const rawDataService = {
  async getAll(filters?: RawDataFilters): Promise<RawData[]> {
    const params = new URLSearchParams();
    if (filters?.unitId) params.append('unitId', String(filters.unitId));
    if (filters?.module) params.append('module', filters.module);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.competency) params.append('competency', filters.competency);

    const { data } = await api.get<RawDataResponse[]>('/raw-data', { params });
    return data.map(mapRawDataResponse);
  },

  async getById(id: number): Promise<RawData> {
    const { data } = await api.get<RawDataResponse>(`/raw-data/${id}`);
    return mapRawDataResponse(data);
  },

  async getByModule(module: string): Promise<RawData[]> {
    const { data } = await api.get<RawDataResponse[]>(
      `/raw-data/module/${module}`
    );
    return data.map(mapRawDataResponse);
  },

  async create(payload: CreateRawDataPayload): Promise<RawData> {
    const { data } = await api.post<RawDataResponse>('/raw-data', payload);
    return mapRawDataResponse(data);
  },

  async update(id: number, payload: UpdateRawDataPayload): Promise<RawData> {
    const { data } = await api.patch<RawDataResponse>(
      `/raw-data/${id}`,
      payload
    );
    return mapRawDataResponse(data);
  },

  async delete(id: number): Promise<RawData> {
    const { data } = await api.delete<RawDataResponse>(`/raw-data/${id}`);
    return mapRawDataResponse(data);
  },
};
