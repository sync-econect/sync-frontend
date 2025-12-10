'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { JsonViewer } from '@/components/json-viewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  FileText,
  Filter,
  X,
  ArrowUpDown,
  Clock,
  User,
  Globe,
} from 'lucide-react';
import { mockRemittanceLogs, mockAuditLogs } from '@/lib/mock-data';
import type { RemittanceLog, AuditLog, AuditAction } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const actionLabels: Record<AuditAction, { label: string; className: string }> = {
  CREATE: { label: 'Criar', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  UPDATE: { label: 'Atualizar', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  DELETE: { label: 'Excluir', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
  SEND: { label: 'Enviar', className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
};

export default function LogsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'comunicacao';

  const [selectedLog, setSelectedLog] = useState<RemittanceLog | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<AuditLog | null>(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);

  // Communication filters
  const [remittanceIdFilter, setRemittanceIdFilter] = useState('');
  const [statusCodeFilter, setStatusCodeFilter] = useState<string>('all');

  // Audit filters
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState('');

  const filteredLogs = mockRemittanceLogs.filter((log) => {
    if (remittanceIdFilter && log.remittanceId !== remittanceIdFilter) return false;
    if (statusCodeFilter !== 'all') {
      if (statusCodeFilter === '2xx' && (log.statusCode === undefined || log.statusCode < 200 || log.statusCode >= 300)) return false;
      if (statusCodeFilter === '4xx' && (log.statusCode === undefined || log.statusCode < 400 || log.statusCode >= 500)) return false;
      if (statusCodeFilter === '5xx' && (log.statusCode === undefined || log.statusCode < 500)) return false;
    }
    return true;
  });

  const filteredAuditLogs = mockAuditLogs.filter((log) => {
    if (entityFilter !== 'all' && log.entity !== entityFilter) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (userFilter && !log.user?.toLowerCase().includes(userFilter.toLowerCase())) return false;
    return true;
  });

  const handleViewLog = (log: RemittanceLog) => {
    setSelectedLog(log);
    setIsLogDialogOpen(true);
  };

  const handleViewAudit = (audit: AuditLog) => {
    setSelectedAudit(audit);
    setIsAuditDialogOpen(true);
  };

  const clearCommFilters = () => {
    setRemittanceIdFilter('');
    setStatusCodeFilter('all');
  };

  const clearAuditFilters = () => {
    setEntityFilter('all');
    setActionFilter('all');
    setUserFilter('');
  };

  const hasCommFilters = remittanceIdFilter || statusCodeFilter !== 'all';
  const hasAuditFilters = entityFilter !== 'all' || actionFilter !== 'all' || userFilter;

  const uniqueEntities = [...new Set(mockAuditLogs.map((l) => l.entity))];

  return (
    <DashboardLayout>
      <PageHeader
        title="Logs do Sistema"
        description="Visualize logs de comunicação e auditoria"
      />

      <div className="p-6">
        <Tabs defaultValue={initialTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="comunicacao">Comunicação e-Sfinge</TabsTrigger>
            <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
          </TabsList>

          {/* Communication Logs Tab */}
          <TabsContent value="comunicacao" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Filtros</CardTitle>
                  </div>
                  {hasCommFilters && (
                    <Button variant="ghost" size="sm" onClick={clearCommFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Input
                    placeholder="ID da Remessa"
                    value={remittanceIdFilter}
                    onChange={(e) => setRemittanceIdFilter(e.target.value)}
                    className="w-[180px]"
                  />
                  <Select value={statusCodeFilter} onValueChange={setStatusCodeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status Code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="2xx">2xx (Sucesso)</SelectItem>
                      <SelectItem value="4xx">4xx (Cliente)</SelectItem>
                      <SelectItem value="5xx">5xx (Servidor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Logs Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Logs de Comunicação</CardTitle>
                <CardDescription>
                  {filteredLogs.length} log(s) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p>Nenhum log encontrado</p>
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => handleViewLog(log)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={
                                log.direction === 'REQUEST'
                                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                  : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                              }
                            >
                              {log.direction}
                            </Badge>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {log.method} {log.url}
                            </code>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {log.statusCode && (
                              <Badge
                                variant="outline"
                                className={
                                  log.statusCode >= 200 && log.statusCode < 300
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                    : log.statusCode >= 400
                                    ? 'bg-red-500/10 text-red-600 border-red-500/20'
                                    : ''
                                }
                              >
                                {log.statusCode}
                              </Badge>
                            )}
                            {log.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {log.duration}ms
                              </span>
                            )}
                            <span>
                              {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Remessa #{log.remittanceId}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="auditoria" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Filtros</CardTitle>
                  </div>
                  {hasAuditFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAuditFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger className="w-[180px]">
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
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as ações</SelectItem>
                      {Object.entries(actionLabels).map(([value, { label }]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Usuário"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="w-[200px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audit Table */}
            <Card>
              <CardHeader>
                <CardTitle>Logs de Auditoria</CardTitle>
                <CardDescription>
                  {filteredAuditLogs.length} registro(s) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead className="text-right">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <FileText className="h-8 w-8" />
                            <p>Nenhum registro encontrado</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', {
                              locale: ptBR,
                            })}
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
                              className={actionLabels[log.action].className}
                            >
                              {actionLabels[log.action].label}
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Log Details Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Direção</p>
                  <Badge
                    variant="outline"
                    className={
                      selectedLog.direction === 'REQUEST'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-purple-500/10 text-purple-600'
                    }
                  >
                    {selectedLog.direction}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status Code</p>
                  <p className="font-medium">{selectedLog.statusCode || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">URL</p>
                  <code className="text-sm">{selectedLog.url}</code>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Duração</p>
                  <p className="font-medium">
                    {selectedLog.duration ? `${selectedLog.duration}ms` : '—'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Headers</p>
                <JsonViewer data={selectedLog.headers} collapsed />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Body</p>
                <JsonViewer data={selectedLog.body} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Details Dialog */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Alteração</DialogTitle>
          </DialogHeader>
          {selectedAudit && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Entidade</p>
                  <p className="font-medium">{selectedAudit.entity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ação</p>
                  <Badge
                    variant="outline"
                    className={actionLabels[selectedAudit.action].className}
                  >
                    {actionLabels[selectedAudit.action].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Usuário</p>
                  <p className="font-medium">{selectedAudit.user || 'Sistema'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedAudit.oldValue && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Valor Anterior</p>
                    <JsonViewer data={selectedAudit.oldValue} />
                  </div>
                )}
                {selectedAudit.newValue && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Novo Valor</p>
                    <JsonViewer data={selectedAudit.newValue as Record<string, unknown>} />
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
