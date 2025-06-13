'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Database } from '@/types/database.types'
import { AlertCircle, Package } from 'lucide-react'

type Order = Database['public']['Tables']['orders']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row'] | null
  model: Database['public']['Tables']['headphone_models']['Row'] | null
}

interface CreateBatchModalProps {
  orders: Order[]
  onClose: () => void
}

export function CreateBatchModal({ orders, onClose }: CreateBatchModalProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [priority, setPriority] = useState<Database['public']['Enums']['batch_priority']>('standard')
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleOrderToggle = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map(o => o.id))
    }
  }

  const handleCreateBatch = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select at least one order')
      return
    }

    setIsCreating(true)
    
    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: selectedOrders,
          priority,
        }),
      })

      if (!response.ok) throw new Error('Failed to create batch')

      const { batch } = await response.json()
      
      toast.success(`Batch ${batch.batch_number} created successfully`)
      router.refresh()
      onClose()
    } catch (error) {
      toast.error('Failed to create batch')
      setIsCreating(false)
    }
  }

  // Auto-set priority based on selected orders
  const hasHighPriorityOrders = orders
    .filter(o => selectedOrders.includes(o.id))
    .some(o => o.priority === 'rush' || o.priority === 'expedite')

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-theme-bg-secondary border-theme-border-primary">
        <DialogHeader>
          <DialogTitle className="text-theme-text-secondary">Create Production Batch</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Batch Priority</Label>
            <Select 
              value={priority} 
              onValueChange={(v) => setPriority(v as any)}
            >
              <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="rush">Rush</SelectItem>
                <SelectItem value="expedite">Expedite</SelectItem>
              </SelectContent>
            </Select>
            {hasHighPriorityOrders && (
              <p className="text-xs text-theme-status-warning mt-1">
                Selected orders contain priority items
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Orders ({selectedOrders.length} selected)</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-theme-text-secondary"
              >
                {selectedOrders.length === orders.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="border border-theme-border-primary rounded-lg max-h-96 overflow-y-auto">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 hover:bg-theme-brand-secondary/10 border-b border-theme-border-secondary last:border-0"
                >
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={() => handleOrderToggle(order.id)}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-theme-text-secondary">
                        {order.order_number}
                      </span>
                      <Badge 
                        variant={order.priority === 'standard' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {order.priority}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-theme-text-tertiary mt-1">
                      {order.model?.name} - {order.wood_type} • {order.customer?.name}
                    </div>
                    
                    {order.due_date && (
                      <div className="text-xs text-theme-text-tertiary mt-1">
                        Due: {new Date(order.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateBatch}
            disabled={isCreating || selectedOrders.length === 0}
            className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
          >
            {isCreating ? 'Creating...' : `Create Batch (${selectedOrders.length} orders)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}