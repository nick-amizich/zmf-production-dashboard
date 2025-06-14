'use client'

import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import { useState, useEffect } from 'react'
import { StageColumn } from './stage-column'
import { BatchCard } from './batch-card'
import { Database } from '@/types/database.types'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useMultiRealtime } from '@/hooks/use-realtime'
import { logger } from '@/lib/logger'

type ProductionStage = Database['public']['Enums']['production_stage']
type Batch = Database['public']['Tables']['batches']['Row'] & {
  orders: any[]
  orderCount: number
}

interface ProductionPipelineProps {
  pipeline: Record<ProductionStage, Batch[]>
  userRole: Database['public']['Enums']['worker_role']
  userId: string
}

const STAGE_ORDER: ProductionStage[] = [
  'Intake',
  'Sanding',
  'Finishing',
  'Sub-Assembly',
  'Final Assembly',
  'Acoustic QC',
  'Shipping',
]

export function ProductionPipeline({ 
  pipeline: initialPipeline, 
  userRole,
  userId 
}: ProductionPipelineProps) {
  const [pipeline, setPipeline] = useState(initialPipeline)
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null)
  const router = useRouter()
  const isManager = userRole === 'manager' || userRole === 'admin'

  // Subscribe to real-time updates for batches
  useMultiRealtime({
    subscriptions: [
      { table: 'batches' },
      { table: 'batch_orders' },
      { table: 'stage_assignments' }
    ],
    onChange: (table, payload) => {
      logger.debug(`Production pipeline real-time update from ${table}`, payload)
      
      // For now, we'll trigger a full page refresh to get updated data
      // In a production app, you'd update the specific batch in the pipeline
      if (table === 'batches' && payload.eventType === 'UPDATE') {
        const updatedBatch = payload.new as Batch
        
        setPipeline(prev => {
          const newPipeline = { ...prev }
          
          // Remove batch from all stages
          STAGE_ORDER.forEach(stage => {
            newPipeline[stage] = newPipeline[stage].filter(
              b => b.id !== updatedBatch.id
            )
          })
          
          // Add batch to its new stage
          if (updatedBatch.current_stage && newPipeline[updatedBatch.current_stage]) {
            newPipeline[updatedBatch.current_stage] = [
              ...newPipeline[updatedBatch.current_stage],
              updatedBatch
            ]
          }
          
          return newPipeline
        })
      }
      
      // Refresh page data for other changes
      if (table === 'batch_orders' || table === 'stage_assignments') {
        router.refresh()
      }
    }
  })

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || !isManager) return
    
    const batchId = active.id as string
    const newStage = over.id as ProductionStage
    
    // Find the batch
    let batch: Batch | null = null
    let currentStage: ProductionStage | null = null
    
    for (const [stage, batches] of Object.entries(pipeline)) {
      const found = batches.find(b => b.id === batchId)
      if (found) {
        batch = found
        currentStage = stage as ProductionStage
        break
      }
    }
    
    if (!batch || !currentStage || currentStage === newStage) return
    
    // Validate stage progression
    const currentIndex = STAGE_ORDER.indexOf(currentStage)
    const newIndex = STAGE_ORDER.indexOf(newStage)
    
    if (newIndex <= currentIndex) {
      toast.error('Batches can only move forward in the pipeline')
      return
    }
    
    // Call API to update batch stage
    try {
      const response = await fetch(`/api/batches/${batchId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStage: newStage }),
      })
      
      if (!response.ok) throw new Error('Failed to update batch')
      
      toast.success(`Batch moved to ${newStage}`)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update batch stage')
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-4 min-h-[calc(100vh-200px)]">
        {STAGE_ORDER.map(stage => (
          <StageColumn
            key={stage}
            stage={stage}
            batches={pipeline[stage]}
            onBatchSelect={(batch) => {
              if (isManager) {
                router.push(`/production/batches/${batch.id}`)
              } else {
                setActiveBatch(batch)
              }
            }}
            canDrop={isManager}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeBatch && (
          <BatchCard 
            batch={activeBatch} 
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}