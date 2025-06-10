'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Trash2, GripVertical, DollarSign } from "lucide-react"
import { ProductOption, OptionValue } from "@/types/product-configurator"

interface OptionEditorProps {
  options: ProductOption[]
  onUpdateOptions: (options: ProductOption[]) => void
}

export default function OptionEditor({ options, onUpdateOptions }: OptionEditorProps) {
  const [showNewOptionDialog, setShowNewOptionDialog] = useState(false)
  const [newOption, setNewOption] = useState({
    name: '',
    type: 'property' as 'variant' | 'property',
    required: true
  })

  const handleAddOption = () => {
    const option: ProductOption = {
      id: `option-${Date.now()}`,
      name: newOption.name,
      type: newOption.type,
      values: [],
      required: newOption.required,
      displayOrder: options.length
    }
    
    onUpdateOptions([...options, option])
    setShowNewOptionDialog(false)
    setNewOption({ name: '', type: 'property', required: true })
  }

  const handleUpdateOption = (optionId: string, updates: Partial<ProductOption>) => {
    onUpdateOptions(
      options.map(opt => 
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    )
  }

  const handleDeleteOption = (optionId: string) => {
    onUpdateOptions(options.filter(opt => opt.id !== optionId))
  }

  const handleAddValue = (optionId: string, valueName: string) => {
    const option = options.find(opt => opt.id === optionId)
    if (!option) return

    const newValue: OptionValue = {
      id: `value-${Date.now()}`,
      name: valueName,
      priceModifier: 0,
      available: true
    }

    handleUpdateOption(optionId, {
      values: [...option.values, newValue]
    })
  }

  const handleUpdateValue = (optionId: string, valueId: string, updates: Partial<OptionValue>) => {
    const option = options.find(opt => opt.id === optionId)
    if (!option) return

    handleUpdateOption(optionId, {
      values: option.values.map(val =>
        val.id === valueId ? { ...val, ...updates } : val
      )
    })
  }

  const handleDeleteValue = (optionId: string, valueId: string) => {
    const option = options.find(opt => opt.id === optionId)
    if (!option) return

    handleUpdateOption(optionId, {
      values: option.values.filter(val => val.id !== valueId)
    })
  }

  const variantCount = options.filter(o => o.type === 'variant').length

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {options.length} options configured
          </p>
          {variantCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {variantCount} variant option{variantCount > 1 ? 's' : ''} 
              {variantCount >= 3 && ' (Shopify limit reached)'}
            </p>
          )}
        </div>
        <Dialog open={showNewOptionDialog} onOpenChange={setShowNewOptionDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product Option</DialogTitle>
              <DialogDescription>
                Create a new customization option for this model
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="optionName">Option Name</Label>
                <Input
                  id="optionName"
                  placeholder="e.g., Wood Type, Cable Color"
                  value={newOption.name}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionType">Option Type</Label>
                <Select
                  value={newOption.type}
                  onValueChange={(value: 'variant' | 'property') => 
                    setNewOption({ ...newOption, type: value })
                  }
                >
                  <SelectTrigger id="optionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property">
                      Line Item Property (Unlimited)
                    </SelectItem>
                    <SelectItem 
                      value="variant"
                      disabled={variantCount >= 3}
                    >
                      Variant (Affects SKU) {variantCount >= 3 && '- Limit Reached'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={newOption.required}
                  onCheckedChange={(checked) => 
                    setNewOption({ ...newOption, required: checked })
                  }
                />
                <Label htmlFor="required">Required option</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewOptionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddOption}
                disabled={!newOption.name}
              >
                Add Option
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {options.map((option) => (
          <AccordionItem key={option.id} value={option.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{option.name}</span>
                  <Badge variant={option.type === 'variant' ? 'default' : 'secondary'}>
                    {option.type}
                  </Badge>
                  {option.required && <Badge variant="outline">Required</Badge>}
                </div>
                <span className="text-sm text-muted-foreground">
                  {option.values.length} values
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <Label>Option Values</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteOption(option.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {option.values.map((value) => (
                    <div key={value.id} className="flex items-center gap-2">
                      <Input
                        value={value.name}
                        onChange={(e) => 
                          handleUpdateValue(option.id, value.id, { name: e.target.value })
                        }
                        placeholder="Value name"
                      />
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          value={(value.priceModifier / 100).toFixed(2)}
                          onChange={(e) => 
                            handleUpdateValue(option.id, value.id, { 
                              priceModifier: Math.round(parseFloat(e.target.value) * 100) 
                            })
                          }
                          placeholder="0.00"
                          className="w-24"
                        />
                      </div>
                      {option.type === 'variant' && (
                        <Input
                          value={value.sku || ''}
                          onChange={(e) => 
                            handleUpdateValue(option.id, value.id, { sku: e.target.value })
                          }
                          placeholder="SKU suffix"
                          className="w-32"
                        />
                      )}
                      <Switch
                        checked={value.available}
                        onCheckedChange={(checked) => 
                          handleUpdateValue(option.id, value.id, { available: checked })
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteValue(option.id, value.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="New value name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        handleAddValue(option.id, e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input.value) {
                        handleAddValue(option.id, input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add Value
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}