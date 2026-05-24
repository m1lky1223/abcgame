import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

const PIZZA_WORDS: Record<string, string[]> = {
  'C': ['_ORN', 'CHEESE'], 'H': ['AM', 'H_OT'], 'M': ['_USHROOM', 'MOZZARELLA'],
  'P': ['EPPERONI', 'P_ZZA'], 'S': ['AUSAGE', 'SA_CE'], 'B': ['ACON', 'BAS_L'],
  'O': ['LIVE', 'ON_ON'], 'T': ['OMATO', 'OPPING'], 'A': ['NCHOVY', 'ART_CHOKE'],
  'R': ['ED PEPPER', 'RIC_OTA'], 'E': ['GGPLANT', 'EXTRA_CHEESE'],
  'L': ['ETTUCE', 'A_ASAGNA'], 'D': ['OUBLE', 'O_GH'], 'F': ['ENNEL', '_ENNEL'],
  'G': ['ARLIC', 'G_REEN'], 'I': ['TALIAN', 'T_LIAN'], 'J': ['ALAPENO', 'J_LAPENO'],
  'K': ['ALE', 'K_LE'], 'N': ['ONIONS', 'O_IONS'], 'Q': ['UESADILLA', 'QU_CHEDDAR'],
  'U': ['MBRELLA', 'UMB_ELLA'], 'V': ['EGGIE', 'V_GGIE'], 'W': ['HEAT', 'WH_AT'],
  'X': ['TRA CHEESE', 'E_TRA'], 'Y': ['OGURT', 'Y_GURT'], 'Z': ['UCCHINI', 'ZU_CHINI'],
}

const ZOMBIE_EMOJIS = ['🧟', '🧟‍♂️', '🧟‍♀️', '💀', '👻', '🦴', '🧠']

export class PizzaDeliveryMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private round = 0; private wordIndex = 0
  private score = 0
  private currentLetter = ''
  private currentWord = ''
  private floatingLetters: FloatingLetter[] = []
  private particles: any[] = []
  private correctFlash = 0; private transition = 0
  private winner = false
  private zombieIndex = 0
  private pizzaProgress = 0

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.nextRound()
  }

  private nextRound(): void {
    if (this.round >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.round]
    this.wordIndex = 0
    this.correctFlash = 0
    this.pizzaProgress = 0
    this.nextWord()
  }

  private nextWord(): void {
    const words = PIZZA_WORDS[this.currentLetter]
    if (!words || this.wordIndex >= words.length) {
      this.round++
      this.transition = 1
      return
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
      this.pizzaProgress++
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.4, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#e74c5c', life: 0, maxLife: 20 })
      }
      this.onStateChange?.({ score: this.score, round: this.round + 1, totalRounds: 26 })
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++

    if (this.transition > 0) {
      this.transition++
      if (this.transition > 30) { this.transition = 0; this.nextRound() }
      return
    }

    if (this.correctFlash > 0) {
      this.correctFlash++
      for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
      this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
      if (this.correctFlash > 30) {
        this.correctFlash = 0
        this.nextWord()
      }
      return
    }

    for (const l of this.floatingLetters) { l.update(0) }
    this.floatingLetters = this.floatingLetters.filter(l => { if (l.collected) return l.popTime < l.popDuration; return true })
    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
    this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#2a1a0a'); grad.addColorStop(0.5, '#4a2a1a'); grad.addColorStop(1, '#6a3a2a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(0, this.canvasH * 0.6, this.canvasW, this.canvasH * 0.4)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(0, this.canvasH * 0.6); ctx.lineTo(this.canvasW, this.canvasH * 0.6); ctx.stroke()

    const cx = this.canvasW / 2; const cy = this.canvasH * 0.45; const r = 50
    ctx.fillStyle = '#d4a04a'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(cx, cy, r - 8, 0, Math.PI * 2); ctx.fill()
    for (let i = 0; i < this.pizzaProgress; i++) {
      const a = (i / 5) * Math.PI * 2; const pr = 8 + Math.random() * 5
      ctx.fillStyle = '#e74c5c'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (r - 20), cy + Math.sin(a) * (r - 20), pr, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(this.currentLetter, cx, cy)

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#e74c5c'
    ctx.fillText(`🍕 Order ${this.round + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Zombie: ${ZOMBIE_EMOJIS[this.zombieIndex]}  Score: ${this.score}`, this.canvasW - 12, 16)
    this.zombieIndex = this.round % 7

    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`I want ${this.currentWord} pizza!`, this.canvasW / 2, 80)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Pop the letter: ${this.currentLetter}`, this.canvasW / 2, 120)
    }

    for (const l of this.floatingLetters) {
      if (!l.collected) l.draw(ctx, this.frame)
      else if (l.popTime < l.popDuration) l.draw(ctx, this.frame)
    }

    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife; if (a <= 0) continue
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2)
      ctx.fillStyle = p.color; ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('Pop the right pizza topping! Press letter keys for bonus', this.canvasW / 2, this.canvasH - 8)

    if (this.transition > 0) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.3, this.transition / 15)})`; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#e74c5c'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🍕 Pizza served! Next order...', this.canvasW / 2, this.canvasH / 2)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#e74c5c'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🍕 Pizza Party! All orders complete!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  restart(): void {
    this.round = 0; this.wordIndex = 0; this.score = 0
    this.floatingLetters = []; this.particles = []
    this.correctFlash = 0; this.transition = 0; this.winner = false; this.frame = 0; this.pizzaProgress = 0
    this.nextRound()
  }
}
