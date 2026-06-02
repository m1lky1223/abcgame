import { chromium } from 'playwright';
import { setTimeout as sleep } from 'timers/promises';

const BASE = 'http://localhost:5173/abcgame/';

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await sleep(1000);
  
  // Click AI card
  await page.getByText('AI GAME ENGINE CREATOR').click();
  await sleep(800);
  
  // Click first suggestion
  await page.getByText('Spooky ghost chase').click();
  await sleep(300);
  
  // Compile
  await page.getByText('COMPILE GAME CODE').click();
  await sleep(6000);
  
  // Screenshot
  await page.screenshot({ path: '/tmp/ai_prompt_debug.png', fullPage: false });
  
  // Get page content around theme area
  const html = await page.content();
  // Find lines with "CANDY" or "THEME" in them
  const lines = html.split('\n');
  for (const l of lines) {
    if (l.includes('CANDY') || l.includes('THEME') || l.includes('NIGHT')) {
      console.log(l.trim().substring(0, 200));
    }
  }
  
  await browser.close();
}
debug();
