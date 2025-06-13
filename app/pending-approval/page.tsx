'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Clock, LogOut, RefreshCw } from 'lucide-react'

export default function PendingApprovalPage() {
  const router = useRouter()
  const supabase = createClient()
  const [workerData, setWorkerData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(false)

  useEffect(() => {
    loadWorkerData()
  }, [])

  const loadWorkerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: worker, error } = await supabase
        .from('workers')
        .select('name, email, requested_at, approval_status, rejection_reason')
        .eq('auth_user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching worker data:', error)
        return
      }

      // If approved, redirect to dashboard
      if (worker.approval_status === 'approved') {
        router.push('/dashboard')
        return
      }

      setWorkerData(worker)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkApprovalStatus = async () => {
    setCheckingStatus(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data: worker } = await supabase
        .from('workers')
        .select('approval_status')
        .eq('auth_user_id', user.id)
        .single()

      if (worker?.approval_status === 'approved') {
        router.push('/dashboard')
      } else if (worker?.approval_status === 'rejected') {
        // Reload to show rejection reason
        await loadWorkerData()
      }
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-brand-secondary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="bg-theme-bg-secondary/50 border-theme-border-primary">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-900/20 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl text-theme-text-secondary">
              {workerData?.approval_status === 'rejected' ? 'Registration Rejected' : 'Pending Approval'}
            </CardTitle>
            <CardDescription className="text-theme-text-tertiary">
              {workerData?.approval_status === 'rejected' 
                ? 'Your registration has been rejected'
                : 'Your account is awaiting administrator approval'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={workerData?.approval_status === 'rejected' 
              ? "bg-red-900/20 border-red-900/50" 
              : "bg-yellow-900/20 border-yellow-900/50"}>
              <AlertDescription className={workerData?.approval_status === 'rejected' 
                ? "text-red-400" 
                : "text-yellow-400"}>
                {workerData?.approval_status === 'rejected' ? (
                  <>
                    <p className="font-semibold mb-2">Rejection Reason:</p>
                    <p>{workerData.rejection_reason || 'No reason provided'}</p>
                    <p className="mt-4 text-sm">Please contact an administrator for more information.</p>
                  </>
                ) : (
                  <>
                    <p>Hello {workerData?.name},</p>
                    <p className="mt-2">
                      Your registration was submitted on {new Date(workerData?.requested_at).toLocaleDateString()}.
                      An administrator will review your request soon.
                    </p>
                    <p className="mt-2">
                      You will receive an email notification once your account has been approved.
                    </p>
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {workerData?.approval_status !== 'rejected' && (
                <Button
                  onClick={checkApprovalStatus}
                  disabled={checkingStatus}
                  className="w-full bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
                >
                  {checkingStatus ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Checking status...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check Status
                    </>
                  )}
                </Button>
              )}
              
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full border-theme-border-primary text-theme-text-secondary hover:bg-theme-bg-primary"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <div className="text-center text-sm text-theme-text-tertiary">
              <p>Account: {workerData?.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}