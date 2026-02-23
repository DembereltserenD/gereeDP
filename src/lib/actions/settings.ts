'use server'

import { createClient } from '@/lib/supabase/server'
import type { Settings } from '@/types/database'

export interface SalesTarget {
  team: string
  target: number
}

export interface StageProbability {
  stage: string
  probability: number
}

export interface ServiceContractTarget {
  team: string
  target: number
}

export async function getSalesTargets(): Promise<SalesTarget[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('setting_type', 'sales_funnel')
    .not('team_name', 'is', null)
    .not('target_2026', 'is', null)

  if (error) {
    throw new Error(error.message)
  }

  const settings = data as Settings[]

  const teamMap: Record<string, number> = {}
  settings.forEach(s => { teamMap[s.team_name!] = s.target_2026! })
  return Object.entries(teamMap).map(([team, target]) => ({ team, target }))
}

export async function getStageProbabilities(): Promise<StageProbability[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('setting_type', 'sales_funnel')
    .not('stage_name', 'is', null)

  if (error) {
    throw new Error(error.message)
  }

  const settings = data as Settings[]

  const stageMap: Record<string, number> = {}
  settings.forEach(s => { stageMap[s.stage_name!] = s.probability ?? 0 })
  return Object.entries(stageMap).map(([stage, probability]) => ({ stage, probability }))
}

export async function getServiceContractTargets(): Promise<ServiceContractTarget[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('setting_type', 'service_contract')
    .not('team_name', 'is', null)
    .not('target_2026', 'is', null)

  if (error) {
    throw new Error(error.message)
  }

  const settings = data as Settings[]

  const teamMap: Record<string, number> = {}
  settings.forEach(s => { teamMap[s.team_name!] = s.target_2026! })
  return Object.entries(teamMap).map(([team, target]) => ({ team, target }))
}

export async function getAllSettings() {
  const [salesTargets, stageProbabilities, serviceContractTargets] = await Promise.all([
    getSalesTargets(),
    getStageProbabilities(),
    getServiceContractTargets(),
  ])

  return {
    salesTargets,
    stageProbabilities,
    serviceContractTargets,
  }
}
