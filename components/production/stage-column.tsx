'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { BatchCard } from './batch-card'
import { Database } from '@/types/database.types'

type ProductionStage = Database['public']['Enums']['production_stage']
type Batch = Database['public']['Tables']['batches']['Row'] & {
  orders: any[]
  orderCount: number
}

interface StageColumnProps {
  stage: ProductionStage
  batches: Batch[]
  onBatchSelect: (batch: Batch) => void
  canDrop: boolean
}

const STAGE_COLORS: Record<ProductionStage, string> = {
  'Intake': 'border-theme-status-info',
  'Sanding': 'border-orange-500',
  'Finishing': 'border-theme-status-warning',
  'Sub-Assembly': 'border-purple-500',
  'Final Assembly': 'border-indigo-500',
  'Acoustic QC': 'border-theme-status-success',
  'Shipping': 'border-teal-500',
}

export function StageColumn({ 
  stage, 
  batches, 
  onBatchSelect,
  canDrop 
}: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    disabled: !canDrop,
  })

  const totalOrders = batches.reduce((sum, batch) => sum + batch.orderCount, 0)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-theme-bg-secondary/50 rounded-lg border-2 transition-colors",
        STAGE_COLORS[stage],
        isOver && "bg-theme-brand-secondary/10 border-theme-border-active"
      )}
    >
      <div className="p-4 border-b border-theme-border-primary">
        <h3 className="font-semibold text-theme-text-secondary">{stage}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {batches.length} {batches.length === 1 ? 'batch' : 'batches'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {batches.map(batch => (
          <BatchCard
            key={batch.id}
            batch={batch}
            onClick={() => onBatchSelect(batch)}
          />
        ))}
        
        {batches.length === 0 && (
          <div className="text-center text-theme-text-tertiary text-sm py-8">
            No batches in {stage}
          </div>
        )}
      </div>
    </div>
  )
}