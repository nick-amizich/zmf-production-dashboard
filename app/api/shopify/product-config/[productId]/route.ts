import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// CORS headers for Shopify storefront
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your Shopify domain
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Domain',
  'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = await createClient()
    const { productId } = params
    
    // Get the Shopify domain from headers (for logging/validation)
    const shopifyDomain = request.headers.get('X-Shopify-Domain')
    
    // Fetch product configuration from database
    const { data: productConfig, error: configError } = await supabase
      .from('product_configurations')
      .select(`
        *,
        product_options (
          *,
          option_values (*)
        )
      `)
      .eq('shopify_product_id', productId)
      .single()

    if (configError || !productConfig) {
      // Return empty config if product not found
      return NextResponse.json(
        {
          productId,
          configured: false,
          options: []
        },
        { headers: corsHeaders }
      )
    }

    // Format the response for Shopify theme consumption
    const formattedConfig = {
      productId,
      configured: true,
      basePrice: productConfig.base_price,
      baseSku: productConfig.base_sku,
      options: productConfig.product_options.map((option: any) => ({
        id: option.id,
        name: option.name,
        type: option.type, // 'variant' or 'property'
        required: option.required,
        displayOrder: option.display_order,
        values: option.option_values.map((value: any) => ({
          id: value.id,
          name: value.name,
          priceModifier: value.price_modifier,
          sku: value.sku,
          available: value.available,
          metadata: value.metadata
        }))
      }))
    }

    // Log the request for analytics
    await supabase
      .from('shopify_api_logs')
      .insert({
        endpoint: 'product-config',
        product_id: productId,
        shopify_domain: shopifyDomain,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent')
      })

    return NextResponse.json(formattedConfig, { headers: corsHeaders })

  } catch (error) {
    console.error('Error fetching product config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}