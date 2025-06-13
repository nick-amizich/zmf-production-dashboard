import { createClient } from '@/lib/supabase/server'
import { WorkerRepository } from '@/lib/repositories/worker-repository'
import { WorkerPerformanceRepository } from '@/lib/repositories/worker-performance-repository'
import { Database } from '@/types/database.types'

type Worker = Database['public']['Tables']['workers']['Row']
type WorkerRole = Database['public']['Enums']['worker_role']
type ProductionStage = Database['public']['Enums']['production_stage']

export interface WorkerAvailability {
  workerId: string
  date: Date
  isAvailable: boolean
  shift: 'morning' | 'afternoon' | 'evening' | null
  notes?: string
}

export interface WorkerAssignment {
  workerId: string
  batchId: string
  stage: ProductionStage
  assignedAt: Date
  completedAt?: Date
  notes?: string
}

export class WorkerService {
  private workerRepo: WorkerRepository
  private performanceRepo: WorkerPerformanceRepository

  constructor(private supabase: Awaited<ReturnType<typeof createClient>>) {
    this.workerRepo = new WorkerRepository(supabase)
    this.performanceRepo = new WorkerPerformanceRepository(supabase)
  }

  /**
   * Get worker dashboard data
   */
  async getWorkerDashboard(workerId: string) {
    const [worker, stats, assignments, schedule] = await Promise.all([
      this.workerRepo.findById(workerId),
      this.performanceRepo.getWorkerStats(workerId),
      this.getActiveAssignments(workerId),
      this.getWeeklySchedule(workerId),
    ])

    if (!worker) throw new Error('Worker not found')

    // Get recent notifications
    const notifications = await this.getWorkerNotifications(workerId)

    return {
      worker,
      performance: stats,
      activeAssignments: assignments,
      schedule,
      notifications,
    }
  }

  /**
   * Get active assignments for a worker
   */
  async getActiveAssignments(workerId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('batch_assignments')
      .select(`
        *,
        batch:batches(
          *,
          batch_orders(
            order:orders(
              *,
              customer:customers(*),
              model:headphone_models(*)
            )
          )
        )
      `)
      .eq('worker_id', workerId)
      .is('completed_at', null)
      .order('assigned_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Complete an assignment
   */
  async completeAssignment(
    assignmentId: string,
    workerId: string,
    notes?: string
  ) {
    // Verify assignment belongs to worker
    const { data: assignment } = await this.supabase
      .from('batch_assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('worker_id', workerId)
      .single()

    if (!assignment) throw new Error('Assignment not found')

    // Mark as completed
    const { data, error } = await this.supabase
      .from('batch_assignments')
      .update({
        completed_at: new Date().toISOString(),
        notes,
      })
      .eq('id', assignmentId)
      .select()
      .single()

    if (error) throw error

    // Update production metrics
    await this.updateProductionMetrics(workerId, assignment.stage, 1)

    // Check if batch stage is complete
    await this.checkBatchStageCompletion(assignment.batch_id, assignment.stage)

    return data
  }

  /**
   * Update production metrics
   */
  private async updateProductionMetrics(
    workerId: string,
    stage: ProductionStage,
    unitsCompleted: number
  ) {
    const today = new Date().toISOString().split('T')[0]

    // Get existing metric for today
    const { data: existing } = await this.supabase
      .from('production_metrics')
      .select('*')
      .eq('worker_id', workerId)
      .eq('stage', stage)
      .eq('date', today)
      .single()

    if (existing) {
      // Update existing metric
      await this.supabase
        .from('production_metrics')
        .update({
          units_completed: existing.units_completed + unitsCompleted,
        })
        .eq('id', existing.id)
    } else {
      // Create new metric
      await this.supabase
        .from('production_metrics')
        .insert({
          worker_id: workerId,
          stage,
          date: today,
          units_completed: unitsCompleted,
        })
    }
  }

  /**
   * Check if all assignments for a batch stage are complete
   */
  private async checkBatchStageCompletion(batchId: string, stage: ProductionStage) {
    const { data: assignments } = await this.supabase
      .from('batch_assignments')
      .select('*')
      .eq('batch_id', batchId)
      .eq('stage', stage)
      .is('completed_at', null)

    if (!assignments || assignments.length === 0) {
      // All assignments complete, update batch stage
      const stageOrder = [
        'Intake',
        'Sanding',
        'Finishing',
        'Sub-Assembly',
        'Final Assembly',
        'Acoustic QC',
        'Shipping'
      ] as ProductionStage[]

      const currentIndex = stageOrder.indexOf(stage)
      if (currentIndex < stageOrder.length - 1) {
        const nextStage = stageOrder[currentIndex + 1]
        
        await this.supabase
          .from('batches')
          .update({
            current_stage: nextStage,
            stage_updated_at: new Date().toISOString(),
          })
          .eq('id', batchId)
      } else {
        // Mark batch as complete
        await this.supabase
          .from('batches')
          .update({
            is_complete: true,
            completed_at: new Date().toISOString(),
          })
          .eq('id', batchId)
      }
    }
  }

  /**
   * Get worker's weekly schedule
   */
  async getWeeklySchedule(workerId: string): Promise<WorkerAvailability[]> {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const { data, error } = await this.supabase
      .from('worker_availability')
      .select('*')
      .eq('worker_id', workerId)
      .gte('date', startOfWeek.toISOString())
      .lte('date', endOfWeek.toISOString())
      .order('date')

    if (error) throw error

    // Fill in missing days with default availability
    const schedule: WorkerAvailability[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      
      const existing = data?.find(d => 
        new Date(d.date).toDateString() === date.toDateString()
      )

      if (existing) {
        schedule.push({
          workerId,
          date,
          isAvailable: existing.is_available,
          shift: existing.shift,
          notes: existing.notes,
        })
      } else {
        // Default to available on weekdays
        const isWeekday = date.getDay() >= 1 && date.getDay() <= 5
        schedule.push({
          workerId,
          date,
          isAvailable: isWeekday,
          shift: isWeekday ? 'morning' : null,
          notes: undefined,
        })
      }
    }

    return schedule
  }

  /**
   * Update worker availability
   */
  async updateAvailability(
    workerId: string,
    date: Date,
    availability: Partial<WorkerAvailability>
  ) {
    const dateStr = date.toISOString().split('T')[0]

    // Check if record exists
    const { data: existing } = await this.supabase
      .from('worker_availability')
      .select('*')
      .eq('worker_id', workerId)
      .eq('date', dateStr)
      .single()

    if (existing) {
      // Update existing record
      const { data, error } = await this.supabase
        .from('worker_availability')
        .update({
          is_available: availability.isAvailable ?? existing.is_available,
          shift: availability.shift ?? existing.shift,
          notes: availability.notes ?? existing.notes,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new record
      const { data, error } = await this.supabase
        .from('worker_availability')
        .insert({
          worker_id: workerId,
          date: dateStr,
          is_available: availability.isAvailable ?? true,
          shift: availability.shift ?? 'morning',
          notes: availability.notes,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  }

  /**
   * Get worker notifications
   */
  async getWorkerNotifications(workerId: string, limit: number = 10) {
    const { data, error } = await this.supabase
      .from('worker_notifications')
      .select('*')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string, workerId: string) {
    const { error } = await this.supabase
      .from('worker_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('worker_id', workerId)

    if (error) throw error
  }

  /**
   * Get available workers for a stage
   */
  async getAvailableWorkers(stage: ProductionStage, date: Date = new Date()) {
    const dateStr = date.toISOString().split('T')[0]

    // Get workers with the required specialization
    const { data: workers } = await this.supabase
      .from('workers')
      .select('*')
      .eq('is_active', true)
      .contains('specializations', [stage])

    if (!workers) return []

    // Check availability for each worker
    const availableWorkers = []
    for (const worker of workers) {
      const { data: availability } = await this.supabase
        .from('worker_availability')
        .select('*')
        .eq('worker_id', worker.id)
        .eq('date', dateStr)
        .single()

      if (!availability || availability.is_available) {
        // Check current assignments
        const { count } = await this.supabase
          .from('batch_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('worker_id', worker.id)
          .is('completed_at', null)

        // Add worker if they have capacity (less than 3 active assignments)
        if ((count || 0) < 3) {
          availableWorkers.push({
            ...worker,
            activeAssignments: count || 0,
            shift: availability?.shift || 'morning',
          })
        }
      }
    }

    return availableWorkers
  }

  /**
   * Create a notification for a worker
   */
  async createNotification(
    workerId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ) {
    const { error } = await this.supabase
      .from('worker_notifications')
      .insert({
        worker_id: workerId,
        type,
        title,
        message,
        data,
      })

    if (error) throw error
  }
}