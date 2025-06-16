import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { protectRoute } from '@/lib/auth/protect-route'
import { 
  withErrorHandler, 
  successResponse 
} from '@/lib/api/error-handler'

export const GET = protectRoute(
  withErrorHandler(async (request: NextRequest, { worker }) => {
    // Use service client temporarily due to missing RLS policies
    // TODO: Switch back to regular client after applying migration
    const supabase = createServiceClient()

    const { data: models, error } = await supabase
      .from('headphone_models')
      .select('*')
      .order('name')

    if (error) {
      throw new Error('Failed to fetch headphone models')
    }

    return successResponse(
      { models: models || [] },
      'Headphone models fetched successfully'
    )
  }),
  { requiredRole: ['worker', 'manager', 'admin'] }
)