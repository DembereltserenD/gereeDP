import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSalesFunnel } from '@/lib/actions/sales-funnel'
import { SalesFunnelDataTable } from '@/components/sales-funnel/data-table'

export default async function SalesFunnelPage() {
  const { data } = await getSalesFunnel()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Борлуулалт</h1>
          <p className="text-muted-foreground">
            Борлуулалтын бүх мэдээлэл
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/sales-funnel/kanban">Kanban</Link>
          </Button>
          <Button asChild>
            <Link href="/sales-funnel/new">
              <Plus className="mr-2 h-4 w-4" />
              Нэмэх
            </Link>
          </Button>
        </div>
      </div>

      <SalesFunnelDataTable data={data || []} />
    </div>
  )
}
