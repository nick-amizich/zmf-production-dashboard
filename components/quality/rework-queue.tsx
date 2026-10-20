'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  AlertTriangle, 
  Clock, 
  User, 
  ArrowRight,
  Wrench,
  CheckCircle,
  XCircle,
  Package,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, formatDistanceToNow } from 'date-fns'
import type { Database } from '@/types/database.types'

type ReworkItem = Database['public']['Views']['rework_queue']['Row']
type WorkerRole = Database['public']['Enums']['worker_role']

interface ReworkQueueProps {
  userRole: WorkerRole
  userId: string
}

const severityColors = {
  critical: 'bg-theme-status-error',
  major: 'bg-theme-status-warning',
  minor: 'bg-theme-status-info'
}

const statusColors = {
  pending: 'bg-theme-text-tertiary',
  assigned: 'bg-theme-status-info',
  in_progress: 'bg-theme-brand-primary',
  completed: 'bg-theme-status-success'
}

export function ReworkQueue({ userRole, userId }: ReworkQueueProps) {
  const [reworkItems, setReworkItems] = useState<ReworkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [sortBy, setSortBy] = useState('queue_time')

  const supabase = createClient()

  useEffect(() => {
    fetchReworkQueue()
  }, [])

  const fetchReworkQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('rework_queue')
        .select('*')
        .order('initiated_at', { ascending: false })

      if (error) {
        console.error('Error fetching rework queue:', error)
        return
      }

      setReworkItems(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignToMe = async (reworkId: string) => {
    try {
      const { error } = await supabase
        .from('rework_history')
        .update({ 
          assigned_to: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', reworkId)

      if (error) {
        console.error('Error assigning rework:', error)
        return
      }

      // Refresh the queue
      fetchReworkQueue()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleStartRework = async (reworkId: string) => {
    try {
      const { error } = await supabase
        .from('rework_history')
        .update({ 
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reworkId)

      if (error) {
        console.error('Error starting rework:', error)
        return
      }

      // Refresh the queue
      fetchReworkQueue()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredItems = reworkItems.filter(item => {
    const matchesSearch = 
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.defect_type?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'unassigned' && !item.assigned_to) ||
      (filterStatus === 'assigned' && item.assigned_to && !item.started_at) ||
      (filterStatus === 'in_progress' && item.started_at && item.rework_status !== 'completed')
    
    const matchesSeverity = filterSeverity === 'all' || item.severity === filterSeverity
    
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'queue_time':
        return new Date(b.initiated_at || '').getTime() - new Date(a.initiated_at || '').getTime()
      case 'severity':
        const severityOrder = { critical: 3, major: 2, minor: 1 }
        return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
               (severityOrder[a.severity as keyof typeof severityOrder] || 0)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-theme-text-tertiary">Loading rework queue...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-tertiary w-4 h-4" />
                <Input
                  placeholder="Search by serial number, order, or defect..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-theme-bg-primary border-theme-border-secondary"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] bg-theme-bg-primary border-theme-border-secondary">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[180px] bg-theme-bg-primary border-theme-border-secondary">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-theme-bg-primary border-theme-border-secondary">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="queue_time">Queue Time</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rework Items */}
      <div className="space-y-4">
        {sortedItems.length === 0 ? (
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-theme-status-success mb-4" />
              <p className="text-theme-text-tertiary">No items in rework queue</p>
            </CardContent>
          </Card>
        ) : (
          sortedItems.map((item) => {
            const hoursInQueue = item.hours_in_queue || 0
            const isUrgent = item.severity === 'critical' || hoursInQueue > 24
            
            return (
              <Card 
                key={item.rework_id} 
                className={`bg-theme-bg-secondary border-theme-border-primary ${
                  isUrgent ? 'border-theme-status-error' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-theme-text-primary">
                            {item.serial_number || 'No Serial'}
                          </h3>
                          <Badge className={`${severityColors[item.severity as keyof typeof severityColors] || severityColors.minor} text-white`}>
                            {item.severity}
                          </Badge>
                          <Badge variant="outline" className="border-theme-border-secondary">
                            {item.defect_category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-theme-text-tertiary">
                          <span>{item.model_name}</span>
                          <span>•</span>
                          <span>Order #{item.order_number}</span>
                          <span>•</span>
                          <span>From {item.current_stage?.replace(/_/g, ' ')} → {item.target_stage?.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hoursInQueue > 24 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {Math.floor(hoursInQueue)}h in queue
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Defect Details */}
                    <div className="bg-theme-bg-primary rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-theme-text-secondary mb-1">Defect Type</p>
                          <p className="text-theme-text-primary">{item.defect_type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-text-secondary mb-1">Description</p>
                          <p className="text-theme-text-primary">{item.defect_description || 'No description'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Assignment and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {item.assigned_to ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-theme-text-tertiary" />
                            <span className="text-sm text-theme-text-primary">
                              {item.assigned_worker_name || 'Assigned'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-theme-text-tertiary">Unassigned</span>
                        )}
                        {item.initiated_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-theme-text-tertiary" />
                            <span className="text-sm text-theme-text-tertiary">
                              Added {formatDistanceToNow(new Date(item.initiated_at), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!item.assigned_to && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-theme-border-secondary"
                            onClick={() => handleAssignToMe(item.rework_id!)}
                          >
                            Assign to Me
                          </Button>
                        )}
                        {item.assigned_to === userId && !item.started_at && (
                          <Button 
                            size="sm"
                            className="bg-theme-brand-primary hover:bg-theme-brand-primary/90"
                            onClick={() => handleStartRework(item.rework_id!)}
                          >
                            <Wrench className="w-4 h-4 mr-2" />
                            Start Rework
                          </Button>
                        )}
                        {item.started_at && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-theme-border-secondary"
                          >
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Summary Stats */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-theme-text-primary">
                {reworkItems.filter(i => !i.assigned_to).length}
              </p>
              <p className="text-sm text-theme-text-tertiary">Unassigned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-status-warning">
                {reworkItems.filter(i => i.severity === 'critical').length}
              </p>
              <p className="text-sm text-theme-text-tertiary">Critical</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-status-info">
                {reworkItems.filter(i => i.started_at && i.rework_status !== 'completed').length}
              </p>
              <p className="text-sm text-theme-text-tertiary">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-brand-primary">
                {Math.round(reworkItems.reduce((acc, item) => acc + (item.hours_in_queue || 0), 0) / reworkItems.length) || 0}h
              </p>
              <p className="text-sm text-theme-text-tertiary">Avg Queue Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}