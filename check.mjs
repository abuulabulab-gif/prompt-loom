const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.screenshot({ path: 'C:/Users/peony/Desktop/loom-app/screenshot_dark.png', fullPage: false });
  console.log('TITLE:', await page.title());
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.waitForTimeout(1500);
  // check version text
  const ver = await page.locator('text=v0.4').count();
  console.log('v0.4 visible:', ver > 0);
  // check dark mode active
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('theme:', theme);
  console.log('console errors:', errors.length);
  await browser.close();
})();
