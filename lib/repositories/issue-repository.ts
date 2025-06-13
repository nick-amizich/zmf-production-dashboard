import { BaseRepository, DatabaseError } from './base-repository'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type Issue = Database['public']['Tables']['issues']['Row']
type IssueInsert = Database['public']['Tables']['issues']['Insert']
type IssueUpdate = Database['public']['Tables']['issues']['Update']
type Worker = Database['public']['Tables']['workers']['Row']
type Order = Database['public']['Tables']['orders']['Row']
type Batch = Database['public']['Tables']['batches']['Row']

export interface IssueWithDetails extends Issue {
  reported_by_worker: Worker | null
  assigned_to_worker: Worker | null
  resolved_by_worker: Worker | null
  order: Order | null
  batch: Batch | null
}

export class IssueRepository extends BaseRepository<Issue> {
  constructor(protected supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findById(id: string): Promise<IssueWithDetails | null> {
    const { data, error } = await this.supabase
      .from('issues')
      .select(`
        *,
        reported_by_worker:workers!issues_reported_by_fkey(*),
        assigned_to_worker:workers!issues_assigned_to_fkey(*),
        resolved_by_worker:workers!issues_resolved_by_fkey(*),
        order:orders(*),
        batch:batches(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Failed to fetch issue', error)
    }

    return data as IssueWithDetails
  }

  async findAll(): Promise<IssueWithDetails[]> {
    const { data, error } = await this.supabase
      .from('issues')
      .select(`
        *,
        reported_by_worker:workers!issues_reported_by_fkey(*),
        assigned_to_worker:workers!issues_assigned_to_fkey(*),
        resolved_by_worker:workers!issues_resolved_by_fkey(*),
        order:orders(*),
        batch:batches(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch issues', error)

    return (data || []) as IssueWithDetails[]
  }

  async findActive(): Promise<IssueWithDetails[]> {
    const { data, error } = await this.supabase
      .from('issues')
      .select(`
        *,
        reported_by_worker:workers!issues_reported_by_fkey(*),
        assigned_to_worker:workers!issues_assigned_to_fkey(*),
        resolved_by_worker:workers!issues_resolved_by_fkey(*),
        order:orders(*),
        batch:batches(*)
      `)
      .eq('is_resolved', false)
      .order('severity', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw new DatabaseError('Failed to fetch active issues', error)

    return (data || []) as IssueWithDetails[]
  }

  async findByOrder(orderId: string): Promise<IssueWithDetails[]> {
    const { data, error } = await this.supabase
      .from('issues')
      .select(`
        *,
        reported_by_worker:workers!issues_reported_by_fkey(*),
        assigned_to_worker:workers!issues_assigned_to_fkey(*),
        resolved_by_worker:workers!issues_resolved_by_fkey(*),
        order:orders(*),
        batch:batches(*)
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch order issues', error)

    return (data || []) as IssueWithDetails[]
  }

  async findByBatch(batchId: string): Promise<IssueWithDetails[]> {
    const { data, error } = await this.supabase
      .from('issues')
      .select(`
        *,
        reported_by_worker:workers!issues_reported_by_fkey(*),
        assigned_to_worker:workers!issues_assigned_to_fkey(*),
        resolved_by_worker:workers!issues_resolved_by_fkey(*),
        order:orders(*),
        batch:batches(*)
      `)
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch batch issues', error)

    return (data || []) as IssueWithDetails[]
  }

  async findAssignedTo(workerId: string): Promise<IssueWithDetails[]> {
    const { data, error } = await this.supabase
      .from('issues')
      .select(`
        *,
        reported_by_worker:workers!issues_reported_by_fkey(*),
        assigned_to_worker:workers!issues_assigned_to_fkey(*),
        resolved_by_worker:workers!issues_resolved_by_fkey(*),
        order:orders(*),
        batch:batches(*)
      `)
      .eq('assigned_to', workerId)
      .eq('is_resolved', false)
      .order('severity', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw new DatabaseError('Failed to fetch assigned issues', error)

    return (data || []) as IssueWithDetails[]
  }

  async create(data: IssueInsert): Promise<Issue> {
    const { data: issue, error } = await this.supabase
      .from('issues')
      .insert(data)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to create issue', error)
    return issue
  }

  async update(id: string, data: IssueUpdate): Promise<Issue> {
    const { data: issue, error } = await this.supabase
      .from('issues')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to update issue', error)
    return issue
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('issues')
      .delete()
      .eq('id', id)

    if (error) throw new DatabaseError('Failed to delete issue', error)
  }

  async assignIssue(id: string, workerId: string): Promise<Issue> {
    return this.update(id, { assigned_to: workerId })
  }

  async resolveIssue(
    id: string,
    resolutionNotes: string,
    resolvedBy: string
  ): Promise<Issue> {
    return this.update(id, {
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
      resolution_notes: resolutionNotes,
    })
  }

  async getIssueStats(): Promise<{
    total: number
    active: number
    resolved: number
    bySeverity: Record<string, number>
    byCategory: Record<string, number>
    avgResolutionTime: number
  }> {
    const { data, error } = await this.supabase
      .from('issues')
      .select('*')

    if (error) throw new DatabaseError('Failed to fetch issue stats', error)

    const issues = data || []
    const total = issues.length
    const active = issues.filter(i => !i.is_resolved).length
    const resolved = issues.filter(i => i.is_resolved).length

    // Group by severity
    const bySeverity: Record<string, number> = {}
    issues.forEach(issue => {
      bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1
    })

    // Group by category
    const byCategory: Record<string, number> = {}
    issues.forEach(issue => {
      byCategory[issue.category] = (byCategory[issue.category] || 0) + 1
    })

    // Calculate average resolution time
    const resolvedIssues = issues.filter(i => i.is_resolved && i.resolved_at)
    let avgResolutionTime = 0
    
    if (resolvedIssues.length > 0) {
      const totalTime = resolvedIssues.reduce((sum, issue) => {
        const created = new Date(issue.created_at!).getTime()
        const resolved = new Date(issue.resolved_at!).getTime()
        return sum + (resolved - created)
      }, 0)
      
      avgResolutionTime = totalTime / resolvedIssues.length / (1000 * 60 * 60) // Convert to hours
    }

    return {
      total,
      active,
      resolved,
      bySeverity,
      byCategory,
      avgResolutionTime,
    }
  }
}