import { z } from 'zod'

export const stockSchema = z.object({
  product_name: z.string().min(1, 'Бүтээгдэхүүний нэр оруулна уу'),
  sku: z.string().optional(),
  category: z.enum(['FAS', 'PAS', 'CCTV', 'Access', 'Бусад']).optional(),
  quantity: z.number().min(0, 'Тоо хэмжээ 0-ээс их байх ёстой'),
  unit_price: z.number().optional(),
  min_stock_level: z.number().optional(),
  location: z.string().optional(),
  supplier: z.string().optional(),
  last_restock_date: z.string().optional(),
  notes: z.string().optional(),
})

export type StockFormData = z.infer<typeof stockSchema>

export const stockCategories = [
  { value: 'FAS', label: 'FAS' },
  { value: 'PAS', label: 'PAS' },
  { value: 'CCTV', label: 'CCTV' },
  { value: 'Access', label: 'Access' },
  { value: 'Бусад', label: 'Бусад' },
] as const
