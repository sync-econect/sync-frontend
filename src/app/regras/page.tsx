'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { ValidationLevelBadge } from '@/components/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, ShieldCheck, Search, Filter, X } from 'lucide-react';
import { mockValidationRules } from '@/lib/mock-data';
import type { ValidationRule, ModuleType, ValidationOperator, ValidationLevel } from '@/types';
import { toast } from 'sonner';

const moduleLabels: Record<ModuleType, string> = {
  CONTRATO: 'Contrato',
  COMPRA_DIRETA: 'Compra Direta',
  EMPENHO: 'Empenho',
  LIQUIDACAO: 'Liquidação',
  PAGAMENTO: 'Pagamento',
  EXECUCAO_ORCAMENTARIA: 'Execução Orçamentária',
};

const operatorLabels: Record<ValidationOperator, string> = {
  EQUALS: 'Igual a',
  NOT_EQUALS: 'Diferente de',
  GREATER_THAN: 'Maior que',
  LESS_THAN: 'Menor que',
  GREATER_OR_EQUAL: 'Maior ou igual a',
  LESS_OR_EQUAL: 'Menor ou igual a',
  CONTAINS: 'Contém',
  NOT_CONTAINS: 'Não contém',
  REGEX: 'Expressão Regular',
  IS_NULL: 'É nulo',
  IS_NOT_NULL: 'Não é nulo',
};

export default function RegrasPage() {
  const [rules, setRules] = useState<ValidationRule[]>(mockValidationRules);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ValidationRule | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    module: 'CONTRATO' as ModuleType,
    field: '',
    operator: 'EQUALS' as ValidationOperator,
    value: '',
    level: 'ALERTA' as ValidationLevel,
    code: '',
    message: '',
    active: true,
  });

  const filteredRules = rules.filter((rule) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !rule.code.toLowerCase().includes(search) &&
        !rule.message.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    if (moduleFilter !== 'all' && rule.module !== moduleFilter) return false;
    if (levelFilter !== 'all' && rule.level !== levelFilter) return false;
    if (showOnlyActive && !rule.active) return false;
    return true;
  });

  const handleOpenDialog = (rule?: ValidationRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        module: rule.module,
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        level: rule.level,
        code: rule.code,
        message: rule.message,
        active: rule.active,
      });
    } else {
      setEditingRule(null);
      setFormData({
        module: 'CONTRATO',
        field: '',
        operator: 'EQUALS',
        value: '',
        level: 'ALERTA',
        code: '',
        message: '',
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.field || !formData.message) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (editingRule) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id ? { ...r, ...formData } : r
        )
      );
      toast.success('Regra atualizada com sucesso!');
    } else {
      const newRule: ValidationRule = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setRules((prev) => [...prev, newRule]);
      toast.success('Regra criada com sucesso!');
    }

    setIsDialogOpen(false);
  };

  const handleToggleActive = (rule: ValidationRule) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === rule.id ? { ...r, active: !r.active } : r
      )
    );
    toast.success(rule.active ? 'Regra desativada' : 'Regra ativada');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setModuleFilter('all');
    setLevelFilter('all');
    setShowOnlyActive(false);
  };

  const hasFilters =
    searchTerm || moduleFilter !== 'all' || levelFilter !== 'all' || showOnlyActive;

  return (
    <DashboardLayout>
      <PageHeader
        title="Regras de Validação"
        description="Gerencie as regras de validação para os dados recebidos"
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código ou mensagem"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[280px]"
                />
              </div>

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

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="IMPEDITIVA">Impeditiva</SelectItem>
                  <SelectItem value="ALERTA">Alerta</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  id="showActive"
                  checked={showOnlyActive}
                  onCheckedChange={setShowOnlyActive}
                />
                <Label htmlFor="showActive" className="text-sm">
                  Apenas ativas
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Regras Cadastradas</CardTitle>
                <CardDescription>
                  {filteredRules.length} regra(s) encontrada(s)
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Regra
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingRule ? 'Editar Regra' : 'Nova Regra de Validação'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingRule
                          ? 'Atualize os dados da regra'
                          : 'Configure uma nova regra de validação'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="code">Código *</Label>
                          <Input
                            id="code"
                            value={formData.code}
                            onChange={(e) =>
                              setFormData({ ...formData, code: e.target.value })
                            }
                            placeholder="Ex: CT001"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="module">Módulo *</Label>
                          <Select
                            value={formData.module}
                            onValueChange={(value: ModuleType) =>
                              setFormData({ ...formData, module: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(moduleLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="field">Campo *</Label>
                        <Input
                          id="field"
                          value={formData.field}
                          onChange={(e) =>
                            setFormData({ ...formData, field: e.target.value })
                          }
                          placeholder="Ex: valor, objeto.tipo"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="operator">Operador *</Label>
                          <Select
                            value={formData.operator}
                            onValueChange={(value: ValidationOperator) =>
                              setFormData({ ...formData, operator: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(operatorLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="value">Valor</Label>
                          <Input
                            id="value"
                            value={formData.value}
                            onChange={(e) =>
                              setFormData({ ...formData, value: e.target.value })
                            }
                            placeholder="Valor para comparação"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="level">Nível *</Label>
                        <Select
                          value={formData.level}
                          onValueChange={(value: ValidationLevel) =>
                            setFormData({ ...formData, level: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IMPEDITIVA">
                              Impeditiva (bloqueia envio)
                            </SelectItem>
                            <SelectItem value="ALERTA">
                              Alerta (apenas aviso)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Mensagem *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          placeholder="Mensagem exibida quando a validação falhar"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id="active"
                          checked={formData.active}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, active: checked })
                          }
                        />
                        <Label htmlFor="active">Regra ativa</Label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingRule ? 'Salvar' : 'Criar'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Campo</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Ativa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ShieldCheck className="h-8 w-8" />
                        <p>Nenhuma regra encontrada</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-medium">
                          {rule.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{moduleLabels[rule.module]}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {rule.field}
                      </TableCell>
                      <TableCell className="text-sm">
                        {operatorLabels[rule.operator]}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {rule.value || '—'}
                      </TableCell>
                      <TableCell>
                        <ValidationLevelBadge level={rule.level} />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.active}
                          onCheckedChange={() => handleToggleActive(rule)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(rule)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

