import { FloatingLetter } from '../FloatingLetter'
import { OddbodChaser } from '../OddbodChaser'
import { ZombieChaser } from '../ZombieChaser'
import { Background } from '../Background'
import { ALL_LETTERS } from '../../characters/data'
import { WORDS, WordEntry } from '../words'
import { GameInput } from '../GameModeStrategy'
import { Renderer } from '../../renderer/Renderer'

const WIN_SCORE = 26

interface Chaser {
  alive: boolean
  isDone: boolean
  caughtLetter: FloatingLetter | null
  update(letters: FloatingLetter[]): string | null
  draw(ctx: Renderer): void
  containsPoint(mx: number, my: number): boolean
}

export type PopSubMode = 'free' | 'word' | 'survival' | 'timeattack' | 'wordrace' | 'defense'

export class LetterPopCore {
  private canvasW: number
  private canvasH: number
  private mode: PopSubMode
  private background: Background

  letters: FloatingLetter[] = []
  chasers: Chaser[] = []
  private chaserSpawnTimer = 0
  maxLetters = 8

  private currentWordIndex = -1
  currentWord: WordEntry | null = null
  wordsDone = 0
  private correctFlash = 0
  private distractors: string[] = []
  private celebrateParticles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []

  private oddCollected: Set<string> = new Set()
  private totalCaught = 0

  survivalLives = 3
  timeLeft = 60
  private timeFrameCounter = 0
  wordRaceIndex = 0
  defenseLives = 3

  score = 0
  collectedSet: Set<string> = new Set()
  totalCollected = 0
  oddScore = 0
  winner: 'human' | 'oddbods' | null = null

  onStateChange?: (state: any) => void

  constructor(canvasW: number, canvasH: number, mode: PopSubMode) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.mode = mode
    this.background = new Background(canvasW, canvasH)
  }

  start(): void {
    if (this.mode === 'word' || this.mode === 'wordrace') this.startWordRound()
    else this.spawnInitialLetters()
  }

  restart(): void {
    this.letters = []
    this.chasers = []
    this.chaserSpawnTimer = 0
    this.celebrateParticles = []
    this.correctFlash = 0
    this.oddCollected = new Set()
    this.totalCaught = 0
    this.survivalLives = 3
    this.timeLeft = 60
    this.timeFrameCounter = 0
    this.wordRaceIndex = 0
    this.defenseLives = 3
    this.score = 0
    this.collectedSet = new Set()
    this.totalCollected = 0
    this.oddScore = 0
    this.winner = null
    this.currentWordIndex = -1
    this.currentWord = null
    this.wordsDone = 0
    this.background = new Background(this.canvasW, this.canvasH)
    if (this.mode === 'word' || this.mode === 'wordrace') this.startWordRound()
    else this.spawnInitialLetters()
  }

  resize(w: number, h: number): void {
    this.canvasW = w
    this.canvasH = h
  }

  private randomChaser(speedMult: number): Chaser {
    return Math.random() < 0.5
      ? new OddbodChaser(this.canvasW, this.canvasH, speedMult)
      : new ZombieChaser(this.canvasW, this.canvasH, speedMult)
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
      this.letters.push(new FloatingLetter(this.canvasW, this.canvasH))
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
        this.letters.push(new FloatingLetter(this.canvasW, this.canvasH, ch, 200))
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
        new FloatingLetter(this.canvasW, this.canvasH, l, 200)
      )
    }
  }

  update(frame: number, input: GameInput): void {
    this.background.update(0, this.canvasW)

    if (this.winner) return

    if (this.correctFlash > 0) {
      this.correctFlash++
      for (const p of this.celebrateParticles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life++; p.vx *= 0.97
      }
      if (this.correctFlash > 90) {
        this.correctFlash = 0
        this.celebrateParticles = []
        if (this.mode === 'word' || this.mode === 'wordrace') {
          if (this.winner) return
          this.startWordRound()
        }
      }
      return
    }

    if (this.mode === 'timeattack') {
      this.timeFrameCounter++
      if (this.timeFrameCounter >= 60) {
        this.timeFrameCounter = 0
        this.timeLeft--
        if (this.timeLeft <= 0) {
          const prev = parseInt(localStorage.getItem('hs_timeattack') || '0', 10)
          if (this.score > prev) localStorage.setItem('hs_timeattack', String(this.score))
          this.winner = 'human'
          this.emitState()
          return
        }
      }
    }

    if (this.mode === 'defense') {
      this.timeFrameCounter++
      if (this.timeFrameCounter >= 120) {
        this.timeFrameCounter = 0
        this.letters.push(new FloatingLetter(this.canvasW, this.canvasH))
      }
    }

    for (const g of input.gestures) {
      if (g.type === 'tap') {
        const cx = g.x
        const cy = g.y

        if (this.mode === 'defense') {
          let hit = false
          for (const chaser of this.chasers) {
            if (chaser.alive && chaser.containsPoint(cx, cy)) {
              chaser.alive = false
              this.score++
              this.emitState()
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
                this.score++
                this.wordRaceIndex++
                if (this.wordRaceIndex >= this.currentWord.word.length) {
                  this.wordsDone++
                  this.startCelebration()
                  this.spawnInitialChasers(1)
                }
                this.emitState()
              } else {
                letter.correctPulse = 10
              }
            } else {
              letter.pop()
              this.score++
              if (this.mode !== 'timeattack' && this.mode !== 'survival' && this.mode !== 'defense') {
                this.collectedSet.add(letter.letter)
                this.totalCollected = this.collectedSet.size
              }
              this.emitState()
              if (this.mode === 'free') this.checkWin()
            }
            break
          }
        }
      }
    }

    const keys = 'abcdefghijklmnopqrstuvwxyz'
    for (const key of keys) {
      if (input.wasPressed(key)) {
        const match = this.letters.find(l => !l.collected && l.letter.toLowerCase() === key)
        if (match) {
          if (this.mode === 'wordrace' && this.currentWord) {
            const needed = this.currentWord.word[this.wordRaceIndex]
            if (match.letter === needed) {
              match.pop()
              this.score += 2
              this.wordRaceIndex++
              if (this.wordRaceIndex >= this.currentWord.word.length) {
                this.wordsDone++
                this.startCelebration()
                this.spawnInitialChasers(1)
              }
              this.emitState()
            } else {
              match.correctPulse = 10
            }
          } else {
            match.pop()
            this.score += 2
            if (this.mode !== 'timeattack' && this.mode !== 'survival' && this.mode !== 'defense') {
              this.collectedSet.add(match.letter)
              this.totalCollected = this.collectedSet.size
            }
            this.emitState()
            if (this.mode === 'free') this.checkWin()
          }
        }
      }
    }

    this.letters = this.letters.filter(l => {
      const done = l.update(frame)
      if (done) return false
      if (l.correctPulse > 0) l.correctPulse--
      return true
    })

    if (this.mode === 'free' || this.mode === 'timeattack') {
      while (this.letters.filter(l => !l.collected).length < this.maxLetters) {
        this.letters.push(new FloatingLetter(this.canvasW, this.canvasH))
      }
      this.runChasers()
    }

    if (this.mode === 'survival') {
      const prevCaught = this.totalCaught
      this.runChasers()
      if (this.totalCaught > prevCaught) {
        this.survivalLives--
        this.chasers = this.chasers.filter(c => c.alive)
        if (this.survivalLives <= 0) {
          this.winner = 'oddbods'
          this.oddScore = this.oddCollected.size
          this.emitState()
        }
      }
      this.chasers = this.chasers.filter(c => !c.isDone)
      while (this.letters.filter(l => !l.collected).length < 1) {
        this.letters.push(new FloatingLetter(this.canvasW, this.canvasH))
      }
    }

    if (this.mode === 'defense') {
      const prevCaught = this.totalCaught
      this.runChasers()
      if (this.totalCaught > prevCaught) {
        this.defenseLives--
        this.chasers = this.chasers.filter(c => c.alive)
        if (this.defenseLives <= 0) {
          this.winner = 'oddbods'
          this.emitState()
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
          this.oddScore = this.oddCollected.size
          this.emitState()
          if (this.mode === 'free') this.checkWin()
        }
      }
    }
    this.chasers = this.chasers.filter(c => !c.isDone)
  }

  private getDifficulty(): number {
    return this.score
  }

  private checkWin(): void {
    if (this.collectedSet.size >= WIN_SCORE) {
      this.winner = 'human'
      this.emitState()
    } else if (this.oddCollected.size >= WIN_SCORE) {
      this.winner = 'oddbods'
      this.emitState()
    }
  }

  private startCelebration(): void {
    this.correctFlash = 1
    const colors = ['#e74c5c', '#f5b041', '#58d68d', '#5dade2', '#af7ac5', '#fff']
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 4
      this.celebrateParticles.push({
        x: this.canvasW / 2, y: this.canvasH / 2,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0, maxLife: 40 + Math.random() * 30,
      })
    }
  }

  private emitState(): void {
    this.onStateChange?.({
      score: this.score,
      collectedSet: this.collectedSet,
      totalCollected: this.totalCollected,
      mode: this.mode,
      wordsCompleted: this.wordsDone,
      oddScore: this.oddScore,
      winner: this.winner,
      lives: this.mode === 'survival' ? this.survivalLives : this.mode === 'defense' ? this.defenseLives : undefined,
      timeLeft: this.mode === 'timeattack' ? this.timeLeft : undefined,
    })
  }

  draw(ctx: Renderer, frame: number): void {
    const w = this.canvasW
    const h = this.canvasH

    ctx.clearRect(0, 0, w, h)
    this.background.draw(ctx, w, h, frame)

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

    for (const letter of this.letters) letter.draw(ctx, frame)
    for (const chaser of this.chasers) chaser.draw(ctx)

    if (this.correctFlash > 0) this.drawCelebration(ctx, w, h)

    this.drawModeHUD(ctx, w, h)

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, w, h)
    }
  }

  private drawModeHUD(ctx: Renderer, w: number, _h: number): void {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, w, 36)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 15px system-ui'
    ctx.textBaseline = 'middle'

    switch (this.mode) {
      case 'free':
        ctx.textAlign = 'left'
        ctx.fillText(`You: ${this.collectedSet.size}/26`, 12, 18)
        ctx.textAlign = 'right'
        ctx.fillText(`OddBods: ${this.oddCollected.size}/26`, w - 12, 18)
        break
      case 'word':
        ctx.textAlign = 'left'
        ctx.fillStyle = '#58d68d'
        ctx.fillText(`Words: ${this.wordsDone}`, 12, 18)
        ctx.textAlign = 'right'
        ctx.fillStyle = '#f5b041'
        ctx.fillText(`Score: ${this.score}`, w - 12, 18)
        break
      case 'survival':
        ctx.textAlign = 'left'
        ctx.fillText(`❤️`.repeat(this.survivalLives), 12, 18)
        ctx.textAlign = 'right'
        ctx.fillText(`Score: ${this.score}`, w - 12, 18)
        break
      case 'timeattack':
        ctx.textAlign = 'left'
        ctx.fillStyle = this.timeLeft <= 10 ? '#e74c5c' : '#fff'
        ctx.fillText(`Time: ${this.timeLeft}s`, 12, 18)
        ctx.textAlign = 'right'
        ctx.fillText(`Score: ${this.score}`, w - 12, 18)
        break
      case 'wordrace':
        ctx.textAlign = 'left'
        ctx.fillStyle = '#58d68d'
        ctx.fillText(`Words: ${this.wordsDone}`, 12, 18)
        ctx.textAlign = 'right'
        ctx.fillStyle = '#f5b041'
        ctx.fillText(`Score: ${this.score}`, w - 12, 18)
        break
      case 'defense':
        ctx.textAlign = 'left'
        ctx.fillText(`❤️`.repeat(this.defenseLives), 12, 18)
        ctx.textAlign = 'right'
        ctx.fillText(`Score: ${this.score}`, w - 12, 18)
        break
    }
  }

  private drawWordPrompt(ctx: Renderer, w: number, _h: number): void {
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

  private drawWordRacePrompt(ctx: Renderer, w: number, _h: number): void {
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

  private drawCelebration(ctx: Renderer, w: number, h: number): void {
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
