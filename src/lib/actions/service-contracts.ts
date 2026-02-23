'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ServiceContract, ServiceContractInsert, ServiceContractUpdate, ServiceContractStage } from '@/types/database'

export async function getServiceContracts(options?: {
  stage?: ServiceContractStage
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('service_contracts')
    .select('*', { count: 'exact' })
    .order('created_date', { ascending: false })

  if (options?.stage) {
    query = query.eq('stage', options.stage)
  }

  if (options?.search) {
    query = query.or(`client_name.ilike.%${options.search}%,contract_info.ilike.%${options.search}%`)
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

  return { data: data as ServiceContract[], count }
}

export async function getServiceContractById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service_contracts')
    .select('*')
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Гэрээ олдсонгүй')
  }

  return data[0] as ServiceContract
}

export async function createServiceContract(input: ServiceContractInsert) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const priceWithoutVat = input.price ? input.price / 1.1 : null

  const insertData: ServiceContractInsert = {
    ...input,
    price_without_vat: priceWithoutVat,
    created_by: user.id,
  }

  const { data, error } = await supabase
    .from('service_contracts')
    .insert(insertData as never)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Гэрээ үүсгэхэд алдаа гарлаа')
  }

  revalidatePath('/service-contracts')
  revalidatePath('/dashboard')
  return data[0] as ServiceContract
}

export async function updateServiceContract(id: string, input: ServiceContractUpdate) {
  const supabase = await createClient()

  const priceWithoutVat = input.price ? input.price / 1.1 : undefined

  const updateData: ServiceContractUpdate = {
    ...input,
    ...(priceWithoutVat && { price_without_vat: priceWithoutVat }),
  }

  const { data, error } = await supabase
    .from('service_contracts')
    .update(updateData as never)
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Гэрээ олдсонгүй')
  }

  revalidatePath('/service-contracts')
  revalidatePath('/dashboard')
  return data[0] as ServiceContract
}

export async function deleteServiceContract(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error, count } = await supabase
    .from('service_contracts')
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  if (count === 0) {
    throw new Error('Устгах эрх байхгүй эсвэл бүртгэл олдсонгүй')
  }

  revalidatePath('/service-contracts')
  revalidatePath('/dashboard')
}
