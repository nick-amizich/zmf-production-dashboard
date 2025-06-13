import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { shopify_product_id } = body
    
    const { data, error } = await supabase
      .from('product_configurations')
      .update({ 
        shopify_product_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) throw error
    
    // Log the mapping change
    await supabase
      .from('shopify_api_logs')
      .insert({
        endpoint: 'product_mapping',
        method: 'PUT',
        status_code: 200,
        request_data: { config_id: params.id, shopify_product_id },
        response_data: { success: true },
      })
    
    return NextResponse.json(data)
  } catch (error) {
    logger.error('Error updating product mapping:', error)
    return NextResponse.json(
      { error: 'Failed to update product mapping' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data, error } = await supabase
      .from('product_configurations')
      .update({ 
        shopify_product_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) throw error
    
    // Log the mapping removal
    await supabase
      .from('shopify_api_logs')
      .insert({
        endpoint: 'product_mapping',
        method: 'DELETE',
        status_code: 200,
        request_data: { config_id: params.id },
        response_data: { success: true },
      })
    
    return NextResponse.json(data)
  } catch (error) {
    logger.error('Error removing product mapping:', error)
    return NextResponse.json(
      { error: 'Failed to remove product mapping' },
      { status: 500 }
    )
  }
}