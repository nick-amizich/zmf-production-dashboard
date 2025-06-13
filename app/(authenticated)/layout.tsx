import { Suspense } from 'react'
import { AuthenticatedLayout } from '@/components/authenticated-layout'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </Suspense>
  )
}