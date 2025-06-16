"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"

interface OrderFormData {
  customerName: string
  customerEmail: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  model: string
  woodType: string
  grilleColor: string
  chassisMaterial: string
  installedPads: string
  specialInstructions: string
  priority: "normal" | "high" | "urgent"
  dueDate: Date | undefined
}

interface CreateOrderFormProps {
  onSubmit: (orderData: OrderFormData) => void
  onCancel: () => void
}

const headphoneModels = [
  "Verite Closed",
  "Verite Open",
  "Caldera Closed",
  "Caldera Open",
  "Auteur",
  "Aeolus",
  "Atticus",
  "Eikon",
  "BOKEH",
  "Atrium",
]

const woodTypes = ["Sapele", "Cocobolo", "Ash", "Cherry", "Walnut", "Maple", "Katalox", "Ebony", "Padauk"]

const grilleColors = ["Black", "Silver", "Gold", "Copper", "Custom"]

const chassisMaterials = ["Aluminum", "Magnesium", "Standard", "Carbon Fiber"]

const padOptions = [
  "Universe Perforated",
  "Universe Solid",
  "Caldera Pads",
  "Auteur Pads",
  "Aeolus Pads",
  "Atticus Pads",
  "Eikon Pads",
  "BOKEH Pads",
  "Atrium Pads",
]

export function CreateOrderForm({ onSubmit, onCancel }: CreateOrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: "",
    customerEmail: "",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
    model: "",
    woodType: "",
    grilleColor: "",
    chassisMaterial: "",
    installedPads: "",
    specialInstructions: "",
    priority: "normal",
    dueDate: undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateFormData = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof OrderFormData] as any),
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const isFormValid = () => {
    return (
      formData.customerName &&
      formData.customerEmail &&
      formData.shippingAddress.street &&
      formData.shippingAddress.city &&
      formData.model &&
      formData.woodType
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary text-2xl">Create New Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-theme-text-secondary">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-theme-text-secondary">Customer Name *</Label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => updateFormData("customerName", e.target.value)}
                    className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label className="text-theme-text-secondary">Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => updateFormData("customerEmail", e.target.value)}
                    className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-theme-text-secondary">Shipping Address</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-theme-text-secondary">Street Address *</Label>
                  <Input
                    value={formData.shippingAddress.street}
                    onChange={(e) => updateFormData("shippingAddress.street", e.target.value)}
                    className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary"
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-theme-text-secondary">City *</Label>
                    <Input
                      value={formData.shippingAddress.city}
                      onChange={(e) => updateFormData("shippingAddress.city", e.target.value)}
                      className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary"
                      placeholder="Chicago"
                    />
                  </div>
                  <div>
                    <Label className="text-theme-text-secondary">State</Label>
                    <Input
                      value={formData.shippingAddress.state}
                      onChange={(e) => updateFormData("shippingAddress.state", e.target.value)}
                      className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary"
                      placeholder="IL"
                    />
                  </div>
                  <div>
                    <Label className="text-theme-text-secondary">ZIP Code</Label>
                    <Input
                      value={formData.shippingAddress.zipCode}
                      onChange={(e) => updateFormData("shippingAddress.zipCode", e.target.value)}
                      className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary"
                      placeholder="60601"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-theme-text-secondary">Product Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-theme-text-secondary">Headphone Model *</Label>
                  <Select value={formData.model} onValueChange={(value) => updateFormData("model", value)}>
                    <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="bg-theme-bg-secondary border-theme-border-primary">
                      {headphoneModels.map((model) => (
                        <SelectItem key={model} value={model} className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-theme-text-secondary">Wood Type *</Label>
                  <Select value={formData.woodType} onValueChange={(value) => updateFormData("woodType", value)}>
                    <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                      <SelectValue placeholder="Select wood type" />
                    </SelectTrigger>
                    <SelectContent className="bg-theme-bg-secondary border-theme-border-primary">
                      {woodTypes.map((wood) => (
                        <SelectItem key={wood} value={wood} className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                          {wood}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-theme-text-secondary">Grille Color</Label>
                  <Select value={formData.grilleColor} onValueChange={(value) => updateFormData("grilleColor", value)}>
                    <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent className="bg-theme-bg-secondary border-theme-border-primary">
                      {grilleColors.map((color) => (
                        <SelectItem key={color} value={color} className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-theme-text-secondary">Chassis Material</Label>
                  <Select
                    value={formData.chassisMaterial}
                    onValueChange={(value) => updateFormData("chassisMaterial", value)}
                  >
                    <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent className="bg-theme-bg-secondary border-theme-border-primary">
                      {chassisMaterials.map((material) => (
                        <SelectItem key={material} value={material} className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                          {material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-theme-text-secondary">Installed Pads</Label>
                  <Select
                    value={formData.installedPads}
                    onValueChange={(value) => updateFormData("installedPads", value)}
                  >
                    <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                      <SelectValue placeholder="Select pads" />
                    </SelectTrigger>
                    <SelectContent className="bg-theme-bg-secondary border-theme-border-primary">
                      {padOptions.map((pad) => (
                        <SelectItem key={pad} value={pad} className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                          {pad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-theme-text-secondary">Order Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-theme-text-secondary">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => updateFormData("priority", value)}>
                    <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-theme-bg-secondary border-theme-border-primary">
                      <SelectItem value="normal" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                        Normal
                      </SelectItem>
                      <SelectItem value="high" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                        High
                      </SelectItem>
                      <SelectItem value="urgent" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                        Urgent
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-theme-text-secondary">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left bg-theme-bg-primary border-theme-border-primary text-theme-text-primary hover:bg-theme-brand-secondary/20"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dueDate ? format(formData.dueDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-theme-bg-secondary border-theme-border-primary">
                      <Calendar
                        mode="single"
                        selected={formData.dueDate}
                        onSelect={(date) => updateFormData("dueDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label className="text-theme-text-secondary">Special Instructions</Label>
                <Textarea
                  value={formData.specialInstructions}
                  onChange={(e) => updateFormData("specialInstructions", e.target.value)}
                  className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary placeholder-gray-400"
                  placeholder="Any special requirements or notes..."
                  rows={4}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-theme-border-primary">
              <Button type="button" onClick={onCancel} className="flex-1 bg-gray-600 hover:bg-gray-700 text-theme-text-primary">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid()}
                className="flex-1 bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
