"use client"

import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { JsonViewer } from "@/components/json-viewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Calendar, Building2, FileJson, Send } from "lucide-react"

const remessaData = {
  cabecalho: {
    unidadeGestora: "350001",
    competencia: "01/2024",
    modulo: "EXECUCAO_ORCAMENTARIA",
    versaoLayout: "2.1.5",
    dataGeracao: "2024-01-26T14:30:00Z",
  },
  registros: [
    {
      tipo: "EMPENHO",
      numero: "2024/000123",
      orgao: {
        codigo: "01",
        nome: "Secretaria de Saúde",
      },
      valor: 125000.0,
      dataEmissao: "2024-01-15T00:00:00Z",
      situacao: "ATIVO",
    },
    {
      tipo: "LIQUIDACAO",
      numero: "2024/000089",
      empenhoReferencia: "2024/000123",
      valor: 125000.0,
      dataLiquidacao: "2024-01-20T00:00:00Z",
    },
  ],
  metadados: {
    quantidadeRegistros: 5,
    valorTotal: 895500.0,
    hash: "a3f5b9c2d1e8f4a7b6c9d2e5f8a1b4c7",
  },
}

const versionHistory = [
  { versao: "v3", data: "26/01/2024 14:30", registros: 5, status: "Atual" },
  { versao: "v2", data: "26/01/2024 10:15", registros: 4, status: "Anterior" },
  { versao: "v1", data: "25/01/2024 16:45", registros: 3, status: "Anterior" },
]

export default function RemessaPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1">
        <PageHeader
          title="Remessa"
          description="Visualize o pacote final que será enviado ao TCE-MS"
          action={
            <Button className="bg-primary">
              <Send className="mr-2 h-4 w-4" />
              Enviar ao TCE
            </Button>
          }
        />

        <div className="space-y-6 p-8">
          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Unidade Gestora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">350001</p>
                <p className="text-xs text-muted-foreground">Prefeitura Municipal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Competência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">01/2024</p>
                <p className="text-xs text-muted-foreground">Janeiro de 2024</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileJson className="h-4 w-4" />
                  Módulo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-balance text-sm font-bold">Execução Orçamentária</p>
                <p className="text-xs text-muted-foreground">Layout v2.1.5</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Package className="h-4 w-4" />
                  Registros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">R$ 895.500,00</p>
              </CardContent>
            </Card>
          </div>

          {/* Remessa JSON */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Estrutura da Remessa</CardTitle>
                  <CardDescription>Pacote completo no formato e-Sfinge/TCE-MS</CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground">Pronta para Envio</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <JsonViewer data={remessaData} title="remessa-350001-012024.json" />
            </CardContent>
          </Card>

          {/* Version History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Versões</CardTitle>
              <CardDescription>Versões anteriores desta remessa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Versão</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Registros</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versionHistory.map((version, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono font-semibold">{version.versao}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{version.data}</TableCell>
                        <TableCell className="text-sm">{version.registros} registros</TableCell>
                        <TableCell>
                          {version.status === "Atual" ? (
                            <Badge className="bg-success/20 text-success">Atual</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-transparent text-muted-foreground">
                              Anterior
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 bg-transparent">
                            Visualizar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-medium text-foreground">Remessa validada e pronta para envio</p>
                  <p className="text-muted-foreground">
                    Ao clicar em &quot;Enviar ao TCE&quot;, a remessa será submetida ao sistema e-Sfinge
                  </p>
                </div>
                <Button size="lg" className="bg-primary">
                  <Send className="mr-2 h-5 w-5" />
                  Enviar ao TCE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
