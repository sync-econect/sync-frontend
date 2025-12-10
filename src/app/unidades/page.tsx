'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Building2 } from 'lucide-react';
import { mockUnits } from '@/lib/mock-data';
import type { Unit, Environment } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function UnidadesPage() {
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    tokenProducao: '',
    tokenHomologacao: '',
    ambiente: 'HOMOLOGACAO' as Environment,
    active: true,
  });

  const handleOpenDialog = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        code: unit.code,
        name: unit.name,
        tokenProducao: unit.tokenProducao || '',
        tokenHomologacao: unit.tokenHomologacao || '',
        ambiente: unit.ambiente,
        active: unit.active,
      });
    } else {
      setEditingUnit(null);
      setFormData({
        code: '',
        name: '',
        tokenProducao: '',
        tokenHomologacao: '',
        ambiente: 'HOMOLOGACAO',
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (editingUnit) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === editingUnit.id
            ? { ...u, ...formData }
            : u
        )
      );
      toast.success('Unidade atualizada com sucesso!');
    } else {
      const newUnit: Unit = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setUnits((prev) => [...prev, newUnit]);
      toast.success('Unidade criada com sucesso!');
    }

    setIsDialogOpen(false);
  };

  const handleToggleActive = (unit: Unit) => {
    setUnits((prev) =>
      prev.map((u) =>
        u.id === unit.id ? { ...u, active: !u.active } : u
      )
    );
    toast.success(
      unit.active ? 'Unidade desativada' : 'Unidade ativada'
    );
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Unidades Gestoras"
        description="Gerencie as unidades gestoras e suas credenciais de integração"
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Unidades Cadastradas</CardTitle>
                <CardDescription>
                  {units.length} unidade(s) cadastrada(s)
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Unidade
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingUnit ? 'Editar Unidade' : 'Nova Unidade Gestora'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingUnit
                          ? 'Atualize os dados da unidade gestora'
                          : 'Preencha os dados para cadastrar uma nova unidade'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code" className="text-right">
                          Código *
                        </Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) =>
                            setFormData({ ...formData, code: e.target.value })
                          }
                          className="col-span-3"
                          placeholder="Ex: 090101"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nome *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="col-span-3"
                          placeholder="Ex: Secretaria de Administração"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ambiente" className="text-right">
                          Ambiente
                        </Label>
                        <Select
                          value={formData.ambiente}
                          onValueChange={(value: Environment) =>
                            setFormData({ ...formData, ambiente: value })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HOMOLOGACAO">Homologação</SelectItem>
                            <SelectItem value="PRODUCAO">Produção</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tokenHom" className="text-right">
                          Token Hom.
                        </Label>
                        <Input
                          id="tokenHom"
                          type="password"
                          value={formData.tokenHomologacao}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tokenHomologacao: e.target.value,
                            })
                          }
                          className="col-span-3"
                          placeholder="Token de homologação"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tokenProd" className="text-right">
                          Token Prod.
                        </Label>
                        <Input
                          id="tokenProd"
                          type="password"
                          value={formData.tokenProducao}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tokenProducao: e.target.value,
                            })
                          }
                          className="col-span-3"
                          placeholder="Token de produção"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="active" className="text-right">
                          Ativa
                        </Label>
                        <div className="col-span-3">
                          <Switch
                            id="active"
                            checked={formData.active}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, active: checked })
                            }
                          />
                        </div>
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
                        {editingUnit ? 'Salvar' : 'Criar'}
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Ambiente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Building2 className="h-8 w-8" />
                        <p>Nenhuma unidade cadastrada</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog()}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Cadastrar primeira unidade
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-mono font-medium">
                        {unit.code}
                      </TableCell>
                      <TableCell>{unit.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            unit.ambiente === 'PRODUCAO'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }
                        >
                          {unit.ambiente === 'PRODUCAO'
                            ? 'Produção'
                            : 'Homologação'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={unit.active}
                          onCheckedChange={() => handleToggleActive(unit)}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(unit.createdAt), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(unit)}
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

