import { CHARACTERS } from '../characters/data'
import { drawCharacter } from '../characters/draw'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export class FloatingLetter {
  x: number
  y: number
  letter: string
  collected = false
  scale: number
  bobPhase: number
  drift: number
  correctPulse = 0

  particles: Particle[] = []
  popTime = 0
  popDuration = 30
  private initialX: number
  private initialY: number

  constructor(canvasW: number, canvasH: number, letter?: string, minY?: number) {
    this.letter = letter ?? (() => {
      const letters = Object.keys(CHARACTERS)
      return letters[Math.floor(Math.random() * letters.length)]
    })()
    this.scale = 0.9 + Math.random() * 0.5
    this.initialX = 50 + Math.random() * (canvasW - 100)
    const yStart = minY ?? 60
    this.initialY = yStart + Math.random() * (canvasH - yStart - 70)
    this.x = this.initialX
    this.y = this.initialY
    this.bobPhase = Math.random() * Math.PI * 2
    this.drift = 0.2 + Math.random() * 0.3
    if (Math.random() > 0.5) this.drift *= -1
  }

  containsCanvas(cx: number, cy: number): boolean {
    const centerX = this.x + 24 * this.scale
    const centerY = this.y + 28 * this.scale
    const half = 26 * this.scale
    return Math.abs(cx - centerX) < half && Math.abs(cy - centerY) < half
  }

  pop(): void {
    this.collected = true
    this.popTime = 0
    const def = CHARACTERS[this.letter]
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16
      const speed = 2 + Math.random() * 3
      this.particles.push({
        x: this.x + 24 * this.scale,
        y: this.y + 28 * this.scale,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 25 + Math.random() * 20,
        color: def?.bodyColor || '#fff',
        size: 3 + Math.random() * 5,
      })
    }
  }

  update(frame: number): boolean {
    this.y += Math.sin((frame + this.bobPhase) * 0.02) * 0.3
    this.x += Math.sin((frame + this.bobPhase) * 0.01) * this.drift

    if (this.collected) {
      this.popTime++
      for (const p of this.particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.life++
        p.vx *= 0.97
      }
      return this.popTime > this.popDuration
    }
    return false
  }

  draw(ctx: CanvasRenderingContext2D, frame: number): void {
    if (!this.collected) {
      const bob = Math.sin((frame + this.bobPhase) * 0.03) * 18
      const pulse = this.correctPulse > 0 ? 1 + Math.sin(this.correctPulse * 0.3) * 0.1 : 0
      const s = this.scale * (1 + pulse)
      const glow = this.correctPulse > 0 ? 'rgba(255,215,0,0.3)' : 'transparent'
      if (this.correctPulse > 0) {
        ctx.beginPath()
        ctx.arc(this.x + 24 * s, this.y + 28 * s + bob, 30 * s, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
      }
      drawCharacter(ctx, this.letter, this.x, this.y + bob, s, 0)
      return
    }

    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife
      if (alpha <= 0) continue
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
}
