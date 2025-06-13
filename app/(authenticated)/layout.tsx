import { AuthenticatedLayout } from '@/components/authenticated-layout'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}