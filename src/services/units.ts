import { api } from '@/lib/axios';
import type { Unit, Environment } from '@/types';

// Tipos para o backend (IDs numéricos)
export interface UnitResponse {
  id: number;
  code: string;
  name: string;
  tokenProducao?: string;
  tokenHomologacao?: string;
  ambiente: Environment;
  active: boolean;
  createdAt: string;
}

export interface CreateUnitPayload {
  code: string;
  name: string;
  tokenProducao?: string;
  tokenHomologacao?: string;
  ambiente?: Environment;
  active?: boolean;
}

export interface UpdateUnitPayload extends Partial<CreateUnitPayload> {}

// Mapeia resposta do backend para o tipo do frontend
const mapUnitResponse = (unit: UnitResponse): Unit => ({
  ...unit,
  id: String(unit.id),
});

export const unitsService = {
  async getAll(): Promise<Unit[]> {
    const { data } = await api.get<UnitResponse[]>('/units');
    return data.map(mapUnitResponse);
  },

  async getById(id: number): Promise<Unit> {
    const { data } = await api.get<UnitResponse>(`/units/${id}`);
    return mapUnitResponse(data);
  },

  async create(payload: CreateUnitPayload): Promise<Unit> {
    const { data } = await api.post<UnitResponse>('/units', payload);
    return mapUnitResponse(data);
  },

  async update(id: number, payload: UpdateUnitPayload): Promise<Unit> {
    const { data } = await api.patch<UnitResponse>(`/units/${id}`, payload);
    return mapUnitResponse(data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/units/${id}`);
  },
};

