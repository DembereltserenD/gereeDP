'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Expense, ExpenseInsert, ExpenseUpdate, ExpenseCategory } from '@/types/database'

export async function getExpenses(options?: {
  category?: ExpenseCategory
  search?: string
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('expenses')
    .select('*', { count: 'exact' })
    .order('expense_date', { ascending: false })

  if (options?.category) {
    query = query.eq('category', options.category)
  }

  if (options?.search) {
    query = query.or(`description.ilike.%${options.search}%,vendor.ilike.%${options.search}%`)
  }

  if (options?.startDate) {
    query = query.gte('expense_date', options.startDate)
  }

  if (options?.endDate) {
    query = query.lte('expense_date', options.endDate)
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

  return { data: data as Expense[], count }
}

export async function getExpenseById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл олдсонгүй')
  }

  return data[0] as Expense
}

export async function createExpense(input: ExpenseInsert) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const insertData: ExpenseInsert = {
    ...input,
    created_by: user.id,
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert(insertData as never)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл үүсгэхэд алдаа гарлаа')
  }

  revalidatePath('/expenses')
  revalidatePath('/dashboard')
  return data[0] as Expense
}

export async function updateExpense(id: string, input: ExpenseUpdate) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expenses')
    .update(input as never)
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл олдсонгүй')
  }

  revalidatePath('/expenses')
  revalidatePath('/dashboard')
  return data[0] as Expense
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/expenses')
  revalidatePath('/dashboard')
}

export async function getExpensesSummary(options?: {
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('expenses')
    .select('category, amount')

  if (options?.startDate) {
    query = query.gte('expense_date', options.startDate)
  }

  if (options?.endDate) {
    query = query.lte('expense_date', options.endDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  const expenses = data as { category: string; amount: number }[]

  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  const byCategory = expenses.reduce((acc, e) => {
    if (!acc[e.category]) {
      acc[e.category] = 0
    }
    acc[e.category] += e.amount || 0
    return acc
  }, {} as Record<string, number>)

  return {
    totalAmount,
    byCategory,
    count: expenses.length,
  }
}
