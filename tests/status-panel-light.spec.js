import { test } from '@playwright/test';

test('block status panel light mode', async ({ page }) => {
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  // dismiss welcome (light mode is default)
  try { await page.locator('button:has-text("わかった")').first().click({ timeout: 2000 }); } catch {}
  await page.waitForTimeout(400);

  // open panel
  const grid = page.locator('div[title="ブロックステータス"]').first();
  await grid.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'audit-shots/block-status-light.png' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'audit-shots/block-status-closed.png' });
});
