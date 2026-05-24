import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

const TREAT_WORDS: Record<string, string[]> = {
  'A': ['_PPLE PIE', 'AP_LE PIE'], 'B': ['_UTTER CAKE', 'BU_TER CAKE'], 'C': ['_ROISSANT', 'CR_ISSANT'],
  'D': ['_ONUT', 'DO_UT'], 'E': ['_CLAIR', 'EC_IR'], 'F': ['_UNNEL CAKE', 'FU_NEL CAKE'],
  'G': ['_INGERBREAD', 'GI_GERBREAD'], 'H': ['_ONEY CAKE', 'HO_EY CAKE'], 'I': ['_CE CREAM', 'IC_ CREAM'],
  'J': ['_AM TART', 'JA_ TART'], 'K': ['_EY LIME', 'KE_ LIME'], 'L': ['_OLLIPOP', 'LO_LIPOP'],
  'M': ['_ACARON', 'MA_ARON'], 'N': ['_OUGAT', 'NO_GAT'], 'O': ['_ATMEAL', 'OA_EAL'],
  'P': ['_ANCAKE', 'PA_CAKE'], 'Q': ['_UICHE', 'QU_CHE'], 'R': ['_UGELACH', 'RU_ELACH'],
  'S': ['_CONE', 'SC_NE'], 'T': ['_IRAMISU', 'TI_AMISU'], 'U': ['_PSIDE DOWN', 'UP_IDE DOWN'],
  'V': ['_ANILLA', 'VA_ILLA'], 'W': ['_AFFLE', 'WA_FLE'], 'X': ['_MAS PUDDING', 'XMA_ PUDDING'],
  'Y': ['_OGURT', 'YO_URT'], 'Z': ['_EBRA CAKE', 'ZE_RA CAKE'],
}

const ZOMBIE_NAMES = ['Classic', 'Decayed', 'Toxic', 'Undead', 'Rotten', 'Ghoul', 'Mutant']

export class BakeryMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private customerIndex = 0; private wordIndex = 0
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
    this.nextCustomer()
  }

  private nextCustomer(): void {
    if (this.customerIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.customerIndex]
    this.wordIndex = 0; this.correctFlash = 0
    this.nextWord()
  }

  private nextWord(): void {
    const words = TREAT_WORDS[this.currentLetter]
    if (!words || this.wordIndex >= words.length) {
      this.customerIndex++; this.transition = 1; return
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
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.4, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#e67e22', life: 0, maxLife: 20 })
      }
      this.onStateChange?.({ score: this.score, customer: this.customerIndex + 1, total: 26 })
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++
    if (this.transition > 0) {
      this.transition++
      if (this.transition > 30) { this.transition = 0; this.nextCustomer() }
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
    grad.addColorStop(0, '#f5e6d0'); grad.addColorStop(1, '#e8d4b8')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#d4a04a'; ctx.fillRect(0, this.canvasH * 0.55, this.canvasW, 6)
    ctx.fillStyle = '#c09030'; ctx.fillRect(0, this.canvasH * 0.55, this.canvasW, 2)

    ctx.fillStyle = '#8a6a4a'; ctx.fillRect(this.canvasW * 0.7, this.canvasH * 0.2, 60, 80)
    ctx.fillStyle = 'rgba(255,100,0,0.15)'; ctx.beginPath()
    ctx.arc(this.canvasW * 0.7 + 30, this.canvasH * 0.2 + 10, 20, Math.PI, 0); ctx.fill()

    ctx.fillStyle = '#6a4a2a'; ctx.fillRect(this.canvasW * 0.05, this.canvasH * 0.15, 50, 60)
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = ['#e74c5c', '#f5b041', '#58d68d'][i]
      ctx.fillRect(this.canvasW * 0.08, this.canvasH * 0.18 + i * 18, 10, 10)
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#e67e22'
    ctx.fillText(`🧁 Treat ${this.customerIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#8a4a2a'
    ctx.fillText(`Customer: ${ZOMBIE_NAMES[this.customerIndex % 7]}  Score: ${this.score}`, this.canvasW - 12, 16)

    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#4a2a1a'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Order: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.55)
      ctx.fillStyle = '#8a6a4a'; ctx.font = '14px system-ui'
      ctx.fillText(`Bake the letter: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.6)
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
      ctx.fillStyle = '#e67e22'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🧁 Treat served! Next customer!', this.canvasW / 2, this.canvasH / 2)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#e67e22'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🎂 Master Baker! All 26 treats served!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  restart(): void {
    this.customerIndex = 0; this.wordIndex = 0; this.score = 0
    this.floatingLetters = []; this.particles = []
    this.correctFlash = 0; this.transition = 0; this.winner = false; this.frame = 0
    this.nextCustomer()
  }
}
