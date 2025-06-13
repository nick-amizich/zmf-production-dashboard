import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrderCard } from '@/components/order-card'
import { toast } from '@/hooks/use-toast'

// Mock dependencies
jest.mock('@/hooks/use-toast')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('OrderCard', () => {
  const mockOrder = {
    id: 'order-123',
    order_number: 'ZMF-2024-001',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    model: 'Verite Closed',
    configuration: {
      wood_type: 'Cherry',
      cable_type: 'Stock',
    },
    price: 2800,
    status: 'pending' as const,
    created_at: '2024-01-15T10:00:00Z',
    priority: 'normal' as const,
    notes: 'Rush order',
  }

  const mockOnUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  it('renders order information correctly', () => {
    render(<OrderCard order={mockOrder} onUpdate={mockOnUpdate} />)

    expect(screen.getByText('ZMF-2024-001')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Verite Closed')).toBeInTheDocument()
    expect(screen.getByText('$2,800.00')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('displays configuration details', () => {
    render(<OrderCard order={mockOrder} onUpdate={mockOnUpdate} />)

    expect(screen.getByText('Cherry')).toBeInTheDocument()
    expect(screen.getByText('Stock')).toBeInTheDocument()
  })

  it('formats date correctly', () => {
    render(<OrderCard order={mockOrder} onUpdate={mockOnUpdate} />)

    // The exact format may depend on locale, so we'll check for the presence of date parts
    expect(screen.getByText(/Jan.*15.*2024/)).toBeInTheDocument()
  })

  it('displays priority badge with correct color', () => {
    const { rerender } = render(<OrderCard order={mockOrder} onUpdate={mockOnUpdate} />)
    
    let badge = screen.getByText('normal')
    expect(badge).toHaveClass('bg-blue-500')

    // Test high priority
    const highPriorityOrder = { ...mockOrder, priority: 'high' as const }
    rerender(<OrderCard order={highPriorityOrder} onUpdate={mockOnUpdate} />)
    badge = screen.getByText('high')
    expect(badge).toHaveClass('bg-orange-500')

    // Test urgent priority
    const urgentPriorityOrder = { ...mockOrder, priority: 'urgent' as const }
    rerender(<OrderCard order={urgentPriorityOrder} onUpdate={mockOnUpdate} />)
    badge = screen.getByText('urgent')
    expect(badge).toHaveClass('bg-red-500')
  })

  it('shows notes when present', () => {
    render(<OrderCard order={mockOrder} onUpdate={mockOnUpdate} />)
    expect(screen.getByText('Rush order')).toBeInTheDocument()
  })

  it('opens detail modal when clicked', async () => {
    const user = userEvent.setup()
    render(<OrderCard order={mockOrder} onUpdate={mockOnUpdate} />)

    const card = screen.getByText('ZMF-2024-001').closest('div')
    await user.click(card!)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Order Details')).toBeInTheDocument()
    })
  })

  it('handles status update', async () => {
    const user = userEvent.setup()
    render(<OrderCard order={mockOrder} onUpdate={mockOnUpdate} />)

    // Open modal
    const card = screen.getByText('ZMF-2024-001').closest('div')
    await user.click(card!)

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Find and click status select
    const statusSelect = screen.getByRole('combobox')
    await user.click(statusSelect)

    // Select new status
    const inProgressOption = screen.getByText('in_progress')
    await user.click(inProgressOption)

    // Click update button
    const updateButton = screen.getByRole('button', { name: /update status/i })
    await user.click(updateButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/orders/order-123/status',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in_progress' }),
        })
      )
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(toast).toHaveBeenCalledWith({
        title: 'Status Updated',
        description: 'Order status has been updated successfully.',
      })
    })
  })

  it('handles API error during status update', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Update failed' }),
    })

    const user = userEvent.setup()
    render(<OrderCard order={mockOrder} onUpdate={mockOnUpdate} />)

    // Open modal and update status
    const card = screen.getByText('ZMF-2024-001').closest('div')
    await user.click(card!)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const statusSelect = screen.getByRole('combobox')
    await user.click(statusSelect)
    const inProgressOption = screen.getByText('in_progress')
    await user.click(inProgressOption)
    const updateButton = screen.getByRole('button', { name: /update status/i })
    await user.click(updateButton)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      })
    })
  })

  it('renders compact version correctly', () => {
    render(<OrderCard order={mockOrder} onUpdate={mockOnUpdate} compact />)

    expect(screen.getByText('ZMF-2024-001')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Verite Closed')).toBeInTheDocument()
    
    // Compact version should not show email or full configuration
    expect(screen.queryByText('john@example.com')).not.toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const minimalOrder = {
      id: 'order-124',
      order_number: 'ZMF-2024-002',
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      model: 'Auteur',
      configuration: {},
      price: 3500,
      status: 'in_progress' as const,
      created_at: '2024-01-16T10:00:00Z',
    }

    render(<OrderCard order={minimalOrder} onUpdate={mockOnUpdate} />)

    expect(screen.getByText('ZMF-2024-002')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('Notes:')).not.toBeInTheDocument()
  })
})