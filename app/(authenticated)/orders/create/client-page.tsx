'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const BatchOrderCreator = dynamic(() => import('@/components/batch-order-creator'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

export default function BatchOrderCreatorClient() {
  const router = useRouter()
  
  return <BatchOrderCreator onBack={() => router.back()} />
}