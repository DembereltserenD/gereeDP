'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { updateSalesFunnelStage } from '@/lib/actions/sales-funnel'
import { stages } from '@/lib/validations/sales-funnel'
import type { SalesFunnel, Stage } from '@/types/database'
import { formatDateShortMn, getRelativeTimeMn } from '@/lib/utils'
import { Calendar } from 'lucide-react'

interface KanbanBoardProps {
  data: Record<Stage, SalesFunnel[]>
}

function formatCurrency(value: number | null) {
  if (!value) return '-'
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    maximumFractionDigits: 0,
  }).format(value)
}

function getSmartDate(dateStr: string | null | undefined): { text: string; isUrgent: boolean; isPast: boolean } {
  if (!dateStr) return { text: '', isUrgent: false, isPast: false }

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return { text: '', isUrgent: false, isPast: false }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  let text = ''
  let isUrgent = false
  let isPast = false

  if (diffDays < 0) {
    isPast = true
    if (diffDays === -1) {
      text = 'Өчигдөр'
    } else if (diffDays > -7) {
      text = `${Math.abs(diffDays)} өдрийн өмнө`
    } else if (diffDays > -30) {
      text = `${Math.floor(Math.abs(diffDays) / 7)} долоо хоногийн өмнө`
    } else {
      text = formatDateShortMn(dateStr)
    }
  } else if (diffDays === 0) {
    text = 'Өнөөдөр'
    isUrgent = true
  } else if (diffDays === 1) {
    text = 'Маргааш'
    isUrgent = true
  } else if (diffDays <= 3) {
    text = `${diffDays} өдрийн дараа`
    isUrgent = true
  } else if (diffDays <= 7) {
    text = `${diffDays} өдрийн дараа`
  } else {
    text = formatDateShortMn(dateStr)
  }

  return { text, isUrgent, isPast }
}

interface KanbanCardProps {
  item: SalesFunnel
  isDragging?: boolean
}

function KanbanCard({ item, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Use close_date for deadline, fallback to created_date
  const dateToShow = item.close_date || item.created_date
  const smartDate = getSmartDate(dateToShow)

  return (
    <Link href={`/sales-funnel/${item.id}`}>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      >
        <CardContent className="p-3">
          <div className="font-medium text-sm mb-1">{item.client_name}</div>
          {item.work_info && (
            <div className="text-xs text-muted-foreground truncate mb-1">
              {item.work_info}
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-green-600">
              {formatCurrency(item.price)}
            </span>
            {item.team_member && (
              <Badge variant="outline" className="text-xs">
                {item.team_member}
              </Badge>
            )}
          </div>
          {smartDate.text && (
            <div className={`flex items-center gap-1 text-xs ${
              smartDate.isUrgent
                ? 'text-red-600 font-medium'
                : smartDate.isPast
                  ? 'text-gray-500'
                  : 'text-muted-foreground'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>{smartDate.text}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

const stageNamesMn: Record<string, string> = {
  Cold: 'Хүйтэн',
  Warm: 'Дулаан',
  Hot: 'Халуун',
  Won: 'Хожсон',
  Closed: 'Хаагдсан',
  Lost: 'Алдсан',
}

function KanbanColumn({
  stage,
  items,
  color,
}: {
  stage: Stage
  items: SalesFunnel[]
  color: string
}) {
  const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0)

  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      <Card className="h-full">
        <CardHeader className={`${color} rounded-t-lg py-3`}>
          <div className="flex items-center justify-between text-white">
            <CardTitle className="text-sm font-medium">{stageNamesMn[stage] || stage}</CardTitle>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {items.length}
            </Badge>
          </div>
          <div className="text-xs text-white/80">
            {formatCurrency(totalValue)}
          </div>
        </CardHeader>
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="p-2">
            <SortableContext
              items={items.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <KanbanCard key={item.id} item={item} />
              ))}
            </SortableContext>
            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Хоосон
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

export function KanbanBoard({ data }: KanbanBoardProps) {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [items, setItems] = useState(data)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const findItem = (id: string) => {
    for (const [stage, stageItems] of Object.entries(items)) {
      const item = stageItems.find(i => i.id === id)
      if (item) return { item, stage: stage as Stage }
    }
    return null
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeItem = findItem(active.id as string)
    if (!activeItem) return

    // Find the target stage from the over element
    let targetStage: Stage | null = null

    // Check if dropped over another item
    const overItem = findItem(over.id as string)
    if (overItem) {
      targetStage = overItem.stage
    } else {
      // Check if dropped over a column
      const stageNames: Stage[] = ['Cold', 'Warm', 'Hot', 'Won', 'Closed', 'Lost']
      if (stageNames.includes(over.id as Stage)) {
        targetStage = over.id as Stage
      }
    }

    if (!targetStage || targetStage === activeItem.stage) return

    // Optimistically update the UI
    const newItems = { ...items }
    newItems[activeItem.stage] = newItems[activeItem.stage].filter(
      i => i.id !== activeItem.item.id
    )
    const updatedItem = { ...activeItem.item, stage: targetStage }
    newItems[targetStage] = [...newItems[targetStage], updatedItem]
    setItems(newItems)

    // Update on server
    try {
      await updateSalesFunnelStage(activeItem.item.id, targetStage)
      router.refresh()
    } catch (error) {
      // Revert on error
      console.error('Failed to update stage:', error)
      setItems(data)
    }
  }

  const activeItem = activeId ? findItem(activeId)?.item : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.value}
            stage={stage.value as Stage}
            items={items[stage.value as Stage] || []}
            color={stage.color}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem && <KanbanCard item={activeItem} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}
