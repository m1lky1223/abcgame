import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

const CARGO_WORDS: Record<string, string[]> = {
  'A': ['_PPLES', 'A_PLES'], 'B': ['_ANANAS', 'BA_ANAS'], 'C': ['_ARGO', 'CA_GO'],
  'D': ['_ELIVERY', 'DE_IVERY'], 'E': ['N_INE', 'EN_IN_'], 'F': ['_REIGHT', 'FR_IGHT'],
  'G': ['_OODS', 'GO_DS'], 'H': ['_AUL', 'HA_L'], 'I': ['_RON', 'IR_N'],
  'J': ['_OURNEY', 'JO_RNEY'], 'K': ['_ILOS', 'KI_OS'], 'L': ['_UGGAGE', 'LU_GAGE'],
  'M': ['_AIL', 'MA_L'], 'N': ['_EWS', 'NE_S'], 'O': ['_RDER', 'OR_ER'],
  'P': ['_ARCEL', 'PA_CEL'], 'Q': ['_UARTZ', 'QU_ARTZ'], 'R': ['_AILROAD', 'RA_LROAD'],
  'S': ['_TATION', 'ST_TION'], 'T': ['_RACK', 'TR_CK'], 'U': ['_NLOAD', 'UN_OAD'],
  'V': ['_IADUCT', 'VI_DUCT'], 'W': ['_AGON', 'WA_ON'], 'X': ['_PRESS', 'EX_RESS'],
  'Y': ['_ARD', 'YA_D'], 'Z': ['_ONE', 'ZO_E'],
}

const STATION_NAMES = [
  'Alphabet Central', 'Bubble Beach', 'Cookie Crossing', 'Dinosaur Depot',
  'Echo Valley', 'Firefly Forest', 'Garden Grove', 'Harmony Hills',
  'Icicle Inn', 'Jellybean Junction', 'Kite Cove', 'Lighthouse Point',
  'Moonlight Meadow', 'Noodle Nook', 'Orange Orchard', 'Pumpkin Patch',
  'Quilt Square', 'Rainbow Ridge', 'Starlight Station', 'Toy Town',
  'Umbrella Isle', 'Volcano View', 'Waterfall Whistle', 'X-Ray Crossing',
  'Yacht Yard', 'Zephyr Zenith',
]

export class TrainMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private stopIndex = 0; private wordIndex = 0
  private score = 0
  private currentLetter = ''
  private currentWord = ''
  private floatingLetters: FloatingLetter[] = []
  private particles: any[] = []
  private correctFlash = 0; private transition = 0
  private winner = false
  private trainLength = 0

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.nextStop()
  }

  private nextStop(): void {
    if (this.stopIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.stopIndex]
    this.wordIndex = 0; this.correctFlash = 0
    this.nextWord()
  }

  private nextWord(): void {
    const words = CARGO_WORDS[this.currentLetter]
    if (!words || this.wordIndex >= words.length) {
      this.stopIndex++; this.trainLength++; this.transition = 1; return
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
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.35, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#f5b041', life: 0, maxLife: 20 })
      }
      this.onStateChange?.({ score: this.score, stop: this.stopIndex + 1, total: 26 })
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++
    if (this.transition > 0) {
      this.transition++
      if (this.transition > 30) { this.transition = 0; this.nextStop() }
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
    grad.addColorStop(0, '#4a8abd'); grad.addColorStop(1, '#6a9a6a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#5a4a3a'; ctx.fillRect(0, this.canvasH * 0.75, this.canvasW, 8)

    const engineX = 30; const engineY = this.canvasH * 0.65
    ctx.fillStyle = '#e74c5c'; ctx.fillRect(engineX, engineY, 40, 30)
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(engineX + 40, engineY); ctx.lineTo(engineX + 50, engineY - 15); ctx.lineTo(engineX + 40, engineY - 15); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(engineX + 20, engineY + 30, 8, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(engineX + 35, engineY + 30, 8, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🚂', engineX + 20, engineY + 15)

    for (let c = 0; c < this.trainLength && c < 10; c++) {
      const cx = engineX + 45 + c * 30
      ctx.fillStyle = ['#5dade2', '#58d68d', '#f5b041', '#9b59b6', '#e67e22'][c % 5]
      ctx.fillRect(cx, engineY + 5, 25, 20)
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(cx + 8, engineY + 25, 5, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + 18, engineY + 25, 5, 0, Math.PI * 2); ctx.fill()
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`🚄 Stop ${this.stopIndex + 1}/26: ${STATION_NAMES[this.stopIndex] || ''}`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#58d68d'
    ctx.fillText(`Cars: ${this.trainLength}  Score: ${this.score}`, this.canvasW - 12, 16)

    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 26px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Load cargo: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.35)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Pop the letter: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.4)
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
      ctx.fillStyle = '#f5b041'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🚂 CHOO-CHOO! Cargo loaded! Next stop!', this.canvasW / 2, this.canvasH / 2)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#f5b041'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🚂 All Aboard! Alphabet Train complete!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#58d68d'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  restart(): void {
    this.stopIndex = 0; this.wordIndex = 0; this.score = 0
    this.floatingLetters = []; this.particles = []
    this.correctFlash = 0; this.transition = 0; this.winner = false; this.frame = 0; this.trainLength = 0
    this.nextStop()
  }
}
