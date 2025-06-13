import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { logger } from '@/lib/logger'
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required. Please log in first.' }, { status: 401 })
    }
    
    logger.debug('Sync initiated by user:', user.email)
    
    const { configurations } = await request.json()
    
    if (!Array.isArray(configurations)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }
    
    const results = []
    
    for (const config of configurations) {
      try {
        // Upsert product configuration
        const { data: productConfig, error: productError } = await supabase
          .from('product_configurations')
          .upsert({
            shopify_product_id: config.shopifyProductId || config.id,
            name: config.name,
            base_price: config.basePrice,
            base_sku: config.baseSku,
            description: config.description,
            active: true
          }, {
            onConflict: 'shopify_product_id'
          })
          .select()
          .single()
        
        if (productError) throw productError
        
        // Delete existing options for clean sync
        await supabase
          .from('product_options')
          .delete()
          .eq('configuration_id', productConfig.id)
        
        // Insert options
        for (const option of config.options) {
          const { data: optionData, error: optionError } = await supabase
            .from('product_options')
            .insert({
              configuration_id: productConfig.id,
              name: option.name,
              type: option.type,
              required: option.required,
              display_order: option.displayOrder
            })
            .select()
            .single()
          
          if (optionError) throw optionError
          
          // Insert option values
          const values = option.values.map((value: any) => ({
            option_id: optionData.id,
            name: value.name,
            price_modifier: value.priceModifier,
            sku: value.sku,
            available: value.available,
            metadata: value.metadata || {}
          }))
          
          const { error: valuesError } = await supabase
            .from('option_values')
            .insert(values)
          
          if (valuesError) throw valuesError
        }
        
        results.push({
          shopifyProductId: config.shopifyProductId || config.id,
          success: true
        })
        
      } catch (error) {
        logger.error('Error syncing configuration:', error)
        results.push({
          shopifyProductId: config.shopifyProductId || config.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      message: 'Sync completed',
      results
    })
    
  } catch (error) {
    logger.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}