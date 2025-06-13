import { test, expect, Page } from '@playwright/test'

// Helper function to login
async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

test.describe('Authentication Flow', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard')
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login?redirectTo=%2Fdashboard')
    await expect(page.locator('h1')).toContainText('Sign in to your account')
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('[role="alert"]')).toContainText('Invalid login credentials')
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in valid test credentials
    await page.fill('input[type="email"]', 'worker@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Worker Dashboard')
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await login(page, 'worker@example.com', 'testpassword123')
    
    // Click logout button
    await page.click('button:has-text("Logout")')
    
    // Should redirect to login
    await page.waitForURL('/login')
    await expect(page.locator('h1')).toContainText('Sign in to your account')
    
    // Try to access dashboard again
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login?redirectTo=%2Fdashboard')
  })

  test('should show different dashboards based on role', async ({ page }) => {
    // Test worker role
    await login(page, 'worker@example.com', 'testpassword123')
    await expect(page.locator('h1')).toContainText('Worker Dashboard')
    await page.click('button:has-text("Logout")')
    
    // Test manager role
    await login(page, 'manager@example.com', 'testpassword123')
    await expect(page.locator('h1')).toContainText('Manager Dashboard')
    await expect(page.locator('a:has-text("Production Overview")')).toBeVisible()
    await expect(page.locator('a:has-text("Analytics")')).toBeVisible()
    await page.click('button:has-text("Logout")')
    
    // Test admin role
    await login(page, 'admin@example.com', 'testpassword123')
    await expect(page.locator('h1')).toContainText('Admin Dashboard')
    await expect(page.locator('a:has-text("System Administration")')).toBeVisible()
  })
})