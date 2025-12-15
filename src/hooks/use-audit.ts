'use client';

import { useQuery } from '@tanstack/react-query';
import { auditService, type AuditFilters } from '@/services/audit';

const QUERY_KEY = ['audit'];

export function useAuditLogs(filters?: AuditFilters) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => auditService.getAll(filters),
  });
}

export function useAuditLog(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => auditService.getById(id),
    enabled: !!id,
  });
}
