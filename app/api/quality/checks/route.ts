import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { QualityService } from '@/lib/services/quality-service'
import { Database } from '@/types/database.types'
import { logger } from '@/lib/logger'
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get worker
    const { data: worker } = await supabase
      .from('workers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
      
    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }
    
    const body = await request.json()
    const { batchId, stage, checklistData, overallStatus, notes, photos } = body
    
    const qualityService = new QualityService(supabase)
    const qualityCheck = await qualityService.createQualityCheck(
      {
        batchId,
        stage,
        checklistData,
        overallStatus,
        notes,
        photos,
      },
      worker.id
    )
    
    return NextResponse.json(qualityCheck)
  } catch (error) {
    logger.error('Error creating quality check:', error)
    return NextResponse.json(
      { error: 'Failed to create quality check' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')
    const orderId = searchParams.get('orderId')
    const stage = searchParams.get('stage')
    
    let query = supabase
      .from('quality_checks')
      .select(`
        *,
        worker:workers(*),
        order:orders(*),
        batch:batches(*)
      `)
      .order('created_at', { ascending: false })
    
    if (batchId) query = query.eq('batch_id', batchId)
    if (orderId) query = query.eq('order_id', orderId)
    if (stage) query = query.eq('stage', stage as Database['public']['Enums']['production_stage'])
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    logger.error('Error fetching quality checks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quality checks' },
      { status: 500 }
    )
  }
}