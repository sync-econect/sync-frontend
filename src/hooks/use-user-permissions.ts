import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  userPermissionsService,
  UserPermissionFilters,
} from '@/services/user-permissions';
import type {
  CreateUserPermissionRequest,
  UpdateUserPermissionRequest,
  PermissionAction,
} from '@/types';
import { toast } from 'sonner';

export function useUserPermissions(filters?: UserPermissionFilters) {
  return useQuery({
    queryKey: ['user-permissions', filters],
    queryFn: () => userPermissionsService.getAll(filters),
  });
}

export function useUserPermissionsByUser(userId: number) {
  return useQuery({
    queryKey: ['user-permissions', 'user', userId],
    queryFn: () => userPermissionsService.getByUser(userId),
    enabled: !!userId,
  });
}

export function useUserPermission(id: number) {
  return useQuery({
    queryKey: ['user-permissions', id],
    queryFn: () => userPermissionsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUserPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPermissionRequest) =>
      userPermissionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success('Permissão criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar permissão: ${error.message}`);
    },
  });
}

export function useCreateBulkUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      permissions,
    }: {
      userId: number;
      permissions: Omit<CreateUserPermissionRequest, 'userId'>[];
    }) => userPermissionsService.createBulk(userId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success('Permissões criadas com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar permissões: ${error.message}`);
    },
  });
}

export function useUpdateUserPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateUserPermissionRequest;
    }) => userPermissionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success('Permissão atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar permissão: ${error.message}`);
    },
  });
}

export function useDeleteUserPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userPermissionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success('Permissão removida com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover permissão: ${error.message}`);
    },
  });
}

export function useDeleteAllUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) =>
      userPermissionsService.deleteAllByUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success('Todas as permissões foram removidas');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover permissões: ${error.message}`);
    },
  });
}

export function useCheckPermission(params: {
  userId: number;
  action: PermissionAction;
  unitId?: number;
  module?: string;
}) {
  return useQuery({
    queryKey: ['user-permissions', 'check', params],
    queryFn: () => userPermissionsService.checkPermission(params),
    enabled: !!params.userId && !!params.action,
  });
}

export function usePermittedUnits(userId: number, action: PermissionAction) {
  return useQuery({
    queryKey: ['user-permissions', 'permitted-units', userId, action],
    queryFn: () => userPermissionsService.getPermittedUnits(userId, action),
    enabled: !!userId && !!action,
  });
}

export function usePermittedModules(
  userId: number,
  action: PermissionAction,
  unitId?: number
) {
  return useQuery({
    queryKey: ['user-permissions', 'permitted-modules', userId, action, unitId],
    queryFn: () =>
      userPermissionsService.getPermittedModules(userId, action, unitId),
    enabled: !!userId && !!action,
  });
}

