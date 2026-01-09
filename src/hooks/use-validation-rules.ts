'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  validationRulesService,
  type CreateValidationRulePayload,
  type UpdateValidationRulePayload,
  type ValidationRuleFilters,
} from '@/services/validation-rules';
import { toast } from 'sonner';

const QUERY_KEY = ['validation-rules'];

export function useValidationRules(filters?: ValidationRuleFilters) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => validationRulesService.getAll(filters),
  });
}

export function useValidationRule(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => validationRulesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateValidationRulePayload) =>
      validationRulesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Regra criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar regra: ${error.message}`);
    },
  });
}

export function useUpdateValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateValidationRulePayload;
    }) => validationRulesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Regra atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar regra: ${error.message}`);
    },
  });
}

export function useDeleteValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => validationRulesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Regra excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir regra: ${error.message}`);
    },
  });
}

export function useToggleValidationRuleActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      validationRulesService.update(id, { active }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(variables.active ? 'Regra ativada' : 'Regra desativada');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao alterar status: ${error.message}`);
    },
  });
}
