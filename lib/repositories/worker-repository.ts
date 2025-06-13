import { BaseRepository, DatabaseError } from './base-repository'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type Worker = Database['public']['Tables']['workers']['Row']
type WorkerInsert = Database['public']['Tables']['workers']['Insert']
type WorkerUpdate = Database['public']['Tables']['workers']['Update']

export class WorkerRepository extends BaseRepository<Worker> {
  constructor(protected supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findById(id: string): Promise<Worker | null> {
    const { data, error } = await this.supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Failed to fetch worker', error)
    }

    return data
  }

  async findByAuthUserId(authUserId: string): Promise<Worker | null> {
    const { data, error } = await this.supabase
      .from('workers')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Failed to fetch worker by auth user ID', error)
    }

    return data
  }

  async findAll(includeInactive = false): Promise<Worker[]> {
    let query = this.supabase
      .from('workers')
      .select('*')
      .order('name')

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) throw new DatabaseError('Failed to fetch workers', error)

    return data || []
  }

  async findByRole(role: Database['public']['Enums']['worker_role']): Promise<Worker[]> {
    const { data, error } = await this.supabase
      .from('workers')
      .select('*')
      .eq('role', role)
      .eq('is_active', true)
      .order('name')

    if (error) throw new DatabaseError('Failed to fetch workers by role', error)

    return data || []
  }

  async findBySpecialization(specialization: Database['public']['Enums']['production_stage']): Promise<Worker[]> {
    const { data, error } = await this.supabase
      .from('workers')
      .select('*')
      .contains('specializations', [specialization])
      .eq('is_active', true)
      .order('name')

    if (error) throw new DatabaseError('Failed to fetch workers by specialization', error)

    return data || []
  }

  async create(data: WorkerInsert): Promise<Worker> {
    const { data: worker, error } = await this.supabase
      .from('workers')
      .insert(data)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to create worker', error)
    return worker
  }

  async update(id: string, data: WorkerUpdate): Promise<Worker> {
    const { data: worker, error } = await this.supabase
      .from('workers')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to update worker', error)
    return worker
  }

  async delete(id: string): Promise<void> {
    // Soft delete - just mark as inactive
    await this.update(id, { is_active: false })
  }

  async activate(id: string): Promise<Worker> {
    return this.update(id, { is_active: true })
  }

  async deactivate(id: string): Promise<Worker> {
    return this.update(id, { is_active: false })
  }
}