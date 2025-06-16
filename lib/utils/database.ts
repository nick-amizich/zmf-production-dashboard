import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * Execute multiple database operations in a transaction
 * Uses Supabase's RPC function for transaction support
 */
export async function withTransaction<T>(
  operations: (tx: any) => Promise<T>
): Promise<T> {
  const supabase = await createClient()
  
  try {
    // Start transaction
    const { data, error } = await supabase.rpc('begin_transaction')
    if (error) throw error
    
    try {
      // Execute operations
      const result = await operations(supabase)
      
      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_transaction')
      if (commitError) throw commitError
      
      return result
    } catch (error) {
      // Rollback on error
      await supabase.rpc('rollback_transaction')
      throw error
    }
  } catch (error) {
    logger.error('Transaction failed', error)
    throw error
  }
}

/**
 * Batch insert/update operations for better performance
 */
export async function batchOperation<T extends { id?: string }>(
  table: any, // Allow any table name for now
  items: T[],
  operation: 'insert' | 'upsert' = 'insert',
  batchSize = 100
): Promise<T[]> {
  const supabase = await createClient()
  const results: T[] = []
  
  // Process in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    
    const query = operation === 'insert' 
      ? supabase.from(table).insert(batch)
      : supabase.from(table).upsert(batch)
      
    const { data, error } = await query.select()
    
    if (error) {
      logger.error(`Batch ${operation} failed for ${table}`, error, { 
        batchStart: i, 
        batchSize: batch.length 
      })
      throw error
    }
    
    if (data) {
      results.push(...(data as unknown as T[]))
    }
  }
  
  return results
}

/**
 * Optimized query builder for complex joins
 */
export function buildOptimizedQuery(
  supabase: any,
  table: string,
  options: {
    select?: string
    filters?: Record<string, any>
    joins?: Array<{ table: string; on: string; select?: string }>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
    offset?: number
  }
) {
  let query = supabase.from(table)
  
  // Build select with joins
  if (options.select || options.joins) {
    const selectParts = [options.select || '*']
    
    if (options.joins) {
      options.joins.forEach(join => {
        selectParts.push(`${join.table}(${join.select || '*'})`)
      })
    }
    
    query = query.select(selectParts.join(','))
  }
  
  // Apply filters
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value === null) {
        query = query.is(key, null)
      } else if (Array.isArray(value)) {
        query = query.in(key, value)
      } else {
        query = query.eq(key, value)
      }
    })
  }
  
  // Apply ordering
  if (options.orderBy) {
    query = query.order(options.orderBy.column, { 
      ascending: options.orderBy.ascending ?? true 
    })
  }
  
  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit)
  }
  
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  return query
}

/**
 * Helper to check if a Supabase error is a unique constraint violation
 */
export function isUniqueConstraintError(error: any): boolean {
  return error?.code === '23505' || 
         error?.message?.includes('duplicate key') ||
         error?.message?.includes('unique constraint')
}

/**
 * Helper to check if a Supabase error is a foreign key violation
 */
export function isForeignKeyError(error: any): boolean {
  return error?.code === '23503' || 
         error?.message?.includes('foreign key') ||
         error?.message?.includes('violates foreign key constraint')
}

/**
 * Retry a database operation with exponential backoff
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 100
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on certain errors
      if (isUniqueConstraintError(error) || isForeignKeyError(error)) {
        throw error
      }
      
      // Log retry attempt
      logger.warn(`Database operation failed, retrying (${i + 1}/${maxRetries})`, {
        error: error.message,
        attempt: i + 1
      })
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}