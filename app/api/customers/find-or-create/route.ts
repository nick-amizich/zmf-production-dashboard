import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { protectRoute } from '@/lib/auth/protect-route'
import { 
  withErrorHandler, 
  ApiErrors, 
  successResponse 
} from '@/lib/api/error-handler'
import { z } from 'zod'
import { logger } from '@/lib/logger'

// Validation schema
const findOrCreateCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  phone: z.string().optional(),
  tags: z.array(z.string()).optional()
})

export const POST = protectRoute(
  withErrorHandler(async (request: NextRequest, { worker }) => {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = findOrCreateCustomerSchema.parse(body)

    // Use service client temporarily due to missing RLS policies
    // TODO: Switch back to regular client after applying migration
    const supabase = createServiceClient()
    
    logger.info('Customer find-or-create request:', { 
      email: validatedData.email, 
      name: validatedData.name,
      workerId: worker.id 
    })

    // Try to find existing customer
    const { data: customers, error: findError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', validatedData.email)
    
    if (findError) {
      logger.error('Error finding customer:', findError)
      throw ApiErrors.Internal('Failed to search for customer', findError)
    }
    
    let customer = customers && customers.length > 0 ? customers[0] : null
    
    if (!customer) {
      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          email: validatedData.email,
          name: validatedData.name,
          phone: validatedData.phone || null,
        })
        .select()
        .single()
      
      if (createError) {
        logger.error('Error creating customer:', createError)
        throw ApiErrors.Internal('Failed to create customer', createError)
      }
      
      customer = newCustomer
      logger.info('Created new customer:', { customerId: customer.id })
    } else {
      // Update existing customer if new info provided
      if (validatedData.name !== customer.name || (validatedData.phone && validatedData.phone !== customer.phone)) {
        const updates: any = {}
        if (validatedData.name !== customer.name) updates.name = validatedData.name
        if (validatedData.phone && validatedData.phone !== customer.phone) updates.phone = validatedData.phone
        
        // Only update if there are actual changes
        if (Object.keys(updates).length > 0) {
          const { data: updatedCustomer, error: updateError } = await supabase
            .from('customers')
            .update(updates)
            .eq('id', customer.id)
            .select()
            .single()
          
          if (updateError) {
            logger.error('Error updating customer:', updateError)
            throw ApiErrors.Internal('Failed to update customer', updateError)
          }
          
          customer = updatedCustomer
          logger.info('Updated existing customer:', { customerId: customer.id })
        } else {
          logger.info('No updates needed for existing customer:', { customerId: customer.id })
        }
      } else {
        logger.info('Found existing customer:', { customerId: customer.id })
      }
    }

    return successResponse(
      { customer },
      customers && customers.length > 0 ? 'Customer found' : 'Customer created'
    )
  }),
  { requiredRole: ['worker', 'manager', 'admin'] } // Allow all authenticated users
)