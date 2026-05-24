import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

const CREATURES: Record<string, { name: string; emoji: string }> = {
  'A': { name: 'Anemone', emoji: '🌊' }, 'B': { name: 'Barracuda', emoji: '🐟' },
  'C': { name: 'Clownfish', emoji: '🐠' }, 'D': { name: 'Dolphin', emoji: '🐬' },
  'E': { name: 'Eel', emoji: '🐍' }, 'F': { name: 'Flounder', emoji: '🐡' },
  'G': { name: 'Goldfish', emoji: '🐟' }, 'H': { name: 'Hammerhead', emoji: '🦈' },
  'I': { name: 'Iguana', emoji: '🦎' }, 'J': { name: 'Jellyfish', emoji: '🪼' },
  'K': { name: 'Krill', emoji: '🦐' }, 'L': { name: 'Lobster', emoji: '🦞' },
  'M': { name: 'Manatee', emoji: '🐋' }, 'N': { name: 'Narwhal', emoji: '🦄' },
  'O': { name: 'Octopus', emoji: '🐙' }, 'P': { name: 'Pufferfish', emoji: '🐡' },
  'Q': { name: 'Queen Angelfish', emoji: '🐠' }, 'R': { name: 'Ray', emoji: '🦈' },
  'S': { name: 'Seahorse', emoji: '🐴' }, 'T': { name: 'Turtle', emoji: '🐢' },
  'U': { name: 'Urchin', emoji: '🟣' }, 'V': { name: 'Viperfish', emoji: '🐟' },
  'W': { name: 'Whale', emoji: '🐳' }, 'X': { name: 'X-ray Tetra', emoji: '🐟' },
  'Y': { name: 'Yellowtail', emoji: '🐟' }, 'Z': { name: 'Zebrafish', emoji: '🦓' },
}

const CREATURE_WORDS: Record<string, string[]> = {
  'A': ['_NEMONE', 'AN_MONE', 'ANE_ONE'], 'B': ['_ARRACUDA', 'BA_ACUDA'], 'C': ['_LOWNFISH', 'CL_WNFISH'],
  'D': ['_OLPHIN', 'DO_PHIN'], 'E': ['_EL', 'E_'], 'F': ['_LOUNDER', 'FL_UNDER'],
  'G': ['_OLDFISH', 'GO_DFISH'], 'H': ['_AMMERHEAD', 'HA_ERHEAD'], 'I': ['_GUANA', 'IG_ANA'],
  'J': ['_ELLYFISH', 'JE_LYFISH'], 'K': ['_RILL', 'KR_LL'], 'L': ['_OBSTER', 'LO_TER'],
  'M': ['_ANATEE', 'MA_ATEE'], 'N': ['_ARWHAL', 'NA_WHAL'], 'O': ['_CTOPUS', 'OC_OPUS'],
  'P': ['_UFFERFISH', 'PU_FERFISH'], 'Q': ['_UEEN', 'QU_EN'], 'R': ['_AY', 'RA_'],
  'S': ['_EAHORSE', 'SE_HORSE'], 'T': ['_URTLE', 'TU_TLE'], 'U': ['_RCHIN', 'UR_HIN'],
  'V': ['_IPERFISH', 'VI_ERFISH'], 'W': ['_HALE', 'WH_LE'], 'X': ['_RAY TETRA', 'X_A_ TETRA'],
  'Y': ['_ELLOWTAIL', 'YE_LOWTAIL'], 'Z': ['_EBRAFISH', 'ZE_AFISH'],
}

export class AquariumMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private creatureIndex = 0; private wordIndex = 0
  private score = 0
  private currentLetter = ''
  private currentWord = ''
  private floatingLetters: FloatingLetter[] = []
  private particles: any[] = []
  private correctFlash = 0; private transition = 0
  private winner = false
  private bubbles: { x: number; y: number; speed: number; size: number }[] = []

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.nextCreature()
  }

  private nextCreature(): void {
    if (this.creatureIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.creatureIndex]
    this.wordIndex = 0; this.correctFlash = 0
    this.nextWord()
  }

  private nextWord(): void {
    const words = CREATURE_WORDS[this.currentLetter]
    if (!words || this.wordIndex >= words.length) {
      this.creatureIndex++; this.transition = 1; return
    }
    this.currentWord = words[this.wordIndex]
    this.spawnLetters()
  }

  private spawnLetters(): void {
    const needed = this.currentLetter
    const options = [needed]
    const pool = ALL_LETTERS.filter(l => l !== needed)
    while (options.length < 5) {
      const p = pool[Math.floor(Math.random() * pool.length)]
      if (!options.includes(p)) options.push(p)
    }
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]
    }
    this.floatingLetters = options.map(l => new FloatingLetter(this.canvasW, this.canvasH, l, 150))
  }

  handleClick(cx: number, cy: number): void {
    if (this.winner || this.correctFlash > 0 || this.transition > 0) return
    for (const l of this.floatingLetters) {
      if (!l.collected && l.containsCanvas(cx, cy)) {
        this.checkLetter(l.letter); l.pop(); return
      }
    }
  }

  handleKey(key: string): void {
    if (this.winner || this.correctFlash > 0 || this.transition > 0) return
    const f = this.floatingLetters.find(l => !l.collected && l.letter.toLowerCase() === key)
    if (f) { this.checkLetter(f.letter); f.pop() }
  }

  private checkLetter(letter: string): void {
    if (letter === this.currentLetter) {
      this.score += 10; this.wordIndex++; this.correctFlash = 1
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.35, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#5dade2', life: 0, maxLife: 20 })
      }
      this.onStateChange?.({ score: this.score, creature: this.creatureIndex + 1, total: 26 })
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++
    if (this.transition > 0) {
      this.transition++
      if (this.transition > 30) { this.transition = 0; this.nextCreature() }
      return
    }
    if (this.correctFlash > 0) {
      this.correctFlash++
      for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
      this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
      if (this.correctFlash > 30) { this.correctFlash = 0; this.nextWord() }
      return
    }
    for (const l of this.floatingLetters) { l.update(0) }
    this.floatingLetters = this.floatingLetters.filter(l => { if (l.collected) return l.popTime < l.popDuration; return true })
    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
    this.particles = this.particles.filter((p: any) => p.life < p.maxLife)

    if (this.frame % 10 === 0) {
      this.bubbles.push({ x: Math.random() * this.canvasW, y: this.canvasH + 10, speed: 0.3 + Math.random() * 0.5, size: 2 + Math.random() * 4 })
    }
    for (const b of this.bubbles) { b.y -= b.speed }
    this.bubbles = this.bubbles.filter(b => b.y > -10)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#0a2a4a'); grad.addColorStop(0.5, '#0a3a6a'); grad.addColorStop(1, '#0a4a3a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    for (const b of this.bubbles) {
      ctx.strokeStyle = `rgba(150,200,255,${0.2 + Math.sin(b.y * 0.1) * 0.1})`
      ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.stroke()
    }

    const tx = this.canvasW / 2 - 70; const ty = this.canvasH * 0.08
    ctx.strokeStyle = 'rgba(100,200,255,0.3)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.roundRect(tx, ty, 140, 90, 8); ctx.stroke()
    ctx.fillStyle = 'rgba(0,50,100,0.4)'; ctx.beginPath(); ctx.roundRect(tx, ty, 140, 90, 8); ctx.fill()

    const creature = CREATURES[this.currentLetter]
    if (creature) {
      ctx.font = '36px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(creature.emoji, this.canvasW / 2, ty + 35)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px system-ui'
      ctx.fillText(creature.name, this.canvasW / 2, ty + 70)
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#5dade2'
    ctx.fillText(`🐠 Creature ${this.creatureIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#58d68d'
    ctx.fillText(`Score: ${this.score}`, this.canvasW - 12, 16)

    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Name: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.55)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Pop the bubble: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.6)
    }

    for (const l of this.floatingLetters) {
      if (!l.collected) l.draw(ctx, this.frame)
      else if (l.popTime < l.popDuration) l.draw(ctx, this.frame)
    }

    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife; if (a <= 0) continue
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill()
    }
    ctx.globalAlpha = 1

    if (this.transition > 0) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.3, this.transition / 15)})`; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#5dade2'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🐬 Creature discovered! Next tank!', this.canvasW / 2, this.canvasH / 2)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#5dade2'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🐳 Ocean Explorer! All 26 discovered!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  restart(): void {
    this.creatureIndex = 0; this.wordIndex = 0; this.score = 0
    this.floatingLetters = []; this.particles = []; this.bubbles = []
    this.correctFlash = 0; this.transition = 0; this.winner = false; this.frame = 0
    this.nextCreature()
  }
}
