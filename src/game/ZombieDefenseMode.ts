interface Defender {
  letter: string
  row: number
  col: number
  x: number
  y: number
  health: number
  maxHealth: number
  cooldown: number
  maxCooldown: number
}

interface ZombieUnit {
  letter: string
  row: number
  x: number
  y: number
  health: number
  maxHealth: number
  speed: number
  slowed: boolean
  slowTimer: number
}

interface Projectile {
  x: number
  y: number
  targetRow: number
  speed: number
  damage: number
  alive: boolean
}

interface InkDrop {
  x: number
  y: number
  vy: number
  collected: boolean
}

const DEFENDER_STATS: Record<string, { health: number; cooldown: number; damage: number; label: string }> = {
  'A': { health: 40, cooldown: 20, damage: 12, label: 'Shooter' },
  'B': { health: 100, cooldown: 0, damage: 0, label: 'Shield' },
  'C': { health: 30, cooldown: 35, damage: 0, label: 'Freeze' },
}

const ZOMBIE_LETTERS = ['F', 'N', 'X', 'G', 'K', 'M', 'Q', 'V', 'W', 'Z']

export class ZombieDefenseMode {
  private canvasW: number
  private canvasH: number
  private frame = 0
  private phase: 'playing' | 'gameover' = 'playing'

  private gridCols = 5
  private gridRows = 4
  private cellW = 0
  private cellH = 0
  private gridX = 0

  private defenders: Defender[] = []
  private zombies: ZombieUnit[] = []
  private projectiles: Projectile[] = []
  private inkDrops: InkDrop[] = []

  private ink = 10
  private score = 0
  private wave = 1
  private waveTimer = 0
  private selectedDefender = 'A'
  private highScore = 0

  private particles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.cellW = canvasW * 0.1
    this.cellH = canvasH / this.gridRows
    this.gridX = canvasW * 0.05
    const hs = parseInt(localStorage.getItem('hs_zombiedefense') || '0', 10)
    this.highScore = hs
  }

  handleClick(cx: number, cy: number): void {
    if (this.phase === 'gameover') {
      this.restart()
      return
    }

    for (const ink of this.inkDrops) {
      if (ink.collected) continue
      if (Math.abs(cx - ink.x) < 20 && Math.abs(cy - ink.y) < 20) {
        ink.collected = true
        this.ink += 3
        this.score += 2
        for (let i = 0; i < 6; i++) {
          const a = Math.random() * Math.PI * 2
          const s = 1 + Math.random() * 2
          this.particles.push({ x: ink.x, y: ink.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#5dade2', life: 0, maxLife: 15 })
        }
        return
      }
    }

    const col = Math.floor((cx - this.gridX) / this.cellW)
    const row = Math.floor(cy / this.cellH)
    if (col < 0 || col >= this.gridCols || row < 0 || row >= this.gridRows) return

    const existing = this.defenders.find(d => d.row === row && d.col === col)
    if (existing) {
      this.cycleDefender(existing)
      return
    }

    const cost = this.defenderCost(this.selectedDefender)
    if (this.ink < cost) return

    const stats = DEFENDER_STATS[this.selectedDefender]
    if (!stats) return

    this.ink -= cost
    this.defenders.push({
      letter: this.selectedDefender,
      row,
      col,
      x: this.gridX + col * this.cellW + this.cellW / 2,
      y: row * this.cellH + this.cellH / 2,
      health: stats.health,
      maxHealth: stats.health,
      cooldown: 0,
      maxCooldown: stats.cooldown,
    })
  }

  private cycleDefender(d: Defender): void {
    const letters = Object.keys(DEFENDER_STATS)
    const idx = letters.indexOf(d.letter)
    const next = letters[(idx + 1) % letters.length]
    const stats = DEFENDER_STATS[next]
    if (!stats) return
    d.letter = next
    d.maxHealth = stats.health
    d.health = Math.min(d.health, stats.health)
    d.maxCooldown = stats.cooldown
  }

  private defenderCost(letter: string): number {
    const costs: Record<string, number> = { 'A': 3, 'B': 5, 'C': 4 }
    return costs[letter] || 3
  }

  handleKey(key: string): void {
    if (this.phase === 'gameover') {
      if (key === ' ') this.restart()
      return
    }
    const upper = key.toUpperCase()
    if (DEFENDER_STATS[upper]) {
      this.selectedDefender = upper
    }
  }

  restart(): void {
    this.defenders = []
    this.zombies = []
    this.projectiles = []
    this.inkDrops = []
    this.particles = []
    this.ink = 10
    this.score = 0
    this.wave = 1
    this.waveTimer = 0
    this.phase = 'playing'
    this.frame = 0
  }

  update(): void {
    this.frame++
    if (this.phase !== 'playing') return

    this.waveTimer++
    const spawnInterval = Math.max(30, 120 - this.wave * 3)
    if (this.waveTimer % spawnInterval === 0) {
      const row = Math.floor(Math.random() * this.gridRows)
      const zLetter = ZOMBIE_LETTERS[Math.floor(Math.random() * ZOMBIE_LETTERS.length)]
      const speed = 0.3 + this.wave * 0.03 + Math.random() * 0.1
      this.zombies.push({
        letter: zLetter,
        row,
        x: this.canvasW + 10,
        y: row * this.cellH + this.cellH / 2,
        health: 20 + this.wave * 2,
        maxHealth: 20 + this.wave * 2,
        speed,
        slowed: false,
        slowTimer: 0,
      })
    }

    if (this.waveTimer % 300 === 0) this.wave++

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i]
      if (z.slowed) {
        z.slowTimer--
        if (z.slowTimer <= 0) z.slowed = false
      }
      z.x -= z.slowed ? z.speed * 0.3 : z.speed

      if (z.x < this.gridX + this.gridCols * this.cellW) {
        const blocker = this.defenders.find(d => d.row === z.row && Math.abs(d.x - z.x) < this.cellW * 0.6)
        if (blocker) {
          blocker.health -= 0.5
          z.health -= 0.3
          if (blocker.letter === 'C' && !z.slowed) {
            z.slowed = true
            z.slowTimer = 120
          }
        }
      }

      if (z.x < this.gridX - 30) {
        this.phase = 'gameover'
        if (this.score > this.highScore) {
          this.highScore = this.score
          localStorage.setItem('hs_zombiedefense', String(this.score))
        }
        this.onStateChange?.({ score: this.score, wave: this.wave })
        return
      }

      if (z.health <= 0) {
        this.zombies.splice(i, 1)
        this.score += 5
        continue
      }
    }

    for (const d of this.defenders) {
      if (d.health <= 0) continue
      if (d.letter === 'A' && d.cooldown <= 0) {
        const target = this.zombies.find(z => z.row === d.row)
        if (target) {
          this.projectiles.push({
            x: d.x,
            y: d.y,
            targetRow: d.row,
            speed: 4,
            damage: DEFENDER_STATS['A'].damage,
            alive: true,
          })
          d.cooldown = d.maxCooldown
        }
      }
      if (d.cooldown > 0) d.cooldown--
    }

    this.defenders = this.defenders.filter(d => d.health > 0)

    for (const p of this.projectiles) {
      if (!p.alive) continue
      p.x += p.speed
      if (p.x > this.canvasW + 10) { p.alive = false; continue }
      for (const z of this.zombies) {
        if (z.row === p.targetRow && Math.abs(z.x - p.x) < 15 && Math.abs(z.y - p.y) < 15) {
          z.health -= p.damage
          p.alive = false
          for (let i = 0; i < 4; i++) {
            const a = Math.random() * Math.PI * 2
            this.particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, color: '#e74c5c', life: 0, maxLife: 10 })
          }
          break
        }
      }
    }
    this.projectiles = this.projectiles.filter(p => p.alive)

    if (this.frame % 40 === 0) {
      this.inkDrops.push({
        x: this.gridX + this.gridCols * this.cellW + Math.random() * (this.canvasW - this.gridX - this.gridCols * this.cellW - 20),
        y: -10,
        vy: 0.5 + Math.random() * 0.5,
        collected: false,
      })
    }
    for (const ink of this.inkDrops) {
      if (ink.collected) continue
      ink.y += ink.vy
    }
    this.inkDrops = this.inkDrops.filter(i => !i.collected && i.y < this.canvasH + 20)

    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.life++
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawBackground(ctx)
    this.drawGrid(ctx)
    this.drawDefenders(ctx)
    this.drawZombies(ctx)
    this.drawProjectiles(ctx)
    this.drawInkDrops(ctx)
    this.drawParticles(ctx)
    this.drawHUD(ctx)
    this.drawSelectedInfo(ctx)

    if (this.phase === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#e74c5c'
      ctx.font = 'bold 32px system-ui'
      ctx.fillText('💀 Defenses Breached!', this.canvasW / 2, this.canvasH / 2 - 50)
      ctx.fillStyle = '#fff'
      ctx.font = '18px system-ui'
      ctx.fillText(`Wave ${this.wave}  |  Score: ${this.score}  |  Best: ${this.highScore}`, this.canvasW / 2, this.canvasH / 2)
      ctx.fillStyle = '#8899bb'
      ctx.font = '14px system-ui'
      ctx.fillText('Click or press SPACE to restart', this.canvasW / 2, this.canvasH / 2 + 40)
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a2a1a')
    grad.addColorStop(1, '#0a1a0a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    for (let row = 0; row < this.gridRows; row++) {
      ctx.fillStyle = row % 2 === 0 ? 'rgba(40,60,40,0.3)' : 'rgba(30,50,30,0.3)'
      ctx.fillRect(this.gridX, row * this.cellH, this.gridCols * this.cellW, this.cellH)
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'rgba(100,150,100,0.2)'
    ctx.lineWidth = 1
    for (let row = 0; row <= this.gridRows; row++) {
      ctx.beginPath()
      ctx.moveTo(this.gridX, row * this.cellH)
      ctx.lineTo(this.gridX + this.gridCols * this.cellW, row * this.cellH)
      ctx.stroke()
    }
    for (let col = 0; col <= this.gridCols; col++) {
      ctx.beginPath()
      ctx.moveTo(this.gridX + col * this.cellW, 0)
      ctx.lineTo(this.gridX + col * this.cellW, this.gridRows * this.cellH)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.font = '9px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    for (let row = 0; row < this.gridRows; row++) {
      ctx.fillText(`Lane ${row + 1}`, this.gridX + this.gridCols * this.cellW + 30, row * this.cellH + this.cellH / 2 + 4)
    }
  }

  private drawDefenders(ctx: CanvasRenderingContext2D): void {
    for (const d of this.defenders) {
      if (d.health <= 0) continue
      const colors: Record<string, string> = { 'A': '#e74c5c', 'B': '#5dade2', 'C': '#58d68d' }
      const color = colors[d.letter] || '#fff'
      const healthPct = d.health / d.maxHealth

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(d.x - 18, d.y - 18, 36, 36, 6)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(d.x - 18, d.y - 18, 36, 36, 6)
      ctx.stroke()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(d.letter, d.x, d.y + 1)

      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(d.x - 15, d.y + 20, 30, 4)
      ctx.fillStyle = healthPct > 0.5 ? '#58d68d' : healthPct > 0.25 ? '#f5b041' : '#e74c5c'
      ctx.fillRect(d.x - 15, d.y + 20, 30 * healthPct, 4)
    }
  }

  private drawZombies(ctx: CanvasRenderingContext2D): void {
    for (const z of this.zombies) {
      const pulse = Math.sin(this.frame * 0.08) * 2
      ctx.fillStyle = z.slowed ? '#5a8a5a' : '#4a6a4a'
      ctx.beginPath()
      ctx.arc(z.x, z.y + pulse, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = z.slowed ? '#3a6a3a' : '#2a4a2a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(z.x, z.y + pulse, 18, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#ccd'
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(z.x + side * 6, z.y + pulse - 3, 3.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(z.x + side * 6, z.y + pulse - 3, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = '#cc2222'
        ctx.fill()
      }

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(z.letter, z.x, z.y + pulse + 1)

      const hpPct = z.health / z.maxHealth
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(z.x - 14, z.y + pulse + 18, 28, 3)
      ctx.fillStyle = hpPct > 0.5 ? '#58d68d' : '#e74c5c'
      ctx.fillRect(z.x - 14, z.y + pulse + 18, 28 * hpPct, 3)
    }
  }

  private drawProjectiles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.projectiles) {
      if (!p.alive) continue
      ctx.fillStyle = '#e74c5c'
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawInkDrops(ctx: CanvasRenderingContext2D): void {
    for (const ink of this.inkDrops) {
      if (ink.collected) continue
      ctx.fillStyle = '#5dade2'
      ctx.beginPath()
      ctx.arc(ink.x, ink.y, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 8px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('💧', ink.x, ink.y + 1)
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife
      if (alpha <= 0) continue
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, 2 * alpha + 1, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawHUD(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, 0, this.canvasW, 32)

    ctx.textBaseline = 'middle'
    ctx.font = 'bold 13px system-ui'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#58d68d'
    ctx.fillText(`🧟 Wave ${this.wave}`, 10, 16)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#5dade2'
    ctx.fillText(`💧 ${this.ink}`, this.canvasW / 2 - 30, 16)
    ctx.fillStyle = '#f5b041'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2 + 30, 16)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#e74c5c'
    ctx.fillText(`Zombies: ${this.zombies.length}`, this.canvasW - 10, 16)
  }

  private drawSelectedInfo(ctx: CanvasRenderingContext2D): void {
    const stats = DEFENDER_STATS[this.selectedDefender]
    if (!stats) return
    const cost = this.defenderCost(this.selectedDefender)

    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.beginPath()
    ctx.roundRect(this.canvasW * 0.05, this.canvasH - 40, 200, 34, 6)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px system-ui'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#58d68d'
    ctx.fillText(`Place: ${this.selectedDefender}  Cost: ${cost}💧`, this.canvasW * 0.05 + 8, this.canvasH - 23)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '10px system-ui'
    ctx.fillText(`A=Shoot  B=Shield  C=Freeze  |  Click grid to place`, this.canvasW * 0.05 + 8, this.canvasH - 8)
  }
}
