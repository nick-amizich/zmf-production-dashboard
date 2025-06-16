import { createClient } from '@/lib/supabase/server'
import { BatchRepository } from '@/lib/repositories/batch-repository'
import { OrderRepository } from '@/lib/repositories/order-repository'
import { StageAssignmentRepository } from '@/lib/repositories/stage-assignment-repository'
import { Database } from '@/types/database.types'

type ProductionStage = Database['public']['Enums']['production_stage']
type BatchPriority = Database['public']['Enums']['batch_priority']
type QualityStatus = Database['public']['Enums']['quality_status']

export class ProductionService {
  private batchRepo: BatchRepository
  private orderRepo: OrderRepository
  private assignmentRepo: StageAssignmentRepository

  constructor(
    private supabase: Awaited<ReturnType<typeof createClient>>,
    private workerId?: string
  ) {
    this.batchRepo = new BatchRepository(supabase)
    this.orderRepo = new OrderRepository(supabase)
    this.assignmentRepo = new StageAssignmentRepository(supabase)
  }

  /**
   * Create a new batch with orders
   */
  async createBatch(
    orderIds: string[],
    priority: BatchPriority = 'standard',
    notes?: string
  ) {
    // Validate orders exist and are pending - Fixed N+1 query
    const { data: orders, error } = await this.supabase
      .from('orders')
      .select('*')
      .in('id', orderIds)
      .eq('status', 'pending')

    if (error) throw error

    if (!orders || orders.length !== orderIds.length) {
      throw new Error('Some orders are invalid or not pending')
    }

    // Generate batch number
    const batchNumber = await this.batchRepo.generateBatchNumber()

    // Use the worker ID passed from the API route
    if (!this.workerId) {
      throw new Error('Worker ID not provided')
    }

    // Create the batch
    const { data: batch, error: batchError } = await this.supabase
      .from('batches')
      .insert({
        batch_number: batchNumber,
        priority: priority,
        current_stage: 'Intake',
        is_complete: false,
        quality_status: 'good' // Default quality status (pending is not in the enum)
      })
      .select()
      .single()

    if (batchError) throw batchError

    // Link orders to batch
    const batchOrders = orderIds.map(orderId => ({
      batch_id: batch.id,
      order_id: orderId
    }))

    const { error: linkError } = await this.supabase
      .from('batch_orders')
      .insert(batchOrders)

    if (linkError) throw linkError

    // Update orders to in_production status
    const { error: updateError } = await this.supabase
      .from('orders')
      .update({ status: 'in_production' })
      .in('id', orderIds)

    if (updateError) throw updateError

    // Fetch and return the created batch with orders
    return this.batchRepo.findById(batch.id)
  }

  /**
   * Move batch to next stage
   */
  async transitionBatchStage(
    batchId: string,
    toStage: ProductionStage,
    workerId: string,
    qualityCheckId?: string,
    notes?: string
  ) {
    // Get current batch
    const { data: batch, error: fetchError } = await this.supabase
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single()

    if (fetchError || !batch) {
      throw new Error('Batch not found')
    }

    // Validate stage transition (optional - add your business rules)
    const stages: ProductionStage[] = [
      'Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 
      'Final Assembly', 'Acoustic QC', 'Shipping'
    ]
    
    const currentIndex = stages.indexOf(batch.current_stage)
    const newIndex = stages.indexOf(toStage)
    
    if (newIndex < currentIndex) {
      throw new Error('Cannot move backwards in the production pipeline')
    }

    // Update batch stage
    const { error: updateError } = await this.supabase
      .from('batches')
      .update({ 
        current_stage: toStage,
        updated_at: new Date().toISOString()
      })
      .eq('id', batchId)

    if (updateError) throw updateError

    // Create stage transition record (if you have a transitions table)
    // Otherwise, you can skip this or add to a logs table

    // Return updated batch
    return this.batchRepo.findById(batchId)
  }

  /**
   * Assign worker to stage
   */
  async assignWorkerToStage(
    batchId: string,
    stage: ProductionStage,
    workerId: string
  ) {
    return this.assignmentRepo.assignWorker(batchId, stage, workerId)
  }

  /**
   * Start work on assignment
   */
  async startWork(assignmentId: string) {
    return this.assignmentRepo.startWork(assignmentId)
  }

  /**
   * Complete work on assignment
   */
  async completeWork(
    assignmentId: string,
    qualityStatus: QualityStatus
  ) {
    return this.assignmentRepo.completeWork(assignmentId, qualityStatus)
  }

  /**
   * Get production pipeline view
   */
  async getProductionPipeline() {
    const activeBatches = await this.batchRepo.findActive()
    
    // Group batches by stage
    const pipeline: Record<ProductionStage, typeof activeBatches> = {
      'Intake': [],
      'Sanding': [],
      'Finishing': [],
      'Sub-Assembly': [],
      'Final Assembly': [],
      'Acoustic QC': [],
      'Shipping': [],
    }

    activeBatches.forEach(batch => {
      pipeline[batch.current_stage].push(batch)
    })

    return pipeline
  }

  /**
   * Get worker assignments
   */
  async getWorkerAssignments(workerId: string) {
    const active = await this.assignmentRepo.findActiveByWorker(workerId)
    const completed = await this.assignmentRepo.findByWorker(workerId)
      
    return {
      active,
      completed: completed.filter(a => a.completed_at),
      stats: {
        totalCompleted: completed.filter(a => a.completed_at).length,
        averageTime: this.calculateAverageTime(completed),
      },
    }
  }

  /**
   * Calculate average completion time
   */
  private calculateAverageTime(assignments: any[]): number {
    const completed = assignments.filter(
      a => a.started_at && a.completed_at
    )

    if (completed.length === 0) return 0

    const totalMinutes = completed.reduce((sum, a) => {
      const start = new Date(a.started_at!).getTime()
      const end = new Date(a.completed_at!).getTime()
      return sum + (end - start) / 60000
    }, 0)

    return Math.round(totalMinutes / completed.length)
  }
}