"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, Wrench, Package } from "lucide-react"

interface SubassemblyViewProps {
  onBack: () => void
}

const chassisOrders = [
  { model: "Verite Closed", chassisType: "Aluminum", quantity: 8, dueDate: "2024-01-20" },
  { model: "Caldera Open", chassisType: "Magnesium", quantity: 4, dueDate: "2024-01-18" },
  { model: "Auteur", chassisType: "Aluminum", quantity: 12, dueDate: "2024-01-25" },
  { model: "Aeolus", chassisType: "Aluminum", quantity: 6, dueDate: "2024-01-22" },
]

const baffleOrders = [
  { model: "Verite Closed", quantity: 8, dueDate: "2024-01-20" },
  { model: "Caldera Open", quantity: 4, dueDate: "2024-01-18" },
  { model: "Auteur", quantity: 12, dueDate: "2024-01-25" },
  { model: "Aeolus", quantity: 6, dueDate: "2024-01-22" },
  { model: "Atticus", quantity: 3, dueDate: "2024-01-24" },
]

export default function SubassemblyView({ onBack }: SubassemblyViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-theme-text-tertiary mb-6">
        <Button 
          onClick={onBack}
          className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary h-10 px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <span>→</span>
        <span>Batch Management</span>
        <span>→</span>
        <span className="text-theme-text-secondary">Subassembly Management</span>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-theme-text-secondary mb-2">Subassembly Management</h1>
        <p className="text-theme-text-tertiary">Manage chassis and baffle production requirements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Chassis Types Section */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-secondary flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Chassis Types Needed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {chassisOrders.map((order, index) => (
              <div key={index} className="bg-theme-bg-primary p-4 rounded border border-theme-border-secondary">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-theme-text-primary font-semibold">{order.model}</h3>
                    <p className="text-theme-text-secondary text-sm">{order.chassisType} Chassis</p>
                  </div>
                  <Badge className="bg-theme-brand-secondary text-theme-text-primary">{order.quantity} needed</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-theme-text-tertiary text-sm">Due: {order.dueDate}</span>
                  <Button 
                    size="sm" 
                    className="bg-theme-status-info hover:bg-blue-700 text-theme-text-primary"
                    onClick={() => {
                      alert(`Adding ${order.model} chassis to batch queue`)
                    }}
                  >
                    Add to Batch
                  </Button>
                </div>
              </div>
            ))}

            <Button 
              className="w-full bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
              onClick={() => {
                const chassisNeeded = chassisOrders.reduce((sum, order) => sum + order.quantity, 0)
                alert(`Creating chassis batch for ${chassisNeeded} units`)
              }}
            >
              <Package className="h-4 w-4 mr-2" />
              Create Chassis Batch
            </Button>
          </CardContent>
        </Card>

        {/* Baffle Assemblies Section */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-secondary flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Baffle Assemblies Needed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {baffleOrders.map((order, index) => (
              <div key={index} className="bg-theme-bg-primary p-4 rounded border border-theme-border-secondary">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-theme-text-primary font-semibold">{order.model}</h3>
                    <p className="text-theme-text-secondary text-sm">Model-Specific Baffle</p>
                  </div>
                  <Badge className="bg-theme-brand-secondary text-theme-text-primary">{order.quantity} needed</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-theme-text-tertiary text-sm">Due: {order.dueDate}</span>
                  <Button 
                    size="sm" 
                    className="bg-theme-status-success hover:bg-green-700 text-theme-text-primary"
                    onClick={() => {
                      alert(`Adding ${order.model} baffle to batch queue`)
                    }}
                  >
                    Add to Batch
                  </Button>
                </div>
              </div>
            ))}

            <Button 
              className="w-full bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
              onClick={() => {
                const bafflesNeeded = baffleOrders.reduce((sum, order) => sum + order.quantity, 0)
                alert(`Creating baffle batch for ${bafflesNeeded} units`)
              }}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Create Baffle Batch
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}