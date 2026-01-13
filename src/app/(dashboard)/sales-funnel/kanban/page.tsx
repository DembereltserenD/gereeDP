import Link from 'next/link'
import { List, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSalesFunnelByStage } from '@/lib/actions/sales-funnel'
import { KanbanBoard } from '@/components/sales-funnel/kanban-board'

export default async function KanbanPage() {
  const data = await getSalesFunnelByStage()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <p className="text-muted-foreground">
            Drag and drop to change stage
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/sales-funnel">
              <List className="mr-2 h-4 w-4" />
              Жагсаалт
            </Link>
          </Button>
          <Button asChild>
            <Link href="/sales-funnel/new">
              <Plus className="mr-2 h-4 w-4" />
              Нэмэх
            </Link>
          </Button>
        </div>
      </div>

      <KanbanBoard data={data} />
    </div>
  )
}
