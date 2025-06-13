import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

import { logger } from '@/lib/logger'
// Verify Shopify webhook signature
function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64')
  
  return hash === signature
}

export async function POST(request: Request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-shopify-hmac-sha256')
    const topic = request.headers.get('x-shopify-topic')
    const shopDomain = request.headers.get('x-shopify-shop-domain')
    
    // Verify webhook signature (you'll need to set SHOPIFY_WEBHOOK_SECRET in env)
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    
    const supabase = await createClient()
    const data = JSON.parse(rawBody)
    
    // Log the webhook
    await supabase
      .from('shopify_api_logs')
      .insert({
        endpoint: `webhook_${topic}`,
        method: 'POST',
        status_code: 200,
        request_data: data,
        response_data: { processed: true },
      })
    
    // Handle different webhook topics
    switch (topic) {
      case 'products/create':
        await handleProductCreate(supabase, data)
        break
        
      case 'products/update':
        await handleProductUpdate(supabase, data)
        break
        
      case 'products/delete':
        await handleProductDelete(supabase, data)
        break
        
      case 'orders/create':
        await handleOrderCreate(supabase, data)
        break
        
      default:
        logger.debug(`Unhandled webhook topic: ${topic}`)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleProductCreate(supabase: any, product: any) {
  // Check if we have a configuration for this product type
  const productType = product.product_type?.toLowerCase()
  
  if (productType && productType.includes('headphone')) {
    // You could auto-create a configuration template here
    logger.debug('New headphone product created:', product.title)
  }
}

async function handleProductUpdate(supabase: any, product: any) {
  // Check if this product has a configuration
  const { data: config } = await supabase
    .from('product_configurations')
    .select('*')
    .eq('shopify_product_id', `gid://shopify/Product/${product.id}`)
    .single()
  
  if (config) {
    // Update configuration name if product title changed
    if (config.name !== product.title) {
      await supabase
        .from('product_configurations')
        .update({ 
          name: product.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id)
    }
  }
}

async function handleProductDelete(supabase: any, product: any) {
  // Remove Shopify mapping if product is deleted
  await supabase
    .from('product_configurations')
    .update({ 
      shopify_product_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('shopify_product_id', `gid://shopify/Product/${product.id}`)
}

async function handleOrderCreate(supabase: any, order: any) {
  // Process orders with custom configurations
  for (const lineItem of order.line_items) {
    const customization = lineItem.properties?.find((p: any) => 
      p.name === '_configuration' || p.name === 'Configuration'
    )
    
    if (customization) {
      try {
        const configData = JSON.parse(customization.value)
        
        // Create a production order with the configuration
        const { data: productionOrder } = await supabase
          .from('orders')
          .insert({
            order_number: `SHOPIFY-${order.order_number}`,
            model_id: configData.modelId,
            customer_id: null, // You'd need to create/match customer
            quantity: lineItem.quantity,
            priority: 'normal',
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
            configuration_data: configData,
            shopify_order_id: order.id.toString(),
            shopify_line_item_id: lineItem.id.toString(),
          })
          .select()
          .single()
        
        logger.debug('Created production order:', productionOrder)
      } catch (error) {
        logger.error('Error processing configuration:', error)
      }
    }
  }
}