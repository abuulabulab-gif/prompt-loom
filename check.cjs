const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/peony/Desktop/loom-app/screenshot_dark.png' });
  const ver = await page.locator('text=v0.4').count();
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('v0.4 visible:', ver > 0);
  console.log('theme:', theme);
  console.log('console errors:', JSON.stringify(consoleErrors));
  // Switch to light mode
  const themeBtn = await page.locator('button', { hasText: /light|☀|moon|ダーク|ライト/i }).first();
  if (await themeBtn.count() > 0) { await themeBtn.click(); await page.waitForTimeout(800); }
  await page.screenshot({ path: 'C:/Users/peony/Desktop/loom-app/screenshot_light.png' });
  const theme2 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('theme after toggle:', theme2);
  await browser.close();
})();
