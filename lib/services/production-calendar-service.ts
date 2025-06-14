import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export interface CalendarBatch {
  id: string
  batchNumber: string
  model: string
  quantity: number
  stage: string
  estimatedHours: number
  priority: 'normal' | 'high' | 'urgent'
  dueDate?: string
}

export interface CalendarWorker {
  id: string
  name: string
  skills: string[]
  status: 'active' | 'break' | 'offline'
}

export interface CalendarAssignment {
  id: string
  workerId: string
  batchId: string
  date: string
  stage: string
  hours: number
  isCompleted: boolean
}

export class ProductionCalendarService {
  static async getCalendarData(startDate: Date, endDate: Date) {
    const supabase = await createClient()
    
    try {
      // Get active batches with their details
      const { data: batches, error: batchError } = await supabase
        .from('batches')
        .select(`
          id,
          batch_number,
          current_stage,
          priority,
          status,
          created_at,
          batch_orders!inner(
            orders!inner(
              id,
              order_number,
              expected_delivery_date,
              order_items!inner(
                quantity,
                headphone_models!inner(
                  name
                )
              )
            )
          )
        `)
        .in('status', ['in_progress', 'quality_check'])
        .order('created_at', { ascending: false })

      if (batchError) {
        logger.error('Failed to fetch batches for calendar', batchError)
        throw batchError
      }

      // Transform batches into calendar format
      const calendarBatches: CalendarBatch[] = (batches || []).map(batch => {
        const firstOrder = batch.batch_orders?.[0]?.orders
        const model = firstOrder?.order_items?.[0]?.headphone_models?.name || 'Unknown'
        const totalQuantity = batch.batch_orders?.reduce((sum, bo) => 
          sum + (bo.orders?.order_items?.reduce((itemSum, item) => 
            itemSum + (item.quantity || 0), 0) || 0), 0) || 0

        // Map priority
        const priorityMap: Record<string, 'normal' | 'high' | 'urgent'> = {
          'standard': 'normal',
          'rush': 'high',
          'emergency': 'urgent'
        }

        return {
          id: batch.id,
          batchNumber: batch.batch_number,
          model,
          quantity: totalQuantity,
          stage: batch.current_stage || 'pending',
          estimatedHours: estimateHoursForStage(batch.current_stage, totalQuantity),
          priority: priorityMap[batch.priority || 'standard'] || 'normal',
          dueDate: firstOrder?.expected_delivery_date
        }
      })

      // Get workers
      const { data: workers, error: workerError } = await supabase
        .from('employees')
        .select('id, name, skills, status, active')
        .eq('role', 'worker')
        .eq('active', true)

      if (workerError) {
        logger.error('Failed to fetch workers for calendar', workerError)
        throw workerError
      }

      const calendarWorkers: CalendarWorker[] = (workers || []).map(worker => ({
        id: worker.id,
        name: worker.name,
        skills: worker.skills || [],
        status: worker.status === 'break' ? 'break' : worker.active ? 'active' : 'offline'
      }))

      // Get existing assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from('stage_assignments')
        .select(`
          id,
          employee_id,
          batch_id,
          stage,
          assigned_at,
          completed_at,
          is_active
        `)
        .gte('assigned_at', startDate.toISOString())
        .lte('assigned_at', endDate.toISOString())

      if (assignmentError) {
        logger.error('Failed to fetch assignments for calendar', assignmentError)
        throw assignmentError
      }

      const calendarAssignments: CalendarAssignment[] = (assignments || []).map(assignment => ({
        id: assignment.id,
        workerId: assignment.employee_id,
        batchId: assignment.batch_id,
        date: new Date(assignment.assigned_at).toISOString().split('T')[0],
        stage: assignment.stage,
        hours: 8, // Default to 8 hours, could be made configurable
        isCompleted: !!assignment.completed_at
      }))

      return {
        batches: calendarBatches,
        workers: calendarWorkers,
        assignments: calendarAssignments
      }
    } catch (error) {
      logger.error('Failed to fetch calendar data', error)
      throw error
    }
  }

  static async createAssignment(
    workerId: string,
    batchId: string,
    date: string,
    stage: string,
    hours: number
  ) {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase
        .from('stage_assignments')
        .insert({
          employee_id: workerId,
          batch_id: batchId,
          stage,
          assigned_at: new Date(date).toISOString(),
          is_active: true
        })
        .select()
        .single()

      if (error) {
        logger.error('Failed to create calendar assignment', error)
        throw error
      }

      return data
    } catch (error) {
      logger.error('Error creating calendar assignment', error)
      throw error
    }
  }

  static async updateAssignment(
    assignmentId: string,
    updates: {
      workerId?: string
      date?: string
      hours?: number
    }
  ) {
    const supabase = await createClient()
    
    try {
      const updateData: any = {}
      
      if (updates.workerId) {
        updateData.employee_id = updates.workerId
      }
      if (updates.date) {
        updateData.assigned_at = new Date(updates.date).toISOString()
      }

      const { data, error } = await supabase
        .from('stage_assignments')
        .update(updateData)
        .eq('id', assignmentId)
        .select()
        .single()

      if (error) {
        logger.error('Failed to update calendar assignment', error)
        throw error
      }

      return data
    } catch (error) {
      logger.error('Error updating calendar assignment', error)
      throw error
    }
  }

  static async deleteAssignment(assignmentId: string) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase
        .from('stage_assignments')
        .delete()
        .eq('id', assignmentId)

      if (error) {
        logger.error('Failed to delete calendar assignment', error)
        throw error
      }

      return true
    } catch (error) {
      logger.error('Error deleting calendar assignment', error)
      throw error
    }
  }
}

// Helper function to estimate hours for a stage based on quantity
function estimateHoursForStage(stage: string | null, quantity: number): number {
  const baseHours: Record<string, number> = {
    'cups': 2,
    'sanding': 3,
    'finishing': 4,
    'sub_assembly': 3,
    'final_assembly': 4,
    'quality_control': 2,
    'packaging': 1
  }
  
  const hoursPerUnit = baseHours[stage || 'cups'] || 2
  return Math.ceil(hoursPerUnit * quantity / 4) // Assuming 4 units per batch of work
}