import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:5176';
const OUT  = 'audit-shots';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const browser = await chromium.launch({ headless: true });
const errors = [];

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('  → ' + name);
}

// ── PC Dark JA ───────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => errors.push('[PC-dark-ja] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  try { await page.locator('button:has-text("わかった")').click({ timeout: 2000 }); } catch {}
  await page.waitForTimeout(400);
  await shot(page, '01-pc-dark-ja-main');

  // Settings → shortcuts tab
  await page.keyboard.press('?');
  await page.waitForTimeout(300);
  await shot(page, '02-pc-dark-ja-settings-shortcuts');
  // API tab
  try { await page.locator('button:has-text("API")').click({ timeout: 2000 }); await page.waitForTimeout(200); } catch {}
  await shot(page, '03-pc-dark-ja-settings-api');
  // Platform tab
  try { await page.locator('button:has-text("版の違い")').click({ timeout: 2000 }); await page.waitForTimeout(200); } catch {}
  await shot(page, '04-pc-dark-ja-settings-platform');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // Natural tab
  try { await page.locator('button:has-text("自然文")').click({ timeout: 2000 }); await page.waitForTimeout(300); } catch {}
  await shot(page, '05-pc-dark-ja-natural-tab');
  // Expand output
  try { await page.locator('text=▲').first().click({ timeout: 2000 }); await page.waitForTimeout(200); } catch {}
  await shot(page, '06-pc-dark-ja-output-expanded');

  // Character panel
  try { await page.locator('button:has-text("詳細")').click({ timeout: 2000 }); await page.waitForTimeout(200); } catch {}
  await shot(page, '07-pc-dark-ja-char-panel');

  await page.close();
}

// ── PC Light JA ──────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => errors.push('[PC-light-ja] ' + e.message));
  // Inject light theme via localStorage before load
  await page.addInitScript(() => {
    const fake = { theme: 'light', lang: 'ja', viewMode: 'normal' };
    // Will be overridden by db but sets initial state
  });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  try { await page.locator('button:has-text("わかった")').click({ timeout: 2000 }); } catch {}
  // Toggle to light via settings
  await page.keyboard.press('?');
  await page.waitForTimeout(300);
  try {
    // Click the light button in settings header
    await page.locator('button:has-text("ライト")').click({ timeout: 3000 });
    await page.waitForTimeout(300);
  } catch {
    console.log('  [warn] Could not find ライト button, trying toggle theme');
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await shot(page, '08-pc-light-ja-main');
  await page.close();
}

// ── PC Dark EN ────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => errors.push('[PC-dark-en] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  try { await page.locator('button:has-text("わかった"), button:has-text("Got it")').first().click({ timeout: 2000 }); } catch {}
  // Toggle language in settings
  await page.keyboard.press('?');
  await page.waitForTimeout(300);
  try { await page.locator('button:has-text("日本語")').click({ timeout: 2000 }); await page.waitForTimeout(300); } catch {}
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await shot(page, '09-pc-dark-en-main');
  // Settings in EN
  await page.keyboard.press('?');
  await page.waitForTimeout(300);
  await shot(page, '10-pc-dark-en-settings');
  await page.keyboard.press('Escape');
  await page.close();
}

// ── Mobile Dark JA ────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push('[Mobile-dark-ja] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  try { await page.locator('button:has-text("わかった")').click({ timeout: 2000 }); } catch {}
  await page.waitForTimeout(400);
  await shot(page, '11-mobile-dark-ja-main');
  // scroll to output bar
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await shot(page, '12-mobile-dark-ja-output');
  // Tap a block to see it
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(200);
  await shot(page, '13-mobile-dark-ja-blocks');
  await page.close();
}

// ── Mobile Light EN ───────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push('[Mobile-light-en] ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  try { await page.locator('button:has-text("わかった")').click({ timeout: 2000 }); } catch {}
  await page.keyboard.press('?');
  await page.waitForTimeout(300);
  // light + EN
  try { await page.locator('button:has-text("ライト")').click({ timeout: 2000 }); await page.waitForTimeout(200); } catch {}
  try { await page.locator('button:has-text("日本語")').click({ timeout: 2000 }); await page.waitForTimeout(200); } catch {}
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await shot(page, '14-mobile-light-en-main');
  await page.close();
}

await browser.close();

console.log('\n=== JS Errors ===');
if (errors.length === 0) console.log('None');
else errors.forEach(e => console.log(e));
console.log(`\nDone. Screenshots in ./${OUT}/`);
