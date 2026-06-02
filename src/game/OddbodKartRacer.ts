import { ALL_LETTERS } from '../characters/data'

interface KartOddbod {
  name: string
  color: string
  accent: string
  speed: number
  ability: string
}

interface KartObstacle {
  x: number
  lane: number
  letter: string
  passed: boolean
  hit: boolean
}

interface KartPrompt {
  letter: string
  spawnFrame: number
  maxFrames: number
  answered: boolean
}

const KART_ODDBODS: KartOddbod[] = [
  { name: 'Bubbles', color: '#FF66BB', accent: '#CC3388', speed: 1, ability: 'Magnet' },
  { name: 'Fuse', color: '#FF4444', accent: '#CC2222', speed: 1.3, ability: 'Boost' },
  { name: 'Jeff', color: '#9933FF', accent: '#6611CC', speed: 0.8, ability: 'Radar' },
  { name: 'Newt', color: '#44CC44', accent: '#228822', speed: 0.8, ability: 'Shield' },
  { name: 'Pogo', color: '#4488FF', accent: '#2266CC', speed: 1.5, ability: 'Double' },
  { name: 'Slick', color: '#FF8800', accent: '#CC6600', speed: 1, ability: 'Glide' },
  { name: 'Zee', color: '#44CC44', accent: '#228822', speed: 0.7, ability: 'Zzz' },
]

const AI_NAMES = ['Alpha', 'Bravo', 'Charlie']
const AI_COLORS = ['#e74c5c', '#5dade2', '#f5b041']
const RACE_DISTANCE = 1000
const LANE_COUNT = 4

export class OddbodKartRacer {
  private canvasW: number
  private canvasH: number
  private frame = 0
  private phase: 'select' | 'countdown' | 'racing' | 'finished' = 'select'
  private countdownTimer = 0
  private selectedOddbod = 0

  private playerProgress = 0
  private playerSpeed = 2
  private baseSpeed = 2
  private playerLane = 1
  private playerPosition = 1
  private boostTimer = 0
  private boostActive = false

  private aiProgress: number[] = [0, 0, 0]
  private aiSpeed: number[] = [2, 2, 2]
  private aiLane: number[] = [0, 2, 3]
  private aiFinished: boolean[] = [false, false, false]
  private aiTargetSpeed: number[] = [1.6, 1.8, 1.7]
  private aiBoostTimer: number[] = [0, 0, 0]

  private finishOrder: string[] = []
  private raceTime = 0

  private currentPrompt: KartPrompt | null = null
  private promptCooldown = 0

  private obstacles: KartObstacle[] = []
  private obstacleCooldown = 0

  private roadOffset = 0
  private particles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []
  private crashFlash = 0
  private wrongFlash = 0
  private correctFlash = 0

  private laneXs: number[] = []
  private roadLeft = 0
  private roadRight = 0
  private laneW = 0

  private highScore = 0
  private speedLines: { x: number; y: number; speed: number; length: number }[] = []

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.roadLeft = canvasW * 0.12
    this.roadRight = canvasW * 0.88
    this.laneW = (this.roadRight - this.roadLeft) / LANE_COUNT
    for (let i = 0; i < LANE_COUNT; i++) {
      this.laneXs[i] = this.roadLeft + this.laneW * i + this.laneW / 2
    }
    const hs = parseInt(localStorage.getItem('hs_kart') || '0', 10)
    this.highScore = hs
  }

  handleClick(cx: number, cy: number): void {
    if (this.phase === 'select') {
      const cols = 4
      const bw = 100
      const bh = 90
      const gap = 10
      const startX = (this.canvasW - cols * bw - (cols - 1) * gap) / 2
      const startY = 150
      for (let i = 0; i < KART_ODDBODS.length; i++) {
        const bx = startX + (i % cols) * (bw + gap)
        const by = startY + Math.floor(i / cols) * (bh + gap)
        if (cx >= bx && cx <= bx + bw && cy >= by && cy <= by + bh) {
          this.selectedOddbod = i
          this.startCountdown()
          return
        }
      }
      return
    }
    if (this.phase === 'finished') {
      this.restart()
      return
    }
    if (this.phase === 'countdown') return

    for (let i = 0; i < LANE_COUNT; i++) {
      const lx = this.laneXs[i]
      if (cx >= lx - this.laneW / 2 && cx <= lx + this.laneW / 2) {
        this.playerLane = i
        return
      }
    }
  }

  handleKey(key: string): void {
    if (this.phase === 'select') {
      const idx = parseInt(key, 10)
      if (idx >= 1 && idx <= KART_ODDBODS.length) {
        this.selectedOddbod = idx - 1
        this.startCountdown()
      }
      return
    }
    if (this.phase === 'finished') {
      if (key === ' ') {
        this.restart()
      }
      return
    }
    if (this.phase !== 'racing') return

    if (key === ' ') {
      return
    }

    const upper = key.toUpperCase()

    if (this.currentPrompt && !this.currentPrompt.answered && this.currentPrompt.letter === upper) {
      this.currentPrompt.answered = true
      this.boostTimer = 60
      this.boostActive = true
      this.correctFlash = 15
      this.playerSpeed = Math.min(6, this.baseSpeed + 2)
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2
        const s = 3 + Math.random() * 4
        this.particles.push({
          x: this.laneXs[this.playerLane],
          y: this.canvasH * 0.7,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 2,
          color: '#58d68d',
          life: 0,
          maxLife: 25 + Math.random() * 15,
        })
      }
      this.onStateChange?.({ score: this.getScore(), progress: Math.floor(this.playerProgress), position: this.playerPosition, speed: Math.floor(this.playerSpeed * 10) / 10 })
      return
    }

    for (const obs of this.obstacles) {
      if (obs.passed || obs.hit) continue
      if (obs.letter === upper) {
        obs.hit = true
        this.playerSpeed = Math.min(6, this.playerSpeed + 0.5)
        for (let i = 0; i < 8; i++) {
          const a = Math.random() * Math.PI * 2
          const s = 2 + Math.random() * 3
          this.particles.push({
            x: obs.x,
            y: this.canvasH * 0.25,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s,
            color: '#f5b041',
            life: 0,
            maxLife: 20 + Math.random() * 10,
          })
        }
        return
      }
    }
  }

  private startCountdown(): void {
    this.phase = 'countdown'
    this.countdownTimer = 120
  }

  private getOddbod(): KartOddbod {
    return KART_ODDBODS[this.selectedOddbod]
  }

  private getScore(): number {
    return Math.floor(this.playerProgress * 0.5)
  }

  update(): void {
    this.frame++

    if (this.phase === 'countdown') {
      this.countdownTimer--
      if (this.countdownTimer <= 0) {
        this.phase = 'racing'
        this.playerSpeed = this.baseSpeed
        this.raceTime = 0
      }
      return
    }

    if (this.phase !== 'racing') return

    this.raceTime++

    if (this.boostTimer > 0) {
      this.boostTimer--
      if (this.boostTimer <= 0) {
        this.boostActive = false
        this.playerSpeed = this.baseSpeed
      }
    }
    if (this.crashFlash > 0) this.crashFlash--
    if (this.wrongFlash > 0) this.wrongFlash--
    if (this.correctFlash > 0) this.correctFlash--

    this.playerSpeed = Math.max(0.5, this.playerSpeed - 0.003)
    this.playerProgress += this.playerSpeed * 0.5

    this.roadOffset = (this.roadOffset + this.playerSpeed * 0.3) % 40

    this.promptCooldown--
    if (this.promptCooldown <= 0 && !this.currentPrompt) {
      const letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
      this.currentPrompt = { letter, spawnFrame: this.frame, maxFrames: 150, answered: false }
    }

    if (this.currentPrompt && !this.currentPrompt.answered) {
      if (this.frame - this.currentPrompt.spawnFrame > this.currentPrompt.maxFrames) {
        this.currentPrompt = null
        this.promptCooldown = 30
      }
    }
    if (this.currentPrompt && this.currentPrompt.answered) {
      if (this.frame - this.currentPrompt.spawnFrame > this.currentPrompt.maxFrames + 20) {
        this.currentPrompt = null
        this.promptCooldown = 20 + Math.random() * 40
      }
    }

    this.obstacleCooldown--
    const obsInterval = Math.max(60, 180 - this.playerProgress * 0.05)
    if (this.obstacleCooldown <= 0 && this.obstacles.length < 4) {
      this.obstacleCooldown = obsInterval
      const lane = Math.floor(Math.random() * LANE_COUNT)
      const obsLetter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
      this.obstacles.push({
        x: this.laneXs[lane],
        lane,
        letter: obsLetter,
        passed: false,
        hit: false,
      })
    }

    for (const obs of this.obstacles) {
      if (obs.passed || obs.hit) continue
      obs.x += this.playerSpeed * 0.8
      const playerY = this.canvasH * 0.7
      const obsProgress = (obs.x - this.roadLeft) / (this.roadRight - this.roadLeft)
      const obsScreenY = this.canvasH * 0.12 + obsProgress * (playerY - this.canvasH * 0.12)

      if (obsScreenY > this.canvasH + 30) {
        obs.passed = true
        if (obs.lane === this.playerLane) {
          this.crash()
        }
        continue
      }

      if (
        !obs.hit &&
        obs.lane === this.playerLane &&
        Math.abs(obsScreenY - playerY) < 35
      ) {
        this.crash()
        obs.hit = true
      }
    }
    this.obstacles = this.obstacles.filter(o => !o.passed)

    for (let i = 0; i < 3; i++) {
      if (this.aiFinished[i]) continue
      this.aiBoostTimer[i]--
      if (this.aiBoostTimer[i] <= 0) {
        this.aiBoostTimer[i] = -(60 + Math.random() * 60)
        this.aiSpeed[i] = this.aiTargetSpeed[i] + 0.5 + Math.random() * 0.5
      } else if (this.aiBoostTimer[i] < 0 && this.aiBoostTimer[i] > -10) {
        this.aiSpeed[i] = this.aiTargetSpeed[i] + (Math.random() - 0.5) * 0.4
        this.aiBoostTimer[i] = 60 + Math.random() * 100
      }
      this.aiSpeed[i] = Math.max(0.5, this.aiSpeed[i] - 0.001)
      this.aiProgress[i] += this.aiSpeed[i] * 0.5

      if (Math.random() < 0.005) {
        this.aiLane[i] = Math.floor(Math.random() * LANE_COUNT)
      }

      for (const obs of this.obstacles) {
        if (obs.passed || obs.hit) continue
        if (obs.lane === this.aiLane[i] && Math.random() < 0.002) {
          obs.hit = true
          this.aiSpeed[i] = Math.max(0.3, this.aiSpeed[i] - 0.5)
        }
      }

      if (this.aiProgress[i] >= RACE_DISTANCE && !this.aiFinished[i]) {
        this.aiFinished[i] = true
        this.finishOrder.push(AI_NAMES[i])
      }
    }

    if (this.playerProgress >= RACE_DISTANCE) {
      this.finishOrder.unshift('player')
      this.phase = 'finished'
      const score = this.getScore()
      if (score > this.highScore) {
        this.highScore = score
        localStorage.setItem('hs_kart', String(score))
      }
      this.onStateChange?.({ score, progress: Math.floor(this.playerProgress), position: 1 + this.finishOrder.indexOf('player'), finished: true })
      return
    }

    const fin = this.finishOrder.length
    if (fin > 0 && this.finishOrder.indexOf('player') === -1 && !this.finishOrder.includes('player')) {
    }

    const allProgress = [
      { id: 'player', progress: this.playerProgress },
      { id: AI_NAMES[0], progress: this.aiProgress[0] },
      { id: AI_NAMES[1], progress: this.aiProgress[1] },
      { id: AI_NAMES[2], progress: this.aiProgress[2] },
    ]
    allProgress.sort((a, b) => b.progress - a.progress)
    this.playerPosition = allProgress.findIndex(p => p.id === 'player') + 1

    this.speedLines.push({ x: this.canvasW + 10, y: Math.random() * this.canvasH, speed: this.playerSpeed, length: 10 + Math.random() * 20 })
    this.speedLines = this.speedLines.filter(sl => { sl.x -= this.playerSpeed * 2; return sl.x > -20 })

    for (const p of this.particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.05
      p.life++
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife)

    this.onStateChange?.({ score: this.getScore(), progress: Math.floor(this.playerProgress), position: this.playerPosition, speed: Math.floor(this.playerSpeed * 10) / 10 })
  }

  private crash(): void {
    this.playerSpeed = Math.max(0.3, this.playerSpeed - 1.5)
    this.crashFlash = 20
    this.boostActive = false
    this.boostTimer = 0
    for (let i = 0; i < 15; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 2 + Math.random() * 4
      this.particles.push({
        x: this.laneXs[this.playerLane],
        y: this.canvasH * 0.7,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color: '#e74c5c',
        life: 0,
        maxLife: 20 + Math.random() * 15,
      })
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.phase === 'select') {
      this.drawSelectScreen(ctx)
      return
    }

    this.drawRoad(ctx)
    this.drawObstacles(ctx)
    this.drawAIKarts(ctx)
    this.drawPlayerKart(ctx)
    this.drawParticles(ctx)
    this.drawHUD(ctx)
    this.drawPrompt(ctx)
    this.drawSpeedEffects(ctx)

    if (this.phase === 'countdown') {
      this.drawCountdown(ctx)
    }

    if (this.phase === 'finished') {
      this.drawFinishScreen(ctx)
    }
  }

  private drawSelectScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#0b0e17'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 28px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('🏎️ Choose Your Oddbod!', this.canvasW / 2, 60)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '14px system-ui'
    ctx.fillText('Press 1-7 or click to select', this.canvasW / 2, 90)

    const cols = 4
    const bw = 100
    const bh = 90
    const gap = 10
    const startX = (this.canvasW - cols * bw - (cols - 1) * gap) / 2
    const startY = 130

    KART_ODDBODS.forEach((o, i) => {
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
      ctx.fillText(o.ability, bx + bw / 2, by + 75)
    })

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`Best Score: ${this.highScore}`, this.canvasW / 2, this.canvasH - 40)
  }

  private drawRoad(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#2a4a2a')
    grad.addColorStop(0.05, '#3a5a3a')
    grad.addColorStop(0.95, '#3a5a3a')
    grad.addColorStop(1, '#2a4a2a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#555'
    ctx.fillRect(this.roadLeft, 0, this.roadRight - this.roadLeft, this.canvasH)

    for (let i = 0; i < LANE_COUNT - 1; i++) {
      const lx = this.roadLeft + this.laneW * (i + 1)
      ctx.setLineDash([12, 16])
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(lx, 0)
      ctx.lineTo(lx, this.canvasH)
      ctx.stroke()
    }
    ctx.setLineDash([])

    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(this.roadLeft, 0)
    ctx.lineTo(this.roadLeft, this.canvasH)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(this.roadRight, 0)
    ctx.lineTo(this.roadRight, this.canvasH)
    ctx.stroke()

    for (let i = 0; i < 10; i++) {
      const ry = (i * 40 + this.roadOffset) % (this.canvasH + 40) - 20
      const rw = this.laneW * 0.6
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      for (let lane = 0; lane < LANE_COUNT; lane++) {
        ctx.fillRect(this.laneXs[lane] - rw / 2, ry, rw, 6)
      }
    }
  }

  private drawPlayerKart(ctx: CanvasRenderingContext2D): void {
    const oddbod = this.getOddbod()
    const kx = this.laneXs[this.playerLane]
    const ky = this.canvasH * 0.7
    const wobble = Math.sin(this.frame * 0.1) * 2

    ctx.save()
    ctx.translate(kx, ky + wobble)

    if (this.crashFlash > 0 && this.frame % 4 < 2) {
      ctx.globalAlpha = 0.4
    }

    const kw = 44
    const kh = 28

    ctx.fillStyle = '#e74c5c'
    ctx.beginPath()
    ctx.roundRect(-kw / 2, -kh / 2, kw, kh, 6)
    ctx.fill()

    ctx.fillStyle = '#c0392b'
    ctx.beginPath()
    ctx.roundRect(-kw / 2 + 3, -kh / 2 - 3, kw - 6, 6, 2)
    ctx.fill()

    ctx.fillStyle = oddbod.color
    ctx.beginPath()
    ctx.arc(0, -4, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = oddbod.accent
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, -4, 16, 0, Math.PI * 2)
    ctx.stroke()

    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.arc(side * 5, -7, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(side * 5, -7, 1.8, 0, Math.PI * 2)
      ctx.fillStyle = '#222'
      ctx.fill()
    }

    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(0, 2, 4, 0.2, Math.PI - 0.2)
    ctx.stroke()

    ctx.restore()

    if (this.boostActive) {
      ctx.save()
      ctx.globalAlpha = 0.4 + Math.sin(this.frame * 0.2) * 0.2
      ctx.fillStyle = '#f5b041'
      ctx.beginPath()
      ctx.arc(kx, ky + 22, 10 + Math.sin(this.frame * 0.3) * 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  private drawAIKarts(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < 3; i++) {
      if (this.aiFinished[i]) continue
      const aiProgressRatio = this.aiProgress[i] / RACE_DISTANCE
      const playerRatio = this.playerProgress / RACE_DISTANCE
      const relativeY = (aiProgressRatio - playerRatio) * this.canvasH * 0.5 + this.canvasH * 0.35

      if (relativeY < -50 || relativeY > this.canvasH + 50) continue

      const ax = this.laneXs[this.aiLane[i]]
      const ay = relativeY

      ctx.save()
      ctx.globalAlpha = 0.85

      const kw = 36
      const kh = 24

      ctx.fillStyle = AI_COLORS[i]
      ctx.beginPath()
      ctx.roundRect(-kw / 2, -kh / 2, kw, kh, 5)
      ctx.fill()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 8px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(AI_NAMES[i], 0, -kh / 2 - 8)

      ctx.fillStyle = '#ddd'
      ctx.beginPath()
      ctx.arc(0, -3, 12, 0, Math.PI * 2)
      ctx.fill()

      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(side * 4, -5, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = '#222'
        ctx.fill()
      }

      ctx.restore()

      const pct = Math.floor(this.aiProgress[i] / RACE_DISTANCE * 100)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '8px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`${pct}%`, ax, ay + 22)
    }
  }

  private drawObstacles(ctx: CanvasRenderingContext2D): void {
    const playerY = this.canvasH * 0.7
    for (const obs of this.obstacles) {
      if (obs.passed || obs.hit) continue
      const obsProgress = (obs.x - this.roadLeft) / (this.roadRight - this.roadLeft)
      const obsY = this.canvasH * 0.12 + obsProgress * (playerY - this.canvasH * 0.12)

      if (obsY < -30 || obsY > this.canvasH + 30) continue

      const pulse = Math.sin(this.frame * 0.08) * 3
      ctx.fillStyle = '#8a2a2a'
      ctx.beginPath()
      ctx.roundRect(obs.x - 20, obsY - 12 + pulse, 40, 24, 4)
      ctx.fill()
      ctx.strokeStyle = '#5a1a1a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(obs.x - 20, obsY - 12 + pulse, 40, 24, 4)
      ctx.stroke()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(obs.letter, obs.x, obsY + pulse + 1)

      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '7px system-ui'
      ctx.fillText('TYPE ' + obs.letter, obs.x, obsY + 20 + pulse)
    }
  }

  private drawPrompt(ctx: CanvasRenderingContext2D): void {
    if (!this.currentPrompt || this.currentPrompt.answered) return
    const bx = this.laneXs[this.playerLane]
    const by = this.canvasH * 0.7 - 70
    const remaining = this.currentPrompt.maxFrames - (this.frame - this.currentPrompt.spawnFrame)
    const urgency = Math.max(0, Math.min(1, 1 - remaining / 50))

    ctx.save()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.roundRect(bx - 50, by - 25, 100, 50, 12)
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(bx - 50, by - 25, 100, 50, 12)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(bx - 10, by + 25)
    ctx.lineTo(bx, by + 35)
    ctx.lineTo(bx + 10, by + 25)
    ctx.fillStyle = '#fff'
    ctx.fill()

    ctx.fillStyle = `hsl(${urgency * 120}, 100%, ${50 - urgency * 20}%)`
    ctx.font = 'bold 24px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.currentPrompt.letter, bx, by)

    ctx.fillStyle = `rgba(255,0,0,${urgency * 0.3})`
    ctx.font = '9px system-ui'
    ctx.fillText('TYPE ' + this.currentPrompt.letter, bx, by + 35)

    ctx.restore()
  }

  private drawHUD(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, this.canvasW, 32)

    ctx.textBaseline = 'middle'
    ctx.font = 'bold 13px system-ui'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#58d68d'
    ctx.fillText(`🏎️ #${this.playerPosition}`, 10, 16)
    ctx.fillStyle = '#5dade2'
    ctx.fillText(`${Math.floor(this.playerProgress)}/${RACE_DISTANCE}m`, 100, 16)
    ctx.fillStyle = '#f5b041'
    ctx.fillText(`${this.playerSpeed.toFixed(1)} km/h`, 230, 16)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#e74c5c'
    const fin = this.finishOrder.length
    if (fin > 0) {
      ctx.fillText(`🏁 ${fin}/4 finished`, this.canvasW - 10, 16)
    } else {
      ctx.fillText(`Score: ${this.getScore()}`, this.canvasW - 10, 16)
    }

    const barW = this.canvasW * 0.6
    const barX = (this.canvasW - barW) / 2
    const barY = 38
    const barH = 8

    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW, barH, 4)
    ctx.fill()

    const allRacers = [
      { name: 'You', progress: this.playerProgress, color: '#58d68d' },
      { name: AI_NAMES[0], progress: this.aiProgress[0], color: AI_COLORS[0] },
      { name: AI_NAMES[1], progress: this.aiProgress[1], color: AI_COLORS[1] },
      { name: AI_NAMES[2], progress: this.aiProgress[2], color: AI_COLORS[2] },
    ]
    allRacers.sort((a, b) => b.progress - a.progress)

    for (const r of allRacers) {
      const pct = Math.min(1, r.progress / RACE_DISTANCE)
      const mx = barX + pct * barW
      ctx.fillStyle = r.color
      ctx.beginPath()
      ctx.arc(mx, barY + barH / 2, 4, 0, Math.PI * 2)
      ctx.fill()
      if (pct > 0.02) {
        ctx.globalAlpha = 0.3
        ctx.fillStyle = r.color
        ctx.beginPath()
        ctx.roundRect(barX, barY, pct * barW, barH, 4)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    const pct = Math.min(1, this.playerProgress / RACE_DISTANCE)
    ctx.fillStyle = '#58d68d'
    ctx.font = 'bold 12px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`🏁 ${Math.floor(pct * 100)}%`, this.canvasW / 2, barY + barH + 16)

    if (this.boostActive) {
      ctx.fillStyle = '#f5b041'
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('⚡ BOOST!', this.canvasW / 2, 70)
    }
  }

  private drawSpeedEffects(ctx: CanvasRenderingContext2D): void {
    for (const sl of this.speedLines) {
      ctx.fillStyle = `rgba(255,255,255,${0.05 + 0.1 * (sl.speed / 6)})`
      ctx.fillRect(sl.x, sl.y, 3, sl.length)
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife
      if (alpha <= 0) continue
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3 * alpha + 1, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawCountdown(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    const count = Math.ceil(this.countdownTimer / 40)
    const num = Math.max(1, count)
    const opacity = (this.countdownTimer % 40) / 40

    ctx.fillStyle = `rgba(255,255,255,${opacity})`
    ctx.font = 'bold 72px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(num > 3 ? 'GO!' : String(num), this.canvasW / 2, this.canvasH / 2)
  }

  private drawFinishScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    const playerPos = this.finishOrder.indexOf('player')
    const isWinner = playerPos === 0

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    if (isWinner) {
      ctx.fillStyle = '#58d68d'
      ctx.font = 'bold 36px system-ui'
      ctx.fillText('🏆 Race Champion!', this.canvasW / 2, this.canvasH / 2 - 80)
    } else {
      ctx.fillStyle = '#5dade2'
      ctx.font = 'bold 32px system-ui'
      ctx.fillText('Race Over!', this.canvasW / 2, this.canvasH / 2 - 80)
    }

    ctx.fillStyle = '#f5b041'
    ctx.font = 'bold 20px system-ui'
    ctx.fillText(`Position: #${playerPos + 1}`, this.canvasW / 2, this.canvasH / 2 - 35)

    ctx.fillStyle = '#fff'
    ctx.font = '16px system-ui'
    ctx.fillText(`Distance: ${Math.floor(this.playerProgress)}/${RACE_DISTANCE}m`, this.canvasW / 2, this.canvasH / 2)
    ctx.fillText(`Score: ${this.getScore()}  |  Best: ${this.highScore}`, this.canvasW / 2, this.canvasH / 2 + 30)

    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '14px system-ui'
    ctx.fillText('🏁 Finish Order:', this.canvasW / 2, this.canvasH / 2 + 70)
    this.finishOrder.forEach((racer, i) => {
      const label = racer === 'player' ? `${this.getOddbod().name} (You)` : racer
      ctx.fillStyle = racer === 'player' ? '#58d68d' : AI_COLORS[AI_NAMES.indexOf(racer)]
      ctx.font = '14px system-ui'
      ctx.fillText(`#${i + 1}  ${label}`, this.canvasW / 2, this.canvasH / 2 + 95 + i * 22)
    })

    ctx.fillStyle = '#8899bb'
    ctx.font = '13px system-ui'
    ctx.fillText('Press SPACE or click to race again', this.canvasW / 2, this.canvasH / 2 + 180)
  }

  restart(): void {
    this.phase = 'select'
    this.playerProgress = 0
    this.playerSpeed = this.baseSpeed
    this.playerLane = 1
    this.aiProgress = [0, 0, 0]
    this.aiSpeed = [2, 2, 2]
    this.aiLane = [0, 2, 3]
    this.aiFinished = [false, false, false]
    this.aiBoostTimer = [0, 0, 0]
    this.finishOrder = []
    this.raceTime = 0
    this.currentPrompt = null
    this.promptCooldown = 0
    this.obstacles = []
    this.obstacleCooldown = 0
    this.particles = []
    this.crashFlash = 0
    this.wrongFlash = 0
    this.correctFlash = 0
    this.boostActive = false
    this.boostTimer = 0
    this.speedLines = []
    this.frame = 0
    this.countdownTimer = 0
  }
}
