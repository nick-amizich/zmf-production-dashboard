'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, ShoppingCart, Package, AlertCircle } from "lucide-react"
import { ProductModel, SelectedConfiguration } from "@/types/product-configurator"

interface ConfigurationPreviewProps {
  model: ProductModel
}

export default function ConfigurationPreview({ model }: ConfigurationPreviewProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [configuration, setConfiguration] = useState<SelectedConfiguration | null>(null)

  // Initialize required options
  useEffect(() => {
    const initialSelections: Record<string, string> = {}
    model.options.forEach(option => {
      if (option.required && option.values.length > 0) {
        const firstAvailable = option.values.find(v => v.available)
        if (firstAvailable) {
          initialSelections[option.id] = firstAvailable.id
        }
      }
    })
    setSelectedOptions(initialSelections)
  }, [model])

  // Calculate price and SKU whenever selections change
  useEffect(() => {
    let totalPrice = model.basePrice
    let skuParts = [model.baseSku]
    
    Object.entries(selectedOptions).forEach(([optionId, valueId]) => {
      const option = model.options.find(o => o.id === optionId)
      const value = option?.values.find(v => v.id === valueId)
      
      if (value) {
        totalPrice += value.priceModifier
        if (option?.type === 'variant' && value.sku) {
          skuParts.push(value.sku)
        }
      }
    })

    setConfiguration({
      modelId: model.id,
      selectedOptions,
      calculatedPrice: totalPrice,
      generatedSku: skuParts.join('-')
    })
  }, [selectedOptions, model])

  const handleOptionChange = (optionId: string, valueId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: valueId
    }))
  }

  const isConfigurationComplete = model.options
    .filter(o => o.required)
    .every(o => selectedOptions[o.id])

  const variantOptions = model.options.filter(o => o.type === 'variant')
  const propertyOptions = model.options.filter(o => o.type === 'property')

  const generateShopifyAddToCart = () => {
    const properties: Record<string, string> = {}
    
    propertyOptions.forEach(option => {
      const valueId = selectedOptions[option.id]
      const value = option.values.find(v => v.id === valueId)
      if (value) {
        properties[option.name] = value.name
      }
    })

    return {
      variant: configuration?.generatedSku,
      properties,
      price: configuration?.calculatedPrice
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure {model.name}</CardTitle>
          <CardDescription>
            Select your customization options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {variantOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Variants
              </h3>
              <p className="text-sm text-muted-foreground">
                These options will create different SKUs and affect inventory
              </p>
              {variantOptions.map(option => (
                <div key={option.id} className="space-y-2">
                  <Label htmlFor={option.id}>
                    {option.name}
                    {option.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {option.values.length <= 5 ? (
                    <RadioGroup
                      value={selectedOptions[option.id] || ''}
                      onValueChange={(value) => handleOptionChange(option.id, value)}
                    >
                      {option.values.map(value => (
                        <div key={value.id} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={value.id} 
                            id={value.id}
                            disabled={!value.available}
                          />
                          <Label 
                            htmlFor={value.id}
                            className={`flex items-center gap-2 ${
                              !value.available ? 'opacity-50' : ''
                            }`}
                          >
                            {value.name}
                            {value.priceModifier > 0 && (
                              <Badge variant="secondary">
                                +${(value.priceModifier / 100).toFixed(2)}
                              </Badge>
                            )}
                            {!value.available && (
                              <Badge variant="destructive">Out of Stock</Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Select
                      value={selectedOptions[option.id] || ''}
                      onValueChange={(value) => handleOptionChange(option.id, value)}
                    >
                      <SelectTrigger id={option.id}>
                        <SelectValue placeholder={`Select ${option.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {option.values.map(value => (
                          <SelectItem 
                            key={value.id} 
                            value={value.id}
                            disabled={!value.available}
                          >
                            {value.name}
                            {value.priceModifier > 0 && ` (+$${(value.priceModifier / 100).toFixed(2)})`}
                            {!value.available && ' (Out of Stock)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}

          {propertyOptions.length > 0 && (
            <>
              {variantOptions.length > 0 && <Separator />}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Customization Options
                </h3>
                <p className="text-sm text-muted-foreground">
                  Additional options that don't affect inventory
                </p>
                {propertyOptions.map(option => (
                  <div key={option.id} className="space-y-2">
                    <Label htmlFor={option.id}>
                      {option.name}
                      {option.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Select
                      value={selectedOptions[option.id] || ''}
                      onValueChange={(value) => handleOptionChange(option.id, value)}
                    >
                      <SelectTrigger id={option.id}>
                        <SelectValue placeholder={`Select ${option.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {option.values.map(value => (
                          <SelectItem 
                            key={value.id} 
                            value={value.id}
                            disabled={!value.available}
                          >
                            {value.name}
                            {value.priceModifier > 0 && ` (+$${(value.priceModifier / 100).toFixed(2)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch space-y-4">
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Price</p>
              <p className="text-2xl font-bold">
                ${configuration ? (configuration.calculatedPrice / 100).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="font-mono text-sm">{configuration?.generatedSku}</p>
            </div>
          </div>
          <Button 
            className="w-full" 
            size="lg"
            disabled={!isConfigurationComplete}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shopify Integration Preview</CardTitle>
          <CardDescription>
            How this configuration would be sent to Shopify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{JSON.stringify(generateShopifyAddToCart(), null, 2)}</code>
          </pre>
        </CardContent>
      </Card>

      {variantOptions.length >= 3 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Shopify Variant Limit</AlertTitle>
          <AlertDescription>
            This model uses {variantOptions.length} variant options, which is at Shopify's limit. 
            Any additional options must be line item properties.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}