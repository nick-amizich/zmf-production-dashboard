'use client'

import { useOrders } from '@/lib/react-query/queries'
import { LoadingWrapper } from '@/components/ui/loading-wrapper'
import { OrderCardSkeleton } from '@/components/skeletons'
import { OrderCard } from '@/components/order-card'
import { Package } from 'lucide-react'

export function OrdersListWithLoading() {
  const { data: orders, isLoading, error, refetch } = useOrders({
    status: 'pending',
    limit: 10
  })

  return (
    <LoadingWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={!orders || orders.length === 0}
      skeleton={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      }
      emptyMessage="No pending orders"
      emptyIcon={
        <div className="rounded-full bg-muted p-4 mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
      }
      onRetry={refetch}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders?.map((order) => (
          <OrderCard key={order.id} order={order as any} />
        ))}
      </div>
    </LoadingWrapper>
  )
}