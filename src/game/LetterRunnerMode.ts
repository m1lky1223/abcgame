import { CHARACTERS, ALL_LETTERS } from '../characters/data'

interface RunnerOddbod {
  name: string
  color: string
  accent: string
  speed: number
  ability: string
  abilityDesc: string
}

interface RunnerState {
  distance: number
  lettersCollected: string[]
  score: number
  currentChaser: number
  selectedOddbod: number
  gameOver: boolean
  won: boolean
}

interface RunnerCollectible {
  x: number; y: number; letter: string
  collected: boolean; isHigh: boolean; w: number; h: number
}

interface RunnerChaser {
  x: number; y: number; type: number
  speed: number; alive: boolean
}

interface RunnerObstacle {
  x: number; y: number; w: number; h: number
  type: 'puddle' | 'box' | 'gate'
  gateLetter?: string
  passed: boolean
}

const ODDBODS: RunnerOddbod[] = [
  { name: 'Bubbles', color: '#FF66BB', accent: '#CC3388', speed: 1, ability: 'magnet', abilityDesc: 'Magnet — attracts letters' },
  { name: 'Fuse', color: '#FF4444', accent: '#CC2222', speed: 1.3, ability: 'boost', abilityDesc: 'Boost — speed burst after 3 letters' },
  { name: 'Jeff', color: '#9933FF', accent: '#6611CC', speed: 0.8, ability: 'radar', abilityDesc: 'Radar — shows next 3 letters' },
  { name: 'Newt', color: '#44CC44', accent: '#228822', speed: 0.8, ability: 'shield', abilityDesc: 'Shield — protects current letter' },
  { name: 'Pogo', color: '#4488FF', accent: '#2266CC', speed: 1.5, ability: 'doublejump', abilityDesc: 'Double Jump — avoids zombies' },
  { name: 'Slick', color: '#FF8800', accent: '#CC6600', speed: 1, ability: 'glide', abilityDesc: 'Glide — floats over obstacles' },
  { name: 'Zee', color: '#44CC44', accent: '#228822', speed: 0.7, ability: 'invincible', abilityDesc: 'Zzz — invincible after hit' },
]

const CHASER_TYPES = [
  { name: 'Classic', speed: 1, behavior: 'steady' },
  { name: 'Decayed', speed: 0.8, behavior: 'stumble' },
  { name: 'Toxic', speed: 1, behavior: 'goo' },
  { name: 'Undead', speed: 0.9, behavior: 'phase' },
  { name: 'Rotten', speed: 0.6, behavior: 'accelerate' },
  { name: 'Ghoul', speed: 0.7, behavior: 'teleport' },
  { name: 'Mutant', speed: 1.4, behavior: 'straight' },
]

export class LetterRunnerMode {
  private canvasW: number
  private canvasH: number
  private state: RunnerState
  private frame = 0
  private runnerX = 100
  private runnerY = 0
  private runnerVy = 0
  private onGround = true
  private groundY = 0
  private scrollSpeed = 3
  private jumpPower = -10
  private gravity = 0.5

  private collectibles: RunnerCollectible[] = []
  private chasers: RunnerChaser[] = []
  private obstacles: RunnerObstacle[] = []
  private particles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []
  private bgOffset = 0
  private buildingOffset = 0
  private letterSet = new Set<string>()
  private chaserSpawnTimer = 0
  private invincibleTimer = 0
  private boostTimer = 0
  private boostActive = false
  private showSelect = true
  private highScore = 0
  private messageTimer = 0

  onStateChange?: (state: { distance: number; score: number; lettersCollected: number; gameOver: boolean; won: boolean }) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.groundY = canvasH - 100
    this.runnerY = this.groundY - 25
    this.state = {
      distance: 0, lettersCollected: [], score: 0,
      currentChaser: 0, selectedOddbod: 0,
      gameOver: false, won: false,
    }
    const hs = parseInt(localStorage.getItem('hs_runner') || '0', 10)
    this.highScore = hs
  }

  selectOddbod(index: number): void {
    this.state.selectedOddbod = index
    this.showSelect = false
    this.startGame()
  }

  private startGame(): void {
    this.collectibles = []
    this.chasers = []
    this.obstacles = []
    this.letterSet = new Set()
    this.scrollSpeed = 3
    this.bgOffset = 0
    this.buildingOffset = 0
    this.chaserSpawnTimer = 0
    this.invincibleTimer = 0
    this.boostTimer = 0
    this.boostActive = false
    this.frame = 0
    this.runnerX = 100
    this.runnerY = this.groundY - 25
    this.runnerVy = 0
    this.onGround = true
    this.state.distance = 0
    this.state.lettersCollected = []
    this.state.score = 0
    this.state.gameOver = false
    this.state.won = false
    this.spawnCollectible()
  }

  private spawnCollectible(): void {
    const pool = ALL_LETTERS.filter(l => !this.letterSet.has(l))
    if (pool.length === 0) return
    const letter = pool[Math.floor(Math.random() * pool.length)]
    const isHigh = Math.random() < 0.3
    this.collectibles.push({
      x: this.canvasW + 30,
      y: isHigh ? this.groundY - 120 : this.groundY - 40 - Math.random() * 20,
      letter,
      collected: false,
      isHigh,
      w: 30, h: 36,
    })
  }

  private spawnChaser(): void {
    const type = Math.floor(Math.random() * CHASER_TYPES.length)
    const chaser = CHASER_TYPES[type]
    this.chasers.push({
      x: -50,
      y: this.groundY - 20,
      type,
      speed: chaser.speed * (1 + this.state.distance * 0.001),
      alive: true,
    })
  }

  handleClick(cx: number, cy: number): void {
    if (this.showSelect) {
      const cols = 4
      const bw = 100
      const bh = 90
      const gap = 10
      const startX = (this.canvasW - cols * bw - (cols - 1) * gap) / 2
      const startY = 150

      for (let i = 0; i < ODDBODS.length; i++) {
        const bx = startX + (i % cols) * (bw + gap)
        const by = startY + Math.floor(i / cols) * (bh + gap)
        if (cx >= bx && cx <= bx + bw && cy >= by && cy <= by + bh) {
          this.selectOddbod(i)
          return
        }
      }
      return
    }

    if (this.state.gameOver || this.state.won) return

    if (cy > this.groundY - 40 && cy < this.groundY) {
      this.jump()
    }

    for (const c of this.collectibles) {
      if (c.collected) continue
      if (cx >= c.x - 15 && cx <= c.x + 15 && cy >= c.y - 18 && cy <= c.y + 18) {
        this.collectLetter(c)
        return
      }
    }
  }

  handleKey(key: string): void {
    if (this.showSelect) {
      const idx = parseInt(key, 10)
      if (idx >= 1 && idx <= ODDBODS.length) {
        this.selectOddbod(idx - 1)
      }
      return
    }

    if (this.state.gameOver || this.state.won) return

    if (key === ' ' || key === 'arrowup') {
      this.jump()
      return
    }

    const upper = key.toUpperCase()
    for (const c of this.collectibles) {
      if (c.collected) continue
      if (c.letter === upper) {
        this.collectLetter(c)
        return
      }
    }
  }

  private jump(): void {
    if (!this.onGround && this.getOddbod().ability === 'doublejump') {
      if (this.runnerVy > -2) {
        this.runnerVy = this.jumpPower * 0.7
        this.onGround = false
      }
      return
    }
    if (this.onGround) {
      this.runnerVy = this.jumpPower
      this.onGround = false
    }
  }

  private getOddbod(): RunnerOddbod {
    return ODDBODS[this.state.selectedOddbod]
  }

  private collectLetter(c: RunnerCollectible): void {
    c.collected = true
    this.letterSet.add(c.letter)
    this.state.lettersCollected.push(c.letter)
    this.state.score += 10
    this.state.distance += 5
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 2 + Math.random() * 3
      this.particles.push({
        x: c.x, y: c.y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        color: '#58d68d', life: 0, maxLife: 20 + Math.random() * 10,
      })
    }
    this.onStateChange?.({
      distance: this.state.distance, score: this.state.score,
      lettersCollected: this.state.lettersCollected.length,
      gameOver: this.state.gameOver, won: this.state.won,
    })

    if (this.letterSet.size >= 26) {
      this.state.won = true
      const prev = parseInt(localStorage.getItem('hs_runner') || '0', 10)
      if (this.state.distance > prev) localStorage.setItem('hs_runner', String(this.state.distance))
      return
    }

    if (this.getOddbod().ability === 'boost') {
      this.boostTimer++
      if (this.boostTimer % 3 === 0) this.activateBoost()
    }
  }

  private activateBoost(): void {
    this.boostActive = true
    this.scrollSpeed = 6
    setTimeout(() => {
      this.boostActive = false
      this.scrollSpeed = 3
    }, 1000)
  }

  update(): void {
    if (this.showSelect || this.state.gameOver || this.state.won) {
      this.frame++
      return
    }
    this.frame++

    this.state.distance += this.scrollSpeed * 0.1
    this.bgOffset = (this.bgOffset + this.scrollSpeed * 0.2) % this.canvasW
    this.buildingOffset = (this.buildingOffset + this.scrollSpeed * 0.5) % this.canvasW

    this.runnerVy += this.gravity
    this.runnerY += this.runnerVy
    if (this.runnerY >= this.groundY - 25) {
      this.runnerY = this.groundY - 25
      this.runnerVy = 0
      this.onGround = true
    }

    if (this.invincibleTimer > 0) this.invincibleTimer--
    if (this.boostTimer > 0) this.boostTimer--

    this.updateCollectibles()
    this.updateChasers()
    this.updateObstacles()

    this.chaserSpawnTimer++
    const spawnInterval = Math.max(60, 200 - this.state.distance * 0.5)
    if (this.chaserSpawnTimer > spawnInterval && this.chasers.length < 3) {
      this.chaserSpawnTimer = 0
      this.spawnChaser()
    }

    if (this.frame % 60 === 0 && this.collectibles.filter(c => !c.collected).length < 3) {
      this.spawnCollectible()
    }

    if (this.frame % 120 === 0 && this.obstacles.length < 2) {
      const type: 'puddle' | 'box' = Math.random() < 0.5 ? 'puddle' : 'box'
      this.obstacles.push({
        x: this.canvasW + 20,
        y: this.groundY - (type === 'box' ? 40 : 10),
        w: type === 'puddle' ? 60 : 30,
        h: type === 'puddle' ? 10 : 40,
        type,
        passed: false,
      })
    }

    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life++
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife)

    if (this.messageTimer > 0) this.messageTimer--
    this.onStateChange?.({
      distance: Math.floor(this.state.distance), score: this.state.score,
      lettersCollected: this.state.lettersCollected.length,
      gameOver: this.state.gameOver, won: this.state.won,
    })
  }

  private updateCollectibles(): void {
    for (const c of this.collectibles) {
      if (c.collected) continue
      c.x -= this.scrollSpeed
      if (c.isHigh) c.y += Math.sin(this.frame * 0.03) * 0.5
      if (c.x < -50) c.collected = true

      const dx = this.runnerX - c.x
      const dy = this.runnerY - c.y
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        this.collectLetter(c)
      }
    }
    this.collectibles = this.collectibles.filter(c => !c.collected)
  }

  private updateChasers(): void {
    for (const ch of this.chasers) {
      if (!ch.alive) continue
      const chaser = CHASER_TYPES[ch.type]
      let speed = ch.speed * this.scrollSpeed * 0.3

      switch (chaser.behavior) {
        case 'stumble':
          if (this.frame % 120 < 10) speed *= 0.2
          break
        case 'accelerate':
          speed *= (1 + this.state.distance * 0.0005)
          break
        case 'teleport':
          if (this.frame % 180 < 5) ch.x = this.runnerX + 40
          break
      }

      ch.x += speed
      if (ch.x > this.runnerX - 30 && ch.x < this.runnerX + 30 && Math.abs(ch.y - this.runnerY) < 30) {
        if (this.getOddbod().ability === 'invincible' && this.invincibleTimer > 0) {
          ch.alive = false
        } else {
          this.state.gameOver = true
          const prev = parseInt(localStorage.getItem('hs_runner') || '0', 10)
          if (this.state.distance > prev) localStorage.setItem('hs_runner', String(this.state.distance))
          this.highScore = Math.max(this.state.distance, prev)
        }
      }
    }
    this.chasers = this.chasers.filter(ch => ch.alive)
  }

  private updateObstacles(): void {
    for (const o of this.obstacles) {
      o.x -= this.scrollSpeed
      if (o.x + o.w < 0) o.passed = true

      if (!o.passed) {
        const r = this.runnerX + 15
        if (r > o.x && r < o.x + o.w && this.runnerY + 25 > o.y) {
          if (o.type === 'puddle') {
            this.scrollSpeed = 1
            setTimeout(() => { this.scrollSpeed = 3 }, 500)
          } else if (o.type === 'box') {
            if (!this.onGround) {
              o.passed = true
            } else {
              this.scrollSpeed = 1
              setTimeout(() => { this.scrollSpeed = 3 }, 300)
            }
          }
        }
      }
    }
    this.obstacles = this.obstacles.filter(o => !o.passed)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.showSelect) {
      this.drawSelectScreen(ctx)
      return
    }

    this.drawBackground(ctx)
    this.drawBuildings(ctx)
    this.drawGround(ctx)
    this.drawObstacles(ctx)
    this.drawCollectibles(ctx)
    this.drawRunner(ctx)
    this.drawChasers(ctx)
    this.drawParticles(ctx)
    this.drawHUD(ctx)

    if (this.state.gameOver) this.drawGameOver(ctx)
    if (this.state.won) this.drawWinScreen(ctx)
  }

  private drawSelectScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#0b0e17'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 28px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('🏃 Choose Your Oddbod!', this.canvasW / 2, 60)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '14px system-ui'
    ctx.fillText('Press 1-7 or click to select', this.canvasW / 2, 90)

    const cols = 4
    const bw = 100
    const bh = 90
    const gap = 10
    const startX = (this.canvasW - cols * bw - (cols - 1) * gap) / 2
    const startY = 130

    ODDBODS.forEach((o, i) => {
      const bx = startX + (i % cols) * (bw + gap)
      const by = startY + Math.floor(i / cols) * (bh + gap)

      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(bx, by, bw, bh, 8)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = o.color
      ctx.beginPath()
      ctx.arc(bx + bw / 2, by + 28, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`${i + 1}. ${o.name}`, bx + bw / 2, by + 58)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '8px system-ui'
      ctx.fillText(o.abilityDesc.substring(0, 18), bx + bw / 2, by + 75)
    })

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`High Score: ${this.highScore}`, this.canvasW / 2, this.canvasH - 40)
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a2a4e')
    grad.addColorStop(0.6, '#3a4a6e')
    grad.addColorStop(1, '#4a3a2e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
  }

  private drawBuildings(ctx: CanvasRenderingContext2D): void {
    const buildingColors = ['#2a2a4a', '#3a2a3a', '#2a3a3a', '#3a3a2a']
    for (let i = -2; i < 10; i++) {
      const bx = i * 120 - (this.buildingOffset % 120)
      const bh = 60 + (i * 37) % 60
      ctx.fillStyle = buildingColors[i % buildingColors.length]
      ctx.fillRect(bx, this.groundY - bh, 100, bh)
      ctx.fillStyle = '#ffd'
      for (let wy = 0; wy < bh - 15; wy += 20) {
        ctx.fillRect(bx + 15, this.groundY - bh + 10 + wy, 6, 8)
        ctx.fillRect(bx + 55, this.groundY - bh + 10 + wy, 6, 8)
      }
    }
  }

  private drawGround(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#3a5a3a'
    ctx.fillRect(0, this.groundY, this.canvasW, this.canvasH - this.groundY)
    ctx.fillStyle = '#4a6a4a'
    ctx.fillRect(0, this.groundY, this.canvasW, 3)
    for (let i = 0; i < 10; i++) {
      const gx = i * 60 - (this.bgOffset % 60)
      ctx.fillStyle = '#2a4a2a'
      ctx.fillRect(gx, this.groundY + 15, 20, 2)
    }
  }

  private drawCollectibles(ctx: CanvasRenderingContext2D): void {
    for (const c of this.collectibles) {
      if (c.collected) continue
      const bob = Math.sin(this.frame * 0.05) * 3
      const def = CHARACTERS[c.letter]
      ctx.save()
      ctx.globalAlpha = 0.8
      ctx.fillStyle = def?.bodyColor || '#fff'
      ctx.beginPath()
      ctx.arc(c.x, c.y + bob, 16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(c.letter, c.x, c.y + bob + 1)
      ctx.restore()
    }
  }

  private drawRunner(ctx: CanvasRenderingContext2D): void {
    const oddbod = this.getOddbod()
    const r = 20
    const bounce = this.onGround ? Math.sin(this.frame * 0.15) * 2 : 0

    ctx.save()
    ctx.translate(this.runnerX, this.runnerY + bounce)

    if (this.invincibleTimer > 0 && this.frame % 6 < 3) {
      ctx.globalAlpha = 0.5
    }

    ctx.fillStyle = oddbod.color
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = oddbod.accent
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.stroke()

    const eyeR = r * 0.16
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.arc(side * r * 0.3, -r * 0.1, eyeR, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(side * r * 0.3, -r * 0.1, 2, 0, Math.PI * 2)
      ctx.fillStyle = '#222'
      ctx.fill()
    }

    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(0, r * 0.2, r * 0.1, 0.2, Math.PI - 0.2)
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(oddbod.name.substring(0, 4), 0, r + 14)

    ctx.restore()
  }

  private drawChasers(ctx: CanvasRenderingContext2D): void {
    for (const ch of this.chasers) {
      if (!ch.alive) continue
      const chaser = CHASER_TYPES[ch.type]
      const r = 16

      ctx.fillStyle = '#4a6a4a'
      ctx.beginPath()
      ctx.arc(ch.x, ch.y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#2a4a2a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(ch.x, ch.y, r, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#ccd'
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(ch.x + side * r * 0.3, ch.y - r * 0.1, r * 0.18, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(ch.x + side * r * 0.3, ch.y - r * 0.1, 2, 0, Math.PI * 2)
        ctx.fillStyle = '#cc2222'
        ctx.fill()
      }
      ctx.fillStyle = '#fff'
      ctx.font = '8px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(chaser.name.substring(0, 4), ch.x, ch.y + r + 10)
    }
  }

  private drawObstacles(ctx: CanvasRenderingContext2D): void {
    for (const o of this.obstacles) {
      if (o.passed) continue
      if (o.type === 'puddle') {
        ctx.fillStyle = 'rgba(100,200,255,0.3)'
        ctx.beginPath()
        ctx.ellipse(o.x + o.w / 2, o.y + o.h / 2, o.w / 2, o.h / 2, 0, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillStyle = '#5a3a1a'
        ctx.fillRect(o.x, o.y, o.w, o.h)
        ctx.strokeStyle = '#3a2a0a'
        ctx.lineWidth = 2
        ctx.strokeRect(o.x, o.y, o.w, o.h)
      }
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife
      if (alpha <= 0) continue
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3 * alpha, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawHUD(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, this.canvasW, 34)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px system-ui'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#58d68d'
    ctx.fillText(`🏃 ${Math.floor(this.state.distance)}m  📦 ${this.state.lettersCollected.length}/26`, 12, 17)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#f5b041'
    ctx.fillText(`${this.getOddbod().name}  Score: ${this.state.score}`, this.canvasW - 12, 17)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '12px system-ui'
    ctx.fillText(`Press SPACE/↑ to jump  |  Key letters to collect`, this.canvasW / 2, 56)

    if (this.boostActive) {
      ctx.fillStyle = '#f5b041'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('⚡ BOOST!', this.canvasW / 2, 80)
    }

    if (this.invincibleTimer > 0) {
      ctx.fillStyle = '#58d68d'
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('✨ Invincible!', this.canvasW / 2, this.canvasH - 30)
    }
  }

  private drawGameOver(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
    ctx.fillStyle = '#e74c5c'
    ctx.font = 'bold 32px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Zombie Got You!', this.canvasW / 2, this.canvasH / 2 - 50)
    ctx.fillStyle = '#f5b041'
    ctx.font = '20px system-ui'
    ctx.fillText(`Distance: ${Math.floor(this.state.distance)}m  |  Letters: ${this.state.lettersCollected.length}/26`, this.canvasW / 2, this.canvasH / 2)
    ctx.fillStyle = '#5dade2'
    ctx.font = '18px system-ui'
    ctx.fillText(`Best: ${this.highScore}m`, this.canvasW / 2, this.canvasH / 2 + 35)
    ctx.fillStyle = '#8899bb'
    ctx.font = '16px system-ui'
    ctx.fillText('Press SPACE or click to restart', this.canvasW / 2, this.canvasH / 2 + 70)
  }

  private drawWinScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
    ctx.fillStyle = '#58d68d'
    ctx.font = 'bold 32px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🏆 Alphabet Runner!', this.canvasW / 2, this.canvasH / 2 - 40)
    ctx.fillStyle = '#fff'
    ctx.font = '18px system-ui'
    ctx.fillText('All 26 letters collected!', this.canvasW / 2, this.canvasH / 2)
    ctx.fillStyle = '#f5b041'
    ctx.font = '16px system-ui'
    ctx.fillText(`Distance: ${Math.floor(this.state.distance)}m  |  Score: ${this.state.score}`, this.canvasW / 2, this.canvasH / 2 + 35)
    ctx.fillStyle = '#8899bb'
    ctx.font = '14px system-ui'
    ctx.fillText('Press SPACE or click to play again', this.canvasW / 2, this.canvasH / 2 + 70)
  }

  restart(): void {
    this.state.gameOver = false
    this.state.won = false
    this.showSelect = true
    this.collectibles = []
    this.chasers = []
    this.obstacles = []
    this.letterSet = new Set()
    this.particles = []
    this.frame = 0
  }
}
