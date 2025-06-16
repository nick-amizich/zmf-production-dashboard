"use client"

import { useRouter } from 'next/navigation'
import WorkflowView from '@/components/production/workflow-view'

export default function WorkflowClient() {
  const router = useRouter()
  
  return <WorkflowView onBack={() => router.push('/batch-management')} />
}