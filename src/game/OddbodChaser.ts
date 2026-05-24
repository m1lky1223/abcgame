import { FloatingLetter } from './FloatingLetter'

interface OddbodDesign {
  name: string
  bodyColor: string
  outlineColor: string
}

const ODDBODS: OddbodDesign[] = [
  { name: 'bear', bodyColor: '#FF66BB', outlineColor: '#CC3388' },
  { name: 'unicorn', bodyColor: '#4488FF', outlineColor: '#2266CC' },
  { name: 'bubble', bodyColor: '#44CC44', outlineColor: '#228822' },
  { name: 'ram', bodyColor: '#FF4444', outlineColor: '#CC2222' },
  { name: 'bow', bodyColor: '#FFDD00', outlineColor: '#CCAA00' },
  { name: 'hook', bodyColor: '#9933FF', outlineColor: '#6611CC' },
  { name: 'pattern', bodyColor: '#FF8800', outlineColor: '#CC6600' },
]

export class OddbodChaser {
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
    this.designIndex = Math.floor(Math.random() * ODDBODS.length)
    this.speed = (1 + Math.random() * 0.8) * speedMultiplier

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
    const design = ODDBODS[this.designIndex]
    const r = 20
    const cx = this.x + r
    const cy = this.y + r

    const bounce = Math.sin(this.runFrame * 0.15) * 1.5
    const tilt = Math.sin(this.runFrame * 0.12) * 0.06

    ctx.save()
    ctx.translate(cx, cy + bounce)
    ctx.rotate(tilt)

    drawFeature(ctx, design.name, r, design)

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

    const isRam = design.name === 'ram'
    const eyeR = r * 0.16
    const pupilR = r * 0.08
    const eyeY = isRam ? -r * 0.1 : -r * 0.15
    const spacing = r * 0.14

    if (design.name === 'unicorn') {
      ctx.fillStyle = '#222'
      ctx.fillRect(-r * 0.35, eyeY - r * 0.22, r * 0.15, 2.5)
      ctx.fillRect(r * 0.2, eyeY - r * 0.22, r * 0.15, 2.5)
    }

    for (const side of [-1, 1]) {
      const ex = side * spacing
      ctx.beginPath()
      ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()

      if (design.name === 'bear') {
        ctx.beginPath()
        ctx.arc(ex, eyeY, 2, 0, Math.PI * 2)
        ctx.fillStyle = '#222'
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.arc(ex, eyeY, pupilR, 0, Math.PI * 2)
        ctx.fillStyle = '#222'
        ctx.fill()
      }
    }

    if (design.name === 'bubble') {
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(-spacing, eyeY, eyeR + 1, Math.PI * 1.15, Math.PI * 1.85)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(spacing, eyeY, eyeR + 1, Math.PI * 1.15, Math.PI * 1.85)
      ctx.stroke()
    }

    if (design.name === 'ram') {
      ctx.fillStyle = '#222'
      ctx.beginPath()
      ctx.arc(-spacing - 2, eyeY - r * 0.1, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(spacing + 2, eyeY - r * 0.1, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    const smY = isRam ? r * 0.28 : r * 0.18
    const smW = r * 0.12
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1.2
    ctx.lineCap = 'round'

    if (design.name === 'unicorn') {
      ctx.beginPath()
      ctx.arc(0, smY, smW, 0, Math.PI)
      ctx.stroke()
      ctx.fillStyle = '#fff'
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath()
        ctx.rect(i * 2.5 - 1, smY - 1, 2, 2.5)
        ctx.fill()
      }
    } else if (design.name === 'ram') {
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(0, smY, smW, 0.1, Math.PI - 0.1)
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.rect(-1.5, smY - 1.5, 3, 3)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.arc(0, smY, smW, 0.15, Math.PI - 0.15)
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.rect(-1, smY - 2, 2, 3)
      ctx.fill()
    }

    if (this.caughtLetter) {
      const alpha = Math.max(0, 1 - this.catchTimer / 20)
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.3})`
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

function drawFeature(
  ctx: CanvasRenderingContext2D,
  name: string,
  r: number,
  design: OddbodDesign,
): void {
  switch (name) {
    case 'bear': {
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 1.5
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(side * r * 0.65, -r * 0.75, r * 0.25, 0, Math.PI * 2)
        ctx.fillStyle = design.bodyColor
        ctx.fill()
        ctx.stroke()
      }
      ctx.fillStyle = '#FF88CC'
      const fx = -r * 0.65
      const fy = -r * 0.75
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(fx + Math.cos(a) * 3, fy + Math.sin(a) * 3, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = '#FF88CC'
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(fx, fy, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = '#FFDD00'
      ctx.fill()
      break
    }

    case 'unicorn': {
      ctx.beginPath()
      ctx.moveTo(0, -r)
      ctx.lineTo(-3, -r * 1.6)
      ctx.lineTo(3, -r * 1.6)
      ctx.closePath()
      ctx.fillStyle = '#FFDD00'
      ctx.fill()
      ctx.strokeStyle = '#CCAA00'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(-1, -r * 1.1)
      ctx.lineTo(-1, -r * 1.5)
      ctx.moveTo(1, -r * 1.1)
      ctx.lineTo(1, -r * 1.5)
      ctx.stroke()
      break
    }

    case 'bubble': {
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(side * r * 0.25, -r * 0.8)
        ctx.lineTo(side * r * 0.3, -r * 1.2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(side * r * 0.3, -r * 1.2, r * 0.12, 0, Math.PI * 2)
        ctx.strokeStyle = '#222'
        ctx.lineWidth = 1.2
        ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.fill()
      }
      break
    }

    case 'ram': {
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(side * r * 0.5, -r * 0.4, r * 0.45, -Math.PI * 0.6, Math.PI * 0.6)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(side * r * 0.55, -r * 0.4, r * 0.35, -Math.PI * 0.6, Math.PI * 0.7)
        ctx.stroke()
      }
      break
    }

    case 'bow': {
      ctx.fillStyle = '#FF6666'
      ctx.strokeStyle = '#CC3333'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(0, -r * 1.0, r * 0.15, r * 0.1, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.ellipse(side * r * 0.35, -r * 0.95, r * 0.2, r * 0.1, side * 0.4, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.ellipse(side * r * 0.15, -r * 0.85, r * 0.12, r * 0.06, side * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = '#FF6666'
        ctx.fill()
        ctx.strokeStyle = '#CC3333'
        ctx.stroke()
      }
      ctx.fillStyle = '#FF4444'
      ctx.beginPath()
      ctx.arc(0, -r * 1.0, r * 0.06, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#CC3333'
      ctx.lineWidth = 0.8
      ctx.stroke()
      break
    }

    case 'hook': {
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.75)
      ctx.lineTo(0, -r * 1.15)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(3, -r * 1.15, 3, Math.PI, Math.PI * 1.8)
      ctx.stroke()
      break
    }

    case 'pattern': {
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 1.5
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(side * r * 0.7, -r * 0.55, r * 0.22, 0, Math.PI * 2)
        ctx.fillStyle = design.bodyColor
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#FFCC00'
        const cx = side * r * 0.7
        const cy2 = -r * 0.55
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2
          ctx.beginPath()
          ctx.arc(cx + Math.cos(a) * 3, cy2 + Math.sin(a) * 3, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = '#FFAA00'
        ctx.beginPath()
        ctx.arc(cx, cy2, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
  }
}
