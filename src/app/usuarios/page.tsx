'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldX,
  UserCog,
  Loader2,
  Search,
  Unlock,
} from 'lucide-react';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUnlockUser,
} from '@/hooks/use-users';
import {
  useUserPermissionsByUser,
  useCreateUserPermission,
  useUpdateUserPermission,
  useDeleteUserPermission,
  useDeleteAllUserPermissions,
} from '@/hooks/use-user-permissions';
import { useUnits } from '@/hooks/use-units';
import type { User, UserRole, ModuleType, UserPermission } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  OPERATOR: 'Operador',
  VIEWER: 'Visualizador',
};

const roleColors: Record<UserRole, string> = {
  ADMIN: 'bg-red-500/10 text-red-600 border-red-500/20',
  MANAGER: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  OPERATOR: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  VIEWER: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

const moduleLabels: Record<ModuleType, string> = {
  CONTRATO: 'Contrato',
  COMPRA_DIRETA: 'Compra Direta',
  EMPENHO: 'Empenho',
  LIQUIDACAO: 'Liquidação',
  PAGAMENTO: 'Pagamento',
  EXECUCAO_ORCAMENTARIA: 'Execução Orçamentária',
  CONVENIO: 'Convênio',
  LICITACAO: 'Licitação',
  PPA: 'PPA',
  LDO: 'LDO',
  LOA: 'LOA',
  ALTERACAO_ORCAMENTARIA: 'Alteração Orçamentária',
};

const allModules = Object.keys(moduleLabels) as ModuleType[];

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
}

const defaultUserForm: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'OPERATOR',
  active: true,
};

interface PermissionFormData {
  unitId: string;
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canTransmit: boolean;
}

const defaultPermissionForm: PermissionFormData = {
  unitId: 'all',
  module: 'all',
  canView: true,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canTransmit: false,
};

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserFormData>(defaultUserForm);
  const [permissionForm, setPermissionForm] = useState<PermissionFormData>(
    defaultPermissionForm
  );
  const [editingPermission, setEditingPermission] =
    useState<UserPermission | null>(null);

  // Queries
  const { data: users = [], isLoading, isError } = useUsers();
  const { data: units = [] } = useUnits();
  const { data: userPermissions = [], isLoading: isLoadingPermissions } =
    useUserPermissionsByUser(selectedUser ? parseInt(selectedUser.id) : 0);

  // Mutations
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const unlockUser = useUnlockUser();
  const createPermission = useCreateUserPermission();
  const updatePermission = useUpdateUserPermission();
  const deletePermission = useDeleteUserPermission();
  const deleteAllPermissions = useDeleteAllUserPermissions();

  // Filtrar usuários
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // Handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      active: user.active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createUser.mutateAsync({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        active: userForm.active,
      });
      setIsCreateDialogOpen(false);
      setUserForm(defaultUserForm);
    } catch {
      // Error handled in hook
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser.mutateAsync({
        id: parseInt(selectedUser.id),
        data: {
          name: userForm.name || undefined,
          email: userForm.email || undefined,
          password: userForm.password || undefined,
          role: userForm.role,
          active: userForm.active,
        },
      });
      setIsEditDialogOpen(false);
      setUserForm(defaultUserForm);
      setSelectedUser(null);
    } catch {
      // Error handled in hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser.mutateAsync(parseInt(selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch {
      // Error handled in hook
    }
  };

  const handleUnlockUser = async (user: User) => {
    try {
      await unlockUser.mutateAsync(parseInt(user.id));
    } catch {
      // Error handled in hook
    }
  };

  const handleAddPermission = async () => {
    if (!selectedUser) return;

    try {
      await createPermission.mutateAsync({
        userId: parseInt(selectedUser.id),
        unitId:
          permissionForm.unitId === 'all'
            ? null
            : parseInt(permissionForm.unitId),
        module:
          permissionForm.module === 'all'
            ? null
            : (permissionForm.module as ModuleType),
        canView: permissionForm.canView,
        canCreate: permissionForm.canCreate,
        canEdit: permissionForm.canEdit,
        canDelete: permissionForm.canDelete,
        canTransmit: permissionForm.canTransmit,
      });
      setIsPermissionDialogOpen(false);
      setPermissionForm(defaultPermissionForm);
      setEditingPermission(null);
    } catch {
      // Error handled in hook
    }
  };

  const handleUpdatePermission = async () => {
    if (!editingPermission) return;

    try {
      await updatePermission.mutateAsync({
        id: parseInt(editingPermission.id),
        data: {
          unitId:
            permissionForm.unitId === 'all'
              ? null
              : parseInt(permissionForm.unitId),
          module:
            permissionForm.module === 'all'
              ? null
              : (permissionForm.module as ModuleType),
          canView: permissionForm.canView,
          canCreate: permissionForm.canCreate,
          canEdit: permissionForm.canEdit,
          canDelete: permissionForm.canDelete,
          canTransmit: permissionForm.canTransmit,
        },
      });
      setIsPermissionDialogOpen(false);
      setPermissionForm(defaultPermissionForm);
      setEditingPermission(null);
    } catch {
      // Error handled in hook
    }
  };

  const handleEditPermission = (permission: UserPermission) => {
    setEditingPermission(permission);
    setPermissionForm({
      unitId: permission.unitId ?? 'all',
      module: permission.module ?? 'all',
      canView: permission.canView,
      canCreate: permission.canCreate,
      canEdit: permission.canEdit,
      canDelete: permission.canDelete,
      canTransmit: permission.canTransmit,
    });
    setIsPermissionDialogOpen(true);
  };

  const handleDeletePermission = async (permission: UserPermission) => {
    try {
      await deletePermission.mutateAsync(parseInt(permission.id));
    } catch {
      // Error handled in hook
    }
  };

  const handleDeleteAllPermissions = async () => {
    if (!selectedUser) return;
    try {
      await deleteAllPermissions.mutateAsync(parseInt(selectedUser.id));
    } catch {
      // Error handled in hook
    }
  };

  const openNewPermissionDialog = () => {
    setEditingPermission(null);
    setPermissionForm(defaultPermissionForm);
    setIsPermissionDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Gestão de Usuários"
        description="Gerencie usuários e suas permissões de acesso"
      />

      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Search and Actions */}
        <Card className="gap-0">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Usuários</CardTitle>
            </div>
            <CardDescription>
              {filteredUsers.length} usuário(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-destructive">
                <p>Erro ao carregar usuários. Tente novamente.</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <Users className="h-8 w-8" />
                <p>Nenhum usuário encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={roleColors[user.role]}
                          >
                            {roleLabels[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lockedUntil &&
                          new Date(user.lockedUntil) > new Date() ? (
                            <Badge
                              variant="outline"
                              className="bg-red-500/10 text-red-600"
                            >
                              Bloqueado
                            </Badge>
                          ) : user.active ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600"
                            >
                              Ativo
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-500/10 text-gray-600"
                            >
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.lastLogin
                            ? format(
                                new Date(user.lastLogin),
                                "dd/MM/yyyy 'às' HH:mm",
                                { locale: ptBR }
                              )
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              {user.lockedUntil &&
                                new Date(user.lockedUntil) > new Date() && (
                                  <DropdownMenuItem
                                    onClick={() => handleUnlockUser(user)}
                                  >
                                    <Unlock className="h-4 w-4" />
                                    Desbloquear
                                  </DropdownMenuItem>
                                )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Perfil</Label>
              <Select
                value={userForm.role}
                onValueChange={(value) =>
                  setUserForm({ ...userForm, role: value as UserRole })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="active"
                checked={userForm.active}
                onCheckedChange={(checked) =>
                  setUserForm({ ...userForm, active: checked as boolean })
                }
              />
              <Label htmlFor="active">Usuário ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={createUser.isPending}>
              {createUser.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize os dados do usuário</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">
                Nova Senha (deixe em branco para não alterar)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Perfil</Label>
              <Select
                value={userForm.role}
                onValueChange={(value) =>
                  setUserForm({ ...userForm, role: value as UserRole })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-active"
                checked={userForm.active}
                onCheckedChange={(checked) =>
                  setUserForm({ ...userForm, active: checked as boolean })
                }
              />
              <Label htmlFor="edit-active">Usuário ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} disabled={updateUser.isPending}>
              {updateUser.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário{' '}
              <strong>{selectedUser?.name}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl lg:max-w-2xl overflow-hidden flex flex-col">
          <SheetHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <SheetTitle className="text-lg sm:text-xl">
                  {selectedUser?.name}
                </SheetTitle>
                <SheetDescription>{selectedUser?.email}</SheetDescription>
              </div>
              {selectedUser && (
                <Badge
                  variant="outline"
                  className={roleColors[selectedUser.role]}
                >
                  {roleLabels[selectedUser.role]}
                </Badge>
              )}
            </div>
          </SheetHeader>

          <Tabs defaultValue="info" className="flex-1 flex flex-col mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">
                <UserCog className="h-4 w-4 mr-2" />
                Informações
              </TabsTrigger>
              <TabsTrigger value="permissions">
                <Shield className="h-4 w-4 mr-2" />
                Permissões
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="info" className="m-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">
                      {selectedUser?.active ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Criado em</p>
                    <p className="font-medium">
                      {selectedUser?.createdAt &&
                        format(
                          new Date(selectedUser.createdAt),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Último Acesso
                    </p>
                    <p className="font-medium">
                      {selectedUser?.lastLogin
                        ? format(
                            new Date(selectedUser.lastLogin),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )
                        : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Última Atividade
                    </p>
                    <p className="font-medium">
                      {selectedUser?.lastActivity
                        ? format(
                            new Date(selectedUser.lastActivity),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )
                        : '—'}
                    </p>
                  </div>
                </div>

                {selectedUser?.lockedUntil &&
                  new Date(selectedUser.lockedUntil) > new Date() && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm font-medium text-destructive">
                        Conta Bloqueada
                      </p>
                      <p className="text-sm mt-1">
                        Bloqueado até{' '}
                        {format(
                          new Date(selectedUser.lockedUntil),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          selectedUser && handleUnlockUser(selectedUser)
                        }
                      >
                        <Unlock className="h-4 w-4" />
                        Desbloquear
                      </Button>
                    </div>
                  )}
              </TabsContent>

              <TabsContent value="permissions" className="m-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedUser?.role === 'ADMIN'
                      ? 'Administradores têm acesso total a todas as funcionalidades.'
                      : `${userPermissions.length} permissão(ões) configurada(s)`}
                  </p>
                  {selectedUser?.role !== 'ADMIN' && (
                    <div className="flex gap-2">
                      {userPermissions.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={handleDeleteAllPermissions}
                        >
                          <Trash2 className="h-4 w-4" />
                          Limpar
                        </Button>
                      )}
                      <Button size="sm" onClick={openNewPermissionDialog}>
                        <Plus className="h-4 w-4" />
                        Adicionar
                      </Button>
                    </div>
                  )}
                </div>

                {selectedUser?.role === 'ADMIN' ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                    <ShieldCheck className="h-12 w-12 text-emerald-500" />
                    <p className="text-center">
                      Usuários administradores possuem acesso irrestrito.
                    </p>
                  </div>
                ) : isLoadingPermissions ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : userPermissions.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                    <ShieldX className="h-8 w-8" />
                    <p>Nenhuma permissão configurada</p>
                    <p className="text-xs">
                      Adicione permissões para definir o acesso do usuário
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userPermissions.map((permission) => (
                      <Card key={permission.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">
                                  {permission.unitId
                                    ? permission.unit?.name ??
                                      `UG ${permission.unitId}`
                                    : 'Todas as UGs'}
                                </Badge>
                                <Badge variant="outline">
                                  {permission.module
                                    ? moduleLabels[
                                        permission.module as ModuleType
                                      ]
                                    : 'Todos os Módulos'}
                                </Badge>
                              </div>
                              <div className="flex gap-2 flex-wrap mt-2">
                                {permission.canView && (
                                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                    Ver
                                  </Badge>
                                )}
                                {permission.canCreate && (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                    Criar
                                  </Badge>
                                )}
                                {permission.canEdit && (
                                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                    Editar
                                  </Badge>
                                )}
                                {permission.canDelete && (
                                  <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                                    Excluir
                                  </Badge>
                                )}
                                {permission.canTransmit && (
                                  <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                                    Transmitir
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleEditPermission(permission)
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeletePermission(permission)
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Permission Dialog */}
      <Dialog
        open={isPermissionDialogOpen}
        onOpenChange={setIsPermissionDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPermission ? 'Editar Permissão' : 'Nova Permissão'}
            </DialogTitle>
            <DialogDescription>
              Configure as permissões de acesso para o usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Unidade Gestora</Label>
              <Select
                value={permissionForm.unitId}
                onValueChange={(value) =>
                  setPermissionForm({ ...permissionForm, unitId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a UG" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as UGs</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.code} - {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Módulo</Label>
              <Select
                value={permissionForm.module}
                onValueChange={(value) =>
                  setPermissionForm({ ...permissionForm, module: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Módulos</SelectItem>
                  {allModules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {moduleLabels[module]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Ações Permitidas</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="canView"
                    checked={permissionForm.canView}
                    onCheckedChange={(checked) =>
                      setPermissionForm({
                        ...permissionForm,
                        canView: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="canView" className="text-sm">
                    Visualizar
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="canCreate"
                    checked={permissionForm.canCreate}
                    onCheckedChange={(checked) =>
                      setPermissionForm({
                        ...permissionForm,
                        canCreate: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="canCreate" className="text-sm">
                    Criar
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="canEdit"
                    checked={permissionForm.canEdit}
                    onCheckedChange={(checked) =>
                      setPermissionForm({
                        ...permissionForm,
                        canEdit: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="canEdit" className="text-sm">
                    Editar
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="canDelete"
                    checked={permissionForm.canDelete}
                    onCheckedChange={(checked) =>
                      setPermissionForm({
                        ...permissionForm,
                        canDelete: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="canDelete" className="text-sm">
                    Excluir
                  </Label>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Checkbox
                    id="canTransmit"
                    checked={permissionForm.canTransmit}
                    onCheckedChange={(checked) =>
                      setPermissionForm({
                        ...permissionForm,
                        canTransmit: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="canTransmit" className="text-sm">
                    Transmitir para TCE/MS
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPermissionDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={
                editingPermission ? handleUpdatePermission : handleAddPermission
              }
              disabled={
                createPermission.isPending || updatePermission.isPending
              }
            >
              {(createPermission.isPending || updatePermission.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {editingPermission ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
