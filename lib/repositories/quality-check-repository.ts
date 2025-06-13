import { BaseRepository, DatabaseError } from './base-repository'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type QualityCheck = Database['public']['Tables']['quality_checks']['Row']
type QualityCheckInsert = Database['public']['Tables']['quality_checks']['Insert']
type QualityCheckUpdate = Database['public']['Tables']['quality_checks']['Update']
type Worker = Database['public']['Tables']['workers']['Row']
type Order = Database['public']['Tables']['orders']['Row']
type Batch = Database['public']['Tables']['batches']['Row']

export interface QualityCheckWithDetails extends QualityCheck {
  worker: Worker | null
  order: Order | null
  batch: Batch | null
}

export class QualityCheckRepository extends BaseRepository<QualityCheck> {
  constructor(protected supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findById(id: string): Promise<QualityCheckWithDetails | null> {
    const { data, error } = await this.supabase
      .from('quality_checks')
      .select(`
        *,
        worker:workers(*),
        order:orders(*),
        batch:batches(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Failed to fetch quality check', error)
    }

    return data as QualityCheckWithDetails
  }

  async findAll(): Promise<QualityCheckWithDetails[]> {
    const { data, error } = await this.supabase
      .from('quality_checks')
      .select(`
        *,
        worker:workers(*),
        order:orders(*),
        batch:batches(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch quality checks', error)

    return (data || []) as QualityCheckWithDetails[]
  }

  async findByOrder(orderId: string): Promise<QualityCheckWithDetails[]> {
    const { data, error } = await this.supabase
      .from('quality_checks')
      .select(`
        *,
        worker:workers(*),
        order:orders(*),
        batch:batches(*)
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch order quality checks', error)

    return (data || []) as QualityCheckWithDetails[]
  }

  async findByBatch(batchId: string): Promise<QualityCheckWithDetails[]> {
    const { data, error } = await this.supabase
      .from('quality_checks')
      .select(`
        *,
        worker:workers(*),
        order:orders(*),
        batch:batches(*)
      `)
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch batch quality checks', error)

    return (data || []) as QualityCheckWithDetails[]
  }

  async findByWorker(workerId: string): Promise<QualityCheckWithDetails[]> {
    const { data, error } = await this.supabase
      .from('quality_checks')
      .select(`
        *,
        worker:workers(*),
        order:orders(*),
        batch:batches(*)
      `)
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch worker quality checks', error)

    return (data || []) as QualityCheckWithDetails[]
  }

  async findByStage(
    stage: Database['public']['Enums']['production_stage']
  ): Promise<QualityCheckWithDetails[]> {
    const { data, error } = await this.supabase
      .from('quality_checks')
      .select(`
        *,
        worker:workers(*),
        order:orders(*),
        batch:batches(*)
      `)
      .eq('stage', stage)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch stage quality checks', error)

    return (data || []) as QualityCheckWithDetails[]
  }

  async create(data: QualityCheckInsert): Promise<QualityCheck> {
    const { data: check, error } = await this.supabase
      .from('quality_checks')
      .insert(data)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to create quality check', error)
    return check
  }

  async update(id: string, data: QualityCheckUpdate): Promise<QualityCheck> {
    const { data: check, error } = await this.supabase
      .from('quality_checks')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to update quality check', error)
    return check
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('quality_checks')
      .delete()
      .eq('id', id)

    if (error) throw new DatabaseError('Failed to delete quality check', error)
  }

  async getQualityMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalChecks: number
    passRate: number
    byStage: Record<string, { total: number; passed: number; passRate: number }>
    byWorker: Record<string, { total: number; passed: number; passRate: number }>
  }> {
    const { data, error } = await this.supabase
      .from('quality_checks')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) throw new DatabaseError('Failed to fetch quality metrics', error)

    const checks = data || []
    const totalChecks = checks.length
    const passedChecks = checks.filter(c => c.overall_status === 'good').length
    const passRate = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0

    // Group by stage
    const byStage: Record<string, any> = {}
    checks.forEach(check => {
      if (!byStage[check.stage]) {
        byStage[check.stage] = { total: 0, passed: 0, passRate: 0 }
      }
      byStage[check.stage].total++
      if (check.overall_status === 'good') {
        byStage[check.stage].passed++
      }
    })

    // Calculate pass rates by stage
    Object.keys(byStage).forEach(stage => {
      byStage[stage].passRate = 
        byStage[stage].total > 0 
          ? (byStage[stage].passed / byStage[stage].total) * 100 
          : 0
    })

    // Group by worker
    const byWorker: Record<string, any> = {}
    checks.forEach(check => {
      if (!check.worker_id) return
      if (!byWorker[check.worker_id]) {
        byWorker[check.worker_id] = { total: 0, passed: 0, passRate: 0 }
      }
      byWorker[check.worker_id].total++
      if (check.overall_status === 'good') {
        byWorker[check.worker_id].passed++
      }
    })

    // Calculate pass rates by worker
    Object.keys(byWorker).forEach(workerId => {
      byWorker[workerId].passRate = 
        byWorker[workerId].total > 0 
          ? (byWorker[workerId].passed / byWorker[workerId].total) * 100 
          : 0
    })

    return {
      totalChecks,
      passRate,
      byStage,
      byWorker,
    }
  }
}