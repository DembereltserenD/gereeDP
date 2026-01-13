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
  expenseSchema,
  type ExpenseFormData,
  categories,
} from '@/lib/validations/expenses'
import { createExpense, updateExpense } from '@/lib/actions/expenses'
import type { Expense } from '@/types/database'

interface ExpenseFormProps {
  initialData?: Expense
}

export function ExpenseForm({ initialData }: ExpenseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: initialData?.description || '',
      category: initialData?.category || 'Бусад',
      amount: initialData?.amount || undefined,
      expense_date: initialData?.expense_date || '',
      vendor: initialData?.vendor || '',
      receipt_number: initialData?.receipt_number || '',
      notes: initialData?.notes || '',
    },
  })

  const onSubmit = async (data: ExpenseFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (initialData) {
        await updateExpense(initialData.id, data)
      } else {
        await createExpense(data)
      }
      router.push('/expenses')
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
            {initialData ? 'Зардал засах' : 'Шинэ зардал'}
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
              <Label htmlFor="description">Тайлбар *</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Зардлын тайлбар"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ангилал *</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value as ExpenseFormData['category'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ангилал сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Дүн *</Label>
              <Input
                id="amount"
                type="number"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_date">Огноо *</Label>
              <Input
                id="expense_date"
                type="date"
                {...register('expense_date')}
              />
              {errors.expense_date && (
                <p className="text-sm text-red-500">{errors.expense_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Нийлүүлэгч</Label>
              <Input
                id="vendor"
                {...register('vendor')}
                placeholder="Нийлүүлэгчийн нэр"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_number">Баримтын дугаар</Label>
              <Input
                id="receipt_number"
                {...register('receipt_number')}
                placeholder="Баримтын дугаар"
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
