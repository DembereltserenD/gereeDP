'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Stock, StockInsert, StockUpdate, StockCategory } from '@/types/database'

export async function getStock(options?: {
  category?: StockCategory
  search?: string
  limit?: number
  offset?: number
  lowStock?: boolean
}) {
  const supabase = await createClient()

  let query = supabase
    .from('stock')
    .select('*', { count: 'exact' })
    .order('product_name', { ascending: true })

  if (options?.category) {
    query = query.eq('category', options.category)
  }

  if (options?.search) {
    query = query.or(`product_name.ilike.%${options.search}%,sku.ilike.%${options.search}%,supplier.ilike.%${options.search}%`)
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

  let stockData = data as Stock[]

  if (options?.lowStock) {
    stockData = stockData.filter(item =>
      item.min_stock_level && item.quantity <= item.min_stock_level
    )
  }

  return { data: stockData, count }
}

export async function getStockById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stock')
    .select('*')
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл олдсонгүй')
  }

  return data[0] as Stock
}

export async function createStock(input: StockInsert) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const insertData: StockInsert = {
    ...input,
    created_by: user.id,
  }

  const { data, error } = await supabase
    .from('stock')
    .insert(insertData as never)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл үүсгэхэд алдаа гарлаа')
  }

  revalidatePath('/stock')
  revalidatePath('/dashboard')
  return data[0] as Stock
}

export async function updateStock(id: string, input: StockUpdate) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stock')
    .update(input as never)
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл олдсонгүй')
  }

  revalidatePath('/stock')
  revalidatePath('/dashboard')
  return data[0] as Stock
}

export async function updateStockQuantity(id: string, quantityChange: number) {
  const supabase = await createClient()

  const { data: current } = await supabase
    .from('stock')
    .select('quantity')
    .eq('id', id)
    .single()

  if (!current) {
    throw new Error('Бүртгэл олдсонгүй')
  }

  const currentStock = current as { quantity: number }
  const newQuantity = (currentStock.quantity || 0) + quantityChange

  if (newQuantity < 0) {
    throw new Error('Тоо хэмжээ хасах байж болохгүй')
  }

  const { data, error } = await supabase
    .from('stock')
    .update({
      quantity: newQuantity,
      last_restock_date: quantityChange > 0 ? new Date().toISOString().split('T')[0] : undefined
    } as never)
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/stock')
  return data[0] as Stock
}

export async function deleteStock(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('stock')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/stock')
  revalidatePath('/dashboard')
}

export async function getStockSummary() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stock')
    .select('category, quantity, unit_price, total_value, min_stock_level')

  if (error) {
    throw new Error(error.message)
  }

  const stockItems = data as Stock[]

  const totalItems = stockItems.length
  const totalQuantity = stockItems.reduce((sum, s) => sum + (s.quantity || 0), 0)
  const totalValue = stockItems.reduce((sum, s) => sum + (s.total_value || 0), 0)

  const lowStockItems = stockItems.filter(item =>
    item.min_stock_level && item.quantity <= item.min_stock_level
  ).length

  const byCategory = stockItems.reduce((acc, s) => {
    const cat = s.category || 'Бусад'
    if (!acc[cat]) {
      acc[cat] = { count: 0, quantity: 0, value: 0 }
    }
    acc[cat].count += 1
    acc[cat].quantity += s.quantity || 0
    acc[cat].value += s.total_value || 0
    return acc
  }, {} as Record<string, { count: number; quantity: number; value: number }>)

  return {
    totalItems,
    totalQuantity,
    totalValue,
    lowStockItems,
    byCategory,
  }
}
