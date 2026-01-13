import {
  getDashboardMetrics,
  getTeamTargets,
  getFunnelConversions,
  getMonthlyTrends,
  getTopClients,
  getServiceContractMetrics,
} from '@/lib/actions/dashboard'
import { MetricsCards } from '@/components/dashboard/metrics-cards'
import {
  TeamTargetChart,
  StagePieChart,
  MonthlyTrendChart,
  SalesFunnelChart,
  TopClientsChart,
} from '@/components/dashboard/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateShortMn, formatCurrencyMn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const stageColorsMn: Record<string, string> = {
  Closed: 'bg-green-100 text-green-800',
  Hot: 'bg-red-100 text-red-800',
  Warm: 'bg-orange-100 text-orange-800',
}

const stageNamesMn: Record<string, string> = {
  Closed: 'Хаагдсан',
  Hot: 'Халуун',
  Warm: 'Дулаан',
}

export default async function DashboardPage() {
  const [metrics, teamTargets, funnelData, monthlyData, topClients, serviceMetrics] =
    await Promise.all([
      getDashboardMetrics(),
      getTeamTargets(),
      getFunnelConversions(),
      getMonthlyTrends(),
      getTopClients(8),
      getServiceContractMetrics(),
    ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Хянах самбар</h1>
        <p className="text-muted-foreground">
          Борлуулалтын нэгдсэн тайлан
        </p>
      </div>

      <MetricsCards metrics={metrics} />

      <div className="grid gap-6 md:grid-cols-2">
        <SalesFunnelChart data={funnelData} />
        <StagePieChart data={metrics.byStage} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TeamTargetChart data={teamTargets} />
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Сервис гэрээ</CardTitle>
              <Link href="/service-contracts" className="text-sm text-blue-600 hover:underline">
                Бүгдийг харах →
              </Link>
            </div>
            {serviceMetrics.earliestDate && serviceMetrics.latestDate && (
              <p className="text-xs text-muted-foreground">
                {formatDateShortMn(serviceMetrics.earliestDate)} - {formatDateShortMn(serviceMetrics.latestDate)}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-green-50 p-2">
                  <div className="text-lg font-bold text-green-700">{serviceMetrics.closedCount}</div>
                  <div className="text-xs text-green-600">Хаагдсан</div>
                </div>
                <div className="rounded-lg bg-red-50 p-2">
                  <div className="text-lg font-bold text-red-700">{serviceMetrics.byStage.Hot}</div>
                  <div className="text-xs text-red-600">Халуун</div>
                </div>
                <div className="rounded-lg bg-orange-50 p-2">
                  <div className="text-lg font-bold text-orange-700">{serviceMetrics.byStage.Warm}</div>
                  <div className="text-xs text-orange-600">Дулаан</div>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Нийт дүн</span>
                  <span className="font-medium">{formatCurrencyMn(serviceMetrics.total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Хаагдсан дүн</span>
                  <span className="font-medium text-green-600">{formatCurrencyMn(serviceMetrics.closed)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Жилийн төлбөр</span>
                  <span className="font-medium">{formatCurrencyMn(serviceMetrics.yearly)}</span>
                </div>
              </div>

              {/* Latest contracts */}
              {serviceMetrics.latestContracts.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Сүүлийн гэрээнүүд</p>
                  <div className="space-y-2">
                    {serviceMetrics.latestContracts.slice(0, 3).map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="secondary" className={`text-xs shrink-0 ${stageColorsMn[contract.stage] || ''}`}>
                            {stageNamesMn[contract.stage] || contract.stage}
                          </Badge>
                          <span className="truncate">{contract.clientName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {formatDateShortMn(contract.createdDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MonthlyTrendChart data={monthlyData} />
        <TopClientsChart data={topClients} />
      </div>
    </div>
  )
}
