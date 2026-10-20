'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, StopCircle, Coffee } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface QuickTimeWidgetProps {
  workerId: string
  compact?: boolean
}

interface ActiveTimeLog {
  log_id: string
  log_type: string
  started_at: string
  elapsed_minutes: number
}

export function QuickTimeWidget({ workerId, compact = false }: QuickTimeWidgetProps) {
  const [activeLog, setActiveLog] = useState<ActiveTimeLog | null>(null)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchActiveLog()
    
    // Update every minute
    const interval = setInterval(fetchActiveLog, 60000)
    return () => clearInterval(interval)
  }, [workerId])

  const fetchActiveLog = async () => {
    const { data } = await supabase.rpc('get_active_time_log')
    if (data && data.length > 0) {
      setActiveLog(data[0])
    } else {
      setActiveLog(null)
    }
  }

  const handleQuickClockIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.rpc('start_time_log', {
        p_log_type: 'work',
        p_reference_type: 'general',
        p_reference_id: workerId,
        p_notes: 'Quick clock in'
      })

      if (!error) {
        fetchActiveLog()
      }
    } catch (error) {
      console.error('Error clocking in:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickClockOut = async () => {
    if (!activeLog) return
    
    setLoading(true)
    try {
      const { error } = await supabase.rpc('end_time_log', {
        p_log_id: activeLog.log_id,
        p_notes: 'Quick clock out'
      })

      if (!error) {
        setActiveLog(null)
      }
    } catch (error) {
      console.error('Error clocking out:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {activeLog ? (
          <>
            <Badge className="bg-theme-status-success text-white">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(activeLog.elapsed_minutes)}
            </Badge>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleQuickClockOut}
              disabled={loading}
            >
              <StopCircle className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="bg-theme-brand-primary hover:bg-theme-brand-primary/90"
            onClick={handleQuickClockIn}
            disabled={loading}
          >
            <Play className="w-4 h-4 mr-1" />
            Clock In
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className="bg-theme-bg-secondary border-theme-border-primary">
      <CardContent className="p-4">
        {activeLog ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-theme-status-success text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Active
                </Badge>
                <span className="text-sm text-theme-text-tertiary">
                  Since {format(new Date(activeLog.started_at), 'h:mm a')}
                </span>
              </div>
              <span className="text-lg font-semibold text-theme-text-primary">
                {formatDuration(activeLog.elapsed_minutes)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleQuickClockOut}
                disabled={loading}
                className="flex-1 bg-theme-status-error hover:bg-theme-status-error/90"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Clock Out
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                className="border-theme-border-secondary"
              >
                <Coffee className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleQuickClockIn}
            disabled={loading}
            className="w-full bg-theme-brand-primary hover:bg-theme-brand-primary/90"
          >
            <Play className="w-4 h-4 mr-2" />
            Clock In
          </Button>
        )}
      </CardContent>
    </Card>
  )
}