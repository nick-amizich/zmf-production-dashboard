'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import { ProductModel } from "@/types/product-configurator"
import { useToast } from "@/components/ui/use-toast"

interface SyncToDatabaseProps {
  models: ProductModel[]
}

export default function SyncToDatabase({ models }: SyncToDatabaseProps) {
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResults, setSyncResults] = useState<any[]>([])
  const [showDialog, setShowDialog] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncResults([])

    try {
      // Transform models to API format
      const configurations = models.map(model => ({
        shopifyProductId: model.id, // You'll need to map this to actual Shopify product IDs
        name: model.name,
        basePrice: model.basePrice,
        baseSku: model.baseSku,
        description: model.description,
        options: model.options.map(option => ({
          name: option.name,
          type: option.type,
          required: option.required,
          displayOrder: option.displayOrder,
          values: option.values.map(value => ({
            name: value.name,
            priceModifier: value.priceModifier,
            sku: value.sku,
            available: value.available,
            metadata: value.metadata
          }))
        }))
      }))

      const response = await fetch('/api/product-configurations/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ configurations })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Sync failed')
      }

      const data = await response.json()
      setSyncResults(data.results)
      
      const successCount = data.results.filter((r: any) => r.success).length
      
      toast({
        title: "Sync completed",
        description: `${successCount} of ${data.results.length} configurations synced successfully`,
        variant: successCount === data.results.length ? "default" : "destructive"
      })

    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to sync configurations to database",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={models.length === 0}>
          <Upload className="mr-2 h-4 w-4" />
          Sync to Database
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Sync Configurations to Database</DialogTitle>
          <DialogDescription>
            This will sync your product configurations to the database, making them available to Shopify.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Before syncing</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Ensure your Shopify product IDs are correctly mapped</li>
                <li>Existing configurations will be overwritten</li>
                <li>This action cannot be undone</li>
              </ul>
            </AlertDescription>
          </Alert>

          {syncResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Sync Results:</h4>
              {syncResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-theme-status-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-theme-status-error" />
                  )}
                  <span>{result.shopifyProductId}</span>
                  {result.error && (
                    <span className="text-theme-status-error text-xs">({result.error})</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? 'Syncing...' : `Sync ${models.length} Models`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}