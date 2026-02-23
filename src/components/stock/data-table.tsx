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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoreHorizontal, Pencil, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react'
import { deleteStock, updateStockQuantity } from '@/lib/actions/stock'
import type { Stock } from '@/types/database'

interface DataTableProps {
  data: Stock[]
}

function formatCurrency(value: number | null) {
  if (!value) return '-'
  return new Intl.NumberFormat('mn-MN', {
    maximumFractionDigits: 0,
  }).format(value) + '₮'
}

const categoryColors: Record<string, string> = {
  'FAS': 'bg-blue-500',
  'PAS': 'bg-purple-500',
  'CCTV': 'bg-green-500',
  'Access': 'bg-orange-500',
  'Бусад': 'bg-gray-500',
}

export function StockDataTable({ data }: DataTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [adjustItem, setAdjustItem] = useState<Stock | null>(null)
  const [adjustAmount, setAdjustAmount] = useState<number>(0)
  const [adjusting, setAdjusting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteStock(deleteId)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleAdjustQuantity = async (isAdd: boolean) => {
    if (!adjustItem || adjustAmount <= 0) return
    setAdjusting(true)
    try {
      await updateStockQuantity(adjustItem.id, isAdd ? adjustAmount : -adjustAmount)
      router.refresh()
      setAdjustItem(null)
      setAdjustAmount(0)
    } catch (error) {
      console.error('Adjust error:', error)
    } finally {
      setAdjusting(false)
    }
  }

  const isLowStock = (item: Stock) => {
    return item.min_stock_level && item.quantity <= item.min_stock_level
  }

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Бүтээгдэхүүн</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Ангилал</TableHead>
              <TableHead className="text-right">Тоо хэмжээ</TableHead>
              <TableHead className="text-right">Нэгж үнэ</TableHead>
              <TableHead className="text-right">Нийт үнэ</TableHead>
              <TableHead>Байршил</TableHead>
              <TableHead>Нийлүүлэгч</TableHead>
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
                <TableRow key={item.id} className={isLowStock(item) ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.product_name}
                      {isLowStock(item) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.sku || '-'}</TableCell>
                  <TableCell>
                    {item.category && (
                      <Badge className={`${categoryColors[item.category] || 'bg-gray-500'} text-white`}>
                        {item.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={isLowStock(item) ? 'text-red-600 font-bold' : ''}>
                      {item.quantity}
                    </span>
                    {item.min_stock_level && (
                      <span className="text-muted-foreground text-xs ml-1">
                        (min: {item.min_stock_level})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unit_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.total_value)}
                  </TableCell>
                  <TableCell>{item.location || '-'}</TableCell>
                  <TableCell>{item.supplier || '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/stock/${item.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Засах
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setAdjustItem(item)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Тоо нэмэх/хасах
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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

      <Dialog open={!!adjustItem} onOpenChange={() => { setAdjustItem(null); setAdjustAmount(0); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Тоо хэмжээ өөрчлөх</DialogTitle>
            <DialogDescription>
              {adjustItem?.product_name} - Одоогийн тоо: {adjustItem?.quantity}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="adjustAmount">Тоо хэмжээ</Label>
            <Input
              id="adjustAmount"
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
              min={1}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAdjustItem(null); setAdjustAmount(0); }}>
              Болих
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAdjustQuantity(false)}
              disabled={adjusting || adjustAmount <= 0}
            >
              <Minus className="mr-2 h-4 w-4" />
              Хасах
            </Button>
            <Button
              onClick={() => handleAdjustQuantity(true)}
              disabled={adjusting || adjustAmount <= 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Нэмэх
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
