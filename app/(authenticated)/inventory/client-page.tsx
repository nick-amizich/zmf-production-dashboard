'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  TreePine, 
  Package, 
  AlertTriangle, 
  Plus, 
  History, 
  TrendingDown, 
  ArrowUpDown,
  ShoppingCart,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { Database } from '@/types/database.types'

type WoodInventory = Database['public']['Tables']['wood_inventory']['Row'] & {
  reservations?: Array<{
    id: string
    quantity: number
    reserved_for_type: string
    reserved_for_id: string
    notes: string | null
    created_at: string
  }>
}

type ComponentInventory = Database['public']['Tables']['component_inventory']['Row'] & {
  reservations?: Array<{
    id: string
    quantity: number
    reserved_for_type: string
    reserved_for_id: string
    notes: string | null
    created_at: string
  }>
}

export default function InventoryClient() {
  const [woodInventory, setWoodInventory] = useState<WoodInventory[]>([])
  const [componentInventory, setComponentInventory] = useState<ComponentInventory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('wood')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [metrics, setMetrics] = useState({
    totalValue: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    reservedPercentage: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchInventory()
    fetchMetrics()
  }, [])

  const fetchInventory = async () => {
    try {
      // Fetch wood inventory
      const { data: woodData, error: woodError } = await supabase
        .from('wood_inventory')
        .select('*')
        .eq('is_active', true)
        .order('wood_type')

      if (woodError) {
        console.error('Error fetching wood inventory:', woodError)
      } else {
        setWoodInventory(woodData || [])
      }

      // Fetch component inventory
      const { data: componentData, error: componentError } = await supabase
        .from('component_inventory')
        .select('*')
        .eq('is_active', true)
        .order('component_name')

      if (componentError) {
        console.error('Error fetching component inventory:', componentError)
      } else {
        setComponentInventory(componentData || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      // Calculate total value
      const { data: woodValue } = await supabase
        .from('wood_inventory')
        .select('total_cost')
        .eq('is_active', true)

      const { data: componentValue } = await supabase
        .from('component_inventory')
        .select('total_value')
        .eq('is_active', true)

      let totalValue = 0
      woodValue?.forEach(item => {
        totalValue += item.total_cost || 0
      })
      componentValue?.forEach(item => {
        totalValue += item.total_value || 0
      })

      // Count low stock items
      const { count: lowWood } = await supabase
        .from('wood_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .filter('quantity_board_feet', 'lte', 'reorder_point')

      const { count: lowComponent } = await supabase
        .from('component_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .filter('quantity_on_hand', 'lte', 'reorder_point')

      const lowStockItems = (lowWood || 0) + (lowComponent || 0)

      // Count pending orders (placeholder - would need purchase_orders table)
      const pendingOrders = 5

      // Calculate reserved percentage
      const { data: totalReserved } = await supabase
        .from('material_reservations')
        .select('quantity')
        .eq('is_active', true)

      let totalReservedQty = 0
      totalReserved?.forEach(res => {
        totalReservedQty += res.quantity || 0
      })

      // Get total quantities for percentage calculation
      const { data: woodQty } = await supabase
        .from('wood_inventory')
        .select('quantity_board_feet')
        .eq('is_active', true)
      
      const { data: componentQty } = await supabase
        .from('component_inventory')
        .select('quantity_on_hand')
        .eq('is_active', true)

      let totalQty = 0
      woodQty?.forEach(item => {
        totalQty += item.quantity_board_feet || 0
      })
      componentQty?.forEach(item => {
        totalQty += item.quantity_on_hand || 0
      })

      const reservedPercentage = totalQty > 0 ? Math.round((totalReservedQty / totalQty) * 100) : 0

      setMetrics({
        totalValue: Math.round(totalValue),
        lowStockItems,
        pendingOrders,
        reservedPercentage
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const getStockStatus = (current: number, reorderPoint: number, minStock: number) => {
    if (current <= minStock) return { label: 'Critical', color: 'bg-theme-status-error' }
    if (current <= reorderPoint) return { label: 'Low', color: 'bg-theme-status-warning' }
    return { label: 'Good', color: 'bg-theme-status-success' }
  }

  const filteredWoodInventory = woodInventory.filter(item => {
    const matchesSearch = 
      item.wood_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (filterStatus === 'low') {
      matchesStatus = (item.quantity_board_feet || 0) <= (item.reorder_point || 0)
    } else if (filterStatus === 'critical') {
      matchesStatus = (item.quantity_board_feet || 0) <= (item.reorder_point || 0) / 2
    }
    
    return matchesSearch && matchesStatus
  })

  const filteredComponentInventory = componentInventory.filter(item => {
    const matchesSearch = 
      item.component_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.component_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (filterStatus === 'low') {
      matchesStatus = (item.quantity_on_hand || 0) <= (item.reorder_point || 0)
    } else if (filterStatus === 'critical') {
      matchesStatus = (item.quantity_on_hand || 0) <= (item.reorder_point || 0) / 2
    }
    
    return matchesSearch && matchesStatus
  })

  const sortedWoodInventory = [...filteredWoodInventory].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.wood_type || '').localeCompare(b.wood_type || '')
      case 'stock':
        return (b.quantity_board_feet || 0) - (a.quantity_board_feet || 0)
      case 'value':
        return (b.total_cost || 0) - (a.total_cost || 0)
      default:
        return 0
    }
  })

  const sortedComponentInventory = [...filteredComponentInventory].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.component_name || '').localeCompare(b.component_name || '')
      case 'stock':
        return (b.quantity_on_hand || 0) - (a.quantity_on_hand || 0)
      case 'value':
        return (b.total_value || 0) - (a.total_value || 0)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-theme-text-tertiary">Loading inventory...</div>
        </div>
      </div>
    )
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
          <div className="flex gap-2">
            <Button variant="outline" className="border-theme-border-secondary">
              <History className="w-4 h-4 mr-2" />
              View History
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
              <div className="text-2xl font-bold text-theme-text-primary">${(metrics.totalValue / 1000).toFixed(1)}k</div>
              <p className="text-xs text-theme-text-tertiary">Wood + Components</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-warning">{metrics.lowStockItems}</div>
              <p className="text-xs text-theme-text-tertiary">Below reorder point</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-info">{metrics.pendingOrders}</div>
              <p className="text-xs text-theme-text-tertiary">In transit</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Reserved Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-text-primary">{metrics.reservedPercentage}%</div>
              <p className="text-xs text-theme-text-tertiary">Of total inventory</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardContent className="p-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-tertiary w-4 h-4" />
                  <Input
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-theme-bg-primary border-theme-border-secondary"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-theme-bg-primary border-theme-border-secondary">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="critical">Critical Stock</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-theme-bg-primary border-theme-border-secondary">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="stock">Stock Level</SelectItem>
                  <SelectItem value="value">Total Value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="wood" className="flex items-center gap-2">
                  <TreePine className="w-4 h-4" />
                  Wood Stock ({woodInventory.length})
                </TabsTrigger>
                <TabsTrigger value="components" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Components ({componentInventory.length})
                </TabsTrigger>
              </TabsList>

              {/* Wood Inventory */}
              <TabsContent value="wood" className="space-y-4">
                {sortedWoodInventory.length === 0 ? (
                  <div className="text-center py-8">
                    <TreePine className="w-12 h-12 mx-auto text-theme-text-tertiary mb-4" />
                    <p className="text-theme-text-tertiary">No wood inventory found</p>
                  </div>
                ) : (
                  sortedWoodInventory.map((item) => {
                    const status = getStockStatus(
                      item.quantity_board_feet || 0,
                      item.reorder_point || 0,
                      (item.reorder_point || 0) / 2
                    )
                    const reserved = item.quantity_reserved || 0
                    const available = item.quantity_available || 0
                    const value = item.total_cost || 0

                    return (
                      <Card key={item.id} className="bg-theme-bg-primary border-theme-border-secondary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-theme-text-primary">
                                  {item.wood_type}
                                </h3>
                                <Badge className={`${status.color} text-white`}>
                                  {status.label}
                                </Badge>
                                {item.grade && (
                                  <Badge variant="outline" className="border-theme-border-secondary">
                                    Grade {item.grade}
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-theme-text-tertiary">In Stock:</span>
                                  <span className="ml-2 font-medium text-theme-text-primary">
                                    {item.quantity_board_feet} BF
                                  </span>
                                </div>
                                <div>
                                  <span className="text-theme-text-tertiary">Available:</span>
                                  <span className="ml-2 font-medium text-theme-text-primary">
                                    {available} BF
                                  </span>
                                </div>
                                <div>
                                  <span className="text-theme-text-tertiary">Reserved:</span>
                                  <span className="ml-2 font-medium text-theme-status-warning">
                                    {reserved} BF
                                  </span>
                                </div>
                                <div>
                                  <span className="text-theme-text-tertiary">Value:</span>
                                  <span className="ml-2 font-medium text-theme-text-primary">
                                    ${value.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-theme-text-tertiary">
                                {item.supplier && <span>Supplier: {item.supplier}</span>}
                                {item.location && <span>Location: {item.location}</span>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-theme-border-secondary">
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="border-theme-border-secondary">
                                <History className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </TabsContent>

              {/* Component Inventory */}
              <TabsContent value="components" className="space-y-4">
                {sortedComponentInventory.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-theme-text-tertiary mb-4" />
                    <p className="text-theme-text-tertiary">No component inventory found</p>
                  </div>
                ) : (
                  sortedComponentInventory.map((item) => {
                    const status = getStockStatus(
                      item.quantity_on_hand || 0,
                      item.reorder_point || 0,
                      (item.reorder_point || 0) / 2
                    )
                    const reserved = item.quantity_reserved || 0
                    const available = item.quantity_available || 0
                    const value = item.total_value || 0

                    return (
                      <Card key={item.id} className="bg-theme-bg-primary border-theme-border-secondary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-theme-text-primary">{item.component_name}</h3>
                                <Badge className={`${status.color} text-white`}>
                                  {status.label}
                                </Badge>
                                <Badge variant="outline" className="border-theme-border-secondary">
                                  {item.component_type}
                                </Badge>
                              </div>
                              <div className="text-sm text-theme-text-tertiary">
                                SKU: {item.sku} {item.notes && `• ${item.notes}`}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-theme-text-tertiary">In Stock:</span>
                                  <span className="ml-2 font-medium text-theme-text-primary">
                                    {item.quantity_on_hand} units
                                  </span>
                                </div>
                                <div>
                                  <span className="text-theme-text-tertiary">Available:</span>
                                  <span className="ml-2 font-medium text-theme-text-primary">
                                    {available} units
                                  </span>
                                </div>
                                <div>
                                  <span className="text-theme-text-tertiary">Reserved:</span>
                                  <span className="ml-2 font-medium text-theme-status-warning">
                                    {reserved} units
                                  </span>
                                </div>
                                <div>
                                  <span className="text-theme-text-tertiary">Value:</span>
                                  <span className="ml-2 font-medium text-theme-text-primary">
                                    ${value.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-theme-text-tertiary">
                                {item.supplier && <span>Supplier: {item.supplier}</span>}
                                {item.location && <span>Location: {item.location}</span>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-theme-border-secondary">
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="border-theme-border-secondary">
                                <History className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-theme-border-secondary">
              <h3 className="text-sm font-medium text-theme-text-secondary mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="border-theme-border-secondary">
                  <Truck className="w-4 h-4 mr-2" />
                  Receive Shipment
                </Button>
                <Button variant="outline" className="border-theme-border-secondary">
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Stock Adjustment
                </Button>
                <Button variant="outline" className="border-theme-border-secondary">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Low Stock Report
                </Button>
                <Button variant="outline" className="border-theme-border-secondary">
                  <Package className="w-4 h-4 mr-2" />
                  Reserve Materials
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}