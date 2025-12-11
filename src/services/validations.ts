import { api } from '@/lib/axios';
import type { ValidationLevel } from '@/types';

// Tipos para o backend
export interface ValidationResponse {
  id: number;
  rawId: number;
  ruleId?: number;
  level: ValidationLevel;
  code: string;
  message: string;
  field?: string;
  value?: string;
  createdAt: string;
}

export interface ValidationResultItem {
  ruleId: number;
  code: string;
  level: ValidationLevel;
  field: string;
  message: string;
  value: string;
}

export interface ValidationResult {
  rawDataId: number;
  module: string;
  hasBlockingErrors: boolean;
  validations: ValidationResultItem[];
  summary: {
    total: number;
    impeditivas: number;
    alertas: number;
  };
}

export interface Validation {
  id: string;
  rawId: string;
  ruleId?: string;
  level: ValidationLevel;
  code: string;
  message: string;
  field?: string;
  value?: string;
  createdAt: string;
}

export interface ValidationFilters {
  rawId?: number;
  level?: string;
  code?: string;
}

// Mapeia resposta do backend para o tipo do frontend
const mapValidationResponse = (validation: ValidationResponse): Validation => ({
  ...validation,
  id: String(validation.id),
  rawId: String(validation.rawId),
  ruleId: validation.ruleId ? String(validation.ruleId) : undefined,
});

export const validationsService = {
  async validateRawData(rawDataId: number): Promise<ValidationResult> {
    const { data } = await api.post<ValidationResult>(
      `/validations/raw-data/${rawDataId}/validate`
    );
    return data;
  },

  async revalidateRawData(rawDataId: number): Promise<ValidationResult> {
    const { data } = await api.post<ValidationResult>(
      `/validations/raw-data/${rawDataId}/revalidate`
    );
    return data;
  },

  async getByRawData(rawDataId: number): Promise<Validation[]> {
    const { data } = await api.get<ValidationResponse[]>(
      `/validations/raw-data/${rawDataId}`
    );
    return data.map(mapValidationResponse);
  },

  async clearValidations(rawDataId: number): Promise<{ count: number }> {
    const { data } = await api.delete<{ count: number }>(
      `/validations/raw-data/${rawDataId}`
    );
    return data;
  },

  async getAll(filters?: ValidationFilters): Promise<Validation[]> {
    const params = new URLSearchParams();
    if (filters?.rawId) params.append('rawId', String(filters.rawId));
    if (filters?.level) params.append('level', filters.level);
    if (filters?.code) params.append('code', filters.code);

    const { data } = await api.get<ValidationResponse[]>('/validations', { params });
    return data.map(mapValidationResponse);
  },

  async getById(id: number): Promise<Validation> {
    const { data } = await api.get<ValidationResponse>(`/validations/${id}`);
    return mapValidationResponse(data);
  },
};

