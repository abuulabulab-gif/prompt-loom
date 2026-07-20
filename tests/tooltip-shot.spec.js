import { test } from '@playwright/test';

test('tooltip center check', async ({ page }) => {
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  try { await page.locator('button:has-text("わかった")').first().click({ timeout: 2000 }); } catch {}
  await page.waitForTimeout(500);

  // highres = 辞書登録済み・デフォルト非アクティブ → "高解像度" と表示される
  const btn = page.locator('button:has-text("高解像度")').first();
  const box = await btn.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'audit-shots/tooltip-center-test.png' });
});
