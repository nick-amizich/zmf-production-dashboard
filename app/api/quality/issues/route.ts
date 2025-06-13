import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { QualityService } from '@/lib/services/quality-service'
import { 
  withErrorHandler, 
  ApiErrors, 
  assert,
  successResponse,
  apiResponse 
} from '@/lib/api/error-handler'
import { z } from 'zod'
import { protectRoute } from '@/lib/auth/protect-route'

// Validation schemas
const reportIssueSchema = z.object({
  orderId: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  stage: z.enum([
    'Intake',
    'Sanding',
    'Finishing',
    'Sub-Assembly',
    'Final Assembly',
    'Acoustic QC',
    'Shipping'
  ]),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  assignedTo: z.string().uuid().optional(),
  photoUrls: z.array(z.string().url()).optional()
}).refine(
  data => data.orderId || data.batchId,
  { message: 'Either orderId or batchId must be provided' }
)

const getIssuesSchema = z.object({
  active: z.coerce.boolean().optional(),
  assignedTo: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0)
})

export const POST = protectRoute(
  withErrorHandler(async (request: NextRequest, { worker }) => {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = reportIssueSchema.parse(body)
    
    const supabase = await createClient()
    const qualityService = new QualityService(supabase)
    
    // Report the issue
    const issue = await qualityService.reportIssue(
      {
        orderId: validatedData.orderId,
        batchId: validatedData.batchId,
        stage: validatedData.stage as any,
        category: validatedData.category,
        description: validatedData.description,
        severity: validatedData.severity as any,
        assignedTo: validatedData.assignedTo,
      },
      worker.id
    )
    
    assert(issue, ApiErrors.Internal('Failed to create issue'))
    
    return successResponse(
      { issue },
      'Issue reported successfully'
    )
  })
)

export const GET = protectRoute(
  withErrorHandler(async (request: NextRequest) => {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const params = getIssuesSchema.parse(searchParams)
    
    const supabase = await createClient()
    
    // Build query with proper typing
    let query = supabase
      .from('issues')
      .select(`
        *,
        reported_by_worker:workers!issues_reported_by_fkey(id, name, email),
        assigned_to_worker:workers!issues_assigned_to_fkey(id, name, email),
        resolved_by_worker:workers!issues_resolved_by_fkey(id, name, email),
        order:orders(
          id,
          order_number,
          headphone_model:headphone_models(name)
        ),
        batch:batches(
          id,
          batch_number,
          current_stage
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (params.active !== undefined) {
      query = query.eq('is_resolved', !params.active)
    }
    
    if (params.assignedTo) {
      query = query.eq('assigned_to', params.assignedTo)
    }
    
    if (params.batchId) {
      query = query.eq('batch_id', params.batchId)
    }
    
    if (params.orderId) {
      query = query.eq('order_id', params.orderId)
    }
    
    if (params.severity) {
      query = query.eq('severity', params.severity)
    }
    
    // Apply pagination
    query = query.range(
      params.offset, 
      params.offset + params.limit - 1
    )
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return apiResponse({
      issues: data || [],
      pagination: {
        total: count || 0,
        limit: params.limit,
        offset: params.offset,
        hasMore: (count || 0) > params.offset + params.limit
      }
    })
  })
)