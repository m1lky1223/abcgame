import { ALL_LETTERS, CHARACTERS } from '../characters/data'
import { drawCharacter } from '../characters/draw'

interface BoothDef {
  id: number
  name: string
  oddbod: string
  icon: string
  description: string
}

interface CarnivalState {
  currentBooth: number
  tickets: number
  unlockedBooths: number
  score: number
  winner: boolean
}

interface Balloon {
  x: number; y: number; letter: string
  alive: boolean; speed: number; wobble: number
}

interface FallingCandy {
  x: number; y: number; letter: string
  alive: boolean; speed: number
}

interface MemoryCard {
  x: number; y: number; letter: string
  flipped: boolean; matched: boolean
  w: number; h: number
}

interface DisguisedLetter {
  x: number; y: number; letter: string
  disguise: string; popped: boolean; correct: boolean
}

const BOOTHS: BoothDef[] = [
  { id: 1, name: 'Balloon Pop', oddbod: 'Bubbles', icon: '🎈', description: 'Pop balloons with matching letters!' },
  { id: 2, name: 'Fire Ring', oddbod: 'Fuse', icon: '🔥', description: 'Quick! Pop the letter before the ring closes!' },
  { id: 3, name: 'Sorting Maze', oddbod: 'Jeff', icon: '🧩', description: 'Guide letters to the right exit!' },
  { id: 4, name: 'Candy Catch', oddbod: 'Newt', icon: '🍬', description: 'Catch the right letter candies!' },
  { id: 5, name: 'Prank Pop', oddbod: 'Pogo', icon: '🤡', description: 'Find the letter behind the disguise!' },
  { id: 6, name: 'Dance Sequence', oddbod: 'Slick', icon: '💃', description: 'Repeat the letter dance pattern!' },
  { id: 7, name: 'Naptime Match', oddbod: 'Zee', icon: '😴', description: 'Match the letter pairs!' },
]

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export class CarnivalMode {
  private canvasW: number
  private canvasH: number
  private state: CarnivalState
  private frame = 0
  private particles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []
  private boothTimer = 0
  private boothPhase = ''
  private boothScore = 0
  private boothTarget = ''
  private boothLetters: string[] = []
  private messageText = ''
  private messageTimer = 0

  private balloons: Balloon[] = []
  private fireLetters: { letter: string; x: number; y: number; alive: boolean }[] = []
  private fireRingProgress = 0
  private candies: FallingCandy[] = []
  private basketX = 0
  private mazeLetters: { letter: string; x: number; y: number; targetX: number; targetY: number; done: boolean }[] = []
  private disguisedLetters: DisguisedLetter[] = []
  private danceSequence: string[] = []
  private danceIndex = 0
  private memoryCards: MemoryCard[] = []
  private selectedCards: number[] = []
  private memoryMatched = 0
  private memoryPairs = 0
  onStateChange?: (state: { score: number; tickets: number; currentBooth: number; winner: boolean }) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.state = { currentBooth: 0, tickets: 0, unlockedBooths: 1, score: 0, winner: false }
    this.basketX = canvasW / 2
    this.startBooth(1)
  }

  private startBooth(boothId: number): void {
    this.state.currentBooth = boothId
    this.boothTimer = 0
    this.boothPhase = 'playing'
    this.boothScore = 0
    this.boothLetters = []
    this.messageText = ''
    this.messageTimer = 0
    this.balloons = []
    this.fireLetters = []
    this.fireRingProgress = 0
    this.candies = []
    this.disguisedLetters = []
    this.danceSequence = []
    this.danceIndex = 0
    this.memoryCards = []
    this.selectedCards = []
    this.memoryMatched = 0
    this.mazeLetters = []
    switch (boothId) {
      case 1: this.initBalloonPop(); break
      case 2: this.initFireRing(); break
      case 3: this.initSortingMaze(); break
      case 4: this.initCandyCatch(); break
      case 5: this.initPrankPop(); break
      case 6: this.initDanceSequence(); break
      case 7: this.initMemoryMatch(); break
    }
  }

  private initBalloonPop(): void {
    this.boothTarget = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
    const letters = [this.boothTarget]
    const pool = ALL_LETTERS.filter(l => l !== this.boothTarget)
    while (letters.length < 5) {
      const pick = pool[Math.floor(Math.random() * pool.length)]
      if (!letters.includes(pick)) letters.push(pick)
    }
    this.boothLetters = shuffleArray(letters)
    this.balloons = this.boothLetters.map((l, i) => ({
      x: 60 + i * (this.canvasW / this.boothLetters.length),
      y: this.canvasH + 20 + i * 30,
      letter: l,
      alive: true,
      speed: 0.4 + Math.random() * 0.3,
      wobble: Math.random() * Math.PI * 2,
    }))
  }

  private initFireRing(): void {
    this.boothTarget = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
    this.fireRingProgress = 0
    this.fireLetters = [
      { letter: this.boothTarget, x: this.canvasW / 2, y: this.canvasH / 2, alive: true },
    ]
  }

  private initSortingMaze(): void {
    const letters = shuffleArray(ALL_LETTERS).slice(0, 4)
    this.mazeLetters = letters.map((l, i) => ({
      letter: l,
      x: 40 + Math.random() * (this.canvasW - 80),
      y: this.canvasH * 0.15 + Math.random() * (this.canvasH * 0.3),
      targetX: 40 + i * (this.canvasW / 4),
      targetY: this.canvasH * 0.7,
      done: false,
    }))
  }

  private initCandyCatch(): void {
    this.boothTarget = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
    this.basketX = this.canvasW / 2
    this.candies = []
  }

  private initPrankPop(): void {
    const letters = shuffleArray(ALL_LETTERS).slice(0, 6)
    const disguises = ['🎩', '🕶️', '🧢', '👑', '🎭', '🧦']
    this.boothTarget = letters[Math.floor(Math.random() * letters.length)]
    this.disguisedLetters = shuffleArray(letters).map((l, i) => ({
      x: 80 + i * ((this.canvasW - 160) / 5),
      y: this.canvasH * 0.35,
      letter: l,
      disguise: disguises[i % disguises.length],
      popped: false,
      correct: l === this.boothTarget,
    }))
  }

  private initDanceSequence(): void {
    this.danceSequence = []
    this.danceIndex = 0
    const len = 4 + Math.floor(Math.random() * 3)
    for (let i = 0; i < len; i++) {
      this.danceSequence.push(ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)])
    }
    this.boothLetters = this.danceSequence
  }

  private initMemoryMatch(): void {
    this.memoryMatched = 0
    this.selectedCards = []
    const pairLetters = shuffleArray(ALL_LETTERS).slice(0, 6)
    this.memoryPairs = pairLetters.length
    const cards: MemoryCard[] = []
    for (const l of pairLetters) {
      cards.push({ letter: l, flipped: false, matched: false, x: 0, y: 0, w: 50, h: 60 })
      cards.push({ letter: l, flipped: false, matched: false, x: 0, y: 0, w: 50, h: 60 })
    }
    const shuffled = shuffleArray(cards)
    const cols = 4
    const rows = Math.ceil(shuffled.length / cols)
    const totalW = cols * 55
    const startX = (this.canvasW - totalW) / 2
    const startY = (this.canvasH - rows * 68) / 2
    shuffled.forEach((card, i) => {
      card.x = startX + (i % cols) * 55
      card.y = startY + Math.floor(i / cols) * 68
    })
    this.memoryCards = shuffled
  }

  handleClick(cx: number, cy: number): void {
    if (this.state.winner || this.boothPhase === 'transition') return

    switch (this.state.currentBooth) {
      case 1: this.handleBalloonClick(cx, cy); break
      case 2: this.handleFireClick(cx, cy); break
      case 3: this.handleMazeClick(cx, cy); break
      case 4: this.handleCandyClick(cx, cy); break
      case 5: this.handlePrankClick(cx, cy); break
      case 6: this.handleDanceClick(cx, cy); break
      case 7: this.handleMemoryClick(cx, cy); break
    }
  }

  handleKey(key: string): void {
    if (this.state.winner || this.boothPhase === 'transition') return
    if (this.state.currentBooth === 6) {
      const upper = key.toUpperCase()
      if (this.danceIndex < this.danceSequence.length && upper === this.danceSequence[this.danceIndex]) {
        this.danceIndex++
        this.state.score += 2
        this.onStateChange?.({
          score: this.state.score, tickets: this.state.tickets,
          currentBooth: this.state.currentBooth, winner: this.state.winner,
        })
        if (this.danceIndex >= this.danceSequence.length) {
          this.boothComplete(2)
        }
      } else {
        this.danceIndex = 0
        this.boothScore = Math.max(0, this.boothScore - 1)
      }
    }
  }

  private handleBalloonClick(cx: number, cy: number): void {
    for (const b of this.balloons) {
      if (!b.alive) continue
      const dx = cx - b.x
      const dy = cy - b.y
      if (dx * dx + dy * dy < 30 * 30) {
        b.alive = false
        if (b.letter === this.boothTarget) {
          this.spawnParticles(b.x, b.y, '#58d68d')
          this.boothScore += 5
          this.boothTarget = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
          this.boothLetters = shuffleArray(ALL_LETTERS).slice(0, 5)
          if (!this.boothLetters.includes(this.boothTarget)) this.boothLetters[0] = this.boothTarget
          this.balloons = this.boothLetters.map((l, i) => ({
            x: 60 + i * (this.canvasW / this.boothLetters.length),
            y: this.canvasH + 20,
            letter: l, alive: true, speed: 0.4 + Math.random() * 0.3, wobble: Math.random() * Math.PI * 2,
          }))
          if (this.boothScore >= 15) this.boothComplete(2)
        } else {
          this.spawnParticles(b.x, b.y, '#e74c5c')
          this.messageText = 'Wrong balloon! Try again!'
          this.messageTimer = 60
        }
        break
      }
    }
  }

  private handleFireClick(cx: number, cy: number): void {
    for (const fl of this.fireLetters) {
      if (!fl.alive) continue
      const dx = cx - fl.x
      const dy = cy - fl.y
      if (dx * dx + dy * dy < 35 * 35) {
        fl.alive = false
        this.boothScore += 5
        this.spawnParticles(fl.x, fl.y, '#f5b041')
        if (this.boothScore >= 15) {
          this.boothComplete(2)
        } else {
          this.boothTarget = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
          this.fireRingProgress = 0
          this.fireLetters = [{ letter: this.boothTarget, x: this.canvasW / 2, y: this.canvasH / 2, alive: true }]
        }
        break
      }
    }
  }

  private handleMazeClick(cx: number, cy: number): void {
    for (const ml of this.mazeLetters) {
      if (ml.done) continue
      const dx = cx - ml.x
      const dy = cy - ml.y
      if (dx * dx + dy * dy < 20 * 20) {
        ml.x += (ml.targetX - ml.x) * 0.1
        ml.y += (ml.targetY - ml.y) * 0.1
        if (Math.abs(ml.x - ml.targetX) < 5 && Math.abs(ml.y - ml.targetY) < 5) {
          ml.done = true
          this.boothScore += 5
          this.spawnParticles(ml.targetX, ml.targetY, '#5dade2')
          if (this.mazeLetters.every(m => m.done)) this.boothComplete(3)
        }
        break
      }
    }
  }

  private handleCandyClick(cx: number, cy: number): void {
    for (const c of this.candies) {
      if (!c.alive) continue
      const dx = cx - c.x
      const dy = cy - c.y
      if (dx * dx + dy * dy < 22 * 22) {
        c.alive = false
        if (c.letter === this.boothTarget) {
          this.boothScore += 5
          this.spawnParticles(c.x, c.y, '#af7ac5')
          this.boothTarget = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
          if (this.boothScore >= 15) this.boothComplete(2)
        } else {
          this.messageText = 'Wrong candy!'
          this.messageTimer = 40
        }
        break
      }
    }
  }

  private handlePrankClick(cx: number, cy: number): void {
    for (const dl of this.disguisedLetters) {
      if (dl.popped) continue
      const dx = cx - dl.x
      const dy = cy - dl.y
      if (dx * dx + dy * dy < 25 * 25) {
        dl.popped = true
        if (dl.correct) {
          this.boothScore += 10
          this.spawnParticles(dl.x, dl.y, '#f5b041')
          if (this.boothScore >= 20) this.boothComplete(3)
          else this.showMessage('Found it! +10')
        } else {
          this.boothScore = Math.max(0, this.boothScore - 2)
          this.showMessage('Not that one! -2')
        }
        break
      }
    }
  }

  private handleDanceClick(_cx: number, _cy: number): void {
  }

  private handleMemoryClick(cx: number, cy: number): void {
    if (this.selectedCards.length >= 2) return
    for (let i = 0; i < this.memoryCards.length; i++) {
      const card = this.memoryCards[i]
      if (card.matched || card.flipped) continue
      if (cx >= card.x && cx <= card.x + card.w && cy >= card.y && cy <= card.y + card.h) {
        card.flipped = true
        this.selectedCards.push(i)
        if (this.selectedCards.length === 2) {
          const first = this.memoryCards[this.selectedCards[0]]
          const second = this.memoryCards[this.selectedCards[1]]
          if (first.letter === second.letter) {
            first.matched = true
            second.matched = true
            this.memoryMatched++
            this.boothScore += 10
            this.spawnParticles((first.x + second.x) / 2 + 25, (first.y + second.y) / 2 + 30, '#58d68d')
            this.selectedCards = []
            if (this.memoryMatched >= this.memoryPairs) this.boothComplete(3)
          } else {
            setTimeout(() => {
              first.flipped = false
              second.flipped = false
              this.selectedCards = []
            }, 800)
          }
        }
        break
      }
    }
  }

  private boothComplete(stars: number): void {
    this.boothPhase = 'transition'
    this.state.tickets += stars
    this.state.score += this.boothScore
    if (this.state.currentBooth < 7) {
      if (this.state.currentBooth + 1 > this.state.unlockedBooths) {
        this.state.unlockedBooths = this.state.currentBooth + 1
      }
    } else {
      this.state.winner = true
    }
    this.onStateChange?.({
      score: this.state.score, tickets: this.state.tickets,
      currentBooth: this.state.currentBooth, winner: this.state.winner,
    })
  }

  private showMessage(text: string): void {
    this.messageText = text
    this.messageTimer = 50
  }

  private spawnParticles(x: number, y: number, color: string): void {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 3
      this.particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        color, life: 0, maxLife: 25 + Math.random() * 15,
      })
    }
  }

  update(): void {
    if (this.state.winner) return
    this.frame++

    if (this.boothPhase === 'transition') {
      this.boothTimer++
      if (this.boothTimer > 80) {
        this.boothTimer = 0
        this.boothPhase = 'playing'
        if (this.state.currentBooth < 7) {
          this.startBooth(this.state.currentBooth + 1)
        }
      }
      return
    }

    if (this.messageTimer > 0) this.messageTimer--

    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life++
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife)

    this.updateCurrentBooth()
  }

  private updateCurrentBooth(): void {
    switch (this.state.currentBooth) {
      case 1: this.updateBalloonPop(); break
      case 2: this.updateFireRing(); break
      case 3: this.updateSortingMaze(); break
      case 4: this.updateCandyCatch(); break
      case 5: break
      case 6: break
      case 7: break
    }
  }

  private updateBalloonPop(): void {
    for (const b of this.balloons) {
      if (!b.alive) continue
      b.y -= b.speed
      b.x += Math.sin(this.frame * 0.02 + b.wobble) * 0.5
      if (b.y < -40) b.y = this.canvasH + 20
    }
  }

  private updateFireRing(): void {
    this.fireRingProgress += 0.005
    if (this.fireRingProgress >= 1) {
      this.fireRingProgress = 0
      this.boothTarget = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
      this.fireLetters = [{ letter: this.boothTarget, x: this.canvasW / 2, y: this.canvasH / 2, alive: true }]
    }
  }

  private updateSortingMaze(): void {
    for (const ml of this.mazeLetters) {
      if (ml.done) continue
      const dx = ml.targetX - ml.x
      const dy = ml.targetY - ml.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 10) {
        ml.x += (dx / dist) * 0.8
        ml.y += (dy / dist) * 0.8
      }
    }
  }

  private updateCandyCatch(): void {
    if (this.frame % 45 === 0) {
      const letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
      this.candies.push({
        x: 30 + Math.random() * (this.canvasW - 60),
        y: -20,
        letter,
        alive: true,
        speed: 1 + Math.random() * 0.5,
      })
    }
    for (const c of this.candies) {
      if (!c.alive) continue
      c.y += c.speed
      if (c.y > this.canvasH + 30) c.alive = false
    }
    this.candies = this.candies.filter(c => c.alive)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1a0a2e'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    if (this.state.currentBooth === 0) {
      this.drawBoothSelect(ctx)
    } else {
      this.drawBooth(ctx)
    }

    this.drawParticles(ctx)
  }

  private drawBoothSelect(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 32px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('🎪 Oddbods Carnival!', this.canvasW / 2, 50)

    const cols = 4
    const bw = 140
    const bh = 110
    const gap = 12
    const startX = (this.canvasW - cols * bw - (cols - 1) * gap) / 2
    const startY = 90

    BOOTHS.forEach((booth, i) => {
      const bx = startX + (i % cols) * (bw + gap)
      const by = startY + Math.floor(i / cols) * (bh + gap)
      const unlocked = i < this.state.unlockedBooths

      ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'
      ctx.strokeStyle = unlocked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(bx, by, bw, bh, 8)
      ctx.fill()
      ctx.stroke()

      ctx.textAlign = 'center'
      ctx.font = '28px system-ui'
      ctx.fillText(booth.icon, bx + bw / 2, by + 35)

      if (unlocked) {
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px system-ui'
        ctx.fillText(booth.name, bx + bw / 2, by + 65)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '10px system-ui'
        ctx.fillText(booth.description.substring(0, 20) + '...', bx + bw / 2, by + 85)
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = '20px system-ui'
        ctx.fillText('🔒', bx + bw / 2, by + 65)
      }
    })
  }

  private drawBooth(ctx: CanvasRenderingContext2D): void {
    const booth = BOOTHS.find(b => b.id === this.state.currentBooth)

    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, 0, this.canvasW, 36)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px system-ui'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${booth?.icon || ''} ${booth?.name || ''} — ${booth?.oddbod || ''}`, 12, 18)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#f5b041'
    ctx.fillText(`🎟️ ${this.state.tickets}  Score: ${this.state.score}`, this.canvasW - 12, 18)

    switch (this.state.currentBooth) {
      case 1: this.drawBalloonPop(ctx); break
      case 2: this.drawFireRing(ctx); break
      case 3: this.drawSortingMaze(ctx); break
      case 4: this.drawCandyCatch(ctx); break
      case 5: this.drawPrankPop(ctx); break
      case 6: this.drawDanceSequence(ctx); break
      case 7: this.drawMemoryMatch(ctx); break
    }

    if (this.messageTimer > 0 && this.messageText) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, this.messageTimer / 20)})`
      ctx.font = 'bold 18px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(this.messageText, this.canvasW / 2, this.canvasH - 60)
    }

    if (this.boothPhase === 'transition') {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.5, this.boothTimer / 30)})`
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#58d68d'
      ctx.font = 'bold 36px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const boothName = BOOTHS.find(b => b.id === Math.min(this.state.currentBooth + 1, 7))?.name || ''
      ctx.fillText(this.state.currentBooth >= 7 ? '🎉 Carnival Complete!' : `Next: ${boothName}`, this.canvasW / 2, this.canvasH / 2)
    }
  }

  private drawBalloonPop(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = 'bold 22px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`Pop the letter: ${this.boothTarget}`, this.canvasW / 2, 60)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '14px system-ui'
    ctx.fillText(`Score: ${this.boothScore}/15`, this.canvasW / 2, 90)

    for (const b of this.balloons) {
      if (!b.alive) continue
      const wobbleX = Math.sin(this.frame * 0.03 + b.wobble) * 3
      ctx.save()
      ctx.translate(b.x + wobbleX, b.y)
      ctx.strokeStyle = 'rgba(200,200,200,0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 20)
      ctx.lineTo(0, 60)
      ctx.stroke()
      ctx.fillStyle = '#e74c5c'
      ctx.beginPath()
      ctx.ellipse(0, 0, 22, 28, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(b.letter, 0, 2)
      ctx.restore()
    }
  }

  private drawFireRing(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = 'bold 22px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`Pop: ${this.boothTarget}`, this.canvasW / 2, 60)

    const cx = this.canvasW / 2
    const cy = this.canvasH / 2
    const outerR = 120
    const innerR = outerR * this.fireRingProgress

    ctx.strokeStyle = `rgba(245,176,65,${0.6 + 0.4 * (1 - this.fireRingProgress)})`
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
    ctx.stroke()

    if (this.fireRingProgress > 0) {
      ctx.strokeStyle = `rgba(231,76,92,${this.fireRingProgress})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
      ctx.stroke()
    }

    for (const fl of this.fireLetters) {
      if (!fl.alive) continue
      const def = CHARACTERS[fl.letter]
      if (def) {
        drawCharacter(ctx, fl.letter, fl.x - 24, fl.y - 28, 1.2, 0)
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '14px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`Score: ${this.boothScore}/15`, this.canvasW / 2, this.canvasH - 40)
  }

  private drawSortingMaze(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = 'bold 18px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Guide letters to their spots!', this.canvasW / 2, 60)

    for (let i = 0; i < this.mazeLetters.length; i++) {
      const ml = this.mazeLetters[i]
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillRect(ml.targetX - 18, ml.targetY - 22, 36, 44)
      ctx.strokeStyle = ml.done ? '#58d68d' : 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.strokeRect(ml.targetX - 18, ml.targetY - 22, 36, 44)

      if (!ml.done) {
        const def = CHARACTERS[ml.letter]
        if (def) {
          drawCharacter(ctx, ml.letter, ml.x - 12, ml.y - 14, 0.6, 0)
        }
      } else {
        const def = CHARACTERS[ml.letter]
        if (def) {
          drawCharacter(ctx, ml.letter, ml.targetX - 12, ml.targetY - 14, 0.6, 0)
        }
      }
    }
  }

  private drawCandyCatch(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = 'bold 20px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`Catch: ${this.boothTarget} 🍬`, this.canvasW / 2, 50)

    for (const c of this.candies) {
      if (!c.alive) continue
      ctx.fillStyle = c.letter === this.boothTarget ? '#af7ac5' : '#e74c5c'
      ctx.beginPath()
      ctx.arc(c.x, c.y, 16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(c.letter, c.x, c.y)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.beginPath()
      ctx.arc(c.x - 5, c.y - 5, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = 'rgba(255,200,100,0.3)'
    ctx.beginPath()
    ctx.arc(this.basketX, this.canvasH - 40, 40, Math.PI, 0)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,200,100,0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(this.basketX - 40, this.canvasH - 40)
    ctx.lineTo(this.basketX - 30, this.canvasH - 10)
    ctx.lineTo(this.basketX + 30, this.canvasH - 10)
    ctx.lineTo(this.basketX + 40, this.canvasH - 40)
    ctx.stroke()
  }

  private drawPrankPop(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = 'bold 20px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Find the correct letter!', this.canvasW / 2, 55)

    for (const dl of this.disguisedLetters) {
      if (dl.popped) continue
      const bounce = Math.sin(this.frame * 0.05 + dl.x) * 4
      ctx.save()
      ctx.translate(dl.x, dl.y + bounce)
      ctx.font = '32px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(dl.disguise, 0, -10)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = '12px system-ui'
      ctx.fillText('???', 0, 20)
      ctx.restore()
    }
  }

  private drawDanceSequence(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = 'bold 22px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('💃 Dance Sequence! Type the letters!', this.canvasW / 2, 50)

    const startX = (this.canvasW - this.danceSequence.length * 50) / 2
    for (let i = 0; i < this.danceSequence.length; i++) {
      const dx = startX + i * 50
      const dy = this.canvasH / 2 - 30

      if (i < this.danceIndex) {
        ctx.fillStyle = '#58d68d'
        ctx.font = 'bold 24px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.danceSequence[i], dx + 20, dy + 20)
      } else if (i === this.danceIndex) {
        ctx.strokeStyle = '#f5b041'
        ctx.lineWidth = 3
        ctx.strokeRect(dx, dy, 40, 40)
        ctx.fillStyle = '#f5b041'
        ctx.font = 'bold 24px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('?', dx + 20, dy + 20)
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.fillRect(dx, dy, 40, 40)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = 'bold 20px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('★', dx + 20, dy + 20)
      }
    }
  }

  private drawMemoryMatch(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = 'bold 20px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('😴 Zzz... Match the letter pairs!', this.canvasW / 2, 40)

    for (const card of this.memoryCards) {
      ctx.save()
      if (card.matched) {
        ctx.globalAlpha = 0.5
      }
      if (card.flipped || card.matched) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.beginPath()
        ctx.roundRect(card.x, card.y, card.w, card.h, 6)
        ctx.fill()
        const def = CHARACTERS[card.letter]
        if (def) {
          ctx.fillStyle = def.bodyColor
          ctx.font = 'bold 22px system-ui'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(card.letter, card.x + card.w / 2, card.y + card.h / 2)
        }
      } else {
        ctx.fillStyle = '#2a1a4e'
        ctx.beginPath()
        ctx.roundRect(card.x, card.y, card.w, card.h, 6)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(card.x, card.y, card.w, card.h, 6)
        ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.font = '24px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('?', card.x + card.w / 2, card.y + card.h / 2)
      }
      ctx.restore()
    }

    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '14px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`Matched: ${this.memoryMatched}/${this.memoryPairs}`, this.canvasW / 2, this.canvasH - 30)
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

  restart(): void {
    this.state = { currentBooth: 0, tickets: 0, unlockedBooths: 1, score: 0, winner: false }
    this.frame = 0
    this.particles = []
    this.boothTimer = 0
    this.boothPhase = 'playing'
    this.boothScore = 0
    this.balloons = []
    this.candies = []
    this.memoryCards = []
    this.startBooth(1)
  }
}
