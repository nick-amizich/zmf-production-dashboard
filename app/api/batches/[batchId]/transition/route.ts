import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { protectRoute } from '@/lib/auth/protect-route'
import { ProductionService } from '@/lib/services/production-service'

import { logger } from '@/lib/logger'
export const POST = protectRoute(
  async (
    request: NextRequest,
    { worker, params }: { worker: any; params: { batchId: string } }
  ) => {
    try {
      const { toStage, qualityCheckId } = await request.json()
      const { batchId } = params

      if (!toStage) {
        return NextResponse.json(
          { error: 'Stage is required' },
          { status: 400 }
        )
      }

      const supabase = await createClient()
      const productionService = new ProductionService(supabase)

      // Transition batch to new stage
      const updatedBatch = await productionService.transitionBatchStage(
        batchId,
        toStage,
        worker.id,
        qualityCheckId
      )

      // Log the action
      await supabase.from('system_logs').insert({
        user_id: worker.id,
        action: 'transition_batch_stage',
        context: 'production',
        details: {
          batch_id: batchId,
          to_stage: toStage,
          quality_check_id: qualityCheckId,
        },
      })

      return NextResponse.json({ 
        success: true, 
        batch: updatedBatch 
      })
    } catch (error: any) {
      logger.error('Error transitioning batch:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to transition batch' },
        { status: 500 }
      )
    }
  },
  { requiredRole: ['manager', 'admin'] }
)