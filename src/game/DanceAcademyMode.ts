import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

interface DanceZombie {
  name: string
  letter: string
  dance: string
  color: string
  outline: string
  learned: string[]
  x: number
  y: number
  phase: number
}

interface DanceState {
  currentZombie: number
  currentLetter: number
  score: number
  stars: number
  totalRounds: number
  winner: boolean
}

const ZOMBIE_DANCERS = [
  { name: 'Classic', dance: 'The Twist', color: '#5B8C5A', outline: '#3D6B3C' },
  { name: 'Decayed', dance: 'The Robot', color: '#7A8A6E', outline: '#5A6A4E' },
  { name: 'Toxic', dance: 'The Worm', color: '#4F8A5E', outline: '#2F6A3E' },
  { name: 'Undead', dance: 'Moonwalk', color: '#8A7A6E', outline: '#6A5A4E' },
  { name: 'Rotten', dance: 'The Floss', color: '#6A7A5E', outline: '#4A5A3E' },
  { name: 'Ghoul', dance: 'Monster Mash', color: '#5A7A6E', outline: '#3A5A4E' },
  { name: 'Mutant', dance: 'Breakdance', color: '#7A6A5E', outline: '#5A4A3E' },
]

const JUDGES = [
  { name: 'Slick', emoji: '😎', line: 'Excellent form!' },
  { name: 'Pogo', emoji: '🤡', line: 'Haha! +Bonus!' },
  { name: 'Bubbles', emoji: '🔬', line: 'Scientific perfection!' },
  { name: 'Newt', emoji: '🥰', line: 'Beautiful moves!' },
  { name: 'Fuse', emoji: '🔥', line: 'Feel the beat!' },
  { name: 'Jeff', emoji: '📋', line: 'Letter accuracy: A+' },
  { name: 'Zee', emoji: '😴', line: '*claps once*' },
]

const WORDS_POOL = [
  { word: 'JUMP', emoji: '🦘' }, { word: 'DANCE', emoji: '💃' }, { word: 'BEAT', emoji: '🥁' },
  { word: 'MOVE', emoji: '🏃' }, { word: 'SPIN', emoji: '🌀' }, { word: 'STEP', emoji: '🦶' },
  { word: 'RHYTHM', emoji: '🎵' }, { word: 'GROOVE', emoji: '🎶' }, { word: 'TWIST', emoji: '🔄' },
  { word: 'SHAKE', emoji: '🤝' }, { word: 'BOOGIE', emoji: '🕺' }, { word: 'SWING', emoji: '⛓️' },
  { word: 'SLIDE', emoji: '🛝' }, { word: 'STOMP', emoji: '🦶' }, { word: 'BOUNCE', emoji: '🤸' },
  { word: 'FLIP', emoji: '🤸' }, { word: 'JAZZ', emoji: '🎷' }, { word: 'TAP', emoji: '👞' },
  { word: 'WALTZ', emoji: '💃' }, { word: 'SALSA', emoji: '🌶️' }, { word: 'HIP', emoji: '🦵' },
  { word: 'POP', emoji: '🫧' }, { word: 'LOCK', emoji: '🔒' }, { word: 'BREAK', emoji: '💥' },
  { word: 'WAVE', emoji: '🌊' }, { word: 'ROCK', emoji: '🪨' }, { word: 'ROLL', emoji: '🥖' },
  { word: 'BOUNCE', emoji: '🤹' },
]

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export class DanceAcademyMode {
  private canvasW: number
  private canvasH: number
  private state: DanceState
  private frame = 0
  private dancers: DanceZombie[] = []
  private floatingLetters: FloatingLetter[] = []
  private particles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []
  private musicNotes: { x: number; y: number; vx: number; vy: number; life: number }[] = []
  private currentWord: string = ''
  private currentEmoji: string = ''
  private blankIndex = 0
  private correctFlash = 0
  private wrongFlash = 0
  private judgeIndex = 0
  private judgeTimer = 0
  private showJudge = false
  private transition = 0
  private discoPhase = 0
  private finalDanceTimer = 0
  private message = ''
  private messageTimer = 0

  onStateChange?: (state: { score: number; stars: number; currentZombie: number; totalRounds: number; winner: boolean }) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.state = { currentZombie: 0, currentLetter: 0, score: 0, stars: 0, totalRounds: 28, winner: false }
    this.initDancers()
    this.startRound()
  }

  private initDancers(): void {
    this.dancers = ZOMBIE_DANCERS.map((z, i) => ({
      name: z.name,
      letter: ALL_LETTERS[i],
      dance: z.dance,
      color: z.color,
      outline: z.outline,
      learned: [],
      x: 60 + i * ((this.canvasW - 120) / 6),
      y: this.canvasH * 0.7,
      phase: Math.random() * Math.PI * 2,
    }))
  }

  private getCurrentDancer(): DanceZombie {
    return this.dancers[this.state.currentZombie]
  }

  private startRound(): void {
    this.correctFlash = 0
    this.wrongFlash = 0
    this.showJudge = false
    this.judgeTimer = 0
    this.floatingLetters = []

    const zombie = this.getCurrentDancer()
    const pool = WORDS_POOL.filter(w => !zombie.learned.some(l => w.word.includes(l)))
    if (pool.length === 0) {
      this.state.winner = true
      return
    }
    const pick = pool[Math.floor(Math.random() * pool.length)]
    this.currentWord = pick.word
    this.currentEmoji = pick.emoji

    const needed = this.currentWord[Math.floor(Math.random() * this.currentWord.length)]
    this.blankIndex = this.currentWord.indexOf(needed)

    if (!zombie.learned.includes(needed)) {
      zombie.learned.push(needed)
    }

    const options = [needed]
    const pool2 = ALL_LETTERS.filter(l => l !== needed)
    while (options.length < 6) {
      const p = pool2[Math.floor(Math.random() * pool2.length)]
      if (!options.includes(p)) options.push(p)
    }

    this.floatingLetters = shuffleArray(options).map((l, i) =>
      new FloatingLetter(
        this.canvasW, this.canvasH, l,
        this.canvasH * 0.15 + Math.floor(i / 3) * 80,
      )
    )
  }

  handleClick(cx: number, cy: number): void {
    if (this.state.winner || this.correctFlash > 0 || this.transition > 0) return

    for (const letter of this.floatingLetters) {
      if (!letter.collected && letter.containsCanvas(cx, cy)) {
        this.handleLetter(letter.letter)
        letter.pop()
        return
      }
    }
  }

  handleKey(key: string): void {
    if (this.state.winner || this.correctFlash > 0 || this.transition > 0) return
    const letter = this.floatingLetters.find(l => !l.collected && l.letter.toLowerCase() === key)
    if (letter) {
      this.handleLetter(letter.letter)
      letter.pop()
    }
  }

  private handleLetter(letter: string): void {
    const needed = this.currentWord[this.blankIndex]
    if (letter === needed) {
      this.state.score += 10
      this.correctFlash = 1
      this.judgeIndex = Math.floor(Math.random() * JUDGES.length)
      this.showJudge = true
      this.judgeTimer = 0

      for (let i = 0; i < 15; i++) {
        const a = Math.random() * Math.PI * 2
        const s = 2 + Math.random() * 3
        this.particles.push({
          x: this.canvasW / 2, y: this.canvasH * 0.3,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          color: ['#58d68d', '#f5b041', '#5dade2', '#af7ac5'][Math.floor(Math.random() * 4)],
          life: 0, maxLife: 30 + Math.random() * 20,
        })
      }
      for (let i = 0; i < 5; i++) {
        this.musicNotes.push({
          x: this.canvasW / 2 + (Math.random() - 0.5) * 100,
          y: this.canvasH * 0.3,
          vx: (Math.random() - 0.5) * 2,
          vy: -2 - Math.random() * 3,
          life: 0,
        })
      }

      this.state.currentLetter++
      this.onStateChange?.({
        score: this.state.score, stars: this.state.stars,
        currentZombie: this.state.currentZombie,
        totalRounds: this.state.totalRounds,
        winner: this.state.winner,
      })

      if (this.state.currentLetter >= 4) {
        this.state.stars += Math.min(3, 1 + Math.floor(this.state.score / 20))
        if (this.state.currentZombie < 6) {
          this.state.currentZombie++
          this.state.currentLetter = 0
          this.transition = 1
        } else {
          this.state.winner = true
        }
      }
    } else {
      this.wrongFlash = 30
      this.message = 'Wrong! Try again!'
      this.messageTimer = 50
    }
  }

  update(): void {
    if (this.state.winner) {
      this.frame++
      this.finalDanceTimer++
      return
    }
    this.frame++

    if (this.transition > 0) {
      this.transition++
      if (this.transition > 80) {
        this.transition = 0
        this.startRound()
      }
      return
    }

    if (this.correctFlash > 0) {
      this.correctFlash++
      if (this.showJudge) this.judgeTimer++
      for (const p of this.particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++
      }
      this.particles = this.particles.filter(p => p.life < p.maxLife)
      for (const n of this.musicNotes) {
        n.x += n.vx; n.y += n.vy; n.vy += 0.05; n.life++
      }
      this.musicNotes = this.musicNotes.filter(n => n.life < 60)
      if (this.correctFlash > 50) {
        this.correctFlash = 0
        if (!this.transition && !this.state.winner) this.startRound()
      }
      return
    }

    if (this.wrongFlash > 0) this.wrongFlash--
    if (this.messageTimer > 0) this.messageTimer--

    for (const letter of this.floatingLetters) {
      letter.update(0)
    }
    this.floatingLetters = this.floatingLetters.filter(l => {
      if (l.collected) return l.popTime < l.popDuration
      return true
    })

    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife)
    this.discoPhase += 0.02
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawBackground(ctx)
    this.drawDiscoBall(ctx)
    this.drawDanceFloor(ctx)
    this.drawDancers(ctx)
    this.drawWordPrompt(ctx)
    this.drawFloatingLetters(ctx)
    this.drawParticles(ctx)
    this.drawMusicNotes(ctx)
    this.drawJudge(ctx)
    this.drawHUD(ctx)
    this.drawMessage(ctx)

    if (this.transition > 0) this.drawTransition(ctx)
    if (this.state.winner) this.drawWinScreen(ctx)
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#0a0a2e')
    grad.addColorStop(0.5, '#1a1a4e')
    grad.addColorStop(1, '#2a0a2e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
  }

  private drawDiscoBall(ctx: CanvasRenderingContext2D): void {
    const cx = this.canvasW / 2
    const cy = 55
    const r = 30

    const sparkle = Math.sin(this.discoPhase) * 5
    ctx.save()
    ctx.translate(cx, cy)

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    grad.addColorStop(0, '#ffe')
    grad.addColorStop(0.5, '#aac')
    grad.addColorStop(1, '#88a')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + this.discoPhase
      ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(a * 2 + this.discoPhase)})`
      ctx.fillRect(Math.cos(a) * r * 0.6 - 2, Math.sin(a) * r * 0.6 - 2, 4, 4)
    }

    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, -r)
    ctx.lineTo(sparkle, -r - 20)
    ctx.stroke()

    ctx.restore()
  }

  private drawDanceFloor(ctx: CanvasRenderingContext2D): void {
    const floorY = this.canvasH * 0.62
    const tileSize = 40

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < Math.ceil(this.canvasW / tileSize) + 1; col++) {
        const tx = col * tileSize - ((this.frame * 0.5) % tileSize)
        const ty = floorY + row * tileSize
        const shade = ((row + col) % 2 === 0) ? '#334' : '#445'
        ctx.fillStyle = shade
        ctx.fillRect(tx, ty, tileSize, tileSize)

        if (this.correctFlash > 0) {
          const glow = Math.sin(this.correctFlash * 0.3) * 0.5 + 0.5
          ctx.fillStyle = `rgba(88,214,141,${glow * 0.15})`
          ctx.fillRect(tx, ty, tileSize, tileSize)
        }
      }
    }
  }

  private drawDancers(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.dancers.length; i++) {
      const z = this.dancers[i]
      const isActive = i === this.state.currentZombie
      const r = isActive ? 28 : 18
      const bob = Math.sin(this.frame * 0.05 + z.phase) * (isActive ? 6 : 2)
      const wobble = Math.sin(this.frame * 0.08 + z.phase) * (isActive ? 4 : 1)

      ctx.save()
      ctx.translate(z.x, z.y + bob)

      if (isActive && this.correctFlash > 0) {
        ctx.fillStyle = `rgba(88,214,141,${Math.sin(this.correctFlash * 0.2) * 0.3 + 0.3})`
        ctx.beginPath()
        ctx.arc(0, 0, r + 8, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = z.color
      ctx.beginPath()
      ctx.arc(wobble, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = z.outline
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(wobble, 0, r, 0, Math.PI * 2)
      ctx.stroke()

      const eyeR = r * 0.18
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(side * r * 0.3 + wobble, -r * 0.1, eyeR, 0, Math.PI * 2)
        ctx.fillStyle = '#ccd'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(side * r * 0.3 + wobble, -r * 0.1, r * 0.09, 0, Math.PI * 2)
        ctx.fillStyle = '#222'
        ctx.fill()
      }

      ctx.strokeStyle = '#222'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(wobble, r * 0.2, r * 0.1, 0.2, Math.PI - 0.2)
      ctx.stroke()

      if (isActive) {
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(z.dance, wobble, -r - 12)
        ctx.fillStyle = '#f5b041'
        ctx.font = '10px system-ui'
        ctx.fillText(`${z.learned.length}/4`, wobble, r + 16)
      }

      ctx.restore()
    }
  }

  private drawWordPrompt(ctx: CanvasRenderingContext2D): void {
    if (this.correctFlash > 0) return

    const fontSize = 32
    const gap = 6
    const totalWidth = this.currentWord.length * (fontSize + gap)
    const startX = (this.canvasW - totalWidth) / 2
    const wordY = 100

    ctx.font = `${28}px system-ui`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(this.currentEmoji, this.canvasW / 2, wordY - 10)

    for (let i = 0; i < this.currentWord.length; i++) {
      const lx = startX + i * (fontSize + gap)
      if (i === this.blankIndex) {
        ctx.strokeStyle = '#f5b041'
        ctx.lineWidth = 3
        ctx.setLineDash([4, 3])
        ctx.strokeRect(lx, wordY + 4, fontSize, fontSize * 0.8)
        ctx.setLineDash([])
        ctx.fillStyle = '#f5b041'
        ctx.font = `bold ${fontSize * 0.4}px system-ui`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('?', lx + fontSize / 2, wordY + 15)
      } else {
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${fontSize}px system-ui`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(this.currentWord[i], lx + fontSize / 2, wordY + 4)
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Pop the missing letter to teach the dance!', this.canvasW / 2, wordY + fontSize + 16)
  }

  private drawFloatingLetters(ctx: CanvasRenderingContext2D): void {
    for (const letter of this.floatingLetters) {
      if (!letter.collected) letter.draw(ctx, this.frame)
      else if (letter.popTime < letter.popDuration) letter.draw(ctx, this.frame)
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

  private drawMusicNotes(ctx: CanvasRenderingContext2D): void {
    for (const n of this.musicNotes) {
      const alpha = 1 - n.life / 60
      if (alpha <= 0) continue
      ctx.globalAlpha = alpha
      ctx.font = '16px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(['♩', '♪', '♫', '🎵'][Math.floor(n.life / 15) % 4], n.x, n.y)
    }
    ctx.globalAlpha = 1
  }

  private drawJudge(ctx: CanvasRenderingContext2D): void {
    if (!this.showJudge || this.judgeTimer > 40) return
    const alpha = 1 - this.judgeTimer / 40
    const judge = JUDGES[this.judgeIndex]
    ctx.globalAlpha = alpha
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.beginPath()
    ctx.roundRect(this.canvasW / 2 - 100, 135, 200, 50, 10)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '14px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${judge.emoji} ${judge.name}: "${judge.line}"`, this.canvasW / 2, 158)
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
    ctx.fillText(`💃 ${this.getCurrentDancer().name} — ${this.state.currentLetter + 1}/4`, 12, 17)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#f5b041'
    ctx.fillText(`Zombie ${this.state.currentZombie + 1}/7`, this.canvasW / 2, 17)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#5dade2'
    ctx.fillText(`Score: ${this.state.score}  ⭐${this.state.stars}`, this.canvasW - 12, 17)
  }

  private drawMessage(ctx: CanvasRenderingContext2D): void {
    if (this.messageTimer <= 0) return
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, this.messageTimer / 20)})`
    ctx.font = '18px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(this.message, this.canvasW / 2, this.canvasH - 20)

    if (this.wrongFlash > 0) {
      const alpha = this.wrongFlash / 30
      ctx.fillStyle = `rgba(231,76,92,${alpha * 0.1})`
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
    }
  }

  private drawTransition(ctx: CanvasRenderingContext2D): void {
    const alpha = Math.min(1, this.transition / 30)
    ctx.fillStyle = `rgba(0,0,0,${alpha * 0.5})`
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
    ctx.fillStyle = `rgba(88,214,141,${alpha})`
    ctx.font = 'bold 30px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const zombie = this.dancers[this.state.currentZombie]
    ctx.fillText(`⭐ ${this.dancers[this.state.currentZombie - 1].name} learned their dance!`, this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`
    ctx.font = '18px system-ui'
    ctx.fillText(`Next up: ${zombie.name} — ${zombie.dance}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  private drawWinScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
    ctx.fillStyle = '#58d68d'
    ctx.font = 'bold 36px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🎉 Dance Academy Graduation! 🎉', this.canvasW / 2, this.canvasH / 2 - 60)
    ctx.fillStyle = '#f5b041'
    ctx.font = '20px system-ui'
    ctx.fillText(`Score: ${this.state.score}  ⭐${this.state.stars}`, this.canvasW / 2, this.canvasH / 2 - 10)
    ctx.fillStyle = '#8899bb'
    ctx.font = '16px system-ui'
    ctx.fillText('All 7 zombies learned their dance routines!', this.canvasW / 2, this.canvasH / 2 + 30)

    if (this.finalDanceTimer > 30) {
      for (let i = 0; i < this.dancers.length; i++) {
        const z = this.dancers[i]
        const bx = this.canvasW / 2 + Math.cos(this.finalDanceTimer * 0.05 + i * 1) * 120
        const by = this.canvasH / 2 + 70 + Math.sin(this.finalDanceTimer * 0.08 + i * 1.5) * 20
        ctx.fillStyle = z.color
        ctx.beginPath()
        ctx.arc(bx, by, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = '10px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(z.learned[0] || '', bx, by)
      }
    }
  }

  restart(): void {
    this.state = { currentZombie: 0, currentLetter: 0, score: 0, stars: 0, totalRounds: 28, winner: false }
    this.frame = 0
    this.particles = []
    this.musicNotes = []
    this.correctFlash = 0
    this.wrongFlash = 0
    this.transition = 0
    this.finalDanceTimer = 0
    this.message = ''
    this.messageTimer = 0
    this.initDancers()
    this.startRound()
  }
}
