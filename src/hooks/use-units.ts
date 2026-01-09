'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  unitsService,
  type CreateUnitPayload,
  type UpdateUnitPayload,
} from '@/services/units';
import { toast } from 'sonner';

const QUERY_KEY = ['units'];

export function useUnits() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => unitsService.getAll(),
  });
}

export function useUnit(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => unitsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUnitPayload) => unitsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Unidade criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar unidade: ${error.message}`);
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUnitPayload }) =>
      unitsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Unidade atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar unidade: ${error.message}`);
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => unitsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Unidade excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir unidade: ${error.message}`);
    },
  });
}

export function useToggleUnitActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      unitsService.update(id, { active }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(
        variables.active ? 'Unidade ativada' : 'Unidade desativada'
      );
    },
    onError: (error: Error) => {
      toast.error(`Erro ao alterar status: ${error.message}`);
    },
  });
}
