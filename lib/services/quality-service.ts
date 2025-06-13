import { createClient } from '@/lib/supabase/server'
import { QualityCheckRepository } from '@/lib/repositories/quality-check-repository'
import { IssueRepository } from '@/lib/repositories/issue-repository'
import { Database } from '@/types/database.types'

import { logger } from '@/lib/logger'
type ProductionStage = Database['public']['Enums']['production_stage']
type QualityStatus = Database['public']['Enums']['quality_status']

export interface QualityCheckData {
  orderId?: string
  batchId?: string
  stage: ProductionStage
  checklistData: any[]
  overallStatus: QualityStatus
  photos?: string[]
  notes?: string
}

export interface IssueData {
  orderId?: string
  batchId?: string
  stage: ProductionStage
  category: string
  description: string
  severity: QualityStatus
  assignedTo?: string
}

export class QualityService {
  private qualityRepo: QualityCheckRepository
  private issueRepo: IssueRepository

  constructor(private supabase: Awaited<ReturnType<typeof createClient>>) {
    this.qualityRepo = new QualityCheckRepository(supabase)
    this.issueRepo = new IssueRepository(supabase)
  }

  /**
   * Create a quality check
   */
  async createQualityCheck(
    data: QualityCheckData,
    workerId: string
  ) {
    const qualityCheck = await this.qualityRepo.create({
      order_id: data.orderId,
      batch_id: data.batchId,
      stage: data.stage,
      worker_id: workerId,
      checklist_data: data.checklistData,
      overall_status: data.overallStatus,
      photos: data.photos || [],
      notes: data.notes,
    })

    // If status is critical or hold, update batch status
    if (data.batchId && (data.overallStatus === 'critical' || data.overallStatus === 'hold')) {
      await this.supabase
        .from('batches')
        .update({ quality_status: data.overallStatus })
        .eq('id', data.batchId)
    }

    // Update production metrics
    await this.updateQualityMetrics(workerId, data.stage, data.overallStatus)

    return qualityCheck
  }

  /**
   * Report an issue
   */
  async reportIssue(
    data: IssueData,
    reportedBy: string
  ) {
    const issue = await this.issueRepo.create({
      order_id: data.orderId,
      batch_id: data.batchId,
      stage: data.stage,
      reported_by: reportedBy,
      assigned_to: data.assignedTo,
      category: data.category,
      description: data.description,
      severity: data.severity,
    })

    // If severity is critical or hold, update batch status
    if (data.batchId && (data.severity === 'critical' || data.severity === 'hold')) {
      await this.supabase
        .from('batches')
        .update({ quality_status: data.severity })
        .eq('id', data.batchId)
    }

    // Send notification if critical
    if (data.severity === 'critical') {
      await this.notifyCriticalIssue(issue)
    }

    return issue
  }

  /**
   * Resolve an issue
   */
  async resolveIssue(
    issueId: string,
    resolutionNotes: string,
    resolvedBy: string
  ) {
    const issue = await this.issueRepo.resolveIssue(
      issueId,
      resolutionNotes,
      resolvedBy
    )

    // Check if all issues for the batch are resolved
    if (issue.batch_id) {
      const activeIssues = await this.issueRepo.findByBatch(issue.batch_id)
      const hasActiveIssues = activeIssues.some(i => !i.is_resolved)
      
      if (!hasActiveIssues) {
        // Reset batch quality status if all issues resolved
        await this.supabase
          .from('batches')
          .update({ quality_status: 'good' })
          .eq('id', issue.batch_id)
      }
    }

    return issue
  }

  /**
   * Get quality checklist for a model and stage
   */
  async getQualityChecklist(
    modelId: string,
    stage: ProductionStage
  ) {
    // For now, return a default checklist
    // In a real implementation, this would fetch from a checklist templates table
    const defaultChecklists: Record<ProductionStage, any[]> = {
      'Intake': [
        { id: 1, category: 'Wood Quality', item: 'Check for cracks or defects', required: true },
        { id: 2, category: 'Wood Quality', item: 'Verify wood type matches order', required: true },
        { id: 3, category: 'Measurements', item: 'Verify dimensions', required: true },
      ],
      'Sanding': [
        { id: 1, category: 'Surface', item: 'Check smoothness (220 grit)', required: true },
        { id: 2, category: 'Surface', item: 'No visible scratches', required: true },
        { id: 3, category: 'Shape', item: 'Maintain original contours', required: true },
      ],
      'Finishing': [
        { id: 1, category: 'Coating', item: 'Even coat application', required: true },
        { id: 2, category: 'Coating', item: 'No runs or drips', required: true },
        { id: 3, category: 'Coating', item: 'Proper cure time observed', required: true },
      ],
      'Sub-Assembly': [
        { id: 1, category: 'Components', item: 'All parts present', required: true },
        { id: 2, category: 'Fit', item: 'Components fit properly', required: true },
        { id: 3, category: 'Alignment', item: 'Proper alignment verified', required: true },
      ],
      'Final Assembly': [
        { id: 1, category: 'Assembly', item: 'All components secure', required: true },
        { id: 2, category: 'Function', item: 'Moving parts operate smoothly', required: true },
        { id: 3, category: 'Aesthetics', item: 'No visible assembly marks', required: true },
      ],
      'Acoustic QC': [
        { id: 1, category: 'Sound', item: 'Frequency response within spec', required: true },
        { id: 2, category: 'Sound', item: 'No rattles or buzzing', required: true },
        { id: 3, category: 'Sound', item: 'Channel balance verified', required: true },
      ],
      'Shipping': [
        { id: 1, category: 'Packaging', item: 'Proper protective packaging', required: true },
        { id: 2, category: 'Documentation', item: 'All documents included', required: true },
        { id: 3, category: 'Final Check', item: 'Serial number recorded', required: true },
      ],
    }

    return defaultChecklists[stage] || []
  }

  /**
   * Get quality dashboard data
   */
  async getQualityDashboard(
    startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: Date = new Date()
  ) {
    const [qualityMetrics, issueStats, recentChecks, activeIssues] = await Promise.all([
      this.qualityRepo.getQualityMetrics(startDate, endDate),
      this.issueRepo.getIssueStats(),
      this.qualityRepo.findAll(),
      this.issueRepo.findActive(),
    ])

    return {
      metrics: qualityMetrics,
      issues: issueStats,
      recentChecks: recentChecks.slice(0, 10),
      activeIssues,
    }
  }

  /**
   * Update quality metrics
   */
  private async updateQualityMetrics(
    workerId: string,
    stage: ProductionStage,
    status: QualityStatus
  ) {
    const today = new Date().toISOString().split('T')[0]
    
    // Get existing metric
    const { data: existing } = await this.supabase
      .from('production_metrics')
      .select('*')
      .eq('worker_id', workerId)
      .eq('stage', stage)
      .eq('date', today)
      .single()

    if (existing) {
      // Update existing metric
      const passRate = status === 'good' 
        ? ((existing.quality_pass_rate || 0) * existing.units_completed + 100) / (existing.units_completed + 1)
        : ((existing.quality_pass_rate || 0) * existing.units_completed) / (existing.units_completed + 1)

      await this.supabase
        .from('production_metrics')
        .update({
          units_completed: existing.units_completed + 1,
          quality_pass_rate: passRate,
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
          units_completed: 1,
          quality_pass_rate: status === 'good' ? 100 : 0,
        })
    }
  }

  /**
   * Send notification for critical issues
   */
  private async notifyCriticalIssue(issue: any) {
    // In a real implementation, this would send email/SMS/push notifications
    logger.debug('Critical issue notification:', issue)
    
    // Log the notification
    await this.supabase
      .from('system_logs')
      .insert({
        action: 'critical_issue_notification',
        context: 'quality',
        details: {
          issue_id: issue.id,
          severity: issue.severity,
          stage: issue.stage,
        },
      })
  }
}