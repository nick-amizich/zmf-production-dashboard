'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  ArrowRight,
  FileText,
  BarChart3,
  Download
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, formatDistanceToNow } from 'date-fns'
import type { Database } from '@/types/database.types'

interface ShipmentsClientProps {
  workerId: string
  userRole: string
}

type Shipment = Database['public']['Tables']['shipments']['Row'] & {
  customer?: Database['public']['Tables']['customers']['Row']
  order?: Database['public']['Tables']['orders']['Row']
  build?: Database['public']['Tables']['builds']['Row']
  shipment_items?: Array<Database['public']['Tables']['shipment_items']['Row']>
}

const statusColors = {
  pending: 'bg-theme-text-tertiary',
  processing: 'bg-theme-status-info',
  shipped: 'bg-theme-brand-primary',
  in_transit: 'bg-theme-status-warning',
  delivered: 'bg-theme-status-success',
  failed: 'bg-theme-status-error'
}

const carrierIcons: Record<string, string> = {
  ups: '📦',
  fedex: '✈️',
  usps: '📮',
  dhl: '🚚'
}

export default function ShipmentsClient({ workerId, userRole }: ShipmentsClientProps) {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCarrier, setFilterCarrier] = useState('all')
  const [metrics, setMetrics] = useState({
    totalShipments: 0,
    inTransit: 0,
    deliveredToday: 0,
    avgDeliveryTime: 0,
    monthlyShipping: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchShipments()
    fetchMetrics()
  }, [])

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          customer:customers(*),
          order:orders(*),
          build:builds(*),
          shipment_items(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching shipments:', error)
        return
      }

      setShipments(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Total shipments
      const { count: totalCount } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })

      // In transit
      const { count: transitCount } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['shipped', 'in_transit'])

      // Delivered today
      const { count: deliveredTodayCount } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered')
        .gte('actual_delivery', today.toISOString())

      // Monthly shipping cost
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const { data: monthlyData } = await supabase
        .from('shipments')
        .select('shipping_cost')
        .gte('created_at', firstOfMonth.toISOString())

      const monthlyShipping = monthlyData?.reduce((sum, s) => sum + (s.shipping_cost || 0), 0) || 0

      setMetrics({
        totalShipments: totalCount || 0,
        inTransit: transitCount || 0,
        deliveredToday: deliveredTodayCount || 0,
        avgDeliveryTime: 3.2, // Placeholder
        monthlyShipping
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.shipment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.ship_to_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus
    const matchesCarrier = filterCarrier === 'all' || shipment.carrier === filterCarrier
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && ['pending', 'processing'].includes(shipment.status)) ||
      (activeTab === 'in_transit' && ['shipped', 'in_transit'].includes(shipment.status)) ||
      (activeTab === 'delivered' && shipment.status === 'delivered')
    
    return matchesSearch && matchesStatus && matchesCarrier && matchesTab
  })

  const handleCreateShipment = () => {
    // Navigate to create shipment page
    window.location.href = '/shipments/create'
  }

  const handleViewDetails = (shipmentId: string) => {
    // Navigate to shipment details
    window.location.href = `/shipments/${shipmentId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-theme-text-tertiary">Loading shipments...</div>
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
            <h1 className="text-3xl font-bold text-theme-text-primary">Shipment Tracking</h1>
            <p className="text-theme-text-tertiary mt-1">Monitor and manage all shipments</p>
          </div>
          {['manager', 'admin'].includes(userRole) && (
            <Button 
              className="bg-theme-brand-primary hover:bg-theme-brand-primary/90"
              onClick={handleCreateShipment}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Shipment
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Total Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-text-primary">{metrics.totalShipments}</div>
              <p className="text-xs text-theme-text-tertiary">All time</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">In Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-warning">{metrics.inTransit}</div>
              <p className="text-xs text-theme-text-tertiary">Currently shipping</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Delivered Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-status-success">{metrics.deliveredToday}</div>
              <p className="text-xs text-theme-text-tertiary">Successful deliveries</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Avg. Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-text-primary">{metrics.avgDeliveryTime}</div>
              <p className="text-xs text-theme-text-tertiary">Days</p>
            </CardContent>
          </Card>
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Monthly Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme-brand-primary">
                ${(metrics.monthlyShipping / 1000).toFixed(1)}k
              </div>
              <p className="text-xs text-theme-text-tertiary">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-tertiary w-4 h-4" />
                  <Input
                    placeholder="Search by tracking, order, or customer..."
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
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCarrier} onValueChange={setFilterCarrier}>
                <SelectTrigger className="w-[180px] bg-theme-bg-primary border-theme-border-secondary">
                  <SelectValue placeholder="Filter by carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Carriers</SelectItem>
                  <SelectItem value="ups">UPS</SelectItem>
                  <SelectItem value="fedex">FedEx</SelectItem>
                  <SelectItem value="usps">USPS</SelectItem>
                  <SelectItem value="dhl">DHL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Shipments Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Shipments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_transit">In Transit</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {filteredShipments.length === 0 ? (
              <Card className="bg-theme-bg-secondary border-theme-border-primary">
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-theme-text-tertiary mb-4" />
                  <p className="text-theme-text-tertiary">No shipments found</p>
                </CardContent>
              </Card>
            ) : (
              filteredShipments.map((shipment) => (
                <Card key={shipment.id} className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-border-secondary transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{carrierIcons[shipment.carrier] || '📦'}</span>
                            <div>
                              <h3 className="text-lg font-semibold text-theme-text-primary">
                                {shipment.shipment_number}
                              </h3>
                              <p className="text-sm text-theme-text-tertiary">
                                {shipment.carrier.toUpperCase()} • {shipment.service_type}
                              </p>
                            </div>
                          </div>
                          {shipment.tracking_number && (
                            <p className="text-sm text-theme-text-tertiary">
                              Tracking: {shipment.tracking_number}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${statusColors[shipment.status] || statusColors.pending} text-white`}>
                            {shipment.status.replace('_', ' ')}
                          </Badge>
                          {shipment.signature_required && (
                            <Badge variant="outline" className="border-theme-border-secondary">
                              Signature Required
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Destination and Timeline */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-theme-text-tertiary mt-0.5" />
                          <div>
                            <p className="font-medium text-theme-text-primary">{shipment.ship_to_name}</p>
                            <p className="text-sm text-theme-text-tertiary">
                              {shipment.ship_to_city}, {shipment.ship_to_state} {shipment.ship_to_postal_code}
                            </p>
                            {shipment.ship_to_country !== 'US' && (
                              <p className="text-sm text-theme-text-tertiary">{shipment.ship_to_country}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-theme-text-tertiary mt-0.5" />
                          <div>
                            {shipment.ship_date && (
                              <p className="text-sm text-theme-text-tertiary">
                                Shipped: {format(new Date(shipment.ship_date), 'MMM d, yyyy')}
                              </p>
                            )}
                            {shipment.estimated_delivery && (
                              <p className="text-sm text-theme-text-tertiary">
                                Est. Delivery: {format(new Date(shipment.estimated_delivery), 'MMM d, yyyy')}
                              </p>
                            )}
                            {shipment.actual_delivery && (
                              <p className="text-sm text-theme-status-success">
                                Delivered: {format(new Date(shipment.actual_delivery), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Package Info */}
                      <div className="flex items-center justify-between pt-3 border-t border-theme-border-secondary">
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-theme-text-tertiary" />
                            <span className="text-theme-text-tertiary">
                              {shipment.weight_lbs} lbs
                            </span>
                          </div>
                          {shipment.shipping_cost && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-theme-text-tertiary" />
                              <span className="text-theme-text-tertiary">
                                ${shipment.shipping_cost.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {shipment.insurance_value && (
                            <Badge variant="outline" className="text-xs">
                              Insured: ${shipment.insurance_value}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {shipment.label_url && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-theme-border-secondary"
                              onClick={() => window.open(shipment.label_url!, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Label
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-theme-border-secondary"
                            onClick={() => handleViewDetails(shipment.id)}
                          >
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-primary">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="border-theme-border-secondary">
                <FileText className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="border-theme-border-secondary">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" className="border-theme-border-secondary">
                <Truck className="w-4 h-4 mr-2" />
                Carrier Settings
              </Button>
              <Button variant="outline" className="border-theme-border-secondary">
                <AlertTriangle className="w-4 h-4 mr-2" />
                File Claim
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}