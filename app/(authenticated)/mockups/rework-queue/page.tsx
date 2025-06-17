'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Wrench, Clock, User, Package, Camera, FileText, CheckCircle, XCircle, ArrowRight, TrendingUp, Search, Filter } from 'lucide-react'

// Mock data for rework queue
const mockReworkItems = [
  {
    id: '1',
    buildId: 'b1',
    serialNumber: 'VER-24-00045',
    model: 'Verite Closed',
    orderNumber: 'ORD-2024-0155',
    customer: 'Sarah Connor',
    defectId: 'd1',
    defectCategory: 'cosmetic',
    defectType: 'Finish Defect',
    severity: 'major',
    description: 'Orange peel texture in finish on left cup',
    reportedBy: 'Tom Wilson',
    reportedAt: '2024-01-18 14:30',
    fromStage: 'Finishing',
    targetStage: 'Sanding',
    assignedTo: 'Jane Doe',
    status: 'in_progress',
    startedAt: '2024-01-18 15:00',
    hoursInQueue: 2.5,
    photos: ['defect1.jpg', 'defect2.jpg'],
    priority: 1
  },
  {
    id: '2',
    buildId: 'b2',
    serialNumber: 'EIK-24-00023',
    model: 'Eikon',
    orderNumber: 'ORD-2024-0154',
    customer: 'Robert Chen',
    defectId: 'd2',
    defectCategory: 'structural',
    defectType: 'Misalignment',
    severity: 'critical',
    description: 'Driver mounting ring misaligned by 2mm',
    reportedBy: 'Mike Johnson',
    reportedAt: '2024-01-18 10:15',
    fromStage: 'Final Assembly',
    targetStage: 'Sub-Assembly',
    assignedTo: null,
    status: 'pending',
    hoursInQueue: 6.5,
    photos: ['defect3.jpg'],
    priority: 1
  },
  {
    id: '3',
    buildId: 'b3',
    serialNumber: 'ATT-24-00098',
    model: 'Atticus',
    orderNumber: 'ORD-2024-0151',
    customer: 'David Kim',
    defectId: 'd3',
    defectCategory: 'acoustic',
    defectType: 'Driver Rattle',
    severity: 'critical',
    description: 'Left driver producing rattle at low frequencies',
    reportedBy: 'Steve Brown',
    reportedAt: '2024-01-18 09:00',
    fromStage: 'Acoustic QC',
    targetStage: 'Final Assembly',
    assignedTo: 'Mike Johnson',
    status: 'pending',
    hoursInQueue: 8,
    photos: [],
    priority: 1
  },
  {
    id: '4',
    buildId: 'b4',
    serialNumber: 'CAL-24-00007',
    model: 'Caldera Closed',
    orderNumber: 'ORD-2024-0150',
    customer: 'Emily Zhang',
    defectId: 'd4',
    defectCategory: 'cosmetic',
    defectType: 'Scratch',
    severity: 'minor',
    description: 'Small scratch on inner headband',
    reportedBy: 'Jane Doe',
    reportedAt: '2024-01-17 16:45',
    fromStage: 'Final Assembly',
    targetStage: 'Finishing',
    assignedTo: 'Tom Wilson',
    status: 'pending',
    hoursInQueue: 24,
    photos: ['defect4.jpg'],
    priority: 2
  },
  {
    id: '5',
    buildId: 'b5',
    serialNumber: 'AUT-24-00011',
    model: 'Auteur',
    orderNumber: 'ORD-2024-0149',
    customer: 'James Wilson',
    defectId: 'd5',
    defectCategory: 'electrical',
    defectType: 'Intermittent Connection',
    severity: 'major',
    description: 'Right channel cuts out intermittently',
    reportedBy: 'Dave Miller',
    reportedAt: '2024-01-18 11:30',
    fromStage: 'Acoustic QC',
    targetStage: 'Final Assembly',
    assignedTo: null,
    status: 'pending',
    hoursInQueue: 5,
    photos: [],
    priority: 1
  }
]

const defectCategories = {
  cosmetic: { color: 'bg-theme-status-info', icon: Camera },
  structural: { color: 'bg-theme-status-error', icon: Package },
  acoustic: { color: 'bg-theme-status-warning', icon: AlertTriangle },
  electrical: { color: 'bg-purple-500', icon: AlertTriangle },
  assembly: { color: 'bg-theme-text-tertiary', icon: Wrench },
  material: { color: 'bg-orange-500', icon: Package }
}

const severityColors = {
  minor: 'text-theme-status-info',
  major: 'text-theme-status-warning',
  critical: 'text-theme-status-error'
}

export default function ReworkQueueMockup() {
  const [selectedTab, setSelectedTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')

  const filteredItems = mockReworkItems.filter(item => {
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'pending' && item.status === 'pending') ||
                      (selectedTab === 'in_progress' && item.status === 'in_progress')
    const matchesSearch = item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.defectCategory === selectedCategory
    const matchesSeverity = selectedSeverity === 'all' || item.severity === selectedSeverity
    return matchesTab && matchesSearch && matchesCategory && matchesSeverity
  })

  const stats = {
    pending: mockReworkItems.filter(i => i.status === 'pending').length,
    inProgress: mockReworkItems.filter(i => i.status === 'in_progress').length,
    critical: mockReworkItems.filter(i => i.severity === 'critical').length,
    avgQueueTime: (mockReworkItems.reduce((acc, i) => acc + i.hoursInQueue, 0) / mockReworkItems.length).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-theme-text-primary">Rework Queue</h1>
            <p className="text-theme-text-tertiary mt-1">Manage quality failures and rework assignments</p>
          </div>
          <Button className="bg-theme-brand-primary hover:bg-theme-brand-primary/90">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report Defect
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Pending Rework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-warning">{stats.pending}</div>
              <p className="text-xs text-theme-text-tertiary">Awaiting assignment</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-info">{stats.inProgress}</div>
              <p className="text-xs text-theme-text-tertiary">Being worked on</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-error">{stats.critical}</div>
              <p className="text-xs text-theme-text-tertiary">Require immediate attention</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Avg Queue Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-text-primary">{stats.avgQueueTime}h</div>
              <p className="text-xs text-theme-text-tertiary">Time in queue</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-tertiary w-4 h-4" />
                    <Input
                      placeholder="Search by serial, model, or customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-theme-bg-primary border-theme-border-secondary"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px] bg-theme-bg-primary border-theme-border-secondary">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="cosmetic">Cosmetic</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="acoustic">Acoustic</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="assembly">Assembly</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger className="w-[200px] bg-theme-bg-primary border-theme-border-secondary">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabs */}
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="bg-theme-bg-primary">
                  <TabsTrigger value="all">All ({mockReworkItems.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress ({stats.inProgress})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Rework Items */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const CategoryIcon = defectCategories[item.defectCategory as keyof typeof defectCategories].icon
            const categoryColor = defectCategories[item.defectCategory as keyof typeof defectCategories].color

            return (
              <Card key={item.id} className="bg-theme-bg-secondary border-theme-border-primary">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 ${categoryColor} rounded-lg flex items-center justify-center`}>
                          <CategoryIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-theme-text-primary">{item.serialNumber}</h3>
                            <Badge className={`${severityColors[item.severity as keyof typeof severityColors]}`}>
                              {item.severity}
                            </Badge>
                            {item.priority === 1 && (
                              <Badge variant="outline" className="border-theme-status-error text-theme-status-error">
                                High Priority
                              </Badge>
                            )}
                            {item.status === 'in_progress' && (
                              <Badge className="bg-theme-status-info text-white">
                                In Progress
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-theme-text-tertiary">
                            <span>{item.model}</span>
                            <span>•</span>
                            <span>{item.orderNumber}</span>
                            <span>•</span>
                            <span>{item.customer}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.photos.length > 0 && (
                          <Button variant="ghost" size="sm">
                            <Camera className="w-4 h-4" />
                            <span className="ml-1">{item.photos.length}</span>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Defect Details */}
                    <div className="bg-theme-bg-primary rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div>
                            <span className="text-sm font-medium text-theme-text-tertiary">Defect: </span>
                            <span className="text-sm text-theme-text-primary">{item.defectType}</span>
                          </div>
                          <p className="text-sm text-theme-text-primary">{item.description}</p>
                          <div className="flex items-center gap-4 text-sm text-theme-text-tertiary">
                            <span>Reported by {item.reportedBy}</span>
                            <span>•</span>
                            <span>{item.reportedAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Workflow Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-theme-text-tertiary">From: </span>
                          <span className="font-medium text-theme-text-primary">{item.fromStage}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-theme-text-tertiary" />
                        <div className="text-sm">
                          <span className="text-theme-text-tertiary">To: </span>
                          <span className="font-medium text-theme-text-primary">{item.targetStage}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-theme-text-tertiary" />
                          <span className="text-theme-text-tertiary">In queue: </span>
                          <span className={item.hoursInQueue > 12 ? 'text-theme-status-warning' : 'text-theme-text-primary'}>
                            {item.hoursInQueue}h
                          </span>
                        </div>
                        {item.assignedTo ? (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-theme-text-tertiary" />
                            <span className="text-theme-text-primary">{item.assignedTo}</span>
                          </div>
                        ) : (
                          <Button size="sm" className="bg-theme-brand-primary hover:bg-theme-brand-primary/90">
                            Assign Worker
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {item.status === 'in_progress' && (
                      <div className="flex items-center justify-between pt-2 border-t border-theme-border-primary">
                        <div className="text-sm text-theme-text-tertiary">
                          Started at {item.startedAt}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-theme-status-error text-theme-status-error">
                            <XCircle className="w-4 h-4 mr-2" />
                            Fail QC
                          </Button>
                          <Button variant="outline" size="sm" className="border-theme-status-success text-theme-status-success">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Pass QC
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Defect Trends */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-primary">Defect Trends</CardTitle>
            <CardDescription className="text-theme-text-tertiary">
              Most common defects this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-theme-status-info/20 rounded flex items-center justify-center">
                    <Camera className="w-4 h-4 text-theme-status-info" />
                  </div>
                  <div>
                    <div className="font-medium text-theme-text-primary">Finish Defects</div>
                    <div className="text-sm text-theme-text-tertiary">Cosmetic category</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-theme-text-primary">18</span>
                  <TrendingUp className="w-4 h-4 text-theme-status-error" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-theme-status-warning/20 rounded flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-theme-status-warning" />
                  </div>
                  <div>
                    <div className="font-medium text-theme-text-primary">Driver Issues</div>
                    <div className="text-sm text-theme-text-tertiary">Acoustic category</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-theme-text-primary">12</span>
                  <TrendingUp className="w-4 h-4 text-theme-status-warning" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-theme-status-error/20 rounded flex items-center justify-center">
                    <Package className="w-4 h-4 text-theme-status-error" />
                  </div>
                  <div>
                    <div className="font-medium text-theme-text-primary">Misalignment</div>
                    <div className="text-sm text-theme-text-tertiary">Structural category</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-theme-text-primary">8</span>
                  <TrendingUp className="w-4 h-4 text-theme-status-success rotate-180" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}