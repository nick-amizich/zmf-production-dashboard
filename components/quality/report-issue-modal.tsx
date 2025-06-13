'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileWarning } from 'lucide-react'
import { Database } from '@/types/database.types'

import { logger } from '@/lib/logger'
type ProductionStage = Database['public']['Enums']['production_stage']
type QualityStatus = Database['public']['Enums']['quality_status']

interface ReportIssueModalProps {
  batchId?: string
  orderId?: string
  onSubmit?: () => void
}

export function ReportIssueModal({ batchId, orderId, onSubmit }: ReportIssueModalProps) {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<ProductionStage | ''>('')
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState<QualityStatus>('warning')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stages: ProductionStage[] = [
    'Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 
    'Final Assembly', 'Acoustic QC', 'Shipping'
  ]

  const categories = [
    'Material Defect',
    'Workmanship',
    'Damage',
    'Wrong Specification',
    'Missing Component',
    'Quality Standard',
    'Other',
  ]

  const handleSubmit = async () => {
    if (!stage || !category || !description.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/quality/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId,
          orderId,
          stage,
          category,
          description,
          severity,
        }),
      })

      if (response.ok) {
        setOpen(false)
        resetForm()
        onSubmit?.()
      }
    } catch (error) {
      logger.error('Error reporting issue:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStage('')
    setCategory('')
    setSeverity('warning')
    setDescription('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileWarning className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Quality Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Production Stage</Label>
            <Select value={stage} onValueChange={(v) => setStage(v as ProductionStage)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Issue Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as QualityStatus)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warning">Warning - Minor Issue</SelectItem>
                <SelectItem value="hold">Hold - Needs Attention</SelectItem>
                <SelectItem value="critical">Critical - Stop Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="mt-1"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!stage || !category || !description.trim() || isSubmitting}
            >
              {isSubmitting ? 'Reporting...' : 'Report Issue'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}