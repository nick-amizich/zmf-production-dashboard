'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  CheckCircle, 
  Clock, 
  Menu, 
  Package, 
  Bell,
  Home,
  Calendar,
  User,
  ChevronRight,
  X
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from '@/hooks/use-toast'

import { logger } from '@/lib/logger'
interface MobileWorkerInterfaceProps {
  worker: any
  assignments: any[]
  notifications: any[]
}

export function MobileWorkerInterface({ 
  worker, 
  assignments, 
  notifications 
}: MobileWorkerInterfaceProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const unreadNotifications = notifications.filter(n => !n.is_read).length

  const handleQuickComplete = async (assignment: any) => {
    setIsCompleting(true)
    try {
      const response = await fetch(`/api/worker/assignments/${assignment.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '' }),
      })

      if (response.ok) {
        toast({
          title: '✅ Task Completed',
          description: 'Great job!',
        })
        // Refresh the page
        window.location.reload()
      }
    } catch (error) {
      logger.error('Error completing assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to complete task',
        variant: 'destructive',
      })
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary text-theme-text-primary pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Hi, {worker.name.split(' ')[0]}!</h1>
          <div className="flex items-center gap-3">
            {unreadNotifications > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadNotifications}
              </Badge>
            )}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  <a href="/worker/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </a>
                  <a href="/worker/dashboard#schedule" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800">
                    <Calendar className="h-5 w-5" />
                    <span>Schedule</span>
                  </a>
                  <a href="/worker/dashboard#notifications" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                    {unreadNotifications > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </a>
                  <a href="/login" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 text-theme-status-error">
                    <User className="h-5 w-5" />
                    <span>Logout</span>
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{assignments.length}</p>
              <p className="text-sm text-zinc-400">Active Tasks</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">95%</p>
              <p className="text-sm text-zinc-400">Quality Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Assignments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Tasks</h2>
          
          {assignments.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-theme-status-success mx-auto mb-4" />
                <p className="text-lg">All caught up!</p>
                <p className="text-sm text-zinc-400 mt-1">
                  No active tasks right now
                </p>
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card 
                key={assignment.id} 
                className="bg-zinc-900 border-zinc-800 overflow-hidden"
                onClick={() => setSelectedAssignment(assignment)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-zinc-400" />
                      <CardTitle className="text-base">
                        {assignment.stage}
                      </CardTitle>
                    </div>
                    <Badge variant="outline">
                      Batch {assignment.batch?.batch_number}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-zinc-400">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(assignment.assigned_at), { addSuffix: true })}
                    </div>
                    
                    {assignment.batch?.batch_orders?.map((bo: any) => (
                      <div key={bo.id} className="text-sm">
                        {bo.order?.model?.name} - Qty: {bo.order?.quantity}
                      </div>
                    ))}
                    
                    <Button 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickComplete(assignment)
                      }}
                      disabled={isCompleting}
                    >
                      {isCompleting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Completing...
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Updates</h2>
              <a href="/worker/dashboard#notifications" className="text-sm text-theme-status-info">
                View all
              </a>
            </div>
            
            {notifications.slice(0, 3).map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 rounded-lg ${
                  notification.is_read ? 'bg-zinc-900/50' : 'bg-zinc-900'
                } border border-zinc-800`}
              >
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-xs text-zinc-400 mt-1">{notification.message}</p>
                <p className="text-xs text-zinc-500 mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800">
        <div className="grid grid-cols-4 h-16">
          <a href="/worker/mobile" className="flex flex-col items-center justify-center gap-1 text-theme-status-info">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </a>
          <a href="/worker/dashboard#assignments" className="flex flex-col items-center justify-center gap-1 text-zinc-400">
            <Package className="h-5 w-5" />
            <span className="text-xs">Tasks</span>
          </a>
          <a href="/worker/dashboard#schedule" className="flex flex-col items-center justify-center gap-1 text-zinc-400">
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Schedule</span>
          </a>
          <a href="/worker/dashboard#notifications" className="flex flex-col items-center justify-center gap-1 text-zinc-400 relative">
            <Bell className="h-5 w-5" />
            <span className="text-xs">Alerts</span>
            {unreadNotifications > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-theme-status-error rounded-full" />
            )}
          </a>
        </div>
      </nav>

      {/* Assignment Detail Sheet */}
      {selectedAssignment && (
        <div 
          className="fixed inset-0 bg-theme-bg-primary/50 z-50 flex items-end"
          onClick={() => setSelectedAssignment(null)}
        >
          <div 
            className="bg-zinc-900 w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Task Details</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedAssignment(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400">Stage</p>
                <p className="text-lg font-medium">{selectedAssignment.stage}</p>
              </div>
              
              <div>
                <p className="text-sm text-zinc-400">Batch</p>
                <p className="text-lg font-medium">{selectedAssignment.batch?.batch_number}</p>
              </div>
              
              <div>
                <p className="text-sm text-zinc-400">Orders</p>
                {selectedAssignment.batch?.batch_orders?.map((bo: any) => (
                  <div key={bo.id} className="mt-2 p-3 bg-zinc-800 rounded-lg">
                    <p className="font-medium">{bo.order?.model?.name}</p>
                    <p className="text-sm text-zinc-400">
                      Customer: {bo.order?.customer?.name}
                    </p>
                    <p className="text-sm text-zinc-400">
                      Quantity: {bo.order?.quantity}
                    </p>
                  </div>
                ))}
              </div>
              
              {selectedAssignment.notes && (
                <div>
                  <p className="text-sm text-zinc-400">Special Instructions</p>
                  <p className="mt-1 p-3 bg-yellow-900/20 text-yellow-500 rounded-lg">
                    {selectedAssignment.notes}
                  </p>
                </div>
              )}
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleQuickComplete(selectedAssignment)}
                disabled={isCompleting}
              >
                {isCompleting ? 'Completing...' : 'Complete Task'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}