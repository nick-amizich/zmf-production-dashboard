'use client'

import dynamic from 'next/dynamic'

const BatchManagement = dynamic(() => import('@/components/production/batch-management'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

export default function BatchManagementClient() {
  return <BatchManagement />
}