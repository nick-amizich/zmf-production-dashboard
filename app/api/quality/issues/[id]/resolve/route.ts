import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { QualityService } from '@/lib/services/quality-service'

import { logger } from '@/lib/logger'
export async function POST(
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
    const { resolutionNotes } = body
    
    const qualityService = new QualityService(supabase)
    const issue = await qualityService.resolveIssue(
      params.id,
      resolutionNotes,
      worker.id
    )
    
    return NextResponse.json(issue)
  } catch (error) {
    logger.error('Error resolving issue:', error)
    return NextResponse.json(
      { error: 'Failed to resolve issue' },
      { status: 500 }
    )
  }
}