import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { QualityService } from '@/lib/services/quality-service'
import { Database } from '@/types/database.types'
import { logger } from '@/lib/logger'

type ProductionStage = Database['public']['Enums']['production_stage']

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage') as ProductionStage
    const modelId = searchParams.get('modelId')
    
    if (!stage) {
      return NextResponse.json({ error: 'Stage is required' }, { status: 400 })
    }
    
    const supabase = await createClient()
    const qualityService = new QualityService(supabase)
    
    // If modelId is provided, get model-specific checklist
    // Otherwise, get default checklist (null modelId)
    const checklist = await qualityService.getQualityChecklist(
      modelId || 'default', // Use 'default' as a placeholder for null model_id
      stage
    )
    
    logger.info(`Fetched quality checklist: ${checklist.length} items for stage ${stage}`, {
      stage,
      modelId: modelId || 'default',
      itemCount: checklist.length
    })
    
    return NextResponse.json(checklist)
  } catch (error) {
    logger.error('Failed to fetch quality checklist', error, { 
      endpoint: '/api/quality/checklist',
      searchParams: request.url
    })
    return NextResponse.json(
      { error: 'Failed to fetch checklist' },
      { status: 500 }
    )
  }
}