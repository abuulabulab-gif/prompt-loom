import { test, expect } from '@playwright/test';

test('app loads without errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('text=LOOM')).toBeVisible();
  await expect(page.locator('text=v0.4')).toBeVisible();
  expect(errors).toHaveLength(0);
});

test('dark/light mode toggle works', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(theme).toBe('dark');

  // find the theme toggle (moon/sun button)
  const themeBtn = page.locator('button').filter({ hasText: /🌙|☀/ }).first();
  await themeBtn.click();

  const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(newTheme).toBe('light');
});

test('block expands and shows tags', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Expand first block
  const collapseBtn = page.locator('button', { hasText: '▼' }).first();
  await collapseBtn.click();
  await page.waitForTimeout(300);

  // Strength row should be visible in at least one block
  await expect(page.locator('text=強度:').first()).toBeVisible();
});
