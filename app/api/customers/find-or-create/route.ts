import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { email, name, phone, shippingAddress } = body
    
    // Try to find existing customer
    let { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()
    
    if (!customer) {
      // Create new customer
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          email,
          name: name || email.split('@')[0],
          phone,
          shipping_address: shippingAddress,
        })
        .select()
        .single()
      
      if (error) throw error
      customer = newCustomer
    } else if (name || phone || shippingAddress) {
      // Update existing customer with new info
      const updates: any = {}
      if (name) updates.name = name
      if (phone) updates.phone = phone
      if (shippingAddress) updates.shipping_address = shippingAddress
      
      const { data: updatedCustomer, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', customer.id)
        .select()
        .single()
      
      if (error) throw error
      customer = updatedCustomer
    }
    
    return NextResponse.json(customer)
  } catch (error) {
    logger.error('Error finding/creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to process customer' },
      { status: 500 }
    )
  }
}