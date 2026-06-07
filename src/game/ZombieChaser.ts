import { FloatingLetter } from './FloatingLetter'
import { Renderer } from '../renderer/Renderer'


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

  draw(renderer: Renderer): void {
    if (!this.alive) return
    const design = ZOMBIES[this.designIndex]
    renderer.drawZombieChaser(
      this.x,
      this.y,
      this.alive,
      design,
      this.runFrame,
      this.caughtLetter !== null,
      this.catchTimer
    )
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
