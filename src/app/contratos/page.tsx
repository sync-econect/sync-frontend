'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { RawDataStatusBadge } from '@/components/status-badge';
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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Plus,
  Pencil,
  FileSignature,
  Loader2,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Package,
  Trash2,
  Filter,
  X,
  RefreshCw,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import {
  useRawData,
  useCreateRawData,
  useUpdateRawData,
  useDeleteRawData,
} from '@/hooks/use-raw-data';
import { useUnits } from '@/hooks/use-units';
import { useCreateRemittance } from '@/hooks/use-remittances';
import {
  useValidationsByRawData,
  useValidateRawData,
  useRevalidateRawData,
  useClearValidations,
} from '@/hooks/use-validations';
import { ValidationLevelBadge } from '@/components/status-badge';
import type { RawData, Unit } from '@/types';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

// Interface para o payload do contrato
interface ContratoPayload {
  numero: string;
  objeto: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  fornecedor: {
    cnpj: string;
    razaoSocial: string;
  };
  modalidade?: string;
  fundamentoLegal?: string;
}

// Form state type
interface ContratoFormState {
  unitId: string;
  competency: string;
  numero: string;
  objeto: string;
  valor: string;
  dataInicio: string;
  dataFim: string;
  cnpj: string;
  razaoSocial: string;
  modalidade: string;
  fundamentoLegal: string;
}

const initialFormState: ContratoFormState = {
  unitId: '',
  competency: '',
  numero: '',
  objeto: '',
  valor: '',
  dataInicio: '',
  dataFim: '',
  cnpj: '',
  razaoSocial: '',
  modalidade: '',
  fundamentoLegal: '',
};

// Funções de formatação
const formatCnpj = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 14);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
      5,
      8
    )}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
    5,
    8
  )}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
};

const formatCurrency = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  const cents = parseInt(numbers, 10);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
};

const parseCurrencyToNumber = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  return parseInt(numbers, 10) / 100;
};

const getCurrentCompetency = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function ContratosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<RawData | null>(null);
  const [formData, setFormData] = useState<ContratoFormState>(initialFormState);

  // Filters
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [competencyFilter, setCompetencyFilter] = useState('');

  // Detail drawer
  const [selectedContrato, setSelectedContrato] = useState<RawData | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // API filters for contracts only
  const apiFilters = useMemo(
    () => ({
      module: 'CONTRATO',
      unitId: unitFilter !== 'all' ? parseInt(unitFilter) : undefined,
      competency: competencyFilter || undefined,
    }),
    [unitFilter, competencyFilter]
  );

  const { data: contratos = [], isLoading, isError } = useRawData(apiFilters);
  const { data: units = [] } = useUnits();
  const createRawData = useCreateRawData();
  const updateRawData = useUpdateRawData();
  const deleteRawData = useDeleteRawData();
  const createRemittance = useCreateRemittance();
  const validateRawData = useValidateRawData();
  const revalidateRawData = useRevalidateRawData();
  const clearValidations = useClearValidations();

  // Validações do contrato selecionado
  const {
    data: validations = [],
    isLoading: isLoadingValidations,
    refetch: refetchValidations,
  } = useValidationsByRawData(
    selectedContrato ? parseInt(selectedContrato.id) : 0
  );

  const imperativasCount = validations.filter(
    (v) => v.level === 'IMPEDITIVA'
  ).length;
  const alertasCount = validations.filter((v) => v.level === 'ALERTA').length;

  const handleOpenDialog = (contrato?: RawData) => {
    if (contrato) {
      setEditingContrato(contrato);
      const payload = contrato.payload as ContratoPayload;
      setFormData({
        unitId: contrato.unitId,
        competency: contrato.competency,
        numero: payload.numero || '',
        objeto: payload.objeto || '',
        valor: payload.valor ? formatCurrency(String(payload.valor * 100)) : '',
        dataInicio: payload.dataInicio || '',
        dataFim: payload.dataFim || '',
        cnpj: payload.fornecedor?.cnpj
          ? formatCnpj(payload.fornecedor.cnpj)
          : '',
        razaoSocial: payload.fornecedor?.razaoSocial || '',
        modalidade: payload.modalidade || '',
        fundamentoLegal: payload.fundamentoLegal || '',
      });
    } else {
      setEditingContrato(null);
      setFormData({
        ...initialFormState,
        competency: getCurrentCompetency(),
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.unitId ||
      !formData.numero ||
      !formData.objeto ||
      !formData.valor
    ) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const payload: ContratoPayload = {
      numero: formData.numero,
      objeto: formData.objeto,
      valor: parseCurrencyToNumber(formData.valor),
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      fornecedor: {
        cnpj: formData.cnpj.replace(/\D/g, ''),
        razaoSocial: formData.razaoSocial,
      },
      ...(formData.modalidade && { modalidade: formData.modalidade }),
      ...(formData.fundamentoLegal && {
        fundamentoLegal: formData.fundamentoLegal,
      }),
    };

    try {
      if (editingContrato) {
        await updateRawData.mutateAsync({
          id: parseInt(editingContrato.id),
          payload: {
            payload,
            competency: formData.competency,
          },
        });
        toast.success('Contrato atualizado com sucesso!');
      } else {
        await createRawData.mutateAsync({
          unitId: parseInt(formData.unitId),
          module: 'CONTRATO',
          competency: formData.competency,
          payload,
        });
        toast.success('Contrato cadastrado com sucesso!');
      }
      setIsDialogOpen(false);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleViewDetails = (contrato: RawData) => {
    setSelectedContrato(contrato);
    setIsDrawerOpen(true);
  };

  const handleValidate = async (contrato: RawData) => {
    await validateRawData.mutateAsync(parseInt(contrato.id));
    if (selectedContrato?.id === contrato.id) {
      refetchValidations();
    }
  };

  const handleRevalidate = async (contrato: RawData) => {
    await revalidateRawData.mutateAsync(parseInt(contrato.id));
    if (selectedContrato?.id === contrato.id) {
      refetchValidations();
    }
  };

  const handleClearValidations = async (contrato: RawData) => {
    await clearValidations.mutateAsync(parseInt(contrato.id));
    if (selectedContrato?.id === contrato.id) {
      refetchValidations();
    }
  };

  const handleCreateRemittance = async (contrato: RawData) => {
    try {
      await createRemittance.mutateAsync({
        rawDataId: parseInt(contrato.id),
      });
    } catch {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (contrato: RawData) => {
    if (!confirm('Tem certeza que deseja excluir este contrato?')) return;
    await deleteRawData.mutateAsync(parseInt(contrato.id));
  };

  const clearFilters = () => {
    setUnitFilter('all');
    setCompetencyFilter('');
  };

  const hasFilters = unitFilter !== 'all' || competencyFilter !== '';

  const isSubmitting = createRawData.isPending || updateRawData.isPending;
  const isValidating = validateRawData.isPending || revalidateRawData.isPending;

  // Helper to get unit name
  const getUnitDisplay = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    return unit ? `${unit.code} - ${unit.name}` : unitId;
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Contratos"
        description="Cadastre e gerencie contratos para transmissão ao e-Sfinge/TCE-MS"
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
                <SelectTrigger className="w-[250px]">
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

              <Input
                placeholder="Competência (ex: 202412)"
                value={competencyFilter}
                onChange={(e) => setCompetencyFilter(e.target.value)}
                className="w-[180px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contratos Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Contratos Cadastrados
                </CardTitle>
                <CardDescription>
                  {contratos.length} contrato(s) encontrado(s)
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    Novo Contrato
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <FileSignature className="h-5 w-5" />
                        {editingContrato ? 'Editar Contrato' : 'Novo Contrato'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingContrato
                          ? 'Atualize os dados do contrato'
                          : 'Preencha os dados para cadastrar um novo contrato'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                      {/* Seção: Dados Gerais */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Dados Gerais
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="unitId">Unidade Gestora *</Label>
                            <Select
                              value={formData.unitId}
                              onValueChange={(value) =>
                                setFormData({ ...formData, unitId: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a unidade" />
                              </SelectTrigger>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit.id} value={unit.id}>
                                    {unit.code} - {unit.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="competency">Competência *</Label>
                            <Input
                              id="competency"
                              value={formData.competency}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  competency: e.target.value,
                                })
                              }
                              placeholder="Ex: 202412"
                              maxLength={6}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Seção: Dados do Contrato */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Dados do Contrato
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="numero">Número do Contrato *</Label>
                            <Input
                              id="numero"
                              value={formData.numero}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  numero: e.target.value,
                                })
                              }
                              placeholder="Ex: 001/2024"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="valor">Valor do Contrato *</Label>
                            <Input
                              id="valor"
                              value={formData.valor}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  valor: formatCurrency(e.target.value),
                                })
                              }
                              placeholder="R$ 0,00"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="objeto">Objeto do Contrato *</Label>
                          <Textarea
                            id="objeto"
                            value={formData.objeto}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                objeto: e.target.value,
                              })
                            }
                            placeholder="Descreva o objeto do contrato..."
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="modalidade">Modalidade</Label>
                            <Select
                              value={formData.modalidade}
                              onValueChange={(value) =>
                                setFormData({ ...formData, modalidade: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PREGAO">Pregão</SelectItem>
                                <SelectItem value="CONCORRENCIA">
                                  Concorrência
                                </SelectItem>
                                <SelectItem value="TOMADA_PRECOS">
                                  Tomada de Preços
                                </SelectItem>
                                <SelectItem value="CONVITE">Convite</SelectItem>
                                <SelectItem value="DISPENSA">
                                  Dispensa de Licitação
                                </SelectItem>
                                <SelectItem value="INEXIGIBILIDADE">
                                  Inexigibilidade
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fundamentoLegal">
                              Fundamento Legal
                            </Label>
                            <Input
                              id="fundamentoLegal"
                              value={formData.fundamentoLegal}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  fundamentoLegal: e.target.value,
                                })
                              }
                              placeholder="Ex: Lei 14.133/2021, Art. 75"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Seção: Vigência */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Vigência
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="dataInicio">Data de Início *</Label>
                            <Input
                              id="dataInicio"
                              type="date"
                              value={formData.dataInicio}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dataInicio: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dataFim">Data de Término *</Label>
                            <Input
                              id="dataFim"
                              type="date"
                              value={formData.dataFim}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dataFim: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Seção: Contratado/Fornecedor */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Contratado/Fornecedor
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ *</Label>
                            <Input
                              id="cnpj"
                              value={formData.cnpj}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  cnpj: formatCnpj(e.target.value),
                                })
                              }
                              placeholder="00.000.000/0000-00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="razaoSocial">Razão Social *</Label>
                            <Input
                              id="razaoSocial"
                              value={formData.razaoSocial}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  razaoSocial: e.target.value,
                                })
                              }
                              placeholder="Nome da empresa"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {editingContrato
                          ? 'Salvar Alterações'
                          : 'Cadastrar Contrato'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
                <p>Erro ao carregar contratos. Tente novamente.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Contrato</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vigência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Competência</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <FileSignature className="h-8 w-8" />
                          <p>Nenhum contrato cadastrado</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog()}
                          >
                            <Plus className="h-4 w-4" />
                            Cadastrar primeiro contrato
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contratos.map((contrato) => {
                      const payload = contrato.payload as ContratoPayload;
                      return (
                        <TableRow key={contrato.id}>
                          <TableCell className="font-mono font-medium">
                            {payload.numero}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {contrato.unit?.code}
                              </span>
                              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {contrato.unit?.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className="truncate block max-w-[200px]"
                              title={payload.objeto}
                            >
                              {payload.objeto}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(payload.valor)}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>{payload.dataInicio}</div>
                              <div className="text-muted-foreground">
                                até {payload.dataFim}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <RawDataStatusBadge status={contrato.status} />
                          </TableCell>
                          <TableCell>{contrato.competency}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(contrato)}
                                >
                                  <Eye className="h-4 w-4" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenDialog(contrato)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleValidate(contrato)}
                                  disabled={isValidating}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Validar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleCreateRemittance(contrato)
                                  }
                                  disabled={createRemittance.isPending}
                                >
                                  <Package className="h-4 w-4" />
                                  Criar remessa
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(contrato)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
                <SheetTitle className="text-xl flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Contrato #{selectedContrato?.id}
                </SheetTitle>
                <SheetDescription>
                  {selectedContrato &&
                    (selectedContrato.payload as ContratoPayload).numero}{' '}
                  - {selectedContrato?.competency}
                </SheetDescription>
              </div>
              {selectedContrato && (
                <RawDataStatusBadge status={selectedContrato.status} />
              )}
            </div>
          </SheetHeader>

          <Tabs defaultValue="details" className="flex-1 flex flex-col mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="payload">JSON</TabsTrigger>
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
              <TabsContent value="details" className="m-0 space-y-6">
                {selectedContrato &&
                  (() => {
                    const payload = selectedContrato.payload as ContratoPayload;
                    return (
                      <>
                        {/* Dados Gerais */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Dados Gerais
                          </h4>
                          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Unidade
                              </p>
                              <p className="font-medium">
                                {selectedContrato.unit?.code} -{' '}
                                {selectedContrato.unit?.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Competência
                              </p>
                              <p className="font-medium">
                                {selectedContrato.competency}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Dados do Contrato */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Dados do Contrato
                          </h4>
                          <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Número
                                </p>
                                <p className="font-mono font-medium">
                                  {payload.numero}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Valor
                                </p>
                                <p className="font-mono font-medium text-emerald-600">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                  }).format(payload.valor)}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Objeto
                              </p>
                              <p className="text-sm">{payload.objeto}</p>
                            </div>
                            {payload.modalidade && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Modalidade
                                  </p>
                                  <p className="font-medium">
                                    {payload.modalidade}
                                  </p>
                                </div>
                                {payload.fundamentoLegal && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Fundamento Legal
                                    </p>
                                    <p className="font-medium">
                                      {payload.fundamentoLegal}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Vigência */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Vigência
                          </h4>
                          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Início
                              </p>
                              <p className="font-medium">
                                {payload.dataInicio}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Término
                              </p>
                              <p className="font-medium">{payload.dataFim}</p>
                            </div>
                          </div>
                        </div>

                        {/* Fornecedor */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Contratado/Fornecedor
                          </h4>
                          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                CNPJ
                              </p>
                              <p className="font-mono font-medium">
                                {formatCnpj(payload.fornecedor.cnpj)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Razão Social
                              </p>
                              <p className="font-medium">
                                {payload.fornecedor.razaoSocial}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
              </TabsContent>

              <TabsContent value="payload" className="m-0">
                <JsonViewer
                  data={selectedContrato?.payload || {}}
                  title="Payload do Contrato"
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
              onClick={() =>
                selectedContrato && handleOpenDialog(selectedContrato)
              }
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                selectedContrato && handleValidate(selectedContrato)
              }
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
              onClick={() =>
                selectedContrato && handleRevalidate(selectedContrato)
              }
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
                  selectedContrato && handleClearValidations(selectedContrato)
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
                selectedContrato && handleCreateRemittance(selectedContrato)
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
