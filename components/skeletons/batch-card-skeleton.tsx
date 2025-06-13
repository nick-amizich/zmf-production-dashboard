import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function BatchCardSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      
      {/* Orders count */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>
      
      {/* Model types */}
      <div className="space-y-1">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-28" />
      </div>
      
      {/* Quality status */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      {/* Timer */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      {/* Assigned worker */}
      <div className="pt-2 border-t">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </Card>
  )
}