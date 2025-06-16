'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RoleSelectionCard } from '@/components/role-selection-card'
import { SystemStatus } from '@/components/system-status'
import { Monitor, Smartphone, Headphones, ArrowRight, BarChart3, Plus, Calendar, Package, Settings } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardClientProps {
  employee: {
    id: string
    role: string
    is_active: boolean
    name: string
    email: string
  }
}

export function DashboardClient({ employee }: DashboardClientProps) {
  const router = useRouter()
  const isManager = employee.role === 'manager' || employee.role === 'admin'
  const isWorker = employee.role === 'worker'

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
      {/* Header */}
      <header className="border-b border-theme-border-primary bg-theme-bg-secondary/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-theme-brand-secondary to-theme-brand-primary rounded-lg flex items-center justify-center">
                <Headphones className="h-8 w-8 text-theme-text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-theme-text-secondary">ZMF Production System</h1>
                <p className="text-theme-text-tertiary text-lg">Premium Headphone Manufacturing Control</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Button variant="outline" className="border-theme-border-primary text-theme-text-secondary hover:bg-theme-brand-secondary/20">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-theme-text-primary mb-4">
            Welcome, {employee.name || 'Team Member'}
          </h2>
          <p className="text-xl text-theme-text-tertiary max-w-2xl mx-auto">
            {isManager ? 'Access your management tools and production oversight interfaces.' : 'Access your work interface and production tools.'}
          </p>
        </div>

        {/* Manager View */}
        {isManager && (
          <>
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Production Dashboard */}
              <RoleSelectionCard
                title="Production Dashboard"
                description="Real-time production pipeline overview"
                icon={Monitor}
                features={[
                  "Live production metrics",
                  "Pipeline stage monitoring",
                  "Worker activity tracking",
                  "Alert management system",
                ]}
                buttonText="Open Dashboard"
                onClick={() => router.push('/production')}
                gradient="bg-gradient-to-br from-theme-brand-secondary to-theme-brand-primary"
              />

              {/* Production Calendar */}
              <RoleSelectionCard
                title="Production Calendar"
                description="Two-week scheduling and worker assignment"
                icon={Calendar}
                features={[
                  "Visual 2-week calendar grid",
                  "Drag-and-drop batch assignment",
                  "Worker capacity management",
                  "Real-time workload balancing",
                ]}
                buttonText="Open Calendar"
                onClick={() => router.push('/production/calendar')}
                gradient="bg-gradient-to-br from-indigo-600 to-theme-status-info"
              />

              {/* Batch Management */}
              <RoleSelectionCard
                title="Batch Management"
                description="Visual workflow control and batch coordination"
                icon={ArrowRight}
                features={[
                  "Drag-and-drop batch workflow",
                  "7-stage production pipeline",
                  "Subassembly management",
                  "Efficiency recommendations",
                ]}
                buttonText="Manage Batches"
                onClick={() => router.push('/batch-management')}
                gradient="bg-gradient-to-br from-theme-status-info to-purple-600"
              />

              {/* Quality Dashboard */}
              <RoleSelectionCard
                title="Quality Control"
                description="Comprehensive quality analytics and monitoring"
                icon={BarChart3}
                features={[
                  "Stage-by-stage quality metrics",
                  "Issue tracking and resolution",
                  "Worker performance analytics",
                  "Quality trend analysis",
                ]}
                buttonText="View Quality Dashboard"
                onClick={() => router.push('/quality')}
                gradient="bg-gradient-to-br from-theme-status-warning to-theme-status-error"
              />

              {/* Order Creator */}
              <RoleSelectionCard
                title="Order Creator"
                description="Create new orders and batch configurations"
                icon={Plus}
                features={[
                  "Manual order entry system",
                  "Batch configuration builder",
                  "Shopify integration sync",
                  "Technician notes and images",
                ]}
                buttonText="Create Orders"
                onClick={() => router.push('/orders/create')}
                gradient="bg-gradient-to-br from-purple-600 to-purple-700"
              />

              {/* Order Management */}
              <RoleSelectionCard
                title="Order Management"
                description="Track and manage customer orders"
                icon={Package}
                features={[
                  "Order status tracking",
                  "Customer information",
                  "Priority management",
                  "Order history and details",
                ]}
                buttonText="Manage Orders"
                onClick={() => router.push('/orders/manage')}
                gradient="bg-gradient-to-br from-theme-status-success to-teal-600"
              />
            </div>

            {/* Quick Access Panel for Managers */}
            <div className="mt-16 max-w-5xl mx-auto">
              <Card className="bg-theme-bg-secondary/50 border-theme-border-primary">
                <CardHeader>
                  <CardTitle className="text-theme-text-secondary text-center">Quick Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <Link href="/production">
                      <Button
                        variant="outline"
                        className="w-full border-theme-border-primary text-theme-text-secondary hover:bg-theme-brand-secondary/20 h-auto py-4 flex flex-col gap-2"
                      >
                        <Monitor className="h-6 w-6" />
                        <span className="text-sm">Dashboard</span>
                      </Button>
                    </Link>
                    <Link href="/production/calendar">
                      <Button
                        variant="outline"
                        className="w-full border-theme-status-info/50 text-theme-status-info hover:bg-theme-status-info/20 h-auto py-4 flex flex-col gap-2"
                      >
                        <Calendar className="h-6 w-6" />
                        <span className="text-sm">Calendar</span>
                      </Button>
                    </Link>
                    <Link href="/batch-management">
                      <Button
                        variant="outline"
                        className="w-full border-theme-status-info/50 text-theme-status-info hover:bg-theme-status-info/20 h-auto py-4 flex flex-col gap-2"
                      >
                        <ArrowRight className="h-6 w-6" />
                        <span className="text-sm">Batches</span>
                      </Button>
                    </Link>
                    <Link href="/quality">
                      <Button
                        variant="outline"
                        className="w-full border-theme-status-warning/50 text-theme-status-warning hover:bg-theme-status-warning/20 h-auto py-4 flex flex-col gap-2"
                      >
                        <BarChart3 className="h-6 w-6" />
                        <span className="text-sm">Quality</span>
                      </Button>
                    </Link>
                    <Link href="/orders/create">
                      <Button
                        variant="outline"
                        className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20 h-auto py-4 flex flex-col gap-2"
                      >
                        <Plus className="h-6 w-6" />
                        <span className="text-sm">Create</span>
                      </Button>
                    </Link>
                    <Link href="/orders/manage">
                      <Button
                        variant="outline"
                        className="w-full border-theme-status-success/50 text-theme-status-success hover:bg-theme-status-success/20 h-auto py-4 flex flex-col gap-2"
                      >
                        <Package className="h-6 w-6" />
                        <span className="text-sm">Orders</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Worker View */}
        {isWorker && (
          <div className="grid lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <RoleSelectionCard
              title="Worker Interface"
              description="Mobile-optimized interface for shop floor workers"
              icon={Smartphone}
              features={[
                "Large touch targets for gloved hands",
                "Stage-specific quality checklists",
                "Photo documentation capture",
                "Timer and productivity tracking",
              ]}
              buttonText="Start Working"
              onClick={() => router.push('/worker/mobile')}
              gradient="bg-gradient-to-br from-theme-status-success to-teal-600"
            />

            {/* Worker features preview */}
            <Card className="bg-theme-bg-secondary/30 border-theme-status-success/20">
              <CardContent className="p-6">
                <h4 className="text-theme-status-success font-semibold mb-3 text-sm uppercase tracking-wide">Optimized For:</h4>
                <div className="space-y-2 text-sm text-theme-text-tertiary">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-theme-status-success rounded-full"></div>
                    <span>Workshop environment with gloves</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-theme-status-success rounded-full"></div>
                    <span>Variable lighting conditions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-theme-status-success rounded-full"></div>
                    <span>Offline capability for connectivity issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-theme-status-success rounded-full"></div>
                    <span>7-stage production workflow</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Status */}
        <div className="mt-16 max-w-md mx-auto">
          <SystemStatus />
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-theme-bg-secondary/50 rounded-lg p-6 max-w-4xl mx-auto border border-theme-border-primary">
            <h3 className="text-xl font-semibold text-theme-text-secondary mb-3">About ZMF Production System</h3>
            <p className="text-theme-text-tertiary leading-relaxed">
              This quality-first production management system manages the complete workflow from raw materials to
              shipping across 7 production stages. Built specifically for ZMF&apos;s premium wooden headphone manufacturing
              process with comprehensive quality control at each stage.
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-theme-text-tertiary">
              <span>7 Production Stages</span>
              <span>•</span>
              <span>15 Skilled Craftspeople</span>
              <span>•</span>
              <span>Premium Quality Focus</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}