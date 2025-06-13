import { ProductionService } from '@/lib/services/production-service'
import { OrderRepository } from '@/lib/repositories/order-repository'
import { BatchRepository } from '@/lib/repositories/batch-repository'
import { StageAssignmentRepository } from '@/lib/repositories/stage-assignment-repository'
import { WorkerRepository } from '@/lib/repositories/worker-repository'

// Mock repositories
jest.mock('@/lib/repositories/order-repository')
jest.mock('@/lib/repositories/batch-repository')
jest.mock('@/lib/repositories/stage-assignment-repository')
jest.mock('@/lib/repositories/worker-repository')

describe('ProductionService', () => {
  let service: ProductionService
  let mockOrderRepo: jest.Mocked<OrderRepository>
  let mockBatchRepo: jest.Mocked<BatchRepository>
  let mockStageAssignmentRepo: jest.Mocked<StageAssignmentRepository>
  let mockWorkerRepo: jest.Mocked<WorkerRepository>
  let mockSupabase: any

  beforeEach(() => {
    // Create mock Supabase client
    mockSupabase = {
      from: jest.fn(),
      auth: { getUser: jest.fn() },
    }

    // Create mock repositories
    mockOrderRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      getOrdersByDateRange: jest.fn(),
      getOrdersByCustomer: jest.fn(),
    } as any

    mockBatchRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      addOrderToBatch: jest.fn(),
      removeOrderFromBatch: jest.fn(),
      getOrdersInBatch: jest.fn(),
    } as any

    mockStageAssignmentRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      getAssignmentsByWorker: jest.fn(),
      getAssignmentsByOrder: jest.fn(),
      completeAssignment: jest.fn(),
      getActiveAssignments: jest.fn(),
    } as any

    mockWorkerRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByAuthUserId: jest.fn(),
      getAvailableWorkers: jest.fn(),
      getWorkersByRole: jest.fn(),
      getWorkersBySpecialization: jest.fn(),
      updateLastLoginAt: jest.fn(),
    } as any

    // Mock constructor implementations
    ;(OrderRepository as jest.Mock).mockImplementation(() => mockOrderRepo)
    ;(BatchRepository as jest.Mock).mockImplementation(() => mockBatchRepo)
    ;(StageAssignmentRepository as jest.Mock).mockImplementation(() => mockStageAssignmentRepo)
    ;(WorkerRepository as jest.Mock).mockImplementation(() => mockWorkerRepo)

    service = new ProductionService(mockSupabase)
  })

  describe('createBatch', () => {
    it('should create a batch with orders', async () => {
      const batchData = {
        batch_number: 'BATCH-2024-001',
        model: 'Verite Closed',
        total_quantity: 4,
      }
      const orderIds = ['order-1', 'order-2']

      const createdBatch = { id: 'batch-1', ...batchData }
      mockBatchRepo.create.mockResolvedValue(createdBatch)
      mockBatchRepo.addOrderToBatch.mockResolvedValue(undefined)

      const result = await service.createBatch(batchData, orderIds)

      expect(mockBatchRepo.create).toHaveBeenCalledWith(batchData)
      expect(mockBatchRepo.addOrderToBatch).toHaveBeenCalledTimes(2)
      expect(mockBatchRepo.addOrderToBatch).toHaveBeenCalledWith('batch-1', 'order-1')
      expect(mockBatchRepo.addOrderToBatch).toHaveBeenCalledWith('batch-1', 'order-2')
      expect(result).toEqual(createdBatch)
    })

    it('should handle batch creation without orders', async () => {
      const batchData = {
        batch_number: 'BATCH-2024-001',
        model: 'Verite Closed',
        total_quantity: 0,
      }

      const createdBatch = { id: 'batch-1', ...batchData }
      mockBatchRepo.create.mockResolvedValue(createdBatch)

      const result = await service.createBatch(batchData)

      expect(mockBatchRepo.create).toHaveBeenCalledWith(batchData)
      expect(mockBatchRepo.addOrderToBatch).not.toHaveBeenCalled()
      expect(result).toEqual(createdBatch)
    })
  })

  describe('assignWorkerToStage', () => {
    it('should create stage assignment successfully', async () => {
      const assignmentData = {
        order_id: 'order-1',
        worker_id: 'worker-1',
        stage: 'Sanding',
        estimated_hours: 4,
      }

      const order = { id: 'order-1', status: 'in_progress' }
      const worker = { id: 'worker-1', active: true, specializations: ['Sanding'] }
      const assignment = { id: 'assignment-1', ...assignmentData, started_at: new Date() }

      mockOrderRepo.findById.mockResolvedValue(order)
      mockWorkerRepo.findById.mockResolvedValue(worker)
      mockStageAssignmentRepo.create.mockResolvedValue(assignment)

      const result = await service.assignWorkerToStage(
        assignmentData.order_id,
        assignmentData.worker_id,
        assignmentData.stage,
        assignmentData.estimated_hours
      )

      expect(mockOrderRepo.findById).toHaveBeenCalledWith('order-1')
      expect(mockWorkerRepo.findById).toHaveBeenCalledWith('worker-1')
      expect(mockStageAssignmentRepo.create).toHaveBeenCalledWith({
        ...assignmentData,
        started_at: expect.any(Date),
      })
      expect(result).toEqual(assignment)
    })

    it('should throw error if order not found', async () => {
      mockOrderRepo.findById.mockResolvedValue(null)

      await expect(
        service.assignWorkerToStage('order-1', 'worker-1', 'Sanding', 4)
      ).rejects.toThrow('Order not found')
    })

    it('should throw error if worker not found', async () => {
      mockOrderRepo.findById.mockResolvedValue({ id: 'order-1' })
      mockWorkerRepo.findById.mockResolvedValue(null)

      await expect(
        service.assignWorkerToStage('order-1', 'worker-1', 'Sanding', 4)
      ).rejects.toThrow('Worker not found')
    })

    it('should throw error if worker not active', async () => {
      mockOrderRepo.findById.mockResolvedValue({ id: 'order-1' })
      mockWorkerRepo.findById.mockResolvedValue({ id: 'worker-1', active: false })

      await expect(
        service.assignWorkerToStage('order-1', 'worker-1', 'Sanding', 4)
      ).rejects.toThrow('Worker is not active')
    })
  })

  describe('completeStageAssignment', () => {
    it('should complete assignment and update order status', async () => {
      const assignment = {
        id: 'assignment-1',
        order_id: 'order-1',
        stage: 'Shipping',
        completed_at: null,
      }

      const completedAssignment = {
        ...assignment,
        completed_at: new Date(),
      }

      mockStageAssignmentRepo.findById.mockResolvedValue(assignment)
      mockStageAssignmentRepo.completeAssignment.mockResolvedValue(completedAssignment)
      mockOrderRepo.updateStatus.mockResolvedValue({ id: 'order-1', status: 'shipped' })

      const result = await service.completeStageAssignment('assignment-1', 'Good quality')

      expect(mockStageAssignmentRepo.completeAssignment).toHaveBeenCalledWith(
        'assignment-1',
        'Good quality'
      )
      expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith('order-1', 'shipped')
      expect(result).toEqual(completedAssignment)
    })

    it('should not update order status for non-shipping stages', async () => {
      const assignment = {
        id: 'assignment-1',
        order_id: 'order-1',
        stage: 'Sanding',
        completed_at: null,
      }

      mockStageAssignmentRepo.findById.mockResolvedValue(assignment)
      mockStageAssignmentRepo.completeAssignment.mockResolvedValue({
        ...assignment,
        completed_at: new Date(),
      })

      await service.completeStageAssignment('assignment-1', 'Good quality')

      expect(mockOrderRepo.updateStatus).not.toHaveBeenCalled()
    })
  })

  describe('getProductionDashboard', () => {
    it('should return aggregated production data', async () => {
      const mockOrders = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'in_progress' },
        { id: '3', status: 'shipped' },
      ]
      const mockBatches = [
        { id: 'batch-1', status: 'active' },
        { id: 'batch-2', status: 'completed' },
      ]
      const mockAssignments = [
        { id: 'assign-1', stage: 'Sanding', completed_at: null },
        { id: 'assign-2', stage: 'Finishing', completed_at: new Date() },
      ]

      mockOrderRepo.findAll.mockResolvedValue(mockOrders)
      mockBatchRepo.findAll.mockResolvedValue(mockBatches)
      mockStageAssignmentRepo.getActiveAssignments.mockResolvedValue(mockAssignments)

      const result = await service.getProductionDashboard()

      expect(result).toEqual({
        orders: {
          total: 3,
          pending: 1,
          in_progress: 1,
          shipped: 1,
        },
        batches: {
          total: 2,
          active: 1,
          completed: 1,
        },
        activeAssignments: mockAssignments,
        stageMetrics: {
          Sanding: { active: 1, completed: 0 },
          Finishing: { active: 0, completed: 1 },
        },
      })
    })
  })

  describe('getAvailableWorkersForStage', () => {
    it('should return workers with matching specialization', async () => {
      const mockWorkers = [
        { id: 'worker-1', name: 'John', specializations: ['Sanding', 'Finishing'] },
        { id: 'worker-2', name: 'Jane', specializations: ['Sanding'] },
      ]

      mockWorkerRepo.getWorkersBySpecialization.mockResolvedValue(mockWorkers)

      const result = await service.getAvailableWorkersForStage('Sanding')

      expect(mockWorkerRepo.getWorkersBySpecialization).toHaveBeenCalledWith('Sanding')
      expect(result).toEqual(mockWorkers)
    })
  })
})