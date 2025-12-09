"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { JsonViewer } from "@/components/json-viewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Filter, Eye, CheckCircle2, AlertCircle, Clock } from "lucide-react"

const logsData = [
  {
    id: "LOG-001",
    acao: "Carregamento de dados",
    usuario: "admin@prefeitura.ms.gov.br",
    timestamp: "26/01/2024 14:20:15",
    status: "Sucesso",
    detalhes: {
      arquivo: "dados-origem.json",
      registros: 5,
      tamanho: "2.3 KB",
    },
  },
  {
    id: "LOG-002",
    acao: "Transformação ETL",
    usuario: "admin@prefeitura.ms.gov.br",
    timestamp: "26/01/2024 14:25:32",
    status: "Sucesso",
    detalhes: {
      registrosEntrada: 5,
      registrosSaida: 5,
      tempoProcessamento: "0.84s",
    },
  },
  {
    id: "LOG-003",
    acao: "Validação",
    usuario: "admin@prefeitura.ms.gov.br",
    timestamp: "26/01/2024 14:28:45",
    status: "Aviso",
    detalhes: {
      erros: 2,
      avisos: 2,
      validos: 1,
      regrasAplicadas: 15,
    },
  },
  {
    id: "LOG-004",
    acao: "Geração de remessa",
    usuario: "admin@prefeitura.ms.gov.br",
    timestamp: "26/01/2024 14:30:10",
    status: "Sucesso",
    detalhes: {
      versao: "v3",
      registros: 5,
      hash: "a3f5b9c2d1e8f4a7b6c9d2e5f8a1b4c7",
    },
  },
  {
    id: "LOG-005",
    acao: "Envio ao TCE",
    usuario: "admin@prefeitura.ms.gov.br",
    timestamp: "26/01/2024 14:35:22",
    status: "Sucesso",
    detalhes: {
      protocolo: "TCE-2024-000456",
      endpoint: "https://api.tce.ms.gov.br/v2/remessas",
      statusCode: 200,
      responseTime: "1.24s",
    },
  },
]

export default function LogsPage() {
  const [filterAction, setFilterAction] = useState<string>("all")
  const [selectedLog, setSelectedLog] = useState<(typeof logsData)[0] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredLogs = logsData.filter((log) => {
    if (filterAction === "all") return true
    return log.acao.toLowerCase().includes(filterAction.toLowerCase())
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Sucesso":
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case "Erro":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "Aviso":
        return <Clock className="h-4 w-4 text-warning" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      Sucesso: "bg-success/20 text-success",
      Erro: "bg-destructive/20 text-destructive",
      Aviso: "bg-warning/20 text-warning",
    }
    return variants[status as keyof typeof variants] || "bg-muted text-muted-foreground"
  }

  const handleViewDetails = (log: (typeof logsData)[0]) => {
    setSelectedLog(log)
    setDialogOpen(true)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1">
        <PageHeader title="Logs e Auditoria" description="Histórico completo de ações e eventos do sistema" />

        <div className="space-y-6 p-8">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Total de Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{logsData.length}</p>
                <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Operações Bem-sucedidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">
                  {logsData.filter((l) => l.status === "Sucesso").length}
                </p>
                <p className="text-xs text-muted-foreground">80% do total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  Avisos/Erros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-warning">
                  {logsData.filter((l) => l.status !== "Sucesso").length}
                </p>
                <p className="text-xs text-muted-foreground">Requerem atenção</p>
              </CardContent>
            </Card>
          </div>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Histórico de Ações</CardTitle>
                  <CardDescription>Trilha de auditoria completa do fluxo da POC</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="w-[200px] bg-transparent">
                      <SelectValue placeholder="Filtrar por ação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Ações</SelectItem>
                      <SelectItem value="carregamento">Carregamento</SelectItem>
                      <SelectItem value="transformação">Transformação</SelectItem>
                      <SelectItem value="validação">Validação</SelectItem>
                      <SelectItem value="envio">Envio ao TCE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[100px] text-right">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.id}</TableCell>
                        <TableCell className="font-medium">{log.acao}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.usuario}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.timestamp}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(log.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(log.status)}
                              {log.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                            className="h-8 bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Detalhes do Log
            </DialogTitle>
            <DialogDescription>Informações completas sobre a ação executada</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">ID do Log</p>
                  <p className="font-mono text-sm font-medium">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={getStatusBadge(selectedLog.status)}>{selectedLog.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ação Executada</p>
                  <p className="text-sm font-medium">{selectedLog.acao}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timestamp</p>
                  <p className="text-sm font-medium">{selectedLog.timestamp}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs text-muted-foreground">Usuário</p>
                <p className="text-sm font-medium">{selectedLog.usuario}</p>
              </div>

              <div>
                <p className="mb-2 text-xs text-muted-foreground">Detalhes Técnicos</p>
                <JsonViewer data={selectedLog.detalhes} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
