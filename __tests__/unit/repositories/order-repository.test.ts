import { OrderRepository } from '@/lib/repositories/order-repository'
import { createClient } from '@/lib/supabase/client'

// Mock the Supabase client
jest.mock('@/lib/supabase/client')

describe('OrderRepository', () => {
  let repository: OrderRepository
  let mockSupabase: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      })),
    }
    
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    repository = new OrderRepository(mockSupabase)
  })

  describe('findAll', () => {
    it('should return all orders with default sorting', async () => {
      const mockOrders = [
        { id: '1', order_number: 'ZMF-2024-001', status: 'pending' },
        { id: '2', order_number: 'ZMF-2024-002', status: 'in_progress' },
      ]

      mockSupabase.from().order().limit().mockResolvedValue({ 
        data: mockOrders, 
        error: null 
      })

      const result = await repository.findAll()

      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*')
      expect(mockSupabase.from().order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockSupabase.from().limit).toHaveBeenCalledWith(100)
      expect(result).toEqual(mockOrders)
    })

    it('should filter by status when provided', async () => {
      const mockOrders = [
        { id: '1', order_number: 'ZMF-2024-001', status: 'pending' },
      ]

      mockSupabase.from().order().limit().mockResolvedValue({ 
        data: mockOrders, 
        error: null 
      })

      const result = await repository.findAll({ status: 'pending' })

      expect(mockSupabase.from().eq).toHaveBeenCalledWith('status', 'pending')
      expect(result).toEqual(mockOrders)
    })

    it('should throw error when query fails', async () => {
      mockSupabase.from().order().limit().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      })

      await expect(repository.findAll()).rejects.toThrow('Database error')
    })
  })

  describe('findById', () => {
    it('should return order by id', async () => {
      const mockOrder = { 
        id: '1', 
        order_number: 'ZMF-2024-001', 
        status: 'pending' 
      }

      mockSupabase.from().single().mockResolvedValue({ 
        data: mockOrder, 
        error: null 
      })

      const result = await repository.findById('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockOrder)
    })

    it('should return null when order not found', async () => {
      mockSupabase.from().single().mockResolvedValue({ 
        data: null, 
        error: null 
      })

      const result = await repository.findById('999')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create new order successfully', async () => {
      const newOrder = {
        order_number: 'ZMF-2024-003',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        model: 'Verite Closed',
        configuration: { wood_type: 'Cherry' },
        price: 2500,
        status: 'pending' as const,
      }

      const createdOrder = { id: '3', ...newOrder }

      mockSupabase.from().single().mockResolvedValue({ 
        data: createdOrder, 
        error: null 
      })

      const result = await repository.create(newOrder)

      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith([newOrder])
      expect(result).toEqual(createdOrder)
    })

    it('should throw error when creation fails', async () => {
      const newOrder = {
        order_number: 'ZMF-2024-003',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        model: 'Verite Closed',
        configuration: {},
        price: 2500,
        status: 'pending' as const,
      }

      mockSupabase.from().single().mockResolvedValue({ 
        data: null, 
        error: { message: 'Validation error' } 
      })

      await expect(repository.create(newOrder)).rejects.toThrow('Validation error')
    })
  })

  describe('update', () => {
    it('should update order successfully', async () => {
      const updates = { status: 'in_progress' as const }
      const updatedOrder = { 
        id: '1', 
        order_number: 'ZMF-2024-001', 
        status: 'in_progress' 
      }

      mockSupabase.from().single().mockResolvedValue({ 
        data: updatedOrder, 
        error: null 
      })

      const result = await repository.update('1', updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(mockSupabase.from().update).toHaveBeenCalledWith(updates)
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(updatedOrder)
    })
  })

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const updatedOrder = { 
        id: '1', 
        order_number: 'ZMF-2024-001', 
        status: 'shipped' 
      }

      mockSupabase.from().single().mockResolvedValue({ 
        data: updatedOrder, 
        error: null 
      })

      const result = await repository.updateStatus('1', 'shipped')

      expect(mockSupabase.from().update).toHaveBeenCalledWith({ 
        status: 'shipped' 
      })
      expect(result).toEqual(updatedOrder)
    })
  })

  describe('getOrdersByDateRange', () => {
    it('should return orders within date range', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      const mockOrders = [
        { id: '1', order_number: 'ZMF-2024-001', created_at: '2024-01-15' },
        { id: '2', order_number: 'ZMF-2024-002', created_at: '2024-01-20' },
      ]

      mockSupabase.from().order().mockResolvedValue({ 
        data: mockOrders, 
        error: null 
      })

      const result = await repository.getOrdersByDateRange(startDate, endDate)

      expect(mockSupabase.from().gte).toHaveBeenCalledWith(
        'created_at', 
        startDate.toISOString()
      )
      expect(mockSupabase.from().lte).toHaveBeenCalledWith(
        'created_at', 
        endDate.toISOString()
      )
      expect(result).toEqual(mockOrders)
    })
  })

  describe('getOrdersByCustomer', () => {
    it('should return orders for a customer', async () => {
      const mockOrders = [
        { id: '1', order_number: 'ZMF-2024-001', customer_email: 'john@example.com' },
        { id: '2', order_number: 'ZMF-2024-002', customer_email: 'john@example.com' },
      ]

      mockSupabase.from().order().mockResolvedValue({ 
        data: mockOrders, 
        error: null 
      })

      const result = await repository.getOrdersByCustomer('john@example.com')

      expect(mockSupabase.from().eq).toHaveBeenCalledWith(
        'customer_email', 
        'john@example.com'
      )
      expect(result).toEqual(mockOrders)
    })
  })
})