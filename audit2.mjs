import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:5177';
const OUT  = 'audit2-shots';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const browser = await chromium.launch({ headless: true });
const errors = [];

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log('  → ' + name);
}

// WelcomeHintが出ている間にtheme/langを設定してからdismiss
// WelcomeHintは毎回必ず表示される（fresh IndexedDB）
async function setupAndDismiss(page, theme = 'dark', lang = 'ja') {
  await page.waitForTimeout(600);

  // theme: WelcomeHintの🌙ダーク / ☀️ライトボタン
  if (theme === 'dark') {
    try {
      await page.locator('button:has-text("🌙"), button:has-text("ダーク"), button:has-text("Dark")').first().click({ timeout: 2000 });
      await page.waitForTimeout(200);
    } catch (e) {
      console.log('  [warn] dark theme:', e.message.slice(0, 80));
    }
  }
  // lang: WelcomeHintのEnglish / 日本語ボタン
  if (lang === 'en') {
    try {
      await page.locator('button:has-text("English")').first().click({ timeout: 2000 });
      await page.waitForTimeout(200);
    } catch (e) {
      console.log('  [warn] en lang:', e.message.slice(0, 80));
    }
  }

  // dismiss
  try {
    await page.locator('button:has-text("わかった"), button:has-text("Got it")').first().click({ timeout: 2000 });
  } catch {}
  await page.waitForTimeout(400);
}

async function openSettings(page, lang = 'ja') {
  // ⚙️設定ボタンをクリック
  try {
    const btn = lang === 'en'
      ? page.locator('button:has-text("Settings")').first()
      : page.locator('button:has-text("設定")').first();
    await btn.click({ timeout: 2000 });
    await page.waitForTimeout(400);
  } catch (e) {
    console.log('  [warn] openSettings:', e.message.slice(0, 80));
  }
}

// ── 01: PC Dark JA ───────────────────────────────────────────
{
  console.log('\n[PC Dark JA]');
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => errors.push('[PC-dark-ja] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await setupAndDismiss(page, 'dark', 'ja');
  await shot(page, '01-pc-dark-ja-main');

  // 出力バー展開
  try { await page.locator('button[title*="折りたたむ"], button[title*="展開"]').first().click({ timeout: 1500 }); await page.waitForTimeout(200); } catch {}
  await shot(page, '02-pc-dark-ja-output-expanded');

  // キャラパネル
  try { await page.locator('button:has-text("閉じる")').first().click({ timeout: 1500 }); await page.waitForTimeout(200); } catch {}
  await shot(page, '03-pc-dark-ja-char-panel');

  // 設定
  await openSettings(page, 'ja');
  await shot(page, '04-pc-dark-ja-settings-shortcuts');
  try { await page.locator('button:has-text("ガイド")').click({ timeout: 2000 }); await page.waitForTimeout(200); } catch {}
  await shot(page, '05-pc-dark-ja-settings-guide');
  try { await page.locator('button:has-text("About")').click({ timeout: 2000 }); await page.waitForTimeout(200); } catch {}
  await shot(page, '06-pc-dark-ja-settings-about');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // 自然文タブ
  try { await page.locator('button:has-text("自然文")').click({ timeout: 2000 }); await page.waitForTimeout(300); } catch {}
  await shot(page, '07-pc-dark-ja-natural-tab');

  await page.close();
}

// ── 02: PC Light JA ──────────────────────────────────────────
{
  console.log('\n[PC Light JA]');
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => errors.push('[PC-light-ja] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await setupAndDismiss(page, 'light', 'ja'); // light = default, no click needed
  await shot(page, '08-pc-light-ja-main');

  try { await page.locator('button[title*="折りたたむ"], button[title*="展開"]').first().click({ timeout: 1500 }); await page.waitForTimeout(200); } catch {}
  await shot(page, '09-pc-light-ja-output-expanded');

  await openSettings(page, 'ja');
  await shot(page, '10-pc-light-ja-settings');
  await page.keyboard.press('Escape');
  await page.close();
}

// ── 03: PC Dark EN ───────────────────────────────────────────
{
  console.log('\n[PC Dark EN]');
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => errors.push('[PC-dark-en] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await setupAndDismiss(page, 'dark', 'en');
  await shot(page, '11-pc-dark-en-main');

  await openSettings(page, 'en');
  await shot(page, '12-pc-dark-en-settings');
  await page.keyboard.press('Escape');
  await page.close();
}

// ── 04: PC Light EN ──────────────────────────────────────────
{
  console.log('\n[PC Light EN]');
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => errors.push('[PC-light-en] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await setupAndDismiss(page, 'light', 'en');
  await shot(page, '13-pc-light-en-main');

  try { await page.locator('button[title*="Collapse"], button[title*="expand"]').first().click({ timeout: 1500 }); await page.waitForTimeout(200); } catch {}
  await shot(page, '14-pc-light-en-output-expanded');

  await openSettings(page, 'en');
  await shot(page, '15-pc-light-en-settings');
  await page.keyboard.press('Escape');
  await page.close();
}

// ── 05: Mobile Dark JA ───────────────────────────────────────
{
  console.log('\n[Mobile Dark JA]');
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push('[Mobile-dark-ja] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await setupAndDismiss(page, 'dark', 'ja');
  await shot(page, '16-mobile-dark-ja-main');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await shot(page, '17-mobile-dark-ja-output');

  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(200);
  await shot(page, '18-mobile-dark-ja-blocks');

  await page.close();
}

// ── 06: Mobile Light JA ──────────────────────────────────────
{
  console.log('\n[Mobile Light JA]');
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push('[Mobile-light-ja] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await setupAndDismiss(page, 'light', 'ja');
  await shot(page, '19-mobile-light-ja-main');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await shot(page, '20-mobile-light-ja-output');

  await page.close();
}

// ── 07: Mobile Dark EN ───────────────────────────────────────
{
  console.log('\n[Mobile Dark EN]');
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push('[Mobile-dark-en] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await setupAndDismiss(page, 'dark', 'en');
  await shot(page, '21-mobile-dark-en-main');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await shot(page, '22-mobile-dark-en-output');

  await page.close();
}

// ── 08: Mobile Light EN ──────────────────────────────────────
{
  console.log('\n[Mobile Light EN]');
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push('[Mobile-light-en] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await setupAndDismiss(page, 'light', 'en');
  await shot(page, '23-mobile-light-en-main');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await shot(page, '24-mobile-light-en-output');

  await page.close();
}

await browser.close();

console.log('\n=== JS Errors ===');
if (errors.length === 0) console.log('None');
else errors.forEach(e => console.log(e));
console.log(`\nDone. ${OUT}/`);
