import { test, expect } from '@playwright/test'

test.describe('Claims Management (requires authentication)', () => {
  test.skip('authenticated user can view claims page', async ({ page }) => {
    // Note: This test is skipped because it requires authentication setup
    // To run this test, you would need to:
    // 1. Set up a test user in beforeEach
    // 2. Log in programmatically
    // 3. Then perform these assertions

    await page.goto('/dashboard/claims')

    await expect(page.getByText('我的請款')).toBeVisible()
  })

  test.skip('authenticated user can navigate to new claim form', async ({ page }) => {
    // Requires authentication

    await page.goto('/dashboard/claims')
    await page.getByText('新增請款').click()

    await expect(page).toHaveURL('/dashboard/claims/new')
    await expect(page.getByText('請款資訊')).toBeVisible()
  })

  test.skip('new claim form has required fields', async ({ page }) => {
    // Requires authentication

    await page.goto('/dashboard/claims/new')

    await expect(page.getByLabel('請款金額')).toBeVisible()
    await expect(page.getByLabel('請款事由')).toBeVisible()
    await expect(page.getByLabel('發票附件')).toBeVisible()
    await expect(page.getByRole('button', { name: '提交請款' })).toBeVisible()
    await expect(page.getByRole('button', { name: '儲存為草稿' })).toBeVisible()
  })
})

// Example of how to create an authenticated test helper
test.describe('Setup authenticated session', () => {
  test('example of authenticated test flow', async ({ page }) => {
    // This is an example of how you would structure authenticated tests
    // In a real scenario, you would:

    // 1. Create a test user via API or database seeding
    // const testUser = await createTestUser()

    // 2. Log in programmatically
    // await page.goto('/login')
    // await page.fill('[type="email"]', testUser.email)
    // await page.fill('[type="password"]', testUser.password)
    // await page.click('button[type="submit"]')
    // await expect(page).toHaveURL('/dashboard')

    // 3. Now you can test authenticated features
    // await page.goto('/dashboard/claims/new')
    // ... test claim creation

    // For now, we just verify the unauthenticated flow works
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })
})
