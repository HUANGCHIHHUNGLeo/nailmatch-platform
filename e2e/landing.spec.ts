import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads and shows NaLi Match title', async ({ page }) => {
    await expect(page.locator('header').getByText('NaLi Match')).toBeVisible();
  });

  test('shows hero section with CTA buttons', async ({ page }) => {
    // Hero headline should be visible
    await expect(page.locator('h1')).toBeVisible();

    // Primary CTA button linking to /request
    const primaryCta = page.locator('section a[href="/request"]').first();
    await expect(primaryCta).toBeVisible();

    // Artist CTA button linking to /artist
    const artistCta = page.locator('a[href="/artist"]').first();
    await expect(artistCta).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    // Header has the artist login link
    const artistNav = page.locator('header a[href="/artist"]');
    await expect(artistNav).toBeVisible();

    // Header has the customer CTA button linking to /request
    const requestNav = page.locator('header a[href="/request"]');
    await expect(requestNav).toBeVisible();
  });

  test('artist directory link navigates correctly', async ({ page }) => {
    // Click the artist login / artist portal link in the header
    const artistLink = page.locator('header a[href="/artist"]');
    await artistLink.click();

    // Should navigate to /artist
    await expect(page).toHaveURL(/\/artist/);
  });
});
