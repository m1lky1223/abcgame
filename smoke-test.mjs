import { chromium } from 'playwright'
import fs from 'fs'

const BASE = 'http://localhost:5173/abcgame/'
const MODES = [
  '🎈 FREE POP', '📖 WORD POP', '❤️ SURVIVAL', '⏱️ TIME ATTACK',
  '🔤 WORD RACE', '🛡️ DEFENSE', '🐦 ODD BIRDS', '🏚️ RESCUE',
  '🎪 CARNIVAL', '💃 DANCE ACADEMY', '🏃 RUNNER', '🧬 EVOLUTION LAB',
  '🎈 BALLOON POP', '🧠 MEMORY MATCH', '👨‍🍳 CHEF KITCHEN',
  '🔍 DETECTIVE', '📚 ZOMBIE SCHOOL',
  '🏴‍☠️ PIRATE HUNT', '🎪 CIRCUS', '🎯 SHOOTING GALLERY',
]

async function wait(url, retries = 30) {
  for (let i = 0; i < retries; i++) {
    try { if ((await fetch(url)).ok) return } catch {}
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error(`Dev server not ready at ${url}`)
}

async function main() {
  console.log('Waiting for dev server...')
  await wait(BASE)

  const browser = await chromium.launch({ headless: true })
  let pass = 0, fail = 0

  for (const text of MODES) {
    const ctx = await browser.newContext({ viewport: { width: 480, height: 800 } })
    const page = await ctx.newPage()
    try {
      await page.goto(BASE, { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await page.evaluate((t) => {
        const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes(t))
        if (b) { b.scrollIntoView({ block: 'center' }); b.click() }
      }, text)
      await page.waitForTimeout(1500)
      const canvas = await page.$('canvas')
      if (!canvas) throw new Error('No canvas found')
      pass++
      process.stdout.write('✓')
    } catch (e) {
      fail++
      process.stdout.write('✗')
    } finally { await ctx.close() }
  }

  await browser.close()
  console.log(`\n${pass}/${pass + fail} passed${fail ? `, ${fail} failed` : ''}`)
  process.exit(fail > 0 ? 1 : 0)
}

main()
