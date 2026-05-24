import { ALL_LETTERS } from '../characters/data'

interface SceneObject {
  x: number; y: number; w: number; h: number
  type: 'fragment' | 'witness' | 'decoration'
  label: string; found: boolean
  emoji: string
}

const SCENES: { theme: string; objects: { emoji: string; label: string; type: string }[] }[] = [
  { theme: 'Apple Orchard 🍎', objects: [
    { emoji: '🍎', label: 'Apple tree', type: 'fragment' },
    { emoji: '🐦', label: 'Bird nest', type: 'fragment' },
    { emoji: '🧺', label: 'Basket', type: 'fragment' },
    { emoji: '🧟', label: 'Zombie farmer', type: 'witness' },
    { emoji: '🌳', label: 'Old oak', type: 'witness' },
    { emoji: '🪨', label: 'Rock', type: 'decoration' },
    { emoji: '🌻', label: 'Sunflower', type: 'decoration' },
    { emoji: '🪣', label: 'Bucket', type: 'decoration' },
  ]},
  { theme: 'Enchanted Castle 🏰', objects: [
    { emoji: '🗝️', label: 'Key', type: 'fragment' },
    { emoji: '📜', label: 'Scroll', type: 'fragment' },
    { emoji: '👑', label: 'Crown', type: 'fragment' },
    { emoji: '🧟', label: 'Guard zombie', type: 'witness' },
    { emoji: '🪞', label: 'Mirror', type: 'witness' },
    { emoji: '🕯️', label: 'Candle', type: 'decoration' },
    { emoji: '🛡️', label: 'Shield', type: 'decoration' },
    { emoji: '⚔️', label: 'Sword', type: 'decoration' },
  ]},
  { theme: 'Space Station 🚀', objects: [
    { emoji: '🛸', label: 'UFO', type: 'fragment' },
    { emoji: '🔭', label: 'Telescope', type: 'fragment' },
    { emoji: '🧪', label: 'Alien sample', type: 'fragment' },
    { emoji: '👽', label: 'Alien zombie', type: 'witness' },
    { emoji: '🛰️', label: 'Satellite', type: 'witness' },
    { emoji: '🌑', label: 'Moon rock', type: 'decoration' },
    { emoji: '💫', label: 'Sparkle', type: 'decoration' },
    { emoji: '🪐', label: 'Planet', type: 'decoration' },
  ]},
]

const WITNESS_LINES = [
  '"I saw something round... like a circle!"',
  '"It was green! Very green!"',
  '"It happened at midnight!"',
  '"It smelled funny!"',
  '"There was a strange sound!"',
  '"It was... different. Very different!"',
  '"I was sleeping. But I heard something!"',
]

export class DetectiveMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private caseIndex = 0
  private currentLetter = ''
  private objects: SceneObject[] = []
  private fragmentsFound = 0
  private solved: string[] = []
  private particles: any[] = []
  private clueText = ''; private clueTimer = 0
  private showLetter = false; private letterTimer = 0
  private transition = 0; private winner = false
  private score = 0

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.startCase()
  }

  private startCase(): void {
    this.currentLetter = ALL_LETTERS[this.caseIndex]
    this.fragmentsFound = 0; this.showLetter = false; this.letterTimer = 0
    this.transition = 0; this.clueText = ''; this.clueTimer = 0

    const scene = SCENES[this.caseIndex % SCENES.length]
    this.objects = scene.objects.map((o, i) => ({
      x: 40 + (i % 4) * ((this.canvasW - 80) / 4),
      y: this.canvasH * 0.25 + Math.floor(i / 4) * 80,
      w: 50, h: 50,
      type: o.type as any,
      label: o.label,
      found: false,
      emoji: o.emoji,
    }))

    let fragCount = 0
    for (const o of this.objects) {
      if (o.type === 'fragment') {
        if (fragCount > 0) o.type = 'decoration'
        fragCount++
      }
    }
    const frags = this.objects.filter(o => o.type === 'fragment')
    for (let i = frags.length; i < 3; i++) {
      const deco = this.objects.find(o => o.type === 'decoration' && !o.found)
      if (deco) deco.type = 'fragment'
    }
  }

  handleClick(cx: number, cy: number): void {
    if (this.winner || this.clueTimer > 0 || this.transition > 0) return

    if (this.showLetter) {
      const lx = this.canvasW / 2 - 20; const ly = this.canvasH * 0.6
      if (cx >= lx && cx <= lx + 40 && cy >= ly && cy <= ly + 50) {
        this.score += 10; this.solved.push(this.currentLetter)
        this.caseIndex++
        if (this.caseIndex >= 26) { this.winner = true }
        else this.transition = 1
        this.onStateChange?.({ score: this.score, solved: this.solved.length, totalCases: 26 })
      }
      return
    }

    for (const o of this.objects) {
      if (o.found) continue
      if (cx >= o.x && cx <= o.x + o.w && cy >= o.y && cy <= o.y + o.h) {
        o.found = true
        if (o.type === 'fragment') {
          this.fragmentsFound++
          for (let p = 0; p < 8; p++) {
            const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
            this.particles.push({ x: o.x + o.w / 2, y: o.y + o.h / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#5dade2', life: 0, maxLife: 20 })
          }
          if (this.fragmentsFound >= 3) { this.showLetter = true; this.letterTimer = 0 }
        } else if (o.type === 'witness') {
          this.clueText = WITNESS_LINES[Math.floor(Math.random() * WITNESS_LINES.length)]
          this.clueTimer = 80
        }
        return
      }
    }
  }

  update(): void {
    this.frame++
    if (this.winner) return
    if (this.clueTimer > 0) this.clueTimer--
    if (this.letterTimer >= 0 && this.showLetter) this.letterTimer++

    if (this.transition > 0) {
      this.transition++
      if (this.transition > 60) { this.transition = 0; this.startCase() }
    }

    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
    this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const scene = SCENES[this.caseIndex % SCENES.length]
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a2a1a'); grad.addColorStop(1, '#2a3a2a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#5dade2'
    ctx.fillText(`🔍 Case ${this.caseIndex + 1}/26: ${scene.theme}`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Found: ${this.fragmentsFound}/3`, this.canvasW - 12, 16)

    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText(`Find the missing letter: ${this.currentLetter}`, this.canvasW / 2, 45)

    for (const o of this.objects) {
      if (o.found) {
        ctx.globalAlpha = 0.4
        ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(o.x, o.y, o.w, o.h)
      }
      ctx.font = '32px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(o.found ? '✅' : o.emoji, o.x + o.w / 2, o.y + o.h / 2)
      ctx.globalAlpha = 1
      if (!o.found) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 6); ctx.stroke()
      }
    }

    if (this.showLetter) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(this.canvasW / 2 - 50, this.canvasH * 0.55, 100, 70)
      const bob = Math.sin(this.frame * 0.08) * 4
      ctx.fillStyle = '#fff'; ctx.font = 'bold 36px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(this.currentLetter, this.canvasW / 2, this.canvasH * 0.6 + bob)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px system-ui'
      ctx.fillText('Click to collect!', this.canvasW / 2, this.canvasH * 0.6 + 30)
    }

    if (this.clueTimer > 0) {
      ctx.fillStyle = `rgba(0,0,0,0.7)`
      ctx.beginPath(); ctx.roundRect(this.canvasW / 2 - 160, this.canvasH - 80, 320, 40, 8); ctx.fill()
      ctx.fillStyle = '#ffd'; ctx.font = '12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(this.clueText, this.canvasW / 2, this.canvasH - 60)
    }

    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife; if (a <= 0) continue
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2)
      ctx.fillStyle = p.color; ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '11px system-ui'; ctx.textAlign = 'center'
    ctx.fillText(`🔎 Cases solved: ${this.solved.length}/26`, this.canvasW / 2, this.canvasH - 10)

    if (this.transition > 0) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.4, this.transition / 30)})`; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#5dade2'; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`Case Solved! 🔍`, this.canvasW / 2, this.canvasH / 2)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#5dade2'; ctx.font = 'bold 30px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🕵️ Master Detective!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#fff'; ctx.font = '16px system-ui'
      ctx.fillText('All 26 cases solved!', this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  restart(): void {
    this.caseIndex = 0; this.solved = []; this.fragmentsFound = 0
    this.particles = []; this.clueText = ''; this.clueTimer = 0
    this.showLetter = false; this.letterTimer = 0; this.transition = 0
    this.winner = false; this.score = 0; this.frame = 0
    this.startCase()
  }
}
