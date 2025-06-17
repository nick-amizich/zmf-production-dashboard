'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  TreePine, 
  AlertTriangle, 
  TrendingDown, 
  Plus, 
  Minus, 
  Search, 
  Filter,
  FileText,
  Download,
  Upload,
  ShoppingCart,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react'

// Mock data
const mockWoodInventory = [
  {
    id: '1',
    woodType: 'African Blackwood',
    supplier: 'Exotic Woods Inc',
    lotNumber: 'LOT-2024-001',
    quantityBoardFeet: 150,
    quantityReserved: 45,
    quantityAvailable: 105,
    costPerBoardFoot: 125.00,
    location: 'Rack A-1',
    grade: 'Premium',
    reorderPoint: 50,
    receivedDate: '2024-01-10',
    lastUsed: '2024-01-18'
  },
  {
    id: '2',
    woodType: 'Padauk',
    supplier: 'Global Timber Co',
    lotNumber: 'LOT-2024-002',
    quantityBoardFeet: 80,
    quantityReserved: 20,
    quantityAvailable: 60,
    costPerBoardFoot: 45.00,
    location: 'Rack A-2',
    grade: 'Select',
    reorderPoint: 75,
    receivedDate: '2024-01-05',
    lastUsed: '2024-01-17'
  },
  {
    id: '3',
    woodType: 'Camphor Burl',
    supplier: 'Exotic Woods Inc',
    lotNumber: 'LOT-2023-098',
    quantityBoardFeet: 25,
    quantityReserved: 15,
    quantityAvailable: 10,
    costPerBoardFoot: 200.00,
    location: 'Rack B-1',
    grade: 'Premium',
    reorderPoint: 30,
    receivedDate: '2023-12-15',
    lastUsed: '2024-01-16'
  },
  {
    id: '4',
    woodType: 'Stabilized Maple',
    supplier: 'Northwest Hardwoods',
    lotNumber: 'LOT-2024-003',
    quantityBoardFeet: 200,
    quantityReserved: 50,
    quantityAvailable: 150,
    costPerBoardFoot: 85.00,
    location: 'Rack C-1',
    grade: 'Select',
    reorderPoint: 100,
    receivedDate: '2024-01-12',
    lastUsed: '2024-01-18'
  }
]

const mockComponentInventory = [
  {
    id: '1',
    componentType: 'driver',
    componentName: 'Biocellulose Driver 50mm',
    sku: 'DRV-BIO-50',
    quantityOnHand: 48,
    quantityReserved: 16,
    quantityAvailable: 32,
    unitCost: 145.00,
    supplier: 'Audio Components Ltd',
    location: 'Shelf D-2',
    reorderPoint: 20,
    leadTimeDays: 14,
    lastReceived: '2024-01-08'
  },
  {
    id: '2',
    componentType: 'chassis',
    componentName: 'Aluminum Chassis - Standard',
    sku: 'CHS-ALU-001',
    quantityOnHand: 35,
    quantityReserved: 10,
    quantityAvailable: 25,
    unitCost: 75.00,
    supplier: 'Precision Parts Co',
    location: 'Shelf E-1',
    reorderPoint: 15,
    leadTimeDays: 10,
    lastReceived: '2024-01-10'
  },
  {
    id: '3',
    componentType: 'cable',
    componentName: 'OFC Cable 6ft',
    sku: 'CBL-OFC-6FT',
    quantityOnHand: 12,
    quantityReserved: 8,
    quantityAvailable: 4,
    unitCost: 45.00,
    supplier: 'Cable Solutions',
    location: 'Shelf F-3',
    reorderPoint: 10,
    leadTimeDays: 7,
    lastReceived: '2024-01-15'
  },
  {
    id: '4',
    componentType: 'padding',
    componentName: 'Lambskin Ear Pads (Pair)',
    sku: 'PAD-LAMB-01',
    quantityOnHand: 28,
    quantityReserved: 12,
    quantityAvailable: 16,
    unitCost: 65.00,
    supplier: 'Comfort Audio Supplies',
    location: 'Shelf G-2',
    reorderPoint: 20,
    leadTimeDays: 21,
    lastReceived: '2024-01-05'
  }
]

const mockRecentTransactions = [
  {
    id: '1',
    type: 'issue',
    itemName: 'African Blackwood',
    quantity: -2.5,
    reference: 'Build ATT-24-00098',
    performedBy: 'Mike Johnson',
    timestamp: '2024-01-18 14:30'
  },
  {
    id: '2',
    type: 'receipt',
    itemName: 'Biocellulose Driver 50mm',
    quantity: 24,
    reference: 'PO-2024-0156',
    performedBy: 'Jane Doe',
    timestamp: '2024-01-18 10:15'
  },
  {
    id: '3',
    type: 'reserve',
    itemName: 'Padauk',
    quantity: -5,
    reference: 'Batch BATCH-2024-001',
    performedBy: 'Tom Wilson',
    timestamp: '2024-01-17 16:45'
  },
  {
    id: '4',
    type: 'adjustment',
    itemName: 'OFC Cable 6ft',
    quantity: -1,
    reference: 'Damaged in storage',
    performedBy: 'Steve Brown',
    timestamp: '2024-01-17 09:00'
  }
]

export default function InventoryMockup() {
  const [activeTab, setActiveTab] = useState('wood')
  const [searchTerm, setSearchTerm] = useState('')

  const criticalWoodItems = mockWoodInventory.filter(item => item.quantityAvailable < item.reorderPoint)
  const criticalComponentItems = mockComponentInventory.filter(item => item.quantityAvailable < item.reorderPoint)

  const totalWoodValue = mockWoodInventory.reduce((acc, item) => acc + (item.quantityBoardFeet * item.costPerBoardFoot), 0)
  const totalComponentValue = mockComponentInventory.reduce((acc, item) => acc + (item.quantityOnHand * item.unitCost), 0)

  const transactionTypeColors = {
    issue: 'text-theme-status-error',
    receipt: 'text-theme-status-success',
    reserve: 'text-theme-status-warning',
    adjustment: 'text-theme-status-info'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-theme-text-primary">Inventory Management</h1>
            <p className="text-theme-text-tertiary mt-1">Track wood stock and component inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-theme-border-secondary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="border-theme-border-secondary">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-theme-brand-primary hover:bg-theme-brand-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Receive Stock
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Total Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-text-primary">
                ${((totalWoodValue + totalComponentValue) / 1000).toFixed(1)}k
              </div>
              <p className="text-xs text-theme-text-tertiary">Wood + Components</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-warning">
                {criticalWoodItems.length + criticalComponentItems.length}
              </div>
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

        {/* Main Inventory Tabs */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-theme-text-primary">Inventory</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-tertiary w-4 h-4" />
                <Input
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-theme-bg-primary border-theme-border-secondary"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-theme-bg-primary mb-6">
                <TabsTrigger value="wood" className="gap-2">
                  <TreePine className="w-4 h-4" />
                  Wood Inventory
                </TabsTrigger>
                <TabsTrigger value="components" className="gap-2">
                  <Package className="w-4 h-4" />
                  Components
                </TabsTrigger>
                <TabsTrigger value="transactions" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Activity
                </TabsTrigger>
              </TabsList>

              {/* Wood Inventory Tab */}
              <TabsContent value="wood" className="space-y-4">
                {mockWoodInventory.map((item) => {
                  const utilizationPercent = ((item.quantityBoardFeet - item.quantityAvailable) / item.quantityBoardFeet) * 100
                  const isLowStock = item.quantityAvailable < item.reorderPoint

                  return (
                    <Card key={item.id} className="bg-theme-bg-primary border-theme-border-secondary">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-theme-text-primary">{item.woodType}</h3>
                                <Badge variant="outline" className="text-theme-text-tertiary">
                                  {item.grade}
                                </Badge>
                                {isLowStock && (
                                  <Badge className="bg-theme-status-warning text-white">
                                    Low Stock
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-theme-text-tertiary">
                                <span>Lot: {item.lotNumber}</span>
                                <span>•</span>
                                <span>{item.supplier}</span>
                                <span>•</span>
                                <span>Location: {item.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-theme-text-primary">
                                ${(item.quantityBoardFeet * item.costPerBoardFoot).toLocaleString()}
                              </div>
                              <div className="text-sm text-theme-text-tertiary">
                                ${item.costPerBoardFoot}/bf
                              </div>
                            </div>
                          </div>

                          {/* Stock Levels */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-theme-text-tertiary">Stock Levels</span>
                              <span className="text-theme-text-primary">
                                {item.quantityAvailable} / {item.quantityBoardFeet} board feet available
                              </span>
                            </div>
                            <div className="space-y-1">
                              <Progress value={utilizationPercent} className="h-2" />
                              <div className="flex justify-between text-xs">
                                <span className="text-theme-text-tertiary">
                                  Reserved: {item.quantityReserved} bf
                                </span>
                                <span className={isLowStock ? 'text-theme-status-warning' : 'text-theme-text-tertiary'}>
                                  Reorder at: {item.reorderPoint} bf
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-theme-border-secondary">
                            <div className="text-sm text-theme-text-tertiary">
                              Last used: {item.lastUsed}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-theme-border-secondary">
                                <Minus className="w-4 h-4 mr-2" />
                                Issue
                              </Button>
                              <Button variant="outline" size="sm" className="border-theme-border-secondary">
                                <Plus className="w-4 h-4 mr-2" />
                                Receive
                              </Button>
                              <Button variant="outline" size="sm" className="border-theme-border-secondary">
                                <FileText className="w-4 h-4 mr-2" />
                                History
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </TabsContent>

              {/* Components Tab */}
              <TabsContent value="components" className="space-y-4">
                {mockComponentInventory.map((item) => {
                  const utilizationPercent = ((item.quantityOnHand - item.quantityAvailable) / item.quantityOnHand) * 100
                  const isLowStock = item.quantityAvailable < item.reorderPoint

                  return (
                    <Card key={item.id} className="bg-theme-bg-primary border-theme-border-secondary">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-theme-text-primary">{item.componentName}</h3>
                                <Badge variant="outline" className="text-theme-text-tertiary">
                                  {item.componentType}
                                </Badge>
                                {isLowStock && (
                                  <Badge className="bg-theme-status-warning text-white">
                                    Low Stock
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-theme-text-tertiary">
                                <span>SKU: {item.sku}</span>
                                <span>•</span>
                                <span>{item.supplier}</span>
                                <span>•</span>
                                <span>Location: {item.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-theme-text-primary">
                                ${(item.quantityOnHand * item.unitCost).toLocaleString()}
                              </div>
                              <div className="text-sm text-theme-text-tertiary">
                                ${item.unitCost}/unit
                              </div>
                            </div>
                          </div>

                          {/* Stock Levels */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-theme-text-tertiary">Stock Levels</span>
                              <span className="text-theme-text-primary">
                                {item.quantityAvailable} / {item.quantityOnHand} units available
                              </span>
                            </div>
                            <div className="space-y-1">
                              <Progress value={utilizationPercent} className="h-2" />
                              <div className="flex justify-between text-xs">
                                <span className="text-theme-text-tertiary">
                                  Reserved: {item.quantityReserved} units
                                </span>
                                <span className={isLowStock ? 'text-theme-status-warning' : 'text-theme-text-tertiary'}>
                                  Reorder at: {item.reorderPoint} units • Lead time: {item.leadTimeDays} days
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-theme-border-secondary">
                            <div className="text-sm text-theme-text-tertiary">
                              Last received: {item.lastReceived}
                            </div>
                            <div className="flex items-center gap-2">
                              {isLowStock && (
                                <Button size="sm" className="bg-theme-status-warning hover:bg-theme-status-warning/90 text-white">
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Order Now
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="border-theme-border-secondary">
                                <Minus className="w-4 h-4 mr-2" />
                                Issue
                              </Button>
                              <Button variant="outline" size="sm" className="border-theme-border-secondary">
                                <FileText className="w-4 h-4 mr-2" />
                                History
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="space-y-4">
                <div className="space-y-2">
                  {mockRecentTransactions.map((transaction) => (
                    <Card key={transaction.id} className="bg-theme-bg-primary border-theme-border-secondary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`font-medium ${transactionTypeColors[transaction.type as keyof typeof transactionTypeColors]}`}>
                              {transaction.type.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-theme-text-primary">{transaction.itemName}</div>
                              <div className="text-sm text-theme-text-tertiary">{transaction.reference}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${transaction.quantity > 0 ? 'text-theme-status-success' : 'text-theme-status-error'}`}>
                              {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {transaction.itemName.includes('wood') ? 'bf' : 'units'}
                            </div>
                            <div className="text-sm text-theme-text-tertiary">
                              {transaction.performedBy} • {transaction.timestamp}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-primary">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="border-theme-border-secondary justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Inventory Report
              </Button>
              <Button variant="outline" className="border-theme-border-secondary justify-start">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Create PO
              </Button>
              <Button variant="outline" className="border-theme-border-secondary justify-start">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Low Stock Alert
              </Button>
              <Button variant="outline" className="border-theme-border-secondary justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Value Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}