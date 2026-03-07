import { test, expect } from '@playwright/test';

test.describe('Artist Directory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/artists');
  });

  test('page loads and shows artist listing', async ({ page }) => {
    // Header should show the directory title
    await expect(page.getByText('設計師總覽')).toBeVisible();

    // Should show the NaLi Match logo/link
    await expect(page.locator('header').getByText('NaLi Match')).toBeVisible();
  });

  test('role filter buttons are visible', async ({ page }) => {
    // Role filters: 全部, 美甲師, 美睫師
    await expect(page.getByRole('button', { name: '全部' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '美甲師' })).toBeVisible();
    await expect(page.getByRole('button', { name: '美睫師' })).toBeVisible();
  });

  test('city filter buttons are visible', async ({ page }) => {
    // The city filter row should have at least the "全部" option
    // City filters are rendered as buttons in a scrollable row
    const cityButtons = page.locator('main button');
    await expect(cityButtons.first()).toBeVisible();
  });

  test('artist card links work', async ({ page }) => {
    // Wait for loading to finish - either cards appear or empty state
    await page.waitForSelector('[class*="grid"] a, [class*="text-center"]', {
      timeout: 10000,
    });

    // If there are artist cards, verify they link to artist detail pages
    const artistCards = page.locator('a[href^="/artists/"]');
    const count = await artistCards.count();

    if (count > 0) {
      const href = await artistCards.first().getAttribute('href');
      expect(href).toMatch(/^\/artists\/.+/);
    }
  });
});
