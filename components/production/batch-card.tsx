'use client'

import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Package, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { Database } from '@/types/database.types'

type Batch = Database['public']['Tables']['batches']['Row'] & {
  orders: any[]
  orderCount: number
}

interface BatchCardProps {
  batch: Batch
  onClick?: () => void
  isDragging?: boolean
}

const PRIORITY_COLORS = {
  standard: 'text-theme-text-tertiary',
  rush: 'text-theme-status-warning',
  expedite: 'text-theme-status-error',
}

const QUALITY_ICONS = {
  good: <CheckCircle className="w-4 h-4 text-theme-status-success" />,
  warning: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  critical: <AlertCircle className="w-4 h-4 text-theme-status-error" />,
  hold: <AlertCircle className="w-4 h-4 text-theme-status-error" />,
}

export function BatchCard({ batch, onClick, isDragging }: BatchCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: batch.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const hasHighPriorityOrders = batch.orders.some(
    order => order.priority === 'rush' || order.priority === 'expedite'
  )

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "p-3 cursor-pointer transition-all hover:shadow-lg",
        "bg-theme-bg-primary border-theme-border-primary hover:border-theme-border-primary",
        isDragging && "opacity-50",
        batch.quality_status === 'hold' && "border-theme-status-error/50"
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-theme-text-secondary">
            {batch.batch_number}
          </span>
          {QUALITY_ICONS[batch.quality_status]}
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <Badge 
            variant="outline" 
            className={cn("border-theme-border-primary", PRIORITY_COLORS[batch.priority])}
          >
            {batch.priority}
          </Badge>
          
          <div className="flex items-center gap-1 text-theme-text-tertiary">
            <Package className="w-3 h-3" />
            <span>{batch.orderCount} orders</span>
          </div>
        </div>
        
        {hasHighPriorityOrders && (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Priority Orders
          </Badge>
        )}
        
        <div className="text-xs text-theme-text-tertiary">
          Created {new Date(batch.created_at!).toLocaleDateString()}
        </div>
      </div>
    </Card>
  )
}