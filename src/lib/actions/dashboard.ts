'use server'

import { createClient } from '@/lib/supabase/server'
import type { SalesFunnel, ServiceContract, Settings } from '@/types/database'

export interface DashboardMetrics {
  totalOpportunities: number
  totalValue: number
  closedValue: number
  wonValue: number
  hotValue: number
  lostValue: number
  byStage: { stage: string; count: number; value: number }[]
  byTeam: { team: string; count: number; value: number }[]
}

export interface TeamTarget {
  team: string
  target: number
  actual: number
  percentage: number
}

const emptyMetrics: DashboardMetrics = {
  totalOpportunities: 0,
  totalValue: 0,
  closedValue: 0,
  wonValue: 0,
  hotValue: 0,
  lostValue: 0,
  byStage: [],
  byTeam: [],
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sales_funnel')
    .select('*')

  if (error) {
    console.error('getDashboardMetrics error:', error.message)
    return emptyMetrics
  }

  const salesData = data as SalesFunnel[]

  const metrics: DashboardMetrics = {
    totalOpportunities: salesData.length,
    totalValue: 0,
    closedValue: 0,
    wonValue: 0,
    hotValue: 0,
    lostValue: 0,
    byStage: [],
    byTeam: [],
  }

  const stageMap: Record<string, { count: number; value: number }> = {}
  const teamMap: Record<string, { count: number; value: number }> = {}

  salesData.forEach(item => {
    const price = item.price || 0
    metrics.totalValue += price

    if (item.stage === 'Closed') metrics.closedValue += price
    if (item.stage === 'Won') metrics.wonValue += price
    if (item.stage === 'Hot') metrics.hotValue += price
    if (item.stage === 'Lost') metrics.lostValue += price

    // Group by stage
    if (!stageMap[item.stage]) {
      stageMap[item.stage] = { count: 0, value: 0 }
    }
    stageMap[item.stage].count++
    stageMap[item.stage].value += price

    // Group by team
    const team = item.team_member || 'Other'
    if (!teamMap[team]) {
      teamMap[team] = { count: 0, value: 0 }
    }
    teamMap[team].count++
    teamMap[team].value += price
  })

  metrics.byStage = Object.entries(stageMap).map(([stage, data]) => ({
    stage,
    ...data,
  }))

  metrics.byTeam = Object.entries(teamMap).map(([team, data]) => ({
    team,
    ...data,
  }))

  return metrics
}

export async function getTeamTargets(): Promise<TeamTarget[]> {
  const supabase = await createClient()

  // Get targets from settings
  const { data: settingsData, error: settingsError } = await supabase
    .from('settings')
    .select('*')
    .eq('setting_type', 'sales_funnel')
    .not('team_name', 'is', null)

  if (settingsError) {
    console.error('getTeamTargets settings error:', settingsError.message)
    return []
  }

  const settings = (settingsData || []) as Settings[]

  // Get actual sales by team (Closed + Won)
  const { data: salesResult, error: salesError } = await supabase
    .from('sales_funnel')
    .select('team_member, price, stage')
    .in('stage', ['Closed', 'Won'])

  if (salesError) {
    console.error('getTeamTargets sales error:', salesError.message)
  }

  const salesData = (salesResult || []) as Pick<SalesFunnel, 'team_member' | 'price' | 'stage'>[]

  const targetMap: Record<string, number> = {}

  settings.forEach(s => {
    if (s.team_name && s.target_2026) {
      targetMap[s.team_name] = s.target_2026
    }
  })

  const teams = Object.keys(targetMap)

  const actualMap: Record<string, number> = {}
  salesData.forEach(item => {
    const team = item.team_member || 'Other'
    if (!actualMap[team]) actualMap[team] = 0
    actualMap[team] += item.price || 0
  })

  // If no teams in settings, return empty array
  if (teams.length === 0) {
    return []
  }

  return teams.map(team => {
    const target = targetMap[team] || 0
    const actual = actualMap[team] || 0
    return {
      team,
      target,
      actual,
      percentage: target > 0 ? Math.round((actual / target) * 100) : 0,
    }
  })
}

export async function getFunnelConversions() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sales_funnel')
    .select('stage, price')

  if (error) {
    console.error('getFunnelConversions error:', error.message)
    return ['Cold', 'Warm', 'Hot', 'Won', 'Closed', 'Lost'].map(stage => ({
      stage,
      count: 0,
      value: 0,
      percentage: 0,
    }))
  }

  const salesData = data as Pick<SalesFunnel, 'stage' | 'price'>[]

  const stageOrder = ['Cold', 'Warm', 'Hot', 'Won', 'Closed', 'Lost']
  const total = salesData.length

  const conversions = stageOrder.map(stage => {
    const items = salesData.filter(d => d.stage === stage)
    const count = items.length
    const value = items.reduce((sum, d) => sum + (d.price || 0), 0)
    return {
      stage,
      count,
      value,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }
  })

  return conversions
}

export async function getMonthlyTrends() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sales_funnel')
    .select('created_date, price, stage')
    .order('created_date', { ascending: true })

  if (error) {
    console.error('getMonthlyTrends error:', error.message)
    return []
  }

  const salesData = data as Pick<SalesFunnel, 'created_date' | 'price' | 'stage'>[]

  const monthlyData: Record<string, { total: number; closed: number }> = {}

  salesData.forEach(item => {
    if (!item.created_date) return

    const date = new Date(item.created_date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[key]) {
      monthlyData[key] = { total: 0, closed: 0 }
    }

    monthlyData[key].total += item.price || 0
    if (item.stage === 'Closed') {
      monthlyData[key].closed += item.price || 0
    }
  })

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    total: data.total,
    closed: data.closed,
  }))
}

export async function getTopClients(limit = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sales_funnel')
    .select('client_name, price')

  if (error) {
    console.error('getTopClients error:', error.message)
    return []
  }

  const salesData = data as Pick<SalesFunnel, 'client_name' | 'price'>[]

  const clientMap: Record<string, number> = {}
  salesData.forEach(item => {
    if (!clientMap[item.client_name]) {
      clientMap[item.client_name] = 0
    }
    clientMap[item.client_name] += item.price || 0
  })

  return Object.entries(clientMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }))
}

export async function getServiceContractMetrics() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service_contracts')
    .select('*')
    .order('created_date', { ascending: false })

  if (error) {
    console.error('getServiceContractMetrics error:', error.message)
    return {
      total: 0,
      closed: 0,
      yearly: 0,
      count: 0,
      closedCount: 0,
      latestContracts: [] as { id: string; clientName: string; stage: string; price: number | null; createdDate: string | null; closeDate: string | null }[],
      earliestDate: null as string | null,
      latestDate: null as string | null,
      byStage: { Closed: 0, Hot: 0, Warm: 0 },
    }
  }

  const contracts = data as ServiceContract[]

  const total = contracts.reduce((sum, d) => sum + (d.price || 0), 0)
  const closedContracts = contracts.filter(d => d.stage === 'Closed')
  const closed = closedContracts.reduce((sum, d) => sum + (d.price || 0), 0)
  const yearly = contracts.reduce((sum, d) => sum + (d.yearly_payment || 0), 0)

  // Get latest contracts
  const latestContracts = contracts.slice(0, 5).map(c => ({
    id: c.id,
    clientName: c.client_name,
    stage: c.stage,
    price: c.price,
    createdDate: c.created_date,
    closeDate: c.close_date,
  }))

  // Get date range
  const dates = contracts
    .map(c => c.created_date)
    .filter(Boolean)
    .map(d => new Date(d!).getTime())

  const earliestDate = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null
  const latestDate = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null

  // Count by stage
  const byStage = {
    Closed: closedContracts.length,
    Hot: contracts.filter(d => d.stage === 'Hot').length,
    Warm: contracts.filter(d => d.stage === 'Warm').length,
  }

  return {
    total,
    closed,
    yearly,
    count: contracts.length,
    closedCount: closedContracts.length,
    latestContracts,
    earliestDate,
    latestDate,
    byStage,
  }
}
