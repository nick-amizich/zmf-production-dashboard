'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, XCircle, Clock, Users, Loader2 } from 'lucide-react'

interface PendingWorker {
  id: string
  name: string
  email: string
  requested_at: string
  hourly_rate: number | null
  specializations: string[] | null
  email_confirmed_at: string | null
  last_sign_in_at: string | null
}

export default function WorkerApprovalsPage() {
  const supabase = createClient()
  const [pendingWorkers, setPendingWorkers] = useState<PendingWorker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Rejection dialog state
  const [rejectionDialog, setRejectionDialog] = useState<{
    isOpen: boolean
    workerId: string | null
    workerName: string
    reason: string
  }>({
    isOpen: false,
    workerId: null,
    workerName: '',
    reason: ''
  })

  useEffect(() => {
    loadPendingWorkers()
  }, [])

  const loadPendingWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_worker_approvals')
        .select('*')
        .order('requested_at', { ascending: true })

      if (error) throw error

      // Filter out records with null id and map to the expected type
      const validWorkers = (data || [])
        .filter(w => w.id !== null)
        .map(w => ({
          id: w.id!,
          name: w.name || 'Unknown',
          email: w.email || '',
          requested_at: w.requested_at || new Date().toISOString(),
          hourly_rate: w.hourly_rate,
          specializations: w.specializations,
          email_confirmed_at: w.email_confirmed_at,
          last_sign_in_at: w.last_sign_in_at
        }))
      
      setPendingWorkers(validWorkers)
    } catch (error) {
      console.error('Error loading pending workers:', error)
      setError('Failed to load pending worker approvals')
    } finally {
      setIsLoading(false)
    }
  }

  const approveWorker = async (workerId: string) => {
    setProcessingId(workerId)
    setError(null)
    setSuccessMessage(null)

    try {
      const { error } = await supabase.rpc('approve_worker', {
        worker_id: workerId
      })

      if (error) throw error

      setSuccessMessage('Worker approved successfully!')
      
      // Remove from list
      setPendingWorkers(prev => prev.filter(w => w.id !== workerId))
      
      // TODO: Send notification email to worker
    } catch (error: any) {
      console.error('Error approving worker:', error)
      setError(error.message || 'Failed to approve worker')
    } finally {
      setProcessingId(null)
    }
  }

  const rejectWorker = async () => {
    if (!rejectionDialog.workerId || !rejectionDialog.reason.trim()) return

    setProcessingId(rejectionDialog.workerId)
    setError(null)
    setSuccessMessage(null)

    try {
      const { error } = await supabase.rpc('reject_worker', {
        worker_id: rejectionDialog.workerId,
        reason: rejectionDialog.reason
      })

      if (error) throw error

      setSuccessMessage('Worker registration rejected')
      
      // Remove from list
      setPendingWorkers(prev => prev.filter(w => w.id !== rejectionDialog.workerId))
      
      // Close dialog
      setRejectionDialog({
        isOpen: false,
        workerId: null,
        workerName: '',
        reason: ''
      })
      
      // TODO: Send notification email to worker
    } catch (error: any) {
      console.error('Error rejecting worker:', error)
      setError(error.message || 'Failed to reject worker')
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectionDialog = (worker: PendingWorker) => {
    setRejectionDialog({
      isOpen: true,
      workerId: worker.id,
      workerName: worker.name,
      reason: ''
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-theme-brand-secondary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-text-secondary">Worker Approvals</h1>
          <p className="text-theme-text-tertiary mt-1">Review and approve pending worker registrations</p>
        </div>
        <Badge variant="secondary" className="bg-theme-bg-secondary text-theme-text-secondary">
          <Users className="mr-1 h-4 w-4" />
          {pendingWorkers.length} Pending
        </Badge>
      </div>

      {error && (
        <Alert className="bg-red-900/20 border-red-900/50">
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-900/20 border-green-900/50">
          <AlertDescription className="text-green-400">{successMessage}</AlertDescription>
        </Alert>
      )}

      {pendingWorkers.length === 0 ? (
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-theme-text-tertiary mx-auto mb-4" />
            <p className="text-theme-text-tertiary">No pending worker approvals</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-secondary">Pending Registrations</CardTitle>
            <CardDescription className="text-theme-text-tertiary">
              Review worker information and approve or reject their registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-theme-border-primary">
                  <TableHead className="text-theme-text-tertiary">Name</TableHead>
                  <TableHead className="text-theme-text-tertiary">Email</TableHead>
                  <TableHead className="text-theme-text-tertiary">Requested</TableHead>
                  <TableHead className="text-theme-text-tertiary">Email Verified</TableHead>
                  <TableHead className="text-theme-text-tertiary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingWorkers.map((worker) => (
                  <TableRow key={worker.id} className="border-theme-border-primary">
                    <TableCell className="text-theme-text-primary font-medium">
                      {worker.name}
                    </TableCell>
                    <TableCell className="text-theme-text-secondary">
                      {worker.email}
                    </TableCell>
                    <TableCell className="text-theme-text-tertiary">
                      {formatDistanceToNow(new Date(worker.requested_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {worker.email_confirmed_at ? (
                        <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-900">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-900">
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveWorker(worker.id)}
                          disabled={processingId === worker.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingId === worker.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectionDialog(worker)}
                          disabled={processingId === worker.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog 
        open={rejectionDialog.isOpen} 
        onOpenChange={(open) => !open && setRejectionDialog({
          isOpen: false,
          workerId: null,
          workerName: '',
          reason: ''
        })}
      >
        <DialogContent className="bg-theme-bg-secondary border-theme-border-primary">
          <DialogHeader>
            <DialogTitle className="text-theme-text-secondary">Reject Worker Registration</DialogTitle>
            <DialogDescription className="text-theme-text-tertiary">
              Provide a reason for rejecting {rejectionDialog.workerName}&apos;s registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason" className="text-theme-text-tertiary">
                Rejection Reason
              </Label>
              <Textarea
                id="reason"
                value={rejectionDialog.reason}
                onChange={(e) => setRejectionDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter the reason for rejection..."
                className="mt-2 bg-theme-bg-primary border-theme-border-primary text-theme-text-primary"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectionDialog({
                isOpen: false,
                workerId: null,
                workerName: '',
                reason: ''
              })}
              className="border-theme-border-primary text-theme-text-secondary"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={rejectWorker}
              disabled={!rejectionDialog.reason.trim() || processingId === rejectionDialog.workerId}
            >
              {processingId === rejectionDialog.workerId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Reject Registration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}