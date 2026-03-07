import { test, expect } from '@playwright/test';

test.describe('Service Request Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/request');
  });

  test('form page loads with progress bar', async ({ page }) => {
    // Header shows NaLi Match
    await expect(page.locator('header').getByText('NaLi Match')).toBeVisible();

    // Progress bar should be visible
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
  });

  test('first step shows location selection', async ({ page }) => {
    // The first step title is "服務地點" (Service Location)
    await expect(page.getByText('服務地點')).toBeVisible();
  });

  test('can click next after selecting a location', async ({ page }) => {
    // Wait for the form to load
    await expect(page.getByText('服務地點')).toBeVisible();

    // Select a location option (click the first available location button/option)
    const locationOption = page.locator('main button').first();
    await locationOption.click();

    // Click the "下一步" (Next) button
    const nextButton = page.getByRole('button', { name: '下一步' });
    await nextButton.click();

    // Should advance to step 2 - "服務項目" (Service Type)
    await expect(page.getByText('服務項目')).toBeVisible();
  });

  test('can click back to go to previous step', async ({ page }) => {
    // Wait for step 1 to load
    await expect(page.getByText('服務地點')).toBeVisible();

    // Select a location and go to step 2
    const locationOption = page.locator('main button').first();
    await locationOption.click();

    const nextButton = page.getByRole('button', { name: '下一步' });
    await nextButton.click();

    // Verify we are on step 2
    await expect(page.getByText('服務項目')).toBeVisible();

    // Click "上一步" (Back) button
    const backButton = page.getByRole('button', { name: '上一步' });
    await backButton.click();

    // Should go back to step 1 - "服務地點"
    await expect(page.getByText('服務地點')).toBeVisible();
  });
});
