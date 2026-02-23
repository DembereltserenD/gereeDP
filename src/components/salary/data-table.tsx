'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { deleteSalary, updateSalaryStatus } from '@/lib/actions/salary'
import { paymentStatuses } from '@/lib/validations/salary'
import type { Salary } from '@/types/database'
import { formatDateShortMn } from '@/lib/utils'

interface DataTableProps {
  data: Salary[]
}

function formatCurrency(value: number | null) {
  if (!value) return '-'
  return new Intl.NumberFormat('mn-MN', {
    maximumFractionDigits: 0,
  }).format(value) + '₮'
}

function getStatusColor(status: string) {
  const statusConfig = paymentStatuses.find(s => s.value === status)
  return statusConfig?.color || 'bg-gray-500'
}

function getStatusLabel(status: string) {
  const statusConfig = paymentStatuses.find(s => s.value === status)
  return statusConfig?.label || status
}

export function SalaryDataTable({ data }: DataTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteSalary(deleteId)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleMarkAsPaid = async (id: string) => {
    try {
      await updateSalaryStatus(id, 'Paid')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  const handleMarkAsCancelled = async (id: string) => {
    try {
      await updateSalaryStatus(id, 'Cancelled')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ажилтан</TableHead>
              <TableHead>Албан тушаал</TableHead>
              <TableHead className="text-right">Үндсэн цалин</TableHead>
              <TableHead className="text-right">Урамшуулал</TableHead>
              <TableHead className="text-right">Суутгал</TableHead>
              <TableHead className="text-right">Цэвэр цалин</TableHead>
              <TableHead>Сар</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Мэдээлэл олдсонгүй
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.employee_name}</TableCell>
                  <TableCell>{item.position || '-'}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.base_salary)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.bonus)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.deductions)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.net_salary)}
                  </TableCell>
                  <TableCell>{item.payment_month}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(item.payment_status)} text-white`}>
                      {getStatusLabel(item.payment_status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/salary/${item.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Засах
                          </Link>
                        </DropdownMenuItem>
                        {item.payment_status === 'Pending' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleMarkAsPaid(item.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Төлөгдсөн
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleMarkAsCancelled(item.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Цуцлах
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Устгах
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Устгах уу?</DialogTitle>
            <DialogDescription>
              Энэ үйлдлийг буцаах боломжгүй. Та итгэлтэй байна уу?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Болих
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Устгаж байна...' : 'Устгах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
