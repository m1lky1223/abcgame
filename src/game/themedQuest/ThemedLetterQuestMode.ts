import { ALL_LETTERS } from '../../characters/data'
import { FloatingLetter } from '../FloatingLetter'
import { Renderer } from '../../renderer/Renderer'

export abstract class ThemedLetterQuestMode {
  protected canvasW: number
  protected canvasH: number
  protected frame = 0
  protected progressIndex = 0
  protected wordIndex = 0
  protected score = 0
  protected currentLetter = ''
  protected currentWord = ''
  protected floatingLetters: FloatingLetter[] = []
  protected particles: any[] = []
  protected correctFlash = 0
  protected transition = 0
  protected winner = false

  onStateChange?: (s: any) => void

  protected wordLists: Record<string, string[]> | null = null
  protected stepsPerLetter = 0
  protected particleColor = '#fff'
  protected transitionFrames = 30
  protected correctFlashFrames = 30

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
  }

  protected abstract initRound(): void

  protected abstract drawBackground(ctx: Renderer): void

  protected abstract drawHUD(ctx: Renderer): void

  protected abstract drawPrompt(ctx: Renderer): void

  protected abstract drawTransitionOverlay(ctx: Renderer): void

  protected abstract drawWinnerOverlay(ctx: Renderer): void

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score }
  }

  protected onCorrect(): void {
  }

  protected onLetterDone(): void {
  }

  protected extraUpdate(): void {
  }

  protected extraDraw(_ctx: Renderer): void {
  }

  protected blockInput(): boolean {
    return false
  }

  protected hasWords(): boolean {
    return this.wordLists !== null
  }

  protected spawnLetters(): void {
    const needed = this.currentLetter
    const options = [needed]
    const pool = ALL_LETTERS.filter(l => l !== needed)
    while (options.length < 5) {
      const p = pool[Math.floor(Math.random() * pool.length)]
      if (!options.includes(p)) options.push(p)
    }
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]]
    }
    this.floatingLetters = options.map(l => new FloatingLetter(this.canvasW, this.canvasH, l, 150))
  }

  protected advanceToNextLetter(): void {
    this.progressIndex++
    this.onLetterDone()
    if (!this.winner) this.transition = 1
  }

  protected advanceToNextWord(): void {
    if (!this.wordLists) {
      if (this.stepsPerLetter > 0 && this.wordIndex >= this.stepsPerLetter) {
        this.advanceToNextLetter()
        return
      }
      this.spawnLetters()
      return
    }
    const words = this.wordLists[this.currentLetter]
    if (!words || this.wordIndex >= words.length) {
      this.advanceToNextLetter()
      return
    }
    this.currentWord = words[this.wordIndex]
    this.spawnLetters()
  }

  handleClick(cx: number, cy: number): void {
    if (this.winner || this.correctFlash > 0 || this.transition > 0 || this.blockInput()) return
    for (const l of this.floatingLetters) {
      if (!l.collected && l.containsCanvas(cx, cy)) {
        this.checkLetter(l.letter); l.pop(); return
      }
    }
  }

  handleKey(key: string): void {
    if (this.winner || this.correctFlash > 0 || this.transition > 0 || this.blockInput()) return
    const f = this.floatingLetters.find(l => !l.collected && l.letter.toLowerCase() === key)
    if (f) { this.checkLetter(f.letter); f.pop() }
  }

  protected checkLetter(letter: string): void {
    if (letter !== this.currentLetter) return
    this.score += 10
    this.wordIndex++
    this.correctFlash = 1
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 2 + Math.random() * 3
      this.particles.push({
        x: this.canvasW / 2,
        y: this.canvasH * 0.4,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color: this.particleColor,
        life: 0,
        maxLife: 20,
      })
    }
    this.onCorrect()
    this.onStateChange?.(this.getStatePayload())
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++
    if (this.transition > 0) {
      this.transition++
      if (this.transition > this.transitionFrames) {
        this.transition = 0
        this.initRound()
      }
      return
    }
    if (this.correctFlash > 0) {
      this.correctFlash++
      for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
      this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
      if (this.correctFlash > this.correctFlashFrames) {
        this.correctFlash = 0
        this.advanceToNextWord()
      }
      return
    }
    for (const l of this.floatingLetters) { l.update(0) }
    this.floatingLetters = this.floatingLetters.filter(l => {
      if (l.collected) return l.popTime < l.popDuration
      return true
    })
    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
    this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
    this.extraUpdate()
  }

  draw(ctx: Renderer): void {
    this.drawBackground(ctx)
    this.drawHUD(ctx)
    this.drawPrompt(ctx)
    this.extraDraw(ctx)

    for (const l of this.floatingLetters) {
      if (!l.collected) l.draw(ctx, this.frame)
      else if (l.popTime < l.popDuration) l.draw(ctx, this.frame)
    }

    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife
      if (a <= 0) continue
      ctx.globalAlpha = a
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    ctx.globalAlpha = 1

    if (this.transition > 0) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.3, this.transition / 15)})`
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      this.drawTransitionOverlay(ctx)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      this.drawWinnerOverlay(ctx)
    }
  }

  restart(): void {
    this.progressIndex = 0
    this.wordIndex = 0
    this.score = 0
    this.floatingLetters = []
    this.particles = []
    this.correctFlash = 0
    this.transition = 0
    this.winner = false
    this.frame = 0
    this.initRound()
  }
}
