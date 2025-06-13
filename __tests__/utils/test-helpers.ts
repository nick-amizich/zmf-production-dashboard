import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock data generators
export function createMockOrder(overrides = {}) {
  return {
    id: 'order-123',
    order_number: 'ZMF-2024-001',
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    model: 'Verite Closed',
    configuration: {
      wood_type: 'Cherry',
      cable_type: 'Stock',
    },
    price: 2800,
    status: 'pending',
    created_at: new Date().toISOString(),
    priority: 'normal',
    ...overrides,
  }
}

export function createMockWorker(overrides = {}) {
  return {
    id: 'worker-123',
    auth_user_id: 'auth-123',
    name: 'Test Worker',
    email: 'worker@example.com',
    role: 'worker',
    specializations: ['Sanding', 'Finishing'],
    hourly_rate: 25,
    active: true,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockBatch(overrides = {}) {
  return {
    id: 'batch-123',
    batch_number: 'BATCH-2024-001',
    model: 'Verite Closed',
    total_quantity: 4,
    status: 'active',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockStageAssignment(overrides = {}) {
  return {
    id: 'assignment-123',
    order_id: 'order-123',
    worker_id: 'worker-123',
    stage: 'Sanding',
    started_at: new Date().toISOString(),
    completed_at: null,
    estimated_hours: 4,
    actual_hours: null,
    notes: null,
    ...overrides,
  }
}

export function createMockQualityCheck(overrides = {}) {
  return {
    id: 'check-123',
    order_id: 'order-123',
    worker_id: 'worker-123',
    stage: 'Sanding',
    passed: true,
    checklist_results: {
      'surface-smooth': true,
      'no-scratches': true,
      'proper-grit': true,
    },
    notes: 'Quality check passed',
    checked_at: new Date().toISOString(),
    ...overrides,
  }
}

// Mock Supabase response helpers
export function mockSupabaseSuccess(data: any) {
  return {
    data,
    error: null,
  }
}

export function mockSupabaseError(message: string) {
  return {
    data: null,
    error: { message },
  }
}

// Wait for async operations
export async function waitForLoadingToFinish() {
  const { waitFor } = await import('@testing-library/react')
  await waitFor(() => {
    const loadingElements = document.querySelectorAll('[aria-busy="true"]')
    expect(loadingElements.length).toBe(0)
  })
}

// Mock fetch responses
export function mockFetchResponse(response: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
  })
}

// Test user credentials
export const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'testpassword123',
    role: 'admin',
  },
  manager: {
    email: 'manager@example.com',
    password: 'testpassword123',
    role: 'manager',
  },
  worker: {
    email: 'worker@example.com',
    password: 'testpassword123',
    role: 'worker',
  },
}

// Date helpers
export function getTestDateRange() {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  
  return {
    startDate,
    endDate,
  }
}

// Assert helpers
export function expectToBeWithinRange(actual: number, expected: number, tolerance = 0.01) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance)
}