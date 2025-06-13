import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ConfigurationService } from '@/lib/services/configuration-service'

import { logger } from '@/lib/logger'
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { 
      configurationId, 
      customerId, 
      quantity, 
      priority, 
      dueDate, 
      notes, 
      selectedOptions 
    } = body
    
    const configService = new ConfigurationService(supabase)
    
    // Validate configuration
    const configuration = await configService.getConfiguration(configurationId)
    if (!configuration) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
    }
    
    // Validate selected options
    const validation = configService.validateConfiguration(configuration, selectedOptions)
    if (!validation.valid) {
      return NextResponse.json({ 
        error: 'Invalid configuration', 
        errors: validation.errors 
      }, { status: 400 })
    }
    
    // Create the order
    const order = await configService.createOrderFromConfiguration({
      configurationId,
      customerId,
      quantity,
      priority,
      dueDate: new Date(dueDate),
      notes,
      selectedOptions,
    })
    
    return NextResponse.json(order)
  } catch (error) {
    logger.error('Error creating order from configuration:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}