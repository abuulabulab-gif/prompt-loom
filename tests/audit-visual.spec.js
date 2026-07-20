import { test } from '@playwright/test';

test('visual audit - FHD desktop', async ({ page }) => {
  // ── 1920×1080 FHD ──────────────────────────────────────────────
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(2000);

  // 01: ウェルカムモーダル表示状態
  await page.screenshot({ path: 'audit-shots/01-welcome-modal.png' });

  // ウェルカムモーダルを閉じる
  const startBtn = page.locator('text=わかった！始める');
  if (await startBtn.isVisible()) await startBtn.click();
  await page.waitForTimeout(500);

  // 02: メイン画面全体（ヘッダー・ブロック上部）
  await page.screenshot({ path: 'audit-shots/02-fhd-main.png' });

  // 03: スクロールしてブロック一覧中段
  await page.evaluate(() => window.scrollTo(0, 350));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'audit-shots/03-fhd-blocks.png' });

  // 04: ヘッダーバーのアップ（ナビゲーションエリア）
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const headerEl = page.locator('[class*="sticky"]').first();
  await page.screenshot({ path: 'audit-shots/04-fhd-header-area.png', clip: { x: 0, y: 0, width: 1920, height: 140 } });

  // 05: 集中モード ON
  const focusBtn = page.locator('button[title*="集中編集"]').first();
  if (await focusBtn.isVisible()) {
    await focusBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'audit-shots/05-focus-mode-on.png' });

    // 06: 集中モード解除（スクロール戻りを確認）
    const unfocusBtn = page.locator('text=集中解除').first();
    if (await unfocusBtn.isVisible()) await unfocusBtn.click();
    else await focusBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'audit-shots/06-focus-mode-off.png' });
  }

  // 07: 出力バー（下部）
  await page.screenshot({ path: 'audit-shots/07-fhd-output-bar.png', clip: { x: 0, y: 900, width: 1920, height: 180 } });

  // ── 1280×800 ラップトップ ──────────────────────────────────────
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  const startBtn2 = page.locator('text=わかった！始める');
  if (await startBtn2.isVisible()) await startBtn2.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'audit-shots/08-1280-main.png' });

  // ── 1024×768 小型ラップトップ（zoom非適用のはず） ──────────────
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  const startBtn3 = page.locator('text=わかった！始める');
  if (await startBtn3.isVisible()) await startBtn3.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'audit-shots/09-1024-main.png' });

  // ── 375×812 スマホ ─────────────────────────────────────────────
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  const startBtn4 = page.locator('text=わかった！始める');
  if (await startBtn4.isVisible()) await startBtn4.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'audit-shots/10-mobile-main.png' });
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'audit-shots/11-mobile-blocks.png' });
});
