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

  return settings.map(s => ({
    team: s.team_name!,
    target: s.target_2026!,
  }))
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

  return settings.map(s => ({
    stage: s.stage_name!,
    probability: s.probability ?? 0,
  }))
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

  return settings.map(s => ({
    team: s.team_name!,
    target: s.target_2026!,
  }))
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
