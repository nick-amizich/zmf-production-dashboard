import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('product_configurations')
      .select(`
        *,
        product_options(
          *,
          option_values(*)
        )
      `)
      .order('name')
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    logger.error('Error fetching product configurations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product configurations' },
      { status: 500 }
    )
  }
}