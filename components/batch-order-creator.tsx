"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { logger } from '@/lib/logger'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Package,
  ShoppingCart,
  Clock,
  Upload,
  MessageSquare,
} from "lucide-react"

interface HeadphoneModel {
  id: string
  name: string
  productionTime: number // hours
  complexity: "Medium" | "High" | "Very High"
  description: string
  shopifyProductId?: string
  defaultPads: {
    leather: string
    vegan: string
  }
  availablePads: {
    leather: string[]
    vegan: string[]
  }
}

interface WoodOption {
  id: string
  name: string
  category: "Standard" | "Premium" | "Limited"
  description: string
  shopifyOptionId?: string
  inStock: boolean
}

interface ChassisOption {
  id: string
  name: string
  shopifyOptionId?: string
  inStock: boolean
}

interface GrilleOption {
  id: string
  name: string
  shopifyOptionId?: string
  inStock: boolean
}

interface HeadbandOption {
  id: string
  name: string
  shopifyOptionId?: string
  inStock: boolean
}

interface HeadphoneConfig {
  id: string
  woodType: string
  chassisMaterial: string
  grilleColor: string
  headbandMaterial: string
  installedPads: string
  generatedSKU?: string
}

interface BatchConfig {
  batchNumber: string
  model: string
  quantity: number
  headphones: HeadphoneConfig[]
  priority: "standard" | "rush"
  internalNotes: string
  technicianNotes: string
  customerField: string
  isSpeculative: boolean
  skipCables: boolean
  pushOption: "draft" | "internal" | "variants"
  referenceImages: string[]
}

interface ChassisType {
  id: string
  name: string
  description: string
  icon: string
  background: string
}

// Mock Shopify data - in real implementation, this would come from Shopify API
const mockShopifyData = {
  products: {
    "verite-open": {
      id: "gid://shopify/Product/123456789",
      options: ["Wood Type", "Chassis Material", "Grille Color", "Headband", "Pads"],
    },
  },
  woodOptions: [
    { shopifyId: "wood_sapele", name: "Sapele", inStock: true },
    { shopifyId: "wood_cherry", name: "Cherry", inStock: true },
    { shopifyId: "wood_walnut", name: "Walnut", inStock: false },
    { shopifyId: "wood_cocobolo", name: "Cocobolo", inStock: true },
  ],
}

const chassisTypes: ChassisType[] = [
  {
    id: "all-leather",
    name: "All Leather",
    description: "Traditional ZMF aesthetic with premium leather components",
    icon: "🐄",
    background: "bg-amber-900/20",
  },
  {
    id: "vegan",
    name: "Vegan Option",
    description: "Cruelty-free alternative with vegan suede materials",
    icon: "🌱",
    background: "bg-green-900/20",
  },
]

const headphoneModels: HeadphoneModel[] = [
  {
    id: "verite-open",
    name: "Verite Open",
    productionTime: 8,
    complexity: "High",
    description: "Flagship open-back with exceptional detail",
    shopifyProductId: "gid://shopify/Product/123456789",
    defaultPads: {
      leather: "Auteur Lambskin",
      vegan: "BE2 Vegan Suede",
    },
    availablePads: {
      leather: ["Auteur Lambskin", "Universe Lambskin Perf", "BE2 Lambskin"],
      vegan: ["Auteur Vegan Suede", "Universe Vegan Suede Perf", "BE2 Vegan Suede"],
    },
  },
  {
    id: "verite-closed",
    name: "Verite Closed",
    productionTime: 8,
    complexity: "High",
    description: "Flagship closed-back with incredible dynamics",
    shopifyProductId: "gid://shopify/Product/123456790",
    defaultPads: {
      leather: "Auteur Lambskin",
      vegan: "BE2 Vegan Suede",
    },
    availablePads: {
      leather: ["Auteur Lambskin", "Universe Lambskin Perf", "BE2 Lambskin"],
      vegan: ["Auteur Vegan Suede", "Universe Vegan Suede Perf", "BE2 Vegan Suede"],
    },
  },
  {
    id: "caldera-open",
    name: "Caldera Open",
    productionTime: 12,
    complexity: "Very High",
    description: "Reference-level open-back flagship",
    shopifyProductId: "gid://shopify/Product/123456791",
    defaultPads: {
      leather: "Caldera Lambskin",
      vegan: "Caldera Vegan Suede",
    },
    availablePads: {
      leather: ["Caldera Lambskin", "Caldera Hybrid", "Caldera Thin Lambskin"],
      vegan: ["Caldera Vegan Suede", "Caldera Hybrid Vegan", "Caldera Thin Vegan Suede"],
    },
  },
  {
    id: "caldera-closed",
    name: "Caldera Closed",
    productionTime: 12,
    complexity: "Very High",
    description: "Reference-level closed-back flagship",
    shopifyProductId: "gid://shopify/Product/123456792",
    defaultPads: {
      leather: "Caldera Lambskin",
      vegan: "Caldera Vegan Suede",
    },
    availablePads: {
      leather: ["Caldera Lambskin", "Caldera Hybrid", "Caldera Thin Lambskin"],
      vegan: ["Caldera Vegan Suede", "Caldera Hybrid Vegan", "Caldera Thin Vegan Suede"],
    },
  },
  {
    id: "auteur",
    name: "Auteur Classic",
    productionTime: 6,
    complexity: "Medium",
    description: "Balanced and musical open-back",
    shopifyProductId: "gid://shopify/Product/123456793",
    defaultPads: {
      leather: "Auteur Lambskin Perforated",
      vegan: "Auteur Vegan Suede Perforated",
    },
    availablePads: {
      leather: ["Auteur Lambskin Perforated", "Caldera Ultra Perf"],
      vegan: ["Auteur Vegan Suede Perforated", "Caldera Ultra Perf Vegan"],
    },
  },
  {
    id: "atrium-open",
    name: "Atrium Open",
    productionTime: 6,
    complexity: "Medium",
    description: "Energetic and engaging open-back",
    shopifyProductId: "gid://shopify/Product/123456794",
    defaultPads: {
      leather: "Universe Lambskin Perforated",
      vegan: "Universe Vegan Suede Perforated",
    },
    availablePads: {
      leather: ["Universe Lambskin Perforated", "Caldera Ultra Perf"],
      vegan: ["Universe Vegan Suede Perforated", "Caldera Ultra Perf Vegan"],
    },
  },
  {
    id: "aeolus",
    name: "Aeolus",
    productionTime: 5,
    complexity: "Medium",
    description: "Warm and smooth open-back",
    shopifyProductId: "gid://shopify/Product/123456795",
    defaultPads: {
      leather: "Universe Perforated Lambskin",
      vegan: "Universe Perforated Vegan Suede",
    },
    availablePads: {
      leather: ["Universe Perforated Lambskin"],
      vegan: ["Universe Perforated Vegan Suede"],
    },
  },
  {
    id: "eikon",
    name: "Eikon",
    productionTime: 6,
    complexity: "Medium",
    description: "Dynamic closed-back with punch",
    shopifyProductId: "gid://shopify/Product/123456796",
    defaultPads: {
      leather: "Eikon Lamb",
      vegan: "Eikon Vegan Suede",
    },
    availablePads: {
      leather: ["Eikon Lamb"],
      vegan: ["Eikon Vegan Suede"],
    },
  },
]

const woodOptions: WoodOption[] = [
  {
    id: "sapele",
    name: "Sapele",
    category: "Standard",
    description: "Classic ZMF wood with warm tone",
    shopifyOptionId: "wood_sapele",
    inStock: true,
  },
  {
    id: "cherry",
    name: "Cherry",
    category: "Standard",
    description: "Rich reddish-brown with smooth grain",
    shopifyOptionId: "wood_cherry",
    inStock: true,
  },
  {
    id: "walnut",
    name: "Walnut",
    category: "Standard",
    description: "Dark chocolate brown with striking grain",
    shopifyOptionId: "wood_walnut",
    inStock: false,
  },
  {
    id: "maple",
    name: "Maple",
    category: "Standard",
    description: "Light colored with subtle grain",
    shopifyOptionId: "wood_maple",
    inStock: true,
  },
  {
    id: "ash",
    name: "Ash",
    category: "Standard",
    description: "Light with pronounced grain pattern",
    shopifyOptionId: "wood_ash",
    inStock: true,
  },
  {
    id: "oak",
    name: "Oak",
    category: "Standard",
    description: "Traditional hardwood with character",
    shopifyOptionId: "wood_oak",
    inStock: true,
  },
  {
    id: "cocobolo",
    name: "Cocobolo",
    category: "Premium",
    description: "Exotic rosewood with orange hues",
    shopifyOptionId: "wood_cocobolo",
    inStock: true,
  },
  {
    id: "katalox",
    name: "Katalox",
    category: "Premium",
    description: "Dense purple heartwood, extremely rare",
    shopifyOptionId: "wood_katalox",
    inStock: false,
  },
  {
    id: "ziricote",
    name: "Ziricote",
    category: "Limited",
    description: "Dramatic black streaks on brown",
    shopifyOptionId: "wood_ziricote",
    inStock: true,
  },
  {
    id: "canary",
    name: "Canary",
    category: "Limited",
    description: "Bright yellow exotic hardwood",
    shopifyOptionId: "wood_canary",
    inStock: false,
  },
  {
    id: "black-limba",
    name: "Black Limba",
    category: "Standard",
    description: "Dark with subtle grain",
    shopifyOptionId: "wood_black_limba",
    inStock: true,
  },
]

const chassisOptions: ChassisOption[] = [
  { id: "aluminum", name: "Aluminum (Standard)", shopifyOptionId: "chassis_aluminum", inStock: true },
  { id: "aluminum-black", name: "Aluminum Black", shopifyOptionId: "chassis_aluminum_black", inStock: true },
  { id: "aluminum-charcoal", name: "Aluminum Charcoal", shopifyOptionId: "chassis_aluminum_charcoal", inStock: true },
  { id: "aluminum-ruby", name: "Aluminum Ruby", shopifyOptionId: "chassis_aluminum_ruby", inStock: false },
  { id: "aluminum-aegean", name: "Aluminum Aegean Blue", shopifyOptionId: "chassis_aluminum_aegean", inStock: true },
  { id: "leather", name: "Leather Chassis", shopifyOptionId: "chassis_leather", inStock: true },
  { id: "vegan", name: "Vegan Chassis", shopifyOptionId: "chassis_vegan", inStock: true },
]

const grilleOptions: GrilleOption[] = [
  { id: "black", name: "Black (Standard)", shopifyOptionId: "grille_black", inStock: true },
  { id: "steel", name: "Steel", shopifyOptionId: "grille_steel", inStock: true },
  { id: "brass", name: "Brass", shopifyOptionId: "grille_brass", inStock: false },
  { id: "gunmetal", name: "GunMetal", shopifyOptionId: "grille_gunmetal", inStock: true },
  { id: "rose-gold", name: "Rose Gold", shopifyOptionId: "grille_rose_gold", inStock: true },
  { id: "aged-copper", name: "Aged Copper", shopifyOptionId: "grille_aged_copper", inStock: true },
  { id: "coffee-gold", name: "Coffee Gold", shopifyOptionId: "grille_coffee_gold", inStock: false },
]

const headbandOptions: HeadbandOption[] = [
  {
    id: "leather-leather",
    name: "Leather Headband & Leather Strap",
    shopifyOptionId: "headband_leather_leather",
    inStock: true,
  },
  {
    id: "leather-black-bbb",
    name: "Leather Headband & Black BBB Strap",
    shopifyOptionId: "headband_leather_black_bbb",
    inStock: true,
  },
  {
    id: "leather-ruby-bbb",
    name: "Leather Headband & Ruby BBB Strap",
    shopifyOptionId: "headband_leather_ruby_bbb",
    inStock: false,
  },
  {
    id: "leather-blue-bbb",
    name: "Leather Headband & Blue BBB Strap",
    shopifyOptionId: "headband_leather_blue_bbb",
    inStock: true,
  },
  { id: "all-leather", name: "All Leather", shopifyOptionId: "headband_all_leather", inStock: true },
  { id: "vegan", name: "Vegan Options", shopifyOptionId: "headband_vegan", inStock: true },
]

interface BatchOrderCreatorProps {
  onBack: () => void
}

export default function BatchOrderCreator({ onBack }: BatchOrderCreatorProps) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [shopifyConnected, setShopifyConnected] = useState(true)
  const [syncingWithShopify, setSyncingWithShopify] = useState(false)
  const [batchConfig, setBatchConfig] = useState<BatchConfig>({
    batchNumber: `SPEC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    model: "",
    quantity: 2,
    headphones: [],
    priority: "standard",
    internalNotes: "",
    technicianNotes: "",
    customerField: "Internal Build",
    isSpeculative: true,
    skipCables: true,
    pushOption: "draft",
    referenceImages: [],
  })

  const selectedModel = headphoneModels.find((m) => m.id === batchConfig.model)

  // Shopify Integration Functions
  const syncWithShopify = async () => {
    setSyncingWithShopify(true)
    try {
      // Mock API call to sync with Shopify
      await new Promise((resolve) => setTimeout(resolve, 2000))
      logger.debug("Synced with Shopify successfully")
    } catch (error) {
      logger.error("Failed to sync with Shopify:", error)
    } finally {
      setSyncingWithShopify(false)
    }
  }

  const generateSKU = (headphone: HeadphoneConfig, modelId: string) => {
    const model = headphoneModels.find((m) => m.id === modelId)
    if (!model) return ""

    const wood = woodOptions.find((w) => w.id === headphone.woodType)
    const chassis = chassisOptions.find((c) => c.id === headphone.chassisMaterial)
    const grille = grilleOptions.find((g) => g.id === headphone.grilleColor)

    return `${model.name.replace(/\s+/g, "").toUpperCase()}-${wood?.name.toUpperCase()}-${chassis?.name.split(" ")[0].toUpperCase()}-${grille?.name.toUpperCase()}`
  }

  // Initialize headphones when quantity changes
  const initializeHeadphones = (quantity: number) => {
    const currentModel = headphoneModels.find((m) => m.id === batchConfig.model)
    const newHeadphones: HeadphoneConfig[] = []
    for (let i = 0; i < quantity; i++) {
      newHeadphones.push({
        id: `hp-${i + 1}`,
        woodType: "",
        chassisMaterial: "aluminum",
        grilleColor: "black",
        headbandMaterial: "leather-leather",
        installedPads: currentModel?.defaultPads.leather || "",
      })
    }
    setBatchConfig((prev) => ({ ...prev, headphones: newHeadphones }))
  }

  // Calculate batch totals
  const batchTotals = useMemo(() => {
    if (!selectedModel) return { totalTime: 0, efficiency: 100 }

    const totalTime = selectedModel.productionTime * batchConfig.quantity

    // Calculate efficiency based on wood variety
    const uniqueWoods = new Set(batchConfig.headphones.map((hp) => hp.woodType)).size
    let efficiency = 100
    if (uniqueWoods > 1) efficiency -= (uniqueWoods - 1) * 15
    if (batchConfig.quantity < 3) efficiency -= 20
    if (batchConfig.quantity > 8) efficiency -= 10

    const chassisTypeConsistency = new Set(batchConfig.headphones.map((hp) => hp.chassisMaterial)).size

    if (chassisTypeConsistency > 1) efficiency -= 15

    return { totalTime, efficiency: Math.max(0, efficiency) }
  }, [selectedModel, batchConfig])

  const handleModelSelect = (modelId: string) => {
    setBatchConfig((prev) => ({ ...prev, model: modelId }))
    setCurrentStep(2)
    // Initialize headphones with the default quantity when model is selected
    initializeHeadphones(batchConfig.quantity)
  }

  const handleQuantityChange = (quantity: number) => {
    setBatchConfig((prev) => ({ ...prev, quantity }))
    initializeHeadphones(quantity)
  }

  const updateHeadphone = (index: number, field: keyof HeadphoneConfig, value: string) => {
    setBatchConfig((prev) => ({
      ...prev,
      headphones: prev.headphones.map((hp, i) => {
        if (i === index) {
          const updatedHp = { ...hp, [field]: value }
          // Generate SKU when configuration changes
          if (field !== "generatedSKU") {
            updatedHp.generatedSKU = generateSKU(updatedHp, batchConfig.model)
          }
          return updatedHp
        }
        return hp
      }),
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In real implementation, upload to cloud storage and get URLs
      const newImageUrls = Array.from(files).map((file) => URL.createObjectURL(file))
      setBatchConfig((prev) => ({
        ...prev,
        referenceImages: [...prev.referenceImages, ...newImageUrls],
      }))
    }
  }

  const removeImage = (index: number) => {
    setBatchConfig((prev) => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index),
    }))
  }

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2:
        return batchConfig.model !== ""
      case 3:
        return batchConfig.headphones.every((hp) => hp.woodType !== "")
      case 4:
        return batchConfig.headphones.every((hp) => hp.chassisMaterial && hp.grilleColor && hp.headbandMaterial)
      case 5:
        return batchConfig.headphones.every((hp) => hp.installedPads !== "")
      default:
        return true
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              step < currentStep
                ? "bg-theme-status-success text-theme-text-primary"
                : step === currentStep
                  ? "bg-theme-brand-secondary text-theme-text-primary"
                  : "bg-gray-600 text-theme-text-tertiary"
            }`}
          >
            {step < currentStep ? <Check className="h-5 w-5" /> : step}
          </div>
          {index < 4 && <div className={`w-16 h-1 mx-2 ${step < currentStep ? "bg-theme-status-success" : "bg-gray-600"}`} />}
        </div>
      ))}
    </div>
  )

  const renderShopifyStatus = () => (
    <Card className="bg-theme-bg-secondary border-theme-border-primary mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${shopifyConnected ? "bg-theme-status-success" : "bg-theme-status-error"}`} />
            <span className="text-theme-text-primary font-medium">
              Shopify Integration: {shopifyConnected ? "Connected" : "Disconnected"}
            </span>
            {syncingWithShopify && <span className="text-theme-text-tertiary">Syncing...</span>}
          </div>
          <Button
            onClick={syncWithShopify}
            disabled={syncingWithShopify}
            className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
            size="sm"
          >
            {syncingWithShopify ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      {renderShopifyStatus()}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-theme-text-secondary mb-2">Select Headphone Model</h2>
        <p className="text-theme-text-tertiary">All headphones in this batch must be the same model</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {headphoneModels.map((model) => (
          <Card
            key={model.id}
            className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-pointer group"
            onClick={() => handleModelSelect(model.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="h-32 bg-gradient-to-br from-[#8B4513]/20 to-[#d4a574]/20 rounded-lg mb-4 flex items-center justify-center">
                <Package className="h-16 w-16 text-theme-text-secondary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-lg font-bold text-theme-text-secondary mb-2">{model.name}</h3>
              <p className="text-sm text-theme-text-tertiary mb-3">{model.description}</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-theme-text-tertiary">Production:</span>
                  <span className="text-theme-text-primary">{model.productionTime}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-tertiary">Shopify:</span>
                  <span className="text-theme-status-success">✓ Linked</span>
                </div>
                <Badge
                  className={`w-full ${
                    model.complexity === "Medium"
                      ? "bg-theme-status-success"
                      : model.complexity === "High"
                        ? "bg-theme-status-warning"
                        : "bg-theme-status-error"
                  }`}
                >
                  {model.complexity} Complexity
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-theme-text-secondary mb-2">Batch Size & Wood Selection</h2>
        <p className="text-theme-text-tertiary">Configure {selectedModel?.name} batch</p>
      </div>

      {/* Batch Size Selector */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary">Batch Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Label className="text-theme-text-primary">Quantity:</Label>
            <Select
              value={batchConfig.quantity.toString()}
              onValueChange={(value) => handleQuantityChange(Number.parseInt(value))}
            >
              <SelectTrigger className="w-32 bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-theme-bg-secondary border-theme-border-primary z-50">
                {Array.from({ length: 11 }, (_, i) => i + 2).map((num) => (
                  <SelectItem key={num} value={num.toString()} className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                    {num} headphones
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge
              className={`${
                batchTotals.efficiency >= 80
                  ? "bg-theme-status-success"
                  : batchTotals.efficiency >= 60
                    ? "bg-theme-status-warning"
                    : "bg-theme-status-error"
              }`}
            >
              {batchTotals.efficiency}% Efficiency
            </Badge>
          </div>

          {batchTotals.efficiency < 80 && (
            <div className="flex items-center gap-2 text-theme-status-warning text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Consider grouping similar wood types for better efficiency</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Headphone Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batchConfig.headphones.map((headphone, index) => (
          <Card key={headphone.id} className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader>
              <CardTitle className="text-theme-text-secondary text-lg">Headphone #{index + 1}</CardTitle>
              {headphone.generatedSKU && <p className="text-xs text-theme-text-tertiary font-mono">{headphone.generatedSKU}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-theme-text-primary">Wood Type</Label>
                <Select value={headphone.woodType} onValueChange={(value) => updateHeadphone(index, "woodType", value)}>
                  <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                    <SelectValue placeholder="Select wood" />
                  </SelectTrigger>
                  <SelectContent className="bg-theme-bg-secondary border-theme-border-primary z-50">
                    {woodOptions.map((wood) => (
                      <SelectItem
                        key={wood.id}
                        value={wood.id}
                        className="text-theme-text-primary hover:bg-theme-brand-secondary/20"
                        disabled={!wood.inStock}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={!wood.inStock ? "text-theme-text-tertiary" : ""}>{wood.name}</span>
                          {!wood.inStock && <Badge className="ml-2 bg-theme-status-error">Out of Stock</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {headphone.woodType && (
                <div className="text-xs text-theme-text-tertiary">
                  {woodOptions.find((w) => w.id === headphone.woodType)?.description}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button onClick={() => setCurrentStep(1)} className="bg-gray-600 hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep(3)}
          disabled={!canProceedToStep(3)}
          className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-theme-text-secondary mb-2">Chassis & Grille Options</h2>
        <p className="text-theme-text-tertiary">Configure hardware options for each headphone</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {batchConfig.headphones.map((headphone, index) => (
          <Card
            key={headphone.id}
            className={`bg-theme-bg-secondary border-theme-border-primary ${chassisTypes.find((ct) => ct.id === headphone.chassisMaterial)?.background}`}
          >
            <CardHeader>
              <CardTitle className="text-theme-text-secondary">
                Headphone #{index + 1} - {woodOptions.find((w) => w.id === headphone.woodType)?.name}
              </CardTitle>
              {headphone.generatedSKU && <p className="text-xs text-theme-text-tertiary font-mono">{headphone.generatedSKU}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-theme-text-primary">Chassis Material</Label>
                <Select
                  value={headphone.chassisMaterial}
                  onValueChange={(value) => {
                    updateHeadphone(index, "chassisMaterial", value)
                    // Auto-adjust headband material and pads based on chassis material
                    if (value === "vegan") {
                      updateHeadphone(index, "headbandMaterial", "vegan")
                      updateHeadphone(index, "installedPads", selectedModel?.defaultPads.vegan || "")
                    } else if (value === "leather") {
                      updateHeadphone(index, "headbandMaterial", "all-leather")
                      updateHeadphone(index, "installedPads", selectedModel?.defaultPads.leather || "")
                    }
                  }}
                >
                  <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-theme-bg-secondary border-theme-border-primary z-50">
                    {chassisOptions.map((chassis) => (
                      <SelectItem
                        key={chassis.id}
                        value={chassis.id}
                        className="text-theme-text-primary hover:bg-theme-brand-secondary/20"
                        disabled={!chassis.inStock}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={!chassis.inStock ? "text-theme-text-tertiary" : ""}>{chassis.name}</span>
                          {!chassis.inStock && <Badge className="ml-2 bg-theme-status-error">Out of Stock</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-theme-text-primary">Grille Color</Label>
                <Select
                  value={headphone.grilleColor}
                  onValueChange={(value) => updateHeadphone(index, "grilleColor", value)}
                >
                  <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-theme-bg-secondary border-theme-border-primary z-50">
                    {grilleOptions.map((grille) => (
                      <SelectItem
                        key={grille.id}
                        value={grille.id}
                        className="text-theme-text-primary hover:bg-theme-brand-secondary/20"
                        disabled={!grille.inStock}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={!grille.inStock ? "text-theme-text-tertiary" : ""}>{grille.name}</span>
                          {!grille.inStock && <Badge className="ml-2 bg-theme-status-error">Out of Stock</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-theme-text-primary">Headband & Strap</Label>
                <Select
                  value={headphone.headbandMaterial}
                  onValueChange={(value) => updateHeadphone(index, "headbandMaterial", value)}
                  disabled={headphone.chassisMaterial === "vegan"}
                >
                  <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-theme-bg-secondary border-theme-border-primary z-50">
                    {headbandOptions.map((headband) => (
                      <SelectItem
                        key={headband.id}
                        value={headband.id}
                        className="text-theme-text-primary hover:bg-theme-brand-secondary/20"
                        disabled={!headband.inStock}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={!headband.inStock ? "text-theme-text-tertiary" : ""}>{headband.name}</span>
                          {!headband.inStock && <Badge className="ml-2 bg-theme-status-error">Out of Stock</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button onClick={() => setCurrentStep(2)} className="bg-gray-600 hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep(4)}
          disabled={!canProceedToStep(4)}
          className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-theme-text-secondary mb-2">Installed Pads</h2>
        <p className="text-theme-text-tertiary">Select ear pads for each headphone</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batchConfig.headphones.map((headphone, index) => (
          <Card
            key={headphone.id}
            className={`bg-theme-bg-secondary border-theme-border-primary ${chassisTypes.find((ct) => ct.id === headphone.chassisMaterial)?.background}`}
          >
            <CardHeader>
              <CardTitle className="text-theme-text-secondary text-lg">Headphone #{index + 1}</CardTitle>
              <p className="text-sm text-theme-text-tertiary">{woodOptions.find((w) => w.id === headphone.woodType)?.name}</p>
              {headphone.generatedSKU && <p className="text-xs text-theme-text-tertiary font-mono">{headphone.generatedSKU}</p>}
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-theme-text-primary">Installed Pads</Label>
                <Select
                  value={headphone.installedPads}
                  onValueChange={(value) => updateHeadphone(index, "installedPads", value)}
                >
                  <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                    <SelectValue placeholder="Select pads" />
                  </SelectTrigger>
                  <SelectContent className="bg-theme-bg-secondary border-theme-border-primary z-50">
                    {headphone.chassisMaterial === "vegan"
                      ? selectedModel?.availablePads.vegan.map((pad) => (
                          <SelectItem key={pad} value={pad} className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                            {pad}
                            {pad === selectedModel.defaultPads.vegan && (
                              <Badge className="ml-2 bg-theme-status-success">Default</Badge>
                            )}
                          </SelectItem>
                        ))
                      : selectedModel?.availablePads.leather.map((pad) => (
                          <SelectItem key={pad} value={pad} className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                            {pad}
                            {pad === selectedModel.defaultPads.leather && (
                              <Badge className="ml-2 bg-theme-status-success">Default</Badge>
                            )}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button onClick={() => setCurrentStep(3)} className="bg-gray-600 hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep(5)}
          disabled={!canProceedToStep(5)}
          className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
        >
          Review Batch
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-theme-text-secondary mb-2">Batch Summary & Shopify Push</h2>
        <p className="text-theme-text-tertiary">Review configuration and push to Shopify</p>
      </div>

      {/* Batch Overview */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary">Batch Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-theme-text-tertiary text-sm">Batch Number</div>
              <div className="text-theme-text-primary font-bold">{batchConfig.batchNumber}</div>
            </div>
            <div>
              <div className="text-theme-text-tertiary text-sm">Model</div>
              <div className="text-theme-text-primary font-bold">{selectedModel?.name}</div>
            </div>
            <div>
              <div className="text-theme-text-tertiary text-sm">Quantity</div>
              <div className="text-theme-text-primary font-bold">{batchConfig.quantity} headphones</div>
            </div>
            <div>
              <div className="text-theme-text-tertiary text-sm">Wood Types</div>
              <div className="text-theme-text-primary font-bold">
                {new Set(batchConfig.headphones.map((hp) => woodOptions.find((w) => w.id === hp.woodType)?.name)).size}{" "}
                types
              </div>
            </div>
            <div>
              <div className="text-theme-text-tertiary text-sm">Production Time</div>
              <div className="text-theme-text-primary font-bold flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {batchTotals.totalTime}h
              </div>
            </div>
            <div>
              <div className="text-theme-text-tertiary text-sm">Efficiency</div>
              <div className="text-theme-text-primary font-bold">
                <Badge
                  className={`${
                    batchTotals.efficiency >= 80
                      ? "bg-theme-status-success"
                      : batchTotals.efficiency >= 60
                        ? "bg-theme-status-warning"
                        : "bg-theme-status-error"
                  }`}
                >
                  {batchTotals.efficiency}%
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-theme-text-tertiary text-sm">Production Priority</div>
              <div className="text-theme-text-primary font-bold">
                {batchTotals.efficiency >= 80 ? "High" : batchTotals.efficiency >= 60 ? "Medium" : "Low"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technician Notes & Reference Images */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Technician Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-theme-text-primary">Notes for Technicians</Label>
            <Textarea
              value={batchConfig.technicianNotes}
              onChange={(e) => setBatchConfig((prev) => ({ ...prev, technicianNotes: e.target.value }))}
              className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary placeholder-gray-400"
              placeholder="Special instructions for workers (e.g., 'Use specific cup set from shelf B-3', 'Pay attention to grain direction', etc.)"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-theme-text-primary">Reference Images</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById("image-upload")?.click()}
                  className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
                <span className="text-theme-text-tertiary text-sm">
                  Upload photos of specific cups, grain patterns, or assembly references
                </span>
              </div>

              {batchConfig.referenceImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {batchConfig.referenceImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-theme-border-primary"
                      />
                      <Button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-theme-status-error hover:bg-red-700 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        size="sm"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Headphones */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary">Individual Headphones & SKUs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batchConfig.headphones.map((headphone, index) => {
              const wood = woodOptions.find((w) => w.id === headphone.woodType)
              const chassis = chassisOptions.find((c) => c.id === headphone.chassisMaterial)
              const grille = grilleOptions.find((g) => g.id === headphone.grilleColor)
              const headband = headbandOptions.find((h) => h.id === headphone.headbandMaterial)

              return (
                <div
                  key={headphone.id}
                  className={`border border-theme-border-primary rounded-lg p-4 ${chassisTypes.find((ct) => ct.id === headphone.chassisMaterial)?.background}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-theme-text-secondary font-bold">Headphone #{index + 1}</h4>
                    <span>{chassisTypes.find((ct) => ct.id === headphone.chassisMaterial)?.icon}</span>
                  </div>
                  {headphone.generatedSKU && (
                    <div className="mb-3 p-2 bg-theme-bg-primary rounded border border-theme-border-secondary">
                      <span className="text-xs text-theme-text-tertiary">Generated SKU:</span>
                      <div className="text-sm font-mono text-theme-text-secondary">{headphone.generatedSKU}</div>
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-theme-text-tertiary">Wood:</span>
                      <span className="text-theme-text-primary">{wood?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-text-tertiary">Chassis:</span>
                      <span className="text-theme-text-primary">{chassis?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-text-tertiary">Grille:</span>
                      <span className="text-theme-text-primary">{grille?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-text-tertiary">Headband:</span>
                      <span className="text-theme-text-primary">
                        {headphone.chassisMaterial === "vegan" ? "Vegan" : headband?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-text-tertiary">Pads:</span>
                      <span className="text-theme-text-primary">{headphone.installedPads}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Creation Preview */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary">Order Creation Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-theme-text-tertiary">Individual Shopify Orders:</span>
              <Badge className="bg-theme-status-info">{batchConfig.quantity} orders</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-theme-text-tertiary">Production Batch:</span>
              <Badge className="bg-theme-brand-secondary">1 batch ({batchConfig.batchNumber})</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-theme-text-tertiary">Worker Assignment:</span>
              <Badge className="bg-theme-status-success">Auto-assign to Intake</Badge>
            </div>

            <div className="mt-4 p-3 bg-theme-bg-primary rounded border border-theme-border-secondary">
              <h4 className="text-theme-text-secondary text-sm font-medium mb-2">Order Numbers Preview:</h4>
              <div className="space-y-1 text-xs font-mono">
                {batchConfig.headphones.map((_, index) => (
                  <div key={index} className="text-theme-text-tertiary">
                    HP #{index + 1}: ZMF-{new Date().getFullYear()}-
                    {String(Math.floor(Math.random() * 10000)).padStart(4, "0")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shopify Integration */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary">Shopify Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-theme-text-primary">Push Option</Label>
              <Select
                value={batchConfig.pushOption}
                onValueChange={(value: "draft" | "internal" | "variants") =>
                  setBatchConfig((prev) => ({ ...prev, pushOption: value }))
                }
              >
                <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-theme-bg-secondary border-theme-border-primary z-50">
                  <SelectItem value="draft" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                    Create as Draft Orders
                  </SelectItem>
                  <SelectItem value="internal" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                    Create as Internal Orders
                  </SelectItem>
                  <SelectItem value="variants" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                    Generate SKU Variants
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-theme-text-primary">Priority Level</Label>
              <Select
                value={batchConfig.priority}
                onValueChange={(value: "standard" | "rush") => setBatchConfig((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-theme-bg-secondary border-theme-border-primary z-50">
                  <SelectItem value="standard" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                    Standard
                  </SelectItem>
                  <SelectItem value="rush" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                    Rush
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="speculative"
                checked={batchConfig.isSpeculative}
                onCheckedChange={(checked) =>
                  setBatchConfig((prev) => ({ ...prev, isSpeculative: checked as boolean }))
                }
              />
              <Label htmlFor="speculative" className="text-theme-text-primary">
                Mark as Speculative Build
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip-cables"
                checked={batchConfig.skipCables}
                onCheckedChange={(checked) => setBatchConfig((prev) => ({ ...prev, skipCables: checked as boolean }))}
              />
              <Label htmlFor="skip-cables" className="text-theme-text-primary">
                Skip cables for now
              </Label>
            </div>
          </div>

          <div>
            <Label className="text-theme-text-primary">Customer Field</Label>
            <Input
              value={batchConfig.customerField}
              onChange={(e) => setBatchConfig((prev) => ({ ...prev, customerField: e.target.value }))}
              className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary"
              placeholder="Internal Build"
            />
          </div>

          <div>
            <Label className="text-theme-text-primary">Internal Notes (Management)</Label>
            <Textarea
              value={batchConfig.internalNotes}
              onChange={(e) => setBatchConfig((prev) => ({ ...prev, internalNotes: e.target.value }))}
              className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary placeholder-gray-400"
              placeholder="Internal notes for management tracking..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={() => setCurrentStep(4)} className="bg-gray-600 hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="space-y-2">
          <div className="text-right text-sm text-theme-text-tertiary">
            Will create {batchConfig.quantity} individual Shopify orders
          </div>
          <Button
            onClick={handlePushToShopify}
            className="bg-theme-status-success hover:bg-green-700 text-theme-text-primary px-8 py-3 text-lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            CREATE {batchConfig.quantity} ORDERS & PUSH TO PRODUCTION
          </Button>
        </div>
      </div>
    </div>
  )

  const handlePushToShopify = async () => {
    try {
      // Create individual Shopify orders
      const shopifyOrders = await Promise.all(
        batchConfig.headphones.map(async (headphone, index) => {
          const orderData = {
            customer: batchConfig.customerField,
            lineItems: [
              {
                productId: selectedModel?.shopifyProductId,
                sku: headphone.generatedSKU,
                quantity: 1,
                customAttributes: {
                  woodType: headphone.woodType,
                  chassisMaterial: headphone.chassisMaterial,
                  grilleColor: headphone.grilleColor,
                  headbandMaterial: headphone.headbandMaterial,
                  installedPads: headphone.installedPads,
                  batchNumber: batchConfig.batchNumber,
                  headphoneNumber: index + 1,
                },
              },
            ],
            tags: [
              `batch:${batchConfig.batchNumber}`,
              `priority:${batchConfig.priority}`,
              batchConfig.isSpeculative ? "speculative" : "production",
            ],
            note: batchConfig.internalNotes,
          }

          // Mock Shopify API call
          return await createShopifyOrder(orderData)
        }),
      )

      // Push batch to production system
      const productionBatch = {
        batchNumber: batchConfig.batchNumber,
        model: batchConfig.model,
        quantity: batchConfig.quantity,
        headphones: batchConfig.headphones.map((hp, index) => ({
          ...hp,
          shopifyOrderId: shopifyOrders[index].id,
          orderNumber: shopifyOrders[index].orderNumber,
        })),
        technicianNotes: batchConfig.technicianNotes,
        referenceImages: batchConfig.referenceImages,
        priority: batchConfig.priority,
        estimatedCompletionTime: batchTotals.totalTime,
        createdAt: new Date().toISOString(),
        status: "ready-for-production",
        currentStage: "intake",
        assignedWorkers: [],
      }

      await pushToProductionSystem(productionBatch)

      logger.debug("Successfully created:", {
        shopifyOrders: shopifyOrders.length,
        productionBatch: productionBatch.batchNumber,
      })

      // Show success and redirect
      alert(
        `Successfully created ${shopifyOrders.length} Shopify orders and pushed batch ${batchConfig.batchNumber} to production!`,
      )
      onBack()
    } catch (error) {
      logger.error("Failed to push batch:", error)
      alert("Failed to create batch. Please try again.")
    }
  }

  // Mock API functions (replace with real implementations)
  const createShopifyOrder = async (orderData: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      id: `gid://shopify/Order/${Math.random().toString(36).substr(2, 9)}`,
      orderNumber: `ZMF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      status: batchConfig.pushOption === "draft" ? "draft" : "pending",
    }
  }

  const pushToProductionSystem = async (batchData: any) => {
    // Simulate pushing to production system
    await new Promise((resolve) => setTimeout(resolve, 500))
    logger.debug("Batch pushed to production system:", batchData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-theme-text-secondary mb-2">Create Speculative Batch</h1>
          <div className="flex items-center gap-4 text-theme-text-tertiary">
            <span>Batch: {batchConfig.batchNumber}</span>
            <span>•</span>
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>Manager: Production Team</span>
          </div>
        </div>
        <Button onClick={onBack} className="bg-gray-600 hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Progress Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <div className="max-w-6xl mx-auto">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>
    </div>
  )
}
