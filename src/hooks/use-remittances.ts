'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  remittancesService,
  type CreateRemittancePayload,
  type CancelRemittancePayload,
  type RemittanceFilters,
} from '@/services/remittances';
import { toast } from 'sonner';

const QUERY_KEY = ['remittances'];
const STATS_QUERY_KEY = ['remittances', 'stats'];

export function useRemittances(filters?: RemittanceFilters) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => remittancesService.getAll(filters),
  });
}

export function useRemittance(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => remittancesService.getById(id),
    enabled: !!id,
  });
}

export function useRemittanceStats() {
  return useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: () => remittancesService.getStats(),
  });
}

export function useRemittanceLogs(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, 'logs'],
    queryFn: () => remittancesService.getLogs(id),
    enabled: !!id,
  });
}

export function useCreateRemittance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRemittancePayload) =>
      remittancesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      toast.success('Remessa criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar remessa: ${error.response?.data?.message}`);
    },
  });
}

export function useSendRemittance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => remittancesService.send(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      if (data.success) {
        toast.success(`Remessa enviada! Protocolo: ${data.protocol}`);
      } else {
        toast.error(`Falha ao enviar: ${data.message}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao enviar remessa: ${error.message}`);
    },
  });
}

export function useCancelRemittance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: CancelRemittancePayload) =>
      remittancesService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      toast.warning('Remessa cancelada');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || 'Erro desconhecido';
      toast.error(`Erro ao cancelar remessa: ${message}`);
    },
  });
}

export function useRetryRemittance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => remittancesService.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      toast.info('Remessa marcada para reenvio');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao reenviar remessa: ${error.message}`);
    },
  });
}

export function useSendRemittanceBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => remittancesService.sendBatch(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });

      if (data.failed === 0) {
        toast.success(`${data.successful} remessa(s) enviada(s) com sucesso!`);
      } else if (data.successful === 0) {
        toast.error(`Falha ao enviar ${data.failed} remessa(s)`);
      } else {
        toast.warning(
          `${data.successful} enviada(s) com sucesso, ${data.failed} falha(s)`
        );
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao enviar remessas em lote: ${error.message}`);
    },
  });
}
