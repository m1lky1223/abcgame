import { ALL_LETTERS, CHARACTERS } from '../characters/data'

interface MemCard {
  letter: string; x: number; y: number; w: number; h: number
  flipped: boolean; matched: boolean
}

const REACTIONS = ['🎉', '🔥', '📋', '🥰', '🤡', '😎', '😴']

export class MemoryMatchMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private score = 0; private combo = 0
  private cards: MemCard[] = []; private selected: number[] = []
  private matched = 0; private totalPairs = 0
  private flipBackTimer = 0; private flipBackCards: number[] = []
  private reactionText = ''; private reactionTimer = 0
  private gameOver = false; private win = false
  private round = 1
  private particles: any[] = []
  private time = 0

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.startRound(1)
  }

  private startRound(round: number): void {
    this.round = round; this.cards = []; this.selected = []
    this.matched = 0; this.flipBackTimer = 0; this.particles = []
    this.time = 0

    const pairCount = round === 1 ? 6 : round === 2 ? 8 : round === 3 ? 10 : 12
    this.totalPairs = pairCount
    const letters = ALL_LETTERS.slice(0, pairCount)
    const deck: MemCard[] = []
    for (const l of letters) {
      deck.push({ letter: l, x: 0, y: 0, w: 48, h: 56, flipped: false, matched: false })
      deck.push({ letter: l, x: 0, y: 0, w: 48, h: 56, flipped: false, matched: false })
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]
    }

    const cols = 4; const gap = 8
    const totalW = cols * (deck[0].w + gap) - gap
    const rows = Math.ceil(deck.length / cols)
    const totalH = rows * (deck[0].h + gap) - gap
    const startX = (this.canvasW - totalW) / 2
    const startY = (this.canvasH - totalH) / 2

    deck.forEach((card, i) => {
      card.x = startX + (i % cols) * (card.w + gap)
      card.y = startY + Math.floor(i / cols) * (card.h + gap)
    })
    this.cards = deck
    this.totalPairs = pairCount
  }

  handleClick(cx: number, cy: number): void {
    if (this.gameOver || this.win || this.flipBackTimer > 0 || this.selected.length >= 2) return

    for (let i = 0; i < this.cards.length; i++) {
      const c = this.cards[i]
      if (c.matched || c.flipped) continue
      if (cx >= c.x && cx <= c.x + c.w && cy >= c.y && cy <= c.y + c.h) {
        c.flipped = true; this.selected.push(i)
        if (this.selected.length === 2) {
          const a = this.cards[this.selected[0]]
          const b = this.cards[this.selected[1]]
          if (a.letter === b.letter) {
            a.matched = true; b.matched = true
            this.matched++; this.combo++
            this.score += 10 * this.combo
            this.reactionText = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]
            this.reactionTimer = 40
            for (let p = 0; p < 10; p++) {
              const ang = Math.random() * Math.PI * 2; const sp = 2 + Math.random() * 3
              this.particles.push({
                x: (a.x + b.x) / 2 + a.w / 2, y: (a.y + b.y) / 2 + a.h / 2,
                vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
                color: '#58d68d', life: 0, maxLife: 20,
              })
            }
            this.selected = []
            this.onStateChange?.({ score: this.score, matched: this.matched, totalPairs: this.totalPairs, round: this.round })
            if (this.matched >= this.totalPairs) {
              if (this.round < 4) { this.flipBackTimer = 60; this.flipBackCards = [1] }
              else { this.win = true }
            }
          } else {
            this.combo = 0
            this.flipBackTimer = 60
            this.flipBackCards = [...this.selected]
          }
        }
        break
      }
    }
  }

  update(): void {
    if (this.gameOver || this.win) { this.frame++; return }
    this.frame++; this.time++

    if (this.flipBackTimer > 0) {
      this.flipBackTimer--
      if (this.flipBackTimer === 0 && this.flipBackCards.length > 1) {
        const a = this.cards[this.flipBackCards[0]]
        const b = this.cards[this.flipBackCards[1]]
        if (a && !a.matched) a.flipped = false
        if (b && !b.matched) b.flipped = false
        this.selected = []
        this.flipBackCards = []
      }
      if (this.flipBackTimer === 0 && this.matched >= this.totalPairs && this.round < 4) {
        this.startRound(this.round + 1)
      }
    }

    if (this.reactionTimer > 0) this.reactionTimer--
    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
    this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#0a0a2e'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#58d68d'
    ctx.fillText(`🧠 Round ${this.round}  Matched: ${this.matched}/${this.totalPairs}`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Score: ${this.score}  ⏱️ ${Math.floor(this.time / 60)}s`, this.canvasW - 12, 16)

    for (const card of this.cards) {
      ctx.save()
      if (card.matched) ctx.globalAlpha = 0.6

      if (card.flipped || card.matched) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.beginPath(); ctx.roundRect(card.x, card.y, card.w, card.h, 6); ctx.fill()
        const def = CHARACTERS[card.letter]
        if (def) {
          ctx.fillStyle = def.bodyColor; ctx.font = 'bold 22px system-ui'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(card.letter, card.x + card.w / 2, card.y + card.h / 2)
        }
      } else {
        ctx.fillStyle = '#2a1a4e'
        ctx.beginPath(); ctx.roundRect(card.x, card.y, card.w, card.h, 6); ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.roundRect(card.x, card.y, card.w, card.h, 6); ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.font = '24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('❓', card.x + card.w / 2, card.y + card.h / 2)
      }
      ctx.restore()
    }

    if (this.reactionTimer > 0) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 24px system-ui'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(this.reactionText, this.canvasW / 2, this.canvasH - 60)
    }

    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife; if (a <= 0) continue
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2)
      ctx.fillStyle = p.color; ctx.fill()
    }
    ctx.globalAlpha = 1

    if (this.win) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#58d68d'; ctx.font = 'bold 30px system-ui'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🧠 Memory Master!', this.canvasW / 2, this.canvasH / 2 - 30)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}  |  Time: ${Math.floor(this.time / 60)}s`, this.canvasW / 2, this.canvasH / 2 + 10)
    }
  }

  restart(): void {
    this.score = 0; this.combo = 0; this.matched = 0; this.frame = 0
    this.particles = []; this.selected = []; this.gameOver = false; this.win = false; this.time = 0
    this.startRound(1)
  }
}
