'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import {
  RawDataStatusBadge,
  ValidationLevelBadge,
} from '@/components/status-badge';
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
  Database,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Package,
  Filter,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useRawData } from '@/hooks/use-raw-data';
import { useUnits } from '@/hooks/use-units';
import { useCreateRemittance } from '@/hooks/use-remittances';
import {
  useValidationsByRawData,
  useValidateRawData,
  useRevalidateRawData,
  useClearValidations,
} from '@/hooks/use-validations';
import type { RawData, RawDataStatus, ModuleType } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const moduleLabels: Record<ModuleType, string> = {
  CONTRATO: 'Contrato',
  COMPRA_DIRETA: 'Compra Direta',
  EMPENHO: 'Empenho',
  LIQUIDACAO: 'Liquidação',
  PAGAMENTO: 'Pagamento',
  EXECUCAO_ORCAMENTARIA: 'Execução Orçamentária',
};

const statusOptions: { value: RawDataStatus; label: string }[] = [
  { value: 'RECEIVED', label: 'Recebido' },
  { value: 'PROCESSING', label: 'Processando' },
  { value: 'PROCESSED', label: 'Processado' },
  { value: 'ERROR', label: 'Erro' },
];

export default function DadosPage() {
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [competencyFilter, setCompetencyFilter] = useState('');

  const [selectedData, setSelectedData] = useState<RawData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // API filters
  const apiFilters = useMemo(
    () => ({
      unitId: unitFilter !== 'all' ? parseInt(unitFilter) : undefined,
      module: moduleFilter !== 'all' ? moduleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      competency: competencyFilter || undefined,
    }),
    [unitFilter, moduleFilter, statusFilter, competencyFilter]
  );

  const { data: rawData = [], isLoading, isError } = useRawData(apiFilters);
  const { data: units = [] } = useUnits();
  const createRemittance = useCreateRemittance();
  const validateRawData = useValidateRawData();
  const revalidateRawData = useRevalidateRawData();
  const clearValidations = useClearValidations();

  // Validações do dado selecionado
  const {
    data: validations = [],
    isLoading: isLoadingValidations,
    refetch: refetchValidations,
  } = useValidationsByRawData(selectedData ? parseInt(selectedData.id) : 0);

  const handleViewDetails = (data: RawData) => {
    setSelectedData(data);
    setIsDrawerOpen(true);
  };

  const handleValidate = async (data: RawData) => {
    await validateRawData.mutateAsync(parseInt(data.id));
    // Atualizar validações se o drawer está aberto
    if (selectedData?.id === data.id) {
      refetchValidations();
    }
  };

  const handleRevalidate = async (data: RawData) => {
    await revalidateRawData.mutateAsync(parseInt(data.id));
    if (selectedData?.id === data.id) {
      refetchValidations();
    }
  };

  const handleClearValidations = async (data: RawData) => {
    await clearValidations.mutateAsync(parseInt(data.id));
    if (selectedData?.id === data.id) {
      refetchValidations();
    }
  };

  const handleCreateRemittance = async (data: RawData) => {
    try {
      await createRemittance.mutateAsync({
        rawDataId: parseInt(data.id),
      });
    } catch {
      // Error is handled in the hook
    }
  };

  const clearFilters = () => {
    setUnitFilter('all');
    setModuleFilter('all');
    setStatusFilter('all');
    setCompetencyFilter('');
  };

  const hasFilters =
    unitFilter !== 'all' ||
    moduleFilter !== 'all' ||
    statusFilter !== 'all' ||
    competencyFilter !== '';

  // Contadores de validações
  const imperativasCount = validations.filter(
    (v) => v.level === 'IMPEDITIVA'
  ).length;
  const alertasCount = validations.filter((v) => v.level === 'ALERTA').length;

  const isValidating = validateRawData.isPending || revalidateRawData.isPending;

  return (
    <DashboardLayout>
      <PageHeader
        title="Dados Recebidos"
        description="Visualize e gerencie os dados brutos recebidos via API"
      />

      <div className="space-y-6 p-6">
        {/* Filters */}
        <Card className="gap-0">
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
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Unidade Gestora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.code} - {unit.name}
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

              <Input
                placeholder="Competência"
                value={competencyFilter}
                onChange={(e) => setCompetencyFilter(e.target.value)}
                className="w-[160px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Brutos</CardTitle>
            <CardDescription>
              {rawData.length} registro(s) encontrado(s)
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
                <p>Erro ao carregar dados. Tente novamente.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Competência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recebido em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Database className="h-8 w-8" />
                          <p>Nenhum dado encontrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rawData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell className="font-medium">
                          #{data.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {data.unit?.code}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {data.unit?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {moduleLabels[data.module]}
                          </Badge>
                        </TableCell>
                        <TableCell>{data.competency}</TableCell>
                        <TableCell>
                          <RawDataStatusBadge status={data.status} />
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(data.createdAt),
                            'dd/MM/yyyy HH:mm',
                            {
                              locale: ptBR,
                            }
                          )}
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
                                onClick={() => handleViewDetails(data)}
                              >
                                <Eye className="h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleValidate(data)}
                                disabled={isValidating}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Validar agora
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRevalidate(data)}
                                disabled={isValidating}
                              >
                                <RefreshCw className="h-4 w-4" />
                                Revalidar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleCreateRemittance(data)}
                                disabled={createRemittance.isPending}
                              >
                                <Package className="h-4 w-4" />
                                Criar remessa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="sm:max-w-2xl overflow-hidden flex flex-col">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl">
                  Dados #{selectedData?.id}
                </SheetTitle>
                <SheetDescription>
                  {selectedData?.module && moduleLabels[selectedData.module]} -{' '}
                  {selectedData?.competency}
                </SheetDescription>
              </div>
              {selectedData && (
                <RawDataStatusBadge status={selectedData.status} />
              )}
            </div>
          </SheetHeader>

          <Tabs defaultValue="payload" className="flex-1 flex flex-col mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payload">Payload Original</TabsTrigger>
              <TabsTrigger
                value="validations"
                className="flex items-center gap-2"
              >
                Validações
                {validations.length > 0 && (
                  <Badge
                    variant="outline"
                    className={
                      imperativasCount > 0
                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }
                  >
                    {validations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="payload" className="m-0">
                <JsonViewer
                  data={selectedData?.payload || {}}
                  title="Payload Recebido"
                />
              </TabsContent>

              <TabsContent value="validations" className="m-0">
                {isLoadingValidations ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : validations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                    <p>Nenhuma validação encontrada</p>
                    <p className="text-sm mt-1">
                      Clique em &quot;Validar&quot; para verificar os dados
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Resumo */}
                    <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">
                          <strong>{imperativasCount}</strong> impeditiva(s)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm">
                          <strong>{alertasCount}</strong> alerta(s)
                        </span>
                      </div>
                    </div>

                    {/* Lista de validações */}
                    <div className="space-y-3">
                      {validations.map((validation) => (
                        <div
                          key={validation.id}
                          className="p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <ValidationLevelBadge
                                  level={validation.level}
                                />
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {validation.code}
                                </code>
                              </div>
                              <p className="text-sm">{validation.message}</p>
                              {validation.field && (
                                <p className="text-xs text-muted-foreground">
                                  Campo: <strong>{validation.field}</strong>
                                  {validation.value && (
                                    <>
                                      {' | '}Valor:{' '}
                                      <strong>{validation.value}</strong>
                                    </>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={() => selectedData && handleValidate(selectedData)}
              disabled={isValidating}
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Validar
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedData && handleRevalidate(selectedData)}
              disabled={isValidating}
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Revalidar
            </Button>
            {validations.length > 0 && (
              <Button
                variant="outline"
                onClick={() =>
                  selectedData && handleClearValidations(selectedData)
                }
                disabled={clearValidations.isPending}
                className="text-destructive hover:text-destructive"
              >
                {clearValidations.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Limpar
              </Button>
            )}
            <Button
              onClick={() =>
                selectedData && handleCreateRemittance(selectedData)
              }
              disabled={createRemittance.isPending || imperativasCount > 0}
              title={
                imperativasCount > 0
                  ? 'Não é possível criar remessa com erros impeditivos'
                  : undefined
              }
            >
              {createRemittance.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              Criar Remessa
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
