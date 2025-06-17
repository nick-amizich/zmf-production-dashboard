'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  Play, 
  Pause, 
  CheckCircle, 
  Camera, 
  Package, 
  AlertTriangle,
  Wrench,
  Coffee,
  LogOut,
  ChevronRight,
  Zap,
  Timer,
  ClipboardCheck,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for worker dashboard
const mockActiveTask = {
  buildId: 'b1',
  serialNumber: 'ATT-24-00098',
  model: 'Atticus',
  stage: 'Final Assembly',
  startedAt: '10:30 AM',
  elapsedTime: '2h 15m',
  checklistCompleted: 3,
  checklistTotal: 8,
  priority: 'normal'
}

const mockUpcomingTasks = [
  {
    id: '1',
    serialNumber: 'VER-24-00045',
    model: 'Verite Closed',
    stage: 'Final Assembly',
    priority: 'high',
    estimatedTime: '3h'
  },
  {
    id: '2',
    serialNumber: 'EIK-24-00023',
    model: 'Eikon',
    stage: 'Sub-Assembly',
    priority: 'normal',
    estimatedTime: '2.5h'
  }
]

const mockRecentCompleted = [
  {
    id: '1',
    serialNumber: 'CAL-24-00007',
    stage: 'Sanding',
    completedAt: '9:15 AM',
    duration: '1h 45m'
  },
  {
    id: '2',
    serialNumber: 'AUT-24-00011',
    stage: 'Finishing',
    completedAt: 'Yesterday',
    duration: '2h 30m'
  }
]

const mockStats = {
  todayCompleted: 3,
  todayHours: 5.5,
  weekCompleted: 18,
  qualityScore: 98
}

export default function WorkerMobileMockup() {
  const [isTracking, setIsTracking] = useState(true)
  const [currentView, setCurrentView] = useState<'home' | 'task' | 'checklist'>('home')

  const MobileFrame = ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-md mx-auto">
      <div className="bg-theme-bg-primary rounded-[3rem] p-4 shadow-2xl">
        <div className="bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary rounded-[2.5rem] overflow-hidden">
          {/* Status Bar */}
          <div className="bg-theme-bg-primary px-6 py-2 flex items-center justify-between text-xs">
            <span className="text-theme-text-primary font-medium">9:41 AM</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-sm bg-theme-text-primary" />
              <div className="w-4 h-4 rounded-sm bg-theme-text-primary" />
              <div className="w-4 h-4 rounded-sm bg-theme-text-primary" />
            </div>
          </div>
          
          {/* Content */}
          <div className="min-h-[812px] pb-20">
            {children}
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-8">
            <div className="bg-theme-bg-secondary rounded-full px-6 py-3 flex items-center justify-around shadow-lg border border-theme-border-primary">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-full", currentView === 'home' && "bg-theme-brand-primary text-white")}
                onClick={() => setCurrentView('home')}
              >
                <Home className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-full", currentView === 'task' && "bg-theme-brand-primary text-white")}
                onClick={() => setCurrentView('task')}
              >
                <Package className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-full", currentView === 'checklist' && "bg-theme-brand-primary text-white")}
                onClick={() => setCurrentView('checklist')}
              >
                <ClipboardCheck className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                <Coffee className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const HomeView = () => (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Hi, Mike 👋</h1>
          <p className="text-theme-text-tertiary">Friday, January 19</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <LogOut className="w-5 h-5 text-theme-text-tertiary" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-theme-status-success" />
              <span className="text-sm text-theme-text-tertiary">Today</span>
            </div>
            <div className="text-2xl font-bold text-theme-text-primary">{mockStats.todayCompleted}</div>
            <div className="text-xs text-theme-text-tertiary">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-theme-brand-primary" />
              <span className="text-sm text-theme-text-tertiary">Hours</span>
            </div>
            <div className="text-2xl font-bold text-theme-text-primary">{mockStats.todayHours}</div>
            <div className="text-xs text-theme-text-tertiary">Worked</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Task */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="text-lg text-theme-text-primary flex items-center justify-between">
            Current Task
            {isTracking ? (
              <Badge className="bg-theme-status-success text-white">
                <Timer className="w-3 h-3 mr-1" />
                Tracking
              </Badge>
            ) : (
              <Badge className="bg-theme-text-tertiary text-white">
                Paused
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-theme-text-primary">{mockActiveTask.serialNumber}</h3>
                <p className="text-sm text-theme-text-tertiary">{mockActiveTask.model} • {mockActiveTask.stage}</p>
              </div>
              <Badge variant="outline" className="text-theme-text-tertiary">
                {mockActiveTask.priority}
              </Badge>
            </div>
            <div className="text-sm text-theme-text-tertiary">
              Started at {mockActiveTask.startedAt} • {mockActiveTask.elapsedTime}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-theme-text-tertiary">Checklist Progress</span>
              <span className="text-theme-text-primary">
                {mockActiveTask.checklistCompleted}/{mockActiveTask.checklistTotal}
              </span>
            </div>
            <Progress 
              value={(mockActiveTask.checklistCompleted / mockActiveTask.checklistTotal) * 100} 
              className="h-2"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-theme-brand-primary hover:bg-theme-brand-primary/90"
              onClick={() => setIsTracking(!isTracking)}
            >
              {isTracking ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-theme-border-secondary"
              onClick={() => setCurrentView('checklist')}
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Checklist
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-between border-theme-border-secondary"
          onClick={() => setCurrentView('task')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-theme-brand-primary/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-theme-brand-primary" />
            </div>
            <div className="text-left">
              <div className="font-medium text-theme-text-primary">View Queue</div>
              <div className="text-sm text-theme-text-tertiary">2 tasks waiting</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-theme-text-tertiary" />
        </Button>

        <Button variant="outline" className="w-full justify-between border-theme-border-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-theme-status-error/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-theme-status-error" />
            </div>
            <div className="text-left">
              <div className="font-medium text-theme-text-primary">Report Issue</div>
              <div className="text-sm text-theme-text-tertiary">Quality or defect</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-theme-text-tertiary" />
        </Button>
      </div>
    </div>
  )

  const TaskView = () => (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-theme-text-primary">My Tasks</h2>
        <p className="text-theme-text-tertiary">Assigned to you</p>
      </div>

      {/* Upcoming Tasks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-theme-text-primary">Up Next</h3>
        {mockUpcomingTasks.map((task) => (
          <Card key={task.id} className="bg-theme-bg-secondary border-theme-border-primary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-theme-text-primary">{task.serialNumber}</h4>
                  <p className="text-sm text-theme-text-tertiary">{task.model}</p>
                </div>
                {task.priority === 'high' && (
                  <Badge className="bg-theme-status-error text-white">High</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-theme-text-tertiary">
                  <Wrench className="w-4 h-4" />
                  <span>{task.stage}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-theme-text-tertiary">
                  <Clock className="w-4 h-4" />
                  <span>~{task.estimatedTime}</span>
                </div>
              </div>
              <Button className="w-full mt-3 bg-theme-brand-primary hover:bg-theme-brand-primary/90">
                <Zap className="w-4 h-4 mr-2" />
                Start Task
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Completed */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-theme-text-primary">Recently Completed</h3>
        {mockRecentCompleted.map((task) => (
          <Card key={task.id} className="bg-theme-bg-primary border-theme-border-secondary opacity-75">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-theme-text-primary">{task.serialNumber}</h4>
                  <p className="text-sm text-theme-text-tertiary">{task.stage} • {task.duration}</p>
                </div>
                <div className="text-sm text-theme-text-tertiary">
                  {task.completedAt}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const ChecklistView = () => (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-theme-text-primary">Quality Checklist</h2>
        <p className="text-theme-text-tertiary">{mockActiveTask.stage} • {mockActiveTask.serialNumber}</p>
      </div>

      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardContent className="p-4 space-y-3">
          {[
            { id: 1, item: 'Driver alignment verified', completed: true },
            { id: 2, item: 'Cable routing correct', completed: true },
            { id: 3, item: 'Solder joints inspected', completed: true },
            { id: 4, item: 'Chassis screws torqued', completed: false },
            { id: 5, item: 'Damping material placed', completed: false },
            { id: 6, item: 'Serial number attached', completed: false },
            { id: 7, item: 'Initial sound test', completed: false },
            { id: 8, item: 'Visual inspection passed', completed: false }
          ].map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className={cn(
                "w-full justify-start text-left",
                item.completed 
                  ? "border-theme-status-success bg-theme-status-success/10" 
                  : "border-theme-border-secondary"
              )}
            >
              {item.completed ? (
                <CheckCircle className="w-5 h-5 mr-3 text-theme-status-success" />
              ) : (
                <div className="w-5 h-5 mr-3 rounded-full border-2 border-theme-border-secondary" />
              )}
              <span className={cn(
                "text-sm",
                item.completed ? "text-theme-text-primary line-through" : "text-theme-text-primary"
              )}>
                {item.item}
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button className="w-full bg-theme-brand-primary hover:bg-theme-brand-primary/90">
          <Camera className="w-4 h-4 mr-2" />
          Add Photos
        </Button>
        <Button variant="outline" className="w-full border-theme-status-success text-theme-status-success">
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete Stage
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6 overflow-x-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-theme-text-primary">Worker Mobile Interface</h1>
        <p className="text-theme-text-tertiary">Touch-optimized for production floor use</p>
      </div>
      
      <MobileFrame>
        {currentView === 'home' && <HomeView />}
        {currentView === 'task' && <TaskView />}
        {currentView === 'checklist' && <ChecklistView />}
      </MobileFrame>

      <div className="text-center mt-6 text-sm text-theme-text-tertiary">
        <p>Swipe between views or use the bottom navigation</p>
      </div>
    </div>
  )
}