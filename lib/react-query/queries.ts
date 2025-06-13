import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { logger } from '@/lib/logger'

type Tables = Database['public']['Tables']
type Order = Tables['orders']['Row']
type Batch = Tables['batches']['Row']
type Worker = Tables['workers']['Row']
type Issue = Tables['issues']['Row']
type QualityCheck = Tables['quality_checks']['Row']

// Query keys factory
export const queryKeys = {
  all: ['zmf'] as const,
  auth: () => [...queryKeys.all, 'auth'] as const,
  workers: () => [...queryKeys.all, 'workers'] as const,
  worker: (id: string) => [...queryKeys.workers(), id] as const,
  orders: () => [...queryKeys.all, 'orders'] as const,
  order: (id: string) => [...queryKeys.orders(), id] as const,
  batches: () => [...queryKeys.all, 'batches'] as const,
  batch: (id: string) => [...queryKeys.batches(), id] as const,
  issues: () => [...queryKeys.all, 'issues'] as const,
  issue: (id: string) => [...queryKeys.issues(), id] as const,
  qualityChecks: () => [...queryKeys.all, 'quality-checks'] as const,
  qualityCheck: (id: string) => [...queryKeys.qualityChecks(), id] as const,
  productionMetrics: () => [...queryKeys.all, 'production-metrics'] as const,
  stageAssignments: () => [...queryKeys.all, 'stage-assignments'] as const,
}

// Auth queries
export function useCurrentUser() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: queryKeys.auth(),
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      if (!user) return null
      
      // Get worker profile
      const { data: worker, error: workerError } = await supabase
        .from('workers')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()
        
      if (workerError) {
        logger.error('Failed to fetch worker profile', workerError)
        throw workerError
      }
      
      return { user, worker }
    },
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    retry: false, // Don't retry auth failures
  })
}

// Worker queries
export function useWorkers() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: queryKeys.workers(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('name')
        
      if (error) throw error
      return data
    },
  })
}

export function useWorker(id: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: queryKeys.worker(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', id)
        .single()
        
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Order queries
export function useOrders(filters?: {
  status?: string
  customerId?: string
  limit?: number
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: [...queryKeys.orders(), filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          headphone_model:headphone_models(*)
        `)
        .order('created_at', { ascending: false })
        
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId)
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    },
  })
}

export function useOrder(id: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          headphone_model:headphone_models(*),
          quality_checks(*),
          issues(*)
        `)
        .eq('id', id)
        .single()
        
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Batch queries
export function useBatches(filters?: {
  stage?: string
  status?: string
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: [...queryKeys.batches(), filters],
    queryFn: async () => {
      let query = supabase
        .from('batches')
        .select(`
          *,
          batch_orders(
            order:orders(
              *,
              customer:customers(*),
              headphone_model:headphone_models(*)
            )
          )
        `)
        .order('created_at', { ascending: false })
        
      if (filters?.stage) {
        query = query.eq('current_stage', filters.stage)
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    },
  })
}

// Issue queries
export function useIssues(filters?: {
  status?: 'open' | 'resolved' | 'investigating'
  severity?: string
  orderId?: string
  batchId?: string
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: [...queryKeys.issues(), filters],
    queryFn: async () => {
      let query = supabase
        .from('issues')
        .select(`
          *,
          order:orders(*),
          batch:batches(*),
          reporter:workers!reported_by(*),
          assignee:workers!assigned_to(*)
        `)
        .order('created_at', { ascending: false })
        
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters?.severity) {
        query = query.eq('severity', filters.severity)
      }
      
      if (filters?.orderId) {
        query = query.eq('order_id', filters.orderId)
      }
      
      if (filters?.batchId) {
        query = query.eq('batch_id', filters.batchId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    },
  })
}

// Quality check queries
export function useQualityChecks(filters?: {
  orderId?: string
  batchId?: string
  stage?: string
  status?: string
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: [...queryKeys.qualityChecks(), filters],
    queryFn: async () => {
      let query = supabase
        .from('quality_checks')
        .select(`
          *,
          order:orders(*),
          batch:batches(*),
          worker:workers(*)
        `)
        .order('created_at', { ascending: false })
        
      if (filters?.orderId) {
        query = query.eq('order_id', filters.orderId)
      }
      
      if (filters?.batchId) {
        query = query.eq('batch_id', filters.batchId)
      }
      
      if (filters?.stage) {
        query = query.eq('stage', filters.stage)
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    },
  })
}

// Production metrics
export function useProductionMetrics(dateRange?: { start: Date; end: Date }) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: [...queryKeys.productionMetrics(), dateRange],
    queryFn: async () => {
      let query = supabase
        .from('production_metrics')
        .select('*')
        .order('date', { ascending: false })
        
      if (dateRange) {
        query = query
          .gte('date', dateRange.start.toISOString())
          .lte('date', dateRange.end.toISOString())
      } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        query = query.gte('date', thirtyDaysAgo.toISOString())
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    },
  })
}

// Stage assignments
export function useStageAssignments(workerId?: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: [...queryKeys.stageAssignments(), { workerId }],
    queryFn: async () => {
      let query = supabase
        .from('stage_assignments')
        .select(`
          *,
          worker:workers(*),
          batch:batches(
            *,
            batch_orders(
              order:orders(*)
            )
          )
        `)
        .eq('status', 'active')
        .order('assigned_at', { ascending: false })
        
      if (workerId) {
        query = query.eq('worker_id', workerId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    },
  })
}

// Mutations
export function useCompleteAssignment() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async ({ 
      assignmentId, 
      notes 
    }: { 
      assignmentId: string
      notes?: string 
    }) => {
      const response = await fetch(`/api/worker/assignments/${assignmentId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete assignment')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.stageAssignments() })
      queryClient.invalidateQueries({ queryKey: queryKeys.batches() })
    },
  })
}

export function useReportIssue() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (issueData: {
      orderId?: string
      batchId?: string
      stage: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      photoUrls?: string[]
      assignedTo?: string
    }) => {
      const response = await fetch('/api/quality/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to report issue')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate issues queries
      queryClient.invalidateQueries({ queryKey: queryKeys.issues() })
    },
  })
}

export function useResolveIssue() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      issueId,
      resolution,
      resolutionNotes
    }: {
      issueId: string
      resolution: 'fixed' | 'wont_fix' | 'duplicate'
      resolutionNotes?: string
    }) => {
      const response = await fetch(`/api/quality/issues/${issueId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution, resolutionNotes }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to resolve issue')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate specific issue and issues list
      queryClient.invalidateQueries({ queryKey: queryKeys.issue(variables.issueId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.issues() })
    },
  })
}

export function useTransitionBatch() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      batchId,
      toStage,
      workerId,
      notes
    }: {
      batchId: string
      toStage: string
      workerId?: string
      notes?: string
    }) => {
      const response = await fetch(`/api/batches/${batchId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStage, workerId, notes }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to transition batch')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate batch and related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.batch(variables.batchId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.batches() })
      queryClient.invalidateQueries({ queryKey: queryKeys.stageAssignments() })
    },
  })
}