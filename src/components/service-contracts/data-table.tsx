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
import { deleteServiceContract } from '@/lib/actions/service-contracts'
import { serviceContractStages } from '@/lib/validations/service-contract'
import { statuses } from '@/lib/validations/sales-funnel'
import type { ServiceContract } from '@/types/database'
import { formatDateShortMn } from '@/lib/utils'

interface DataTableProps {
  data: ServiceContract[]
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
  const stageConfig = serviceContractStages.find(s => s.value === stage)
  return stageConfig?.color || 'bg-gray-500'
}

function getStatusLabel(status: string | null) {
  const statusConfig = statuses.find(s => s.value === status)
  return statusConfig?.label || status || '-'
}

const stageNamesMn: Record<string, string> = {
  Closed: 'Хаагдсан',
  Hot: 'Халуун',
  Warm: 'Дулаан',
}

export function ServiceContractsDataTable({ data }: DataTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteServiceContract(deleteId)
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
              <TableHead>Гэрээний мэдээлэл</TableHead>
              <TableHead>Үе шат</TableHead>
              <TableHead className="text-right">Үнийн дүн</TableHead>
              <TableHead className="text-right">Жилээр төлөх</TableHead>
              <TableHead>Эхэлсэн</TableHead>
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
                  <TableCell>{item.contract_info || '-'}</TableCell>
                  <TableCell>
                    <Badge className={`${getStageColor(item.stage)} text-white`}>
                      {stageNamesMn[item.stage] || item.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.yearly_payment)}
                  </TableCell>
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
                          <Link href={`/service-contracts/${item.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Харах
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/service-contracts/${item.id}`}>
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
