'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TreePine, Package, AlertTriangle, Plus } from 'lucide-react'

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-theme-text-primary">Inventory Management</h1>
            <p className="text-theme-text-tertiary mt-1">Track wood stock and component inventory</p>
          </div>
          <Button className="bg-theme-brand-primary hover:bg-theme-brand-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Receive Stock
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Total Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-text-primary">$45.2k</div>
              <p className="text-xs text-theme-text-tertiary">Wood + Components</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-warning">3</div>
              <p className="text-xs text-theme-text-tertiary">Below reorder point</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-info">5</div>
              <p className="text-xs text-theme-text-tertiary">In transit</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Reserved Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-text-primary">23%</div>
              <p className="text-xs text-theme-text-tertiary">Of total inventory</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-primary">Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <TreePine className="w-16 h-16 mx-auto text-theme-text-tertiary mb-4" />
              <p className="text-theme-text-tertiary">
                Full inventory management system is being developed.
              </p>
              <p className="text-sm text-theme-text-tertiary mt-2">
                This will include wood stock tracking, component inventory, and material reservations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}