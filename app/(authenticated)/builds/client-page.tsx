'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, Clock, AlertTriangle, CheckCircle, XCircle, Wrench, ArrowRight, Box, Plus, History, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database.types'

type Build = Database['public']['Tables']['builds']['Row'] & {
  headphone_model?: Database['public']['Tables']['headphone_models']['Row']
  order?: Database['public']['Tables']['orders']['Row'] & {
    customer?: Database['public']['Tables']['customers']['Row']
  }
  assigned_to?: Database['public']['Tables']['workers']['Row']
  batch?: Database['public']['Tables']['batches']['Row']
}

const stages = [
  'All Stages',
  'intake',
  'sanding',
  'finishing',
  'sub_assembly',
  'final_assembly',
  'acoustic_qc',
  'shipping',
  'rework'
]

const statusColors: Record<string, string> = {
  pending: 'bg-theme-text-tertiary',
  in_progress: 'bg-theme-status-info',
  completed: 'bg-theme-status-success',
  on_hold: 'bg-theme-status-warning',
  rework: 'bg-theme-status-error',
  cancelled: 'bg-theme-text-secondary'
}

const qualityColors: Record<string, string> = {
  good: 'text-theme-status-success',
  warning: 'text-theme-status-warning',
  critical: 'text-theme-status-error',
  hold: 'text-theme-status-warning',
  fail: 'text-theme-status-error'
}

const qualityIcons = {
  good: CheckCircle,
  warning: AlertTriangle,
  critical: XCircle,
  hold: Clock,
  fail: XCircle
}

export default function BuildsClient() {
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState('All Stages')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [metrics, setMetrics] = useState({
    activeBuilds: 0,
    inRework: 0,
    completedToday: 0,
    avgBuildTime: 0
  })
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchBuilds()
    fetchMetrics()
  }, [])

  const fetchBuilds = async () => {
    try {
      const { data, error } = await supabase
        .from('builds')
        .select(`
          *,
          headphone_model:headphone_models(*),
          order:orders(
            *,
            customer:customers(*)
          ),
          assigned_to:workers(*),
          batch:batches(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching builds:', error)
        return
      }

      setBuilds(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Active builds
      const { count: activeCount } = await supabase
        .from('builds')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress', 'on_hold'])

      // In rework
      const { count: reworkCount } = await supabase
        .from('builds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rework')

      // Completed today
      const { count: completedTodayCount } = await supabase
        .from('builds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', today.toISOString())

      // Average build time (placeholder)
      const avgTime = 6.2

      setMetrics({
        activeBuilds: activeCount || 0,
        inRework: reworkCount || 0,
        completedToday: completedTodayCount || 0,
        avgBuildTime: avgTime
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const filteredBuilds = builds.filter(build => {
    const matchesSearch = 
      build.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      build.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      build.order?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStage = selectedStage === 'All Stages' || build.current_stage === selectedStage
    const matchesStatus = selectedStatus === 'all' || build.status === selectedStatus
    
    return matchesSearch && matchesStage && matchesStatus
  })

  const getStageProgress = (build: Build) => {
    const stageOrder = ['intake', 'sanding', 'finishing', 'sub_assembly', 'final_assembly', 'acoustic_qc', 'shipping']
    const currentIndex = stageOrder.indexOf(build.current_stage || 'intake')
    const progress = ((currentIndex + 1) / stageOrder.length) * 100
    return Math.round(progress)
  }

  const handleCreateBuild = () => {
    router.push('/orders/create')
  }

  const handleViewDetails = (buildId: string) => {
    router.push(`/builds/${buildId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-theme-text-tertiary">Loading builds...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-theme-text-primary">Build Tracker</h1>
            <p className="text-theme-text-tertiary mt-1">Track individual headphone builds with serial numbers</p>
          </div>
          <Button 
            className="bg-theme-brand-primary hover:bg-theme-brand-primary/90"
            onClick={handleCreateBuild}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Order
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Active Builds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-text-primary">{metrics.activeBuilds}</div>
              <p className="text-xs text-theme-text-tertiary">Across all stages</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">In Rework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-error">{metrics.inRework}</div>
              <p className="text-xs text-theme-text-tertiary">Requires attention</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-success">{metrics.completedToday}</div>
              <p className="text-xs text-theme-text-tertiary">Ready to ship</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Avg. Build Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-text-primary">{metrics.avgBuildTime}</div>
              <p className="text-xs text-theme-text-tertiary">Days per unit</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-tertiary w-4 h-4" />
                  <Input
                    placeholder="Search by serial number, order, or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-theme-bg-primary border-theme-border-secondary"
                  />
                </div>
              </div>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-[200px] bg-theme-bg-primary border-theme-border-secondary">
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => (
                    <SelectItem key={stage} value={stage}>
                      {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[200px] bg-theme-bg-primary border-theme-border-secondary">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="rework">In Rework</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Build List */}
        <div className="space-y-4">
          {filteredBuilds.length === 0 ? (
            <Card className="bg-theme-bg-secondary border-theme-border-primary">
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto text-theme-text-tertiary mb-4" />
                <p className="text-theme-text-tertiary">
                  {searchTerm || selectedStage !== 'All Stages' || selectedStatus !== 'all' 
                    ? 'No builds found matching your criteria' 
                    : 'No builds found. Create an order to start tracking builds.'}
                </p>
                {!searchTerm && selectedStage === 'All Stages' && selectedStatus === 'all' && (
                  <Button 
                    className="mt-4"
                    variant="outline"
                    onClick={handleCreateBuild}
                  >
                    Create your first order
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredBuilds.map((build) => {
              const QualityIcon = qualityIcons[(build.quality_status || 'good') as keyof typeof qualityIcons]
              const progress = getStageProgress(build)
              
              return (
                <Card key={build.id} className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-border-secondary transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-theme-text-primary">{build.serial_number}</h3>
                            <Badge className={`${statusColors[build.status] || statusColors.pending} text-white`}>
                              {build.status.replace('_', ' ')}
                            </Badge>
                            {build.priority === 1 && (
                              <Badge variant="outline" className="border-theme-status-error text-theme-status-error">
                                High Priority
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-theme-text-tertiary">
                            <span>{build.headphone_model?.name || build.model_code || 'Unknown Model'}</span>
                            <span>•</span>
                            <span>{build.order?.order_number || 'No Order'}</span>
                            <span>•</span>
                            <span>{build.order?.customer?.name || 'No Customer'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <QualityIcon className={`w-5 h-5 ${qualityColors[(build.quality_status || 'good') as keyof typeof qualityColors]}`} />
                          <Button variant="ghost" size="sm">
                            <History className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Stage Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-theme-text-tertiary">
                            Current Stage: <span className="font-medium text-theme-text-primary">
                              {build.current_stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </span>
                          <span className="text-theme-text-tertiary">{progress}% Complete</span>
                        </div>
                        <div className="w-full bg-theme-bg-primary rounded-full h-2">
                          <div 
                            className="bg-theme-brand-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-theme-text-tertiary" />
                            <span className="text-theme-text-tertiary">
                              Started: {build.started_at ? format(new Date(build.started_at), 'MMM d, yyyy') : 'Not started'}
                            </span>
                          </div>
                          {build.target_completion_date && (
                            <div className="flex items-center gap-2">
                              <Box className="w-4 h-4 text-theme-text-tertiary" />
                              <span className="text-theme-text-tertiary">
                                Target: {format(new Date(build.target_completion_date), 'MMM d, yyyy')}
                              </span>
                            </div>
                          )}
                          {build.assigned_to && (
                            <div className="flex items-center gap-2">
                              <span className="text-theme-text-tertiary">
                                Assigned to: <span className="text-theme-text-primary">{build.assigned_to.name}</span>
                              </span>
                            </div>
                          )}
                          {build.rework_count && build.rework_count > 0 && (
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-theme-status-warning" />
                              <span className="text-theme-status-warning">Rework: {build.rework_count}</span>
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-theme-border-secondary"
                          onClick={() => handleViewDetails(build.id)}
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>

                      {/* Batch Info */}
                      {build.batch && (
                        <div className="pt-2 border-t border-theme-border-secondary">
                          <div className="flex items-center gap-2 text-sm text-theme-text-tertiary">
                            <Package className="w-4 h-4" />
                            <span>Batch: <span className="text-theme-text-primary">{build.batch.batch_number}</span></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Quick Actions Panel */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-primary">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="border-theme-border-secondary">
                <Package className="w-4 h-4 mr-2" />
                Scan Serial
              </Button>
              <Button variant="outline" className="border-theme-border-secondary">
                <Wrench className="w-4 h-4 mr-2" />
                Report Defect
              </Button>
              <Button variant="outline" className="border-theme-border-secondary">
                <ArrowRight className="w-4 h-4 mr-2" />
                Move Stage
              </Button>
              <Button variant="outline" className="border-theme-border-secondary">
                <Clock className="w-4 h-4 mr-2" />
                Update Time
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}