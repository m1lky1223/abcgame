import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

const BUILDING_WORDS: Record<string, string[]> = {
  'A': ['_PARTMENT', 'AP_RTMENT'], 'B': ['_AKERY', 'BA_ERY'], 'C': ['_ASTLE', 'CA_TLE'],
  'D': ['_EPARTMENT', 'DE_ARTMENT'], 'E': ['L_MENTARY', 'ELE_ENTARY'], 'F': ['_ACTORY', 'FA_TORY'],
  'G': ['_ARAGE', 'GA_AGE'], 'H': ['_OSPITAL', 'HO_ITAL'], 'I': ['_CE CREAM', 'ICE C_EAM'],
  'J': ['_EWELRY', 'JE_ELRY'], 'K': ['_ENNEL', 'KE_NEL'], 'L': ['_IBRARY', 'LI_RARY'],
  'M': ['_OVIE', 'MO_IE'], 'N': ['_IGHTCLUB', 'NI_HTCLUB'], 'O': ['_BSERVATORY', 'OB_ERVATORY'],
  'P': ['_OLICE', 'PO_ICE'], 'Q': ['_UILT', 'QU_LT'], 'R': ['_ESTAURANT', 'RE_TAURANT'],
  'S': ['_CHOOL', 'SC_OOL'], 'T': ['_OY STORE', 'TO_ STORE'], 'U': ['_MBRELLA', 'UM_RELLA'],
  'V': ['_ET', 'VE_'], 'W': ['_ATER PARK', 'WA_ER'], 'X': ['_RAY', 'X_A_'],
  'Y': ['_OGA', 'YO_A'], 'Z': ['_OO', 'ZO_'],
}

export class FireFightersMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private buildingIndex = 0; private wordIndex = 0
  private score = 0
  private currentLetter = ''
  private currentWord = ''
  private floatingLetters: FloatingLetter[] = []
  private particles: any[] = []
  private correctFlash = 0; private transition = 0
  private winner = false
  private flameIntensity = 5

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.nextBuilding()
  }

  private nextBuilding(): void {
    if (this.buildingIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.buildingIndex]
    this.wordIndex = 0; this.correctFlash = 0; this.flameIntensity = 5
    this.nextWord()
  }

  private nextWord(): void {
    const words = BUILDING_WORDS[this.currentLetter]
    if (!words || this.wordIndex >= words.length) {
      this.buildingIndex++; this.transition = 1; return
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
      this.flameIntensity = Math.max(1, this.flameIntensity - 1)
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.3, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#5dade2', life: 0, maxLife: 20 })
      }
      this.onStateChange?.({ score: this.score, building: this.buildingIndex + 1, total: 26 })
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++
    if (this.transition > 0) {
      this.transition++
      if (this.transition > 30) { this.transition = 0; this.nextBuilding() }
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
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a1a2a'); grad.addColorStop(1, '#2a1a1a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    const bx = this.canvasW / 2 - 60; const by = this.canvasH * 0.15
    ctx.fillStyle = '#4a4a5a'; ctx.fillRect(bx, by, 120, 120)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.fillStyle = '#6a6a8a'; ctx.fillRect(bx + 15 + j * 50, by + 15 + i * 35, 15, 20)
      }
    }

    const roof = new Path2D()
    roof.moveTo(bx - 20, by); roof.lineTo(bx + 60, by - 30); roof.lineTo(bx + 140, by); roof.closePath()
    ctx.fillStyle = '#5a3a3a'; ctx.fill(roof)

    if (this.flameIntensity > 0) {
      for (let f = 0; f < this.flameIntensity * 3; f++) {
        const fx = bx + 15 + Math.random() * 90
        const fy = by - 5 - Math.random() * 20 * (this.flameIntensity / 5)
        const fs = 4 + Math.random() * 8
        ctx.fillStyle = ['#e74c5c', '#f5b041', '#e67e22'][f % 3]
        ctx.globalAlpha = 0.6 + Math.random() * 0.4
        ctx.beginPath(); ctx.arc(fx, fy, fs, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#e74c5c'
    ctx.fillText(`🔥 Fire ${this.buildingIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#5dade2'
    ctx.fillText(`🔥🔥🔥🔥🔥`.slice(0, this.flameIntensity * 2) + `  Score: ${this.score}`, this.canvasW - 12, 16)

    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 26px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Spray water: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.65)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Pop water droplet: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.7)
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
      ctx.fillText('💧 Fire extinguished! Next emergency!', this.canvasW / 2, this.canvasH / 2)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#5dade2'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🚒 Heroes! All 26 buildings saved!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  restart(): void {
    this.buildingIndex = 0; this.wordIndex = 0; this.score = 0
    this.floatingLetters = []; this.particles = []
    this.correctFlash = 0; this.transition = 0; this.winner = false; this.frame = 0; this.flameIntensity = 5
    this.nextBuilding()
  }
}
