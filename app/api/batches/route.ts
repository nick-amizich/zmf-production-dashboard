import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { protectRoute } from '@/lib/auth/protect-route'
import { ProductionService } from '@/lib/services/production-service'
import { 
  withErrorHandler, 
  ApiErrors, 
  assert,
  successResponse 
} from '@/lib/api/error-handler'
import { z } from 'zod'

// Validation schema
const createBatchSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1, 'At least one order is required'),
  priority: z.enum(['low', 'standard', 'high', 'urgent']).optional().default('standard'),
  notes: z.string().optional()
})

export const POST = protectRoute(
  withErrorHandler(async (request: NextRequest, { worker }) => {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = createBatchSchema.parse(body)

    // Use service client temporarily due to missing RLS policies
    // TODO: Switch back to regular client after applying migration
    const supabase = createServiceClient()
    
    // Pass worker ID to service since service client doesn't have auth context
    const productionService = new ProductionService(supabase, worker.id)

    // Map priority to database enum values
    const priorityMap: Record<string, string> = {
      'low': 'standard',
      'standard': 'standard',
      'high': 'rush',
      'urgent': 'expedite'
    }
    
    const dbPriority = priorityMap[validatedData.priority] || 'standard'

    let batch;
    try {
      // Create batch
      batch = await productionService.createBatch(
        validatedData.orderIds,
        dbPriority as any,
        validatedData.notes
      )
    } catch (error) {
      console.error('Batch creation error:', error)
      throw ApiErrors.Internal(`Failed to create batch: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Ensure batch was created
    assert(batch, ApiErrors.Internal('Failed to create batch'))

    // Log the action
    await supabase.from('system_logs').insert({
      user_id: worker.id,
      action: 'create_batch',
      context: 'production',
      details: {
        batch_id: batch.id,
        batch_number: batch.batch_number,
        order_count: validatedData.orderIds.length,
        priority: validatedData.priority,
      },
    })

    return successResponse(
      { batch },
      'Batch created successfully',
      { orderCount: validatedData.orderIds.length }
    )
  }),
  { requiredRole: ['manager', 'admin'] }
)