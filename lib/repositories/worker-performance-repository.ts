import { BaseRepository, DatabaseError } from './base-repository'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type ProductionMetrics = Database['public']['Tables']['production_metrics']['Row']
type ProductionMetricsInsert = Database['public']['Tables']['production_metrics']['Insert']
type Worker = Database['public']['Tables']['workers']['Row']
type ProductionStage = Database['public']['Enums']['production_stage']

export interface WorkerPerformanceStats {
  worker: Worker
  totalUnitsCompleted: number
  averageTimePerUnit: number
  qualityPassRate: number
  currentStreak: number
  bestStreak: number
  stageMetrics: StageMetrics[]
  recentMetrics: ProductionMetrics[]
  rank: number
  totalWorkers: number
}

export interface StageMetrics {
  stage: ProductionStage
  unitsCompleted: number
  averageTime: number
  qualityRate: number
  lastCompleted: Date | null
}

export interface LeaderboardEntry {
  worker: Worker
  score: number
  unitsCompleted: number
  qualityRate: number
  efficiency: number
}

export class WorkerPerformanceRepository extends BaseRepository<ProductionMetrics> {
  constructor(protected supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findById(id: string): Promise<ProductionMetrics | null> {
    const { data, error } = await this.supabase
      .from('production_metrics')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Failed to fetch metric', error)
    }

    return data
  }

  async getWorkerStats(
    workerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<WorkerPerformanceStats> {
    // Get worker details
    const { data: worker } = await this.supabase
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .single()

    if (!worker) throw new Error('Worker not found')

    // Build date filter
    let query = this.supabase
      .from('production_metrics')
      .select('*')
      .eq('worker_id', workerId)

    if (startDate) {
      query = query.gte('date', startDate.toISOString().split('T')[0])
    }
    if (endDate) {
      query = query.lte('date', endDate.toISOString().split('T')[0])
    }

    const { data: metrics, error } = await query.order('date', { ascending: false })

    if (error) throw new DatabaseError('Failed to fetch metrics', error)

    // Calculate stats
    const totalUnits = metrics?.reduce((sum, m) => sum + m.units_completed, 0) || 0
    const totalTime = metrics?.reduce((sum, m) => sum + (m.total_time_minutes || 0), 0) || 0
    const avgTimePerUnit = totalUnits > 0 ? totalTime / totalUnits : 0

    // Calculate quality pass rate
    const qualityMetrics = metrics?.filter(m => m.quality_pass_rate !== null) || []
    const qualityRate = qualityMetrics.length > 0
      ? qualityMetrics.reduce((sum, m) => sum + (m.quality_pass_rate || 0), 0) / qualityMetrics.length
      : 0

    // Calculate streaks
    const { currentStreak, bestStreak } = this.calculateStreaks(metrics || [])

    // Group by stage
    const stageMetrics = this.calculateStageMetrics(metrics || [])

    // Get worker rank
    const { rank, total } = await this.getWorkerRank(workerId)

    return {
      worker,
      totalUnitsCompleted: totalUnits,
      averageTimePerUnit: avgTimePerUnit,
      qualityPassRate: qualityRate,
      currentStreak,
      bestStreak,
      stageMetrics,
      recentMetrics: metrics?.slice(0, 10) || [],
      rank,
      totalWorkers: total
    }
  }

  private calculateStreaks(metrics: ProductionMetrics[]): { currentStreak: number; bestStreak: number } {
    if (metrics.length === 0) return { currentStreak: 0, bestStreak: 0 }

    // Sort by date ascending for streak calculation
    const sorted = [...metrics].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let currentStreak = 0
    let bestStreak = 0
    let streak = 0
    let lastDate: Date | null = null

    for (const metric of sorted) {
      const date = new Date(metric.date)
      
      if (lastDate) {
        const dayDiff = Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayDiff === 1) {
          // Consecutive day
          streak++
        } else if (dayDiff > 1) {
          // Streak broken
          bestStreak = Math.max(bestStreak, streak)
          streak = 1
        }
      } else {
        streak = 1
      }
      
      lastDate = date
    }

    currentStreak = streak
    bestStreak = Math.max(bestStreak, streak)

    return { currentStreak, bestStreak }
  }

  private calculateStageMetrics(metrics: ProductionMetrics[]): StageMetrics[] {
    const stageMap = new Map<ProductionStage, {
      units: number
      time: number
      quality: number[]
      lastDate: Date | null
    }>()

    for (const metric of metrics) {
      const stage = metric.stage as ProductionStage
      const existing = stageMap.get(stage) || {
        units: 0,
        time: 0,
        quality: [],
        lastDate: null
      }

      existing.units += metric.units_completed
      existing.time += metric.total_time_minutes || 0
      if (metric.quality_pass_rate !== null) {
        existing.quality.push(metric.quality_pass_rate)
      }
      
      const metricDate = new Date(metric.date)
      if (!existing.lastDate || metricDate > existing.lastDate) {
        existing.lastDate = metricDate
      }

      stageMap.set(stage, existing)
    }

    const results: StageMetrics[] = []
    for (const [stage, data] of stageMap.entries()) {
      results.push({
        stage,
        unitsCompleted: data.units,
        averageTime: data.units > 0 ? data.time / data.units : 0,
        qualityRate: data.quality.length > 0 
          ? data.quality.reduce((a, b) => a + b) / data.quality.length 
          : 0,
        lastCompleted: data.lastDate
      })
    }

    return results
  }

  async getWorkerRank(workerId: string): Promise<{ rank: number; total: number }> {
    // Calculate composite score for all workers
    const { data: allWorkers } = await this.supabase
      .from('workers')
      .select('id')
      .eq('is_active', true)

    if (!allWorkers) return { rank: 0, total: 0 }

    const scores: { workerId: string; score: number }[] = []

    for (const worker of allWorkers) {
      const { data: metrics } = await this.supabase
        .from('production_metrics')
        .select('units_completed, quality_pass_rate, total_time_minutes')
        .eq('worker_id', worker.id)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      if (metrics && metrics.length > 0) {
        const totalUnits = metrics.reduce((sum, m) => sum + m.units_completed, 0)
        const avgQuality = metrics
          .filter(m => m.quality_pass_rate !== null)
          .reduce((sum, m, _, arr) => sum + (m.quality_pass_rate || 0) / arr.length, 0)
        const avgTime = metrics
          .filter(m => m.total_time_minutes !== null && m.units_completed > 0)
          .reduce((sum, m, _, arr) => sum + (m.total_time_minutes! / m.units_completed) / arr.length, 0)

        // Composite score: units * quality / time (higher is better)
        const score = totalUnits * (avgQuality / 100) / Math.max(avgTime, 1)
        scores.push({ workerId: worker.id, score })
      }
    }

    scores.sort((a, b) => b.score - a.score)
    const rank = scores.findIndex(s => s.workerId === workerId) + 1

    return { rank: rank || scores.length + 1, total: allWorkers.length }
  }

  async getLeaderboard(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<LeaderboardEntry[]> {
    const { data: workers } = await this.supabase
      .from('workers')
      .select('*')
      .eq('is_active', true)

    if (!workers) return []

    const entries: LeaderboardEntry[] = []

    for (const worker of workers) {
      let query = this.supabase
        .from('production_metrics')
        .select('units_completed, quality_pass_rate, total_time_minutes')
        .eq('worker_id', worker.id)

      if (startDate) {
        query = query.gte('date', startDate.toISOString().split('T')[0])
      }
      if (endDate) {
        query = query.lte('date', endDate.toISOString().split('T')[0])
      }

      const { data: metrics } = await query

      if (metrics && metrics.length > 0) {
        const totalUnits = metrics.reduce((sum, m) => sum + m.units_completed, 0)
        const qualityMetrics = metrics.filter(m => m.quality_pass_rate !== null)
        const avgQuality = qualityMetrics.length > 0
          ? qualityMetrics.reduce((sum, m) => sum + (m.quality_pass_rate || 0), 0) / qualityMetrics.length
          : 0
        const timeMetrics = metrics.filter(m => m.total_time_minutes !== null && m.units_completed > 0)
        const efficiency = timeMetrics.length > 0
          ? timeMetrics.reduce((sum, m) => sum + m.units_completed / (m.total_time_minutes || 1), 0) / timeMetrics.length * 60
          : 0

        const score = totalUnits * (avgQuality / 100) * efficiency
        
        entries.push({
          worker,
          score,
          unitsCompleted: totalUnits,
          qualityRate: avgQuality,
          efficiency
        })
      }
    }

    return entries
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  async recordMetric(data: ProductionMetricsInsert): Promise<ProductionMetrics> {
    const { data: metric, error } = await this.supabase
      .from('production_metrics')
      .insert(data)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to record metric', error)
    return metric
  }

  async updateMetric(
    workerId: string,
    stage: ProductionStage,
    date: string,
    updates: Partial<ProductionMetricsInsert>
  ): Promise<ProductionMetrics> {
    const { data: metric, error } = await this.supabase
      .from('production_metrics')
      .update(updates)
      .eq('worker_id', workerId)
      .eq('stage', stage)
      .eq('date', date)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to update metric', error)
    return metric
  }
}