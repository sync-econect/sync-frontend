'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  rawDataService,
  type CreateRawDataPayload,
  type UpdateRawDataPayload,
  type RawDataFilters,
} from '@/services/raw-data';
import { toast } from 'sonner';

const QUERY_KEY = ['raw-data'];

export function useRawData(filters?: RawDataFilters) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => rawDataService.getAll(filters),
  });
}

export function useRawDataById(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => rawDataService.getById(id),
    enabled: !!id,
  });
}

export function useRawDataByModule(module: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'module', module],
    queryFn: () => rawDataService.getByModule(module),
    enabled: !!module,
  });
}

export function useCreateRawData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRawDataPayload) =>
      rawDataService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Dados criados com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar dados: ${error.message}`);
    },
  });
}

export function useUpdateRawData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateRawDataPayload;
    }) => rawDataService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Dados atualizados com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar dados: ${error.message}`);
    },
  });
}

export function useDeleteRawData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rawDataService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Dados excluídos com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir dados: ${error.message}`);
    },
  });
}
