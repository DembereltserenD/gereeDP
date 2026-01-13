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
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { deleteSalesFunnel } from '@/lib/actions/sales-funnel'
import { stages, statuses } from '@/lib/validations/sales-funnel'
import type { SalesFunnel } from '@/types/database'
import { formatDateShortMn } from '@/lib/utils'

interface DataTableProps {
  data: SalesFunnel[]
}

function formatCurrency(value: number | null) {
  if (!value) return '-'
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    maximumFractionDigits: 0,
  }).format(value)
}

function getStageColor(stage: string) {
  const stageConfig = stages.find(s => s.value === stage)
  return stageConfig?.color || 'bg-gray-500'
}

function getStatusLabel(status: string | null) {
  const statusConfig = statuses.find(s => s.value === status)
  return statusConfig?.label || status || '-'
}

const stageNamesMn: Record<string, string> = {
  Cold: 'Хүйтэн',
  Warm: 'Дулаан',
  Hot: 'Халуун',
  Won: 'Хожсон',
  Closed: 'Хаагдсан',
  Lost: 'Алдсан',
}

export function SalesFunnelDataTable({ data }: DataTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteSalesFunnel(deleteId)
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
              <TableHead>Харилцагч</TableHead>
              <TableHead>Ажлын мэдээлэл</TableHead>
              <TableHead>Үе шат</TableHead>
              <TableHead className="text-right">Үнийн дүн</TableHead>
              <TableHead>Баг</TableHead>
              <TableHead>Огноо</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Мэдээлэл олдсонгүй
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.client_name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {item.work_info || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStageColor(item.stage)} text-white`}>
                      {stageNamesMn[item.stage] || item.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell>{item.team_member || '-'}</TableCell>
                  <TableCell>
                    {formatDateShortMn(item.created_date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getStatusLabel(item.status)}
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
                          <Link href={`/sales-funnel/${item.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Харах
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/sales-funnel/${item.id}`}>
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
