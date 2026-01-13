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
  serviceContractSchema,
  type ServiceContractFormData,
  serviceContractStages,
} from '@/lib/validations/service-contract'
import { statuses } from '@/lib/validations/sales-funnel'
import { createServiceContract, updateServiceContract } from '@/lib/actions/service-contracts'
import type { ServiceContract } from '@/types/database'

interface ServiceContractFormProps {
  initialData?: ServiceContract
}

export function ServiceContractForm({ initialData }: ServiceContractFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceContractFormData>({
    resolver: zodResolver(serviceContractSchema),
    defaultValues: {
      client_name: initialData?.client_name || '',
      contract_info: initialData?.contract_info || 'Service',
      stage: initialData?.stage || 'Warm',
      price: initialData?.price || undefined,
      payment_percentage: initialData?.payment_percentage || undefined,
      yearly_payment: initialData?.yearly_payment || undefined,
      created_date: initialData?.created_date || '',
      close_date: initialData?.close_date || '',
      progress_notes: initialData?.progress_notes || '',
      status: initialData?.status as ServiceContractFormData['status'] || 'Not started',
      remarks: initialData?.remarks || '',
    },
  })

  const onSubmit = async (data: ServiceContractFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (initialData) {
        await updateServiceContract(initialData.id, data)
      } else {
        await createServiceContract(data)
      }
      router.push('/service-contracts')
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
            {initialData ? 'Гэрээ засах' : 'Шинэ сервис гэрээ'}
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
              <Label htmlFor="client_name">Харилцагч *</Label>
              <Input
                id="client_name"
                {...register('client_name')}
                placeholder="Харилцагчийн нэр"
              />
              {errors.client_name && (
                <p className="text-sm text-red-500">{errors.client_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_info">Гэрээний мэдээлэл</Label>
              <Input
                id="contract_info"
                {...register('contract_info')}
                placeholder="Service"
              />
            </div>

            <div className="space-y-2">
              <Label>Үе шат *</Label>
              <Select
                value={watch('stage')}
                onValueChange={(value) => setValue('stage', value as ServiceContractFormData['stage'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Үе шат сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {serviceContractStages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stage && (
                <p className="text-sm text-red-500">{errors.stage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Төлөв</Label>
              <Select
                value={watch('status') || ''}
                onValueChange={(value) => setValue('status', value as ServiceContractFormData['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Төлөв сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Үнийн дүн</Label>
              <Input
                id="price"
                type="number"
                {...register('price', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearly_payment">Жилээр төлөх дүн</Label>
              <Input
                id="yearly_payment"
                type="number"
                {...register('yearly_payment', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_percentage">Төлөлтийн хувь</Label>
              <Select
                value={String(watch('payment_percentage') || '')}
                onValueChange={(value) => setValue('payment_percentage', parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="1">100%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="created_date">Огноо</Label>
              <Input
                id="created_date"
                type="date"
                {...register('created_date')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="close_date">Хаах огноо</Label>
              <Input
                id="close_date"
                type="date"
                {...register('close_date')}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="progress_notes">Явцын мэдээлэл</Label>
              <Input
                id="progress_notes"
                {...register('progress_notes')}
                placeholder="Явцын тайлбар"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="remarks">Тодруулга</Label>
              <Input
                id="remarks"
                {...register('remarks')}
                placeholder="Нэмэлт тайлбар"
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
