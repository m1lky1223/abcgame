import { Input } from './Input'
import { FloatingLetter } from './FloatingLetter'
import { OddbodChaser } from './OddbodChaser'
import { ZombieChaser } from './ZombieChaser'
import { Background } from './Background'
import { AngryMode } from './AngryMode'
import { ALL_LETTERS } from '../characters/data'
import { WORDS, WordEntry } from './words'

interface Chaser {
  alive: boolean
  isDone: boolean
  caughtLetter: FloatingLetter | null
  update(letters: FloatingLetter[]): string | null
  draw(ctx: CanvasRenderingContext2D): void
  containsPoint(mx: number, my: number): boolean
}

export type GameMode = 'free' | 'word' | 'survival' | 'timeattack' | 'wordrace' | 'defense' | 'angry'

export const WIN_SCORE = 26

export interface GameState {
  score: number
  collectedSet: Set<string>
  totalCollected: number
  mode: GameMode
  wordsCompleted: number
  currentWord?: WordEntry
  oddScore: number
  winner: 'human' | 'oddbods' | null
  lives?: number
  timeLeft?: number
  highScore?: number
  ammoLeft?: number
  currentLevel?: number
  totalLevels?: number
}

export class Engine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private input: Input
  private background: Background
  private letters: FloatingLetter[] = []
  private chasers: Chaser[] = []
  private chaserSpawnTimer = 0
  private frame = 0
  private animId = 0
  private running = false
  private mode: GameMode
  maxLetters = 8

  private currentWordIndex = -1
  private currentWord: WordEntry | null = null
  private wordsDone = 0
  private correctFlash = 0
  private distractors: string[] = []
  private celebrateParticles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []

  private oddCollected: Set<string> = new Set()
  private totalCaught = 0

  private survivalLives = 3
  private timeLeft = 60
  private timeFrameCounter = 0
  private wordRaceIndex = 0
  private defenseLives = 3
  private angryMode: AngryMode | null = null

  state: GameState = { score: 0, collectedSet: new Set(), totalCollected: 0, mode: 'free', wordsCompleted: 0, oddScore: 0, winner: null }
  onStateChange?: (state: GameState) => void
  onGameOver?: (winner: 'human' | 'oddbods') => void

  constructor(canvas: HTMLCanvasElement, mode: GameMode = 'free') {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.input = new Input()
    this.background = new Background(canvas.width, canvas.height)
    this.mode = mode
    this.loop = this.loop.bind(this)
  }

  start(): void {
    this.input.attach()
    if (this.mode === 'word' || this.mode === 'wordrace') this.startWordRound()
    else if (this.mode === 'angry') {
      this.angryMode = new AngryMode(this.canvas.width, this.canvas.height)
      this.angryMode.onStateChange = (s) => {
        this.state.score = s.lettersDestroyed
        if (s.winner) this.state.winner = s.winner
        this.state.totalCollected = s.lettersDestroyed
        this.state.ammoLeft = s.ammoLeft
        this.state.currentLevel = s.currentLevel
        this.state.totalLevels = s.totalLevels
        this.onStateChange?.(this.state)
      }
    } else this.spawnInitialLetters()
    this.running = true
    this.loop()
  }

  stop(): void {
    this.running = false
    this.input.detach()
    cancelAnimationFrame(this.animId)
  }

  restart(): void {
    this.letters = []
    this.chasers = []
    this.chaserSpawnTimer = 0
    this.frame = 0
    this.celebrateParticles = []
    this.correctFlash = 0
    this.oddCollected = new Set()
    this.totalCaught = 0
    this.survivalLives = 3
    this.timeLeft = 60
    this.timeFrameCounter = 0
    this.wordRaceIndex = 0
    this.defenseLives = 3
    this.angryMode = null
    this.state = { score: 0, collectedSet: new Set(), totalCollected: 0, mode: this.mode, wordsCompleted: 0, oddScore: 0, winner: null }
    this.currentWordIndex = -1
    this.currentWord = null
    this.wordsDone = 0
    if (this.mode === 'word' || this.mode === 'wordrace') this.startWordRound()
    else if (this.mode === 'angry') {
      this.angryMode = new AngryMode(this.canvas.width, this.canvas.height)
      this.angryMode.onStateChange = (s) => {
        this.state.score = s.lettersDestroyed
        if (s.winner) this.state.winner = s.winner
        this.state.totalCollected = s.lettersDestroyed
        this.state.ammoLeft = s.ammoLeft
        this.state.currentLevel = s.currentLevel
        this.state.totalLevels = s.totalLevels
        this.onStateChange?.(this.state)
      }
    } else this.spawnInitialLetters()
    this.running = true
    this.onStateChange?.(this.state)
    this.input.detach()
    this.input = new Input()
    this.input.attach()
    this.loop()
  }

  private randomChaser(speedMult: number): Chaser {
    return Math.random() < 0.5
      ? new OddbodChaser(this.canvas.width, this.canvas.height, speedMult)
      : new ZombieChaser(this.canvas.width, this.canvas.height, speedMult)
  }

  private spawnInitialChasers(count: number): void {
    for (let i = 0; i < count; i++) {
      this.chasers.push(this.randomChaser(1))
    }
  }

  private spawnInitialLetters(): void {
    this.letters = []
    const count = this.mode === 'survival' ? 1 : Math.min(this.maxLetters, ALL_LETTERS.length)
    for (let i = 0; i < count; i++) {
      this.letters.push(new FloatingLetter(this.canvas.width, this.canvas.height))
    }
    if (this.mode === 'survival' || this.mode === 'timeattack' || this.mode === 'defense') {
      this.spawnInitialChasers(this.mode === 'survival' || this.mode === 'defense' ? 1 : 2)
    }
  }

  private startWordRound(): void {
    this.currentWordIndex = (this.currentWordIndex + 1) % WORDS.length
    this.currentWord = WORDS[this.currentWordIndex]
    this.correctFlash = 0
    this.celebrateParticles = []
    this.wordRaceIndex = 0

    if (this.mode === 'wordrace') {
      this.letters = []
      for (const ch of this.currentWord.word) {
        this.letters.push(new FloatingLetter(this.canvas.width, this.canvas.height, ch, 200))
      }
      this.spawnInitialChasers(2)
    } else {
      const correct = this.currentWord.word[this.currentWord.blankIndex]
      this.distractors = [correct]
      const pool = ALL_LETTERS.filter(l => l !== correct)
      while (this.distractors.length < 6) {
        const pick = pool[Math.floor(Math.random() * pool.length)]
        if (!this.distractors.includes(pick)) this.distractors.push(pick)
      }
      this.distractors.sort(() => Math.random() - 0.5)
      this.letters = this.distractors.map(l =>
        new FloatingLetter(this.canvas.width, this.canvas.height, l, 200)
      )
    }
  }

  private loop(): void {
    if (!this.running) return
    this.animId = requestAnimationFrame(this.loop)
    this.frame++
    this.update()
    this.draw()
    this.input.clearFrame()
  }

  private update(): void {
    this.background.update(0, this.canvas.width)

    if (this.state.winner) {
      if (this.input.wasPressed(' ')) this.restart()
      return
    }

    if (this.mode === 'angry') {
      const rect = this.canvas.getBoundingClientRect()
      if (this.input.mouseDown) {
        const cx = this.input.mouseX - rect.left
        const cy = this.input.mouseY - rect.top
        this.angryMode?.handleAimStart(cx, cy)
        this.angryMode?.handleAimMove(cx, cy)
      }
      if (this.input.justReleased) {
        this.angryMode?.handleAimRelease()
      }
      this.angryMode?.update()
      return
    }

    if (this.correctFlash > 0) {
      this.correctFlash++
      for (const p of this.celebrateParticles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life++; p.vx *= 0.97
      }
      if (this.correctFlash > 90) {
        this.correctFlash = 0
        this.celebrateParticles = []
        if (this.mode === 'word' || this.mode === 'wordrace') {
          if (this.state.winner) return
          this.startWordRound()
        }
      }
      return
    }

    const clicks = this.input.getClicks()
    const rect = this.canvas.getBoundingClientRect()

    if (this.mode === 'timeattack') {
      this.timeFrameCounter++
      if (this.timeFrameCounter >= 60) {
        this.timeFrameCounter = 0
        this.timeLeft--
        this.state.timeLeft = this.timeLeft
        this.onStateChange?.(this.state)
        if (this.timeLeft <= 0) {
          const prev = parseInt(localStorage.getItem('hs_timeattack') || '0', 10)
          if (this.state.score > prev) localStorage.setItem('hs_timeattack', String(this.state.score))
          this.state.highScore = Math.max(this.state.score, prev)
          this.state.winner = 'human'
          this.onStateChange?.(this.state)
          return
        }
      }
    }

    if (this.mode === 'defense') {
      this.timeFrameCounter++
      if (this.timeFrameCounter >= 120) {
        this.timeFrameCounter = 0
        this.letters.push(new FloatingLetter(this.canvas.width, this.canvas.height))
      }
    }

    for (const click of clicks) {
      const cx = click.x - rect.left
      const cy = click.y - rect.top

      if (this.mode === 'defense') {
        let hit = false
        for (const chaser of this.chasers) {
          if (chaser.alive && chaser.containsPoint(cx, cy)) {
            chaser.alive = false
            this.state.score++
            this.onStateChange?.(this.state)
            hit = true
            break
          }
        }
        if (hit) continue
      }

      for (const letter of this.letters) {
        if (!letter.collected && letter.containsCanvas(cx, cy)) {
          if (this.mode === 'wordrace' && this.currentWord) {
            const needed = this.currentWord.word[this.wordRaceIndex]
            if (letter.letter === needed) {
              letter.pop()
              this.state.score++
              this.wordRaceIndex++
              if (this.wordRaceIndex >= this.currentWord.word.length) {
                this.wordsDone++
                this.state.wordsCompleted = this.wordsDone
                this.startCelebration()
                this.spawnInitialChasers(1)
              }
              this.onStateChange?.(this.state)
            } else {
              letter.correctPulse = 10
            }
          } else {
            letter.pop()
            this.state.score++
            if (this.mode !== 'timeattack' && this.mode !== 'survival' && this.mode !== 'defense') {
              this.state.collectedSet.add(letter.letter)
              this.state.totalCollected = this.state.collectedSet.size
            }
            this.onStateChange?.(this.state)
            if (this.mode === 'free') this.checkWin()
          }
          break
        }
      }
    }

    const keys = 'abcdefghijklmnopqrstuvwxyz'
    for (const key of keys) {
      if (this.input.wasPressed(key)) {
        const match = this.letters.find(l => !l.collected && l.letter.toLowerCase() === key)
        if (match) {
          if (this.mode === 'wordrace' && this.currentWord) {
            const needed = this.currentWord.word[this.wordRaceIndex]
            if (match.letter === needed) {
              match.pop()
              this.state.score += 2
              this.wordRaceIndex++
              if (this.wordRaceIndex >= this.currentWord.word.length) {
                this.wordsDone++
                this.state.wordsCompleted = this.wordsDone
                this.startCelebration()
                this.spawnInitialChasers(1)
              }
              this.onStateChange?.(this.state)
            } else {
              match.correctPulse = 10
            }
          } else {
            match.pop()
            this.state.score += 2
            if (this.mode !== 'timeattack' && this.mode !== 'survival' && this.mode !== 'defense') {
              this.state.collectedSet.add(match.letter)
              this.state.totalCollected = this.state.collectedSet.size
            }
            this.onStateChange?.(this.state)
            if (this.mode === 'free') this.checkWin()
          }
        }
      }
    }

    this.letters = this.letters.filter(l => {
      const done = l.update(this.frame)
      if (done) return false
      if (l.correctPulse > 0) l.correctPulse--
      return true
    })

    if (this.mode === 'free') {
      while (this.letters.filter(l => !l.collected).length < this.maxLetters) {
        this.letters.push(new FloatingLetter(this.canvas.width, this.canvas.height))
      }
      this.runChasers()
    }

    if (this.mode === 'timeattack') {
      while (this.letters.filter(l => !l.collected).length < this.maxLetters) {
        this.letters.push(new FloatingLetter(this.canvas.width, this.canvas.height))
      }
      this.runChasers()
    }

    if (this.mode === 'survival') {
      const prevCaught = this.totalCaught
      this.runChasers()
      if (this.totalCaught > prevCaught) {
        this.survivalLives--
        this.state.lives = this.survivalLives
        this.onStateChange?.(this.state)
        this.chasers = this.chasers.filter(c => c.alive)
        if (this.survivalLives <= 0) {
          this.state.winner = 'oddbods'
          this.state.oddScore = this.oddCollected.size
          this.onStateChange?.(this.state)
        }
      }
      this.chasers = this.chasers.filter(c => !c.isDone)
      while (this.letters.filter(l => !l.collected).length < 1) {
        this.letters.push(new FloatingLetter(this.canvas.width, this.canvas.height))
      }
    }

    if (this.mode === 'defense') {
      const prevCaught = this.totalCaught
      this.runChasers()
      if (this.totalCaught > prevCaught) {
        this.defenseLives--
        this.state.lives = this.defenseLives
        this.onStateChange?.(this.state)
        this.chasers = this.chasers.filter(c => c.alive)
        if (this.defenseLives <= 0) {
          this.state.winner = 'oddbods'
          this.onStateChange?.(this.state)
        }
      }
      this.chasers = this.chasers.filter(c => !c.isDone)
    }

    if (this.mode === 'wordrace') {
      if (this.chasers.length < 3) {
        this.chaserSpawnTimer++
        if (this.chaserSpawnTimer > 300) {
          this.chaserSpawnTimer = 0
          this.chasers.push(this.randomChaser(1.2))
        }
      }
      for (const chaser of this.chasers) {
        chaser.update(this.letters)
      }
      this.chasers = this.chasers.filter(c => !c.isDone)
    }
  }

  private runChasers(): void {
    const diff = this.getDifficulty()
    const spawnInterval = Math.max(40, 140 - diff * 4)
    const maxChasers = Math.min(9, 4 + Math.floor(diff / 3))
    const speedMult = 1 + diff * 0.025

    this.chaserSpawnTimer++
    const aliveChasers = this.chasers.filter(c => c.alive).length
    if (this.chaserSpawnTimer > spawnInterval && aliveChasers < maxChasers) {
      this.chaserSpawnTimer = 0
      this.chasers.push(this.randomChaser(speedMult))
    }

    for (const chaser of this.chasers) {
      const caught = chaser.update(this.letters)
      if (caught) {
        this.totalCaught++
        if (!this.oddCollected.has(caught)) {
          this.oddCollected.add(caught)
          this.state.oddScore = this.oddCollected.size
          this.onStateChange?.(this.state)
          if (this.mode === 'free') this.checkWin()
        }
      }
    }
    this.chasers = this.chasers.filter(c => !c.isDone)
  }

  private getDifficulty(): number {
    return this.state.score
  }

  private checkWin(): void {
    if (this.state.collectedSet.size >= WIN_SCORE) {
      this.state.winner = 'human'
      this.onStateChange?.(this.state)
      this.onGameOver?.('human')
    } else if (this.oddCollected.size >= WIN_SCORE) {
      this.state.winner = 'oddbods'
      this.onStateChange?.(this.state)
      this.onGameOver?.('oddbods')
    }
  }

  private startCelebration(): void {
    this.correctFlash = 1
    const colors = ['#e74c5c', '#f5b041', '#58d68d', '#5dade2', '#af7ac5', '#fff']
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 4
      this.celebrateParticles.push({
        x: this.canvas.width / 2, y: this.canvas.height / 2,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0, maxLife: 40 + Math.random() * 30,
      })
    }
  }

  draw(): void {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    ctx.clearRect(0, 0, w, h)
    this.background.draw(ctx, w, h, this.frame)

    if (this.mode === 'word' && this.currentWord) this.drawWordPrompt(ctx, w, h)
    if (this.mode === 'wordrace' && this.currentWord) this.drawWordRacePrompt(ctx, w, h)

    if (this.mode === 'defense') {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.fillRect(0, h - 48, w, 48)
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Click on OddBods & Zombies to protect the letters!', w / 2, h - 24)
    }

    if (this.mode === 'angry') {
      this.angryMode?.draw(ctx)
      if (this.state.winner) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.fillRect(0, 0, w, h)
      }
      return
    }

    for (const letter of this.letters) letter.draw(ctx, this.frame)
    for (const chaser of this.chasers) chaser.draw(ctx)

    if (this.correctFlash > 0) this.drawCelebration(ctx, w, h)

    this.drawModeHUD(ctx, w, h)

    if (this.state.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, w, h)
    }
  }

  private drawModeHUD(ctx: CanvasRenderingContext2D, w: number, _h: number): void {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, w, 36)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 15px system-ui'
    ctx.textBaseline = 'middle'

    switch (this.mode) {
      case 'free':
        ctx.textAlign = 'left'
        ctx.fillText(`You: ${this.state.collectedSet.size}/26`, 12, 18)
        ctx.textAlign = 'right'
        ctx.fillText(`OddBods: ${this.oddCollected.size}/26`, w - 12, 18)
        break
      case 'word':
        ctx.textAlign = 'left'
        ctx.fillStyle = '#58d68d'
        ctx.fillText(`Words: ${this.wordsDone}`, 12, 18)
        ctx.textAlign = 'right'
        ctx.fillStyle = '#f5b041'
        ctx.fillText(`Score: ${this.state.score}`, w - 12, 18)
        break
      case 'survival':
        ctx.textAlign = 'left'
        ctx.fillText(`❤️`.repeat(this.survivalLives), 12, 18)
        ctx.textAlign = 'right'
        ctx.fillText(`Score: ${this.state.score}`, w - 12, 18)
        break
      case 'timeattack':
        ctx.textAlign = 'left'
        ctx.fillStyle = this.timeLeft <= 10 ? '#e74c5c' : '#fff'
        ctx.fillText(`Time: ${this.timeLeft}s`, 12, 18)
        ctx.textAlign = 'right'
        ctx.fillText(`Score: ${this.state.score}`, w - 12, 18)
        break
      case 'wordrace':
        ctx.textAlign = 'left'
        ctx.fillStyle = '#58d68d'
        ctx.fillText(`Words: ${this.wordsDone}`, 12, 18)
        ctx.textAlign = 'right'
        ctx.fillStyle = '#f5b041'
        ctx.fillText(`Score: ${this.state.score}`, w - 12, 18)
        break
      case 'defense':
        ctx.textAlign = 'left'
        ctx.fillText(`❤️`.repeat(this.defenseLives), 12, 18)
        ctx.textAlign = 'right'
        ctx.fillText(`Score: ${this.state.score}`, w - 12, 18)
        break
      case 'angry':
        break
    }
  }

  private drawWordPrompt(ctx: CanvasRenderingContext2D, w: number, _h: number): void {
    if (!this.currentWord) return
    const wd = this.currentWord
    const gap = 12
    const fontSize = Math.min(48, w * 0.08)
    const emojiSize = Math.min(64, w * 0.1)
    const totalWidth = wd.word.length * (fontSize + gap)
    const startX = (w - totalWidth) / 2
    const emojiY = 40

    ctx.font = `${emojiSize}px system-ui`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(wd.emoji, w / 2, emojiY)

    const wordY = emojiY + emojiSize + 16

    for (let i = 0; i < wd.word.length; i++) {
      const lx = startX + i * (fontSize + gap)
      const ly = wordY

      if (i === wd.blankIndex) {
        const correct = wd.word[wd.blankIndex]
        const found = this.letters.find(l => l.collected && l.letter === correct)
        if (found) {
          ctx.fillStyle = '#58d68d'
          ctx.font = `bold ${fontSize}px "Arial Black", Arial, system-ui, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(correct, lx + fontSize / 2, ly)
        } else {
          ctx.strokeStyle = '#f5b041'
          ctx.lineWidth = 4
          ctx.setLineDash([6, 4])
          ctx.strokeRect(lx, ly + 4, fontSize, fontSize * 0.8)
          ctx.setLineDash([])
        }
      } else {
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${fontSize}px "Arial Black", Arial, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(wd.word[i], lx + fontSize / 2, ly)
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '16px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Pop the missing letter!', w / 2, wordY + fontSize + 12)
  }

  private drawWordRacePrompt(ctx: CanvasRenderingContext2D, w: number, _h: number): void {
    if (!this.currentWord) return
    const wd = this.currentWord
    const fontSize = Math.min(36, w * 0.06)
    const gap = 8
    const totalWidth = wd.word.length * (fontSize + gap)
    const startX = (w - totalWidth) / 2
    const wordY = 24

    for (let i = 0; i < wd.word.length; i++) {
      const lx = startX + i * (fontSize + gap)
      const ly = wordY

      if (i < this.wordRaceIndex) {
        ctx.fillStyle = '#58d68d'
        ctx.font = `bold ${fontSize}px "Arial Black", Arial, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(wd.word[i], lx + fontSize / 2, ly)
      } else if (i === this.wordRaceIndex) {
        ctx.strokeStyle = '#f5b041'
        ctx.lineWidth = 3
        ctx.setLineDash([4, 3])
        const bw = fontSize * 0.7
        ctx.strokeRect(lx + (fontSize - bw) / 2, ly + 4, bw, bw)
        ctx.setLineDash([])
        ctx.fillStyle = '#f5b041'
        ctx.font = `bold ${fontSize * 0.5}px system-ui`
        ctx.fillText('?', lx + fontSize / 2, ly + fontSize * 0.15)
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = `bold ${fontSize}px "Arial Black", Arial, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(wd.word[i], lx + fontSize / 2, ly)
      }
    }
  }

  private drawCelebration(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const alpha = this.correctFlash < 20 ? this.correctFlash / 20 : 1
    ctx.globalAlpha = alpha * 0.2
    ctx.fillStyle = '#f5b041'
    ctx.beginPath()
    ctx.arc(w / 2, h * 0.3, 60 + Math.sin(this.correctFlash * 0.1) * 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 32px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Correct! ✨', w / 2, h * 0.3 - 50)

    for (const p of this.celebrateParticles) {
      const a = 1 - p.life / p.maxLife
      if (a <= 0) continue
      ctx.globalAlpha = a
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3 + a * 3, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    ctx.globalAlpha = 1

    if (this.currentWord) {
      ctx.fillStyle = '#58d68d'
      ctx.font = 'bold 22px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`Words: ${this.wordsDone}`, w / 2, h - 40)
    }
  }
}
