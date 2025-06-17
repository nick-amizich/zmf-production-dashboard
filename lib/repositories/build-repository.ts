import { BaseRepository } from './base-repository'
import type { Database } from '@/types/database.types'

type Build = Database['public']['Tables']['builds']['Row']
type BuildInsert = Database['public']['Tables']['builds']['Insert']
type BuildUpdate = Database['public']['Tables']['builds']['Update']
type BuildStageHistory = Database['public']['Tables']['build_stage_history']['Row']
type BuildStageHistoryInsert = Database['public']['Tables']['build_stage_history']['Insert']

export class BuildRepository extends BaseRepository {
  async getBuilds(filters?: {
    status?: string
    stage?: string
    assignedTo?: string
    orderId?: string
    search?: string
  }) {
    let query = this.supabase
      .from('builds')
      .select(`
        *,
        headphone_model:headphone_models(name),
        order:orders(
          order_number,
          customer:customers(name)
        ),
        assigned_to:employees(name)
      `)
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters?.stage) {
      query = query.eq('current_stage', filters.stage)
    }

    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo)
    }

    if (filters?.orderId) {
      query = query.eq('order_id', filters.orderId)
    }

    if (filters?.search) {
      query = query.or(`serial_number.ilike.%${filters.search}%,order.order_number.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    return this.handleResponse(data, error)
  }

  async getBuildById(id: string) {
    const { data, error } = await this.supabase
      .from('builds')
      .select(`
        *,
        headphone_model:headphone_models(*),
        order:orders(
          *,
          customer:customers(*)
        ),
        assigned_to:employees(*)
      `)
      .eq('id', id)
      .single()

    return this.handleResponse(data, error)
  }

  async getBuildBySerialNumber(serialNumber: string) {
    const { data, error } = await this.supabase
      .from('builds')
      .select(`
        *,
        headphone_model:headphone_models(*),
        order:orders(
          *,
          customer:customers(*)
        ),
        assigned_to:employees(*)
      `)
      .eq('serial_number', serialNumber)
      .single()

    return this.handleResponse(data, error)
  }

  async createBuild(build: Omit<BuildInsert, 'id' | 'created_at' | 'updated_at'>) {
    // Generate serial number using the database function
    const { data: serialData, error: serialError } = await this.supabase
      .rpc('generate_serial_number', { model_code: build.model_code || 'UNK' })

    if (serialError) {
      return this.handleResponse(null, serialError)
    }

    const buildData: BuildInsert = {
      ...build,
      serial_number: serialData,
      status: build.status || 'pending',
      current_stage: build.current_stage || 'intake',
      quality_status: build.quality_status || 'good',
      priority: build.priority || 3,
      rework_count: 0
    }

    const { data, error } = await this.supabase
      .from('builds')
      .insert(buildData)
      .select()
      .single()

    if (data && !error) {
      // Create initial stage history entry
      await this.addStageHistory({
        build_id: data.id,
        stage: 'intake',
        started_at: new Date().toISOString(),
        performed_by: build.assigned_to
      })
    }

    return this.handleResponse(data, error)
  }

  async updateBuild(id: string, updates: BuildUpdate) {
    // If stage is changing, complete current stage history and start new one
    if (updates.current_stage) {
      const { data: currentBuild } = await this.getBuildById(id)
      
      if (currentBuild && currentBuild.current_stage !== updates.current_stage) {
        // Complete current stage
        await this.completeCurrentStage(id)
        
        // Start new stage
        await this.addStageHistory({
          build_id: id,
          stage: updates.current_stage,
          started_at: new Date().toISOString(),
          performed_by: updates.assigned_to || currentBuild.assigned_to
        })
      }
    }

    const { data, error } = await this.supabase
      .from('builds')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return this.handleResponse(data, error)
  }

  async moveToStage(buildId: string, newStage: string, performedBy: string) {
    // Complete current stage
    await this.completeCurrentStage(buildId)

    // Update build
    const { data: updatedBuild, error: updateError } = await this.updateBuild(buildId, {
      current_stage: newStage,
      status: newStage === 'shipping' ? 'completed' : 'in_progress'
    })

    if (updateError) {
      return this.handleResponse(null, updateError)
    }

    // Add new stage history
    await this.addStageHistory({
      build_id: buildId,
      stage: newStage,
      started_at: new Date().toISOString(),
      performed_by: performedBy
    })

    return this.handleResponse(updatedBuild, null)
  }

  async reportDefect(buildId: string, defectData: {
    stage: string
    defect_category: string
    defect_type: string
    severity: 'minor' | 'major' | 'critical'
    description: string
    target_stage: string
    photos?: string[]
  }) {
    // Use the database function to report defect and create rework
    const { data, error } = await this.supabase
      .rpc('report_defect_and_rework', {
        p_build_id: buildId,
        p_stage: defectData.stage,
        p_defect_category: defectData.defect_category,
        p_defect_type: defectData.defect_type,
        p_severity: defectData.severity,
        p_description: defectData.description,
        p_target_stage: defectData.target_stage,
        p_photos: defectData.photos || null
      })

    return this.handleResponse(data, error)
  }

  async assignWorker(buildId: string, workerId: string) {
    const { data, error } = await this.updateBuild(buildId, {
      assigned_to: workerId
    })

    return this.handleResponse(data, error)
  }

  async updateQualityStatus(buildId: string, qualityStatus: string) {
    const { data, error } = await this.updateBuild(buildId, {
      quality_status: qualityStatus
    })

    return this.handleResponse(data, error)
  }

  async getBuildHistory(buildId: string) {
    const { data, error } = await this.supabase
      .from('build_stage_history')
      .select(`
        *,
        performed_by:employees(name)
      `)
      .eq('build_id', buildId)
      .order('started_at', { ascending: true })

    return this.handleResponse(data, error)
  }

  async getBuildsByWorker(workerId: string, status?: string) {
    let query = this.supabase
      .from('builds')
      .select(`
        *,
        headphone_model:headphone_models(name),
        order:orders(order_number)
      `)
      .eq('assigned_to', workerId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    return this.handleResponse(data, error)
  }

  async getBuildMetrics() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get various counts in parallel
    const [activeBuilds, reworkBuilds, completedToday, totalBuilds] = await Promise.all([
      this.supabase
        .from('builds')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress', 'on_hold']),
      
      this.supabase
        .from('builds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rework'),
      
      this.supabase
        .from('builds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', today.toISOString()),
      
      this.supabase
        .from('builds')
        .select('*', { count: 'exact', head: true })
    ])

    // Calculate average build time (would need more complex query in production)
    const avgBuildTime = 6.2 // Placeholder

    return {
      activeBuilds: activeBuilds.count || 0,
      inRework: reworkBuilds.count || 0,
      completedToday: completedToday.count || 0,
      totalBuilds: totalBuilds.count || 0,
      avgBuildTime
    }
  }

  private async addStageHistory(history: Omit<BuildStageHistoryInsert, 'id'>) {
    const { data, error } = await this.supabase
      .from('build_stage_history')
      .insert(history)
      .select()
      .single()

    return this.handleResponse(data, error)
  }

  private async completeCurrentStage(buildId: string) {
    // Find the current active stage (no completed_at)
    const { data: activeStage } = await this.supabase
      .from('build_stage_history')
      .select('*')
      .eq('build_id', buildId)
      .is('completed_at', null)
      .single()

    if (activeStage) {
      const { error } = await this.supabase
        .from('build_stage_history')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', activeStage.id)

      if (error) {
        console.error('Error completing stage:', error)
      }
    }
  }
}