import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

const MAIL_WORDS: Record<string, string[]> = {
  'A': ['_DDRESS', 'MA_L'], 'B': ['O_', 'BO_'], 'C': ['_ARD', 'CAR_'],
  'D': ['ELI_ERY', 'DEL_VER'], 'E': ['N_ELOPE', '_NVELOPE'], 'F': ['_RANK', 'FR_'],
  'G': ['_IFT', 'GI_T'], 'H': ['_AND', 'HAN_'], 'I': ['_NVITE', 'IN_ITE'],
  'J': ['_OURNEY', 'J_URNEY'], 'K': ['_EY', 'KE_'], 'L': ['_ETTER', 'LET_ER'],
  'M': ['AIL', 'M_I_'], 'N': ['_EWS', 'NEW_'], 'O': ['_RDER', 'OR_ER'],
  'P': ['_OST', 'POS_'], 'Q': ['_UICK', 'QU_CK'], 'R': ['_OUTE', 'RO_TE'],
  'S': ['_TAMP', 'STA_P'], 'T': ['RUCK', 'TR_CK'], 'U': ['_RGENT', 'UR_ENT'],
  'V': ['_AN', 'V_N'], 'W': ['_RITE', 'WR_TE'], 'X': ['_EROX', 'XE_O_'],
  'Y': ['_ELLOW', 'YEL_OW'], 'Z': ['_ONE', 'ZO_E'],
}

const RECIPIENTS = ['Bubbles', 'Fuse', 'Jeff', 'Newt', 'Pogo', 'Slick', 'Zee']

export class MailCarriersMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private mailIndex = 0; private wordIndex = 0
  private score = 0
  private currentLetter = ''
  private currentWord = ''
  private floatingLetters: FloatingLetter[] = []
  private particles: any[] = []
  private correctFlash = 0; private transition = 0
  private winner = false

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.nextMail()
  }

  private nextMail(): void {
    if (this.mailIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.mailIndex]
    this.wordIndex = 0; this.correctFlash = 0
    this.nextWord()
  }

  private nextWord(): void {
    const words = MAIL_WORDS[this.currentLetter]
    if (!words || this.wordIndex >= words.length) {
      this.mailIndex++; this.transition = 1; return
    }
    this.currentWord = words[this.wordIndex]
    this.spawnLetters()
  }

  private spawnLetters(): void {
    const needed = this.currentLetter
    const options = [needed]
    const pool = ALL_LETTERS.filter(l => l !== needed)
    while (options.length < 5) {
      const p = pool[Math.floor(Math.random() * pool.length)]
      if (!options.includes(p)) options.push(p)
    }
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]
    }
    this.floatingLetters = options.map(l => new FloatingLetter(this.canvasW, this.canvasH, l, 150))
  }

  handleClick(cx: number, cy: number): void {
    if (this.winner || this.correctFlash > 0 || this.transition > 0) return
    for (const l of this.floatingLetters) {
      if (!l.collected && l.containsCanvas(cx, cy)) {
        this.checkLetter(l.letter); l.pop(); return
      }
    }
  }

  handleKey(key: string): void {
    if (this.winner || this.correctFlash > 0 || this.transition > 0) return
    const f = this.floatingLetters.find(l => !l.collected && l.letter.toLowerCase() === key)
    if (f) { this.checkLetter(f.letter); f.pop() }
  }

  private checkLetter(letter: string): void {
    if (letter === this.currentLetter) {
      this.score += 10; this.wordIndex++; this.correctFlash = 1
      for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.4, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#5dade2', life: 0, maxLife: 20 })
      }
      this.onStateChange?.({ score: this.score, delivered: this.mailIndex + 1, total: 26 })
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++
    if (this.transition > 0) {
      this.transition++
      if (this.transition > 30) { this.transition = 0; this.nextMail() }
      return
    }
    if (this.correctFlash > 0) {
      this.correctFlash++
      for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
      this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
      if (this.correctFlash > 30) { this.correctFlash = 0; this.nextWord() }
      return
    }
    for (const l of this.floatingLetters) { l.update(0) }
    this.floatingLetters = this.floatingLetters.filter(l => { if (l.collected) return l.popTime < l.popDuration; return true })
    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
    this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a2a4a'); grad.addColorStop(1, '#2a4a3a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#3a4a3a'; ctx.fillRect(this.canvasW * 0.1, this.canvasH * 0.05, this.canvasW * 0.8, this.canvasH * 0.55)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2
    ctx.strokeRect(this.canvasW * 0.1, this.canvasH * 0.05, this.canvasW * 0.8, this.canvasH * 0.55)

    const ex = this.canvasW / 2 - 40; const ey = this.canvasH * 0.1
    ctx.fillStyle = '#f5f0e0'; ctx.fillRect(ex, ey, 80, 55)
    ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 2; ctx.strokeRect(ex, ey, 80, 55)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('📮', this.canvasW / 2, ey + 20)
    ctx.fillStyle = '#333'; ctx.font = 'bold 24px system-ui'; ctx.textBaseline = 'middle'
    ctx.fillText(this.currentLetter, this.canvasW / 2, ey + 42)

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#5dade2'
    ctx.fillText(`📬 Mail ${this.mailIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`To: ${RECIPIENTS[this.mailIndex % 7]}  Score: ${this.score}`, this.canvasW - 12, 16)

    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Stamp: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.65)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Pop the letter: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.7)
    }

    for (const l of this.floatingLetters) {
      if (!l.collected) l.draw(ctx, this.frame)
      else if (l.popTime < l.popDuration) l.draw(ctx, this.frame)
    }

    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife; if (a <= 0) continue
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill()
    }
    ctx.globalAlpha = 1

    if (this.transition > 0) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.3, this.transition / 15)})`; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#5dade2'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('✉️ Mail delivered! Next stop...', this.canvasW / 2, this.canvasH / 2)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#5dade2'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('📫 Master Mail Carrier! All 26 delivered!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  restart(): void {
    this.mailIndex = 0; this.wordIndex = 0; this.score = 0
    this.floatingLetters = []; this.particles = []
    this.correctFlash = 0; this.transition = 0; this.winner = false; this.frame = 0
    this.nextMail()
  }
}
