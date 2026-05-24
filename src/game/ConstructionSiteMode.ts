import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

const STRUCTURES: Record<string, string> = {
  'A': 'Arch', 'B': 'Bench', 'C': 'Crawl Tunnel', 'D': 'Dome',
  'E': 'Easy Climb', 'F': 'Fire Pole', 'G': 'Garden Swing', 'H': 'Horizontal Bar',
  'I': 'Ice Cream Stand', 'J': 'Jungle Gym', 'K': 'Kickball Court', 'L': 'Lounge Bench',
  'M': 'Merry-Go-Round', 'N': 'Net Climber', 'O': 'Oval Sandbox', 'P': 'Picnic Table',
  'Q': 'Quiet Nook', 'R': 'Rock Wall', 'S': 'Slide', 'T': 'Tire Swing',
  'U': 'Umbrella Canopy', 'V': 'Volleyball Net', 'W': 'Wave Bridge', 'X': 'Xylophone Wall',
  'Y': 'Yoga Deck', 'Z': 'Zigzag Path',
}

const MATERIALS = ['🧱', '🪵', '🔩', '🪚', '⚙️', '🛠️']

export class ConstructionSiteMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private buildIndex = 0
  private score = 0
  private currentLetter = ''
  private floatingLetters: FloatingLetter[] = []
  private particles: any[] = []
  private correctFlash = 0; private transition = 0
  private winner = false
  private piecesPlaced = 0

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.nextBuild()
  }

  private nextBuild(): void {
    if (this.buildIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.buildIndex]
    this.correctFlash = 0; this.piecesPlaced = 0
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
      this.score += 10; this.piecesPlaced++; this.correctFlash = 1
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.35, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#f5b041', life: 0, maxLife: 20 })
      }
      this.onStateChange?.({ score: this.score, built: this.buildIndex + 1, total: 26 })
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++

    if (this.transition > 0) {
      this.transition++
      if (this.transition > 30) { this.transition = 0; this.nextBuild() }
      return
    }

    if (this.correctFlash > 0) {
      this.correctFlash++
      for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
      this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
      if (this.correctFlash > 30) {
        this.correctFlash = 0
        this.buildIndex++
        this.transition = 1
      }
      return
    }

    for (const l of this.floatingLetters) { l.update(0) }
    this.floatingLetters = this.floatingLetters.filter(l => { if (l.collected) return l.popTime < l.popDuration; return true })
    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
    this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#3a4a2a'); grad.addColorStop(1, '#5a3a1a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#4a3a1a'; ctx.fillRect(0, this.canvasH * 0.7, this.canvasW, this.canvasH * 0.3)
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = '#6a5a3a'; ctx.fillRect(i * (this.canvasW / 8), this.canvasH * 0.7, this.canvasW / 16, 3)
    }

    const bx = this.canvasW / 2 - 60; const by = this.canvasH * 0.25
    ctx.fillStyle = '#f5b041'
    ctx.fillRect(bx, by, 120, 80)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 48px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(this.currentLetter, this.canvasW / 2, by + 40)
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2
    ctx.strokeRect(bx, by, 120, 80)

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`🚧 Build ${this.buildIndex + 1}/26: ${STRUCTURES[this.currentLetter] || this.currentLetter}`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#58d68d'
    ctx.fillText(`🧱 ${MATERIALS[this.buildIndex % 6]}  Score: ${this.score}`, this.canvasW - 12, 16)

    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Pop ${this.currentLetter} to build the ${STRUCTURES[this.currentLetter] || this.currentLetter}`, this.canvasW / 2, 130)
    }

    for (const l of this.floatingLetters) {
      if (!l.collected) l.draw(ctx, this.frame)
      else if (l.popTime < l.popDuration) l.draw(ctx, this.frame)
    }

    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife; if (a <= 0) continue
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2)
      ctx.fillStyle = p.color; ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('🔨 Pop materials to build!', this.canvasW / 2, this.canvasH - 8)

    if (this.transition > 0) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.3, this.transition / 15)})`; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#f5b041'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`CLANK! ${STRUCTURES[this.currentLetter] || this.currentLetter} built! 🚧`, this.canvasW / 2, this.canvasH / 2)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#f5b041'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🏗️ Playground Grand Opening! All 26 built!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#58d68d'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  private currentWord = ''

  restart(): void {
    this.buildIndex = 0; this.score = 0
    this.floatingLetters = []; this.particles = []
    this.correctFlash = 0; this.transition = 0; this.winner = false; this.frame = 0; this.piecesPlaced = 0
    this.nextBuild()
  }
}
