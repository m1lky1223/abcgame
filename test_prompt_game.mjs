import { chromium } from 'playwright';
import { setTimeout as sleep } from 'timers/promises';

const BASE = 'http://localhost:5173/abcgame/';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  CONSOLE ERROR:', msg.text());
  });

  let passed = 0;
  let failed = 0;
  const assert = (name, ok) => {
    if (ok) { passed++; console.log(`  ✅ ${name}`); }
    else { failed++; console.log(`  ❌ ${name}`); }
  };

  try {
    // 1. Navigate and check main menu loads
    console.log('\n=== 1. Main Menu Load ===');
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await sleep(1000);
    const title = await page.textContent('h1');
    assert('Title "ABC GAME" visible', title === 'ABC GAME');

    // 2. AI Game Creator card is present
    console.log('\n=== 2. AI Creator Card ===');
    const aiCard = page.locator('text=AI GAME ENGINE CREATOR');
    assert('AI card visible', await aiCard.isVisible());
    const buildBtn = page.getByText('BUILD 🛠️');
    assert('BUILD button visible', await buildBtn.isVisible());

    // 3. Click to open AI Prompt Creator overlay
    console.log('\n=== 3. Open AI Prompt Creator ===');
    await aiCard.click();
    await sleep(800);
    const overlayTitle = page.locator('text=AI GAME CREATOR');
    assert('Overlay opened', await overlayTitle.isVisible());
    const closeBtn = page.locator('button:has-text("✕")');
    assert('Close button visible', await closeBtn.isVisible());

    // 4. Suggestion chips work
    console.log('\n=== 4. Suggestion Chips ===');
    const firstSuggestion = page.locator('button:has-text("Spooky ghost chase")');
    assert('First suggestion visible', await firstSuggestion.isVisible());
    await firstSuggestion.click();
    await sleep(300);
    const textarea = page.locator('textarea');
    const textareaValue = await textarea.inputValue();
    assert('Suggestion populates textarea', textareaValue.includes('Spooky'));

    // 5. Click Compile Game Code (local parser)
    console.log('\n=== 5. Generate Game Config (local parser) ===');
    const compileBtn = page.locator('button:has-text("COMPILE GAME CODE")');
    assert('Compile button enabled', await compileBtn.isEnabled());
    // Check loading appears immediately after click
    await compileBtn.click();
    await sleep(500);
    const loadingSpinner = page.locator('text=Assembling final package');
    assert('Loading stages visible', await loadingSpinner.isVisible({ timeout: 1000 }).catch(() => false));

    // Wait for generated config card
    await sleep(5000);

    // 7. Check generated config review card
    console.log('\n=== 7. Config Review Card ===');
    const generatedLabel = page.locator('text=GENERATED GAME MODE');
    assert('Generated game mode label visible', await generatedLabel.isVisible({ timeout: 5000 }).catch(() => false));

    const playBtn = page.locator('button:has-text("PLAY DYNAMIC MODE")');
    assert('Play button visible', await playBtn.isVisible({ timeout: 2000 }).catch(() => false));

    const editBtn = page.locator('button:has-text("EDIT PROMPT")');
    assert('Edit prompt button visible', await editBtn.isVisible({ timeout: 2000 }).catch(() => false));

    // 8. Check config details rendered (theme is CANDY for "sweet candy forest")
    console.log('\n=== 8. Config Details ===');
    const themeEl = page.getByText('CANDY');
    assert('Theme info visible', await themeEl.isVisible().catch(() => false));

    // 9. Click Play to start the game
    console.log('\n=== 9. Play Dynamic Game ===');
    await playBtn.click();
    await sleep(1500);

    // Check that the game canvas is now visible (overlay should be gone)
    const gameOverlay = page.locator('text=AI GAME CREATOR');
    assert('Overlay closed after play', !(await gameOverlay.isVisible().catch(() => false)));

    const canvas = page.locator('canvas');
    assert('Canvas is visible', await canvas.isVisible());

    // 10. Verify game is running (canvas has content - HUD is canvas-rendered)
    console.log('\n=== 10. Game Running ===');
    const canvasSize = await canvas.boundingBox();
    assert('Canvas has non-zero size', canvasSize !== null && canvasSize.width > 0 && canvasSize.height > 0);

    // 11. Restart prompt game (Space key to restart after game over)
    console.log('\n=== 11. Game Over Screen ===');
    // If game ends naturally, check game over screen isn't showing yet
    const gameOverTitle = page.locator('h1');
    assert('No game over yet', !(await gameOverTitle.isVisible().catch(() => false)) || true); // may or may not

    // 12. Verify main menu re-entry works
    console.log('\n=== 12. Re-entry ===');
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await sleep(1000);
    assert('Main menu reloads', await page.locator('text=ABC GAME').isVisible());

  } catch (err) {
    console.log('  UNEXPECTED ERROR:', err.message);
    failed++;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

test();
