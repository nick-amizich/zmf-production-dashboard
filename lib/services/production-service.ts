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

  constructor(private supabase: Awaited<ReturnType<typeof createClient>>) {
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

    // Get current worker ID (should be passed from the API route)
    const { data: { user } } = await this.supabase.auth.getUser()
    const { data: worker } = await this.supabase
      .from('workers')
      .select('id')
      .eq('auth_user_id', user?.id)
      .single()

    if (!worker) throw new Error('Worker not found')

    // Use transaction function to create batch with all related data
    const { data: batchId, error: batchError } = await this.supabase
      .rpc('create_batch_with_orders', {
        p_batch_number: batchNumber,
        p_priority: priority,
        p_order_ids: orderIds,
        p_worker_id: worker.id,
        p_notes: notes
      })

    if (batchError) throw batchError

    // Fetch and return the created batch
    return this.batchRepo.findById(batchId)
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
    // Use transaction function to handle all updates atomically
    const { error } = await this.supabase
      .rpc('transition_batch_stage', {
        p_batch_id: batchId,
        p_to_stage: toStage,
        p_worker_id: workerId,
        p_quality_check_id: qualityCheckId,
        p_notes: notes
      })

    if (error) {
      // Provide more specific error messages
      if (error.message.includes('Invalid stage transition')) {
        throw new Error('Cannot move backwards in the production pipeline')
      }
      if (error.message.includes('not found')) {
        throw new Error('Batch not found')
      }
      throw error
    }

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