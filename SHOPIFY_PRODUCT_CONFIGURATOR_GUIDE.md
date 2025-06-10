# Shopify Product Configurator Guide

## Understanding How Shopify Themes Handle Product Customization

This guide explains how Shopify themes handle product customization and options, to help you design your backend configuration accordingly.

## Table of Contents
1. [Shopify's Native Product Structure](#shopifys-native-product-structure)
2. [Product Variants vs Custom Options](#product-variants-vs-custom-options)
3. [Line Item Properties](#line-item-properties)
4. [How Themes Handle Customization](#how-themes-handle-customization)
5. [Integration Approaches](#integration-approaches)
6. [Best Practices](#best-practices)

## Shopify's Native Product Structure

### Products and Variants
In Shopify, products have a hierarchical structure:
- **Product**: The main item (e.g., "ZMF Verite Headphones")
- **Variants**: Different versions based on options (e.g., Size/Color combinations)

```liquid
product.title → "ZMF Verite Headphones"
product.variants → Array of variant objects
variant.title → "Walnut / Silver Cable"
variant.price → 299900 (in cents)
variant.sku → "VERITE-WAL-SIL"
```

### Option Limitations
Shopify has strict limitations:
- Maximum 3 options per product (e.g., Wood Type, Cable Type, Pad Type)
- Maximum 100 variants per product
- Options create variants combinatorially (3 woods × 3 cables × 3 pads = 27 variants)

## Product Variants vs Custom Options

### When to Use Variants
Use Shopify variants when:
- Options affect inventory tracking
- Options affect SKU
- You have ≤3 option types
- Total combinations ≤100

### When to Use Custom Options
Use line item properties for:
- Unlimited customization options
- Options that don't affect inventory
- Personalization (engraving, custom text)
- Complex configurators

## Line Item Properties

Line item properties are custom fields attached to cart items. They're perfect for product customization.

### How They Work

1. **On Product Page**: Add hidden inputs to the add-to-cart form
```liquid
<form action="/cart/add" method="post">
  <!-- Standard variant selector -->
  <input type="hidden" name="id" value="{{ variant.id }}">
  
  <!-- Custom properties -->
  <input type="text" name="properties[Wood Type]" value="Walnut">
  <input type="text" name="properties[Cable Color]" value="Silver">
  <input type="hidden" name="properties[_custom_price]" value="50.00">
  
  <button type="submit">Add to Cart</button>
</form>
```

2. **In Cart**: Properties display with the item
```liquid
{% for item in cart.items %}
  <div>{{ item.product.title }}</div>
  
  {% for property in item.properties %}
    {% unless property.first contains '_' %}
      <div>{{ property.first }}: {{ property.last }}</div>
    {% endunless %}
  {% endfor %}
{% endfor %}
```

### Property Naming Conventions
- Regular properties: Display in cart/emails (e.g., `properties[Wood Type]`)
- Hidden properties: Start with underscore (e.g., `properties[_internal_sku]`)
- Reserved prefixes: Some apps use specific prefixes (e.g., `_io_` for Infinite Options)

## How Themes Handle Customization

### 1. Product Page Flow
```javascript
// Typical theme.js pattern
theme.Product = function(container) {
  // Listen for variant changes
  this.container.on('change', '.variant-selector', function(e) {
    var variant = getVariantFromOptions();
    updatePrice(variant.price);
    updateAvailability(variant.available);
    updateSKU(variant.sku);
  });
  
  // Handle form submission
  this.form.on('submit', function(e) {
    // Validate selections
    // Add to cart via AJAX or form submission
  });
};
```

### 2. AJAX Cart API
Shopify provides endpoints for cart manipulation:
```javascript
// Add item with properties
fetch('/cart/add.js', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    id: variantId,
    quantity: 1,
    properties: {
      'Wood Type': 'Walnut',
      'Cable Color': 'Silver',
      '_custom_sku': 'VERITE-WAL-SIL-CUSTOM'
    }
  })
});
```

### 3. Cart Display
The cart template shows line items with their properties:
```liquid
<!-- sections/cart-template.liquid -->
{% for item in cart.items %}
  <tr>
    <td>{{ item.product.title }}</td>
    <td>
      <!-- Show non-hidden properties -->
      {% for p in item.properties %}
        {% unless p.first contains '_' %}
          {{ p.first }}: {{ p.last }}<br>
        {% endunless %}
      {% endfor %}
    </td>
    <td>{{ item.price | money }}</td>
  </tr>
{% endfor %}
```

## Integration Approaches

### Approach 1: Client-Side Configuration
Your configurator runs entirely in the browser:

```javascript
// 1. Fetch options from your API
const options = await fetch('https://your-api.com/options').then(r => r.json());

// 2. Build UI dynamically
options.forEach(option => {
  createOptionSelector(option);
});

// 3. Add selections as line item properties
form.addEventListener('submit', (e) => {
  selectedOptions.forEach(option => {
    addHiddenInput(`properties[${option.name}]`, option.value);
  });
});
```

**Pros**: Fast, works offline after initial load
**Cons**: Price calculations visible in source

### Approach 2: Server-Side Validation
Use a proxy or webhook system:

```javascript
// 1. Intercept add-to-cart
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // 2. Validate with your server
  const validation = await fetch('https://your-api.com/validate', {
    method: 'POST',
    body: JSON.stringify(selectedOptions)
  });
  
  // 3. Add to cart with server-approved data
  if (validation.ok) {
    const data = await validation.json();
    addToCart(data.variantId, data.properties);
  }
});
```

**Pros**: Secure pricing, complex rules
**Cons**: Requires server round-trip

### Approach 3: Hybrid Approach
Combine Shopify variants with line item properties:

1. Use Shopify variants for major options (≤3)
2. Use line item properties for additional options
3. Calculate final price server-side

```liquid
<!-- Base variant selector -->
<select name="id">
  {% for variant in product.variants %}
    <option value="{{ variant.id }}">{{ variant.title }} - {{ variant.price | money }}</option>
  {% endfor %}
</select>

<!-- Additional options as properties -->
<select name="properties[Engraving]">
  <option value="None">No Engraving</option>
  <option value="Initials">Add Initials (+$25)</option>
</select>
```

## Best Practices

### 1. Price Handling
- **Never trust client-side prices**: Validate on server
- **Use Shopify Scripts** or **Functions**: Adjust prices at checkout
- **Draft Orders API**: Create orders with custom prices

### 2. Inventory Management
- Track component inventory separately
- Use metafields for component mapping
- Consider using bundles for common configurations

### 3. Order Fulfillment
```javascript
// Webhook handler for order creation
app.post('/webhooks/orders/create', (req, res) => {
  const order = req.body;
  
  order.line_items.forEach(item => {
    if (item.properties) {
      // Parse custom options
      const customOptions = parseProperties(item.properties);
      
      // Create build instructions
      createBuildOrder(item.sku, customOptions);
    }
  });
});
```

### 4. Theme Compatibility
Ensure your solution works with:
- AJAX carts
- Quick-buy buttons
- Cart drawers
- Mobile interfaces

### 5. SEO Considerations
- Create landing pages for popular configurations
- Use canonical URLs for similar variants
- Generate structured data for configurations

## Implementation Checklist

- [ ] Decide: Variants vs Properties vs Hybrid
- [ ] Set up backend API endpoints
- [ ] Create theme integration JavaScript
- [ ] Handle CORS for cross-domain requests
- [ ] Implement price calculation strategy
- [ ] Set up order webhook handlers
- [ ] Test cart functionality
- [ ] Test checkout process
- [ ] Implement order fulfillment logic
- [ ] Add analytics tracking

## Common Pitfalls

1. **Exceeding Variant Limits**: Plan option structure carefully
2. **Price Mismatches**: Always validate server-side
3. **Missing Properties**: Some checkout flows strip properties
4. **Theme Updates**: Custom code may break with theme updates
5. **App Conflicts**: Some apps modify cart behavior

## Useful Shopify Resources

- [Line Item Properties](https://shopify.dev/docs/storefronts/themes/architecture/templates/cart#line-item-properties)
- [AJAX API Reference](https://shopify.dev/docs/storefronts/themes/ajax-api)
- [Cart.js Documentation](https://shopify.dev/docs/storefronts/themes/ajax-api/reference/cart)
- [Variant Object Reference](https://shopify.dev/docs/storefronts/themes/liquid/reference/objects/variant)