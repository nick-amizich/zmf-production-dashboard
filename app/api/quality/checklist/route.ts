import { NextResponse } from 'next/server'
import { Database } from '@/types/database.types'

import { logger } from '@/lib/logger'
type ProductionStage = Database['public']['Enums']['production_stage']

// Default checklists for each stage
const defaultChecklists: Record<ProductionStage, any[]> = {
  'Intake': [
    { id: 1, category: 'Wood Quality', item: 'Check for cracks or defects', required: true },
    { id: 2, category: 'Wood Quality', item: 'Verify wood type matches order', required: true },
    { id: 3, category: 'Measurements', item: 'Verify dimensions', required: true },
    { id: 4, category: 'Documentation', item: 'Order details match specifications', required: true },
  ],
  'Sanding': [
    { id: 1, category: 'Surface', item: 'Check smoothness (220 grit)', required: true },
    { id: 2, category: 'Surface', item: 'No visible scratches', required: true },
    { id: 3, category: 'Shape', item: 'Maintain original contours', required: true },
    { id: 4, category: 'Edges', item: 'Smooth and even edges', required: true },
  ],
  'Finishing': [
    { id: 1, category: 'Coating', item: 'Even coat application', required: true },
    { id: 2, category: 'Coating', item: 'No runs or drips', required: true },
    { id: 3, category: 'Coating', item: 'Proper cure time observed', required: true },
    { id: 4, category: 'Quality', item: 'No dust or debris in finish', required: true },
  ],
  'Sub-Assembly': [
    { id: 1, category: 'Components', item: 'All parts present', required: true },
    { id: 2, category: 'Fit', item: 'Components fit properly', required: true },
    { id: 3, category: 'Alignment', item: 'Proper alignment verified', required: true },
    { id: 4, category: 'Hardware', item: 'Screws and fasteners secure', required: true },
  ],
  'Final Assembly': [
    { id: 1, category: 'Assembly', item: 'All components secure', required: true },
    { id: 2, category: 'Function', item: 'Moving parts operate smoothly', required: true },
    { id: 3, category: 'Aesthetics', item: 'No visible assembly marks', required: true },
    { id: 4, category: 'Completeness', item: 'All features functioning', required: true },
  ],
  'Acoustic QC': [
    { id: 1, category: 'Sound', item: 'Frequency response within spec', required: true },
    { id: 2, category: 'Sound', item: 'No rattles or buzzing', required: true },
    { id: 3, category: 'Sound', item: 'Channel balance verified', required: true },
    { id: 4, category: 'Performance', item: 'Impedance within tolerance', required: true },
  ],
  'Shipping': [
    { id: 1, category: 'Packaging', item: 'Proper protective packaging', required: true },
    { id: 2, category: 'Documentation', item: 'All documents included', required: true },
    { id: 3, category: 'Final Check', item: 'Serial number recorded', required: true },
    { id: 4, category: 'Presentation', item: 'Clean and presentable', required: true },
  ],
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage') as ProductionStage
    
    if (!stage || !defaultChecklists[stage]) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
    }
    
    return NextResponse.json(defaultChecklists[stage])
  } catch (error) {
    logger.error('Error fetching checklist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checklist' },
      { status: 500 }
    )
  }
}