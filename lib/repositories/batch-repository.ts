import { BaseRepository, DatabaseError } from './base-repository'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type Batch = Database['public']['Tables']['batches']['Row']
type BatchInsert = Database['public']['Tables']['batches']['Insert']
type BatchUpdate = Database['public']['Tables']['batches']['Update']
type Order = Database['public']['Tables']['orders']['Row']

export interface BatchWithOrders extends Batch {
  orders: Order[]
  orderCount: number
}

export class BatchRepository extends BaseRepository<Batch> {
  constructor(protected supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findById(id: string): Promise<BatchWithOrders | null> {
    const { data, error } = await this.supabase
      .from('batches')
      .select(`
        *,
        batch_orders!inner(
          order:orders(
            *,
            customer:customers(*),
            model:headphone_models(*)
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Failed to fetch batch', error)
    }

    if (!data) return null

    return {
      ...data,
      orders: data.batch_orders?.map((bo: any) => bo.order) || [],
      orderCount: data.batch_orders?.length || 0,
    }
  }

  async findAll(): Promise<BatchWithOrders[]> {
    const { data, error } = await this.supabase
      .from('batches')
      .select(`
        *,
        batch_orders(
          order:orders(
            *,
            customer:customers(*),
            model:headphone_models(*)
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch batches', error)

    return (data || []).map(batch => ({
      ...batch,
      orders: batch.batch_orders?.map((bo: any) => bo.order) || [],
      orderCount: batch.batch_orders?.length || 0,
    }))
  }

  async findActive(): Promise<BatchWithOrders[]> {
    const { data, error } = await this.supabase
      .from('batches')
      .select(`
        *,
        batch_orders(
          order:orders(
            *,
            customer:customers(*),
            model:headphone_models(*)
          )
        )
      `)
      .eq('is_complete', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw new DatabaseError('Failed to fetch active batches', error)

    return (data || []).map(batch => ({
      ...batch,
      orders: batch.batch_orders?.map((bo: any) => bo.order) || [],
      orderCount: batch.batch_orders?.length || 0,
    }))
  }

  async create(data: BatchInsert): Promise<Batch> {
    const { data: batch, error } = await this.supabase
      .from('batches')
      .insert(data)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to create batch', error)
    return batch
  }

  async update(id: string, data: BatchUpdate): Promise<Batch> {
    const { data: batch, error } = await this.supabase
      .from('batches')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to update batch', error)
    return batch
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('batches')
      .delete()
      .eq('id', id)

    if (error) throw new DatabaseError('Failed to delete batch', error)
  }

  async addOrdersToBatch(batchId: string, orderIds: string[]): Promise<void> {
    const batchOrders = orderIds.map(orderId => ({
      batch_id: batchId,
      order_id: orderId,
    }))

    const { error } = await this.supabase
      .from('batch_orders')
      .insert(batchOrders)

    if (error) throw new DatabaseError('Failed to add orders to batch', error)
  }

  async removeOrderFromBatch(batchId: string, orderId: string): Promise<void> {
    const { error } = await this.supabase
      .from('batch_orders')
      .delete()
      .eq('batch_id', batchId)
      .eq('order_id', orderId)

    if (error) throw new DatabaseError('Failed to remove order from batch', error)
  }

  async updateStage(
    batchId: string,
    stage: Database['public']['Enums']['production_stage']
  ): Promise<Batch> {
    return this.update(batchId, { current_stage: stage })
  }

  async completeBatch(batchId: string): Promise<Batch> {
    return this.update(batchId, {
      is_complete: true,
      current_stage: 'Shipping',
    })
  }

  async generateBatchNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    
    // Count today's batches
    const { count, error } = await this.supabase
      .from('batches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString().slice(0, 10))
      .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10))

    if (error) throw new DatabaseError('Failed to generate batch number', error)
    
    const batchCount = (count || 0) + 1
    return `B${dateStr}-${batchCount.toString().padStart(3, '0')}`
  }
}