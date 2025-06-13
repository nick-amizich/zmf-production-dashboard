'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  CheckCircle, 
  Clock, 
  Package, 
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from '@/hooks/use-toast'

import { logger } from '@/lib/logger'
interface WorkerAssignmentsProps {
  assignments: any[]
  workerId: string
}

export function WorkerAssignments({ assignments, workerId }: WorkerAssignmentsProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    if (!selectedAssignment) return

    setIsCompleting(true)
    try {
      const response = await fetch(`/api/worker/assignments/${selectedAssignment.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: completionNotes }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Assignment completed successfully',
        })
        setSelectedAssignment(null)
        setCompletionNotes('')
        // Refresh the page to update assignments
        window.location.reload()
      }
    } catch (error) {
      logger.error('Error completing assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to complete assignment',
        variant: 'destructive',
      })
    } finally {
      setIsCompleting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'rush': return 'warning'
      default: return 'secondary'
    }
  }

  const getStageIcon = (stage: string) => {
    // You could have different icons per stage
    return <Package className="h-4 w-4" />
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-theme-status-success mb-4" />
          <p className="text-lg font-medium">No Active Assignments</p>
          <p className="text-sm text-muted-foreground">
            You're all caught up! Check back later for new tasks.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {assignments.map((assignment) => {
          const batch = assignment.batch
          const orders = batch?.batch_orders || []
          
          return (
            <Card key={assignment.id} className="hover:bg-zinc-900/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStageIcon(assignment.stage)}
                      <CardTitle className="text-lg">
                        {assignment.stage} - Batch {batch?.batch_number}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Assigned {formatDistanceToNow(new Date(assignment.assigned_at), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(batch?.priority || 'normal')}>
                    {batch?.priority || 'normal'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Orders in batch */}
                  <div>
                    <p className="text-sm font-medium mb-2">Orders in this batch:</p>
                    <div className="space-y-1">
                      {orders.map((batchOrder: any) => (
                        <div key={batchOrder.id} className="flex items-center justify-between text-sm">
                          <span>
                            {batchOrder.order?.model?.name} - {batchOrder.order?.customer?.name}
                          </span>
                          <Badge variant="outline">
                            Qty: {batchOrder.order?.quantity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special instructions */}
                  {assignment.notes && (
                    <div className="p-3 bg-zinc-900 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-yellow-500 mb-1">
                        <AlertCircle className="h-3 w-3" />
                        Special Instructions
                      </div>
                      <p className="text-sm">{assignment.notes}</p>
                    </div>
                  )}

                  {/* Action button */}
                  <Button 
                    className="w-full"
                    onClick={() => setSelectedAssignment(assignment)}
                  >
                    Mark as Complete
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Completion Dialog */}
      <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Assignment Details</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedAssignment?.stage} - Batch {selectedAssignment?.batch?.batch_number}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Completion Notes (Optional)</label>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Any notes about the completed work..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedAssignment(null)
                  setCompletionNotes('')
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={isCompleting}
              >
                {isCompleting ? 'Completing...' : 'Complete Assignment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}