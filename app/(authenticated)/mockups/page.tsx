import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  Calendar, 
  AlertTriangle, 
  TreePine, 
  Smartphone, 
  BarChart3,
  ArrowRight
} from 'lucide-react'

const mockups = [
  {
    title: 'Build Tracker Dashboard',
    description: 'Track individual headphone builds with serial numbers and real-time status',
    icon: Package,
    href: '/mockups/build-tracker',
    color: 'bg-theme-brand-primary'
  },
  {
    title: 'Batch Scheduler',
    description: 'Schedule and manage production batches with drag-drop calendar interface',
    icon: Calendar,
    href: '/mockups/batch-scheduler',
    color: 'bg-theme-status-info'
  },
  {
    title: 'Rework Queue',
    description: 'Manage quality failures and rework assignments with defect categorization',
    icon: AlertTriangle,
    href: '/mockups/rework-queue',
    color: 'bg-theme-status-error'
  },
  {
    title: 'Inventory Management',
    description: 'Track wood stock and component inventory with reorder alerts',
    icon: TreePine,
    href: '/mockups/inventory',
    color: 'bg-theme-status-success'
  },
  {
    title: 'Worker Mobile UI',
    description: 'Touch-optimized interface for production floor workers',
    icon: Smartphone,
    href: '/mockups/worker-mobile',
    color: 'bg-theme-status-warning'
  },
  {
    title: 'Production Planning',
    description: 'Capacity planning, bottleneck analysis, and performance optimization',
    icon: BarChart3,
    href: '/mockups/production-planning',
    color: 'bg-purple-500'
  }
]

export default function MockupsIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-theme-text-primary mb-4">
            ZMF Production Dashboard Mockups
          </h1>
          <p className="text-xl text-theme-text-tertiary max-w-3xl mx-auto">
            Visual design mockups for the new production management features. 
            These interfaces address the critical gaps identified in the system analysis.
          </p>
        </div>

        {/* Mockup Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockups.map((mockup) => {
            const Icon = mockup.icon
            return (
              <Link key={mockup.href} href={mockup.href}>
                <Card className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-border-secondary transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${mockup.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-theme-text-primary text-lg flex items-center gap-2">
                          {mockup.title}
                          <ArrowRight className="w-4 h-4 text-theme-text-tertiary" />
                        </CardTitle>
                        <CardDescription className="text-theme-text-tertiary mt-1">
                          {mockup.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Key Features Section */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-2xl text-theme-text-primary">Key Features Addressed</CardTitle>
            <CardDescription className="text-theme-text-tertiary">
              Critical functionality gaps these mockups solve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-theme-text-primary">Production Tracking</h3>
                <ul className="space-y-2 text-sm text-theme-text-tertiary">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-theme-brand-primary rounded-full mt-1.5 flex-shrink-0" />
                    Individual build tracking with serial numbers
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-theme-brand-primary rounded-full mt-1.5 flex-shrink-0" />
                    Real-time stage progression monitoring
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-theme-brand-primary rounded-full mt-1.5 flex-shrink-0" />
                    Batch scheduling and capacity planning
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-theme-brand-primary rounded-full mt-1.5 flex-shrink-0" />
                    WIP limits and bottleneck detection
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-theme-text-primary">Quality & Inventory</h3>
                <ul className="space-y-2 text-sm text-theme-text-tertiary">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-theme-brand-primary rounded-full mt-1.5 flex-shrink-0" />
                    Defect categorization and rework queue
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-theme-brand-primary rounded-full mt-1.5 flex-shrink-0" />
                    Quality gates between stages
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-theme-brand-primary rounded-full mt-1.5 flex-shrink-0" />
                    Wood and component inventory tracking
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-theme-brand-primary rounded-full mt-1.5 flex-shrink-0" />
                    Automated reorder alerts
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-xl text-theme-text-primary">Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-theme-bg-primary rounded-lg border border-theme-border-secondary">
              <h4 className="font-medium text-theme-text-primary mb-2">Phase 1 Complete ✅</h4>
              <p className="text-sm text-theme-text-tertiary">
                Database schema with all required tables has been created. Visual mockups demonstrate 
                how the new features will work. Ready to proceed with implementation.
              </p>
            </div>
            <div className="p-4 bg-theme-brand-primary/10 rounded-lg border border-theme-brand-primary/20">
              <h4 className="font-medium text-theme-text-primary mb-2">Next Steps</h4>
              <p className="text-sm text-theme-text-tertiary">
                Phase 2 will implement these interfaces with real data connections. Priority should be 
                given to build tracking and rework flows as they address the most critical gaps.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}