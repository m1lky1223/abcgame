import { Renderer } from '../renderer/Renderer'
interface AngryLetter {
  letter: string
  x: number
  y: number
  w: number
  h: number
  alive: boolean
  falling: boolean
  vy: number
  rotation: number
  hp: number
  maxHp: number
}

interface Projectile {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  accentColor: string
  alive: boolean
  stopped: boolean
}

interface AngryState {
  lettersDestroyed: number
  totalLetters: number
  ammoLeft: number
  currentLevel: number
  totalLevels: number
  winner: 'human' | 'oddbods' | null
}

const ODD_COLORS = [
  { body: '#FF66BB', accent: '#CC3388' },
  { body: '#4488FF', accent: '#2266CC' },
  { body: '#44CC44', accent: '#228822' },
  { body: '#FF4444', accent: '#CC2222' },
  { body: '#FFDD00', accent: '#CCAA00' },
  { body: '#9933FF', accent: '#6611CC' },
  { body: '#FF8800', accent: '#CC6600' },
]

const ZOMBIE_COLORS = [
  { body: '#5B8C5A', accent: '#3D6B3C' },
  { body: '#7A8A6E', accent: '#5A6A4E' },
  { body: '#4F8A5E', accent: '#2F6A3E' },
  { body: '#8A7A6E', accent: '#6A5A4E' },
  { body: '#6A7A5E', accent: '#4A5A3E' },
  { body: '#5A7A6E', accent: '#3A5A4E' },
  { body: '#7A6A5E', accent: '#5A4A3E' },
]

const HP_COLORS: Record<number, [string, string, string]> = {
  1: ['#e8d5b7', '#d4b896', '#c4a67e'],
  2: ['#b0b8c0', '#9aa2aa', '#889098'],
  3: ['#8899bb', '#6a7a9a', '#556688'],
}

interface BlockCell {
  col: number
  row: number
  hp?: number
}

interface LevelDef {
  cells: BlockCell[]
  ammo: number
  cols: number
  rows: number
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const LEVELS: LevelDef[] = [
  {
    // Level 1 — Wall: solid 5×2 rectangle
    cols: 5, rows: 2, ammo: 14,
    cells: [
      { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 4, row: 0 },
      { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 4, row: 1 },
    ],
  },
  {
    // Level 2 — Towers: two 2-wide, 3-high towers with a gap
    cols: 6, rows: 3, ammo: 18,
    cells: [
      { col: 0, row: 0 }, { col: 1, row: 0 },
      { col: 0, row: 1 }, { col: 1, row: 1 },
      { col: 0, row: 2 }, { col: 1, row: 2 },
      { col: 4, row: 0 }, { col: 5, row: 0, hp: 2 },
      { col: 4, row: 1 }, { col: 5, row: 1 },
      { col: 4, row: 2 }, { col: 5, row: 2, hp: 2 },
    ],
  },
  {
    // Level 3 — Zigzag: diagonal snake
    cols: 6, rows: 4, ammo: 14,
    cells: [
      { col: 0, row: 0 },
      { col: 1, row: 1 },
      { col: 2, row: 0 },
      { col: 3, row: 1 },
      { col: 4, row: 0 },
      { col: 5, row: 1 },
      { col: 1, row: 2 },
      { col: 2, row: 3 },
      { col: 3, row: 2 },
      { col: 4, row: 3 },
    ],
  },
  {
    // Level 4 — Diamond
    cols: 5, rows: 5, ammo: 20,
    cells: [
      { col: 2, row: 0, hp: 2 },
      { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 },
      { col: 0, row: 2 }, { col: 1, row: 2, hp: 2 }, { col: 2, row: 2 }, { col: 3, row: 2, hp: 2 }, { col: 4, row: 2 },
      { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 },
      { col: 2, row: 4, hp: 2 },
    ],
  },
  {
    // Level 5 — Fortress: wide base, towers, battlements
    cols: 8, rows: 4, ammo: 28,
    cells: [
      { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3, hp: 2 }, { col: 3, row: 3 },
      { col: 4, row: 3, hp: 2 }, { col: 5, row: 3 }, { col: 6, row: 3 }, { col: 7, row: 3 },
      { col: 0, row: 2, hp: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 },
      { col: 4, row: 2 }, { col: 5, row: 2 }, { col: 6, row: 2 }, { col: 7, row: 2, hp: 2 },
      { col: 1, row: 1 }, { col: 2, row: 1, hp: 3 }, { col: 5, row: 1, hp: 3 }, { col: 6, row: 1 },
      { col: 3, row: 0 }, { col: 4, row: 0 },
    ],
  },
  {
    // Level 6 — Gauntlet: all 26 letters in a chaotic battlefield spread
    cols: 9, rows: 5, ammo: 30,
    cells: [
      { col: 0, row: 4 }, { col: 1, row: 4 }, { col: 2, row: 4 }, { col: 3, row: 4, hp: 2 },
      { col: 5, row: 4, hp: 2 }, { col: 6, row: 4 }, { col: 7, row: 4 }, { col: 8, row: 4 },
      { col: 0, row: 3 }, { col: 1, row: 3, hp: 2 }, { col: 2, row: 3 }, { col: 3, row: 3 },
      { col: 4, row: 3, hp: 3 }, { col: 5, row: 3 }, { col: 6, row: 3, hp: 2 }, { col: 7, row: 3 },
      { col: 1, row: 2 }, { col: 2, row: 2, hp: 2 }, { col: 3, row: 2 }, { col: 4, row: 2, hp: 2 },
      { col: 5, row: 2, hp: 3 }, { col: 6, row: 2 },
      { col: 2, row: 1 }, { col: 3, row: 1, hp: 2 }, { col: 4, row: 1 }, { col: 5, row: 1, hp: 2 },
    ],
  },
]

export class AngryMode {
  private letters: AngryLetter[] = []
  private projectile: Projectile | null = null
  private canvasW: number
  private canvasH: number
  private state: AngryState
  private slingshotX = 0
  private slingshotY = 0
  private isAiming = false
  private launchPower = 0
  private launchAngle = 0
  private waitingForNext = false
  private waitTimer = 0
  private aimEndX = 0
  private aimEndY = 0
  private showTrajectory = false
  private particles: { x: number; y: number; vx: number; vy: number; color: string; life: number }[] = []
  private levelTransition = 0
  private currentLevel = 1

  onStateChange?: (state: AngryState) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.state = { lettersDestroyed: 0, totalLetters: 0, ammoLeft: 0, currentLevel: 1, totalLevels: LEVELS.length, winner: null }
    this.slingshotX = canvasW * 0.1
    this.slingshotY = canvasH * 0.72
    this.startLevel(1)
  }

  resize(w: number, h: number): void {
    this.canvasW = w
    this.canvasH = h
    this.slingshotX = w * 0.1
    this.slingshotY = h * 0.72
    this.startLevel(this.currentLevel)
  }

  private startLevel(level: number): void {
    this.currentLevel = level
    this.projectile = null
    this.particles = []
    this.isAiming = false
    this.waitingForNext = false
    this.waitTimer = 0
    this.levelTransition = 0

    const def = LEVELS[level - 1]
    const w = this.canvasW
    const h = this.canvasH

    const gridW = w * 0.62
    const gridH = h * 0.38
    const gridX = w * 0.22
    const gridY = h * 0.32

    const bSize = Math.min(26, gridW / (def.cols + 1) - 3, gridH / (def.rows + 1) - 3)
    const cellW = (gridW - bSize) / Math.max(def.cols - 1, 1)
    const cellH = (gridH - bSize) / Math.max(def.rows - 1, 1)

    this.letters = []
    let li = 0
    for (const cell of def.cells) {
      if (li >= LETTERS.length) break
      const blockHp = cell.hp || 1
      this.letters.push({
        letter: LETTERS[li],
        x: gridX + cell.col * cellW,
        y: gridY + cell.row * cellH,
        w: bSize,
        h: bSize,
        alive: true,
        falling: false,
        vy: 0,
        rotation: 0,
        hp: blockHp,
        maxHp: blockHp,
      })
      li++
    }

    this.state = {
      lettersDestroyed: 0,
      totalLetters: this.letters.length,
      ammoLeft: def.ammo,
      currentLevel: level,
      totalLevels: LEVELS.length,
      winner: null,
    }
    this.onStateChange?.(this.state)
  }

  private getAmmoColor(): { body: string; accent: string } {
    const pool = Math.random() < 0.5 ? ODD_COLORS : ZOMBIE_COLORS
    return pool[Math.floor(Math.random() * pool.length)]
  }

  private launchProjectile(): void {
    if (this.state.ammoLeft <= 0 || this.projectile) return
    const colors = this.getAmmoColor()
    this.projectile = {
      x: this.slingshotX,
      y: this.slingshotY,
      vx: Math.cos(this.launchAngle) * this.launchPower,
      vy: Math.sin(this.launchAngle) * this.launchPower,
      color: colors.body,
      accentColor: colors.accent,
      alive: true,
      stopped: false,
    }
    this.state.ammoLeft--
    this.onStateChange?.(this.state)
  }

  handleAimStart(cx: number, cy: number): void {
    if (this.projectile || this.waitingForNext || this.state.winner) return
    const dx = cx - this.slingshotX
    const dy = cy - this.slingshotY
    if (Math.sqrt(dx * dx + dy * dy) < 150) {
      this.isAiming = true
      this.showTrajectory = true
      this.aimEndX = cx
      this.aimEndY = cy
      const ddx = this.slingshotX - cx
      const ddy = this.slingshotY - cy
      this.launchPower = Math.min(Math.sqrt(ddx * ddx + ddy * ddy) / 3.5, 18)
      this.launchAngle = Math.atan2(ddy, ddx)
    }
  }

  handleAimMove(cx: number, cy: number): void {
    if (!this.isAiming) return
    const dx = this.slingshotX - cx
    const dy = this.slingshotY - cy
    this.launchPower = Math.min(Math.sqrt(dx * dx + dy * dy) / 3.5, 18)
    this.launchAngle = Math.atan2(dy, dx)
    this.aimEndX = cx
    this.aimEndY = cy
  }

  handleAimRelease(): void {
    if (!this.isAiming) return
    this.isAiming = false
    this.showTrajectory = false
    if (this.launchPower > 1) {
      this.launchProjectile()
    }
  }

  update(): void {
    if (this.state.winner) return

    if (this.levelTransition > 0) {
      this.levelTransition++
      if (this.levelTransition > 120) {
        this.levelTransition = 0
        this.startLevel(this.currentLevel + 1)
      }
      return
    }

    if (this.waitingForNext) {
      this.waitTimer++
      if (this.waitTimer > 40) {
        this.waitingForNext = false
        this.waitTimer = 0
        this.projectile = null
      }
    }

    if (this.projectile && !this.projectile.stopped) {
      this.projectile.vy += 0.35
      this.projectile.x += this.projectile.vx
      this.projectile.y += this.projectile.vy

      if (
        this.projectile.y > this.canvasH + 60 ||
        this.projectile.x > this.canvasW + 60 ||
        this.projectile.x < -60
      ) {
        this.projectile.stopped = true
        this.waitingForNext = true
        this.waitTimer = 0
      }
      if (Math.abs(this.projectile.vx) < 0.3 && Math.abs(this.projectile.vy) < 0.3 && this.projectile.vy >= 0) {
        this.projectile.stopped = true
        this.waitingForNext = true
        this.waitTimer = 0
      }

      for (const letter of this.letters) {
        if (!letter.alive || letter.falling) continue
        if (this.circleRectCollision(
          this.projectile.x, this.projectile.y, 12,
          letter.x, letter.y, letter.w, letter.h
        )) {
          this.hitLetter(letter)
          break
        }
      }
    }

    for (const letter of this.letters) {
      if (letter.falling) {
        letter.vy = Math.min(letter.vy + 0.6, 12)
        letter.y += letter.vy
        letter.rotation += letter.vy * 0.02
        if (letter.y > this.canvasH + 60) {
          letter.alive = false
        }
      }
    }

    for (const p of this.particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.15
      p.life++
    }
    this.particles = this.particles.filter(p => p.life < 50)

    const aliveCount = this.letters.filter(l => l.alive).length
    const destroyed = this.state.totalLetters - aliveCount
    if (destroyed !== this.state.lettersDestroyed) {
      this.state.lettersDestroyed = destroyed
      this.onStateChange?.(this.state)
    }

    if (aliveCount === 0 && !this.state.winner) {
      if (this.currentLevel < LEVELS.length) {
        this.levelTransition = 1
      } else {
        this.state.winner = 'human'
        this.onStateChange?.(this.state)
      }
    }

    if (this.state.ammoLeft <= 0 && !this.projectile && !this.waitingForNext && aliveCount > 0 && !this.state.winner) {
      this.state.winner = 'oddbods'
      this.onStateChange?.(this.state)
    }
  }

  private hitLetter(letter: AngryLetter): void {
    letter.hp--
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 3
      this.particles.push({
        x: letter.x + letter.w / 2,
        y: letter.y + letter.h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color: ['#e74c5c', '#f5b041', '#58d68d', '#5dade2', '#af7ac5'][Math.floor(Math.random() * 5)],
        life: 0,
      })
    }
    if (letter.hp <= 0) {
      letter.alive = false
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 4
        this.particles.push({
          x: letter.x + letter.w / 2,
          y: letter.y + letter.h / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          color: ['#e74c5c', '#f5b041', '#58d68d', '#5dade2', '#af7ac5'][Math.floor(Math.random() * 5)],
          life: 0,
        })
      }
      const cx = letter.x + letter.w / 2
      for (const other of this.letters) {
        if (other === letter || !other.alive) continue
        const ocx = other.x + other.w / 2
        if (Math.abs(ocx - cx) < letter.w * 1.2 && other.y < letter.y + letter.h) {
          other.falling = true
        }
      }
      this.projectile!.vx *= 0.6
      this.projectile!.vy *= 0.4
    } else {
      this.projectile!.vx *= 0.75
      this.projectile!.vy *= 0.6
    }
  }

  draw(ctx: Renderer): void {
    if (!this.projectile && !this.waitingForNext && !this.state.winner && this.state.ammoLeft > 0) {
      const pulse = 0.15 + 0.1 * Math.sin(Date.now() / 300)
      ctx.beginPath()
      ctx.arc(this.slingshotX, this.slingshotY, 50, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,255,255,${pulse})`
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(this.slingshotX, this.slingshotY, 60, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,255,255,${pulse * 0.6})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    this.drawFormations(ctx)
    this.drawSlingshot(ctx)
    this.drawProjectile(ctx)
    this.drawParticles(ctx)
    this.drawAmmoHUD(ctx)
    this.drawTrajectory(ctx)

    if (this.levelTransition > 0) {
      const alpha = Math.min(1, this.levelTransition / 30)
      ctx.fillStyle = `rgba(0,0,0,${alpha * 0.5})`
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = `rgba(88, 214, 141, ${alpha})`
      ctx.font = 'bold 40px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`Level ${this.currentLevel} Complete! 🎉`, this.canvasW / 2, this.canvasH / 2 - 10)
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`
      ctx.font = '18px system-ui'
      ctx.fillText('Next level incoming...', this.canvasW / 2, this.canvasH / 2 + 36)
    }

    if (this.state.winner === 'human') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#58d68d'
      ctx.font = 'bold 40px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('All Levels Clear! 🏆', this.canvasW / 2, this.canvasH / 2 - 10)
      ctx.fillStyle = '#ccc'
      ctx.font = '18px system-ui'
      ctx.fillText(`Ammo remaining: ${this.state.ammoLeft}`, this.canvasW / 2, this.canvasH / 2 + 36)
    }
  }

  private drawTrajectory(ctx: Renderer): void {
    if (!this.showTrajectory || !this.isAiming) return
    ctx.setLineDash([4, 6])
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(this.slingshotX, this.slingshotY)
    let px = this.slingshotX
    let py = this.slingshotY
    let pvx = Math.cos(this.launchAngle) * this.launchPower
    let pvy = Math.sin(this.launchAngle) * this.launchPower
    for (let i = 0; i < 40; i++) {
      pvy += 0.35
      px += pvx
      py += pvy
      ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.arc(this.aimEndX, this.aimEndY, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawFormations(ctx: Renderer): void {
    for (const letter of this.letters) {
      if (!letter.alive) continue
      const x = letter.x
      const y = letter.y

      ctx.save()
      ctx.translate(x + letter.w / 2, y + letter.h / 2)
      ctx.rotate(letter.rotation)

      const hpColors = HP_COLORS[letter.maxHp] || HP_COLORS[1]
      const dmgRatio = letter.hp / letter.maxHp
      const grad = ctx.createLinearGradient(0, -letter.h / 2, 0, letter.h / 2)
      if (dmgRatio > 0.6) {
        grad.addColorStop(0, hpColors[0])
        grad.addColorStop(1, hpColors[1])
      } else if (dmgRatio > 0.3) {
        grad.addColorStop(0, hpColors[1])
        grad.addColorStop(1, hpColors[2])
      } else {
        grad.addColorStop(0, hpColors[2])
        grad.addColorStop(1, '#666')
      }
      ctx.fillStyle = grad

      const r = 5
      ctx.beginPath()
      ctx.moveTo(-letter.w / 2 + r, -letter.h / 2)
      ctx.lineTo(letter.w / 2 - r, -letter.h / 2)
      ctx.quadraticCurveTo(letter.w / 2, -letter.h / 2, letter.w / 2, -letter.h / 2 + r)
      ctx.lineTo(letter.w / 2, letter.h / 2 - r)
      ctx.quadraticCurveTo(letter.w / 2, letter.h / 2, letter.w / 2 - r, letter.h / 2)
      ctx.lineTo(-letter.w / 2 + r, letter.h / 2)
      ctx.quadraticCurveTo(-letter.w / 2, letter.h / 2, -letter.w / 2, letter.h / 2 - r)
      ctx.lineTo(-letter.w / 2, -letter.h / 2 + r)
      ctx.quadraticCurveTo(-letter.w / 2, -letter.h / 2, -letter.w / 2 + r, -letter.h / 2)
      ctx.closePath()
      ctx.fill()

      const strokeColor = letter.maxHp === 3 ? '#445' : letter.maxHp === 2 ? '#666' : '#8b6f47'
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 1.5
      ctx.stroke()

      if (letter.hp < letter.maxHp && letter.hp > 0) {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(-letter.w * 0.3, -letter.h * 0.2)
        ctx.lineTo(letter.w * 0.1, letter.h * 0.3)
        ctx.moveTo(-letter.w * 0.1, -letter.h * 0.35)
        ctx.lineTo(letter.w * 0.3, letter.h * 0.1)
        ctx.moveTo(-letter.w * 0.35, letter.h * 0.2)
        ctx.lineTo(letter.w * 0.25, -letter.h * 0.25)
        ctx.stroke()
      }

      const textColor = letter.maxHp === 3 ? '#dde' : letter.maxHp === 2 ? '#fff' : '#5a3a1a'
      ctx.fillStyle = textColor
      ctx.font = `bold ${Math.min(16, letter.w * 0.5)}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(letter.letter, 0, 1)

      ctx.restore()
    }
  }

  private drawSlingshot(ctx: Renderer): void {
    const sx = this.slingshotX
    const sy = this.slingshotY
    ctx.strokeStyle = '#4a2a0a'
    ctx.lineCap = 'round'
    ctx.lineWidth = 7
    ctx.beginPath()
    ctx.moveTo(sx - 22, sy - 15)
    ctx.lineTo(sx, sy + 5)
    ctx.lineTo(sx + 22, sy - 15)
    ctx.stroke()
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(sx, sy + 5)
    ctx.lineTo(sx, sy + 50)
    ctx.stroke()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#6a4a2a'
    ctx.beginPath()
    ctx.moveTo(sx - 22, sy - 15)
    ctx.lineTo(sx, sy + 5)
    ctx.lineTo(sx + 22, sy - 15)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(sx, sy + 5)
    ctx.lineTo(sx, sy + 50)
    ctx.stroke()
    const bandStretch = this.isAiming ? 0.3 : 0
    const bx = sx + (sx - this.aimEndX) * bandStretch
    const by = sy + (sy - this.aimEndY) * bandStretch
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(sx - 22, sy - 15)
    ctx.lineTo(bx, by)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(sx + 22, sy - 15)
    ctx.lineTo(bx, by)
    ctx.stroke()
  }

  private drawProjectile(ctx: Renderer): void {
    if (!this.projectile || this.projectile.stopped) {
      if (!this.projectile && !this.waitingForNext && !this.state.winner && this.state.ammoLeft > 0) {
        const colors = this.isAiming ? this.getAmmoColor() : ODD_COLORS[0]
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.arc(this.slingshotX, this.slingshotY, 14, 0, Math.PI * 2)
        ctx.fillStyle = colors.body
        ctx.fill()
        ctx.strokeStyle = colors.accent
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(this.slingshotX - 5, this.slingshotY - 3, 4, 0, Math.PI * 2)
        ctx.arc(this.slingshotX + 5, this.slingshotY - 3, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.arc(this.slingshotX - 5, this.slingshotY - 2, 2, 0, Math.PI * 2)
        ctx.arc(this.slingshotX + 5, this.slingshotY - 2, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(this.slingshotX - 9, this.slingshotY - 9)
        ctx.lineTo(this.slingshotX - 2, this.slingshotY - 6)
        ctx.moveTo(this.slingshotX + 9, this.slingshotY - 9)
        ctx.lineTo(this.slingshotX + 2, this.slingshotY - 6)
        ctx.stroke()
      }
      return
    }
    ctx.beginPath()
    ctx.arc(this.projectile.x, this.projectile.y, 14, 0, Math.PI * 2)
    ctx.fillStyle = this.projectile.color
    ctx.fill()
    ctx.strokeStyle = this.projectile.accentColor
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(this.projectile.x - 5, this.projectile.y - 3, 5, 0, Math.PI * 2)
    ctx.arc(this.projectile.x + 5, this.projectile.y - 3, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(this.projectile.x - 5, this.projectile.y - 2, 2.5, 0, Math.PI * 2)
    ctx.arc(this.projectile.x + 5, this.projectile.y - 2, 2.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(this.projectile.x - 9, this.projectile.y - 9)
    ctx.lineTo(this.projectile.x - 2, this.projectile.y - 7)
    ctx.moveTo(this.projectile.x + 9, this.projectile.y - 9)
    ctx.lineTo(this.projectile.x + 2, this.projectile.y - 7)
    ctx.stroke()
  }

  private drawParticles(ctx: Renderer): void {
    for (const p of this.particles) {
      ctx.globalAlpha = 1 - p.life / 50
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawAmmoHUD(ctx: Renderer): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px system-ui'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText(`Lv${this.currentLevel}/${this.state.totalLevels}  🎯 ${this.state.lettersDestroyed}/${this.state.totalLetters}  💣 ${this.state.ammoLeft}`, 12, 16)
    if (this.state.ammoLeft === 0 && this.state.lettersDestroyed < this.state.totalLetters && !this.state.winner) {
      ctx.fillStyle = '#e74c5c'
      ctx.textAlign = 'right'
      ctx.fillText('OUT OF AMMO!', this.canvasW - 12, 16)
    }
    const names = ['The Wall', 'Twin Towers', 'Zigzag', 'Diamond', 'Fortress', 'The Gauntlet']
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'right'
    ctx.fillText(names[this.currentLevel - 1] || '', this.canvasW - 12, 28)
  }

  private circleRectCollision(
    cx: number, cy: number, cr: number,
    rx: number, ry: number, rw: number, rh: number,
  ): boolean {
    const closestX = Math.max(rx, Math.min(cx, rx + rw))
    const closestY = Math.max(ry, Math.min(cy, ry + rh))
    const dx = cx - closestX
    const dy = cy - closestY
    return dx * dx + dy * dy < cr * cr
  }

  restart(): void {
    this.currentLevel = 1
    this.projectile = null
    this.particles = []
    this.isAiming = false
    this.waitingForNext = false
    this.waitTimer = 0
    this.levelTransition = 0
    this.startLevel(1)
  }
}
