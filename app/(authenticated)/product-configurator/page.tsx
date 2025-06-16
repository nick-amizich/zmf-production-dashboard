'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Save, Download, Upload, Trash2 } from "lucide-react"
import ModelManager from "@/components/product-configurator/model-manager"
import ConfigurationPreview from "@/components/product-configurator/configuration-preview"
import SyncToDatabase from "@/components/product-configurator/sync-to-database"
import { ShopifyMapping } from "@/components/product-configurator/shopify-mapping"
import { ProductModel, ConfiguratorData } from "@/types/product-configurator"
import { useToast } from "@/components/ui/use-toast"

import { logger } from '@/lib/logger'
const STORAGE_KEY = 'zmf-product-configurator'

export default function ProductConfiguratorPage() {
  const { toast } = useToast()
  const [configuratorData, setConfiguratorData] = useState<ConfiguratorData>({
    models: [],
    activeModelId: null
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Convert date strings back to Date objects
        parsed.models = parsed.models.map((model: any) => ({
          ...model,
          createdAt: new Date(model.createdAt),
          updatedAt: new Date(model.updatedAt)
        }))
        setConfiguratorData(parsed)
        toast({
          title: "Data loaded",
          description: "Your saved configuration has been loaded.",
        })
      } catch (error) {
        logger.error('Failed to load saved data:', error)
      }
    }
  }, [])

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configuratorData))
        setHasUnsavedChanges(false)
        toast({
          title: "Auto-saved",
          description: "Your changes have been saved locally.",
        })
      }, 1000) // Debounce for 1 second

      return () => clearTimeout(timer)
    }
  }, [configuratorData, hasUnsavedChanges])

  const updateData = (updater: (prev: ConfiguratorData) => ConfiguratorData) => {
    setConfiguratorData(updater)
    setHasUnsavedChanges(true)
  }

  const handleAddModel = (model: ProductModel) => {
    updateData(prev => ({
      ...prev,
      models: [...prev.models, model],
      activeModelId: model.id
    }))
  }

  const handleUpdateModel = (modelId: string, updates: Partial<ProductModel>) => {
    updateData(prev => ({
      ...prev,
      models: prev.models.map(m => 
        m.id === modelId ? { ...m, ...updates, updatedAt: new Date() } : m
      )
    }))
  }

  const handleDeleteModel = (modelId: string) => {
    updateData(prev => ({
      ...prev,
      models: prev.models.filter(m => m.id !== modelId),
      activeModelId: prev.activeModelId === modelId ? null : prev.activeModelId
    }))
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(configuratorData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `zmf-configurator-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast({
      title: "Exported",
      description: "Configuration has been downloaded.",
    })
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        // Convert date strings back to Date objects
        imported.models = imported.models.map((model: any) => ({
          ...model,
          createdAt: new Date(model.createdAt),
          updatedAt: new Date(model.updatedAt)
        }))
        setConfiguratorData(imported)
        setHasUnsavedChanges(true)
        toast({
          title: "Imported",
          description: "Configuration has been imported successfully.",
        })
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file could not be imported. Please check the format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY)
      setConfiguratorData({ models: [], activeModelId: null })
      toast({
        title: "Cleared",
        description: "All configuration data has been cleared.",
      })
    }
  }

  const activeModel = configuratorData.models.find(m => m.id === configuratorData.activeModelId)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Product Configuration Tool</h1>
        <p className="text-muted-foreground">
          Test and design your headphone product configurator
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="models" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="models">Model Management</TabsTrigger>
              <TabsTrigger value="preview">Configuration Preview</TabsTrigger>
              <TabsTrigger value="mapping">Shopify Mapping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="models">
              <ModelManager
                models={configuratorData.models}
                activeModelId={configuratorData.activeModelId}
                onAddModel={handleAddModel}
                onUpdateModel={handleUpdateModel}
                onDeleteModel={handleDeleteModel}
                onSelectModel={(modelId) => 
                  updateData(prev => ({ ...prev, activeModelId: modelId }))
                }
              />
            </TabsContent>
            
            <TabsContent value="preview">
              {activeModel ? (
                <ConfigurationPreview model={activeModel} />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-96">
                    <p className="text-muted-foreground mb-4">
                      No model selected. Create a model to preview configurations.
                    </p>
                    <Button 
                      onClick={() => {
                        const tabs = document.querySelector('[value="models"]') as HTMLElement
                        tabs?.click()
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Model
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="mapping">
              <ShopifyMapping />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Import, export, or clear your configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleExport}
                disabled={configuratorData.models.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Configuration
              </Button>
              
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => document.getElementById('import-file')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Configuration
                </Button>
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleClearAll}
                disabled={configuratorData.models.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
              
              <SyncToDatabase models={configuratorData.models} />
              
              {hasUnsavedChanges && (
                <p className="text-xs text-muted-foreground text-center">
                  Changes will auto-save...
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shopify Integration Notes</CardTitle>
              <CardDescription>
                Key considerations for Shopify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Variant Limitations</h4>
                <p className="text-sm text-muted-foreground">
                  Max 3 options per product, 100 variants total
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Line Item Properties</h4>
                <p className="text-sm text-muted-foreground">
                  Use for unlimited custom options that don&apos;t affect inventory
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Price Handling</h4>
                <p className="text-sm text-muted-foreground">
                  Calculate server-side for security. Use Shopify Scripts for checkout adjustments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}