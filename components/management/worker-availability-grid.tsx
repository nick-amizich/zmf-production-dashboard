'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserCheck, UserX } from 'lucide-react'

interface WorkerAvailabilityGridProps {
  workers: any[]
  availability: any[]
}

export function WorkerAvailabilityGrid({ workers, availability }: WorkerAvailabilityGridProps) {
  const getWorkerAvailability = (workerId: string) => {
    return availability.find(a => a.worker_id === workerId)
  }

  const availableWorkers = workers.filter(w => {
    const avail = getWorkerAvailability(w.id)
    return !avail || avail.is_available
  })

  const unavailableWorkers = workers.filter(w => {
    const avail = getWorkerAvailability(w.id)
    return avail && !avail.is_available
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-theme-status-success" />
            Available Today ({availableWorkers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableWorkers.map(worker => {
              const avail = getWorkerAvailability(worker.id)
              return (
                <div key={worker.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                  <div>
                    <p className="font-medium">{worker.name}</p>
                    <p className="text-sm text-muted-foreground">{worker.role}</p>
                  </div>
                  {avail?.shift && (
                    <Badge variant="outline">{avail.shift}</Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-theme-status-error" />
            Unavailable ({unavailableWorkers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {unavailableWorkers.map(worker => {
              const avail = getWorkerAvailability(worker.id)
              return (
                <div key={worker.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                  <div>
                    <p className="font-medium">{worker.name}</p>
                    <p className="text-sm text-muted-foreground">{worker.role}</p>
                  </div>
                  {avail?.notes && (
                    <p className="text-sm text-muted-foreground">{avail.notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}