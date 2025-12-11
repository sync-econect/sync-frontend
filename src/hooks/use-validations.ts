'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  validationsService,
  type ValidationFilters,
} from '@/services/validations';
import { toast } from 'sonner';

const QUERY_KEY = ['validations'];
const RAW_DATA_QUERY_KEY = ['raw-data'];

export function useValidations(filters?: ValidationFilters) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => validationsService.getAll(filters),
  });
}

export function useValidationsByRawData(rawDataId: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'raw-data', rawDataId],
    queryFn: () => validationsService.getByRawData(rawDataId),
    enabled: !!rawDataId,
  });
}

export function useValidation(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => validationsService.getById(id),
    enabled: !!id,
  });
}

export function useValidateRawData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rawDataId: number) => validationsService.validateRawData(rawDataId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RAW_DATA_QUERY_KEY });

      if (data.hasBlockingErrors) {
        toast.error(
          `Validação encontrou ${data.summary.impeditivas} erro(s) impeditivo(s) e ${data.summary.alertas} alerta(s)`
        );
      } else if (data.summary.alertas > 0) {
        toast.warning(`Validação concluída com ${data.summary.alertas} alerta(s)`);
      } else {
        toast.success('Validação concluída sem erros!');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao validar: ${error.message}`);
    },
  });
}

export function useRevalidateRawData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rawDataId: number) => validationsService.revalidateRawData(rawDataId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RAW_DATA_QUERY_KEY });

      if (data.hasBlockingErrors) {
        toast.error(
          `Revalidação encontrou ${data.summary.impeditivas} erro(s) impeditivo(s) e ${data.summary.alertas} alerta(s)`
        );
      } else if (data.summary.alertas > 0) {
        toast.warning(`Revalidação concluída com ${data.summary.alertas} alerta(s)`);
      } else {
        toast.success('Revalidação concluída sem erros!');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao revalidar: ${error.message}`);
    },
  });
}

export function useClearValidations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rawDataId: number) => validationsService.clearValidations(rawDataId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(`${data.count} validação(ões) removida(s)`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao limpar validações: ${error.message}`);
    },
  });
}

