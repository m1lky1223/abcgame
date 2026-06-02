import { ALL_LETTERS } from '../characters/data'

interface Peg {
  letter: string
  x: number
  y: number
  radius: number
  lit: boolean
}

interface Pinball {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  active: boolean
}

const PEG_RADIUS = 14
const BALL_RADIUS = 12
const GRAVITY = 0.12
const WORD_LIST = ['CAT', 'DOG', 'SUN', 'BIG', 'FUN', 'HAT', 'PEN', 'CUP', 'BUG', 'BED', 'FAN', 'MAP', 'BOX', 'FOX', 'RED', 'HEN', 'PIG', 'LOG', 'NUT', 'JAM']

export class PinballMode {
  private canvasW: number
  private canvasH: number
  private frame = 0
  private phase: 'launch' | 'playing' | 'gameover' = 'launch'
  private pegs: Peg[] = []
  private ball: Pinball
  private score = 0
  private currentWord = ''
  private wordIndex = 0
  private wordDone = false
  private lettersHit: string[] = []
  private launched = false
  private plungerPower = 0
  private plungerMax = 15
  private plungerPulling = false
  private highScore = 0
  private trails: { x: number; y: number; life: number }[] = []
  private pegsLit = new Set<string>()
  private totalPegs = 0

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.ball = { x: canvasW * 0.15, y: canvasH * 0.85, vx: 0, vy: 0, radius: BALL_RADIUS, active: false }
    const hs = parseInt(localStorage.getItem('hs_pinball') || '0', 10)
    this.highScore = hs
    this.initBoard()
    this.pickWord()
  }

  private initBoard(): void {
    this.pegs = []
    const pw = this.canvasW * 0.55
    const ph = this.canvasH * 0.65
    const px = this.canvasW * 0.35
    const py = this.canvasH * 0.08
    const cols = 7
    const rows = 8

    for (let row = 0; row < rows; row++) {
      const offset = row % 2 === 0 ? 0 : pw / (cols * 2)
      for (let col = 0; col < cols; col++) {
        const letter = ALL_LETTERS[(row * cols + col) % 26]
        this.pegs.push({
          letter,
          x: px + offset + (pw / cols) * col + pw / (cols * 2),
          y: py + (ph / rows) * row + ph / (rows * 2),
          radius: PEG_RADIUS,
          lit: false,
        })
      }
    }
    this.totalPegs = this.pegs.length
  }

  private pickWord(): void {
    this.currentWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    this.wordIndex = 0
    this.lettersHit = []
    this.wordDone = false
  }

  handleAimStart(_cx: number, _cy: number): void {
    if (this.phase === 'gameover') return
    if (this.phase === 'launch') {
      this.plungerPulling = true
    }
  }

  handleAimMove(_cx: number, cy: number): void {
    if (this.plungerPulling && this.phase === 'launch') {
      const pull = Math.max(0, (this.canvasH * 0.9 - cy) / (this.canvasH * 0.4))
      this.plungerPower = Math.min(this.plungerMax, pull * this.plungerMax)
    }
  }

  handleAimRelease(): void {
    if (this.plungerPulling && this.phase === 'launch' && !this.launched) {
      this.launchBall()
      this.plungerPulling = false
    }
  }

  handleClick(_cx: number, _cy: number): void {
    if (this.phase === 'gameover') {
      this.restart()
      return
    }
  }

  handleKey(key: string): void {
    if (this.phase === 'gameover') {
      if (key === ' ') this.restart()
      return
    }
    if (this.phase === 'launch' && key === ' ') {
      if (!this.launched) {
        this.plungerPower = this.plungerMax * 0.7
        this.launchBall()
      }
      return
    }
  }

  private launchBall(): void {
    this.ball.x = this.canvasW * 0.15
    this.ball.y = this.canvasH * 0.82
    this.ball.vx = 3 + Math.random() * 2
    this.ball.vy = -(this.plungerPower + 2)
    this.ball.active = true
    this.launched = true
    this.phase = 'playing'
  }

  restart(): void {
    this.ball.x = this.canvasW * 0.15
    this.ball.y = this.canvasH * 0.85
    this.ball.vx = 0
    this.ball.vy = 0
    this.ball.active = false
    this.phase = 'launch'
    this.launched = false
    this.score = 0
    this.plungerPower = 0
    this.plungerPulling = false
    this.trails = []
    this.pegsLit = new Set()
    this.wordIndex = 0
    this.wordDone = false
    this.lettersHit = []
    for (const p of this.pegs) p.lit = false
    this.pickWord()
    this.frame = 0
  }

  update(): void {
    this.frame++
    if (this.phase !== 'playing') return
    if (!this.ball.active) return

    this.ball.vy += GRAVITY
    this.ball.x += this.ball.vx
    this.ball.y += this.ball.vy
    this.ball.vx *= 0.998
    this.ball.vy *= 0.998

    this.trails.push({ x: this.ball.x, y: this.ball.y, life: 20 })
    this.trails = this.trails.filter(t => { t.life--; return t.life > 0 })

    const leftWall = this.canvasW * 0.3
    const rightWall = this.canvasW * 0.92
    const topWall = this.canvasH * 0.04
    const bottom = this.canvasH * 0.95

    if (this.ball.x - this.ball.radius < leftWall) {
      this.ball.x = leftWall + this.ball.radius
      this.ball.vx *= -0.5
    }
    if (this.ball.x + this.ball.radius > rightWall) {
      this.ball.x = rightWall - this.ball.radius
      this.ball.vx *= -0.5
    }
    if (this.ball.y - this.ball.radius < topWall) {
      this.ball.y = topWall + this.ball.radius
      this.ball.vy *= -0.5
    }
    if (this.ball.y + this.ball.radius > bottom) {
      this.ball.active = false
      this.ball.vy = 0
      this.ball.vx = 0
      if (this.wordDone) {
        this.score += 50
        this.pickWord()
      }
      this.phase = 'launch'
      this.launched = false

      const anyLit = this.pegs.some(p => p.lit)
      if (!anyLit) {
      }
      return
    }

    for (const peg of this.pegs) {
      if (peg.lit) continue
      const dx = this.ball.x - peg.x
      const dy = this.ball.y - peg.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const minDist = this.ball.radius + peg.radius
      if (dist < minDist && dist > 0.01) {
        const nx = dx / dist
        const ny = dy / dist
        const overlap = minDist - dist
        this.ball.x += nx * overlap
        this.ball.y += ny * overlap
        const dot = this.ball.vx * nx + this.ball.vy * ny
        this.ball.vx -= 2 * dot * nx
        this.ball.vy -= 2 * dot * ny
        this.ball.vx *= 0.8
        this.ball.vy *= 0.8

        peg.lit = true
        this.pegsLit.add(peg.letter)
        this.score += 5

        if (this.currentWord[this.wordIndex] === peg.letter) {
          this.lettersHit.push(peg.letter)
          this.wordIndex++
          this.score += 10
          if (this.wordIndex >= this.currentWord.length) {
            this.wordDone = true
            this.score += 100
          }
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawBackground(ctx)
    this.drawBoard(ctx)
    this.drawPegs(ctx)
    this.drawBall(ctx)
    this.drawPlunger(ctx)
    this.drawHUD(ctx)
    this.drawWordPrompt(ctx)

    if (this.phase === 'launch') {
      this.drawLaunchPrompt(ctx)
    }

    if (this.phase === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#f5b041'
      ctx.font = 'bold 32px system-ui'
      ctx.fillText('Pinball Over!', this.canvasW / 2, this.canvasH / 2 - 40)
      ctx.fillStyle = '#fff'
      ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}  |  Best: ${this.highScore}`, this.canvasW / 2, this.canvasH / 2)
      ctx.fillStyle = '#8899bb'
      ctx.font = '14px system-ui'
      ctx.fillText('Click or press SPACE to play again', this.canvasW / 2, this.canvasH / 2 + 40)
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createRadialGradient(this.canvasW / 2, this.canvasH / 2, 0, this.canvasW / 2, this.canvasH / 2, this.canvasW)
    grad.addColorStop(0, '#1a0a2e')
    grad.addColorStop(0.5, '#0f0a1a')
    grad.addColorStop(1, '#050510')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
  }

  private drawBoard(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(20, 20, 50, 0.5)'
    ctx.strokeStyle = '#5dade2'
    ctx.lineWidth = 2
    const bx = this.canvasW * 0.3 - 8
    const by = this.canvasH * 0.04 - 8
    const bw = this.canvasW * 0.62 + 16
    const bh = this.canvasH * 0.91 + 16
    ctx.beginPath()
    ctx.roundRect(bx, by, bw, bh, 10)
    ctx.fill()
    ctx.stroke()
  }

  private drawPegs(ctx: CanvasRenderingContext2D): void {
    for (const peg of this.pegs) {
      const lit = peg.lit
      const alpha = lit ? 1 : 0.4
      ctx.globalAlpha = alpha
      ctx.fillStyle = lit ? '#f5b041' : '#5dade2'
      ctx.beginPath()
      ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2)
      ctx.fill()
      if (lit) {
        ctx.shadowColor = '#f5b041'
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(peg.letter, peg.x, peg.y + 1)
    }
    ctx.globalAlpha = 1
  }

  private drawBall(ctx: CanvasRenderingContext2D): void {
    for (const t of this.trails) {
      const alpha = t.life / 20
      ctx.globalAlpha = alpha * 0.3
      ctx.fillStyle = '#FF66BB'
      ctx.beginPath()
      ctx.arc(t.x, t.y, 4 * alpha, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = '#FF66BB'
    ctx.beginPath()
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#CC3388'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = '#fff'
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.arc(this.ball.x + side * 3.5, this.ball.y - 2, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.beginPath()
    ctx.arc(this.ball.x, this.ball.y + 3, 2, 0.2, Math.PI - 0.2)
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  private drawPlunger(ctx: CanvasRenderingContext2D): void {
    const px = this.canvasW * 0.1
    const py = this.canvasH * 0.3
    const pw = 30
    const ph = this.canvasH * 0.55

    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.roundRect(px - pw / 2, py, pw, ph, 4)
    ctx.fill()

    const pullBack = this.plungerPower / this.plungerMax * 40
    ctx.fillStyle = '#e74c5c'
    ctx.beginPath()
    ctx.roundRect(px - pw / 2 + 3, py + ph - 30 + pullBack, pw - 6, 26, 3)
    ctx.fill()

    ctx.fillStyle = '#FF66BB'
    ctx.beginPath()
    ctx.arc(px, this.canvasH * 0.82, BALL_RADIUS * 0.8, 0, Math.PI * 2)
    ctx.fill()

    if (this.phase === 'launch') {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(this.frame * 0.05) * 0.2})`
      ctx.font = 'bold 11px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText('PULL', px, py + ph - 35 + pullBack)
    }
  }

  private drawHUD(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, 0, this.canvasW, 32)

    ctx.textBaseline = 'middle'
    ctx.font = 'bold 13px system-ui'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#FF66BB'
    ctx.fillText('🕹️ OddBod Pinball', 10, 16)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#f5b041'
    const litCount = this.pegs.filter(p => p.lit).length
    ctx.fillText(`Lit: ${litCount}/${this.totalPegs}  Score: ${this.score}`, this.canvasW / 2, 16)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#5dade2'
    const pct = this.wordDone ? 100 : Math.floor(this.wordIndex / this.currentWord.length * 100)
    ctx.fillText(`Word: ${isNaN(pct) ? 0 : pct}%`, this.canvasW - 10, 16)
  }

  private drawWordPrompt(ctx: CanvasRenderingContext2D): void {
    const wx = this.canvasW / 2
    const wy = this.canvasH * 0.06

    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.roundRect(wx - 100, wy - 10, 200, 30, 8)
    ctx.fill()

    ctx.font = 'bold 18px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let i = 0; i < this.currentWord.length; i++) {
      const lx = wx - 40 + i * 40
      const letter = this.currentWord[i]
      const hit = i < this.wordIndex
      ctx.fillStyle = hit ? '#58d68d' : 'rgba(255,255,255,0.3)'
      ctx.fillText(letter, lx, wy + 5)
      if (!hit) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.fillText('_', lx, wy + 5)
      }
    }
  }

  private drawLaunchPrompt(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(this.frame * 0.03) * 0.15})`
    ctx.font = '14px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('Click & drag down on plunger, or press SPACE', this.canvasW / 2, this.canvasH - 10)
  }
}
