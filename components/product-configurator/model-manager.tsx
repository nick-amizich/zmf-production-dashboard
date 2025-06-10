'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Package, DollarSign, FileText } from "lucide-react"
import { ProductModel, ProductOption, OptionValue } from "@/types/product-configurator"
import OptionEditor from "./option-editor"

interface ModelManagerProps {
  models: ProductModel[]
  activeModelId: string | null
  onAddModel: (model: ProductModel) => void
  onUpdateModel: (modelId: string, updates: Partial<ProductModel>) => void
  onDeleteModel: (modelId: string) => void
  onSelectModel: (modelId: string) => void
}

export default function ModelManager({
  models,
  activeModelId,
  onAddModel,
  onUpdateModel,
  onDeleteModel,
  onSelectModel
}: ModelManagerProps) {
  const [showNewModelDialog, setShowNewModelDialog] = useState(false)
  const [newModel, setNewModel] = useState({
    name: '',
    basePrice: '',
    baseSku: '',
    description: ''
  })

  const handleCreateModel = () => {
    const model: ProductModel = {
      id: `model-${Date.now()}`,
      name: newModel.name,
      basePrice: Math.round(parseFloat(newModel.basePrice) * 100), // Convert to cents
      baseSku: newModel.baseSku,
      description: newModel.description,
      options: [],
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    onAddModel(model)
    setShowNewModelDialog(false)
    setNewModel({ name: '', basePrice: '', baseSku: '', description: '' })
  }

  const activeModel = models.find(m => m.id === activeModelId)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Headphone Models</h2>
        <Dialog open={showNewModelDialog} onOpenChange={setShowNewModelDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Headphone Model</DialogTitle>
              <DialogDescription>
                Define the base configuration for a new headphone model
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Model Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Verite Closed"
                  value={newModel.name}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price ($)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2999.00"
                  value={newModel.basePrice}
                  onChange={(e) => setNewModel({ ...newModel, basePrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseSku">Base SKU</Label>
                <Input
                  id="baseSku"
                  placeholder="e.g., VERITE-CLOSED"
                  value={newModel.baseSku}
                  onChange={(e) => setNewModel({ ...newModel, baseSku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the model"
                  value={newModel.description}
                  onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewModelDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateModel}
                disabled={!newModel.name || !newModel.basePrice || !newModel.baseSku}
              >
                Create Model
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => (
          <Card 
            key={model.id} 
            className={`cursor-pointer transition-colors ${
              activeModelId === model.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectModel(model.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{model.name}</CardTitle>
                  <CardDescription>{model.baseSku}</CardDescription>
                </div>
                <Badge variant="secondary">
                  ${(model.basePrice / 100).toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>{model.options.length} options</span>
                <span>•</span>
                <span>
                  {model.options.filter(o => o.type === 'variant').length} variants
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteModel(model.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {activeModel && (
        <Card>
          <CardHeader>
            <CardTitle>Edit {activeModel.name}</CardTitle>
            <CardDescription>
              Configure options and variants for this model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">
                  <FileText className="mr-2 h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="options">
                  <Package className="mr-2 h-4 w-4" />
                  Options
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Model Name</Label>
                    <Input
                      value={activeModel.name}
                      onChange={(e) => 
                        onUpdateModel(activeModel.id, { name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Base Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={(activeModel.basePrice / 100).toFixed(2)}
                      onChange={(e) => 
                        onUpdateModel(activeModel.id, { 
                          basePrice: Math.round(parseFloat(e.target.value) * 100) 
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Base SKU</Label>
                    <Input
                      value={activeModel.baseSku}
                      onChange={(e) => 
                        onUpdateModel(activeModel.id, { baseSku: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={activeModel.description}
                    onChange={(e) => 
                      onUpdateModel(activeModel.id, { description: e.target.value })
                    }
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="options">
                <OptionEditor
                  options={activeModel.options}
                  onUpdateOptions={(options) => 
                    onUpdateModel(activeModel.id, { options })
                  }
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}