'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Camera, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

interface DefectReportDialogProps {
  open: boolean
  onClose: () => void
  buildId?: string
  orderId?: string
  batchId?: string
  currentStage: string
  onSubmitSuccess: () => void
}

type DefectCategory = 'wood' | 'finish' | 'assembly' | 'acoustic' | 'cosmetic' | 'functional' | 'other'
type Severity = 'critical' | 'major' | 'minor'

const defectTypes: Record<DefectCategory, string[]> = {
  wood: ['Crack', 'Split', 'Warp', 'Knot', 'Discoloration', 'Rough Surface'],
  finish: ['Scratch', 'Dent', 'Bubble', 'Run', 'Orange Peel', 'Uneven Coverage'],
  assembly: ['Misalignment', 'Loose Joint', 'Gap', 'Wrong Part', 'Missing Hardware'],
  acoustic: ['Driver Issue', 'Rattle', 'Distortion', 'Channel Imbalance', 'No Sound'],
  cosmetic: ['Logo Placement', 'Color Mismatch', 'Surface Blemish', 'Packaging Damage'],
  functional: ['Cable Issue', 'Adjustment Mechanism', 'Comfort Issue', 'Weight Imbalance'],
  other: ['Other']
}

const stageOptions = [
  'intake',
  'sanding', 
  'finishing',
  'sub_assembly',
  'final_assembly',
  'acoustic_qc'
]

export function DefectReportDialog({
  open,
  onClose,
  buildId,
  orderId,
  batchId,
  currentStage,
  onSubmitSuccess
}: DefectReportDialogProps) {
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<DefectCategory>('wood')
  const [defectType, setDefectType] = useState('')
  const [severity, setSeverity] = useState<Severity>('major')
  const [description, setDescription] = useState('')
  const [targetStage, setTargetStage] = useState(currentStage)
  const [requiresRework, setRequiresRework] = useState(true)
  
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!defectType || !description) return

    setLoading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: worker } = await supabase
        .from('workers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!worker) throw new Error('Worker not found')

      // If buildId is provided, use the stored function
      if (buildId && requiresRework) {
        const { data, error } = await supabase
          .rpc('report_defect_and_rework', {
            p_build_id: buildId,
            p_stage: currentStage,
            p_defect_category: category,
            p_defect_type: defectType,
            p_severity: severity,
            p_description: description,
            p_target_stage: targetStage
          })

        if (error) throw error
      } else {
        // Otherwise, just create a defect record
        const { error } = await supabase
          .from('defects')
          .insert({
            build_id: buildId!,
            batch_id: batchId,
            stage: currentStage,
            defect_category: category,
            defect_type: defectType,
            severity,
            description,
            requires_rework: requiresRework,
            discovered_by: worker.id,
            discovered_at: new Date().toISOString()
          })

        if (error) throw error
      }

      // Reset form
      setCategory('wood')
      setDefectType('')
      setSeverity('major')
      setDescription('')
      setTargetStage(currentStage)
      setRequiresRework(true)
      
      onSubmitSuccess()
      onClose()
    } catch (error) {
      console.error('Error reporting defect:', error)
      alert('Failed to report defect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-theme-bg-secondary border-theme-border-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-theme-text-primary">
            <AlertTriangle className="w-5 h-5 text-theme-status-warning" />
            Report Defect
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Defect Category */}
          <div className="space-y-2">
            <Label className="text-theme-text-secondary">Defect Category</Label>
            <Select value={category} onValueChange={(val) => {
              setCategory(val as DefectCategory)
              setDefectType('') // Reset type when category changes
            }}>
              <SelectTrigger className="bg-theme-bg-primary border-theme-border-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(defectTypes).map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Defect Type */}
          <div className="space-y-2">
            <Label className="text-theme-text-secondary">Defect Type</Label>
            <Select value={defectType} onValueChange={setDefectType}>
              <SelectTrigger className="bg-theme-bg-primary border-theme-border-secondary">
                <SelectValue placeholder="Select defect type" />
              </SelectTrigger>
              <SelectContent>
                {defectTypes[category].map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label className="text-theme-text-secondary">Severity</Label>
            <Select value={severity} onValueChange={(val) => setSeverity(val as Severity)}>
              <SelectTrigger className="bg-theme-bg-primary border-theme-border-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical - Cannot ship</SelectItem>
                <SelectItem value="major">Major - Affects function</SelectItem>
                <SelectItem value="minor">Minor - Cosmetic only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-theme-text-secondary">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the defect in detail..."
              className="bg-theme-bg-primary border-theme-border-secondary min-h-[100px]"
            />
          </div>

          {/* Requires Rework */}
          <div className="flex items-center justify-between">
            <Label className="text-theme-text-secondary">Requires Rework?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={requiresRework ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRequiresRework(true)}
                className={requiresRework ? 'bg-theme-brand-primary' : ''}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={!requiresRework ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRequiresRework(false)}
                className={!requiresRework ? 'bg-theme-brand-primary' : ''}
              >
                No
              </Button>
            </div>
          </div>

          {/* Target Stage (if rework required) */}
          {requiresRework && (
            <div className="space-y-2">
              <Label className="text-theme-text-secondary">Send Back To Stage</Label>
              <Select value={targetStage} onValueChange={setTargetStage}>
                <SelectTrigger className="bg-theme-bg-primary border-theme-border-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map(stage => (
                    <SelectItem key={stage} value={stage}>
                      {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Photo Upload (placeholder) */}
          <div className="space-y-2">
            <Label className="text-theme-text-secondary">Photos (Optional)</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full border-theme-border-secondary"
              disabled
            >
              <Camera className="w-4 h-4 mr-2" />
              Add Photos
            </Button>
            <p className="text-xs text-theme-text-tertiary">Photo upload coming soon</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-theme-border-secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !defectType || !description}
            className="bg-theme-brand-primary hover:bg-theme-brand-primary/90"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Report Defect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}