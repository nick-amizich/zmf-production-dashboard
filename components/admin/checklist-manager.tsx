'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  ChevronUp,
  ChevronDown,
  Copy,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { Database } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

type HeadphoneModel = Database['public']['Tables']['headphone_models']['Row']
type ChecklistTemplate = Database['public']['Tables']['quality_checklist_templates']['Row']
type ProductionStage = Database['public']['Enums']['production_stage']

interface ChecklistManagerProps {
  models: HeadphoneModel[]
  templates: ChecklistTemplate[]
  userId: string
}

const STAGES: ProductionStage[] = [
  'Intake',
  'Sanding',
  'Finishing',
  'Sub-Assembly',
  'Final Assembly',
  'Acoustic QC',
  'Shipping'
]

export function ChecklistManager({ models, templates: initialTemplates, userId }: ChecklistManagerProps) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [selectedModel, setSelectedModel] = useState<string>('default')
  const [selectedStage, setSelectedStage] = useState<ProductionStage>('Intake')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    item: '',
    description: '',
    is_required: true,
    sort_order: 0
  })

  // Filter templates based on selected model and stage
  const filteredTemplates = templates.filter(t => 
    t.stage === selectedStage && 
    (t.model_id === (selectedModel === 'default' ? null : selectedModel) || 
     (selectedModel !== 'default' && t.model_id === null))
  ).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  const handleCreate = async () => {
    try {
      const { data, error } = await supabase
        .from('quality_checklist_templates')
        .insert({
          model_id: selectedModel === 'default' ? null : selectedModel,
          stage: selectedStage,
          category: formData.category,
          item: formData.item,
          description: formData.description,
          is_required: formData.is_required,
          sort_order: formData.sort_order,
          created_by: userId
        })
        .select()
        .single()

      if (error) throw error

      setTemplates([...templates, data])
      setFormData({
        category: '',
        item: '',
        description: '',
        is_required: true,
        sort_order: 0
      })
      setIsCreating(false)
      toast.success('Checklist item created successfully')
    } catch (error) {
      console.error('Error creating checklist item:', error)
      toast.error('Failed to create checklist item')
    }
  }

  const handleUpdate = async (id: string) => {
    const template = templates.find(t => t.id === id)
    if (!template) return

    try {
      const { error } = await supabase
        .from('quality_checklist_templates')
        .update({
          category: formData.category,
          item: formData.item,
          description: formData.description,
          is_required: formData.is_required,
          sort_order: formData.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setTemplates(templates.map(t => 
        t.id === id 
          ? { ...t, ...formData, updated_at: new Date().toISOString() }
          : t
      ))
      setEditingId(null)
      toast.success('Checklist item updated successfully')
    } catch (error) {
      console.error('Error updating checklist item:', error)
      toast.error('Failed to update checklist item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this checklist item?')) return

    try {
      const { error } = await supabase
        .from('quality_checklist_templates')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTemplates(templates.filter(t => t.id !== id))
      toast.success('Checklist item deleted successfully')
    } catch (error) {
      console.error('Error deleting checklist item:', error)
      toast.error('Failed to delete checklist item')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('quality_checklist_templates')
        .update({ is_active: isActive })
        .eq('id', id)

      if (error) throw error

      setTemplates(templates.map(t => 
        t.id === id ? { ...t, is_active: isActive } : t
      ))
      toast.success(`Checklist item ${isActive ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error toggling checklist item:', error)
      toast.error('Failed to update checklist item')
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = filteredTemplates.findIndex(t => t.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= filteredTemplates.length) return

    const itemsToUpdate = [...filteredTemplates]
    const temp = itemsToUpdate[currentIndex]
    itemsToUpdate[currentIndex] = itemsToUpdate[newIndex]
    itemsToUpdate[newIndex] = temp

    // Update sort orders
    const updates = itemsToUpdate.map((item, index) => ({
      id: item.id,
      sort_order: index
    }))

    try {
      for (const update of updates) {
        await supabase
          .from('quality_checklist_templates')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
      }

      // Update local state
      setTemplates(templates.map(t => {
        const update = updates.find(u => u.id === t.id)
        return update ? { ...t, sort_order: update.sort_order } : t
      }))

      toast.success('Order updated successfully')
    } catch (error) {
      console.error('Error reordering items:', error)
      toast.error('Failed to reorder items')
    }
  }

  const handleCopyFromDefault = async () => {
    if (selectedModel === 'default') return

    const defaultTemplates = templates.filter(t => 
      t.model_id === null && t.stage === selectedStage
    )

    try {
      const newTemplates = await Promise.all(
        defaultTemplates.map(template => 
          supabase
            .from('quality_checklist_templates')
            .insert({
              model_id: selectedModel,
              stage: template.stage,
              category: template.category,
              item: template.item,
              description: template.description,
              is_required: template.is_required,
              sort_order: template.sort_order,
              created_by: userId
            })
            .select()
            .single()
        )
      )

      const insertedTemplates = newTemplates
        .filter(result => !result.error)
        .map(result => result.data!)

      setTemplates([...templates, ...insertedTemplates])
      toast.success(`Copied ${insertedTemplates.length} items from default checklist`)
    } catch (error) {
      console.error('Error copying templates:', error)
      toast.error('Failed to copy checklist items')
    }
  }

  const startEdit = (template: ChecklistTemplate) => {
    setEditingId(template.id)
    setFormData({
      category: template.category,
      item: template.item,
      description: template.description || '',
      is_required: template.is_required || true,
      sort_order: template.sort_order || 0
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({
      category: '',
      item: '',
      description: '',
      is_required: true,
      sort_order: 0
    })
  }

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, ChecklistTemplate[]>)

  return (
    <div className="space-y-6">
      {/* Model and Stage Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Model and Stage</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label>Headphone Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (All Models)</SelectItem>
                {models.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Label>Production Stage</Label>
            <Tabs value={selectedStage} onValueChange={(v) => setSelectedStage(v as ProductionStage)}>
              <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
                {STAGES.map(stage => (
                  <TabsTrigger key={stage} value={stage} className="text-xs">
                    {stage}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Checklist Item
          </Button>
          
          {selectedModel !== 'default' && (
            <Button 
              variant="outline" 
              onClick={handleCopyFromDefault}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy from Default
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredTemplates.length} items
        </div>
      </div>

      {/* Create New Item Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Checklist Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Wood Quality, Surface, etc."
                />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div>
              <Label>Checklist Item</Label>
              <Input
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                placeholder="What needs to be checked?"
              />
            </div>
            
            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details or instructions..."
                rows={2}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
              />
              <Label>Required Item</Label>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCreate}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist Items */}
      {Object.entries(groupedTemplates).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((template, index) => (
              <div
                key={template.id}
                className={`p-3 rounded-lg border ${
                  !template.is_active ? 'opacity-50' : ''
                } ${editingId === template.id ? 'border-primary' : 'border-border'}`}
              >
                {editingId === template.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Category"
                      />
                      <Input
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                        placeholder="Sort Order"
                      />
                    </div>
                    <Input
                      value={formData.item}
                      onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                      placeholder="Checklist Item"
                    />
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description"
                      rows={2}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_required}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                        />
                        <Label>Required</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdate(template.id)}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{template.item}</span>
                        {template.is_required && (
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        )}
                        {template.model_id === null && selectedModel !== 'default' && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReorder(template.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReorder(template.id, 'down')}
                        disabled={index === items.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Switch
                        checked={template.is_active || false}
                        onCheckedChange={(checked) => handleToggleActive(template.id, checked)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(template)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(template.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No checklist items found for this model and stage.
            </p>
            <Button 
              className="mt-4"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}