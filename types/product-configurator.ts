export interface ProductOption {
  id: string
  name: string
  type: 'variant' | 'property' // Variant affects SKU/inventory, property is custom
  values: OptionValue[]
  required: boolean
  displayOrder: number
}

export interface OptionValue {
  id: string
  name: string
  priceModifier: number // Additional cost in cents
  sku?: string // For variant options
  available: boolean
  metadata?: {
    color?: string
    image?: string
    description?: string
  }
}

export interface ProductModel {
  id: string
  name: string
  basePrice: number // In cents
  baseSku: string
  description: string
  options: ProductOption[]
  images: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ConfiguratorData {
  models: ProductModel[]
  activeModelId: string | null
}

export interface SelectedConfiguration {
  modelId: string
  selectedOptions: Record<string, string> // optionId -> valueId
  calculatedPrice: number
  generatedSku: string
}