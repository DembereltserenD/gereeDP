'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, CheckCircle, Flame, Clock, XCircle, Target } from 'lucide-react'
import type { DashboardMetrics } from '@/lib/actions/dashboard'

interface MetricsCardsProps {
  metrics: DashboardMetrics
}

function formatCurrency(value: number) {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} тэрбум`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} сая`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} мянга`
  }
  return value.toLocaleString()
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Нийт боломж',
      value: metrics.totalOpportunities,
      subValue: formatCurrency(metrics.totalValue) + '₮',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Хаагдсан',
      value: metrics.byStage.find(s => s.stage === 'Closed')?.count || 0,
      subValue: formatCurrency(metrics.closedValue) + '₮',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Хожсон',
      value: metrics.byStage.find(s => s.stage === 'Won')?.count || 0,
      subValue: formatCurrency(metrics.wonValue) + '₮',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Халуун',
      value: metrics.byStage.find(s => s.stage === 'Hot')?.count || 0,
      subValue: formatCurrency(metrics.hotValue) + '₮',
      icon: Flame,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Дулаан',
      value: metrics.byStage.find(s => s.stage === 'Warm')?.count || 0,
      subValue: formatCurrency(metrics.byStage.find(s => s.stage === 'Warm')?.value || 0) + '₮',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Алдсан',
      value: metrics.byStage.find(s => s.stage === 'Lost')?.count || 0,
      subValue: formatCurrency(metrics.lostValue) + '₮',
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.subValue}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
