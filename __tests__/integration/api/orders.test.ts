import { NextRequest } from 'next/server'
import { POST } from '@/app/api/orders/from-configuration/route'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase server
jest.mock('@/lib/supabase/server')

// Mock NextRequest
const createMockRequest = (body: any): NextRequest => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest
}

describe('POST /api/orders/from-configuration', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock Supabase
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      })),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('should create order successfully with valid data', async () => {
    const requestBody = {
      configurationId: 'config-123',
      customerId: 'customer-123',
      quantity: 2,
      notes: 'Rush order',
    }

    const mockConfiguration = {
      id: 'config-123',
      base_model: 'Verite Closed',
      base_price: 2500,
      selected_options: { wood_type: 'Cherry' },
      calculated_price: 2800,
    }

    const mockCustomer = {
      id: 'customer-123',
      name: 'John Doe',
      email: 'john@example.com',
    }

    const mockWorker = {
      id: 'worker-123',
      role: 'worker',
    }

    const mockOrder = {
      id: 'order-123',
      order_number: 'ZMF-2024-001',
      customer_id: 'customer-123',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      configuration_id: 'config-123',
      model: 'Verite Closed',
      configuration: { wood_type: 'Cherry' },
      price: 2800,
      status: 'pending',
      notes: 'Rush order',
    }

    // Mock database responses
    mockSupabase.from.mockImplementation((table: string) => {
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }

      if (table === 'product_configurations') {
        queryBuilder.single.mockResolvedValue({
          data: mockConfiguration,
          error: null,
        })
      } else if (table === 'customers') {
        queryBuilder.single.mockResolvedValue({
          data: mockCustomer,
          error: null,
        })
      } else if (table === 'workers') {
        queryBuilder.single.mockResolvedValue({
          data: mockWorker,
          error: null,
        })
      } else if (table === 'orders') {
        queryBuilder.single.mockResolvedValue({
          data: mockOrder,
          error: null,
        })
      }

      return queryBuilder
    })

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData).toEqual(mockOrder)
    expect(mockSupabase.from).toHaveBeenCalledWith('product_configurations')
    expect(mockSupabase.from).toHaveBeenCalledWith('customers')
    expect(mockSupabase.from).toHaveBeenCalledWith('orders')
  })

  it('should return 401 when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const request = createMockRequest({
      configurationId: 'config-123',
      customerId: 'customer-123',
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(401)
    expect(responseData).toEqual({ error: 'Unauthorized' })
  })

  it('should return 403 when user is not authorized', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'workers') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }
      }
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }
    })

    const request = createMockRequest({
      configurationId: 'config-123',
      customerId: 'customer-123',
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(403)
    expect(responseData).toEqual({ error: 'Unauthorized' })
  })

  it('should return 400 when required fields are missing', async () => {
    const mockWorker = { id: 'worker-123', role: 'worker' }
    
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'workers') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockWorker,
            error: null,
          }),
        }
      }
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }
    })

    const request = createMockRequest({
      configurationId: 'config-123',
      // Missing customerId
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData).toEqual({ 
      error: 'Missing required fields: configurationId and customerId' 
    })
  })

  it('should return 404 when configuration not found', async () => {
    const mockWorker = { id: 'worker-123', role: 'worker' }
    
    mockSupabase.from.mockImplementation((table: string) => {
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }

      if (table === 'workers') {
        queryBuilder.single.mockResolvedValue({
          data: mockWorker,
          error: null,
        })
      } else if (table === 'product_configurations') {
        queryBuilder.single.mockResolvedValue({
          data: null,
          error: null,
        })
      }

      return queryBuilder
    })

    const request = createMockRequest({
      configurationId: 'config-123',
      customerId: 'customer-123',
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(404)
    expect(responseData).toEqual({ error: 'Configuration not found' })
  })

  it('should handle database errors gracefully', async () => {
    const mockWorker = { id: 'worker-123', role: 'worker' }
    
    mockSupabase.from.mockImplementation((table: string) => {
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }

      if (table === 'workers') {
        queryBuilder.single.mockResolvedValue({
          data: mockWorker,
          error: null,
        })
      } else if (table === 'orders') {
        queryBuilder.single.mockResolvedValue({
          data: null,
          error: { message: 'Database connection error' },
        })
      } else {
        queryBuilder.single.mockResolvedValue({
          data: { id: 'test' },
          error: null,
        })
      }

      return queryBuilder
    })

    const request = createMockRequest({
      configurationId: 'config-123',
      customerId: 'customer-123',
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(500)
    expect(responseData).toEqual({ error: 'Failed to create order' })
  })
})