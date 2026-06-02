import { ALL_LETTERS } from '../characters/data'

interface MazePos {
  row: number
  col: number
}

interface MazeChaser {
  name: string
  color: string
  row: number
  col: number
  dir: number
  moveTimer: number
  frozen: boolean
}

const ODDBOD_CHASERS = [
  { name: 'Bubbles', color: '#FF66BB' },
  { name: 'Fuse', color: '#FF4444' },
  { name: 'Jeff', color: '#9933FF' },
  { name: 'Pogo', color: '#4488FF' },
]

const MAZE_DATA = [
  'WWWWWWWWWWWWWWWWWWWWW',
  'W...W.....W.....W...W',
  'W.W.W.WWW.W.WWW.W.W.W',
  'W.W...W...W...W...W.W',
  'W.WWWWW.WWWWWWWWW.W.W',
  'W.......W...W.......W',
  'WWWWW.W.W.W.W.WWWWWWW',
  'W.....W.W.W.W.W.....W',
  'W.WWWWW...W...WWWWW.W',
  'W.W...WWWWWWW...W...W',
  'W...W.......W...W...W',
  'WWW.WWWWW.W.WWW.WWW.W',
  'W.....W...W...W.....W',
  'W.WWW.W.WWWWW.W.WWW.W',
  'W...W.........W...W.W',
  'WWW.WWWWWWWWWWW.WWW.W',
  'W.......W...W.......W',
  'WWWWWWWWWWWWWWWWWWWWW',
]

const ROWS = MAZE_DATA.length
const COLS = MAZE_DATA[0].length

export class LetterMazeMode {
  private canvasW: number
  private canvasH: number
  private frame = 0
  private phase: 'playing' | 'gameover' = 'playing'

  private cellW = 0
  private cellH = 0
  private gridX = 0
  private gridY = 0

  private player: MazePos = { row: 0, col: 0 }
  private moveTimer = 0
  private moveCooldown = 8

  private progressIndex = 0
  private score = 0
  private letters: Map<string, MazePos> = new Map()
  private collectedLetters = new Set<string>()
  private zPills: MazePos[] = []
  private zPower = 0

  private chasers: MazeChaser[] = []
  private highScore = 0
  private message = ''
  private messageTimer = 0

  private particles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.cellW = Math.min(40, canvasW / COLS)
    this.cellH = Math.min(40, canvasH / ROWS)
    this.gridX = (canvasW - this.cellW * COLS) / 2
    this.gridY = (canvasH - this.cellH * ROWS) / 2

    this.initMaze()
    const hs = parseInt(localStorage.getItem('hs_maze') || '0', 10)
    this.highScore = hs
  }

  private initMaze(): void {
    this.letters = new Map()
    this.zPills = []

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (MAZE_DATA[r][c] === 'W') continue
        if (MAZE_DATA[r][c] === 'P') {
          this.player = { row: r, col: c }
        }
      }
    }

    let placed = 0
    for (let r = 1; r < ROWS - 1 && placed < 26; r++) {
      for (let c = 1; c < COLS - 1 && placed < 26; c++) {
        if (MAZE_DATA[r][c] !== 'W' && !(r === this.player.row && c === this.player.col)) {
          this.letters.set(ALL_LETTERS[placed], { row: r, col: c })
          placed++
        }
      }
    }

    const pillPositions = [{ row: 8, col: 10 }, { row: 4, col: 4 }, { row: 13, col: 16 }]
    for (const pp of pillPositions) {
      if (MAZE_DATA[pp.row][pp.col] !== 'W') this.zPills.push(pp)
    }

    this.chasers = ODDBOD_CHASERS.map((ch, i) => ({
      name: ch.name,
      color: ch.color,
      row: 1 + i * 5,
      col: 1 + i * 5,
      dir: 0,
      moveTimer: 20 + i * 10,
      frozen: false,
    }))

    this.progressIndex = 0
    this.collectedLetters = new Set()
    this.zPower = 0
  }

  handleClick(cx: number, cy: number): void {
    if (this.phase === 'gameover') {
      this.restart()
      return
    }
    const relX = cx - this.gridX
    const relY = cy - this.gridY
    const col = Math.floor(relX / this.cellW)
    const row = Math.floor(relY / this.cellH)

    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return

    const dr = row - this.player.row
    const dc = col - this.player.col
    if (Math.abs(dr) > Math.abs(dc)) {
      this.tryMove(dr > 0 ? 2 : 0)
    } else if (Math.abs(dc) > 0) {
      this.tryMove(dc > 0 ? 1 : 3)
    }
  }

  handleKey(key: string): void {
    if (this.phase === 'gameover') {
      if (key === ' ') this.restart()
      return
    }

    switch (key) {
      case 'w': this.tryMove(0); break
      case 'd': this.tryMove(1); break
      case 's': this.tryMove(2); break
      case 'a': this.tryMove(3); break
    }
  }

  private tryMove(dir: number): void {
    if (this.moveTimer > 0) return
    const dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]]
    const nr = this.player.row + dirs[dir][0]
    const nc = this.player.col + dirs[dir][1]

    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return
    if (MAZE_DATA[nr][nc] === 'W') return

    this.player.row = nr
    this.player.col = nc
    this.moveTimer = this.moveCooldown

    const targetLetter = ALL_LETTERS[this.progressIndex]
    if (this.progressIndex < 26 && this.letters.has(targetLetter)) {
      const pos = this.letters.get(targetLetter)!
      if (pos.row === nr && pos.col === nc) {
        this.collectedLetters.add(targetLetter)
        this.score += 10
        this.progressIndex++
        this.message = `Found ${targetLetter}!`
        this.messageTimer = 30
        for (let i = 0; i < 8; i++) {
          const a = Math.random() * Math.PI * 2
          const s = 1 + Math.random() * 3
          this.particles.push({
            x: this.gridX + nc * this.cellW + this.cellW / 2,
            y: this.gridY + nr * this.cellH + this.cellH / 2,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            color: '#58d68d', life: 0, maxLife: 20,
          })
        }
        this.onStateChange?.({ score: this.score, progress: this.progressIndex })

        if (this.progressIndex >= 26) {
          this.phase = 'gameover'
          if (this.score > this.highScore) {
            this.highScore = this.score
            localStorage.setItem('hs_maze', String(this.score))
          }
          this.onStateChange?.({ score: this.score })
          return
        }
      }
    }

    const pillIdx = this.zPills.findIndex(p => p.row === nr && p.col === nc)
    if (pillIdx >= 0) {
      this.zPills.splice(pillIdx, 1)
      this.zPower = 300
      this.message = '⚡ Z-ENERGY! Chase them!'
      this.messageTimer = 60
      for (const ch of this.chasers) ch.frozen = true
      for (let i = 0; i < 15; i++) {
        const a = Math.random() * Math.PI * 2
        const s = 2 + Math.random() * 4
        this.particles.push({
          x: this.gridX + nc * this.cellW + this.cellW / 2,
          y: this.gridY + nr * this.cellH + this.cellH / 2,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          color: '#f5b041', life: 0, maxLife: 30,
        })
      }
    }
  }

  restart(): void {
    this.frame = 0
    this.score = 0
    this.progressIndex = 0
    this.collectedLetters = new Set()
    this.zPower = 0
    this.particles = []
    this.message = ''
    this.messageTimer = 0
    this.moveTimer = 0
    this.phase = 'playing'
    this.initMaze()
  }

  update(): void {
    this.frame++
    if (this.phase !== 'playing') return

    if (this.moveTimer > 0) this.moveTimer--
    if (this.messageTimer > 0) this.messageTimer--

    if (this.zPower > 0) {
      this.zPower--
      if (this.zPower <= 0) {
        for (const ch of this.chasers) ch.frozen = false
      }
    }

    const dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]]

    for (const ch of this.chasers) {
      if (ch.frozen) continue
      ch.moveTimer--
      if (ch.moveTimer > 0) continue
      ch.moveTimer = 12 + Math.floor(Math.random() * 8)

      const sameRow = ch.row === this.player.row
      const sameCol = ch.col === this.player.col

      if (sameRow || sameCol) {
        let canSee = true
        if (sameRow) {
          const minC = Math.min(ch.col, this.player.col)
          const maxC = Math.max(ch.col, this.player.col)
          for (let c = minC + 1; c < maxC; c++) {
            if (MAZE_DATA[ch.row][c] === 'W') { canSee = false; break }
          }
          if (canSee) {
            ch.col += ch.col < this.player.col ? 1 : -1
            if (MAZE_DATA[ch.row][ch.col] === 'W') ch.col += ch.col < this.player.col ? -1 : 1
          }
        } else {
          const minR = Math.min(ch.row, this.player.row)
          const maxR = Math.max(ch.row, this.player.row)
          for (let r = minR + 1; r < maxR; r++) {
            if (MAZE_DATA[r][ch.col] === 'W') { canSee = false; break }
          }
          if (canSee) {
            ch.row += ch.row < this.player.row ? 1 : -1
            if (MAZE_DATA[ch.row][ch.col] === 'W') ch.row += ch.row < this.player.row ? -1 : 1
          }
        }
        if (canSee) continue
      }

      const d = Math.floor(Math.random() * 4)
      const nr = ch.row + dirs[d][0]
      const nc = ch.col + dirs[d][1]
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && MAZE_DATA[nr][nc] !== 'W') {
        ch.row = nr
        ch.col = nc
      }
    }

    for (const ch of this.chasers) {
      if (ch.row === this.player.row && ch.col === this.player.col) {
        if (this.zPower > 0) {
          ch.frozen = true
          ch.row = 1
          ch.col = 1
          this.score += 25
          this.message = `${ch.name} defeated! +25`
          this.messageTimer = 40
          for (let i = 0; i < 10; i++) {
            const a = Math.random() * Math.PI * 2
            const s = 1 + Math.random() * 3
            this.particles.push({
              x: this.gridX + ch.col * this.cellW + this.cellW / 2,
              y: this.gridY + ch.row * this.cellH + this.cellH / 2,
              vx: Math.cos(a) * s, vy: Math.sin(a) * s,
              color: ch.color, life: 0, maxLife: 20,
            })
          }
        } else {
          this.phase = 'gameover'
          if (this.score > this.highScore) {
            this.highScore = this.score
            localStorage.setItem('hs_maze', String(this.score))
          }
          this.onStateChange?.({ score: this.score })
          return
        }
      }
    }

    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life++
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawBackground(ctx)
    this.drawMaze(ctx)
    this.drawLetters(ctx)
    this.drawZPills(ctx)
    this.drawChasers(ctx)
    this.drawPlayer(ctx)
    this.drawParticles(ctx)
    this.drawHUD(ctx)

    if (this.messageTimer > 0) {
      ctx.fillStyle = '#f5b041'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.message, this.canvasW / 2, this.canvasH * 0.06)
    }

    if (this.zPower > 0) {
      ctx.fillStyle = `rgba(245,176,65,${0.1 + Math.sin(this.frame * 0.1) * 0.05})`
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#f5b041'
      ctx.font = 'bold 13px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(`⚡ Z-ENERGY ${Math.floor(this.zPower / 10)}s`, this.canvasW / 2, 54)
    }

    if (this.phase === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (this.progressIndex >= 26) {
        ctx.fillStyle = '#58d68d'
        ctx.font = 'bold 32px system-ui'
        ctx.fillText('🏆 Maze Master!', this.canvasW / 2, this.canvasH / 2 - 50)
        ctx.fillStyle = '#fff'
        ctx.font = '18px system-ui'
        ctx.fillText('All 26 letters collected!', this.canvasW / 2, this.canvasH / 2)
      } else {
        ctx.fillStyle = '#e74c5c'
        ctx.font = 'bold 32px system-ui'
        ctx.fillText('💀 Caught!', this.canvasW / 2, this.canvasH / 2 - 50)
        ctx.fillStyle = '#fff'
        ctx.font = '18px system-ui'
        ctx.fillText('An OddBod got you!', this.canvasW / 2, this.canvasH / 2)
      }

      ctx.fillStyle = '#f5b041'
      ctx.font = '20px system-ui'
      ctx.fillText(`Letters: ${this.progressIndex}/26  Score: ${this.score}  Best: ${this.highScore}`, this.canvasW / 2, this.canvasH / 2 + 40)
      ctx.fillStyle = '#8899bb'
      ctx.font = '14px system-ui'
      ctx.fillText('Click or press SPACE to play again', this.canvasW / 2, this.canvasH / 2 + 80)
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#0a0a1a')
    grad.addColorStop(1, '#1a0a2e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
  }

  private drawMaze(ctx: CanvasRenderingContext2D): void {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = this.gridX + c * this.cellW
        const y = this.gridY + r * this.cellH
        if (MAZE_DATA[r][c] === 'W') {
          ctx.fillStyle = '#1a1a3a'
          ctx.fillRect(x, y, this.cellW, this.cellH)
          ctx.strokeStyle = '#2a2a5a'
          ctx.lineWidth = 1
          ctx.strokeRect(x, y, this.cellW, this.cellH)
        } else {
          ctx.fillStyle = 'rgba(10,10,30,0.3)'
          ctx.fillRect(x, y, this.cellW, this.cellH)
          ctx.fillStyle = 'rgba(255,255,255,0.03)'
          ctx.beginPath()
          ctx.arc(x + this.cellW / 2, y + this.cellH / 2, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  private drawLetters(ctx: CanvasRenderingContext2D): void {
    if (this.progressIndex >= 26) return
    const targetLetter = ALL_LETTERS[this.progressIndex]
    const pos = this.letters.get(targetLetter)
    if (!pos) return
    const x = this.gridX + pos.col * this.cellW + this.cellW / 2
    const y = this.gridY + pos.row * this.cellH + this.cellH / 2
    const pulse = Math.sin(this.frame * 0.06) * 2

    ctx.fillStyle = '#f5b041'
    ctx.beginPath()
    ctx.arc(x, y + pulse, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowColor = '#f5b041'
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.arc(x, y + pulse, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 11px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(targetLetter, x, y + pulse + 1)
  }

  private drawZPills(ctx: CanvasRenderingContext2D): void {
    for (const p of this.zPills) {
      const x = this.gridX + p.col * this.cellW + this.cellW / 2
      const y = this.gridY + p.row * this.cellH + this.cellH / 2
      const pulse = Math.sin(this.frame * 0.08) * 3

      ctx.fillStyle = '#f5b041'
      ctx.beginPath()
      ctx.arc(x, y + pulse, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 9px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Z', x, y + pulse + 1)
    }
  }

  private drawChasers(ctx: CanvasRenderingContext2D): void {
    for (const ch of this.chasers) {
      const x = this.gridX + ch.col * this.cellW + this.cellW / 2
      const y = this.gridY + ch.row * this.cellH + this.cellH / 2
      const bounce = Math.sin(this.frame * 0.1 + this.chasers.indexOf(ch)) * 2

      ctx.globalAlpha = ch.frozen ? 0.3 : 1
      ctx.fillStyle = ch.color
      ctx.beginPath()
      ctx.arc(x, y + bounce, 12, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#fff'
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(x + side * 4, y + bounce - 2, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = '#222'
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(x + side * 4 + 1, y + bounce - 1, 1.2, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 7px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(ch.name, x, y + bounce + 14)
      ctx.globalAlpha = 1
    }
  }

  private drawPlayer(ctx: CanvasRenderingContext2D): void {
    const x = this.gridX + this.player.col * this.cellW + this.cellW / 2
    const y = this.gridY + this.player.row * this.cellH + this.cellH / 2

    ctx.fillStyle = '#58d68d'
    ctx.beginPath()
    ctx.arc(x, y, 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#2ecc71'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, 14, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = '#fff'
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.arc(x + side * 4, y - 2, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#222'
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.arc(x + side * 4 + 1, y - 1, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 9px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(ALL_LETTERS[Math.min(this.progressIndex, 25)], x, y - 16)
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
    ctx.fillText('🔤 Letter Maze', 10, 16)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#f5b041'
    const next = this.progressIndex < 26 ? ALL_LETTERS[this.progressIndex] : '✓'
    ctx.fillText(`Find: ${next}  |  ${this.progressIndex}/26`, this.canvasW / 2, 16)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#5dade2'
    ctx.fillText(`Score: ${this.score}`, this.canvasW - 10, 16)
  }
}
