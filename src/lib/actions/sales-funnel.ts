'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SalesFunnel, SalesFunnelInsert, SalesFunnelUpdate, Stage } from '@/types/database'

export async function getSalesFunnel(options?: {
  stage?: Stage
  team?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('sales_funnel')
    .select('*', { count: 'exact' })
    .order('created_date', { ascending: false })

  if (options?.stage) {
    query = query.eq('stage', options.stage)
  }

  if (options?.team) {
    query = query.eq('team_member', options.team)
  }

  if (options?.search) {
    query = query.or(`client_name.ilike.%${options.search}%,work_info.ilike.%${options.search}%`)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 25) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(error.message)
  }

  return { data: data as SalesFunnel[], count }
}

export async function getSalesFunnelById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sales_funnel')
    .select('*')
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл олдсонгүй')
  }

  return data[0] as SalesFunnel
}

export async function createSalesFunnel(input: SalesFunnelInsert) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const priceWithoutVat = input.price ? input.price / 1.1 : null

  const insertData: SalesFunnelInsert = {
    ...input,
    price_without_vat: priceWithoutVat,
    created_by: user.id,
  }

  const { data, error } = await supabase
    .from('sales_funnel')
    .insert(insertData as never)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл үүсгэхэд алдаа гарлаа')
  }

  revalidatePath('/sales-funnel')
  revalidatePath('/dashboard')
  return data[0] as SalesFunnel
}

export async function updateSalesFunnel(id: string, input: SalesFunnelUpdate) {
  const supabase = await createClient()

  const priceWithoutVat = input.price ? input.price / 1.1 : undefined

  const updateData: SalesFunnelUpdate = {
    ...input,
    ...(priceWithoutVat && { price_without_vat: priceWithoutVat }),
  }

  const { data, error } = await supabase
    .from('sales_funnel')
    .update(updateData as never)
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл олдсонгүй')
  }

  revalidatePath('/sales-funnel')
  revalidatePath('/dashboard')
  return data[0] as SalesFunnel
}

export async function updateSalesFunnelStage(id: string, stage: Stage) {
  const supabase = await createClient()

  const progressToWon = stage === 'Closed' ? 1 : stage === 'Won' ? 0.3 : 0

  const { data, error } = await supabase
    .from('sales_funnel')
    .update({
      stage,
      progress_to_won: progressToWon,
    } as never)
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Record not found')
  }

  revalidatePath('/sales-funnel')
  revalidatePath('/sales-funnel/kanban')
  revalidatePath('/dashboard')
  return data[0] as SalesFunnel
}

export async function deleteSalesFunnel(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sales_funnel')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/sales-funnel')
  revalidatePath('/dashboard')
}

export async function getSalesFunnelByStage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sales_funnel')
    .select('*')
    .order('created_date', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const salesData = data as SalesFunnel[]

  const grouped: Record<Stage, SalesFunnel[]> = {
    Cold: [],
    Warm: [],
    Hot: [],
    Won: [],
    Closed: [],
    Lost: [],
  }

  salesData.forEach(item => {
    if (grouped[item.stage as Stage]) {
      grouped[item.stage as Stage].push(item)
    }
  })

  return grouped
}
