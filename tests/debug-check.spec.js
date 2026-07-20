// デバッグチェック — 最近の変更を網羅的に確認
import { test, expect } from '@playwright/test';

test('LOOM 総合デバッグ', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`); });

  await page.goto('http://localhost:5174/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  // ウェルカムモーダルを閉じる（ESCキー → ダメなら閉じるボタン）
  const welcomeModal = page.locator('text=LOOMへようこそ').first();
  if (await welcomeModal.isVisible()) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }
  // モーダルが残っている場合は dismiss ボタンをクリック
  const dismissBtn = page.locator('button:has-text("わかった"), button:has-text("Got it")').first();
  if (await dismissBtn.isVisible()) {
    await dismissBtn.click();
    await page.waitForTimeout(400);
  }

  // ── 1. 基本表示 ────────────────────────────────────────────────
  await page.screenshot({ path: 'audit-shots/dbg-01-initial.png' });
  console.log('1. 初期表示');

  // ── 2. QuickMenu からカラーメイカー（全項目）─────────────────
  const headerToolBtn = page.locator('button[title*="テンプレート"], button[title*="Template"]').first();
  if (await headerToolBtn.isVisible()) {
    await headerToolBtn.click();
    await page.waitForTimeout(300);
    const colorItem = page.locator('text=🎨').first();
    if (await colorItem.isVisible()) {
      await colorItem.click();
      await page.waitForTimeout(400);

      const hasHairFull  = await page.locator('button:has-text("髪全体")').first().isVisible();
      const hasFrontHair = await page.locator('button:has-text("前髪")').first().isVisible();
      const hasPartial   = await page.locator('button:has-text("部分カラー")').first().isVisible();
      console.log(`2. カラーメイカー全項目: 髪全体=${hasHairFull} 前髪=${hasFrontHair} 部分カラー=${hasPartial}`);
      await page.screenshot({ path: 'audit-shots/dbg-02-color-maker-full.png' });

      // 髪全体 → カラータイプ確認
      if (hasHairFull) {
        await page.locator('button:has-text("髪全体")').first().click();
        await page.waitForTimeout(200);
        const hasGrade   = await page.locator('button:has-text("グラデ")').isVisible();
        const hasTwotone = await page.locator('button:has-text("ツートン")').isVisible();
        const hasMulti   = await page.locator('button:has-text("マルチ")').isVisible();
        console.log(`3. カラータイプ: グラデ=${hasGrade} ツートン=${hasTwotone} マルチ(削除済)=${hasMulti}`);
        await page.screenshot({ path: 'audit-shots/dbg-03-hair-types.png' });

        // グラデ → 2色ピッカー確認
        if (hasGrade) {
          await page.locator('button:has-text("グラデ")').click();
          await page.waitForTimeout(200);
          const hasColor2 = await page.locator('text=カラー②').isVisible();
          console.log(`4. グラデ2色ピッカー: ${hasColor2}`);
          await page.screenshot({ path: 'audit-shots/dbg-04-gradient-dual.png' });
        }
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }
  }

  // ── 3. 顔ブロック 🎨 → 絞り込み確認 ─────────────────────────
  const blockColorBtns = page.locator('button[title*="カラーメイカー"]');
  const blockColorCount = await blockColorBtns.count();
  console.log(`5. ブロックの🎨ボタン数: ${blockColorCount}`);
  if (blockColorCount > 0) {
    await blockColorBtns.first().click();
    await page.waitForTimeout(400);
    const hasSkin = await page.locator('button:has-text("肌")').isVisible();
    console.log(`   顔ブロック経由で「肌」が見える(見えないはず): ${hasSkin}`);
    await page.screenshot({ path: 'audit-shots/dbg-05-block-color-filtered.png' });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }

  // ── 4. 特徴メーカー ────────────────────────────────────────────
  const featureBtns = page.locator('button[title*="特徴メーカー"]');
  const featureCount = await featureBtns.count();
  console.log(`6. ブロックの🎯ボタン数: ${featureCount}`);
  if (featureCount > 0) {
    await featureBtns.first().click();
    await page.waitForTimeout(400);
    const accessTab = page.locator('button:has-text("小物・アクセ")').first();
    if (await accessTab.isVisible()) {
      await accessTab.click();
      await page.waitForTimeout(200);
      const glassesBtn = page.locator('button:has-text("眼鏡")').first();
      if (await glassesBtn.isVisible()) {
        await glassesBtn.click();
        await page.waitForTimeout(200);
        const hasNormal   = await page.locator('button:has-text("ノーマル")').isVisible();
        const hasUnderRim = await page.locator('button:has-text("アンダーリム")').isVisible();
        console.log(`7. 眼鏡種類ステップ: ノーマル=${hasNormal} アンダーリム=${hasUnderRim}`);
        // 眼鏡サングラスの順序確認
        const partBtns = await page.locator('button:has-text("眼鏡"), button:has-text("サングラス")').allTextContents();
        console.log(`   パーツ順序: ${JSON.stringify(partBtns)}`);
        await page.screenshot({ path: 'audit-shots/dbg-06-feature-glasses.png' });
      }
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }

  // ── 5. ランダム生成 → 🎲マーカー確認 ────────────────────────
  const randomBtn = page.locator('button[title*="ランダム"], button[title*="random"]').first();
  if (await randomBtn.isVisible()) {
    page.once('dialog', d => d.accept());
    await randomBtn.click();
    await page.waitForTimeout(1500);
    const diceMarkers = page.locator('text=🎲');
    const diceCount = await diceMarkers.count();
    console.log(`8. ランダム生成後🎲マーカー数: ${diceCount}`);
    await page.screenshot({ path: 'audit-shots/dbg-07-random-dice.png' });
  }

  // ── 6. 衣装ブロック確認（レッグウェア・服装スタイル）─────────
  const outfitBlock = page.locator('text=衣装').first();
  if (await outfitBlock.isVisible()) {
    await page.screenshot({ path: 'audit-shots/dbg-08-outfit-block.png' });
    console.log('9. 衣装ブロック表示確認');
  }

  // ── 7. JS エラー ─────────────────────────────────────────────
  console.log(`\nJSエラー数: ${errors.length}`);
  errors.slice(0, 5).forEach(e => console.log('  ❌', e));
  if (errors.length > 0) {
    throw new Error(`${errors.length}件のJSエラーが発生:\n${errors.slice(0,3).join('\n')}`);
  }
  console.log('✅ JSエラーなし');
});
