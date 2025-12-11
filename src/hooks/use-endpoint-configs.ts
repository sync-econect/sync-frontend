'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  endpointConfigsService,
  type CreateEndpointConfigPayload,
  type UpdateEndpointConfigPayload,
} from '@/services/endpoint-configs';
import { toast } from 'sonner';

const QUERY_KEY = ['endpoint-configs'];

export function useEndpointConfigs() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => endpointConfigsService.getAll(),
  });
}

export function useEndpointConfig(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => endpointConfigsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEndpointConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEndpointConfigPayload) =>
      endpointConfigsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Endpoint criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar endpoint: ${error.message}`);
    },
  });
}

export function useUpdateEndpointConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateEndpointConfigPayload;
    }) => endpointConfigsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Endpoint atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar endpoint: ${error.message}`);
    },
  });
}

export function useDeleteEndpointConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => endpointConfigsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Endpoint excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir endpoint: ${error.message}`);
    },
  });
}

export function useToggleEndpointConfigActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      endpointConfigsService.update(id, { active }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(variables.active ? 'Endpoint ativado' : 'Endpoint desativado');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao alterar status: ${error.message}`);
    },
  });
}

