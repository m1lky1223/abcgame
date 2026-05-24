import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

const SYMPTOM_WORDS: Record<string, string[]> = {
  'A': ['ALLER_Y', '_LLERGY'], 'B': ['_ANDAGE', 'BA_DAGE'], 'C': ['_HECKUP', 'CH_CKUP'],
  'D': ['_ENTAL', 'DE_TAL'], 'E': ['_MERGENCY', 'EM_RGENCY'], 'F': ['_RACTURE', 'FR_CTURE'],
  'G': ['_ENERAL', 'GE_ERAL'], 'H': ['_YGIENE', 'HY_IENT'], 'I': ['_CU', 'IC_'],
  'J': ['_OINT', 'JO_NT'], 'K': ['_IDS', 'KI_S'], 'L': ['_AB', 'LA_'],
  'M': ['_ATERNITY', 'MA_ERNITY'], 'N': ['_EUROLOGY', 'NE_ROLOGY'], 'O': ['_PERATING', 'OP_RATING'],
  'P': ['_HARMACY', 'PH_RMACY'], 'Q': ['_UIET', 'QU_ET'], 'R': ['_ECOVERY', 'RE_OVERY'],
  'S': ['_URGERY', 'SU_GERY'], 'T': ['_REATMENT', 'TR_ATMENT'], 'U': ['_LTRASOUND', 'UL_RASOUND'],
  'V': ['_ACCINATION', 'VA_CINATION'], 'W': ['_AITING', 'WA_TING'], 'X': ['_RAY', 'X_A_'],
  'Y': ['_OGA', 'YO_A'], 'Z': ['_OOM CARE', 'ZO_M CARE'],
}

export class DoctorMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private patientIndex = 0; private wordIndex = 0
  private score = 0
  private currentLetter = ''
  private currentWord = ''
  private floatingLetters: FloatingLetter[] = []
  private particles: any[] = []
  private correctFlash = 0; private transition = 0
  private winner = false
  private patientRecovered = false

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.nextPatient()
  }

  private nextPatient(): void {
    if (this.patientIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.patientIndex]
    this.wordIndex = 0; this.correctFlash = 0; this.patientRecovered = false
    this.nextWord()
  }

  private nextWord(): void {
    const words = SYMPTOM_WORDS[this.currentLetter]
    if (!words || this.wordIndex >= words.length) {
      this.patientRecovered = true
      this.patientIndex++; this.transition = 1; return
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
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.4, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#e74c5c', life: 0, maxLife: 20 })
      }
      this.onStateChange?.({ score: this.score, patient: this.patientIndex + 1, total: 26 })
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++
    if (this.transition > 0) {
      this.transition++
      if (this.transition > 30) { this.transition = 0; this.nextPatient() }
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
    grad.addColorStop(0, '#e8f0f8'); grad.addColorStop(1, '#c8d8e8')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    const bx = this.canvasW / 2 - 50; const by = this.canvasH * 0.1
    ctx.fillStyle = '#d0d8e0'; ctx.fillRect(bx, by, 100, 70)
    ctx.strokeStyle = '#aab'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, 100, 70)
    ctx.fillStyle = '#8a9aaa'; ctx.fillRect(bx + 10, by + 10, 80, 5)
    ctx.fillRect(bx + 10, by + 25, 60, 5)
    ctx.fillRect(bx + 10, by + 40, 70, 5)

    ctx.fillStyle = this.patientRecovered ? '#58d68d' : '#5a8a6a'
    ctx.beginPath(); ctx.arc(this.canvasW / 2, by - 10, 18, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(this.canvasW / 2 - 5, by - 12, 3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(this.canvasW / 2 + 5, by - 12, 3, 0, Math.PI * 2); ctx.fill()
    if (this.patientRecovered) {
      ctx.strokeStyle = '#58d68d'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(this.canvasW / 2, by + 5, 6, 0, Math.PI); ctx.stroke()
      ctx.fillStyle = '#e74c5c'; ctx.font = '16px system-ui'; ctx.textAlign = 'center'
      ctx.fillText('❤️', this.canvasW / 2, by + 25)
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#333'
    ctx.fillText(`🏥 Patient ${this.patientIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#e74c5c'
    ctx.fillText(`Score: ${this.score}`, this.canvasW - 12, 16)

    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#333'; ctx.font = 'bold 26px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Symptom: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.5)
      ctx.fillStyle = '#666'; ctx.font = '14px system-ui'
      ctx.fillText(`Give medicine: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.55)
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
      ctx.fillStyle = '#58d68d'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('💊 Patient cured! Next case...', this.canvasW / 2, this.canvasH / 2)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#58d68d'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🏆 Doctor of the Year! All 26 cured!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  restart(): void {
    this.patientIndex = 0; this.wordIndex = 0; this.score = 0
    this.floatingLetters = []; this.particles = []
    this.correctFlash = 0; this.transition = 0; this.winner = false; this.frame = 0; this.patientRecovered = false
    this.nextPatient()
  }
}
