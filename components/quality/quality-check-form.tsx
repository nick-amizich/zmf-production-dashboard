'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Camera, CheckCircle, XCircle, X } from 'lucide-react'
import { Database } from '@/types/database.types'
import { uploadQualityPhoto } from '@/lib/utils/upload'

import { logger } from '@/lib/logger'
type Batch = Database['public']['Tables']['batches']['Row']
type ProductionStage = Database['public']['Enums']['production_stage']
type QualityStatus = Database['public']['Enums']['quality_status']

interface QualityCheckFormProps {
  batches: Array<Batch & {
    batch_orders?: Array<{
      order: {
        model_id: string | null
        model?: {
          id: string
          name: string
        }
      }
    }>
  }>
  userId: string
  onSubmit: () => void
}

interface ChecklistItem {
  id: string
  category: string
  item: string
  required: boolean
  checked?: boolean
  notes?: string
  description?: string | null
}

export function QualityCheckForm({ batches, userId, onSubmit }: QualityCheckFormProps) {
  const [selectedBatch, setSelectedBatch] = useState<string>('')
  const [selectedStage, setSelectedStage] = useState<ProductionStage | ''>('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [overallStatus, setOverallStatus] = useState<QualityStatus>('good')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Load checklist when stage or batch is selected
  useEffect(() => {
    if (selectedStage && selectedBatch) {
      loadChecklist(selectedStage, selectedBatch)
    }
  }, [selectedStage, selectedBatch])

  // Update overall status based on checklist
  useEffect(() => {
    if (checklist.length === 0) return
    
    const requiredItems = checklist.filter(item => item.required)
    const allRequiredChecked = requiredItems.every(item => item.checked)
    const anyFailed = checklist.some(item => item.checked === false)
    
    if (!allRequiredChecked || anyFailed) {
      setOverallStatus('warning')
    } else {
      setOverallStatus('good')
    }
  }, [checklist])

  const loadChecklist = async (stage: ProductionStage, batchId: string) => {
    try {
      // Find the selected batch and get the model ID
      const batch = batches.find(b => b.id === batchId)
      const modelId = batch?.batch_orders?.[0]?.order?.model_id
      
      // Build the URL with optional modelId parameter
      let url = `/api/quality/checklist?stage=${stage}`
      if (modelId) {
        url += `&modelId=${modelId}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      setChecklist(data.map((item: any) => ({ ...item, checked: null })))
    } catch (error) {
      logger.error('Error loading checklist:', error)
    }
  }

  const handleChecklistChange = (itemId: string, checked: boolean | null) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, checked: checked ?? undefined } : item
      )
    )
  }

  const handleSubmit = async () => {
    if (!selectedBatch || !selectedStage || checklist.length === 0) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/quality/checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatch,
          stage: selectedStage,
          checklistData: checklist,
          overallStatus,
          notes,
          photos,
          workerId: userId,
        }),
      })
      
      if (response.ok) {
        onSubmit()
      }
    } catch (error) {
      logger.error('Error submitting quality check:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const stages: ProductionStage[] = [
    'Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 
    'Final Assembly', 'Acoustic QC', 'Shipping'
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Select Batch</Label>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose a batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.batch_number} - Stage: {batch.current_stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Quality Check Stage</Label>
          <Select value={selectedStage} onValueChange={(v) => setSelectedStage(v as ProductionStage)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose a stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {checklist.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Quality Checklist</h3>
            <Badge variant={overallStatus === 'good' ? 'default' : 'destructive'}>
              Status: {overallStatus.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="sm"
                        variant={item.checked === true ? 'default' : 'outline'}
                        className="h-8 w-8 p-0"
                        onClick={() => handleChecklistChange(item.id, true)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={item.checked === false ? 'destructive' : 'outline'}
                        className="h-8 w-8 p-0"
                        onClick={() => handleChecklistChange(item.id, false)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.item}</span>
                        {item.required && (
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label>Additional Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional observations or notes..."
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label>Quality Photos</Label>
        <div className="mt-1 space-y-2">
          <div className="flex gap-2 flex-wrap">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img 
                  src={photo} 
                  alt={`Quality photo ${index + 1}`}
                  className="h-20 w-20 object-cover rounded border"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <label className="h-20 w-20 border-2 border-dashed border-zinc-700 rounded flex items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || [])
                  if (files.length === 0) return
                  
                  setIsUploading(true)
                  try {
                    // Create a temporary check ID for organizing photos
                    const tempCheckId = `temp-${Date.now()}`
                    
                    const uploadPromises = files.map(file => uploadQualityPhoto(file, tempCheckId))
                    const uploadedUrls = await Promise.all(uploadPromises)
                    const validUrls = uploadedUrls.filter((url): url is string => url !== null)
                    
                    setPhotos(prev => [...prev, ...validUrls])
                  } catch (error) {
                    logger.error('Error uploading photos:', error)
                  } finally {
                    setIsUploading(false)
                  }
                }}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="animate-spin h-5 w-5 border-2 border-zinc-500 border-t-transparent rounded-full" />
              ) : (
                <Camera className="h-5 w-5 text-zinc-500" />
              )}
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Click to add photos of quality issues or completed work
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={!selectedBatch || !selectedStage || checklist.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quality Check'}
        </Button>
      </div>
    </div>
  )
}