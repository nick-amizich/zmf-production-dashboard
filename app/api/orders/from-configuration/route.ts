import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { protectRoute } from '@/lib/auth/protect-route'
import { 
  withErrorHandler, 
  ApiErrors, 
  assert,
  successResponse 
} from '@/lib/api/error-handler'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { Database } from '@/types/database.types'

// Validation schema
const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  modelId: z.string().uuid(),
  configuration: z.object({
    woodType: z.string().min(1, 'Wood type is required'),
    chassisMaterial: z.string(),
    grilleColor: z.string(),
    headbandMaterial: z.string(),
    installedPads: z.string(),
  }),
  orderNumber: z.string(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'standard', 'high', 'urgent']).optional().default('standard'),
  isSpeculative: z.boolean().optional().default(false),
  shopifyOrderId: z.string().nullable().optional()
})

export const POST = protectRoute(
  withErrorHandler(async (request: NextRequest, { worker }) => {
    // Parse and validate request body
    const body = await request.json()
    
    let validatedData;
    try {
      validatedData = createOrderSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        throw ApiErrors.ValidationFailed(issues)
      }
      throw error
    }

    // Use service client temporarily due to missing RLS policies
    // TODO: Switch back to regular client after applying migration
    const supabase = createServiceClient()

    // Verify customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', validatedData.customerId)
      .single()

    if (customerError || !customer) {
      throw ApiErrors.NotFound('Customer not found')
    }

    // Verify model exists
    const { data: model, error: modelError } = await supabase
      .from('headphone_models')
      .select('id')
      .eq('id', validatedData.modelId)
      .single()

    if (modelError || !model) {
      throw ApiErrors.NotFound('Headphone model not found')
    }

    // Map wood type from ID to database enum value
    const woodTypeMap: Record<string, string> = {
      'sapele': 'Sapele',
      'cherry': 'Cherry',
      'walnut': 'Walnut',
      'ash': 'Ash',
      'maple': 'Maple',
      'cocobolo': 'Cocobolo',
      'katalox': 'Katalox',
      'ziricote': 'Ziricote',
      'black-limba': 'Blackwood',
      'blackwood': 'Blackwood',
      'oak': 'Ash', // Map oak to ash as it's not in the enum
      'canary': 'Maple' // Map canary to maple as it's not in the enum
    }

    const mappedWoodType = (woodTypeMap[validatedData.configuration.woodType] || 'Sapele') as Database['public']['Enums']['wood_type']

    // Map priority values
    const priorityMap: Record<string, Database['public']['Enums']['batch_priority']> = {
      'low': 'standard',
      'standard': 'standard',
      'high': 'rush',
      'urgent': 'expedite'
    }
    const mappedPriority = priorityMap[validatedData.priority] || 'standard'

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: validatedData.orderNumber,
        customer_id: validatedData.customerId,
        model_id: validatedData.modelId,
        wood_type: mappedWoodType,
        customizations: validatedData.configuration,
        notes: validatedData.notes,
        priority: mappedPriority,
        shopify_order_id: validatedData.shopifyOrderId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (orderError) {
      logger.error('Order creation failed', {
        error: orderError,
        data: {
          wood_type: mappedWoodType,
          customerId: validatedData.customerId,
          modelId: validatedData.modelId,
          configuration: validatedData.configuration
        }
      })
      throw ApiErrors.Internal('Failed to create order: ' + orderError.message, orderError)
    }

    // Log the action
    logger.info('Order created', {
      orderId: order.id,
      orderNumber: order.order_number,
      modelId: validatedData.modelId,
      isSpeculative: validatedData.isSpeculative,
      createdBy: worker.id
    })

    return successResponse(
      { order },
      'Order created successfully'
    )
  }),
  { requiredRole: ['manager', 'admin'] }
)