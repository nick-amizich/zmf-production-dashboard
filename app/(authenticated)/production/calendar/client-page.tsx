'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const ProductionCalendar = dynamic(() => import('@/components/production/production-calendar'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

export default function ProductionCalendarClient() {
  const router = useRouter()
  
  return <ProductionCalendar onBack={() => router.back()} />
}