'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, Clock, AlertTriangle, CheckCircle, XCircle, Wrench, ArrowRight, Box, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function BuildsClient() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name),
          headphone_model:headphone_models(name),
          batch_orders(
            batch:batches(
              batch_number,
              current_stage,
              quality_status,
              priority
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return
      }

      setOrders(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => 
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    new: 'bg-theme-text-tertiary',
    in_production: 'bg-theme-status-info',
    completed: 'bg-theme-status-success',
    cancelled: 'bg-theme-text-secondary',
    on_hold: 'bg-theme-status-warning'
  }

  const getStageProgress = (order: any) => {
    const batch = order.batch_orders?.[0]?.batch
    if (!batch?.current_stage) return 0
    
    const stages = ['intake', 'sanding', 'finishing', 'sub_assembly', 'final_assembly', 'acoustic_qc', 'shipping']
    const currentIndex = stages.indexOf(batch.current_stage)
    return Math.round(((currentIndex + 1) / stages.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-theme-text-tertiary">Loading orders...</div>
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
            <h1 className="text-3xl font-bold text-theme-text-primary">Build Tracker</h1>
            <p className="text-theme-text-tertiary mt-1">Track individual headphone builds</p>
          </div>
          <Button 
            className="bg-theme-brand-primary hover:bg-theme-brand-primary/90"
            onClick={() => router.push('/orders/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Order
          </Button>
        </div>

        {/* Search */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-tertiary w-4 h-4" />
              <Input
                placeholder="Search by order number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-theme-bg-primary border-theme-border-secondary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Order List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="bg-theme-bg-secondary border-theme-border-primary">
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto text-theme-text-tertiary mb-4" />
                <p className="text-theme-text-tertiary">
                  {searchTerm ? 'No orders found matching your search' : 'No orders found'}
                </p>
                <Button 
                  className="mt-4"
                  variant="outline"
                  onClick={() => router.push('/orders/create')}
                >
                  Create your first order
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const batch = order.batch_orders?.[0]?.batch
              const progress = getStageProgress(order)
              
              return (
                <Card key={order.id} className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-border-secondary transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-theme-text-primary">{order.order_number}</h3>
                            <Badge className={`${statusColors[order.order_status] || statusColors.new} text-white`}>
                              {order.order_status?.replace('_', ' ') || 'new'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-theme-text-tertiary">
                            <span>{order.headphone_model?.name || 'Unknown Model'}</span>
                            <span>•</span>
                            <span>{order.customer?.name || 'No Customer'}</span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-theme-border-secondary"
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>

                      {/* Progress */}
                      {batch && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-theme-text-tertiary">
                              Stage: <span className="font-medium text-theme-text-primary">
                                {batch.current_stage?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </span>
                            </span>
                            <span className="text-theme-text-tertiary">{progress}% Complete</span>
                          </div>
                          <div className="w-full bg-theme-bg-primary rounded-full h-2">
                            <div 
                              className="bg-theme-brand-primary h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex items-center gap-6 text-sm text-theme-text-tertiary">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Created: {format(new Date(order.created_at), 'MMM d, yyyy')}</span>
                        </div>
                        {batch && (
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>Batch: {batch.batch_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}