import { z } from 'zod'

export const serviceContractSchema = z.object({
  client_name: z.string().min(1, 'Харилцагчийн нэр оруулна уу'),
  contract_info: z.string().optional().nullable(),
  stage: z.enum(['Closed', 'Hot', 'Warm'], {
    message: 'Stage сонгоно уу',
  }),
  price: z.number().min(0, 'Үнэ 0-ээс их байх ёстой').optional().nullable(),
  payment_percentage: z.number().min(0).max(1).optional().nullable(),
  yearly_payment: z.number().min(0).optional().nullable(),
  created_date: z.string().optional().nullable(),
  close_date: z.string().optional().nullable(),
  progress_notes: z.string().optional().nullable(),
  status: z.enum(['Not started', 'In progress', 'Complate']).optional().nullable(),
  remarks: z.string().optional().nullable(),
})

export type ServiceContractFormData = z.infer<typeof serviceContractSchema>

export const serviceContractStages = [
  { value: 'Warm', label: 'Дулаан', color: 'bg-orange-500' },
  { value: 'Hot', label: 'Халуун', color: 'bg-red-500' },
  { value: 'Closed', label: 'Хаагдсан', color: 'bg-green-500' },
] as const
