import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

/**
 * Create a Supabase client with service role key
 * IMPORTANT: Only use this for server-side operations that require admin access
 * Never expose the service role key to the client
 */
export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}