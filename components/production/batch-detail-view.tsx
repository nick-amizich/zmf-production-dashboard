'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { 
  Package, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Plus
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface BatchDetailViewProps {
  batch: any
  availableWorkers: any[]
  employeeId: string
}

export function BatchDetailView({ batch, availableWorkers, employeeId }: BatchDetailViewProps) {
  const [selectedWorker, setSelectedWorker] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  const stages = [
    'Intake',
    'Sanding', 
    'Finishing',
    'Sub-Assembly',
    'Final Assembly',
    'Acoustic QC',
    'Shipping'
  ]

  const handleAssignWorker = async (stage: string) => {
    if (!selectedWorker) {
      toast({
        title: 'Error',
        description: 'Please select a worker',
        variant: 'destructive'
      })
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch('/api/production/assign-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batch.id,
          workerId: selectedWorker,
          stage
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Worker assigned successfully'
        })
        window.location.reload()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign worker',
        variant: 'destructive'
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const getStageStatus = (stage: string) => {
    const assignment = batch.stageAssignments?.find((a: any) => a.stage === stage)
    if (!assignment) return 'unassigned'
    if (assignment.completed_at) return 'completed'
    return 'in_progress'
  }

  const getStageAssignment = (stage: string) => {
    return batch.stageAssignments?.find((a: any) => a.stage === stage)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Batch {batch.batch_number}</h1>
          <p className="text-muted-foreground mt-1">
            Created {formatDistanceToNow(new Date(batch.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={batch.priority === 'rush' ? 'destructive' : 'secondary'}>
            {batch.priority} Priority
          </Badge>
          <Badge variant={batch.is_complete ? 'success' : 'default'}>
            {batch.current_stage}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Stage Assignments</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
                  <p className="text-lg font-bold">{batch.total_quantity} units</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quality Status</p>
                  <Badge variant={batch.quality_status === 'good' ? 'success' : 'warning'}>
                    {batch.quality_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Target Completion</p>
                  <p className="text-lg">{batch.target_completion_date ? 
                    new Date(batch.target_completion_date).toLocaleDateString() : 
                    'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Orders</p>
                  <p className="text-lg font-bold">{batch.batch_orders?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Stage Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stages.map((stage, index) => {
                  const status = getStageStatus(stage)
                  const assignment = getStageAssignment(stage)
                  const isCurrent = stage === batch.current_stage
                  
                  return (
                    <div key={stage} className={`flex items-center justify-between p-3 rounded-lg ${
                      isCurrent ? 'bg-primary/10 border border-primary' : 'bg-secondary/20'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          status === 'completed' ? 'bg-theme-status-success' :
                          status === 'in_progress' ? 'bg-theme-status-warning' :
                          'bg-muted'
                        }`}>
                          {status === 'completed' ? 
                            <CheckCircle className="h-4 w-4 text-primary-foreground" /> :
                            <span className="text-primary-foreground text-sm">{index + 1}</span>
                          }
                        </div>
                        <div>
                          <p className="font-medium">{stage}</p>
                          {assignment && (
                            <p className="text-sm text-muted-foreground">
                              {assignment.worker?.name}
                              {assignment.completed_at && 
                                ` - Completed ${formatDistanceToNow(new Date(assignment.completed_at), { addSuffix: true })}`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                      {isCurrent && <Badge>Current</Badge>}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assign Workers to Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stages.map((stage) => {
                  const assignment = getStageAssignment(stage)
                  const status = getStageStatus(stage)
                  
                  return (
                    <div key={stage} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{stage}</h4>
                          {assignment ? (
                            <div className="mt-1">
                              <p className="text-sm text-muted-foreground">
                                Assigned to: {assignment.worker?.name}
                              </p>
                              {assignment.started_at && (
                                <p className="text-sm text-muted-foreground">
                                  Started: {formatDistanceToNow(new Date(assignment.started_at), { addSuffix: true })}
                                </p>
                              )}
                              {assignment.completed_at && (
                                <p className="text-sm text-theme-status-success">
                                  Completed: {formatDistanceToNow(new Date(assignment.completed_at), { addSuffix: true })}
                                  {assignment.quality_status && ` - Quality: ${assignment.quality_status}`}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">Not assigned</p>
                          )}
                        </div>
                        
                        {!assignment && (
                          <div className="flex items-center gap-2">
                            <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select worker" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableWorkers.map((worker) => (
                                  <SelectItem key={worker.id} value={worker.id}>
                                    {worker.name} ({worker.activeAssignments} active)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm"
                              onClick={() => handleAssignWorker(stage)}
                              disabled={isAssigning || !selectedWorker}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders in Batch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {batch.batch_orders?.map((batchOrder: any) => (
                  <div key={batchOrder.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {batchOrder.order?.model?.name} - {batchOrder.order?.customer?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Order #{batchOrder.order?.order_number}
                        </p>
                      </div>
                      <Badge variant="outline">
                        Qty: {batchOrder.order?.quantity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}