import { test } from '@playwright/test';

test('block status panel', async ({ page }) => {
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  try { await page.locator('button:has-text("わかった")').first().click({ timeout: 2000 }); } catch {}
  await page.waitForTimeout(500);

  // グリッドアイコンをクリック
  const gridIcon = page.locator('div[title="ブロックステータス"]').first();
  await gridIcon.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'audit-shots/block-status-dark.png' });
});
