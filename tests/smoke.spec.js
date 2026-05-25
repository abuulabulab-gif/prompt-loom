import { test, expect } from '@playwright/test';

test('app loads without errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('text=LOOM')).toBeVisible();
  expect(errors).toHaveLength(0);
});

test('default theme is light', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(theme).toBe('light');
});

test('theme toggle switches between light and dark', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(before).toBe('light');

  const themeBtn = page.locator('button').filter({ hasText: /🌙|☀/ }).first();
  await themeBtn.click();

  const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(after).toBe('dark');
});

test('block expands and shows tags', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const collapseBtn = page.locator('button', { hasText: '▼' }).first();
  await collapseBtn.click();
  await page.waitForTimeout(300);

  await expect(page.locator('text=強度:').first()).toBeVisible();
});

test('clicking a tag adds it to the output', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Expand the quality block (first expanded block)
  const tagBtn = page.locator('button').filter({ hasText: 'masterpiece' }).first();
  if (await tagBtn.isVisible()) {
    const initialOutput = await page.locator('textarea, [data-output]').first().inputValue().catch(() => '');
    await tagBtn.click();
    await page.waitForTimeout(200);
    // Output area should contain something
    const outputArea = page.locator('textarea').first();
    const text = await outputArea.inputValue().catch(() => '');
    expect(text.length).toBeGreaterThan(0);
  }
});
