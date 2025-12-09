'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { PageHeader } from '@/components/page-header';
import { JsonViewer } from '@/components/json-viewer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, FileText, RefreshCw } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

const requestData = {
  method: 'POST',
  endpoint: 'https://api.tce.ms.gov.br/v2/remessas',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer eyJhbGc...token',
    'X-UG-Code': '350001',
  },
  body: {
    unidadeGestora: '350001',
    competencia: '01/2024',
    modulo: 'EXECUCAO_ORCAMENTARIA',
    registros: 5,
    hash: 'a3f5b9c2d1e8f4a7b6c9d2e5f8a1b4c7',
  },
};

const responseData = {
  status: 'success',
  protocolo: 'TCE-2024-000456',
  dataRecebimento: '2024-01-26T14:35:22Z',
  mensagem: 'Remessa recebida e processada com sucesso',
  detalhes: {
    registrosProcessados: 5,
    registrosAceitos: 5,
    registrosRejeitados: 0,
    tempoProcessamento: '1.24s',
  },
};

export default function EnvioPage() {
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <main className="ml-64 flex-1">
        <PageHeader
          title="Envio ao TCE"
          description="Resultado da submissão da remessa ao sistema e-Sfinge"
        />

        <div className="space-y-6 p-8">
          {/* Success Card */}
          <Card className="border-success bg-success/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success">
                  <CheckCircle2 className="h-6 w-6 text-success-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-balance text-2xl font-bold text-success">
                    Remessa enviada com sucesso!
                  </h2>
                  <p className="mt-2 text-sm text-success/80">
                    Sua remessa foi recebida e processada pelo TCE-MS sem erros.
                    Todos os registros foram aceitos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Protocolo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-balance text-lg font-bold">
                  TCE-2024-000456
                </p>
                <p className="text-xs text-muted-foreground">
                  Número de confirmação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Data/Hora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-balance text-lg font-bold">26/01/2024</p>
                <p className="text-xs text-muted-foreground">14:35:22</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  Aceitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-success">5 / 5</p>
                <p className="text-xs text-muted-foreground">
                  100% processados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <RefreshCw className="h-4 w-4" />
                  Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">1.24s</p>
                <p className="text-xs text-muted-foreground">Processamento</p>
              </CardContent>
            </Card>
          </div>

          {/* Request Details */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Request Enviado</CardTitle>
                    <CardDescription>
                      Dados submetidos ao TCE-MS
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-transparent">
                    POST
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <JsonViewer data={requestData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Response Recebido</CardTitle>
                    <CardDescription>
                      Confirmação da API e-Sfinge
                    </CardDescription>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    200 OK
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <JsonViewer data={responseData} />
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <p className="font-medium text-foreground">Próximos passos</p>
                  <p className="text-muted-foreground">
                    Consulte os logs para detalhes ou inicie uma nova remessa
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="bg-transparent">
                    <FileText className=" h-4 w-4" />
                    Ver Logs
                  </Button>
                  <Button className="bg-primary">
                    <RefreshCw className=" h-4 w-4" />
                    Nova Remessa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
