import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    const supabase = await createClient()
    const productionService = new ProductionService(supabase)

    // Create batch
    const batch = await productionService.createBatch(
      validatedData.orderIds,
      validatedData.priority as any,
      validatedData.notes
    )

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