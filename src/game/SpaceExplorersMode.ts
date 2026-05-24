import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

const DISCOVERIES: Record<string, string> = {
  'A': 'Asteroid Alpha', 'B': 'Blue Nebula', 'C': 'Comet Cheddar', 'D': 'Dwarf Star Doris',
  'E': 'Exoplanet Echo', 'F': 'Flare Star Felix', 'G': 'Galaxy Gumball', 'H': 'Helix Nebula Honey',
  'I': 'Ice Moon Ivan', 'J': "Jupiter's Jewel", 'K': 'Kepler-Key System', 'L': 'Lunar Lake Lulu',
  'M': 'Mars Meadow', 'N': 'Neutron Star Noodle', 'O': 'Orbit Ring Olive', 'P': "Pluto's Pal",
  'Q': 'Quasar Quartz', 'R': 'Red Giant Ralph', 'S': "Saturn's Sparkle", 'T': 'Terra Twin Tilly',
  'U': "Uranus' Umbrella", 'V': 'Venus Valley', 'W': 'Wormhole Wendy', 'X': 'X-Ray Star Xander',
  'Y': 'Yellow Dwarf Yuki', 'Z': 'Zenith Zone Zero',
}

const SIGNAL_WORDS: Record<string, string[]> = {
  'A': ['ST_R', 'S_A_'], 'B': ['N_BULA', 'NE_ULA'], 'C': ['_OMET', 'CO_ET'],
  'D': ['WARF', 'DW_RF'], 'E': ['XOPLANET', 'EX_PLANET'], 'F': ['L_RE', 'FL_RE'],
  'G': ['_ALAXY', 'GA_AXY'], 'H': ['N_BULA', 'NE_ULA'], 'I': ['C_ MOON', 'IC_ MOON'],
  'J': ['_UPITER', 'JU_ITER'], 'K': ['_EPLER', 'KE_LER'], 'L': ['_UNAR', 'LU_AR'],
  'M': ['_ARS', 'MA_S'], 'N': ['EUTRON', 'NE_TRON'], 'O': ['_RBIT', 'OR_IT'],
  'P': ['_LUTO', 'PL_TO'], 'Q': ['_UASAR', 'QU_SAR'], 'R': ['E_ GIANT', 'RE_ GIANT'],
  'S': ['_ATURN', 'SA_URN'], 'T': ['_ERRA', 'TE_RA'], 'U': ['_RANUS', 'UR_NUS'],
  'V': ['_ENUS', 'VE_US'], 'W': ['_ORMHOLE', 'WO_MHOLE'], 'X': ['_RAY', 'X_A_'],
  'Y': ['_ELLOW', 'YE_OW'], 'Z': ['_ENITH', 'ZE_ITH'],
}

export class SpaceExplorersMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private discoveryIndex = 0; private wordIndex = 0
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
    this.nextDiscovery()
  }

  private nextDiscovery(): void {
    if (this.discoveryIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.discoveryIndex]
    this.wordIndex = 0; this.correctFlash = 0
    this.nextWord()
  }

  private nextWord(): void {
    const words = SIGNAL_WORDS[this.currentLetter]
    if (!words || this.wordIndex >= words.length) {
      this.discoveryIndex++; this.transition = 1; return
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
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.35, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#f5b041', life: 0, maxLife: 20 })
      }
      this.onStateChange?.({ score: this.score, discovery: this.discoveryIndex + 1, total: 26 })
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++
    if (this.transition > 0) {
      this.transition++
      if (this.transition > 30) { this.transition = 0; this.nextDiscovery() }
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
    grad.addColorStop(0, '#050510'); grad.addColorStop(1, '#0a0a2a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    for (let i = 0; i < 30; i++) {
      const sx = (i * 137 + this.frame * 0.5) % this.canvasW
      const sy = (i * 97) % this.canvasH
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(i + this.frame * 0.02) * 0.1})`
      ctx.beginPath(); ctx.arc(sx, sy, 1 + (i % 3), 0, Math.PI * 2); ctx.fill()
    }

    ctx.fillStyle = 'rgba(100,150,255,0.1)'
    ctx.beginPath(); ctx.arc(this.canvasW * 0.8, this.canvasH * 0.2, 40, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(150,200,255,0.15)'
    ctx.beginPath(); ctx.arc(this.canvasW * 0.2, this.canvasH * 0.8, 30, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#2a3a5a'; ctx.fillRect(this.canvasW * 0.1, this.canvasH * 0.05, this.canvasW * 0.8, 50)
    ctx.strokeStyle = 'rgba(100,200,255,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(this.canvasW * 0.1, this.canvasH * 0.05, this.canvasW * 0.8, 50)
    ctx.fillStyle = '#5dade2'; ctx.font = '12px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText('📡 MISSION CONTROL', this.canvasW * 0.12, this.canvasH * 0.08)
    ctx.fillStyle = '#58d68d'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'right'
    ctx.fillText(`Signal: "${this.currentWord}"`, this.canvasW * 0.88, this.canvasH * 0.08)

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#5dade2'
    ctx.fillText(`🚀 Discovery ${this.discoveryIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Score: ${this.score}`, this.canvasW - 12, 16)

    const disc = DISCOVERIES[this.currentLetter]
    if (disc && this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 20px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Discover: ${disc}`, this.canvasW / 2, this.canvasH * 0.45)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Complete signal: pop ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.5)
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
      ctx.fillText(`⭐ Discovered! Signal to next system...`, this.canvasW / 2, this.canvasH / 2)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#5dade2'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🌌 Galactic Explorer! All 26 discovered!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  restart(): void {
    this.discoveryIndex = 0; this.wordIndex = 0; this.score = 0
    this.floatingLetters = []; this.particles = []
    this.correctFlash = 0; this.transition = 0; this.winner = false; this.frame = 0
    this.nextDiscovery()
  }
}
