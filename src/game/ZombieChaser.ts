import { FloatingLetter } from './FloatingLetter'

interface ZombieDesign {
  name: string
  bodyColor: string
  outlineColor: string
}

const ZOMBIES: ZombieDesign[] = [
  { name: 'classic', bodyColor: '#5B8C5A', outlineColor: '#3D6B3C' },
  { name: 'decayed', bodyColor: '#7A8A6E', outlineColor: '#5A6A4E' },
  { name: 'toxic', bodyColor: '#4F8A5E', outlineColor: '#2F6A3E' },
  { name: 'undead', bodyColor: '#8A7A6E', outlineColor: '#6A5A4E' },
  { name: 'rotten', bodyColor: '#6A7A5E', outlineColor: '#4A5A3E' },
  { name: 'ghoul', bodyColor: '#5A7A6E', outlineColor: '#3A5A4E' },
  { name: 'mutant', bodyColor: '#7A6A5E', outlineColor: '#5A4A3E' },
]

export class ZombieChaser {
  x: number
  y: number
  vx: number
  vy: number
  speed: number
  designIndex: number
  caughtLetter: FloatingLetter | null = null
  alive = true
  catchTimer = 0
  private runFrame = 0

  constructor(canvasW: number, canvasH: number, speedMultiplier = 1) {
    this.designIndex = Math.floor(Math.random() * ZOMBIES.length)
    this.speed = (1 + Math.random() * 0.6) * speedMultiplier

    const edge = Math.floor(Math.random() * 4)
    const margin = 40
    switch (edge) {
      case 0:
        this.x = -margin
        this.y = margin + Math.random() * (canvasH - margin * 2)
        break
      case 1:
        this.x = canvasW + margin
        this.y = margin + Math.random() * (canvasH - margin * 2)
        break
      case 2:
        this.x = margin + Math.random() * (canvasW - margin * 2)
        this.y = -margin
        break
      default:
        this.x = margin + Math.random() * (canvasW - margin * 2)
        this.y = canvasH + margin
    }
    this.vx = 0
    this.vy = 0
  }

  update(letters: FloatingLetter[]): string | null {
    if (!this.alive) return null
    this.runFrame++

    if (this.caughtLetter) {
      this.catchTimer++
      if (this.catchTimer > 20) this.alive = false
      return null
    }

    const alive = letters.filter(l => !l.collected)
    if (alive.length === 0) {
      this.vx *= 0.95
      this.vy *= 0.95
      this.x += this.vx
      this.y += this.vy
      return null
    }

    let closest: FloatingLetter | null = null
    let closestDist = Infinity
    for (const l of alive) {
      const lx = l.x + 24 * l.scale
      const ly = l.y + 28 * l.scale
      const dx = lx - this.x
      const dy = ly - this.y
      const dist = dx * dx + dy * dy
      if (dist < closestDist) {
        closestDist = dist
        closest = l
      }
    }

    if (!closest) return null

    const tx = closest.x + 24 * closest.scale
    const ty = closest.y + 28 * closest.scale
    const dx = tx - this.x
    const dy = ty - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 1) return null

    this.vx += (dx / dist) * 0.15
    this.vy += (dy / dist) * 0.15

    const maxV = this.speed
    const v = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    if (v > maxV) {
      this.vx = (this.vx / v) * maxV
      this.vy = (this.vy / v) * maxV
    }

    this.x += this.vx
    this.y += this.vy

    if (closest && dist < 30 * closest.scale) {
      this.caughtLetter = closest
      this.catchTimer = 0
      const caught = closest.letter
      closest.pop()
      return caught
    }
    return null
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return
    const design = ZOMBIES[this.designIndex]
    const r = 20
    const cx = this.x + r
    const cy = this.y + r

    const wobble = Math.sin(this.runFrame * 0.2) * 2
    const tilt = Math.sin(this.runFrame * 0.08) * 0.03

    ctx.save()
    ctx.translate(cx + wobble, cy + Math.sin(this.runFrame * 0.15) * 1)
    ctx.rotate(tilt)

    ctx.shadowColor = design.outlineColor
    ctx.shadowBlur = r * 0.15
    ctx.fillStyle = design.bodyColor
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.strokeStyle = design.outlineColor
    ctx.lineWidth = Math.max(2, r * 0.08)
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = design.bodyColor
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    drawZombieFeature(ctx, design.name, r)

    const eyeR = r * 0.16
    const eyeY = -r * 0.1
    const spacing = r * 0.14

    for (const side of [-1, 1]) {
      const ex = side * spacing
      ctx.beginPath()
      ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2)
      ctx.fillStyle = '#ccd'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(ex, eyeY, r * 0.08, 0, Math.PI * 2)
      ctx.fillStyle = '#cc2222'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(ex + side * 1, eyeY - 1, 1, 0, Math.PI * 2)
      ctx.fillStyle = '#222'
      ctx.fill()
    }

    const smY = r * 0.22
    const smW = r * 0.1
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1.2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(0, smY, smW, 0.4, Math.PI - 0.4)
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.rect(-1, smY - 1, 2, 2.5)
    ctx.fill()

    if (this.caughtLetter) {
      const alpha = Math.max(0, 1 - this.catchTimer / 20)
      ctx.fillStyle = `rgba(0,0,0,${alpha * 0.3})`
      ctx.beginPath()
      ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  containsPoint(mx: number, my: number): boolean {
    const cx = this.x + 20
    const cy = this.y + 20
    const dx = mx - cx
    const dy = my - cy
    return dx * dx + dy * dy <= 20 * 20
  }

  get isDone(): boolean {
    return !this.alive
  }
}

function drawZombieFeature(
  ctx: CanvasRenderingContext2D,
  name: string,
  r: number,
): void {
  ctx.strokeStyle = '#222'
  ctx.lineWidth = 1
  ctx.lineCap = 'round'

  switch (name) {
    case 'classic':
      ctx.beginPath()
      ctx.moveTo(-r * 0.15, -r * 0.9)
      ctx.lineTo(r * 0.15, -r * 0.7)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-r * 0.1, -r * 0.75)
      ctx.lineTo(r * 0.1, -r * 0.55)
      ctx.stroke()
      break

    case 'decayed':
      ctx.beginPath()
      ctx.arc(-r * 0.4, -r * 0.4, r * 0.08, 0, Math.PI * 2)
      ctx.fillStyle = '#222'
      ctx.fill()
      break

    case 'toxic':
      ctx.fillStyle = '#88FF88'
      ctx.beginPath()
      ctx.arc(0, -r * 0.9, r * 0.06, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#44FF44'
      ctx.beginPath()
      ctx.arc(0, -r * 0.9, r * 0.03, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'undead':
      ctx.fillStyle = '#ccc'
      ctx.globalAlpha = 0.5
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.arc(i * r * 0.2, -r * 0.6, r * 0.08, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      break

    case 'rotten':
      ctx.beginPath()
      ctx.arc(r * 0.35, -r * 0.35, r * 0.06, 0, Math.PI * 2)
      ctx.fillStyle = '#444'
      ctx.fill()
      break

    case 'ghoul':
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(-r * 0.2, -r * 0.85)
      ctx.lineTo(0, -r * 1.0)
      ctx.lineTo(r * 0.2, -r * 0.85)
      ctx.stroke()
      break

    case 'mutant':
      ctx.beginPath()
      ctx.arc(r * 0.1, -r * 0.3, r * 0.06, 0, Math.PI * 2)
      ctx.fillStyle = '#ccd'
      ctx.fill()
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 0.8
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(r * 0.1, -r * 0.3, r * 0.03, 0, Math.PI * 2)
      ctx.fillStyle = '#cc2222'
      ctx.fill()
      break
  }
}
