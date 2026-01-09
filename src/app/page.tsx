'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
import { StatusBadge } from '@/components/status-badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  MoreHorizontal,
  Eye,
  RefreshCw,
  XCircle,
  Filter,
  X,
  FileJson,
  Copy,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import {
  useRemittances,
  useRemittanceStats,
  useRemittanceLogs,
  useSendRemittance,
  useCancelRemittance,
  useRetryRemittance,
} from '@/hooks/use-remittances';
import type { Remittance, RemittanceStatus, ModuleType } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { JsonViewer } from '@/components/json-viewer';

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

const statusTimelineLabels: Record<string, string> = {
  PENDING: 'Pendente',
  VALIDATING: 'Validando',
  TRANSFORMING: 'Transformando',
  READY: 'Pronta',
  SENDING: 'Enviando',
  SENT: 'Enviada',
  ERROR: 'Erro',
  CANCELLED: 'Cancelada',
};

export default function DashboardPage() {
  const [selectedRemittance, setSelectedRemittance] =
    useState<Remittance | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [competencyFilter, setCompetencyFilter] = useState('');

  // API filters
  const apiFilters = useMemo(
    () => ({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      module: moduleFilter !== 'all' ? moduleFilter : undefined,
      competency: competencyFilter || undefined,
    }),
    [statusFilter, moduleFilter, competencyFilter]
  );

  const {
    data: remittancesData,
    isLoading,
    isError,
  } = useRemittances(apiFilters);
  const { data: stats, isLoading: isStatsLoading } = useRemittanceStats();
  const sendRemittance = useSendRemittance();
  const cancelRemittance = useCancelRemittance();
  const retryRemittance = useRetryRemittance();

  const remittances = remittancesData?.data || [];

  // Get logs for selected remittance
  const { data: remittanceLogs = [] } = useRemittanceLogs(
    selectedRemittance ? parseInt(selectedRemittance.id) : 0
  );

  const handleViewDetails = (remittance: Remittance) => {
    setSelectedRemittance(remittance);
    setIsDrawerOpen(true);
  };

  const handleSend = (remittance: Remittance) => {
    sendRemittance.mutate(parseInt(remittance.id));
  };

  const handleRetry = (remittance: Remittance) => {
    retryRemittance.mutate(parseInt(remittance.id));
  };

  const handleCancel = (remittance: Remittance) => {
    cancelRemittance.mutate(parseInt(remittance.id));
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setModuleFilter('all');
    setCompetencyFilter('');
  };

  const hasFilters =
    statusFilter !== 'all' || moduleFilter !== 'all' || competencyFilter !== '';

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard e-Sfinge"
        description="Acompanhe remessas, validações e transmissões para o TCE/MS"
      />

      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 overflow-x-hidden">
        {/* KPI Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {isStatsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28 sm:h-32 w-full" />
              ))}
            </>
          ) : (
            <>
              <KpiCard
                title="Total de Remessas"
                value={stats?.total || 0}
                icon={Package}
                trend={{ value: '+2 hoje', positive: true }}
              />
              <KpiCard
                title="Enviadas com Sucesso"
                value={stats?.byStatus?.SENT || 0}
                icon={CheckCircle2}
                variant="success"
              />
              <KpiCard
                title="Erros nas Últimas 24h"
                value={stats?.errorsLast24h || 0}
                icon={AlertTriangle}
                variant="error"
              />
              <KpiCard
                title="Último Protocolo"
                value={stats?.lastProtocol || '—'}
                description={
                  stats?.lastProtocolDate
                    ? format(
                        new Date(stats.lastProtocolDate),
                        "dd/MM 'às' HH:mm",
                        {
                          locale: ptBR,
                        }
                      )
                    : undefined
                }
                icon={Clock}
              />
            </>
          )}
        </div>

        {/* Filters */}
        <Card className="gap-0">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Filtros</CardTitle>
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Limpar filtros</span>
                  <span className="sm:hidden">Limpar</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
                <SelectTrigger className="w-full sm:w-[180px]">
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
                placeholder="Competência (ex: 2024-12)"
                value={competencyFilter}
                onChange={(e) => setCompetencyFilter(e.target.value)}
                className="w-full sm:w-[180px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Remittances */}
        <Card>
          <CardHeader>
            <CardTitle>Remessas</CardTitle>
            <CardDescription>
              {remittancesData?.total || 0} remessa(s) encontrada(s)
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
                <p>Erro ao carregar remessas. Tente novamente.</p>
              </div>
            ) : remittances.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <Package className="h-8 w-8" />
                <p>Nenhuma remessa encontrada</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Módulo</TableHead>
                        <TableHead>Competência</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Protocolo</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead>Enviado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {remittances.map((remittance) => (
                        <TableRow key={remittance.id}>
                          <TableCell className="font-medium">
                            #{remittance.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {remittance.unit?.code}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {remittance.unit?.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {moduleLabels[remittance.module]}
                          </TableCell>
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
                            {format(
                              new Date(remittance.createdAt),
                              'dd/MM/yyyy HH:mm',
                              {
                                locale: ptBR,
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            {remittance.sentAt
                              ? format(
                                  new Date(remittance.sentAt),
                                  'dd/MM/yyyy HH:mm',
                                  {
                                    locale: ptBR,
                                  }
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
                                  onClick={() => handleViewDetails(remittance)}
                                >
                                  <Eye className="h-4 w-4" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {remittance.status === 'READY' && (
                                  <DropdownMenuItem
                                    onClick={() => handleSend(remittance)}
                                  >
                                    <Send className="h-4 w-4" />
                                    Enviar para TCE/MS
                                  </DropdownMenuItem>
                                )}
                                {(remittance.status === 'ERROR' ||
                                  remittance.status === 'SENT') && (
                                  <DropdownMenuItem
                                    onClick={() => handleRetry(remittance)}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                    Reenviar
                                  </DropdownMenuItem>
                                )}
                                {['PENDING', 'READY', 'SENDING'].includes(
                                  remittance.status
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() => handleCancel(remittance)}
                                    className="text-destructive"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Cancelar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {remittances.map((remittance) => (
                    <Card
                      key={remittance.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewDetails(remittance)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">
                                #{remittance.id}
                              </span>
                              <StatusBadge status={remittance.status} />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p className="font-medium text-foreground truncate">
                                {remittance.unit?.code} -{' '}
                                {remittance.unit?.name}
                              </p>
                              <p>{moduleLabels[remittance.module]}</p>
                              <p>Competência: {remittance.competency}</p>
                            </div>
                            {remittance.protocol && (
                              <code className="text-xs bg-muted px-2 py-1 rounded inline-block">
                                {remittance.protocol}
                              </code>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Criado em{' '}
                              {format(
                                new Date(remittance.createdAt),
                                "dd/MM/yyyy 'às' HH:mm",
                                { locale: ptBR }
                              )}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(remittance);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {remittance.status === 'READY' && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSend(remittance);
                                  }}
                                >
                                  <Send className="h-4 w-4" />
                                  Enviar para TCE/MS
                                </DropdownMenuItem>
                              )}
                              {(remittance.status === 'ERROR' ||
                                remittance.status === 'SENT') && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRetry(remittance);
                                  }}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  Reenviar
                                </DropdownMenuItem>
                              )}
                              {['PENDING', 'READY', 'SENDING'].includes(
                                remittance.status
                              ) && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancel(remittance);
                                  }}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Cancelar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        {!isStatsLoading && stats && (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {statusOptions.map((option) => (
              <Card key={option.value} className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">
                    {option.label}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold">
                    {stats.byStatus[option.value] || 0}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl lg:max-w-2xl overflow-hidden flex flex-col">
          <SheetHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <SheetTitle className="text-lg sm:text-xl">
                  Remessa #{selectedRemittance?.id}
                </SheetTitle>
                <SheetDescription className="truncate">
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
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                Geral
              </TabsTrigger>
              <TabsTrigger value="payload" className="text-xs sm:text-sm">
                Payload
              </TabsTrigger>
              <TabsTrigger value="validations" className="text-xs sm:text-sm">
                Validações
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-xs sm:text-sm">
                Logs
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="overview" className="m-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Unidade</p>
                    <p className="font-medium text-sm sm:text-base">
                      {selectedRemittance?.unit?.code} -{' '}
                      {selectedRemittance?.unit?.name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Módulo</p>
                    <p className="font-medium text-sm sm:text-base">
                      {selectedRemittance?.module &&
                        moduleLabels[selectedRemittance.module]}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Competência</p>
                    <p className="font-medium text-sm sm:text-base">
                      {selectedRemittance?.competency}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Protocolo</p>
                    <p className="font-medium text-sm sm:text-base">
                      {selectedRemittance?.protocol || '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Criado em</p>
                    <p className="font-medium text-sm sm:text-base">
                      {selectedRemittance?.createdAt &&
                        format(
                          new Date(selectedRemittance.createdAt),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Enviado em</p>
                    <p className="font-medium text-sm sm:text-base">
                      {selectedRemittance?.sentAt
                        ? format(
                            new Date(selectedRemittance.sentAt),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )
                        : '—'}
                    </p>
                  </div>
                </div>

                {selectedRemittance?.errorMsg && (
                  <div className="p-3 sm:p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive">
                      Mensagem de Erro
                    </p>
                    <p className="text-sm mt-1">
                      {selectedRemittance.errorMsg}
                    </p>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Timeline de Status</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      'PENDING',
                      'VALIDATING',
                      'TRANSFORMING',
                      'READY',
                      'SENDING',
                      'SENT',
                    ].map((status, index) => {
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
                      const isError = selectedRemittance?.status === 'ERROR';

                      return (
                        <div
                          key={status}
                          className="flex items-center gap-1 sm:gap-2"
                        >
                          <div
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                              isError && index === currentIndex
                                ? 'bg-red-500'
                                : isCompleted
                                ? 'bg-emerald-500'
                                : 'bg-muted'
                            }`}
                          />
                          <span
                            className={`text-[10px] sm:text-xs ${
                              isCompleted
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {statusTimelineLabels[status] || status}
                          </span>
                          {index < 5 && (
                            <ArrowUpRight className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground rotate-45" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedRemittance?.status === 'READY' && (
                    <Button
                      onClick={() => handleSend(selectedRemittance)}
                      disabled={sendRemittance.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      {sendRemittance.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">
                        Enviar para TCE/MS
                      </span>
                      <span className="sm:hidden">Enviar</span>
                    </Button>
                  )}
                  {(selectedRemittance?.status === 'ERROR' ||
                    selectedRemittance?.status === 'SENT') && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        selectedRemittance && handleRetry(selectedRemittance)
                      }
                      disabled={retryRemittance.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      {retryRemittance.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Reenviar
                    </Button>
                  )}
                  {['PENDING', 'READY', 'SENDING'].includes(
                    selectedRemittance?.status || ''
                  ) && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        selectedRemittance && handleCancel(selectedRemittance)
                      }
                      disabled={cancelRemittance.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      {cancelRemittance.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Cancelar
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="payload" className="m-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Payload e-Sfinge
                      </span>
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
                      <Copy className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Copiar JSON</span>
                    </Button>
                  </div>
                  <JsonViewer data={selectedRemittance?.payload || {}} />
                </div>
              </TabsContent>

              <TabsContent value="validations" className="m-0">
                <div className="space-y-3">
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                    <p>Nenhuma validação pendente</p>
                  </div>
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
                      <div
                        key={log.id}
                        className="p-3 sm:p-4 rounded-lg border bg-card space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
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
                            <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                              {log.method} {log.url}
                            </code>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {log.statusCode && (
                              <Badge
                                variant="outline"
                                className={
                                  log.statusCode >= 200 && log.statusCode < 300
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                                }
                              >
                                {log.statusCode}
                              </Badge>
                            )}
                            {log.duration && <span>{log.duration}ms</span>}
                          </div>
                        </div>
                        <JsonViewer data={log.body} collapsed />
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
