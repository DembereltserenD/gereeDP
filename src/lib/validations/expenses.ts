import { z } from 'zod'

export const expenseSchema = z.object({
  description: z.string().min(1, 'Тайлбар оруулна уу'),
  category: z.enum(['Оффис', 'Тоног төхөөрөмж', 'Тээвэр', 'Маркетинг', 'Бусад']),
  amount: z.number().min(1, 'Дүн оруулна уу'),
  expense_date: z.string().min(1, 'Огноо оруулна уу'),
  vendor: z.string().optional(),
  receipt_number: z.string().optional(),
  notes: z.string().optional(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>

export const categories = [
  { value: 'Оффис', label: 'Оффис' },
  { value: 'Тоног төхөөрөмж', label: 'Тоног төхөөрөмж' },
  { value: 'Тээвэр', label: 'Тээвэр' },
  { value: 'Маркетинг', label: 'Маркетинг' },
  { value: 'Бусад', label: 'Бусад' },
] as const
