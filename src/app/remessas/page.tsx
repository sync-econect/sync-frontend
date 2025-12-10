'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, ValidationLevelBadge } from '@/components/status-badge';
import { JsonViewer } from '@/components/json-viewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  MoreHorizontal,
  Eye,
  Send,
  RefreshCw,
  XCircle,
  Filter,
  X,
  Plus,
  FileJson,
  Copy,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { mockRemittances, mockValidations, mockRemittanceLogs, mockRawData } from '@/lib/mock-data';
import type { Remittance, RemittanceStatus, ModuleType } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const moduleLabels: Record<ModuleType, string> = {
  CONTRATO: 'Contrato',
  COMPRA_DIRETA: 'Compra Direta',
  EMPENHO: 'Empenho',
  LIQUIDACAO: 'Liquidação',
  PAGAMENTO: 'Pagamento',
  EXECUCAO_ORCAMENTARIA: 'Execução Orçamentária',
};

const statusOptions: { value: RemittanceStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'READY', label: 'Pronta' },
  { value: 'SENDING', label: 'Enviando' },
  { value: 'SENT', label: 'Enviada' },
  { value: 'ERROR', label: 'Erro' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

export default function RemessasPage() {
  const [selectedRemittance, setSelectedRemittance] = useState<Remittance | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRawDataId, setSelectedRawDataId] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [competencyFilter, setCompetencyFilter] = useState('');

  const filteredRemittances = mockRemittances.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (moduleFilter !== 'all' && r.module !== moduleFilter) return false;
    if (competencyFilter && !r.competency.includes(competencyFilter)) return false;
    return true;
  });

  const handleViewDetails = (remittance: Remittance) => {
    setSelectedRemittance(remittance);
    setIsDrawerOpen(true);
  };

  const handleSend = (remittance: Remittance) => {
    toast.success(`Remessa ${remittance.id} enviada para o TCE!`);
  };

  const handleRetry = (remittance: Remittance) => {
    toast.info(`Reenviando remessa ${remittance.id}...`);
  };

  const handleCancel = (remittance: Remittance) => {
    toast.warning(`Remessa ${remittance.id} cancelada.`);
  };

  const handleBulkResend = () => {
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos uma remessa');
      return;
    }
    toast.info(`Reenviando ${selectedItems.length} remessa(s)...`);
    setSelectedItems([]);
  };

  const handleBulkCancel = () => {
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos uma remessa');
      return;
    }
    toast.warning(`${selectedItems.length} remessa(s) cancelada(s)`);
    setSelectedItems([]);
  };

  const handleCreateRemittance = () => {
    if (!selectedRawDataId) {
      toast.error('Selecione um dado de origem');
      return;
    }
    toast.success('Remessa criada com sucesso!');
    setIsCreateDialogOpen(false);
    setSelectedRawDataId('');
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredRemittances.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredRemittances.map((r) => r.id));
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setModuleFilter('all');
    setCompetencyFilter('');
  };

  const hasFilters = statusFilter !== 'all' || moduleFilter !== 'all' || competencyFilter !== '';

  const remittanceValidations = mockValidations.filter(
    (v) => v.rawDataId === selectedRemittance?.rawDataId
  );

  const remittanceLogs = mockRemittanceLogs.filter(
    (l) => l.remittanceId === selectedRemittance?.id
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Remessas"
        description="Gerencie todas as remessas do sistema"
      />

      <div className="space-y-6 p-6">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Filtros</CardTitle>
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os módulos</SelectItem>
                  {Object.entries(moduleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Competência"
                value={competencyFilter}
                onChange={(e) => setCompetencyFilter(e.target.value)}
                className="w-[160px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions Bar */}
        {selectedItems.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedItems.length} item(s) selecionado(s)
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleBulkResend}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reenviar selecionadas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkCancel}
                    className="text-destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar selecionadas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Remittances Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Remessas</CardTitle>
                <CardDescription>
                  {filteredRemittances.length} remessa(s) encontrada(s)
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Remessa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedItems.length === filteredRemittances.length &&
                        filteredRemittances.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRemittances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Package className="h-8 w-8" />
                        <p>Nenhuma remessa encontrada</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRemittances.map((remittance) => (
                    <TableRow key={remittance.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(remittance.id)}
                          onCheckedChange={() => toggleSelectItem(remittance.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">#{remittance.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{remittance.unit?.code}</span>
                          <span className="text-xs text-muted-foreground">
                            {remittance.unit?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{moduleLabels[remittance.module]}</TableCell>
                      <TableCell>{remittance.competency}</TableCell>
                      <TableCell>
                        <StatusBadge status={remittance.status} />
                      </TableCell>
                      <TableCell>
                        {remittance.protocol ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {remittance.protocol}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(remittance.createdAt), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(remittance)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {remittance.status === 'READY' && (
                              <DropdownMenuItem onClick={() => handleSend(remittance)}>
                                <Send className="mr-2 h-4 w-4" />
                                Enviar para TCE
                              </DropdownMenuItem>
                            )}
                            {(remittance.status === 'ERROR' || remittance.status === 'SENT') && (
                              <DropdownMenuItem onClick={() => handleRetry(remittance)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reenviar
                              </DropdownMenuItem>
                            )}
                            {['PENDING', 'READY', 'SENDING'].includes(remittance.status) && (
                              <DropdownMenuItem
                                onClick={() => handleCancel(remittance)}
                                className="text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Remessa Manualmente</DialogTitle>
            <DialogDescription>
              Selecione um dado de origem para criar uma nova remessa
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select value={selectedRawDataId} onValueChange={setSelectedRawDataId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dado de origem" />
              </SelectTrigger>
              <SelectContent>
                {mockRawData.map((data) => (
                  <SelectItem key={data.id} value={data.id}>
                    #{data.id} - {moduleLabels[data.module]} - {data.competency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRemittance}>Criar Remessa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="sm:max-w-2xl overflow-hidden flex flex-col">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl">
                  Remessa #{selectedRemittance?.id}
                </SheetTitle>
                <SheetDescription>
                  {selectedRemittance?.module &&
                    moduleLabels[selectedRemittance.module]}{' '}
                  - {selectedRemittance?.competency}
                </SheetDescription>
              </div>
              {selectedRemittance && (
                <StatusBadge status={selectedRemittance.status} />
              )}
            </div>
          </SheetHeader>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="payload">Payload</TabsTrigger>
              <TabsTrigger value="validations">Validações</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="overview" className="m-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Unidade</p>
                    <p className="font-medium">
                      {selectedRemittance?.unit?.code} -{' '}
                      {selectedRemittance?.unit?.name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Módulo</p>
                    <p className="font-medium">
                      {selectedRemittance?.module &&
                        moduleLabels[selectedRemittance.module]}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Competência</p>
                    <p className="font-medium">{selectedRemittance?.competency}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Protocolo</p>
                    <p className="font-medium">
                      {selectedRemittance?.protocol || '—'}
                    </p>
                  </div>
                </div>

                {selectedRemittance?.errorMsg && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive">
                      Mensagem de Erro
                    </p>
                    <p className="text-sm mt-1">{selectedRemittance.errorMsg}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Timeline</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {['PENDING', 'VALIDATING', 'TRANSFORMING', 'READY', 'SENDING', 'SENT'].map(
                      (status, index) => {
                        const statusOrder = [
                          'PENDING',
                          'VALIDATING',
                          'TRANSFORMING',
                          'READY',
                          'SENDING',
                          'SENT',
                        ];
                        const currentIndex = statusOrder.indexOf(
                          selectedRemittance?.status || ''
                        );
                        const isCompleted = index <= currentIndex;

                        return (
                          <div key={status} className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isCompleted ? 'bg-emerald-500' : 'bg-muted'
                              }`}
                            />
                            <span
                              className={`text-xs ${
                                isCompleted ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {status}
                            </span>
                            {index < 5 && (
                              <ArrowUpRight className="h-3 w-3 text-muted-foreground rotate-45" />
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payload" className="m-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Payload e-Sfinge</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          JSON.stringify(selectedRemittance?.payload, null, 2)
                        );
                        toast.success('JSON copiado!');
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                  </div>
                  <JsonViewer data={selectedRemittance?.payload || {}} />
                </div>
              </TabsContent>

              <TabsContent value="validations" className="m-0">
                <div className="space-y-3">
                  {remittanceValidations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                      <p>Nenhuma validação pendente</p>
                    </div>
                  ) : (
                    remittanceValidations.map((validation) => (
                      <div key={validation.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <ValidationLevelBadge level={validation.level} />
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {validation.code}
                              </code>
                            </div>
                            <p className="text-sm">{validation.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="m-0">
                <div className="space-y-3">
                  {remittanceLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileJson className="h-8 w-8 mx-auto mb-2" />
                      <p>Nenhum log de comunicação</p>
                    </div>
                  ) : (
                    remittanceLogs.map((log) => (
                      <div key={log.id} className="p-4 rounded-lg border bg-card space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
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
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {log.method} {log.url}
                            </code>
                          </div>
                          {log.statusCode && (
                            <Badge
                              variant="outline"
                              className={
                                log.statusCode >= 200 && log.statusCode < 300
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-red-500/10 text-red-600'
                              }
                            >
                              {log.statusCode}
                            </Badge>
                          )}
                        </div>
                        <JsonViewer data={log.body} collapsed />
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t mt-4">
            {selectedRemittance?.status === 'READY' && (
              <Button onClick={() => handleSend(selectedRemittance)}>
                <Send className="mr-2 h-4 w-4" />
                Enviar para TCE
              </Button>
            )}
            {(selectedRemittance?.status === 'ERROR' ||
              selectedRemittance?.status === 'SENT') && (
              <Button
                variant="outline"
                onClick={() => selectedRemittance && handleRetry(selectedRemittance)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reenviar
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}

