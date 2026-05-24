import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

const PLANTS: Record<string, string> = {
  'A': 'Apple Tree', 'B': 'Blueberry Bush', 'C': 'Carrot', 'D': 'Daisy',
  'E': 'Elderflower', 'F': 'Fern', 'G': 'Grapevine', 'H': 'Hibiscus',
  'I': 'Ivy', 'J': 'Jasmine', 'K': 'Kale', 'L': 'Lavender',
  'M': 'Marigold', 'N': 'Nasturtium', 'O': 'Orchid', 'P': 'Pumpkin',
  'Q': "Queen's Rose", 'R': 'Raspberry', 'S': 'Sunflower', 'T': 'Tulip',
  'U': 'Umbrella Plant', 'V': 'Violet', 'W': 'Watermelon', 'X': 'Xanthium',
  'Y': 'Yarrow', 'Z': 'Zucchini',
}

export class GardenMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private plantIndex = 0
  private stage = 0
  private score = 0
  private currentLetter = ''
  private floatingLetters: FloatingLetter[] = []
  private particles: any[] = []
  private correctFlash = 0; private transition = 0
  private winner = false
  private growth = 0

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.nextPlant()
  }

  private nextPlant(): void {
    if (this.plantIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.plantIndex]
    this.stage = 0; this.correctFlash = 0; this.growth = 0
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
      this.score += 10; this.stage++; this.correctFlash = 1
      this.growth = this.stage
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.35, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#58d68d', life: 0, maxLife: 20 })
      }
      this.onStateChange?.({ score: this.score, plant: this.plantIndex + 1, total: 26 })
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++
    if (this.transition > 0) {
      this.transition++
      if (this.transition > 30) { this.transition = 0; this.nextPlant() }
      return
    }
    if (this.correctFlash > 0) {
      this.correctFlash++
      for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
      this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
      if (this.correctFlash > 30) {
        this.correctFlash = 0
        if (this.stage >= 3) { this.plantIndex++; this.transition = 1 }
        else this.spawnLetters()
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
    grad.addColorStop(0, '#4a8a5a'); grad.addColorStop(1, '#8a6a3a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#6a5a3a'; ctx.fillRect(0, this.canvasH * 0.7, this.canvasW, this.canvasH * 0.3)

    const potX = this.canvasW / 2 - 25; const potY = this.canvasH * 0.55
    ctx.fillStyle = '#a05030'; ctx.fillRect(potX, potY, 50, 40)
    ctx.fillStyle = '#b06040'; ctx.fillRect(potX - 5, potY + 30, 60, 10)
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1
    ctx.strokeRect(potX, potY, 50, 40)

    ctx.fillStyle = '#5a3a1a'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'
    ctx.fillText(this.currentLetter, this.canvasW / 2, potY + 24)

    const plantCX = this.canvasW / 2; const plantBY = potY
    if (this.growth >= 1) {
      ctx.fillStyle = '#58d68d'; ctx.fillRect(plantCX - 3, plantBY - 20, 6, 20)
      ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.ellipse(plantCX, plantBY - 25, 15, 8, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.font = '10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(this.currentLetter, plantCX, plantBY - 25)
    }
    if (this.growth >= 2) {
      ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.ellipse(plantCX - 12, plantBY - 20, 10, 6, -0.3, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(plantCX + 12, plantBY - 20, 10, 6, 0.3, 0, Math.PI * 2); ctx.fill()
    }
    if (this.growth >= 3) {
      for (let i = 0; i < 3; i++) {
        const fx = plantCX + (i - 1) * 18; const fy = plantBY - 35 - Math.abs(i - 1) * 8
        ctx.fillStyle = ['#e74c5c', '#f5b041', '#9b59b6'][i]
        ctx.beginPath(); ctx.arc(fx, fy, 6, 0, Math.PI * 2); ctx.fill()
      }
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#58d68d'
    ctx.fillText(`🌱 Plant ${this.plantIndex + 1}/26: ${PLANTS[this.currentLetter] || this.currentLetter}`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Stage: ${'🌱'.repeat(Math.max(1, this.growth))}${'🌿'.repeat(Math.max(0, this.growth - 1))}  Score: ${this.score}`, this.canvasW - 12, 16)

    if (!this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Water the ${PLANTS[this.currentLetter] || 'plant'} — pop ${this.currentLetter}!`, this.canvasW / 2, 130)
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

    if (this.transition > 0) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.3, this.transition / 15)})`; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#58d68d'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`🌻 ${PLANTS[this.currentLetter] || 'Plant'} fully grown!`, this.canvasW / 2, this.canvasH / 2)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#58d68d'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🌸 Alphabet Garden Complete! All 26 blooming!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  restart(): void {
    this.plantIndex = 0; this.stage = 0; this.score = 0
    this.floatingLetters = []; this.particles = []
    this.correctFlash = 0; this.transition = 0; this.winner = false; this.frame = 0; this.growth = 0
    this.nextPlant()
  }
}
