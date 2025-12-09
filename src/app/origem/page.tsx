"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, CheckCircle2, FileJson, Info } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"

const sampleData = [
  { id: 1, orgao: "Secretaria de Saúde", valor: "R$ 125.000,00", data: "2024-01-15", status: "Ativo" },
  { id: 2, orgao: "Secretaria de Educação", valor: "R$ 340.500,00", data: "2024-01-18", status: "Ativo" },
  { id: 3, orgao: "Secretaria de Obras", valor: "R$ 89.200,00", data: "2024-01-20", status: "Ativo" },
  { id: 4, orgao: "Secretaria de Transporte", valor: "R$ 215.800,00", data: "2024-01-22", status: "Ativo" },
  { id: 5, orgao: "Secretaria de Cultura", valor: "R$ 52.300,00", data: "2024-01-25", status: "Ativo" },
]

export default function OrigemPage() {
  const [dataLoaded, setDataLoaded] = useState(false)

  const handleLoadData = () => {
    setDataLoaded(true)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1">
        <PageHeader
          title="Origem dos Dados"
          description="Carregue ou visualize os dados brutos da fonte de origem"
          action={
            <Button onClick={handleLoadData} disabled={dataLoaded}>
              <Upload className="mr-2 h-4 w-4" />
              Carregar Dados
            </Button>
          }
        />

        <div className="space-y-6 p-8">
          {/* Info Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-5 w-5 text-primary" />
                Módulo: Execução Orçamentária
              </CardTitle>
              <CardDescription>
                Carregue arquivos JSON ou CSV com os dados de execução orçamentária para processamento
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload de Arquivo</CardTitle>
              <CardDescription>Arraste e solte ou clique para selecionar o arquivo</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                  dataLoaded
                    ? "border-success bg-success/10"
                    : "border-border bg-secondary/30 hover:border-primary hover:bg-secondary/50"
                }`}
                onClick={handleLoadData}
              >
                {dataLoaded ? (
                  <>
                    <CheckCircle2 className="h-12 w-12 text-success" />
                    <p className="mt-4 text-sm font-medium text-success">Dados carregados com sucesso!</p>
                    <p className="mt-1 text-xs text-muted-foreground">5 registros importados</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm font-medium text-foreground">Clique para carregar arquivo</p>
                    <p className="mt-1 text-xs text-muted-foreground">Formatos suportados: JSON, CSV</p>
                  </>
                )}
              </div>

              {dataLoaded && (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <FileJson className="mr-2 h-4 w-4" />
                    dados-origem.json
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Remover
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Table */}
          {dataLoaded && (
            <Card>
              <CardHeader>
                <CardTitle>Dados Brutos Carregados</CardTitle>
                <CardDescription>Visualização dos registros importados da origem</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 border-success bg-success/10">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    Todos os registros foram carregados corretamente. Prossiga para a etapa de transformação.
                  </AlertDescription>
                </Alert>

                <div className="overflow-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>ID</TableHead>
                        <TableHead>Órgão</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-mono text-xs">{row.id}</TableCell>
                          <TableCell>{row.orgao}</TableCell>
                          <TableCell className="font-semibold">{row.valor}</TableCell>
                          <TableCell className="text-muted-foreground">{row.data}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
                              {row.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Exibindo 5 de 5 registros</p>
                  <Button className="bg-primary">Prosseguir para Transformação</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
