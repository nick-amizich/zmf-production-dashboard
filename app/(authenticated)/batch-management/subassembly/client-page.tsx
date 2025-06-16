"use client"

import { useRouter } from 'next/navigation'
import SubassemblyView from '@/components/production/subassembly-view'

export default function SubassemblyClient() {
  const router = useRouter()
  
  return <SubassemblyView onBack={() => router.push('/batch-management')} />
}