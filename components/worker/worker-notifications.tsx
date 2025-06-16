'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Package,
  Calendar,
  Trophy,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from '@/hooks/use-toast'

import { logger } from '@/lib/logger'
interface WorkerNotificationsProps {
  notifications: Array<{
    id: string
    type: string
    title: string
    message: string
    is_read: boolean
    created_at: string
    data?: any
  }>
  workerId: string
}

const NOTIFICATION_ICONS = {
  assignment: Package,
  achievement: Trophy,
  schedule: Calendar,
  quality: CheckCircle,
  alert: AlertCircle,
  info: Info,
}

const NOTIFICATION_COLORS = {
  assignment: 'text-theme-status-info',
  achievement: 'text-yellow-500',
  schedule: 'text-purple-500',
  quality: 'text-theme-status-success',
  alert: 'text-theme-status-error',
  info: 'text-theme-text-tertiary',
}

export function WorkerNotifications({ notifications, workerId }: WorkerNotificationsProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications)
  const [markingRead, setMarkingRead] = useState<string | null>(null)

  const handleMarkRead = async (notificationId: string) => {
    setMarkingRead(notificationId)
    try {
      const response = await fetch(`/api/worker/notifications/${notificationId}/read`, {
        method: 'PUT',
      })

      if (response.ok) {
        setLocalNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        )
      }
    } catch (error) {
      logger.error('Error marking notification as read:', error)
    } finally {
      setMarkingRead(null)
    }
  }

  const markAllRead = async () => {
    try {
      const response = await fetch('/api/worker/notifications/read-all', {
        method: 'PUT',
      })

      if (response.ok) {
        setLocalNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        )
        toast({
          title: 'Success',
          description: 'All notifications marked as read',
        })
      }
    } catch (error) {
      logger.error('Error marking all as read:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      })
    }
  }

  const unreadCount = localNotifications.filter(n => !n.is_read).length

  if (localNotifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No Notifications</p>
          <p className="text-sm text-muted-foreground">
            You&apos;re all caught up!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
          >
            Mark all as read
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {localNotifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type as keyof typeof NOTIFICATION_ICONS] || Bell
                const iconColor = NOTIFICATION_COLORS[notification.type as keyof typeof NOTIFICATION_COLORS] || 'text-theme-text-tertiary'
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.is_read 
                        ? 'bg-zinc-900/50 border-zinc-800' 
                        : 'bg-zinc-900 border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            
                            {notification.data && (
                              <div className="mt-2">
                                {notification.type === 'assignment' && notification.data.batchNumber && (
                                  <Badge variant="outline">
                                    Batch {notification.data.batchNumber}
                                  </Badge>
                                )}
                                {notification.type === 'achievement' && notification.data.achievement && (
                                  <Badge variant="secondary">
                                    🏆 {notification.data.achievement}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </div>
                          </div>
                          
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkRead(notification.id)}
                              disabled={markingRead === notification.id}
                            >
                              {markingRead === notification.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}