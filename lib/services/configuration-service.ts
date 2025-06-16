import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type ProductConfiguration = Database['public']['Tables']['product_configurations']['Row']
type Order = Database['public']['Tables']['orders']['Insert']

export interface ConfigurationOrderData {
  configurationId: string
  customerId: string
  quantity: number
  priority: 'normal' | 'rush' | 'urgent'
  dueDate: Date
  notes?: string
  selectedOptions: Record<string, string> // optionId -> valueId
}

export class ConfigurationService {
  constructor(private supabase: Awaited<ReturnType<typeof createClient>>) {}

  /**
   * Get configuration with all options and values
   */
  async getConfiguration(configId: string) {
    const { data, error } = await this.supabase
      .from('product_configurations')
      .select(`
        *,
        product_options(
          *,
          option_values(*)
        )
      `)
      .eq('id', configId)
      .single()
    
    if (error) throw error
    return data
  }

  /**
   * Get configuration by Shopify product ID
   */
  async getConfigurationByShopifyId(shopifyProductId: string) {
    const { data, error } = await this.supabase
      .from('product_configurations')
      .select(`
        *,
        product_options(
          *,
          option_values(*)
        )
      `)
      .eq('shopify_product_id', shopifyProductId)
      .eq('is_active', true)
      .single()
    
    if (error) throw error
    return data
  }

  /**
   * Calculate price based on selected options
   */
  calculatePrice(
    configuration: any,
    selectedOptions: Record<string, string>
  ): number {
    let totalPrice = configuration.base_price || 0

    // Add option prices
    for (const [optionId, valueId] of Object.entries(selectedOptions)) {
      const option = configuration.product_options?.find((o: any) => o.id === optionId)
      if (option) {
        const value = option.option_values?.find((v: any) => v.id === valueId)
        if (value) {
          totalPrice += value.price_adjustment || 0
        }
      }
    }

    return totalPrice
  }

  /**
   * Create a production order from configuration
   */
  async createOrderFromConfiguration(data: ConfigurationOrderData) {
    // Get configuration details
    const configuration = await this.getConfiguration(data.configurationId)
    if (!configuration) {
      throw new Error('Configuration not found')
    }

    // Calculate total price
    const totalPrice = this.calculatePrice(configuration, data.selectedOptions)

    // Build configuration summary
    const configSummary = this.buildConfigurationSummary(configuration, data.selectedOptions)

    // Map priority values to database enum
    const priorityMap = {
      'normal': 'standard',
      'urgent': 'expedite',
      'rush': 'rush'
    } as const

    // Create the order
    const { data: order, error } = await this.supabase
      .from('orders')
      .insert({
        order_number: await this.generateOrderNumber(),
        model_id: configuration.id, // Using configuration ID as model_id
        customer_id: data.customerId,
        priority: priorityMap[data.priority],
        notes: data.notes,
        customizations: {
          configurationId: configuration.id,
          selectedOptions: data.selectedOptions,
          summary: configSummary,
          totalPrice,
          quantity: data.quantity,
          dueDate: data.dueDate.toISOString()
        },
        wood_type: 'Sapele', // Default wood type
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Log the order creation
    await this.supabase
      .from('system_logs')
      .insert({
        action: 'order_created_from_configuration',
        context: 'configuration',
        details: {
          order_id: order.id,
          configuration_id: configuration.id,
          total_price: totalPrice
        }
      })

    return order
  }

  /**
   * Build human-readable configuration summary
   */
  private buildConfigurationSummary(
    configuration: any,
    selectedOptions: Record<string, string>
  ): string {
    const parts: string[] = [configuration.name]

    for (const [optionId, valueId] of Object.entries(selectedOptions)) {
      const option = configuration.product_options?.find((o: any) => o.id === optionId)
      if (option) {
        const value = option.option_values?.find((v: any) => v.id === valueId)
        if (value) {
          parts.push(`${option.name}: ${value.label}`)
        }
      }
    }

    return parts.join(', ')
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    // Get count of orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))
    
    const { count } = await this.supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
    
    const sequence = String((count || 0) + 1).padStart(3, '0')
    return `ORD-${year}${month}${day}-${sequence}`
  }

  /**
   * Validate configuration options
   */
  validateConfiguration(
    configuration: any,
    selectedOptions: Record<string, string>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check all required options are selected
    for (const option of configuration.product_options || []) {
      if (option.is_required && !selectedOptions[option.id]) {
        errors.push(`${option.name} is required`)
      }
    }

    // Validate option values exist
    for (const [optionId, valueId] of Object.entries(selectedOptions)) {
      const option = configuration.product_options?.find((o: any) => o.id === optionId)
      if (!option) {
        errors.push(`Invalid option: ${optionId}`)
        continue
      }

      const value = option.option_values?.find((v: any) => v.id === valueId)
      if (!value) {
        errors.push(`Invalid value for ${option.name}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Get popular configurations
   */
  async getPopularConfigurations(limit: number = 5) {
    // This would analyze order data to find popular combinations
    // For now, return a placeholder
    return []
  }
}