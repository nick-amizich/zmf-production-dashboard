'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Award,
  Package,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

interface WorkerDetailModalProps {
  worker: any
  assignments: any[]
  onClose: () => void
}

export function WorkerDetailModal({ worker, assignments, onClose }: WorkerDetailModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Worker Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center">
              <User className="h-10 w-10 text-zinc-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{worker.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge>{worker.role}</Badge>
                <Badge variant={worker.is_active ? 'default' : 'destructive'}>
                  {worker.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {worker.email}
                </div>
                {worker.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {worker.phone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Joined {format(new Date(worker.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>

          {/* Specializations */}
          {worker.specializations && worker.specializations.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {worker.specializations.map((spec: string) => (
                  <Badge key={spec} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Active Assignments */}
          <div>
            <h4 className="font-medium mb-2">Active Assignments ({assignments.length})</h4>
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active assignments</p>
            ) : (
              <div className="space-y-2">
                {assignments.map(assignment => (
                  <Card key={assignment.id} className="bg-zinc-900">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{assignment.stage}</span>
                          <span className="text-sm text-muted-foreground">
                            - Batch {assignment.batch?.batch_number}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(assignment.assigned_at), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Performance Stats */}
          <div>
            <h4 className="font-medium mb-2">Recent Performance</h4>
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-zinc-900">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">95%</p>
                  <p className="text-sm text-muted-foreground">Quality Rate</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">8.5</p>
                  <p className="text-sm text-muted-foreground">Units/Day</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}