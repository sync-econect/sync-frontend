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
  ShoppingCart,
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
  Hammer,
  Wrench,
  Box,
  Briefcase,
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
import type { RawData } from '@/types';
import { toast } from 'sonner';

// Tipos de Compra Direta
type TipoCompra = 'DISPENSA' | 'INEXIGIBILIDADE';

// Natureza do Objeto - importante para regra impeditiva (OBRA > R$330k)
type NaturezaObjeto = 'SERVICO' | 'OBRA' | 'MATERIAL' | 'LOCACAO' | 'OUTROS';

// Interface para o payload da compra direta
interface CompraDiretaPayload {
  numero: string;
  tipo: TipoCompra;
  naturezaObjeto: NaturezaObjeto;
  objeto: string;
  valor: number;
  dataCompra: string;
  fornecedor: {
    documento: string; // CPF ou CNPJ
    tipoDocumento: 'CPF' | 'CNPJ';
    nome: string;
  };
  fundamentoLegal: string;
  justificativa?: string;
  processo?: string;
}

// Form state type
interface CompraDiretaFormState {
  unitId: string;
  competency: string;
  numero: string;
  tipo: TipoCompra | '';
  naturezaObjeto: NaturezaObjeto | '';
  objeto: string;
  valor: string;
  dataCompra: string;
  documento: string;
  tipoDocumento: 'CPF' | 'CNPJ' | '';
  nome: string;
  fundamentoLegal: string;
  justificativa: string;
  processo: string;
}

const initialFormState: CompraDiretaFormState = {
  unitId: '',
  competency: '',
  numero: '',
  tipo: '',
  naturezaObjeto: '',
  objeto: '',
  valor: '',
  dataCompra: '',
  documento: '',
  tipoDocumento: '',
  nome: '',
  fundamentoLegal: '',
  justificativa: '',
  processo: '',
};

// Labels para exibição
const tipoCompraLabels: Record<TipoCompra, string> = {
  DISPENSA: 'Dispensa de Licitação',
  INEXIGIBILIDADE: 'Inexigibilidade',
};

const naturezaObjetoLabels: Record<NaturezaObjeto, string> = {
  SERVICO: 'Serviço',
  OBRA: 'Obra',
  MATERIAL: 'Material/Bem',
  LOCACAO: 'Locação',
  OUTROS: 'Outros',
};

const naturezaObjetoIcons: Record<NaturezaObjeto, React.ReactNode> = {
  SERVICO: <Wrench className="h-4 w-4" />,
  OBRA: <Hammer className="h-4 w-4" />,
  MATERIAL: <Box className="h-4 w-4" />,
  LOCACAO: <Building2 className="h-4 w-4" />,
  OUTROS: <Briefcase className="h-4 w-4" />,
};

// Fundamentos legais comuns
const fundamentosLegais = {
  DISPENSA: [
    { value: 'art_75_I', label: 'Art. 75, I - Obras até R$100.000' },
    { value: 'art_75_II', label: 'Art. 75, II - Bens/Serviços até R$50.000' },
    {
      value: 'art_75_III_a',
      label: 'Art. 75, III, a - Aquisição de gêneros perecíveis',
    },
    { value: 'art_75_IV', label: 'Art. 75, IV - Emergência ou calamidade' },
    { value: 'art_75_V', label: 'Art. 75, V - Licitação deserta' },
    { value: 'art_75_VIII', label: 'Art. 75, VIII - Preços incompatíveis' },
    { value: 'outro_dispensa', label: 'Outro fundamento (especificar)' },
  ],
  INEXIGIBILIDADE: [
    { value: 'art_74_I', label: 'Art. 74, I - Fornecedor exclusivo' },
    {
      value: 'art_74_II',
      label: 'Art. 74, II - Profissional/empresa de notória especialização',
    },
    { value: 'art_74_III', label: 'Art. 74, III - Artista consagrado' },
    { value: 'art_74_IV', label: 'Art. 74, IV - Credenciamento' },
    { value: 'outro_inexigibilidade', label: 'Outro fundamento (especificar)' },
  ],
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

const formatCpf = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9)
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
    6,
    9
  )}-${numbers.slice(9)}`;
};

const formatDocumento = (value: string, tipo: 'CPF' | 'CNPJ' | '') => {
  if (tipo === 'CPF') return formatCpf(value);
  if (tipo === 'CNPJ') return formatCnpj(value);
  return value.replace(/\D/g, '');
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

export default function ComprasDiretasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompra, setEditingCompra] = useState<RawData | null>(null);
  const [formData, setFormData] =
    useState<CompraDiretaFormState>(initialFormState);

  // Filters
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [competencyFilter, setCompetencyFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');

  // Detail drawer
  const [selectedCompra, setSelectedCompra] = useState<RawData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // API filters for compras diretas only
  const apiFilters = useMemo(
    () => ({
      module: 'COMPRA_DIRETA',
      unitId: unitFilter !== 'all' ? parseInt(unitFilter) : undefined,
      competency: competencyFilter || undefined,
    }),
    [unitFilter, competencyFilter]
  );

  const { data: compras = [], isLoading, isError } = useRawData(apiFilters);
  const { data: units = [] } = useUnits();
  const createRawData = useCreateRawData();
  const updateRawData = useUpdateRawData();
  const deleteRawData = useDeleteRawData();
  const createRemittance = useCreateRemittance();
  const validateRawData = useValidateRawData();
  const revalidateRawData = useRevalidateRawData();
  const clearValidations = useClearValidations();

  // Filtragem local pelo tipo
  const filteredCompras = useMemo(() => {
    if (tipoFilter === 'all') return compras;
    return compras.filter(
      (c) => (c.payload as CompraDiretaPayload).tipo === tipoFilter
    );
  }, [compras, tipoFilter]);

  // Validações da compra selecionada
  const {
    data: validations = [],
    isLoading: isLoadingValidations,
    refetch: refetchValidations,
  } = useValidationsByRawData(selectedCompra ? parseInt(selectedCompra.id) : 0);

  const imperativasCount = validations.filter(
    (v) => v.level === 'IMPEDITIVA'
  ).length;
  const alertasCount = validations.filter((v) => v.level === 'ALERTA').length;

  const handleOpenDialog = (compra?: RawData) => {
    if (compra) {
      setEditingCompra(compra);
      const payload = compra.payload as CompraDiretaPayload;
      setFormData({
        unitId: compra.unitId,
        competency: compra.competency,
        numero: payload.numero || '',
        tipo: payload.tipo || '',
        naturezaObjeto: payload.naturezaObjeto || '',
        objeto: payload.objeto || '',
        valor: payload.valor ? formatCurrency(String(payload.valor * 100)) : '',
        dataCompra: payload.dataCompra || '',
        documento: payload.fornecedor?.documento
          ? formatDocumento(
              payload.fornecedor.documento,
              payload.fornecedor.tipoDocumento
            )
          : '',
        tipoDocumento: payload.fornecedor?.tipoDocumento || '',
        nome: payload.fornecedor?.nome || '',
        fundamentoLegal: payload.fundamentoLegal || '',
        justificativa: payload.justificativa || '',
        processo: payload.processo || '',
      });
    } else {
      setEditingCompra(null);
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
      !formData.tipo ||
      !formData.naturezaObjeto ||
      !formData.objeto ||
      !formData.valor
    ) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (!formData.tipoDocumento || !formData.documento) {
      toast.error('Informe o documento do fornecedor (CPF ou CNPJ)');
      return;
    }

    const payload: CompraDiretaPayload = {
      numero: formData.numero,
      tipo: formData.tipo as TipoCompra,
      naturezaObjeto: formData.naturezaObjeto as NaturezaObjeto,
      objeto: formData.objeto,
      valor: parseCurrencyToNumber(formData.valor),
      dataCompra: formData.dataCompra,
      fornecedor: {
        documento: formData.documento.replace(/\D/g, ''),
        tipoDocumento: formData.tipoDocumento as 'CPF' | 'CNPJ',
        nome: formData.nome,
      },
      fundamentoLegal: formData.fundamentoLegal,
      ...(formData.justificativa && { justificativa: formData.justificativa }),
      ...(formData.processo && { processo: formData.processo }),
    };

    try {
      if (editingCompra) {
        await updateRawData.mutateAsync({
          id: parseInt(editingCompra.id),
          payload: {
            ...payload,
            competency: formData.competency,
          },
        });
        toast.success('Compra Direta atualizada com sucesso!');
      } else {
        await createRawData.mutateAsync({
          unitId: parseInt(formData.unitId),
          module: 'COMPRA_DIRETA',
          competency: formData.competency,
          payload: {
            ...payload,
            competency: formData.competency,
          },
        });
        toast.success('Compra Direta cadastrada com sucesso!');
      }
      setIsDialogOpen(false);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleViewDetails = (compra: RawData) => {
    setSelectedCompra(compra);
    setIsDrawerOpen(true);
  };

  const handleValidate = async (compra: RawData) => {
    await validateRawData.mutateAsync(parseInt(compra.id));
    if (selectedCompra?.id === compra.id) {
      refetchValidations();
    }
  };

  const handleRevalidate = async (compra: RawData) => {
    await revalidateRawData.mutateAsync(parseInt(compra.id));
    if (selectedCompra?.id === compra.id) {
      refetchValidations();
    }
  };

  const handleClearValidations = async (compra: RawData) => {
    await clearValidations.mutateAsync(parseInt(compra.id));
    if (selectedCompra?.id === compra.id) {
      refetchValidations();
    }
  };

  const handleCreateRemittance = async (compra: RawData) => {
    try {
      await createRemittance.mutateAsync({
        rawDataId: parseInt(compra.id),
      });
    } catch {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (compra: RawData) => {
    if (!confirm('Tem certeza que deseja excluir esta compra direta?')) return;
    await deleteRawData.mutateAsync(parseInt(compra.id));
  };

  const clearFilters = () => {
    setUnitFilter('all');
    setCompetencyFilter('');
    setTipoFilter('all');
  };

  const hasFilters =
    unitFilter !== 'all' || competencyFilter !== '' || tipoFilter !== 'all';

  const isSubmitting = createRawData.isPending || updateRawData.isPending;
  const isValidating = validateRawData.isPending || revalidateRawData.isPending;

  // Lista de fundamentos legais baseada no tipo selecionado
  const fundamentosDisponiveis = formData.tipo
    ? fundamentosLegais[formData.tipo as TipoCompra]
    : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="Compras Diretas"
        description="Cadastre e gerencie dispensas e inexigibilidades para transmissão ao e-Sfinge/TCE-MS"
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

              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="DISPENSA">Dispensa</SelectItem>
                  <SelectItem value="INEXIGIBILIDADE">
                    Inexigibilidade
                  </SelectItem>
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

        {/* Compras Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Compras Diretas Cadastradas
                </CardTitle>
                <CardDescription>
                  {filteredCompras.length} compra(s) direta(s) encontrada(s)
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    Nova Compra Direta
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        {editingCompra
                          ? 'Editar Compra Direta'
                          : 'Nova Compra Direta'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCompra
                          ? 'Atualize os dados da compra direta'
                          : 'Preencha os dados para cadastrar uma nova compra direta (dispensa ou inexigibilidade)'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                      {/* Seção: Dados Gerais */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Dados Gerais
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
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
                          <div className="space-y-2">
                            <Label htmlFor="processo">Nº Processo</Label>
                            <Input
                              id="processo"
                              value={formData.processo}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  processo: e.target.value,
                                })
                              }
                              placeholder="Ex: 001/2024"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Seção: Tipo e Classificação */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Tipo e Classificação
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo de Compra *</Label>
                            <Select
                              value={formData.tipo}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  tipo: value as TipoCompra,
                                  fundamentoLegal: '',
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
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
                            <Label htmlFor="naturezaObjeto">
                              Natureza do Objeto *
                            </Label>
                            <Select
                              value={formData.naturezaObjeto}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  naturezaObjeto: value as NaturezaObjeto,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a natureza" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SERVICO">
                                  <span className="flex items-center gap-2">
                                    <Wrench className="h-4 w-4" /> Serviço
                                  </span>
                                </SelectItem>
                                <SelectItem value="OBRA">
                                  <span className="flex items-center gap-2">
                                    <Hammer className="h-4 w-4" /> Obra
                                  </span>
                                </SelectItem>
                                <SelectItem value="MATERIAL">
                                  <span className="flex items-center gap-2">
                                    <Box className="h-4 w-4" /> Material/Bem
                                  </span>
                                </SelectItem>
                                <SelectItem value="LOCACAO">
                                  <span className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" /> Locação
                                  </span>
                                </SelectItem>
                                <SelectItem value="OUTROS">
                                  <span className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" /> Outros
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Alerta para obras */}
                        {formData.naturezaObjeto === 'OBRA' && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-amber-600">
                                Atenção: Obra selecionada
                              </p>
                              <p className="text-muted-foreground mt-1">
                                Obras com valor acima de R$ 330.000,00 podem ser
                                bloqueadas por regra impeditiva de validação.
                                Verifique as regras de validação configuradas.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Seção: Dados da Compra */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Dados da Compra
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="numero">Número *</Label>
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
                            <Label htmlFor="valor">Valor *</Label>
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
                          <div className="space-y-2">
                            <Label htmlFor="dataCompra">Data da Compra *</Label>
                            <Input
                              id="dataCompra"
                              type="date"
                              value={formData.dataCompra}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dataCompra: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="objeto">Objeto *</Label>
                          <Textarea
                            id="objeto"
                            value={formData.objeto}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                objeto: e.target.value,
                              })
                            }
                            placeholder="Descreva o objeto da compra direta..."
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Seção: Fundamentação Legal */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Fundamentação Legal
                        </h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="fundamentoLegal">
                              Fundamento Legal *
                            </Label>
                            <Select
                              value={formData.fundamentoLegal}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  fundamentoLegal: value,
                                })
                              }
                              disabled={!formData.tipo}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    formData.tipo
                                      ? 'Selecione o fundamento'
                                      : 'Selecione o tipo primeiro'
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {fundamentosDisponiveis.map((f) => (
                                  <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="justificativa">Justificativa</Label>
                            <Textarea
                              id="justificativa"
                              value={formData.justificativa}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  justificativa: e.target.value,
                                })
                              }
                              placeholder="Justificativa para a contratação direta..."
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Seção: Fornecedor */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Fornecedor/Contratado
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tipoDocumento">
                              Tipo Documento *
                            </Label>
                            <Select
                              value={formData.tipoDocumento}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  tipoDocumento: value as 'CPF' | 'CNPJ',
                                  documento: '',
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CPF">CPF</SelectItem>
                                <SelectItem value="CNPJ">CNPJ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor="documento">
                              {formData.tipoDocumento || 'CPF/CNPJ'} *
                            </Label>
                            <Input
                              id="documento"
                              value={formData.documento}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  documento: formatDocumento(
                                    e.target.value,
                                    formData.tipoDocumento
                                  ),
                                })
                              }
                              placeholder={
                                formData.tipoDocumento === 'CPF'
                                  ? '000.000.000-00'
                                  : '00.000.000/0000-00'
                              }
                              disabled={!formData.tipoDocumento}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome/Razão Social *</Label>
                          <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) =>
                              setFormData({ ...formData, nome: e.target.value })
                            }
                            placeholder="Nome do fornecedor ou razão social"
                          />
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
                        {editingCompra
                          ? 'Salvar Alterações'
                          : 'Cadastrar Compra'}
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
                <p>Erro ao carregar compras diretas. Tente novamente.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Natureza</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Competência</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompras.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ShoppingCart className="h-8 w-8" />
                          <p>Nenhuma compra direta cadastrada</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog()}
                          >
                            <Plus className="h-4 w-4" />
                            Cadastrar primeira compra
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompras.map((compra) => {
                      const payload = compra.payload as CompraDiretaPayload;
                      return (
                        <TableRow key={compra.id}>
                          <TableCell className="font-mono font-medium">
                            {payload.numero}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payload.tipo === 'DISPENSA'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {payload.tipo === 'DISPENSA'
                                ? 'Dispensa'
                                : 'Inexigibilidade'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {naturezaObjetoIcons[payload.naturezaObjeto]}
                              <span className="text-sm">
                                {naturezaObjetoLabels[payload.naturezaObjeto]}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {compra.unit?.code}
                              </span>
                              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {compra.unit?.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className="truncate block max-w-[180px]"
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
                            <RawDataStatusBadge status={compra.status} />
                          </TableCell>
                          <TableCell>{compra.competency}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(compra)}
                                >
                                  <Eye className="h-4 w-4" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenDialog(compra)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleValidate(compra)}
                                  disabled={isValidating}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Validar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleCreateRemittance(compra)}
                                  disabled={createRemittance.isPending}
                                >
                                  <Package className="h-4 w-4" />
                                  Criar remessa
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(compra)}
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
                  <ShoppingCart className="h-5 w-5" />
                  Compra Direta #{selectedCompra?.id}
                </SheetTitle>
                <SheetDescription>
                  {selectedCompra &&
                    (selectedCompra.payload as CompraDiretaPayload).numero}{' '}
                  - {selectedCompra?.competency}
                </SheetDescription>
              </div>
              {selectedCompra && (
                <RawDataStatusBadge status={selectedCompra.status} />
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
                {selectedCompra &&
                  (() => {
                    const payload =
                      selectedCompra.payload as CompraDiretaPayload;
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
                                {selectedCompra.unit?.code} -{' '}
                                {selectedCompra.unit?.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Competência
                              </p>
                              <p className="font-medium">
                                {selectedCompra.competency}
                              </p>
                            </div>
                            {payload.processo && (
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Nº Processo
                                </p>
                                <p className="font-medium">
                                  {payload.processo}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tipo e Classificação */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Tipo e Classificação
                          </h4>
                          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Tipo
                              </p>
                              <Badge
                                variant={
                                  payload.tipo === 'DISPENSA'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="mt-1"
                              >
                                {tipoCompraLabels[payload.tipo]}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Natureza do Objeto
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {naturezaObjetoIcons[payload.naturezaObjeto]}
                                <span className="font-medium">
                                  {naturezaObjetoLabels[payload.naturezaObjeto]}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dados da Compra */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Dados da Compra
                          </h4>
                          <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
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
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Data
                                </p>
                                <p className="font-medium">
                                  {payload.dataCompra}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Objeto
                              </p>
                              <p className="text-sm">{payload.objeto}</p>
                            </div>
                          </div>
                        </div>

                        {/* Fundamentação Legal */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Fundamentação Legal
                          </h4>
                          <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Fundamento
                              </p>
                              <p className="font-medium">
                                {payload.fundamentoLegal}
                              </p>
                            </div>
                            {payload.justificativa && (
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Justificativa
                                </p>
                                <p className="text-sm">
                                  {payload.justificativa}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Fornecedor */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Fornecedor/Contratado
                          </h4>
                          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {payload.fornecedor.tipoDocumento}
                              </p>
                              <p className="font-mono font-medium">
                                {payload.fornecedor.tipoDocumento === 'CPF'
                                  ? formatCpf(payload.fornecedor.documento)
                                  : formatCnpj(payload.fornecedor.documento)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Nome/Razão Social
                              </p>
                              <p className="font-medium">
                                {payload.fornecedor.nome}
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
                  data={selectedCompra?.payload || {}}
                  title="Payload da Compra Direta"
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
              onClick={() => selectedCompra && handleOpenDialog(selectedCompra)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedCompra && handleValidate(selectedCompra)}
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
              onClick={() => selectedCompra && handleRevalidate(selectedCompra)}
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
                  selectedCompra && handleClearValidations(selectedCompra)
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
                selectedCompra && handleCreateRemittance(selectedCompra)
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
