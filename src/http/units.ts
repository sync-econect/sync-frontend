import { api } from '@/lib/axios';
import type { Unit, Environment } from '@/types';

export interface CreateUnitInput {
  code: string;
  name: string;
  tokenProducao?: string;
  tokenHomologacao?: string;
  ambiente?: Environment;
  active?: boolean;
}

export interface UpdateUnitInput extends Partial<CreateUnitInput> {}

// Backend retorna id como number, precisamos converter
interface ApiUnit extends Omit<Unit, 'id'> {
  id: number;
}

const transformUnit = (unit: ApiUnit): Unit => ({
  ...unit,
  id: String(unit.id),
});

export const unitsApi = {
  async getAll(): Promise<Unit[]> {
    const { data } = await api.get<ApiUnit[]>('/units');
    return data.map(transformUnit);
  },

  async getById(id: string): Promise<Unit> {
    const { data } = await api.get<ApiUnit>(`/units/${id}`);
    return transformUnit(data);
  },

  async create(input: CreateUnitInput): Promise<Unit> {
    const { data } = await api.post<ApiUnit>('/units', input);
    return transformUnit(data);
  },

  async update(id: string, input: UpdateUnitInput): Promise<Unit> {
    const { data } = await api.patch<ApiUnit>(`/units/${id}`, input);
    return transformUnit(data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/units/${id}`);
  },
};

