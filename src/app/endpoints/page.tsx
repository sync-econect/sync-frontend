'use client';

import { useState, useCallback } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import {
  Plus,
  Pencil,
  Settings,
  Loader2,
  Code2,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import {
  useEndpointConfigs,
  useCreateEndpointConfig,
  useUpdateEndpointConfig,
  useToggleEndpointConfigActive,
} from '@/hooks/use-endpoint-configs';
import type {
  EndpointConfig,
  ModuleType,
  Environment,
  FieldSchema,
  FieldSchemaItem,
  FieldType,
} from '@/types';
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

const fieldTypeLabels: Record<FieldType, string> = {
  STRING: 'Texto',
  NUMBER: 'Número',
  BOOLEAN: 'Booleano',
  DATE: 'Data',
  DATETIME: 'Data/Hora',
  ARRAY: 'Lista',
  OBJECT: 'Objeto',
};

const fieldTypeColors: Record<FieldType, string> = {
  STRING: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  NUMBER: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  BOOLEAN: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  DATE: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  DATETIME: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  ARRAY: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  OBJECT: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
};

// Componente para exibir/editar um campo do schema
interface FieldItemProps {
  field: FieldSchemaItem;
  depth: number;
  onUpdate: (field: FieldSchemaItem) => void;
  onDelete: () => void;
  onAddChild?: () => void;
}

function FieldItem({
  field,
  depth,
  onUpdate,
  onDelete,
  onAddChild,
}: FieldItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren =
    (field.type === 'OBJECT' || field.type === 'ARRAY') &&
    field.children &&
    field.children.length > 0;
  const canHaveChildren = field.type === 'OBJECT' || field.type === 'ARRAY';

  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        style={{ marginLeft: depth * 24 }}
      >
        {canHaveChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        {!canHaveChildren && <div className="w-6" />}

        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />

        <div className="flex-1 grid grid-cols-[1fr_120px_80px_1fr] gap-2 items-center">
          <Input
            value={field.name}
            onChange={(e) => onUpdate({ ...field, name: e.target.value })}
            placeholder="nome_campo"
            className="h-8 font-mono text-sm"
          />

          <Select
            value={field.type}
            onValueChange={(value: FieldType) =>
              onUpdate({
                ...field,
                type: value,
                children:
                  value === 'OBJECT' || value === 'ARRAY'
                    ? field.children || []
                    : undefined,
              })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(fieldTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Switch
              id={`required-${field.name}`}
              checked={field.required ?? false}
              onCheckedChange={(checked) =>
                onUpdate({ ...field, required: checked })
              }
              className="scale-90"
            />
            <Label
              htmlFor={`required-${field.name}`}
              className="text-xs cursor-pointer"
            >
              Req.
            </Label>
          </div>

          <Input
            value={field.description || ''}
            onChange={(e) =>
              onUpdate({ ...field, description: e.target.value })
            }
            placeholder="Descrição do campo"
            className="h-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {canHaveChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onAddChild}
              title="Adicionar campo filho"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            title="Remover campo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {canHaveChildren && isExpanded && field.children && (
        <div className="space-y-2">
          {field.children.map((child, index) => (
            <FieldItem
              key={`${child.name}-${index}`}
              field={child}
              depth={depth + 1}
              onUpdate={(updatedChild) => {
                const newChildren = [...(field.children || [])];
                newChildren[index] = updatedChild;
                onUpdate({ ...field, children: newChildren });
              }}
              onDelete={() => {
                const newChildren = (field.children || []).filter(
                  (_, i) => i !== index
                );
                onUpdate({ ...field, children: newChildren });
              }}
              onAddChild={() => {
                const newChildren = [...(field.children || [])];
                newChildren[index] = {
                  ...child,
                  children: [
                    ...(child.children || []),
                    { name: '', type: 'STRING' as FieldType, required: false },
                  ],
                };
                onUpdate({ ...field, children: newChildren });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Dialog para editar o schema de campos
interface FieldSchemaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: EndpointConfig;
  onSave: (schema: FieldSchema) => void;
  isSaving: boolean;
}

function FieldSchemaDialog({
  open,
  onOpenChange,
  endpoint,
  onSave,
  isSaving,
}: FieldSchemaDialogProps) {
  const [schema, setSchema] = useState<FieldSchema>(() => ({
    fields: endpoint.fieldSchema?.fields || [],
  }));

  const handleAddField = useCallback(() => {
    setSchema((prev) => ({
      fields: [
        ...prev.fields,
        { name: '', type: 'STRING' as FieldType, required: false },
      ],
    }));
  }, []);

  const handleUpdateField = useCallback(
    (index: number, updatedField: FieldSchemaItem) => {
      setSchema((prev) => {
        const newFields = [...prev.fields];
        newFields[index] = updatedField;
        return { fields: newFields };
      });
    },
    []
  );

  const handleDeleteField = useCallback((index: number) => {
    setSchema((prev) => ({
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddChildToField = useCallback((index: number) => {
    setSchema((prev) => {
      const newFields = [...prev.fields];
      newFields[index] = {
        ...newFields[index],
        children: [
          ...(newFields[index].children || []),
          { name: '', type: 'STRING' as FieldType, required: false },
        ],
      };
      return { fields: newFields };
    });
  }, []);

  const handleSave = () => {
    // Validar campos vazios
    const hasEmptyNames = schema.fields.some((f) => !f.name.trim());
    if (hasEmptyNames) {
      toast.error('Todos os campos devem ter um nome');
      return;
    }
    onSave(schema);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Schema de Campos - {moduleLabels[endpoint.module]}
          </DialogTitle>
          <DialogDescription>
            Defina a estrutura de campos do payload para o endpoint{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              {endpoint.endpoint}
            </code>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {schema.fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Code2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Nenhum campo definido no schema
                  </p>
                  <p className="text-xs mt-1">
                    Clique em &quot;Adicionar Campo&quot; para começar
                  </p>
                </div>
              ) : (
                schema.fields.map((field, index) => (
                  <FieldItem
                    key={`${field.name}-${index}`}
                    field={field}
                    depth={0}
                    onUpdate={(updatedField) =>
                      handleUpdateField(index, updatedField)
                    }
                    onDelete={() => handleDeleteField(index)}
                    onAddChild={() => handleAddChildToField(index)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" onClick={handleAddField}>
            <Plus className="h-4 w-4" />
            Adicionar Campo
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar Schema
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EndpointsPage() {
  const { data: endpoints = [], isLoading, isError } = useEndpointConfigs();
  const createEndpoint = useCreateEndpointConfig();
  const updateEndpoint = useUpdateEndpointConfig();
  const toggleActive = useToggleEndpointConfigActive();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<EndpointConfig | null>(
    null
  );

  // Estado para o dialog de schema
  const [isSchemaDialogOpen, setIsSchemaDialogOpen] = useState(false);
  const [schemaEndpoint, setSchemaEndpoint] = useState<EndpointConfig | null>(
    null
  );

  const [formData, setFormData] = useState({
    module: 'CONTRATO' as ModuleType,
    endpoint: '',
    method: 'POST',
    ambiente: 'HOMOLOGACAO' as Environment,
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
        ambiente: endpoint.ambiente,
        active: endpoint.active,
        description: endpoint.description || '',
      });
    } else {
      setEditingEndpoint(null);
      setFormData({
        module: 'CONTRATO',
        endpoint: '',
        method: 'POST',
        ambiente: 'HOMOLOGACAO',
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
            ambiente: formData.ambiente,
            description: formData.description || undefined,
            active: formData.active,
          },
        });
      } else {
        await createEndpoint.mutateAsync({
          module: formData.module,
          endpoint: formData.endpoint,
          method: formData.method,
          ambiente: formData.ambiente,
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

  const handleOpenSchemaDialog = (endpoint: EndpointConfig) => {
    setSchemaEndpoint(endpoint);
    setIsSchemaDialogOpen(true);
  };

  const handleSaveSchema = async (schema: FieldSchema) => {
    if (!schemaEndpoint) return;

    try {
      await updateEndpoint.mutateAsync({
        id: parseInt(schemaEndpoint.id),
        payload: { fieldSchema: schema },
      });
      setIsSchemaDialogOpen(false);
      setSchemaEndpoint(null);
    } catch {
      // Error is handled in the hook
    }
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
                        <Label htmlFor="ambiente">Ambiente</Label>
                        <Select
                          value={formData.ambiente}
                          onValueChange={(value: Environment) =>
                            setFormData({ ...formData, ambiente: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HOMOLOGACAO">Homologação</SelectItem>
                            <SelectItem value="PRODUCAO">Produção</SelectItem>
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
                    <TableHead>Ambiente</TableHead>
                    <TableHead>Schema</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
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
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              endpoint.ambiente === 'PRODUCAO'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }
                          >
                            {endpoint.ambiente === 'PRODUCAO'
                              ? 'Produção'
                              : 'Homologação'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 gap-1"
                            onClick={() => handleOpenSchemaDialog(endpoint)}
                          >
                            <Code2 className="h-3.5 w-3.5" />
                            {endpoint.fieldSchema?.fields?.length ? (
                              <Badge
                                variant="secondary"
                                className="h-5 px-1.5 text-xs"
                              >
                                {endpoint.fieldSchema.fields.length}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                Definir
                              </span>
                            )}
                          </Button>
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

      {/* Dialog de Schema de Campos */}
      {schemaEndpoint && (
        <FieldSchemaDialog
          open={isSchemaDialogOpen}
          onOpenChange={(open) => {
            setIsSchemaDialogOpen(open);
            if (!open) setSchemaEndpoint(null);
          }}
          endpoint={schemaEndpoint}
          onSave={handleSaveSchema}
          isSaving={updateEndpoint.isPending}
        />
      )}
    </DashboardLayout>
  );
}
