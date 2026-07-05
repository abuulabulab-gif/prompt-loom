import { test, expect } from '@playwright/test';

// 共通：アプリを開き、初回ウェルカムモーダルが出ていたら閉じる
async function openApp(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const start = page.getByRole('button', { name: /わかった！始める/ });
  if (await start.isVisible().catch(() => false)) {
    await start.click();
    await page.waitForTimeout(200);
  }
}

test('app loads without errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  await openApp(page);

  // ヘッダーロゴ（完全一致）で判定 — 'text=LOOM' はウェルカム文等にもマッチするため
  await expect(page.getByText('LOOM', { exact: true })).toBeVisible();
  expect(errors).toHaveLength(0);
});

test('default theme is light', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(theme).toBe('light');
});

test('theme toggle switches between light and dark', async ({ page }) => {
  // ウェルカムモーダル内のテーマボタンで切替（初回表示前提）
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(before).toBe('light');

  const themeBtn = page.getByRole('button', { name: /🌙 ダーク/ }).first();
  await themeBtn.click();

  const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(after).toBe('dark');
});

test('block expands and shows tags', async ({ page }) => {
  await openApp(page);

  const collapseBtn = page.locator('button', { hasText: '▼' }).first();
  await collapseBtn.click();
  await page.waitForTimeout(300);

  await expect(page.locator('text=強度:').first()).toBeVisible();
});

test('clicking a tag adds it to the output', async ({ page }) => {
  await openApp(page);

  // Expand the quality block (first expanded block)
  const tagBtn = page.locator('button').filter({ hasText: 'masterpiece' }).first();
  if (await tagBtn.isVisible()) {
    await tagBtn.click();
    await page.waitForTimeout(200);
    // Output area should contain something
    const outputArea = page.locator('textarea').first();
    const text = await outputArea.inputValue().catch(() => '');
    expect(text.length).toBeGreaterThan(0);
  }
});
