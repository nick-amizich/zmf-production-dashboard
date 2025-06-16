"use client"

import { useRouter } from 'next/navigation'
import BatchAssignmentView from '@/components/production/batch-assignment-view'

export default function BatchAssignmentClient() {
  const router = useRouter()
  
  return <BatchAssignmentView onBack={() => router.push('/batch-management')} />
}