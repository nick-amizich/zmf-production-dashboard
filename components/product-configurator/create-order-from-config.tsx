'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

import { logger } from '@/lib/logger'
interface CreateOrderFromConfigProps {
  configurationId: string
  configurationName: string
  onOrderCreated?: (orderId: string) => void
}

export function CreateOrderFromConfig({ 
  configurationId, 
  configurationName,
  onOrderCreated 
}: CreateOrderFromConfigProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [configuration, setConfiguration] = useState<any>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [customerEmail, setCustomerEmail] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [priority, setPriority] = useState<'normal' | 'rush' | 'urgent'>('normal')
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
  const [notes, setNotes] = useState('')

  const loadConfiguration = async () => {
    try {
      const response = await fetch(`/api/product-configurations/${configurationId}`)
      const data = await response.json()
      setConfiguration(data)
      
      // Initialize with default values
      const defaults: Record<string, string> = {}
      data.product_options?.forEach((option: any) => {
        if (option.option_values?.length > 0) {
          defaults[option.id] = option.option_values[0].id
        }
      })
      setSelectedOptions(defaults)
    } catch (error) {
      logger.error('Error loading configuration:', error)
      toast({
        title: 'Error',
        description: 'Failed to load configuration',
        variant: 'destructive',
      })
    }
  }

  const calculatePrice = () => {
    if (!configuration) return 0
    
    let total = configuration.base_price || 0
    
    for (const [optionId, valueId] of Object.entries(selectedOptions)) {
      const option = configuration.product_options?.find((o: any) => o.id === optionId)
      const value = option?.option_values?.find((v: any) => v.id === valueId)
      if (value?.price_adjustment) {
        total += value.price_adjustment
      }
    }
    
    return total * quantity
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // First, find or create customer
      const customerResponse = await fetch('/api/customers/find-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail }),
      })
      const customer = await customerResponse.json()

      // Create the order
      const response = await fetch('/api/orders/from-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configurationId,
          customerId: customer.id,
          quantity,
          priority,
          dueDate: dueDate.toISOString(),
          notes,
          selectedOptions,
        }),
      })

      if (response.ok) {
        const order = await response.json()
        toast({
          title: 'Success',
          description: `Order ${order.order_number} created successfully`,
        })
        setOpen(false)
        onOrderCreated?.(order.id)
      }
    } catch (error) {
      logger.error('Error creating order:', error)
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o)
      if (o) loadConfiguration()
    }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Order from Configuration</DialogTitle>
        </DialogHeader>
        
        {configuration && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">{configurationName}</h3>
                <div className="space-y-3">
                  {configuration.product_options?.map((option: any) => (
                    <div key={option.id}>
                      <Label>{option.name}</Label>
                      <Select
                        value={selectedOptions[option.id]}
                        onValueChange={(value) => 
                          setSelectedOptions(prev => ({ ...prev, [option.id]: value }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {option.option_values?.map((value: any) => (
                            <SelectItem key={value.id} value={value.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{value.label}</span>
                                {value.price_adjustment !== 0 && (
                                  <span className="ml-2 text-sm text-muted-foreground">
                                    {value.price_adjustment > 0 ? '+' : ''}${value.price_adjustment}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer Email</Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="rush">Rush</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "mt-1 w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => date && setDueDate(date)}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>Order Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions or notes..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-2xl font-bold">${calculatePrice().toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!customerEmail || loading}
                >
                  {loading ? 'Creating...' : 'Create Order'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}