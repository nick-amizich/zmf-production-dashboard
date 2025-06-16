import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { logger } from '@/lib/logger'

type ProductionStage = Database["public"]["Enums"]["production_stage"]
type Worker = Database["public"]["Tables"]["workers"]["Row"]
type WorkerAvailability = Database["public"]["Tables"]["worker_availability"]["Row"]
type StageAssignment = Database["public"]["Tables"]["stage_assignments"]["Row"]

interface WorkerScore {
  workerId: string
  score: number
  factors: {
    hasSpecialization: boolean
    currentWorkload: number
    recentPerformance: number
    availability: boolean
  }
}

export class BatchAssignmentService {
  private async getSupabase() {
    return await createClient()
  }

  /**
   * Auto-assign workers to all stages of a batch based on availability and skills
   */
  async autoAssignBatch(batchId: string): Promise<Record<ProductionStage, string | null>> {
    try {
      const assignments: Record<ProductionStage, string | null> = {} as any
      const stages: ProductionStage[] = [
        "Intake", "Sanding", "Finishing", "Sub-Assembly", 
        "Final Assembly", "Acoustic QC", "Shipping"
      ]

      // Get batch details
      const supabase = await this.getSupabase()
      const { data: batch, error: batchError } = await supabase
        .from("batches")
        .select(`
          *,
          batch_orders(
            orders(
              model_id,
              headphone_models(
                complexity
              )
            )
          )
        `)
        .eq("id", batchId)
        .single()

      if (batchError) throw batchError

      // Determine complexity for scoring
      const complexity = batch.batch_orders?.[0]?.orders?.headphone_models?.complexity || "medium"

      // Assign workers for each stage
      for (const stage of stages) {
        const bestWorker = await this.findBestWorkerForStage(stage, complexity)
        if (bestWorker) {
          assignments[stage] = bestWorker.workerId
          
          // Create the assignment
          await this.createStageAssignment(batchId, stage, bestWorker.workerId)
        } else {
          assignments[stage] = null
        }
      }

      logger.info("Batch auto-assigned", {
        batchId,
        assignedStages: Object.keys(assignments).filter(k => assignments[k as ProductionStage] !== null).length,
        totalStages: stages.length
      }, "BATCH_ASSIGNMENT")

      return assignments

    } catch (error) {
      logger.error("Failed to auto-assign batch", error, { 
        action: "autoAssignBatch", 
        batchId 
      }, "BATCH_ASSIGNMENT")
      throw error
    }
  }

  /**
   * Find the best available worker for a specific stage
   */
  private async findBestWorkerForStage(
    stage: ProductionStage, 
    complexity: string
  ): Promise<WorkerScore | null> {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get all active workers with the required specialization
      const supabase = await this.getSupabase()
      const { data: workers, error } = await supabase
        .from("workers")
        .select(`
          *,
          worker_availability!inner(
            *
          ),
          stage_assignments(
            id,
            completed_at
          ),
          production_metrics(
            quality_pass_rate,
            total_time_minutes,
            units_completed
          )
        `)
        .eq("is_active", true)
        .contains("specializations", [stage])
        .eq("worker_availability.date", today)
        .eq("worker_availability.is_available", true)

      if (error) throw error
      if (!workers || workers.length === 0) return null

      // Score each worker
      const scoredWorkers: WorkerScore[] = workers.map(worker => {
        // Calculate current workload
        const activeAssignments = worker.stage_assignments?.filter(
          (a: any) => !a.completed_at
        ).length || 0

        // Calculate recent performance
        const recentMetrics = worker.production_metrics?.slice(-10) || []
        const avgQuality = recentMetrics.length > 0
          ? recentMetrics.reduce((sum: number, m: any) => sum + (m.quality_pass_rate || 0), 0) / recentMetrics.length
          : 0.8

        // Calculate efficiency
        const avgTime = recentMetrics.length > 0
          ? recentMetrics.reduce((sum: number, m: any) => sum + (m.total_time_minutes || 0) / (m.units_completed || 1), 0) / recentMetrics.length
          : 60

        // Score calculation
        let score = 100

        // Specialization bonus
        if (worker.specializations?.includes(stage)) {
          score += 30
        }

        // Workload penalty (prefer workers with fewer assignments)
        score -= activeAssignments * 20

        // Quality bonus
        score += avgQuality * 50

        // Efficiency bonus (lower time is better)
        score += Math.max(0, 100 - avgTime)

        // Complexity matching
        if (complexity === "very_high" && worker.role === "manager") {
          score += 20
        }

        return {
          workerId: worker.id,
          score,
          factors: {
            hasSpecialization: worker.specializations?.includes(stage) || false,
            currentWorkload: activeAssignments,
            recentPerformance: avgQuality,
            availability: true
          }
        }
      })

      // Sort by score and return the best
      scoredWorkers.sort((a, b) => b.score - a.score)
      
      // Don't assign if worker is overloaded (more than 3 active assignments)
      const bestWorker = scoredWorkers.find(w => w.factors.currentWorkload < 3)
      
      return bestWorker || null

    } catch (error) {
      logger.error("Failed to find best worker for stage", error, { 
        action: "findBestWorkerForStage", 
        stage 
      }, "BATCH_ASSIGNMENT")
      return null
    }
  }

  /**
   * Create or update a stage assignment
   */
  private async createStageAssignment(
    batchId: string, 
    stage: ProductionStage, 
    workerId: string
  ): Promise<void> {
    try {
      // Check if assignment already exists
      const supabase = await this.getSupabase()
      const { data: existing } = await supabase
        .from("stage_assignments")
        .select("id")
        .eq("batch_id", batchId)
        .eq("stage", stage)
        .single()

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("stage_assignments")
          .update({
            assigned_worker_id: workerId,
            started_at: new Date().toISOString()
          })
          .eq("id", existing.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from("stage_assignments")
          .insert({
            batch_id: batchId,
            stage,
            assigned_worker_id: workerId,
            started_at: new Date().toISOString()
          })

        if (error) throw error
      }

      // Notify the worker
      await this.notifyWorker(workerId, batchId, stage)

    } catch (error) {
      logger.error("Failed to create stage assignment", error, { 
        action: "createStageAssignment",
        batchId,
        stage,
        workerId
      }, "BATCH_ASSIGNMENT")
      throw error
    }
  }

  /**
   * Send notification to worker about new assignment
   */
  private async notifyWorker(
    workerId: string, 
    batchId: string, 
    stage: ProductionStage
  ): Promise<void> {
    try {
      // Get batch details for notification
      const supabase = await this.getSupabase()
      const { data: batch } = await supabase
        .from("batches")
        .select("batch_number")
        .eq("id", batchId)
        .single()

      const { error } = await supabase
        .from("worker_notifications")
        .insert({
          worker_id: workerId,
          type: "assignment",
          title: "New Work Assignment",
          message: `You have been assigned to ${stage} for batch ${batch?.batch_number || "Unknown"}`,
          data: {
            batchId,
            stage,
            assignedAt: new Date().toISOString()
          }
        })

      if (error) throw error

    } catch (error) {
      // Don't throw on notification errors
      logger.error("Failed to notify worker", error, { 
        action: "notifyWorker",
        workerId,
        batchId,
        stage
      }, "BATCH_ASSIGNMENT")
    }
  }

  /**
   * Get worker recommendations for a specific stage
   */
  async getWorkerRecommendations(
    stage: ProductionStage,
    limit: number = 5
  ): Promise<Array<Worker & { score: number, factors: any }>> {
    try {
      const today = new Date().toISOString().split('T')[0]

      const supabase = await this.getSupabase()
      const { data: workers, error } = await supabase
        .from("workers")
        .select(`
          *,
          worker_availability(
            *
          ),
          stage_assignments(
            id,
            completed_at
          )
        `)
        .eq("is_active", true)
        .eq("worker_availability.date", today)

      if (error) throw error

      // Score and filter workers
      const scoredWorkers = workers?.map(worker => {
        const score = this.calculateWorkerScore(worker, stage)
        return { ...worker, ...score }
      }).filter(w => w.factors.availability) || []

      // Sort by score and return top recommendations
      scoredWorkers.sort((a, b) => b.score - a.score)
      return scoredWorkers.slice(0, limit)

    } catch (error) {
      logger.error("Failed to get worker recommendations", error, { 
        action: "getWorkerRecommendations",
        stage
      }, "BATCH_ASSIGNMENT")
      return []
    }
  }

  /**
   * Calculate worker score for a stage
   */
  private calculateWorkerScore(worker: any, stage: ProductionStage): WorkerScore {
    const activeAssignments = worker.stage_assignments?.filter(
      (a: any) => !a.completed_at
    ).length || 0

    const isAvailable = worker.worker_availability?.some(
      (a: any) => a.is_available
    ) || false

    let score = 0
    if (worker.specializations?.includes(stage)) score += 50
    if (activeAssignments < 2) score += 30
    if (activeAssignments < 1) score += 20
    if (isAvailable) score += 20

    return {
      workerId: worker.id,
      score,
      factors: {
        hasSpecialization: worker.specializations?.includes(stage) || false,
        currentWorkload: activeAssignments,
        recentPerformance: 0.8, // Default for now
        availability: isAvailable
      }
    }
  }
}