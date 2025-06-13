'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Link, Unlink, ExternalLink, Check, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

import { logger } from '@/lib/logger'
interface ShopifyProduct {
  id: string
  title: string
  handle: string
  vendor: string
  product_type: string
}

interface ProductConfiguration {
  id: string
  name: string
  shopify_product_id: string | null
  is_active: boolean
}

export function ShopifyMapping() {
  const [configurations, setConfigurations] = useState<ProductConfiguration[]>([])
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [mapping, setMapping] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load product configurations
      const configResponse = await fetch('/api/product-configurations')
      const configData = await configResponse.json()
      setConfigurations(configData)

      // Initialize mapping state
      const initialMapping: Record<string, string> = {}
      configData.forEach((config: ProductConfiguration) => {
        if (config.shopify_product_id) {
          initialMapping[config.id] = config.shopify_product_id
        }
      })
      setMapping(initialMapping)

      // In a real implementation, this would fetch from Shopify Admin API
      // For now, we'll use mock data
      setShopifyProducts([
        { id: 'gid://shopify/Product/7234567890123', title: 'ZMF Auteur', handle: 'zmf-auteur', vendor: 'ZMF', product_type: 'Headphones' },
        { id: 'gid://shopify/Product/7234567890124', title: 'ZMF Verite Closed', handle: 'zmf-verite-closed', vendor: 'ZMF', product_type: 'Headphones' },
        { id: 'gid://shopify/Product/7234567890125', title: 'ZMF Atrium', handle: 'zmf-atrium', vendor: 'ZMF', product_type: 'Headphones' },
        { id: 'gid://shopify/Product/7234567890126', title: 'ZMF Caldera', handle: 'zmf-caldera', vendor: 'ZMF', product_type: 'Headphones' },
      ])
    } catch (error) {
      logger.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load product data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMapping = (configId: string, shopifyProductId: string) => {
    setMapping(prev => ({
      ...prev,
      [configId]: shopifyProductId
    }))
  }

  const saveMapping = async (configId: string) => {
    try {
      const response = await fetch(`/api/product-configurations/${configId}/mapping`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopify_product_id: mapping[configId] }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product mapping saved successfully',
        })
        loadData()
      }
    } catch (error) {
      logger.error('Error saving mapping:', error)
      toast({
        title: 'Error',
        description: 'Failed to save product mapping',
        variant: 'destructive',
      })
    }
  }

  const removeMapping = async (configId: string) => {
    try {
      const response = await fetch(`/api/product-configurations/${configId}/mapping`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMapping(prev => {
          const newMapping = { ...prev }
          delete newMapping[configId]
          return newMapping
        })
        toast({
          title: 'Success',
          description: 'Product mapping removed',
        })
        loadData()
      }
    } catch (error) {
      logger.error('Error removing mapping:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove product mapping',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopify Product Mapping</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {configurations.map((config) => (
            <div key={config.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{config.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={config.is_active ? 'success' : 'secondary'}>
                      {config.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {config.shopify_product_id && (
                      <Badge variant="outline">
                        <Link className="h-3 w-3 mr-1" />
                        Mapped
                      </Badge>
                    )}
                  </div>
                </div>
                {config.shopify_product_id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMapping(config.id)}
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Shopify Product</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={mapping[config.id] || ''}
                    onChange={(e) => handleMapping(config.id, e.target.value)}
                  >
                    <option value="">Select a Shopify product...</option>
                    {shopifyProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.title} ({product.handle})
                      </option>
                    ))}
                  </select>
                </div>

                {mapping[config.id] && mapping[config.id] !== config.shopify_product_id && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveMapping(config.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save Mapping
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMapping(prev => ({
                          ...prev,
                          [config.id]: config.shopify_product_id || ''
                        }))
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}

                {config.shopify_product_id && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>API Endpoint:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      /api/shopify/product-config/{config.shopify_product_id}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => window.open(`/api/shopify/product-config/${config.shopify_product_id}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Integration Instructions</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            <li>Map each product configuration to its corresponding Shopify product</li>
            <li>Use the API endpoint in your Shopify theme to fetch configurations</li>
            <li>The configuration will be available immediately after mapping</li>
            <li>Test the integration using the endpoint preview button</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}