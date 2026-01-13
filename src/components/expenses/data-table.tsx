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
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { deleteExpense } from '@/lib/actions/expenses'
import type { Expense } from '@/types/database'
import { formatDateShortMn } from '@/lib/utils'

interface DataTableProps {
  data: Expense[]
}

function formatCurrency(value: number | null) {
  if (!value) return '-'
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    maximumFractionDigits: 0,
  }).format(value)
}

const categoryColors: Record<string, string> = {
  'Оффис': 'bg-blue-500',
  'Тоног төхөөрөмж': 'bg-purple-500',
  'Тээвэр': 'bg-green-500',
  'Маркетинг': 'bg-orange-500',
  'Бусад': 'bg-gray-500',
}

export function ExpenseDataTable({ data }: DataTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteExpense(deleteId)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Тайлбар</TableHead>
              <TableHead>Ангилал</TableHead>
              <TableHead className="text-right">Дүн</TableHead>
              <TableHead>Огноо</TableHead>
              <TableHead>Нийлүүлэгч</TableHead>
              <TableHead>Баримтын дугаар</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Мэдээлэл олдсонгүй
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>
                    <Badge className={`${categoryColors[item.category] || 'bg-gray-500'} text-white`}>
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell>
                    {formatDateShortMn(item.expense_date)}
                  </TableCell>
                  <TableCell>{item.vendor || '-'}</TableCell>
                  <TableCell>{item.receipt_number || '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/expenses/${item.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Засах
                          </Link>
                        </DropdownMenuItem>
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
