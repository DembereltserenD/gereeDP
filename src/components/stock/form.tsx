'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  stockSchema,
  type StockFormData,
  stockCategories,
} from '@/lib/validations/stock'
import { createStock, updateStock } from '@/lib/actions/stock'
import type { Stock } from '@/types/database'

interface StockFormProps {
  initialData?: Stock
}

export function StockForm({ initialData }: StockFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      product_name: initialData?.product_name || '',
      sku: initialData?.sku || '',
      category: initialData?.category || undefined,
      quantity: initialData?.quantity || 0,
      unit_price: initialData?.unit_price || undefined,
      min_stock_level: initialData?.min_stock_level || undefined,
      location: initialData?.location || '',
      supplier: initialData?.supplier || '',
      last_restock_date: initialData?.last_restock_date || '',
      notes: initialData?.notes || '',
    },
  })

  const quantity = watch('quantity') || 0
  const unitPrice = watch('unit_price') || 0
  const totalValue = quantity * unitPrice

  const onSubmit = async (data: StockFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (initialData) {
        await updateStock(initialData.id, data)
      } else {
        await createStock(data)
      }
      router.push('/stock')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>
            {initialData ? 'Бараа засах' : 'Шинэ бараа'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="product_name">Бүтээгдэхүүний нэр *</Label>
              <Input
                id="product_name"
                {...register('product_name')}
                placeholder="Бүтээгдэхүүний нэр"
              />
              {errors.product_name && (
                <p className="text-sm text-red-500">{errors.product_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU код</Label>
              <Input
                id="sku"
                {...register('sku')}
                placeholder="SKU-001"
              />
            </div>

            <div className="space-y-2">
              <Label>Ангилал</Label>
              <Select
                value={watch('category') || ''}
                onValueChange={(value) => setValue('category', value as StockFormData['category'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ангилал сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {stockCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Тоо хэмжээ *</Label>
              <Input
                id="quantity"
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">Нэгж үнэ</Label>
              <Input
                id="unit_price"
                type="number"
                {...register('unit_price', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Нийт үнэ</Label>
              <Input
                value={totalValue.toLocaleString('mn-MN')}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock_level">Доод хэмжээ</Label>
              <Input
                id="min_stock_level"
                type="number"
                {...register('min_stock_level', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Байршил</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Агуулах A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Нийлүүлэгч</Label>
              <Input
                id="supplier"
                {...register('supplier')}
                placeholder="Нийлүүлэгчийн нэр"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_restock_date">Сүүлд нөхсөн огноо</Label>
              <Input
                id="last_restock_date"
                type="date"
                {...register('last_restock_date')}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Тэмдэглэл</Label>
              <Input
                id="notes"
                {...register('notes')}
                placeholder="Нэмэлт тэмдэглэл"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Болих
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
