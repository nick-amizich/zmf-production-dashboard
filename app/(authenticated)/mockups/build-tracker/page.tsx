'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Package, Clock, AlertTriangle, CheckCircle, XCircle, Wrench, ArrowRight, History, FileText, Box } from 'lucide-react'

// Mock data for the build tracker
const mockBuilds = [
  {
    id: '1',
    serialNumber: 'ATT-24-00001',
    model: 'Atticus',
    orderNumber: 'ORD-2024-0156',
    customer: 'John Smith',
    currentStage: 'Final Assembly',
    status: 'in_progress',
    qualityStatus: 'good',
    priority: 2,
    startedAt: '2024-01-15',
    estimatedCompletion: '2024-01-22',
    assignedWorker: 'Mike Johnson',
    progress: 75,
    reworkCount: 0
  },
  {
    id: '2',
    serialNumber: 'VER-24-00045',
    model: 'Verite Closed',
    orderNumber: 'ORD-2024-0155',
    customer: 'Sarah Connor',
    currentStage: 'Acoustic QC',
    status: 'in_progress',
    qualityStatus: 'warning',
    priority: 1,
    startedAt: '2024-01-14',
    estimatedCompletion: '2024-01-20',
    assignedWorker: 'Tom Wilson',
    progress: 85,
    reworkCount: 1
  },
  {
    id: '3',
    serialNumber: 'EIK-24-00023',
    model: 'Eikon',
    orderNumber: 'ORD-2024-0154',
    customer: 'Robert Chen',
    currentStage: 'Rework',
    status: 'rework',
    qualityStatus: 'critical',
    priority: 1,
    startedAt: '2024-01-13',
    estimatedCompletion: '2024-01-21',
    assignedWorker: 'Jane Doe',
    progress: 60,
    reworkCount: 1,
    defect: 'Finish defect on left cup'
  },
  {
    id: '4',
    serialNumber: 'AUT-24-00012',
    model: 'Auteur',
    orderNumber: 'ORD-2024-0153',
    customer: 'Lisa Wang',
    currentStage: 'Sanding',
    status: 'in_progress',
    qualityStatus: 'good',
    priority: 3,
    startedAt: '2024-01-16',
    estimatedCompletion: '2024-01-25',
    assignedWorker: 'Dave Miller',
    progress: 25,
    reworkCount: 0
  },
  {
    id: '5',
    serialNumber: 'CAL-24-00008',
    model: 'Caldera Closed',
    orderNumber: 'ORD-2024-0152',
    customer: 'Mark Thompson',
    currentStage: 'Shipping',
    status: 'completed',
    qualityStatus: 'good',
    priority: 2,
    startedAt: '2024-01-10',
    completedAt: '2024-01-17',
    estimatedCompletion: '2024-01-18',
    assignedWorker: 'Steve Brown',
    progress: 100,
    reworkCount: 0
  }
]

const stages = [
  'All Stages',
  'Intake',
  'Sanding',
  'Finishing',
  'Sub-Assembly',
  'Final Assembly',
  'Acoustic QC',
  'Shipping',
  'Rework'
]

const statusColors = {
  pending: 'bg-theme-text-tertiary',
  in_progress: 'bg-theme-status-info',
  completed: 'bg-theme-status-success',
  on_hold: 'bg-theme-status-warning',
  rework: 'bg-theme-status-error',
  cancelled: 'bg-theme-text-secondary'
}

const qualityColors = {
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

export default function BuildTrackerMockup() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState('All Stages')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filteredBuilds = mockBuilds.filter(build => {
    const matchesSearch = build.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         build.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         build.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = selectedStage === 'All Stages' || build.currentStage === selectedStage
    const matchesStatus = selectedStatus === 'all' || build.status === selectedStatus
    return matchesSearch && matchesStage && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-theme-text-primary">Build Tracker</h1>
            <p className="text-theme-text-tertiary mt-1">Track individual headphone builds with serial numbers</p>
          </div>
          <Button className="bg-theme-brand-primary hover:bg-theme-brand-primary/90">
            <Package className="w-4 h-4 mr-2" />
            Create New Build
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Active Builds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-text-primary">47</div>
              <p className="text-xs text-theme-text-tertiary">Across all stages</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">In Rework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-error">3</div>
              <p className="text-xs text-theme-text-tertiary">Requires attention</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-success">8</div>
              <p className="text-xs text-theme-text-tertiary">Ready to ship</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Avg. Build Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-text-primary">6.2</div>
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
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
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
          {filteredBuilds.map((build) => {
            const QualityIcon = qualityIcons[build.qualityStatus as keyof typeof qualityIcons]
            
            return (
              <Card key={build.id} className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-border-secondary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 flex-1">
                      {/* Build Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-theme-text-primary">{build.serialNumber}</h3>
                            <Badge className={`${statusColors[build.status as keyof typeof statusColors]} text-white`}>
                              {build.status.replace('_', ' ')}
                            </Badge>
                            {build.priority === 1 && (
                              <Badge variant="outline" className="border-theme-status-error text-theme-status-error">
                                High Priority
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-theme-text-tertiary">
                            <span>{build.model}</span>
                            <span>•</span>
                            <span>{build.orderNumber}</span>
                            <span>•</span>
                            <span>{build.customer}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <QualityIcon className={`w-5 h-5 ${qualityColors[build.qualityStatus as keyof typeof qualityColors]}`} />
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
                          <span className="text-theme-text-tertiary">Current Stage: <span className="font-medium text-theme-text-primary">{build.currentStage}</span></span>
                          <span className="text-theme-text-tertiary">{build.progress}% Complete</span>
                        </div>
                        <div className="w-full bg-theme-bg-primary rounded-full h-2">
                          <div 
                            className="bg-theme-brand-primary h-2 rounded-full transition-all"
                            style={{ width: `${build.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-theme-text-tertiary" />
                            <span className="text-theme-text-tertiary">Started: {build.startedAt}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-theme-text-tertiary" />
                            <span className="text-theme-text-tertiary">Est. Completion: {build.estimatedCompletion}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-theme-text-tertiary">Assigned to: <span className="text-theme-text-primary">{build.assignedWorker}</span></span>
                          </div>
                          {build.reworkCount > 0 && (
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-theme-status-warning" />
                              <span className="text-theme-status-warning">Rework: {build.reworkCount}</span>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="border-theme-border-secondary">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>

                      {/* Defect Alert */}
                      {build.defect && (
                        <div className="bg-theme-status-error/10 border border-theme-status-error/20 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-theme-status-error" />
                            <span className="text-sm text-theme-status-error font-medium">Active Defect:</span>
                            <span className="text-sm text-theme-text-primary">{build.defect}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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