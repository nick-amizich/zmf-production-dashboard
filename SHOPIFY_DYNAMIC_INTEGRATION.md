# Shopify Dynamic Integration Guide

## Overview
This guide explains how to integrate the dynamic product configuration system where Shopify pulls configuration data from your database on each page load.

## Architecture

```
[Shopify Storefront] --> [Your API] --> [Supabase Database]
```

## Setup Steps

### 1. Deploy Your API
Your Next.js app provides the API endpoint at:
```
https://your-domain.com/api/shopify/product-config/[productId]
```

### 2. Update Environment Variables
Add your production URL to `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### 3. Run Database Migrations
```bash
npx supabase db push
```

### 4. Sync Your Configurations
1. Go to `/product-configurator`
2. Create your headphone models and options
3. Click "Sync to Database" to push configurations

### 5. Add to Shopify Theme

In your Shopify theme, replace the static configuration with:

```liquid
<!-- In your product template -->
<script>
  const API_URL = 'https://your-domain.com'; // Your deployed URL
  const productId = '{{ product.id }}';
</script>

<!-- Include the integration code -->
{{ 'zmf-product-configurator.js' | asset_url | script_tag }}
```

Copy the contents of `shopify-theme-integration.liquid` to:
- `assets/zmf-product-configurator.js` (remove the liquid tags, keep only JavaScript)

### 6. Map Shopify Product IDs

When syncing configurations, you need to map your internal model IDs to Shopify product IDs:

```javascript
// In sync-to-database.tsx, update the mapping:
shopifyProductId: model.shopifyProductId || model.id // Add actual mapping
```

## Testing

1. **Test API Endpoint**:
   ```
   curl https://your-domain.com/api/shopify/product-config/YOUR_PRODUCT_ID
   ```

2. **Check CORS**:
   - Open browser console on Shopify store
   - Look for any CORS errors
   - Update allowed origins if needed

3. **Monitor API Logs**:
   - Check Supabase dashboard for API access logs
   - Monitor which products are being requested

## Security Considerations

1. **CORS Configuration**:
   ```typescript
   // In route.ts, update for production:
   const corsHeaders = {
     'Access-Control-Allow-Origin': 'https://your-store.myshopify.com',
     // ... other headers
   }
   ```

2. **Rate Limiting**:
   Consider adding rate limiting to prevent abuse

3. **Caching**:
   The API includes 5-minute cache headers to reduce load

## Troubleshooting

### Configuration Not Loading
1. Check browser console for errors
2. Verify API is accessible
3. Check product ID mapping

### CORS Errors
1. Update allowed origins in API
2. Check Shopify domain is correct

### Price Calculations
1. Ensure base prices match between systems
2. Verify variant mapping is correct

## Advanced Features

### Real-time Updates
Changes in the configurator are immediately available to Shopify after syncing.

### Analytics
The API logs all requests, allowing you to track:
- Most viewed products
- Configuration patterns
- Geographic distribution

### A/B Testing
You can easily test different configurations by updating the database without touching Shopify.

## Webhook Integration (Optional)

To automatically sync when products are created in Shopify:

```typescript
// app/api/webhooks/shopify/products/create/route.ts
export async function POST(request: Request) {
  const product = await request.json()
  
  // Create default configuration
  await createDefaultConfiguration(product.id)
  
  return Response.json({ received: true })
}
```

Register the webhook in Shopify:
```
POST https://your-store.myshopify.com/admin/api/2024-01/webhooks.json
{
  "webhook": {
    "topic": "products/create",
    "address": "https://your-domain.com/api/webhooks/shopify/products/create",
    "format": "json"
  }
}
```