import { api } from '@/lib/axios';
import type {
  ValidationRule,
  ModuleType,
  ValidationOperator,
  ValidationLevel,
} from '@/types';

// Tipos para o backend (IDs numéricos)
export interface ValidationRuleResponse {
  id: number;
  module: ModuleType;
  field: string;
  operator: ValidationOperator;
  value: string;
  level: ValidationLevel;
  code: string;
  message: string;
  active: boolean;
  createdAt: string;
}

export interface CreateValidationRulePayload {
  module: ModuleType;
  field: string;
  operator: ValidationOperator;
  value: string;
  level: ValidationLevel;
  code: string;
  message: string;
  active?: boolean;
}

export interface UpdateValidationRulePayload
  extends Partial<CreateValidationRulePayload> {}

export interface ValidationRuleFilters {
  module?: string;
}

// Mapeia resposta do backend para o tipo do frontend
const mapValidationRuleResponse = (
  rule: ValidationRuleResponse
): ValidationRule => ({
  ...rule,
  id: String(rule.id),
});

export const validationRulesService = {
  async getAll(filters?: ValidationRuleFilters): Promise<ValidationRule[]> {
    const params = new URLSearchParams();
    if (filters?.module) params.append('module', filters.module);

    const { data } = await api.get<ValidationRuleResponse[]>(
      '/validation-rules',
      { params }
    );
    return data.map(mapValidationRuleResponse);
  },

  async getById(id: number): Promise<ValidationRule> {
    const { data } = await api.get<ValidationRuleResponse>(
      `/validation-rules/${id}`
    );
    return mapValidationRuleResponse(data);
  },

  async create(payload: CreateValidationRulePayload): Promise<ValidationRule> {
    const { data } = await api.post<ValidationRuleResponse>(
      '/validation-rules',
      payload
    );
    return mapValidationRuleResponse(data);
  },

  async update(
    id: number,
    payload: UpdateValidationRulePayload
  ): Promise<ValidationRule> {
    const { data } = await api.patch<ValidationRuleResponse>(
      `/validation-rules/${id}`,
      payload
    );
    return mapValidationRuleResponse(data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/validation-rules/${id}`);
  },
};
