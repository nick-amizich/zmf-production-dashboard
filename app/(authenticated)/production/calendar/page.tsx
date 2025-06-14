'use client'

import { useRouter } from 'next/navigation'
import ProductionCalendar from '@/components/production/production-calendar'

export default function ProductionCalendarPage() {
  const router = useRouter()
  
  const handleBack = () => {
    router.push('/production')
  }
  
  return <ProductionCalendar onBack={handleBack} />
}