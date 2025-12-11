'use client';

import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Settings, Loader2 } from 'lucide-react';
import {
  useEndpointConfigs,
  useCreateEndpointConfig,
  useUpdateEndpointConfig,
  useToggleEndpointConfigActive,
} from '@/hooks/use-endpoint-configs';
import type { EndpointConfig, ModuleType } from '@/types';
import { toast } from 'sonner';

const moduleLabels: Record<ModuleType, string> = {
  CONTRATO: 'Contrato',
  COMPRA_DIRETA: 'Compra Direta',
  EMPENHO: 'Empenho',
  LIQUIDACAO: 'Liquidação',
  PAGAMENTO: 'Pagamento',
  EXECUCAO_ORCAMENTARIA: 'Execução Orçamentária',
};

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  POST: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  PUT: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  PATCH: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  DELETE: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function EndpointsPage() {
  const { data: endpoints = [], isLoading, isError } = useEndpointConfigs();
  const createEndpoint = useCreateEndpointConfig();
  const updateEndpoint = useUpdateEndpointConfig();
  const toggleActive = useToggleEndpointConfigActive();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<EndpointConfig | null>(
    null
  );

  const [formData, setFormData] = useState({
    module: 'CONTRATO' as ModuleType,
    endpoint: '',
    method: 'POST',
    active: true,
    description: '',
  });

  const handleOpenDialog = (endpoint?: EndpointConfig) => {
    if (endpoint) {
      setEditingEndpoint(endpoint);
      setFormData({
        module: endpoint.module,
        endpoint: endpoint.endpoint,
        method: endpoint.method,
        active: endpoint.active,
        description: endpoint.description || '',
      });
    } else {
      setEditingEndpoint(null);
      setFormData({
        module: 'CONTRATO',
        endpoint: '',
        method: 'POST',
        active: true,
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.endpoint) {
      toast.error('Preencha o endpoint');
      return;
    }

    try {
      if (editingEndpoint) {
        await updateEndpoint.mutateAsync({
          id: parseInt(editingEndpoint.id),
          payload: {
            module: formData.module,
            endpoint: formData.endpoint,
            method: formData.method,
            description: formData.description || undefined,
            active: formData.active,
          },
        });
      } else {
        await createEndpoint.mutateAsync({
          module: formData.module,
          endpoint: formData.endpoint,
          method: formData.method,
          description: formData.description || undefined,
          active: formData.active,
        });
      }
      setIsDialogOpen(false);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleToggleActive = (endpoint: EndpointConfig) => {
    toggleActive.mutate({
      id: parseInt(endpoint.id),
      active: !endpoint.active,
    });
  };

  const isSubmitting = createEndpoint.isPending || updateEndpoint.isPending;

  return (
    <DashboardLayout>
      <PageHeader
        title="Configuração de Endpoints"
        description="Configure os endpoints de comunicação com o e-Sfinge"
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Endpoints Configurados</CardTitle>
                <CardDescription>
                  {endpoints.length} endpoint(s) configurado(s)
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    Novo Endpoint
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingEndpoint ? 'Editar Endpoint' : 'Novo Endpoint'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure o endpoint de comunicação para um módulo
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="module">Módulo</Label>
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
                            {Object.entries(moduleLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endpoint">Endpoint *</Label>
                        <Input
                          id="endpoint"
                          value={formData.endpoint}
                          onChange={(e) =>
                            setFormData({ ...formData, endpoint: e.target.value })
                          }
                          placeholder="/api/v1/contratos"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="method">Método HTTP</Label>
                        <Select
                          value={formData.method}
                          onValueChange={(value) =>
                            setFormData({ ...formData, method: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Descrição do endpoint"
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
                        <Label htmlFor="active">Ativo</Label>
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
                        {editingEndpoint ? 'Salvar' : 'Criar'}
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
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-destructive">
                <p>Erro ao carregar endpoints. Tente novamente.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Settings className="h-8 w-8" />
                          <p>Nenhum endpoint configurado</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog()}
                          >
                            <Plus className="h-4 w-4" />
                            Configurar primeiro endpoint
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    endpoints.map((endpoint) => (
                      <TableRow key={endpoint.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {moduleLabels[endpoint.module]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {endpoint.endpoint}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={methodColors[endpoint.method] || ''}
                          >
                            {endpoint.method}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {endpoint.description || '—'}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={endpoint.active}
                            onCheckedChange={() => handleToggleActive(endpoint)}
                            disabled={toggleActive.isPending}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(endpoint)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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
    </DashboardLayout>
  );
}
