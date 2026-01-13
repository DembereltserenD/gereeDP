import { z } from 'zod'

export const salarySchema = z.object({
  employee_name: z.string().min(1, 'Ажилтны нэр оруулна уу'),
  position: z.string().optional(),
  base_salary: z.number().min(1, 'Үндсэн цалин оруулна уу'),
  bonus: z.number().optional(),
  deductions: z.number().optional(),
  payment_date: z.string().min(1, 'Төлбөрийн огноо оруулна уу'),
  payment_month: z.string().min(1, 'Төлбөрийн сар оруулна уу'),
  payment_status: z.enum(['Pending', 'Paid', 'Cancelled']),
  notes: z.string().optional(),
})

export type SalaryFormData = z.infer<typeof salarySchema>

export const paymentStatuses = [
  { value: 'Pending', label: 'Хүлээгдэж байна', color: 'bg-yellow-500' },
  { value: 'Paid', label: 'Төлөгдсөн', color: 'bg-green-500' },
  { value: 'Cancelled', label: 'Цуцлагдсан', color: 'bg-red-500' },
] as const

export const paymentMonths = [
  { value: '2025-01', label: '2025 оны 1-р сар' },
  { value: '2025-02', label: '2025 оны 2-р сар' },
  { value: '2025-03', label: '2025 оны 3-р сар' },
  { value: '2025-04', label: '2025 оны 4-р сар' },
  { value: '2025-05', label: '2025 оны 5-р сар' },
  { value: '2025-06', label: '2025 оны 6-р сар' },
  { value: '2025-07', label: '2025 оны 7-р сар' },
  { value: '2025-08', label: '2025 оны 8-р сар' },
  { value: '2025-09', label: '2025 оны 9-р сар' },
  { value: '2025-10', label: '2025 оны 10-р сар' },
  { value: '2025-11', label: '2025 оны 11-р сар' },
  { value: '2025-12', label: '2025 оны 12-р сар' },
  { value: '2026-01', label: '2026 оны 1-р сар' },
  { value: '2026-02', label: '2026 оны 2-р сар' },
  { value: '2026-03', label: '2026 оны 3-р сар' },
  { value: '2026-04', label: '2026 оны 4-р сар' },
  { value: '2026-05', label: '2026 оны 5-р сар' },
  { value: '2026-06', label: '2026 оны 6-р сар' },
  { value: '2026-07', label: '2026 оны 7-р сар' },
  { value: '2026-08', label: '2026 оны 8-р сар' },
  { value: '2026-09', label: '2026 оны 9-р сар' },
  { value: '2026-10', label: '2026 оны 10-р сар' },
  { value: '2026-11', label: '2026 оны 11-р сар' },
  { value: '2026-12', label: '2026 оны 12-р сар' },
] as const
