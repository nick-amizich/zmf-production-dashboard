import { BuildRepository } from '@/lib/repositories/build-repository'
import { WorkerRepository } from '@/lib/repositories/worker-repository'
import { logBusiness, logError } from '@/lib/logger'
import type { Database } from '@/types/database.types'

type Build = Database['public']['Tables']['builds']['Row']
type BuildInsert = Database['public']['Tables']['builds']['Insert']
type BuildUpdate = Database['public']['Tables']['builds']['Update']

export class BuildService {
  private buildRepo: BuildRepository
  private workerRepo: WorkerRepository

  constructor(buildRepo: BuildRepository, workerRepo: WorkerRepository) {
    this.buildRepo = buildRepo
    this.workerRepo = workerRepo
  }

  async getBuilds(filters?: {
    status?: string
    stage?: string
    assignedTo?: string
    orderId?: string
    search?: string
  }) {
    try {
      const builds = await this.buildRepo.getBuilds(filters)
      logBusiness('Fetched builds', 'BUILD_TRACKER', { 
        count: builds.length,
        filters 
      })
      return builds
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'getBuilds',
        filters 
      })
      throw error
    }
  }

  async getBuildById(id: string) {
    try {
      const build = await this.buildRepo.getBuildById(id)
      if (!build) {
        throw new Error('Build not found')
      }
      return build
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'getBuildById',
        buildId: id 
      })
      throw error
    }
  }

  async getBuildBySerialNumber(serialNumber: string) {
    try {
      const build = await this.buildRepo.getBuildBySerialNumber(serialNumber)
      if (!build) {
        throw new Error('Build not found')
      }
      return build
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'getBuildBySerialNumber',
        serialNumber 
      })
      throw error
    }
  }

  async createBuild(data: {
    order_id: string
    headphone_model_id: string
    model_code: string
    assigned_to?: string
    priority?: number
    target_completion_date?: string
    notes?: string
  }) {
    try {
      // Validate worker if assigned
      if (data.assigned_to) {
        const worker = await this.workerRepo.getWorkerById(data.assigned_to)
        if (!worker || !worker.is_active) {
          throw new Error('Invalid or inactive worker')
        }
      }

      const build = await this.buildRepo.createBuild(data)
      
      logBusiness('Build created', 'BUILD_TRACKER', {
        buildId: build.id,
        serialNumber: build.serial_number,
        orderId: data.order_id,
        modelId: data.headphone_model_id,
        assignedTo: data.assigned_to
      })

      return build
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'createBuild',
        data 
      })
      throw error
    }
  }

  async updateBuild(id: string, updates: BuildUpdate, performedBy: string) {
    try {
      const currentBuild = await this.buildRepo.getBuildById(id)
      if (!currentBuild) {
        throw new Error('Build not found')
      }

      const updatedBuild = await this.buildRepo.updateBuild(id, updates)

      logBusiness('Build updated', 'BUILD_TRACKER', {
        buildId: id,
        updates,
        performedBy,
        previousState: {
          status: currentBuild.status,
          stage: currentBuild.current_stage,
          assignedTo: currentBuild.assigned_to
        }
      })

      return updatedBuild
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'updateBuild',
        buildId: id,
        updates 
      })
      throw error
    }
  }

  async moveToStage(buildId: string, newStage: string, performedBy: string) {
    try {
      const build = await this.buildRepo.getBuildById(buildId)
      if (!build) {
        throw new Error('Build not found')
      }

      // Validate stage transition
      const validTransitions = this.getValidStageTransitions(build.current_stage || 'intake')
      if (!validTransitions.includes(newStage)) {
        throw new Error(`Invalid stage transition from ${build.current_stage} to ${newStage}`)
      }

      const updatedBuild = await this.buildRepo.moveToStage(buildId, newStage, performedBy)

      logBusiness('Build moved to new stage', 'BUILD_TRACKER', {
        buildId,
        previousStage: build.current_stage,
        newStage,
        performedBy
      })

      return updatedBuild
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'moveToStage',
        buildId,
        newStage,
        performedBy 
      })
      throw error
    }
  }

  async reportDefect(buildId: string, defectData: {
    stage: string
    defect_category: string
    defect_type: string
    severity: 'minor' | 'major' | 'critical'
    description: string
    target_stage: string
    photos?: string[]
  }, reportedBy: string) {
    try {
      const build = await this.buildRepo.getBuildById(buildId)
      if (!build) {
        throw new Error('Build not found')
      }

      const defectId = await this.buildRepo.reportDefect(buildId, defectData)

      logBusiness('Defect reported for build', 'BUILD_TRACKER', {
        buildId,
        defectId,
        severity: defectData.severity,
        category: defectData.defect_category,
        reportedBy,
        targetStage: defectData.target_stage
      })

      return defectId
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'reportDefect',
        buildId,
        defectData 
      })
      throw error
    }
  }

  async assignWorker(buildId: string, workerId: string, assignedBy: string) {
    try {
      // Validate worker
      const worker = await this.workerRepo.getWorkerById(workerId)
      if (!worker || !worker.is_active) {
        throw new Error('Invalid or inactive worker')
      }

      // Check worker availability/capacity
      const activeBuilds = await this.buildRepo.getBuildsByWorker(workerId, 'in_progress')
      if (activeBuilds.length >= 3) { // Max 3 active builds per worker
        throw new Error('Worker has reached maximum capacity')
      }

      const updatedBuild = await this.buildRepo.assignWorker(buildId, workerId)

      logBusiness('Worker assigned to build', 'BUILD_TRACKER', {
        buildId,
        workerId,
        workerName: worker.name,
        assignedBy
      })

      return updatedBuild
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'assignWorker',
        buildId,
        workerId 
      })
      throw error
    }
  }

  async updateQualityStatus(buildId: string, qualityStatus: string, updatedBy: string) {
    try {
      const build = await this.buildRepo.getBuildById(buildId)
      if (!build) {
        throw new Error('Build not found')
      }

      const updatedBuild = await this.buildRepo.updateQualityStatus(buildId, qualityStatus)

      logBusiness('Build quality status updated', 'BUILD_TRACKER', {
        buildId,
        previousStatus: build.quality_status,
        newStatus: qualityStatus,
        updatedBy
      })

      // If quality status is critical or fail, update build status
      if (qualityStatus === 'critical' || qualityStatus === 'fail') {
        await this.buildRepo.updateBuild(buildId, { status: 'on_hold' })
      }

      return updatedBuild
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'updateQualityStatus',
        buildId,
        qualityStatus 
      })
      throw error
    }
  }

  async getBuildHistory(buildId: string) {
    try {
      const history = await this.buildRepo.getBuildHistory(buildId)
      return history
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'getBuildHistory',
        buildId 
      })
      throw error
    }
  }

  async getWorkerBuilds(workerId: string, status?: string) {
    try {
      const builds = await this.buildRepo.getBuildsByWorker(workerId, status)
      return builds
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'getWorkerBuilds',
        workerId,
        status 
      })
      throw error
    }
  }

  async getBuildMetrics() {
    try {
      const metrics = await this.buildRepo.getBuildMetrics()
      return metrics
    } catch (error) {
      logError(error as Error, 'BUILD_TRACKER', { 
        context: 'getBuildMetrics' 
      })
      throw error
    }
  }

  private getValidStageTransitions(currentStage: string): string[] {
    const transitions: Record<string, string[]> = {
      intake: ['sanding', 'rework'],
      sanding: ['finishing', 'rework'],
      finishing: ['sub_assembly', 'rework'],
      sub_assembly: ['final_assembly', 'rework'],
      final_assembly: ['acoustic_qc', 'rework'],
      acoustic_qc: ['shipping', 'rework'],
      shipping: [],
      rework: ['intake', 'sanding', 'finishing', 'sub_assembly', 'final_assembly', 'acoustic_qc']
    }

    return transitions[currentStage] || []
  }
}