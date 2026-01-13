'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts'
import type { TeamTarget } from '@/lib/actions/dashboard'

interface TeamChartProps {
  data: TeamTarget[]
}

const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f97316', '#6b7280', '#8b5cf6']

function formatCurrency(value: number) {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} тэрбум`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)} сая`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)} мянга`
  }
  return value.toLocaleString()
}

const stageNamesMn: Record<string, string> = {
  Cold: 'Хүйтэн',
  Warm: 'Дулаан',
  Hot: 'Халуун',
  Won: 'Хожсон',
  Closed: 'Хаагдсан',
  Lost: 'Алдсан',
}

export function TeamTargetChart({ data }: TeamChartProps) {
  const chartData = data.map(item => ({
    name: item.team,
    target: item.target,
    actual: item.actual,
    percentage: item.percentage,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Зорилт ба Гүйцэтгэл (Баг)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip formatter={(value) => formatCurrency(Number(value)) + '₮'} />
            <Legend />
            <Bar dataKey="target" fill="#94a3b8" name="Зорилт" />
            <Bar dataKey="actual" fill="#22c55e" name="Гүйцэтгэл" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface StageChartProps {
  data: { stage: string; count: number; value: number }[]
}

export function StagePieChart({ data }: StageChartProps) {
  const stageColors: Record<string, string> = {
    Closed: '#22c55e',
    Won: '#3b82f6',
    Hot: '#ef4444',
    Warm: '#f97316',
    Cold: '#6b7280',
    Lost: '#1f2937',
  }

  const chartData = data.map(item => ({
    name: stageNamesMn[item.stage] || item.stage,
    value: item.count,
    color: stageColors[item.stage] || '#6b7280',
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Үе шат бүрийн тоо</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface MonthlyChartProps {
  data: { month: string; total: number; closed: number }[]
}

export function MonthlyTrendChart({ data }: MonthlyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Сарын чиг хандлага</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(Number(value)) + '₮'} />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Нийт"
            />
            <Line
              type="monotone"
              dataKey="closed"
              stroke="#22c55e"
              strokeWidth={2}
              name="Хаагдсан"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface FunnelChartProps {
  data: { stage: string; count: number; value: number; percentage: number }[]
}

export function SalesFunnelChart({ data }: FunnelChartProps) {
  const stageColors: Record<string, string> = {
    Cold: '#6b7280',
    Warm: '#f97316',
    Hot: '#ef4444',
    Won: '#3b82f6',
    Closed: '#22c55e',
    Lost: '#1f2937',
  }

  // Filter out Lost for funnel visualization
  const funnelData = data
    .filter(d => d.stage !== 'Lost')
    .map(item => ({
      name: stageNamesMn[item.stage] || item.stage,
      value: item.count,
      fill: stageColors[item.stage] || '#6b7280',
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Борлуулалтын юүлүүр</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="value"
              data={funnelData}
              isAnimationActive
            >
              <LabelList
                position="right"
                fill="#000"
                stroke="none"
                dataKey="name"
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface TopClientsProps {
  data: { name: string; value: number }[]
}

export function TopClientsChart({ data }: TopClientsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Шилдэг харилцагчид (орлогоор)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatCurrency(Number(value)) + '₮'} />
            <Bar dataKey="value" fill="#3b82f6">
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
