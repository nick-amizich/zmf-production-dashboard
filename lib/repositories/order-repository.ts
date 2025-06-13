import { BaseRepository, DatabaseError } from './base-repository'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderUpdate = Database['public']['Tables']['orders']['Update']
type Customer = Database['public']['Tables']['customers']['Row']
type HeadphoneModel = Database['public']['Tables']['headphone_models']['Row']

export interface OrderWithDetails extends Order {
  customer: Customer | null
  model: HeadphoneModel | null
}

export class OrderRepository extends BaseRepository<Order> {
  constructor(protected supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findById(id: string): Promise<OrderWithDetails | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        model:headphone_models(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Failed to fetch order', error)
    }

    return data as OrderWithDetails
  }

  async findAll(): Promise<OrderWithDetails[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        model:headphone_models(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch orders', error)

    return (data || []) as OrderWithDetails[]
  }

  async findPending(): Promise<OrderWithDetails[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        model:headphone_models(*),
        batch_orders!left(batch_id)
      `)
      .eq('status', 'pending')
      .is('batch_orders.batch_id', null) // Not in any batch
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw new DatabaseError('Failed to fetch pending orders', error)

    return (data || []) as OrderWithDetails[]
  }

  async findByStatus(status: Database['public']['Enums']['order_status']): Promise<OrderWithDetails[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        model:headphone_models(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch orders by status', error)

    return (data || []) as OrderWithDetails[]
  }

  async create(data: OrderInsert): Promise<Order> {
    const { data: order, error } = await this.supabase
      .from('orders')
      .insert(data)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to create order', error)
    return order
  }

  async update(id: string, data: OrderUpdate): Promise<Order> {
    const { data: order, error } = await this.supabase
      .from('orders')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to update order', error)
    return order
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw new DatabaseError('Failed to delete order', error)
  }

  async updateStatus(
    id: string,
    status: Database['public']['Enums']['order_status'],
    userId?: string
  ): Promise<Order> {
    // Get current order
    const { data: currentOrder } = await this.supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single()

    // Update order status
    const updatedOrder = await this.update(id, { status })

    // Log status change if we have a user ID
    if (userId && currentOrder) {
      await this.supabase
        .from('order_status_history')
        .insert({
          order_id: id,
          old_status: currentOrder.status,
          new_status: status,
          changed_by: userId,
        })
    }

    return updatedOrder
  }

  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear()
    
    // Get the count of orders this year
    const { count, error } = await this.supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01`)
      .lt('created_at', `${year + 1}-01-01`)

    if (error) throw new DatabaseError('Failed to generate order number', error)
    
    const orderCount = (count || 0) + 1
    return `ZMF-${year}-${orderCount.toString().padStart(4, '0')}`
  }
}