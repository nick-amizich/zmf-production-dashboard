import { test, expect, Page } from '@playwright/test'

// Helper to login as manager
async function loginAsManager(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'manager@example.com')
  await page.fill('input[type="password"]', 'testpassword123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

// Helper to login as worker
async function loginAsWorker(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'worker@example.com')
  await page.fill('input[type="password"]', 'testpassword123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

test.describe('Production Workflow', () => {
  test('manager can create a new order', async ({ page }) => {
    await loginAsManager(page)
    
    // Navigate to production page
    await page.click('a:has-text("Production Overview")')
    await page.waitForURL('/production')
    
    // Click create order button
    await page.click('button:has-text("Create Order")')
    
    // Fill in order details
    await page.fill('input[placeholder="Customer name"]', 'Test Customer')
    await page.fill('input[placeholder="Customer email"]', 'test@customer.com')
    
    // Select model
    await page.click('button[role="combobox"]:has-text("Select model")')
    await page.click('text=Verite Closed')
    
    // Select wood type
    await page.click('button:has-text("Select wood")')
    await page.click('text=Cherry')
    
    // Add notes
    await page.fill('textarea[placeholder="Order notes"]', 'E2E test order')
    
    // Submit form
    await page.click('button:has-text("Create Order")')
    
    // Verify success
    await expect(page.locator('[role="alert"]')).toContainText('Order created successfully')
  })

  test('manager can create and manage batches', async ({ page }) => {
    await loginAsManager(page)
    
    // Navigate to production page
    await page.click('a:has-text("Production Overview")')
    await page.waitForURL('/production')
    
    // Switch to batch view
    await page.click('button:has-text("Batch View")')
    
    // Create new batch
    await page.click('button:has-text("Create Batch")')
    
    // Fill batch details
    await page.fill('input[placeholder="Batch number"]', 'BATCH-E2E-001')
    await page.click('button:has-text("Select model")')
    await page.click('text=Verite Closed')
    
    // Select orders for batch (assuming some exist)
    await page.click('input[type="checkbox"]').first()
    
    // Create batch
    await page.click('button:has-text("Create Batch")')
    
    // Verify batch appears
    await expect(page.locator('text=BATCH-E2E-001')).toBeVisible()
  })

  test('worker can view and complete assignments', async ({ page }) => {
    await loginAsWorker(page)
    
    // Navigate to mobile interface
    await page.click('a:has-text("Mobile Interface")')
    await page.waitForURL('/worker/mobile')
    
    // View current assignments
    await expect(page.locator('h2:has-text("Current Assignment")')).toBeVisible()
    
    // If assignment exists, complete it
    const hasAssignment = await page.locator('button:has-text("Complete Stage")').isVisible()
    
    if (hasAssignment) {
      // Open quality checklist
      await page.click('button:has-text("Complete Stage")')
      
      // Fill quality checklist
      await page.click('input[type="checkbox"]').first()
      await page.click('input[type="checkbox"]').nth(1)
      
      // Add notes
      await page.fill('textarea[placeholder="Additional notes"]', 'Quality check passed')
      
      // Submit
      await page.click('button:has-text("Submit Quality Check")')
      
      // Verify completion
      await expect(page.locator('[role="alert"]')).toContainText('Stage completed successfully')
    }
  })

  test('quality control flow works correctly', async ({ page }) => {
    await loginAsManager(page)
    
    // Navigate to quality page
    await page.click('a:has-text("Quality Control")')
    await page.waitForURL('/quality')
    
    // View quality metrics
    await expect(page.locator('text=Overall Pass Rate')).toBeVisible()
    await expect(page.locator('text=Issues by Stage')).toBeVisible()
    
    // Report an issue
    await page.click('button:has-text("Report Issue")')
    
    // Fill issue details
    await page.click('button:has-text("Select order")')
    await page.click('[role="option"]').first()
    
    await page.click('button:has-text("Select stage")')
    await page.click('text=Sanding')
    
    await page.click('button:has-text("Select severity")')
    await page.click('text=Medium')
    
    await page.fill('textarea[placeholder="Describe the issue"]', 'E2E test issue')
    
    // Submit issue
    await page.click('button:has-text("Report Issue")')
    
    // Verify issue appears in list
    await expect(page.locator('[role="alert"]')).toContainText('Issue reported successfully')
  })

  test('drag and drop works in production pipeline', async ({ page }) => {
    await loginAsManager(page)
    
    // Navigate to production page
    await page.click('a:has-text("Production Overview")')
    await page.waitForURL('/production')
    
    // Find an order card in the pending column
    const orderCard = page.locator('[data-stage="pending"] [data-order-id]').first()
    const inProgressColumn = page.locator('[data-stage="in_progress"]')
    
    // Perform drag and drop
    await orderCard.dragTo(inProgressColumn)
    
    // Verify order moved
    await expect(page.locator('[role="alert"]')).toContainText('Order moved to In Progress')
  })
})