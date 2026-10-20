'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Clock, 
  Play, 
  Pause, 
  StopCircle, 
  Coffee,
  Timer,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns'
import type { Database } from '@/types/database.types'

interface TimeTrackingProps {
  workerId: string
}

type TimeLog = Database['public']['Tables']['time_logs']['Row']
type TimeLogBreak = Database['public']['Tables']['time_log_breaks']['Row']
type DailySummary = Database['public']['Tables']['daily_time_summary']['Row']

interface ActiveTimeLog {
  log_id: string
  log_type: string
  reference_type: string
  reference_id: string
  build_id: string | null
  batch_id: string | null
  stage: string | null
  started_at: string
  elapsed_minutes: number
}

export function TimeTracking({ workerId }: TimeTrackingProps) {
  const [activeLog, setActiveLog] = useState<ActiveTimeLog | null>(null)
  const [recentLogs, setRecentLogs] = useState<TimeLog[]>([])
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [logType, setLogType] = useState<'work' | 'break' | 'admin'>('work')
  const [selectedBuild, setSelectedBuild] = useState('')
  const [selectedStage, setSelectedStage] = useState('')
  const [notes, setNotes] = useState('')
  const [activeBuilds, setActiveBuilds] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchTimeData()
    fetchActiveBuilds()
    
    // Set up interval to update elapsed time
    const interval = setInterval(() => {
      if (activeLog) {
        fetchActiveLog()
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [workerId])

  const fetchTimeData = async () => {
    try {
      // Get active time log
      await fetchActiveLog()

      // Get recent time logs
      const { data: logs } = await supabase
        .from('time_logs')
        .select('*')
        .eq('worker_id', workerId)
        .order('started_at', { ascending: false })
        .limit(10)

      setRecentLogs(logs || [])

      // Get today's summary
      const today = new Date().toISOString().split('T')[0]
      const { data: summary } = await supabase
        .from('daily_time_summary')
        .select('*')
        .eq('worker_id', workerId)
        .eq('work_date', today)
        .single()

      setDailySummary(summary)
    } catch (error) {
      console.error('Error fetching time data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveLog = async () => {
    const { data, error } = await supabase
      .rpc('get_active_time_log')

    if (data && data.length > 0) {
      setActiveLog(data[0])
    } else {
      setActiveLog(null)
    }
  }

  const fetchActiveBuilds = async () => {
    const { data } = await supabase
      .from('builds')
      .select(`
        *,
        headphone_model:headphone_models(name),
        order:orders(order_number)
      `)
      .eq('assigned_to', workerId)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })

    setActiveBuilds(data || [])
  }

  const handleClockIn = async () => {
    try {
      let referenceType = 'general'
      let referenceId = workerId

      if (logType === 'work' && selectedBuild) {
        referenceType = 'build'
        referenceId = selectedBuild
      }

      const { data, error } = await supabase
        .rpc('start_time_log', {
          p_log_type: logType,
          p_reference_type: referenceType,
          p_reference_id: referenceId,
          p_build_id: selectedBuild || null,
          p_stage: selectedStage || null,
          p_notes: notes || null
        })

      if (error) throw error

      // Refresh data
      fetchTimeData()
      fetchActiveLog()
      
      // Reset form
      setNotes('')
      setSelectedBuild('')
      setSelectedStage('')
    } catch (error) {
      console.error('Error clocking in:', error)
      alert('Failed to clock in. Please try again.')
    }
  }

  const handleClockOut = async () => {
    if (!activeLog) return

    try {
      const { error } = await supabase
        .rpc('end_time_log', {
          p_log_id: activeLog.log_id,
          p_notes: notes || null
        })

      if (error) throw error

      // Refresh data
      fetchTimeData()
      setActiveLog(null)
      setNotes('')
    } catch (error) {
      console.error('Error clocking out:', error)
      alert('Failed to clock out. Please try again.')
    }
  }

  const handleStartBreak = async () => {
    if (!activeLog) return

    try {
      const { error } = await supabase
        .from('time_log_breaks')
        .insert({
          time_log_id: activeLog.log_id,
          break_type: 'lunch',
          started_at: new Date().toISOString()
        })

      if (error) throw error

      // Refresh data
      fetchTimeData()
    } catch (error) {
      console.error('Error starting break:', error)
      alert('Failed to start break. Please try again.')
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const stages = [
    'intake',
    'sanding',
    'finishing',
    'sub_assembly',
    'final_assembly',
    'acoustic_qc',
    'shipping'
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-theme-text-tertiary">Loading time tracking...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Time Log or Clock In */}
      {activeLog ? (
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-theme-text-primary">
                <Clock className="w-5 h-5" />
                Currently Clocked In
              </span>
              <Badge className="bg-theme-status-success text-white">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-theme-text-tertiary">Started</p>
                <p className="text-lg font-medium text-theme-text-primary">
                  {format(new Date(activeLog.started_at), 'h:mm a')}
                </p>
              </div>
              <div>
                <p className="text-sm text-theme-text-tertiary">Duration</p>
                <p className="text-lg font-medium text-theme-text-primary">
                  {formatDuration(activeLog.elapsed_minutes)}
                </p>
              </div>
              <div>
                <p className="text-sm text-theme-text-tertiary">Type</p>
                <p className="text-lg font-medium text-theme-text-primary capitalize">
                  {activeLog.log_type}
                </p>
              </div>
            </div>

            {activeLog.build_id && (
              <div className="bg-theme-bg-primary rounded-lg p-3">
                <p className="text-sm text-theme-text-tertiary">Working on</p>
                <p className="text-theme-text-primary">
                  Build {activeLog.build_id} - {activeLog.stage?.replace(/_/g, ' ')}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Textarea
                placeholder="Add notes (optional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-theme-bg-primary border-theme-border-secondary"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleClockOut}
                className="flex-1 bg-theme-status-error hover:bg-theme-status-error/90"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Clock Out
              </Button>
              <Button
                onClick={handleStartBreak}
                variant="outline"
                className="border-theme-border-secondary"
              >
                <Coffee className="w-4 h-4 mr-2" />
                Take Break
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-primary">Clock In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-theme-text-secondary">Type</label>
                <Select value={logType} onValueChange={(v) => setLogType(v as any)}>
                  <SelectTrigger className="bg-theme-bg-primary border-theme-border-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {logType === 'work' && (
                <div>
                  <label className="text-sm text-theme-text-secondary">Build (Optional)</label>
                  <Select value={selectedBuild} onValueChange={setSelectedBuild}>
                    <SelectTrigger className="bg-theme-bg-primary border-theme-border-secondary">
                      <SelectValue placeholder="Select a build" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">General Work</SelectItem>
                      {activeBuilds.map(build => (
                        <SelectItem key={build.id} value={build.id}>
                          {build.serial_number} - {build.headphone_model?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {logType === 'work' && selectedBuild && (
              <div>
                <label className="text-sm text-theme-text-secondary">Stage</label>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="bg-theme-bg-primary border-theme-border-secondary">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage} value={stage}>
                        {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Textarea
              placeholder="Add notes (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-theme-bg-primary border-theme-border-secondary"
              rows={2}
            />

            <Button
              onClick={handleClockIn}
              className="w-full bg-theme-brand-primary hover:bg-theme-brand-primary/90"
            >
              <Play className="w-4 h-4 mr-2" />
              Clock In
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Today's Summary */}
      {dailySummary && (
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-theme-text-primary">
              <Calendar className="w-5 h-5" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-theme-text-primary">
                  {formatDuration(dailySummary.total_hours || 0)}
                </p>
                <p className="text-sm text-theme-text-tertiary">Total Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-theme-status-success">
                  {formatDuration(dailySummary.productive_hours || 0)}
                </p>
                <p className="text-sm text-theme-text-tertiary">Productive</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-theme-status-warning">
                  {formatDuration(dailySummary.break_hours || 0)}
                </p>
                <p className="text-sm text-theme-text-tertiary">Breaks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-theme-brand-primary">
                  {dailySummary.builds_worked || 0}
                </p>
                <p className="text-sm text-theme-text-tertiary">Builds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Time Logs */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-theme-text-primary">
            <Timer className="w-5 h-5" />
            Recent Time Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-center text-theme-text-tertiary py-8">
              No time logs yet today
            </p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-theme-bg-primary rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {log.log_type}
                      </Badge>
                      {log.stage && (
                        <span className="text-sm text-theme-text-tertiary">
                          {log.stage.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-theme-text-tertiary">
                      {format(new Date(log.started_at), 'h:mm a')} - 
                      {log.ended_at ? format(new Date(log.ended_at), 'h:mm a') : 'Active'}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-theme-text-primary">
                      {formatDuration(log.duration_minutes || 0)}
                    </p>
                    {log.is_billable && (
                      <Badge className="bg-theme-status-success text-white text-xs">
                        Billable
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}