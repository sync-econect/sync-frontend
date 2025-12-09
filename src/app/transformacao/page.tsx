"use client"

import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Stepper, type Step } from "@/components/stepper"
import { JsonViewer } from "@/components/json-viewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, Building2, Hash } from "lucide-react"

const steps: Step[] = [
  { title: "Origem", status: "completed" },
  { title: "Transformação", status: "current" },
  { title: "Validação", status: "upcoming" },
  { title: "Remessa", status: "upcoming" },
]

const rawData = {
  id: 1,
  orgao: "Secretaria de Saúde",
  valor: 125000.0,
  data: "2024-01-15",
  status: "Ativo",
}

const transformedData = {
  unidadeGestora: "350001",
  competencia: "01/2024",
  modulo: "execucao_orcamentaria",
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
      validado: true,
    },
  ],
  metadados: {
    dataTransformacao: "2024-01-26T14:30:00Z",
    versaoLayout: "2.1.5",
    quantidadeRegistros: 1,
  },
}

export default function TransformacaoPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1">
        <PageHeader
          title="Transformação ETL"
          description="Visualize como os dados foram convertidos para o layout e-Sfinge"
        />

        <div className="space-y-6 p-8">
          {/* Stepper */}
          <Card>
            <CardContent className="pt-6">
              <Stepper steps={steps} />
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Competência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">01/2024</p>
                <p className="text-xs text-muted-foreground">Janeiro de 2024</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Unidade Gestora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">350001</p>
                <p className="text-xs text-muted-foreground">Prefeitura Municipal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  Registros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Transformados com sucesso</p>
              </CardContent>
            </Card>
          </div>

          {/* Comparison */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dados Brutos</CardTitle>
                    <CardDescription>Formato original da fonte</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                    Origem
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <JsonViewer data={rawData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dados Transformados</CardTitle>
                    <CardDescription>Layout e-Sfinge/TCE-MS</CardDescription>
                  </div>
                  <Badge className="bg-success text-success-foreground">Transformado</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <JsonViewer data={transformedData} />
              </CardContent>
            </Card>
          </div>

          {/* Transformation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Transformação</CardTitle>
              <CardDescription>Mapeamento e conversões aplicadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">orgao</p>
                    <p className="text-xs text-muted-foreground">Campo origem</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">registros[].orgao.nome</p>
                    <p className="text-xs text-muted-foreground">Campo e-Sfinge</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">valor</p>
                    <p className="text-xs text-muted-foreground">Tipo: Number</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">registros[].valor</p>
                    <p className="text-xs text-muted-foreground">Tipo: Decimal(2)</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">data</p>
                    <p className="text-xs text-muted-foreground">Formato: YYYY-MM-DD</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">registros[].dataEmissao</p>
                    <p className="text-xs text-muted-foreground">Formato: ISO 8601</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button className="bg-primary">
                  Validar Dados
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
