import { BaseRepository, DatabaseError } from './base-repository'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type StageAssignment = Database['public']['Tables']['stage_assignments']['Row']
type StageAssignmentInsert = Database['public']['Tables']['stage_assignments']['Insert']
type StageAssignmentUpdate = Database['public']['Tables']['stage_assignments']['Update']
type Worker = Database['public']['Tables']['workers']['Row']
type Batch = Database['public']['Tables']['batches']['Row']

export interface StageAssignmentWithDetails extends StageAssignment {
  worker: Worker | null
  batch: Batch | null
}

export class StageAssignmentRepository extends BaseRepository<StageAssignment> {
  constructor(protected supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findById(id: string): Promise<StageAssignmentWithDetails | null> {
    const { data, error } = await this.supabase
      .from('stage_assignments')
      .select(`
        *,
        worker:workers(*),
        batch:batches(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Failed to fetch stage assignment', error)
    }

    return data as StageAssignmentWithDetails
  }

  async findAll(): Promise<StageAssignmentWithDetails[]> {
    const { data, error } = await this.supabase
      .from('stage_assignments')
      .select(`
        *,
        worker:workers(*),
        batch:batches(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch stage assignments', error)

    return (data || []) as StageAssignmentWithDetails[]
  }

  async findByBatch(batchId: string): Promise<StageAssignmentWithDetails[]> {
    const { data, error } = await this.supabase
      .from('stage_assignments')
      .select(`
        *,
        worker:workers(*),
        batch:batches(*)
      `)
      .eq('batch_id', batchId)
      .order('created_at', { ascending: true })

    if (error) throw new DatabaseError('Failed to fetch batch assignments', error)

    return (data || []) as StageAssignmentWithDetails[]
  }

  async findByWorker(workerId: string): Promise<StageAssignmentWithDetails[]> {
    const { data, error } = await this.supabase
      .from('stage_assignments')
      .select(`
        *,
        worker:workers(*),
        batch:batches(*)
      `)
      .eq('assigned_worker_id', workerId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch worker assignments', error)

    return (data || []) as StageAssignmentWithDetails[]
  }

  async findActiveByWorker(workerId: string): Promise<StageAssignmentWithDetails[]> {
    const { data, error } = await this.supabase
      .from('stage_assignments')
      .select(`
        *,
        worker:workers(*),
        batch:batches(*)
      `)
      .eq('assigned_worker_id', workerId)
      .is('completed_at', null)
      .order('created_at', { ascending: true })

    if (error) throw new DatabaseError('Failed to fetch active assignments', error)

    return (data || []) as StageAssignmentWithDetails[]
  }

  async create(data: StageAssignmentInsert): Promise<StageAssignment> {
    const { data: assignment, error } = await this.supabase
      .from('stage_assignments')
      .insert(data)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to create stage assignment', error)
    return assignment
  }

  async update(id: string, data: StageAssignmentUpdate): Promise<StageAssignment> {
    const { data: assignment, error } = await this.supabase
      .from('stage_assignments')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to update stage assignment', error)
    return assignment
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('stage_assignments')
      .delete()
      .eq('id', id)

    if (error) throw new DatabaseError('Failed to delete stage assignment', error)
  }

  async startWork(id: string): Promise<StageAssignment> {
    return this.update(id, {
      started_at: new Date().toISOString(),
    })
  }

  async completeWork(
    id: string,
    qualityStatus: Database['public']['Enums']['quality_status']
  ): Promise<StageAssignment> {
    return this.update(id, {
      completed_at: new Date().toISOString(),
      quality_status: qualityStatus,
    })
  }

  async assignWorker(
    batchId: string,
    stage: Database['public']['Enums']['production_stage'],
    workerId: string
  ): Promise<StageAssignment> {
    // Check if assignment already exists
    const { data: existing } = await this.supabase
      .from('stage_assignments')
      .select('id')
      .eq('batch_id', batchId)
      .eq('stage', stage)
      .single()

    if (existing) {
      // Update existing assignment
      return this.update(existing.id, {
        assigned_worker_id: workerId,
      })
    }

    // Create new assignment
    return this.create({
      batch_id: batchId,
      stage,
      assigned_worker_id: workerId,
    })
  }

  async getAvailableWorkers(
    stage: Database['public']['Enums']['production_stage'],
    date: Date = new Date()
  ): Promise<Worker[]> {
    const { data, error } = await this.supabase
      .from('workers')
      .select('*')
      .eq('is_active', true)
      .contains('specializations', [stage])

    if (error) throw new DatabaseError('Failed to fetch available workers', error)

    return (data || []) as Worker[]
  }
}