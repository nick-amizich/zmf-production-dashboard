'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  Settings,
  Truck,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface MainDashboardProps {
  userRole: 'employee' | 'worker'
  userData: {
    id: string
    name: string
    email: string
    role: string
  }
}

export function MainDashboard({ userRole, userData }: MainDashboardProps) {
  const router = useRouter()

  const dashboardCards = [
    {
      title: 'Production',
      description: 'Manage batches and production pipeline',
      icon: Package,
      href: '/production',
      color: 'text-theme-status-info',
      bgColor: 'bg-theme-status-info/10',
      stats: { label: 'Active Batches', value: '12' }
    },
    {
      title: 'Quality Control',
      description: 'Review and manage quality checks',
      icon: ClipboardCheck,
      href: '/quality',
      color: 'text-theme-status-success',
      bgColor: 'bg-theme-status-success/10',
      stats: { label: 'Pending QC', value: '5' }
    },
    {
      title: 'Workers',
      description: 'Manage worker assignments and schedules',
      icon: Users,
      href: '/workers',
      color: 'text-theme-brand-primary',
      bgColor: 'bg-theme-brand-primary/10',
      stats: { label: 'Active Workers', value: '24' }
    },
    {
      title: 'Orders',
      description: 'Create and manage customer orders',
      icon: FileText,
      href: '/orders',
      color: 'text-theme-status-warning',
      bgColor: 'bg-theme-status-warning/10',
      stats: { label: 'Pending Orders', value: '18' }
    },
    {
      title: 'Reports',
      description: 'View analytics and performance metrics',
      icon: BarChart3,
      href: '/reports',
      color: 'text-theme-brand-secondary',
      bgColor: 'bg-theme-brand-secondary/10',
      stats: { label: 'This Week', value: '→' }
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: Settings,
      href: '/settings',
      color: 'text-theme-text-tertiary',
      bgColor: 'bg-theme-text-tertiary/10',
      stats: { label: 'Configure', value: '→' }
    }
  ]

  // Quick stats for the header
  const quickStats = [
    { label: 'Total Active Batches', value: '12', icon: Package, status: 'active' },
    { label: 'Orders in Queue', value: '18', icon: Clock, status: 'pending' },
    { label: 'Completed Today', value: '7', icon: CheckCircle, status: 'success' },
    { label: 'Quality Issues', value: '2', icon: AlertCircle, status: 'warning' }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {userData.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/production/calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button 
                onClick={() => router.push('/orders/new')}
              >
                <Package className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${
                    stat.status === 'active' ? 'text-theme-status-info' :
                    stat.status === 'pending' ? 'text-theme-status-warning' :
                    stat.status === 'success' ? 'text-theme-status-success' :
                    'text-theme-status-warning'
                  }`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => (
            <Card 
              key={card.title}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(card.href)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  {card.stats && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{card.stats.label}</p>
                      <p className="text-xl font-semibold">{card.stats.value}</p>
                    </div>
                  )}
                </div>
                <CardTitle className="mt-4">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-start">
                  View {card.title}
                  <Truck className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from the production floor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-theme-status-success" />
                  <div className="flex-1">
                    <p className="font-medium">Batch B20250114-001 completed QC</p>
                    <p className="text-sm text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                  <Package className="h-5 w-5 text-theme-status-info" />
                  <div className="flex-1">
                    <p className="font-medium">New batch B20250114-002 created</p>
                    <p className="text-sm text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                  <AlertCircle className="h-5 w-5 text-theme-status-warning" />
                  <div className="flex-1">
                    <p className="font-medium">Quality issue reported on B20250113-005</p>
                    <p className="text-sm text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}