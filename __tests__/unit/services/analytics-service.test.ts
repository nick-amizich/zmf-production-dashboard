import { AnalyticsService } from '@/lib/services/analytics-service'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

describe('AnalyticsService', () => {
  let service: AnalyticsService
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(),
      })),
    }
    
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    service = new AnalyticsService(mockSupabase)
  })

  describe('getProductionAnalytics', () => {
    it('should calculate production metrics correctly', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      const mockOrders = [
        { id: '1', status: 'pending', created_at: '2024-01-10' },
        { id: '2', status: 'in_progress', created_at: '2024-01-15' },
        { id: '3', status: 'shipped', created_at: '2024-01-20' },
        { id: '4', status: 'shipped', created_at: '2024-01-25' },
      ]

      const mockStageAssignments = [
        { 
          stage: 'Sanding', 
          started_at: '2024-01-10T10:00:00Z', 
          completed_at: '2024-01-10T14:00:00Z' 
        },
        { 
          stage: 'Sanding', 
          started_at: '2024-01-11T10:00:00Z', 
          completed_at: '2024-01-11T15:00:00Z' 
        },
        { 
          stage: 'Finishing', 
          started_at: '2024-01-12T10:00:00Z', 
          completed_at: '2024-01-12T16:00:00Z' 
        },
      ]

      // Mock orders query
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ 
          data: mockOrders, 
          error: null 
        }),
      }))

      // Mock stage assignments query
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        not: jest.fn().mockResolvedValue({ 
          data: mockStageAssignments, 
          error: null 
        }),
      }))

      const result = await service.getProductionAnalytics(startDate, endDate)

      expect(result).toEqual({
        totalOrders: 4,
        completedOrders: 2,
        completionRate: 50,
        ordersByStatus: {
          pending: 1,
          in_progress: 1,
          shipped: 2,
        },
        avgProductionTime: 5, // Average hours
        stageEfficiency: {
          Sanding: {
            count: 2,
            avgTime: 4.5, // hours
          },
          Finishing: {
            count: 1,
            avgTime: 6, // hours
          },
        },
      })
    })
  })

  describe('getQualityAnalytics', () => {
    it('should calculate quality metrics correctly', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      const mockQualityChecks = [
        { id: '1', stage: 'Sanding', passed: true, checked_at: '2024-01-10' },
        { id: '2', stage: 'Sanding', passed: true, checked_at: '2024-01-11' },
        { id: '3', stage: 'Sanding', passed: false, checked_at: '2024-01-12' },
        { id: '4', stage: 'Finishing', passed: true, checked_at: '2024-01-13' },
        { id: '5', stage: 'Finishing', passed: true, checked_at: '2024-01-14' },
      ]

      const mockIssues = [
        { 
          id: '1', 
          category: 'Surface Defect', 
          severity: 'medium',
          created_at: '2024-01-12',
          resolved_at: '2024-01-13',
        },
        { 
          id: '2', 
          category: 'Alignment', 
          severity: 'high',
          created_at: '2024-01-15',
          resolved_at: null,
        },
      ]

      // Mock quality checks query
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ 
          data: mockQualityChecks, 
          error: null 
        }),
      }))

      // Mock issues query
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ 
          data: mockIssues, 
          error: null 
        }),
      }))

      const result = await service.getQualityAnalytics(startDate, endDate)

      expect(result).toEqual({
        overallPassRate: 80, // 4 out of 5 passed
        passRateByStage: {
          Sanding: 66.67, // 2 out of 3
          Finishing: 100, // 2 out of 2
        },
        commonIssues: [
          { category: 'Surface Defect', count: 1, percentage: 50 },
          { category: 'Alignment', count: 1, percentage: 50 },
        ],
        qualityTrend: expect.any(Array),
        criticalIssues: 0,
        resolvedIssues: 1,
        avgResolutionTime: 24, // hours
      })
    })
  })

  describe('getWorkerAnalytics', () => {
    it('should calculate worker performance metrics', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      const mockWorkers = [
        { 
          id: 'worker-1', 
          name: 'John Doe',
          role: 'worker',
          specializations: ['Sanding', 'Finishing'],
        },
        { 
          id: 'worker-2', 
          name: 'Jane Smith',
          role: 'worker',
          specializations: ['Sanding'],
        },
      ]

      const mockPerformanceData = [
        { 
          worker_id: 'worker-1',
          date: '2024-01-15',
          units: 10,
          quality_score: 95,
          efficiency: 2.5,
          time: 480, // minutes
        },
        { 
          worker_id: 'worker-2',
          date: '2024-01-15',
          units: 8,
          quality_score: 90,
          efficiency: 2.0,
          time: 480,
        },
      ]

      // Mock workers query
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({ 
          data: mockWorkers, 
          error: null 
        }),
      }))

      // Mock performance query
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ 
          data: mockPerformanceData, 
          error: null 
        }),
      }))

      const result = await service.getWorkerAnalytics(startDate, endDate)

      expect(result).toEqual({
        totalWorkers: 2,
        activeWorkers: 2,
        utilizationRate: 100,
        topPerformers: [
          {
            worker: mockWorkers[0],
            score: expect.any(Number),
            metrics: {
              units: 10,
              avgQuality: 95,
              efficiency: 2.5,
              time: 480,
            },
          },
          {
            worker: mockWorkers[1],
            score: expect.any(Number),
            metrics: {
              units: 8,
              avgQuality: 90,
              efficiency: 2.0,
              time: 480,
            },
          },
        ],
        productivityByStage: {
          Sanding: {
            workers: 2,
            avgOutput: 9, // (10 + 8) / 2
          },
          Finishing: {
            workers: 1,
            avgOutput: 10,
          },
        },
        attendanceRate: 100,
        skillDistribution: {
          Sanding: 2,
          Finishing: 1,
        },
      })
    })
  })

  describe('getRevenueAnalytics', () => {
    it('should calculate revenue metrics correctly', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      const mockOrders = [
        { 
          id: '1',
          order_number: 'ZMF-2024-001',
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          model: 'Verite Closed',
          price: 2800,
          created_at: '2024-01-10',
          status: 'shipped',
        },
        { 
          id: '2',
          order_number: 'ZMF-2024-002',
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          model: 'Auteur',
          price: 3500,
          created_at: '2024-01-15',
          status: 'shipped',
        },
        { 
          id: '3',
          order_number: 'ZMF-2024-003',
          customer_name: 'Jane Smith',
          customer_email: 'jane@example.com',
          model: 'Verite Closed',
          price: 2800,
          created_at: '2024-01-20',
          status: 'pending',
        },
      ]

      mockSupabase.from.mockResolvedValue({ 
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ 
          data: mockOrders, 
          error: null 
        }),
      })

      const result = await service.getRevenueAnalytics(startDate, endDate)

      expect(result).toEqual({
        totalRevenue: 9100, // 2800 + 3500 + 2800
        revenueByModel: {
          'Verite Closed': 5600,
          'Auteur': 3500,
        },
        revenueByMonth: [
          { 
            month: 'January', 
            revenue: 9100, 
            orders: 3 
          },
        ],
        averageOrderValue: 3033.33,
        projectedRevenue: expect.any(Number),
        topCustomers: [
          {
            customer: 'John Doe',
            orders: 2,
            revenue: 6300,
          },
          {
            customer: 'Jane Smith',
            orders: 1,
            revenue: 2800,
          },
        ],
      })
    })
  })

  describe('getDashboardAnalytics', () => {
    it('should aggregate all analytics data', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      // Mock all the individual analytics methods
      jest.spyOn(service, 'getProductionAnalytics').mockResolvedValue({
        totalOrders: 10,
        completedOrders: 5,
        completionRate: 50,
        ordersByStatus: {},
        avgProductionTime: 24,
        stageEfficiency: {},
      })

      jest.spyOn(service, 'getQualityAnalytics').mockResolvedValue({
        overallPassRate: 95,
        passRateByStage: {},
        commonIssues: [],
        qualityTrend: [],
        criticalIssues: 0,
        resolvedIssues: 5,
        avgResolutionTime: 12,
      })

      jest.spyOn(service, 'getWorkerAnalytics').mockResolvedValue({
        totalWorkers: 15,
        activeWorkers: 12,
        utilizationRate: 80,
        topPerformers: [],
        productivityByStage: {},
        attendanceRate: 95,
        skillDistribution: {},
      })

      jest.spyOn(service, 'getRevenueAnalytics').mockResolvedValue({
        totalRevenue: 50000,
        revenueByModel: {},
        revenueByMonth: [],
        averageOrderValue: 2500,
        projectedRevenue: 60000,
        topCustomers: [],
      })

      const result = await service.getDashboardAnalytics(startDate, endDate)

      expect(result).toEqual({
        production: expect.objectContaining({
          totalOrders: 10,
          completedOrders: 5,
          completionRate: 50,
        }),
        quality: expect.objectContaining({
          overallPassRate: 95,
          criticalIssues: 0,
          resolvedIssues: 5,
        }),
        worker: expect.objectContaining({
          totalWorkers: 15,
          activeWorkers: 12,
          utilizationRate: 80,
        }),
        revenue: expect.objectContaining({
          totalRevenue: 50000,
          averageOrderValue: 2500,
          projectedRevenue: 60000,
        }),
      })

      expect(service.getProductionAnalytics).toHaveBeenCalledWith(startDate, endDate)
      expect(service.getQualityAnalytics).toHaveBeenCalledWith(startDate, endDate)
      expect(service.getWorkerAnalytics).toHaveBeenCalledWith(startDate, endDate)
      expect(service.getRevenueAnalytics).toHaveBeenCalledWith(startDate, endDate)
    })
  })
})