"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle2, AlertTriangle, Filter } from "lucide-react"

const validationResults = [
  {
    codigo: "VAL001",
    tipo: "Erro",
    descricao: "Campo obrigatório 'numeroEmpenho' não informado",
    campo: "numeroEmpenho",
    modulo: "Empenho",
  },
  {
    codigo: "VAL002",
    tipo: "Aviso",
    descricao: "Data de emissão superior à data atual",
    campo: "dataEmissao",
    modulo: "Empenho",
  },
  {
    codigo: "VAL003",
    tipo: "Erro",
    descricao: "Valor não pode ser negativo",
    campo: "valor",
    modulo: "Liquidação",
  },
  {
    codigo: "VAL004",
    tipo: "Aviso",
    descricao: "CPF do credor não validado na Receita Federal",
    campo: "cpfCnpj",
    modulo: "Pagamento",
  },
  {
    codigo: "VAL005",
    tipo: "Válido",
    descricao: "Registro em conformidade com as regras do TCE",
    campo: "todos",
    modulo: "Execução Orçamentária",
  },
]

export default function ValidacaoPage() {
  const [filterType, setFilterType] = useState<string>("all")

  const filteredResults = validationResults.filter((result) => {
    if (filterType === "all") return true
    return result.tipo.toLowerCase() === filterType.toLowerCase()
  })

  const errorCount = validationResults.filter((r) => r.tipo === "Erro").length
  const warningCount = validationResults.filter((r) => r.tipo === "Aviso").length
  const validCount = validationResults.filter((r) => r.tipo === "Válido").length

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "Erro":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "Aviso":
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case "Válido":
        return <CheckCircle2 className="h-4 w-4 text-success" />
      default:
        return null
    }
  }

  const getTypeBadge = (tipo: string) => {
    const variants = {
      Erro: "bg-destructive/20 text-destructive",
      Aviso: "bg-warning/20 text-warning",
      Válido: "bg-success/20 text-success",
    }
    return variants[tipo as keyof typeof variants] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1">
        <PageHeader
          title="Validação"
          description="Verifique erros e avisos retornados pela Engine de Validação"
          action={
            <Button className="bg-primary" disabled={errorCount > 0}>
              Gerar Remessa
            </Button>
          }
        />

        <div className="space-y-6 p-8">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-destructive/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Erros Encontrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-destructive">{errorCount}</p>
                <p className="text-xs text-muted-foreground">Devem ser corrigidos</p>
              </CardContent>
            </Card>

            <Card className="border-warning/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Avisos Encontrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-warning">{warningCount}</p>
                <p className="text-xs text-muted-foreground">Requerem atenção</p>
              </CardContent>
            </Card>

            <Card className="border-success/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Registros Válidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-success">{validCount}</p>
                <p className="text-xs text-muted-foreground">Prontos para envio</p>
              </CardContent>
            </Card>
          </div>

          {/* Validation Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resultados da Validação</CardTitle>
                  <CardDescription>Regras de validação aplicadas aos dados transformados</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px] bg-transparent">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="erro">Erros</SelectItem>
                      <SelectItem value="aviso">Avisos</SelectItem>
                      <SelectItem value="válido">Válidos</SelectItem>
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
                      <TableHead className="w-[100px]">Código</TableHead>
                      <TableHead className="w-[120px]">Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-[150px]">Campo</TableHead>
                      <TableHead className="w-[150px]">Módulo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">{result.codigo}</TableCell>
                        <TableCell>
                          <Badge className={getTypeBadge(result.tipo)}>
                            <span className="flex items-center gap-1">
                              {getTypeIcon(result.tipo)}
                              {result.tipo}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{result.descricao}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{result.campo}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{result.modulo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {errorCount > 0 && (
                <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive">Erros impeditivos encontrados</p>
                      <p className="mt-1 text-xs text-destructive/80">
                        Corrija os {errorCount} erro(s) antes de gerar a remessa. Avisos não impedem o envio.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
