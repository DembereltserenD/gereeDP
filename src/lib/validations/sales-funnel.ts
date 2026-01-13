import { z } from 'zod'

export const salesFunnelSchema = z.object({
  client_name: z.string().min(1, 'Харилцагчийн нэр оруулна уу'),
  work_info: z.string().optional().nullable(),
  stage: z.enum(['Closed', 'Won', 'Hot', 'Warm', 'Cold', 'Lost'], {
    message: 'Stage сонгоно уу',
  }),
  price: z.number().min(0, 'Үнэ 0-ээс их байх ёстой').optional().nullable(),
  payment_percentage: z.number().min(0).max(1).optional().nullable(),
  paid_amount: z.number().min(0).optional().nullable(),
  created_date: z.string().optional().nullable(),
  close_date: z.string().optional().nullable(),
  team_member: z.enum(['FAS', 'PAS', 'CCTV', 'Access', 'Other', 'Бараа нийлүүлэлт']).optional().nullable(),
  progress_notes: z.string().optional().nullable(),
  status: z.enum(['Not started', 'In progress', 'Complate']).optional().nullable(),
  remarks: z.string().optional().nullable(),
})

export type SalesFunnelFormData = z.infer<typeof salesFunnelSchema>

export const stages = [
  { value: 'Cold', label: 'Хүйтэн', color: 'bg-gray-500' },
  { value: 'Warm', label: 'Дулаан', color: 'bg-orange-500' },
  { value: 'Hot', label: 'Халуун', color: 'bg-red-500' },
  { value: 'Won', label: 'Хожсон', color: 'bg-blue-500' },
  { value: 'Closed', label: 'Хаагдсан', color: 'bg-green-500' },
  { value: 'Lost', label: 'Алдсан', color: 'bg-gray-800' },
] as const

export const teams = [
  { value: 'FAS', label: 'FAS' },
  { value: 'PAS', label: 'PAS' },
  { value: 'CCTV', label: 'CCTV' },
  { value: 'Access', label: 'Access' },
  { value: 'Бараа нийлүүлэлт', label: 'Бараа нийлүүлэлт' },
  { value: 'Other', label: 'Бусад' },
] as const

export const statuses = [
  { value: 'Not started', label: 'Эхлээгүй' },
  { value: 'In progress', label: 'Хийгдэж буй' },
  { value: 'Complate', label: 'Дууссан' },
] as const
