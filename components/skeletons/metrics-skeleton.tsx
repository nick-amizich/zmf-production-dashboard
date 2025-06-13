import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function MetricsCardSkeleton() {
  return (
    <Card className="p-6 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </Card>
  )
}

export function MetricsDashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <MetricsCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="h-[300px] flex items-end justify-between gap-2">
          {[40, 60, 80, 45, 90, 65, 75].map((height, i) => (
            <Skeleton 
              key={i} 
              className="flex-1" 
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}