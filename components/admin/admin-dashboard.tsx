'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Settings, 
  Shield, 
  Activity, 
  Database,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Lock,
  Key,
  UserPlus,
  Trash2,
  Edit,
  Palette
} from 'lucide-react'
import Link from 'next/link'
import { ThemePreview } from '@/components/theme-switcher'

interface AdminDashboardProps {
  stats: {
    totalWorkers: number
    totalOrders: number
    activeOrders: number
    pendingApprovals: number
    systemHealth: 'operational' | 'degraded' | 'down'
  }
  recentActivity: any[]
}

export function AdminDashboard({ stats, recentActivity }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'operational':
        return 'text-theme-status-success'
      case 'degraded':
        return 'text-yellow-500'
      case 'down':
        return 'text-theme-status-error'
      default:
        return 'text-theme-text-tertiary'
    }
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-text-primary">System Administration</h1>
            <p className="text-zinc-400 mt-1">
              Manage users, settings, and system configuration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={getHealthColor(stats.systemHealth)}>
              <Activity className="h-3 w-3 mr-1" />
              System {stats.systemHealth}
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
            <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Workers</p>
                      <p className="text-3xl font-bold">{stats.totalWorkers}</p>
                    </div>
                    <Users className="h-8 w-8 text-theme-status-info" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-3xl font-bold">{stats.totalOrders}</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Orders</p>
                      <p className="text-3xl font-bold">{stats.activeOrders}</p>
                    </div>
                    <Activity className="h-8 w-8 text-theme-status-success" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Database Size</p>
                      <p className="text-3xl font-bold">2.4 GB</p>
                    </div>
                    <Database className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className={stats.pendingApprovals > 0 ? "border-theme-status-error" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Approvals</p>
                      <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
                    </div>
                    <Shield className={`h-8 w-8 ${stats.pendingApprovals > 0 ? 'text-theme-status-error' : 'text-gray-500'}`} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
                <CardDescription>Latest administrative actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            activity.action_type === 'create' ? 'bg-theme-status-success/10' :
                            activity.action_type === 'update' ? 'bg-theme-status-info/10' :
                            activity.action_type === 'delete' ? 'bg-theme-status-error/10' :
                            'bg-gray-500/10'
                          }`}>
                            {activity.action_type === 'create' && <UserPlus className="h-4 w-4 text-theme-status-success" />}
                            {activity.action_type === 'update' && <Edit className="h-4 w-4 text-theme-status-info" />}
                            {activity.action_type === 'delete' && <Trash2 className="h-4 w-4 text-theme-status-error" />}
                          </div>
                          <div>
                            <p className="font-medium">{activity.description}</p>
                            <p className="text-sm text-muted-foreground">
                              by {activity.user_name} • {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                  </Link>
                  <Link href="/admin/users/new">
                    <Button variant="outline" className="w-full justify-start">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New User
                    </Button>
                  </Link>
                  <Link href="/admin/worker-approvals">
                    <Button variant="outline" className="w-full justify-start relative">
                      <Shield className="h-4 w-4 mr-2" />
                      Worker Approvals
                      {stats.pendingApprovals > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-theme-status-error text-white">
                          {stats.pendingApprovals}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/admin/settings">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </Button>
                  </Link>
                  <Link href="/admin/security">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Security Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <Link href="/admin/users">
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage user accounts, roles, and permissions. Click "Manage Users" to view and edit all users.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <input 
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded"
                      defaultValue="ZMF Headphones"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">System Email</label>
                    <input 
                      className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded"
                      defaultValue="system@zmfheadphones.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Timezone</label>
                    <select className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded">
                      <option>UTC</option>
                      <option>America/New_York</option>
                      <option>America/Chicago</option>
                      <option>America/Los_Angeles</option>
                    </select>
                  </div>
                  <Button className="mt-4">Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Production Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-assign orders</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically assign new orders to available workers
                      </p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Quality checks required</p>
                      <p className="text-sm text-muted-foreground">
                        Require quality checks at each stage
                      </p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Theme Settings
                  </CardTitle>
                  <CardDescription>
                    Customize the appearance of the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ThemePreview />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Require 2FA for all admin accounts
                        </p>
                      </div>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">API Keys</p>
                        <p className="text-sm text-muted-foreground">
                          Manage API keys for external integrations
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Session Timeout</p>
                        <p className="text-sm text-muted-foreground">
                          Auto-logout after inactivity
                        </p>
                      </div>
                    </div>
                    <select className="p-2 bg-zinc-900 border border-zinc-800 rounded">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>Never</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Security Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-theme-status-success" />
                        <span>Successful login from admin@zmf.com</span>
                      </div>
                      <span className="text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span>Failed login attempt from unknown IP</span>
                      </div>
                      <span className="text-muted-foreground">5 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Audit Logs</CardTitle>
                  <Link href="/admin/logs">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View All Logs
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track all system changes and user actions. View detailed audit logs for compliance and security.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup & Restore Tab */}
          <TabsContent value="backup">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Backup Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatic Backups</p>
                      <p className="text-sm text-muted-foreground">
                        Daily backups at 2:00 AM UTC
                      </p>
                    </div>
                    <Badge variant="outline" className="text-theme-status-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-sm font-medium mb-2">Backup Schedule</p>
                    <select className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Retention Period</p>
                    <select className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded">
                      <option>7 days</option>
                      <option>30 days</option>
                      <option>90 days</option>
                    </select>
                  </div>
                  
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Create Manual Backup
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Backups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-900 rounded">
                      <div>
                        <p className="font-medium">backup_2024_01_15_02_00.sql</p>
                        <p className="text-sm text-muted-foreground">2.4 GB • Completed successfully</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-900 rounded">
                      <div>
                        <p className="font-medium">backup_2024_01_14_02_00.sql</p>
                        <p className="text-sm text-muted-foreground">2.3 GB • Completed successfully</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}