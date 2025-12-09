'use client';

import { Sidebar } from '@/components/sidebar';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Database,
  ArrowLeftRight,
  CheckCircle2,
  Package,
  Send,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { LabelList, Pie, PieChart } from 'recharts';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const statusData = [
  { status: 'Criada', count: 12, fill: 'var(--color-chart-1)' },
  { status: 'Validada', count: 8, fill: 'var(--color-chart-4)' },
  { status: 'Enviada', count: 5, fill: 'var(--color-chart-2)' },
];

const chartConfig = {
  count: {
    label: 'Quantidade',
  },
  Criada: {
    label: 'Criada',
    color: 'var(--chart-1)',
  },
  Validada: {
    label: 'Validada',
    color: 'var(--chart-4)',
  },
  Enviada: {
    label: 'Enviada',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

const recentActions = [
  {
    action: 'Dados carregados',
    module: 'Execução Orçamentária',
    time: '2 min atrás',
    status: 'success',
  },
  {
    action: 'Remessa gerada',
    module: 'Empenho',
    time: '15 min atrás',
    status: 'success',
  },
  {
    action: 'Validação concluída',
    module: 'Liquidação',
    time: '1 hora atrás',
    status: 'success',
  },
  {
    action: 'Envio ao TCE',
    module: 'Pagamento',
    time: '2 horas atrás',
    status: 'success',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1">
        <PageHeader
          title="Dashboard"
          description="Visão geral da POC de integração com e-Sfinge/TCE-MS"
        />

        <div className="space-y-6 p-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Dados Carregados"
              value="3.247"
              icon={Database}
              description="Registros da origem"
              variant="default"
            />
            <StatCard
              title="Transformações"
              value="2.891"
              icon={ArrowLeftRight}
              description="Registros processados"
              variant="default"
            />
            <StatCard
              title="Validações OK"
              value="2.845"
              icon={CheckCircle2}
              description="98,4% aprovados"
              variant="default"
            />
            <StatCard
              title="Remessas Enviadas"
              value="25"
              icon={Send}
              description="Últimos 7 dias"
              variant="default"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Status das Remessas
                </CardTitle>
                <CardDescription>Distribuição por status</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent nameKey="count" hideLabel />
                      }
                    />
                    <Pie data={statusData} dataKey="count">
                      <LabelList
                        dataKey="status"
                        className="fill-background"
                        stroke="none"
                        fontSize={12}
                        formatter={(value: any) =>
                          chartConfig[value as keyof typeof chartConfig]?.label
                        }
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Recent Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Últimas Ações
                </CardTitle>
                <CardDescription>
                  Atividades recentes do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActions.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between rounded-lg border border-border bg-secondary/50 p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          {item.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.module}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground">
                          {item.time}
                        </span>
                        <span className="flex h-2 w-2 rounded-full bg-success" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acesso Rápido</CardTitle>
              <CardDescription>Ações principais do fluxo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button
                  className="h-auto flex-col gap-2 py-4 bg-transparent"
                  variant="outline"
                >
                  <Database className="h-6 w-6" />
                  <span className="text-sm">Carregar Dados</span>
                </Button>
                <Button
                  className="h-auto flex-col gap-2 py-4 bg-transparent"
                  variant="outline"
                >
                  <Package className="h-6 w-6" />
                  <span className="text-sm">Gerar Remessa</span>
                </Button>
                <Button
                  className="h-auto flex-col gap-2 py-4 bg-transparent"
                  variant="outline"
                >
                  <Send className="h-6 w-6" />
                  <span className="text-sm">Enviar ao TCE</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
