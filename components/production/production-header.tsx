'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, Clock, AlertCircle } from 'lucide-react'
import { CreateBatchModal } from '@/components/production/create-batch-modal'
import { Database } from '@/types/database.types'

type Worker = Database['public']['Tables']['workers']['Row']
type Order = Database['public']['Tables']['orders']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row'] | null
  model: Database['public']['Tables']['headphone_models']['Row'] | null
}

interface ProductionHeaderProps {
  worker: Worker
  pendingOrders: Order[]
}

export function ProductionHeader({ worker, pendingOrders }: ProductionHeaderProps) {
  const [showCreateBatch, setShowCreateBatch] = useState(false)
  const isManager = worker.role === 'manager' || worker.role === 'admin'
  
  return (
    <>
      <header className="bg-theme-bg-secondary border-b border-theme-border-primary px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-text-secondary">Production Pipeline</h1>
            <p className="text-theme-text-tertiary mt-1">
              Manage batches through production stages
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-theme-text-secondary border-theme-border-primary">
                <Package className="w-3 h-3 mr-1" />
                {pendingOrders.length} Pending Orders
              </Badge>
              
              {pendingOrders.some(o => o.priority === 'rush' || o.priority === 'expedite') && (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Priority Orders
                </Badge>
              )}
            </div>
            
            {isManager && pendingOrders.length > 0 && (
              <Button
                onClick={() => setShowCreateBatch(true)}
                className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Batch
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {showCreateBatch && (
        <CreateBatchModal
          orders={pendingOrders}
          onClose={() => setShowCreateBatch(false)}
        />
      )}
    </>
  )
}