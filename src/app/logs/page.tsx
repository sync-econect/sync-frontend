'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { JsonViewer } from '@/components/json-viewer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Filter, X, ArrowUpDown, User, Globe } from 'lucide-react';
import { useAuditLogs } from '@/hooks/use-audit';
import type { AuditLog, AuditAction } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const actionLabels: Record<AuditAction, { label: string; className: string }> =
  {
    CREATE: {
      label: 'Criar',
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    },
    UPDATE: {
      label: 'Atualizar',
      className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    },
    DELETE: {
      label: 'Excluir',
      className: 'bg-red-500/10 text-red-600 border-red-500/20',
    },
    SEND: {
      label: 'Enviar',
      className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    },
  };

const getActionLabel = (
  action: string
): { label: string; className: string } => {
  return (
    actionLabels[action as AuditAction] || {
      label: action,
      className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    }
  );
};

function LogsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'auditoria';

  const [selectedAudit, setSelectedAudit] = useState<AuditLog | null>(null);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);

  // Audit filters
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState('');

  // API filters
  const apiFilters = useMemo(
    () => ({
      entity: entityFilter !== 'all' ? entityFilter : undefined,
      action: actionFilter !== 'all' ? actionFilter : undefined,
    }),
    [entityFilter, actionFilter]
  );

  const {
    data: auditData,
    isLoading: isAuditLoading,
    isError: isAuditError,
  } = useAuditLogs(apiFilters);

  const auditLogs = auditData?.data || [];

  // Filter by user locally (since API might not support text search)
  const filteredAuditLogs = useMemo(() => {
    if (!userFilter) return auditLogs;
    return auditLogs.filter((log) =>
      log.user?.toLowerCase().includes(userFilter.toLowerCase())
    );
  }, [auditLogs, userFilter]);

  const handleViewAudit = (audit: AuditLog) => {
    setSelectedAudit(audit);
    setIsAuditDialogOpen(true);
  };

  const clearAuditFilters = () => {
    setEntityFilter('all');
    setActionFilter('all');
    setUserFilter('');
  };

  const hasAuditFilters =
    entityFilter !== 'all' || actionFilter !== 'all' || userFilter;

  // Get unique entities from the audit logs
  const uniqueEntities = useMemo(() => {
    return [...new Set(auditLogs.map((l) => l.entity))];
  }, [auditLogs]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Logs do Sistema"
        description="Visualize logs de comunicação e auditoria"
      />

      <div className="p-4 sm:p-6">
        <Tabs defaultValue={initialTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="comunicacao" className="text-xs sm:text-sm">
              Comunicação e-Sfinge
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="text-xs sm:text-sm">
              Auditoria
            </TabsTrigger>
          </TabsList>

          {/* Communication Logs Tab */}
          <TabsContent value="comunicacao" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Comunicação</CardTitle>
                <CardDescription>
                  Visualize os logs de comunicação acessando os detalhes de cada
                  remessa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm sm:text-base">
                    Os logs de comunicação estão disponíveis nos detalhes de
                    cada remessa.
                  </p>
                  <p className="text-xs sm:text-sm mt-1">
                    Acesse a página de Remessas para visualizá-los.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="auditoria" className="space-y-4 sm:space-y-6">
            {/* Filters */}
            <Card className="gap-0">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Filtros</CardTitle>
                  </div>
                  {hasAuditFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAuditFilters}
                    >
                      <X className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Limpar</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Entidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as entidades</SelectItem>
                      {uniqueEntities.map((entity) => (
                        <SelectItem key={entity} value={entity}>
                          {entity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Ação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as ações</SelectItem>
                      {Object.entries(actionLabels).map(
                        ([value, { label }]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Usuário"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="w-full sm:w-[200px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audit Table/Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Logs de Auditoria</CardTitle>
                <CardDescription>
                  {auditData?.total || 0} registro(s) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isAuditLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : isAuditError ? (
                  <div className="text-center py-8 text-destructive">
                    <p>Erro ao carregar logs. Tente novamente.</p>
                  </div>
                ) : filteredAuditLogs.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                    <FileText className="h-8 w-8" />
                    <p>Nenhum registro encontrado</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data/Hora</TableHead>
                            <TableHead>Entidade</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Ação</TableHead>
                            <TableHead>Usuário</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead className="text-right">
                              Detalhes
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAuditLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="whitespace-nowrap">
                                {format(
                                  new Date(log.createdAt),
                                  'dd/MM/yyyy HH:mm',
                                  {
                                    locale: ptBR,
                                  }
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{log.entity}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {log.entityId}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    getActionLabel(log.action).className
                                  }
                                >
                                  {getActionLabel(log.action).label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  {log.user || 'Sistema'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Globe className="h-3 w-3" />
                                  {log.ip || '—'}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewAudit(log)}
                                >
                                  <ArrowUpDown className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {filteredAuditLogs.map((log) => (
                        <Card
                          key={log.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleViewAudit(log)}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">{log.entity}</Badge>
                                <Badge
                                  variant="outline"
                                  className={
                                    getActionLabel(log.action).className
                                  }
                                >
                                  {getActionLabel(log.action).label}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {format(
                                  new Date(log.createdAt),
                                  'dd/MM HH:mm',
                                  { locale: ptBR }
                                )}
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              <p className="font-mono text-muted-foreground">
                                ID: {log.entityId}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {log.user || 'Sistema'}
                                </span>
                                {log.ip && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {log.ip}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Audit Details Dialog */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg lg:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Alteração</DialogTitle>
          </DialogHeader>
          {selectedAudit && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Entidade</p>
                  <p className="font-medium">{selectedAudit.entity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ação</p>
                  <Badge
                    variant="outline"
                    className={getActionLabel(selectedAudit.action).className}
                  >
                    {getActionLabel(selectedAudit.action).label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Usuário</p>
                  <p className="font-medium">
                    {selectedAudit.user || 'Sistema'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {selectedAudit.oldValue && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Valor Anterior</p>
                    <JsonViewer data={selectedAudit.oldValue} />
                  </div>
                )}
                {selectedAudit.newValue && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Novo Valor</p>
                    <JsonViewer
                      data={selectedAudit.newValue as Record<string, unknown>}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default function LogsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <PageHeader
            title="Logs do Sistema"
            description="Visualize logs de comunicação e auditoria"
          />
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <LogsContent />
    </Suspense>
  );
}
