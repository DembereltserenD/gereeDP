'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Salary, SalaryInsert, SalaryUpdate, PaymentStatus } from '@/types/database'

export async function getSalaries(options?: {
  status?: PaymentStatus
  search?: string
  limit?: number
  offset?: number
  paymentMonth?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('salaries')
    .select('*', { count: 'exact' })
    .order('payment_date', { ascending: false })

  if (options?.status) {
    query = query.eq('payment_status', options.status)
  }

  if (options?.search) {
    query = query.or(`employee_name.ilike.%${options.search}%,position.ilike.%${options.search}%`)
  }

  if (options?.paymentMonth) {
    query = query.eq('payment_month', options.paymentMonth)
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

  return { data: data as Salary[], count }
}

export async function getSalaryById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('salaries')
    .select('*')
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл олдсонгүй')
  }

  return data[0] as Salary
}

export async function createSalary(input: SalaryInsert) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const insertData: SalaryInsert = {
    ...input,
    created_by: user.id,
  }

  const { data, error } = await supabase
    .from('salaries')
    .insert(insertData as never)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл үүсгэхэд алдаа гарлаа')
  }

  revalidatePath('/salary')
  revalidatePath('/dashboard')
  return data[0] as Salary
}

export async function updateSalary(id: string, input: SalaryUpdate) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('salaries')
    .update(input as never)
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл олдсонгүй')
  }

  revalidatePath('/salary')
  revalidatePath('/dashboard')
  return data[0] as Salary
}

export async function updateSalaryStatus(id: string, status: PaymentStatus) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('salaries')
    .update({ payment_status: status } as never)
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Бүртгэл олдсонгүй')
  }

  revalidatePath('/salary')
  return data[0] as Salary
}

export async function deleteSalary(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('salaries')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/salary')
  revalidatePath('/dashboard')
}

export async function getSalarySummary(options?: {
  paymentMonth?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('salaries')
    .select('payment_status, base_salary, bonus, deductions, net_salary')

  if (options?.paymentMonth) {
    query = query.eq('payment_month', options.paymentMonth)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  const salaries = data as Salary[]

  const totalBaseSalary = salaries.reduce((sum, s) => sum + (s.base_salary || 0), 0)
  const totalBonus = salaries.reduce((sum, s) => sum + (s.bonus || 0), 0)
  const totalDeductions = salaries.reduce((sum, s) => sum + (s.deductions || 0), 0)
  const totalNetSalary = salaries.reduce((sum, s) => sum + (s.net_salary || 0), 0)

  const byStatus = salaries.reduce((acc, s) => {
    const status = s.payment_status || 'Pending'
    if (!acc[status]) {
      acc[status] = { count: 0, amount: 0 }
    }
    acc[status].count += 1
    acc[status].amount += s.net_salary || 0
    return acc
  }, {} as Record<string, { count: number; amount: number }>)

  return {
    totalBaseSalary,
    totalBonus,
    totalDeductions,
    totalNetSalary,
    byStatus,
    count: salaries.length,
  }
}
