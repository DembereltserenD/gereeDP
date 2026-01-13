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
  salarySchema,
  type SalaryFormData,
  paymentStatuses,
  paymentMonths,
} from '@/lib/validations/salary'
import { createSalary, updateSalary } from '@/lib/actions/salary'
import type { Salary } from '@/types/database'

interface SalaryFormProps {
  initialData?: Salary
}

export function SalaryForm({ initialData }: SalaryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      employee_name: initialData?.employee_name || '',
      position: initialData?.position || '',
      base_salary: initialData?.base_salary || undefined,
      bonus: initialData?.bonus || undefined,
      deductions: initialData?.deductions || undefined,
      payment_date: initialData?.payment_date || '',
      payment_month: initialData?.payment_month || '',
      payment_status: initialData?.payment_status || 'Pending',
      notes: initialData?.notes || '',
    },
  })

  const baseSalary = watch('base_salary') || 0
  const bonus = watch('bonus') || 0
  const deductions = watch('deductions') || 0
  const netSalary = baseSalary + bonus - deductions

  const onSubmit = async (data: SalaryFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (initialData) {
        await updateSalary(initialData.id, data)
      } else {
        await createSalary(data)
      }
      router.push('/salary')
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
            {initialData ? 'Цалин засах' : 'Шинэ цалин'}
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
              <Label htmlFor="employee_name">Ажилтны нэр *</Label>
              <Input
                id="employee_name"
                {...register('employee_name')}
                placeholder="Ажилтны нэр"
              />
              {errors.employee_name && (
                <p className="text-sm text-red-500">{errors.employee_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Албан тушаал</Label>
              <Input
                id="position"
                {...register('position')}
                placeholder="Албан тушаал"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_salary">Үндсэн цалин *</Label>
              <Input
                id="base_salary"
                type="number"
                {...register('base_salary', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.base_salary && (
                <p className="text-sm text-red-500">{errors.base_salary.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus">Урамшуулал</Label>
              <Input
                id="bonus"
                type="number"
                {...register('bonus', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deductions">Суутгал</Label>
              <Input
                id="deductions"
                type="number"
                {...register('deductions', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Цэвэр цалин</Label>
              <Input
                value={netSalary.toLocaleString('mn-MN')}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Төлбөрийн сар *</Label>
              <Select
                value={watch('payment_month')}
                onValueChange={(value) => setValue('payment_month', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Сар сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.payment_month && (
                <p className="text-sm text-red-500">{errors.payment_month.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date">Төлбөрийн огноо *</Label>
              <Input
                id="payment_date"
                type="date"
                {...register('payment_date')}
              />
              {errors.payment_date && (
                <p className="text-sm text-red-500">{errors.payment_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Төлөв</Label>
              <Select
                value={watch('payment_status')}
                onValueChange={(value) => setValue('payment_status', value as SalaryFormData['payment_status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Төлөв сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
