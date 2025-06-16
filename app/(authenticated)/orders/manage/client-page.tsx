'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const OrderManagement = dynamic(() => import('@/components/orders/order-management'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

export default function OrderManagementClient() {
  const router = useRouter()
  
  return <OrderManagement onBack={() => router.back()} />
}