import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function OrderCardSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      {/* Order number and status */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      
      {/* Customer info */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      
      {/* Model and wood type */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      
      {/* Dates */}
      <div className="pt-2 space-y-1 text-xs">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-32" />
      </div>
    </Card>
  )
}