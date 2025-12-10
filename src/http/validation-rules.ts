import { api } from '@/lib/axios';
import type { ValidationRule, ModuleType, ValidationOperator, ValidationLevel } from '@/types';

export interface CreateValidationRuleInput {
  module: ModuleType;
  field: string;
  operator: ValidationOperator;
  value: string;
  level: ValidationLevel;
  code: string;
  message: string;
  active?: boolean;
}

export interface UpdateValidationRuleInput extends Partial<CreateValidationRuleInput> {}

// Backend retorna id como number
interface ApiValidationRule extends Omit<ValidationRule, 'id'> {
  id: number;
}

const transformRule = (rule: ApiValidationRule): ValidationRule => ({
  ...rule,
  id: String(rule.id),
});

export const validationRulesApi = {
  async getAll(module?: string): Promise<ValidationRule[]> {
    const params = module ? { module } : {};
    const { data } = await api.get<ApiValidationRule[]>('/validation-rules', { params });
    return data.map(transformRule);
  },

  async getById(id: string): Promise<ValidationRule> {
    const { data } = await api.get<ApiValidationRule>(`/validation-rules/${id}`);
    return transformRule(data);
  },

  async create(input: CreateValidationRuleInput): Promise<ValidationRule> {
    const { data } = await api.post<ApiValidationRule>('/validation-rules', input);
    return transformRule(data);
  },

  async update(id: string, input: UpdateValidationRuleInput): Promise<ValidationRule> {
    const { data } = await api.patch<ApiValidationRule>(`/validation-rules/${id}`, input);
    return transformRule(data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/validation-rules/${id}`);
  },
};

