import { ALL_LETTERS } from '../characters/data'

interface SuikaBall {
  letter: string
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  merged: boolean
}

const LETTER_RADII: Record<string, number> = {}
ALL_LETTERS.forEach((l, i) => { LETTER_RADII[l] = 10 + i * 2.5 })

const LETTER_ORDER: Record<string, number> = {}
ALL_LETTERS.forEach((l, i) => { LETTER_ORDER[l] = i })

const COLORS = ['#e74c5c', '#e67e22', '#f5b041', '#2ecc71', '#5dade2', '#9b59b6', '#1abc9c', '#e74c5c', '#3498db', '#58d68d', '#af7ac5', '#16a085', '#e74c5c', '#d35400', '#f39c12', '#27ae60', '#2980b9', '#8e44ad', '#e74c5c', '#c0392b', '#e67e22', '#f1c40f', '#2ecc71', '#5dade2', '#9b59b6', '#1abc9c']

export class SuikaMode {
  private canvasW: number
  private canvasH: number
  private frame = 0
  private phase: 'playing' | 'gameover' = 'playing'
  private balls: SuikaBall[] = []
  private nextLetter = 'A'
  private previewX = 0
  private score = 0
  private maxLetterIndex = 0
  private highScore = 0
  private dropTimer = 0
  private canDrop = true
  private gravity = 0.15
  private containerLeft = 0
  private containerRight = 0
  private containerTop = 0
  private containerBottom = 0
  private overflowLine = 0
  private overflowed = false

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    const margin = canvasW * 0.08
    this.containerLeft = margin
    this.containerRight = canvasW - margin
    this.containerTop = canvasH * 0.12
    this.containerBottom = canvasH * 0.92
    this.overflowLine = this.containerTop + 50
    this.previewX = canvasW / 2
    const hs = parseInt(localStorage.getItem('hs_suika') || '0', 10)
    this.highScore = hs
    this.nextLetter = ALL_LETTERS[Math.floor(Math.random() * 8)]
  }

  handleClick(cx: number, _cy: number): void {
    if (this.phase === 'gameover') {
      this.restart()
      return
    }
    if (!this.canDrop) return
    const r = LETTER_RADII[this.nextLetter]
    const ball: SuikaBall = {
      letter: this.nextLetter,
      x: cx,
      y: this.containerTop + 20,
      vx: 0,
      vy: 1,
      radius: r,
      merged: false,
    }
    if (ball.x - r < this.containerLeft) ball.x = this.containerLeft + r
    if (ball.x + r > this.containerRight) ball.x = this.containerRight - r

    this.balls.push(ball)
    this.canDrop = false
    this.dropTimer = 20

    const idx = Math.floor(Math.random() * Math.min(12, this.maxLetterIndex + 4))
    this.nextLetter = ALL_LETTERS[Math.min(idx, 25)]
  }

  handleKey(key: string): void {
    if (this.phase === 'gameover') {
      if (key === ' ') this.restart()
      return
    }
  }

  restart(): void {
    this.balls = []
    this.phase = 'playing'
    this.score = 0
    this.maxLetterIndex = 0
    this.canDrop = true
    this.dropTimer = 0
    this.overflowed = false
    this.nextLetter = ALL_LETTERS[Math.floor(Math.random() * 8)]
    this.frame = 0
  }

  update(): void {
    this.frame++

    if (this.phase === 'gameover') return

    if (!this.canDrop) {
      this.dropTimer--
      if (this.dropTimer <= 0) this.canDrop = true
    }

    for (const ball of this.balls) {
      if (ball.merged) continue
      ball.vy += this.gravity
      ball.x += ball.vx
      ball.y += ball.vy
      ball.vx *= 0.99
      ball.vy *= 0.99

      if (ball.x - ball.radius < this.containerLeft) {
        ball.x = this.containerLeft + ball.radius
        ball.vx *= -0.4
      }
      if (ball.x + ball.radius > this.containerRight) {
        ball.x = this.containerRight - ball.radius
        ball.vx *= -0.4
      }
      if (ball.y + ball.radius > this.containerBottom) {
        ball.y = this.containerBottom - ball.radius
        ball.vy *= -0.3
        if (Math.abs(ball.vy) < 0.5) ball.vy = 0
      }
      if (ball.y - ball.radius < this.containerTop) {
        ball.y = this.containerTop + ball.radius
        ball.vy *= -0.3
      }
    }

    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const a = this.balls[i]
        const b = this.balls[j]
        if (a.merged || b.merged) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minDist = a.radius + b.radius
        if (dist < minDist && dist > 0.01) {
          const overlap = (minDist - dist) / 2
          const nx = dx / dist
          const ny = dy / dist
          a.x -= nx * overlap
          a.y -= ny * overlap
          b.x += nx * overlap
          b.y += ny * overlap
          const relVx = a.vx - b.vx
          const relVy = a.vy - b.vy
          const relVn = relVx * nx + relVy * ny
          if (relVn > 0) {
            a.vx -= relVn * nx * 0.5
            a.vy -= relVn * ny * 0.5
            b.vx += relVn * nx * 0.5
            b.vy += relVn * ny * 0.5
          }

          if (a.letter === b.letter) {
            const ai = LETTER_ORDER[a.letter]
            if (ai < 25) {
              a.merged = true
              b.merged = true
              const newLetter = ALL_LETTERS[ai + 1]
              const nr = LETTER_RADII[newLetter]
              const mx = (a.x + b.x) / 2
              const my = (a.y + b.y) / 2
              this.balls.push({
                letter: newLetter,
                x: mx,
                y: my,
                vx: (a.vx + b.vx) * 0.3,
                vy: -2,
                radius: nr,
                merged: false,
              })
              this.score += (ai + 1) * 10
              if (ai + 1 > this.maxLetterIndex) this.maxLetterIndex = ai + 1
              if (ai + 1 >= 25) {
                this.phase = 'gameover'
                if (this.score > this.highScore) {
                  this.highScore = this.score
                  localStorage.setItem('hs_suika', String(this.score))
                }
                return
              }
            }
          }
        }
      }
    }

    this.balls = this.balls.filter(b => !b.merged)

    for (const ball of this.balls) {
      if (ball.y - ball.radius < this.overflowLine) {
        this.overflowed = true
        this.phase = 'gameover'
        if (this.score > this.highScore) {
          this.highScore = this.score
          localStorage.setItem('hs_suika', String(this.score))
        }
        return
      }
    }

    this.onStateChange?.({ score: this.score, next: this.nextLetter })
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawBackground(ctx)

    ctx.fillStyle = 'rgba(40, 40, 80, 0.4)'
    ctx.strokeStyle = 'rgba(150, 150, 255, 0.5)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(this.containerLeft - 4, this.containerTop - 4, this.containerRight - this.containerLeft + 8, this.containerBottom - this.containerTop + 8, 8)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = 'rgba(30, 30, 60, 0.6)'
    ctx.fillRect(this.containerLeft, this.containerTop, this.containerRight - this.containerLeft, this.containerBottom - this.containerTop)

    if (this.overflowed) {
      ctx.strokeStyle = '#e74c5c'
      ctx.lineWidth = 3
      ctx.setLineDash([8, 8])
      ctx.beginPath()
      ctx.moveTo(this.containerLeft, this.overflowLine)
      ctx.lineTo(this.containerRight, this.overflowLine)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#e74c5c'
      ctx.font = 'bold 12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('⚠ OVERFLOW LINE', (this.containerLeft + this.containerRight) / 2, this.overflowLine - 6)
    }

    for (const ball of this.balls) {
      if (ball.merged) continue
      const ci = LETTER_ORDER[ball.letter]
      const color = COLORS[ci % COLORS.length]
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#fff'
      ctx.font = `bold ${Math.max(10, ball.radius * 0.8)}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(ball.letter, ball.x, ball.y + 1)
    }

    if (this.canDrop && this.phase === 'playing') {
      const r = LETTER_RADII[this.nextLetter]
      const ci = LETTER_ORDER[this.nextLetter]
      ctx.globalAlpha = 0.5
      ctx.fillStyle = COLORS[ci % COLORS.length]
      ctx.beginPath()
      ctx.arc(this.previewX, this.containerTop + 20, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(this.previewX, this.containerTop + 20, r + 3, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${Math.max(10, r * 0.8)}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.nextLetter, this.previewX, this.containerTop + 21)
    }

    this.drawHUD(ctx)

    if (this.phase === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (this.maxLetterIndex >= 25) {
        ctx.fillStyle = '#f5b041'
        ctx.font = 'bold 36px system-ui'
        ctx.fillText('🎉 Z Merger!', this.canvasW / 2, this.canvasH / 2 - 50)
        ctx.fillStyle = '#fff'
        ctx.font = '18px system-ui'
        ctx.fillText('You merged all the way to Z!', this.canvasW / 2, this.canvasH / 2)
      } else {
        ctx.fillStyle = '#e74c5c'
        ctx.font = 'bold 32px system-ui'
        ctx.fillText('💥 Overflow!', this.canvasW / 2, this.canvasH / 2 - 50)
        ctx.fillStyle = '#fff'
        ctx.font = '18px system-ui'
        ctx.fillText('The jar overflowed!', this.canvasW / 2, this.canvasH / 2)
      }

      ctx.fillStyle = '#f5b041'
      ctx.font = '20px system-ui'
      ctx.fillText(`Score: ${this.score}  |  Best: ${this.highScore}`, this.canvasW / 2, this.canvasH / 2 + 40)
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '14px system-ui'
      ctx.fillText('Best letter: ' + ALL_LETTERS[Math.min(this.maxLetterIndex, 25)], this.canvasW / 2, this.canvasH / 2 + 70)
      ctx.fillStyle = '#8899bb'
      ctx.font = '14px system-ui'
      ctx.fillText('Click or press SPACE to play again', this.canvasW / 2, this.canvasH / 2 + 110)
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a1a2e')
    grad.addColorStop(0.5, '#16213e')
    grad.addColorStop(1, '#0f0f1a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    for (let i = 0; i < 20; i++) {
      const sx = Math.random() * this.canvasW
      const sy = Math.random() * this.canvasH
      const sr = 0.5 + Math.random() * 1.5
      ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.1})`
      ctx.beginPath()
      ctx.arc(sx, sy, sr, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawHUD(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, 0, this.canvasW, 36)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px system-ui'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#5dade2'
    ctx.fillText('🍉 Suika Merge', 12, 18)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#f5b041'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, 18)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#58d68d'
    ctx.fillText(`Next: ${this.nextLetter}`, this.canvasW - 12, 18)
  }
}
