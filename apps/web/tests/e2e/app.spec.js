import { test, expect } from '@playwright/test';

test.describe('EduCycle smoke', () => {
  test('trang chủ có title EduCycle', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EduCycle/i);
  });
});
