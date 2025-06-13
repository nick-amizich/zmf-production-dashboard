# ZMF Production Dashboard - Testing Guide

## Overview

This guide covers the comprehensive testing strategy for the ZMF Production Dashboard. We use a multi-layered testing approach to ensure quality and reliability across all modules.

## Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: Jest with API mocking
- **E2E Testing**: Playwright
- **Coverage Reporting**: Jest Coverage

## Running Tests

### All Tests
```bash
npm run test:all       # Run all unit tests and E2E tests
```

### Unit & Integration Tests
```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### E2E Tests
```bash
npm run test:e2e      # Run E2E tests headless
npm run test:e2e:ui   # Run E2E tests with UI
```

## Test Structure

```
__tests__/
├── unit/
│   ├── repositories/    # Repository pattern tests
│   ├── services/       # Business logic tests
│   └── lib/           # Utility function tests
├── integration/
│   └── api/           # API route tests
├── components/        # React component tests
├── e2e/              # End-to-end tests
└── utils/            # Test utilities and helpers
```

## Testing Patterns

### 1. Unit Tests

#### Repository Tests
```typescript
describe('OrderRepository', () => {
  let repository: OrderRepository
  let mockSupabase: any

  beforeEach(() => {
    // Setup mocks
    mockSupabase = createMockSupabase()
    repository = new OrderRepository(mockSupabase)
  })

  it('should fetch all orders', async () => {
    // Arrange
    const mockOrders = [createMockOrder()]
    mockSupabase.from().mockResolvedValue({ data: mockOrders })

    // Act
    const result = await repository.findAll()

    // Assert
    expect(result).toEqual(mockOrders)
  })
})
```

#### Service Tests
```typescript
describe('ProductionService', () => {
  it('should create batch with orders', async () => {
    // Test business logic with mocked repositories
  })
})
```

### 2. Component Tests

```typescript
describe('OrderCard', () => {
  it('renders order information', () => {
    render(<OrderCard order={mockOrder} />)
    expect(screen.getByText('ZMF-2024-001')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const user = userEvent.setup()
    render(<OrderCard order={mockOrder} />)
    
    await user.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalled()
  })
})
```

### 3. API Route Tests

```typescript
describe('POST /api/orders', () => {
  it('creates order with valid data', async () => {
    const response = await POST(createMockRequest(validData))
    expect(response.status).toBe(200)
  })

  it('returns 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    const response = await POST(createMockRequest({}))
    expect(response.status).toBe(401)
  })
})
```

### 4. E2E Tests

```typescript
test('complete production workflow', async ({ page }) => {
  // Login
  await login(page, 'manager@example.com', 'password')
  
  // Create order
  await page.click('button:has-text("Create Order")')
  await fillOrderForm(page, orderData)
  
  // Verify order appears
  await expect(page.locator(`text="${orderData.number}"`)).toBeVisible()
})
```

## Mock Data Generators

Use the test helpers to create consistent mock data:

```typescript
import { 
  createMockOrder, 
  createMockWorker, 
  createMockBatch 
} from '@/__tests__/utils/test-helpers'

const order = createMockOrder({ 
  status: 'in_progress',
  model: 'Auteur' 
})
```

## Best Practices

### 1. Test Organization
- One test file per module/component
- Group related tests with `describe` blocks
- Use clear, descriptive test names

### 2. Setup and Teardown
```typescript
beforeEach(() => {
  jest.clearAllMocks()
  // Reset state
})

afterEach(() => {
  // Cleanup
})
```

### 3. Assertions
- Test both success and error cases
- Verify side effects (API calls, state updates)
- Check accessibility attributes

### 4. Async Testing
```typescript
// Wait for async operations
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})

// Test loading states
expect(screen.getByRole('progressbar')).toBeInTheDocument()
await waitForLoadingToFinish()
```

### 5. Mocking

#### Supabase Mocking
```typescript
mockSupabase.from.mockImplementation((table) => {
  if (table === 'orders') {
    return mockOrdersQuery
  }
  return mockDefaultQuery
})
```

#### API Mocking
```typescript
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: async () => ({ success: true })
  })
)
```

## Coverage Goals

- **Statements**: 60%+
- **Branches**: 60%+
- **Functions**: 60%+
- **Lines**: 60%+

Critical paths should have higher coverage:
- Authentication: 90%+
- Order Processing: 85%+
- Payment Handling: 90%+

## Testing Checklist

### Before Committing
- [ ] All tests pass locally
- [ ] No `.only` or `.skip` in tests
- [ ] Coverage meets thresholds
- [ ] New features have tests
- [ ] E2E tests cover critical paths

### For New Features
1. Write unit tests for business logic
2. Write component tests for UI
3. Write integration tests for API endpoints
4. Add E2E test for user workflow
5. Update test documentation

## Debugging Tests

### Jest Debugging
```bash
# Run specific test file
npm test -- OrderRepository.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create order"

# Debug in VS Code
# Add breakpoint and use Jest: Debug configuration
```

### Playwright Debugging
```bash
# Debug mode with inspector
npx playwright test --debug

# Headed mode to see browser
npx playwright test --headed

# Slow motion to see actions
npx playwright test --headed --slowmo=1000
```

## Common Issues

### 1. Supabase Auth Errors
```typescript
// Ensure auth is mocked properly
mockSupabase.auth.getUser.mockResolvedValue({
  data: { user: { id: 'test-user' } },
  error: null
})
```

### 2. React Hook Errors
```typescript
// Wrap components with providers
render(
  <QueryClientProvider client={queryClient}>
    <Component />
  </QueryClientProvider>
)
```

### 3. Async State Updates
```typescript
// Use act() for state updates
await act(async () => {
  fireEvent.click(button)
})
```

## CI/CD Integration

Tests run automatically on:
- Pull request creation
- Push to main branch
- Pre-deployment

GitHub Actions workflow handles:
1. Install dependencies
2. Run linting
3. Run unit/integration tests
4. Run E2E tests
5. Generate coverage report
6. Comment on PR with results

## Test Data Management

### Development Database
- Use Supabase local development
- Seed with test data: `npm run reset-db`

### Test User Accounts
```typescript
// Available test users
admin@example.com    // Admin role
manager@example.com  // Manager role  
worker@example.com   // Worker role
// Password: testpassword123
```

## Performance Testing

While not automated, consider:
- Load testing API endpoints
- Measuring component render times
- Testing with large datasets
- Mobile performance testing

## Security Testing

Ensure tests cover:
- Authentication flows
- Authorization checks
- Input validation
- XSS prevention
- SQL injection prevention

## Maintenance

### Weekly
- Review failing tests
- Update snapshots if needed
- Check coverage trends

### Monthly
- Review and update E2E tests
- Audit test performance
- Update test documentation

### Quarterly
- Review testing strategy
- Update dependencies
- Refactor test utilities