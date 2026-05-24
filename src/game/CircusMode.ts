import { ALL_LETTERS } from '../characters/data'

interface CircusItem {
  x: number; y: number; letter: string
  alive: boolean; collected: boolean
  bobPhase: number; drift: number; type: string
}

interface Confetti {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; color: string; w: number; h: number
}

const ACTS = [
  { name: "Bubbles' Fire Hoop", oddbod: 'Bubbles', icon: '🔥', zombie: 'Juggler', desc: 'Zombie jumps through a flaming hoop!' },
  { name: "Fuse's Cannonball", oddbod: 'Fuse', icon: '🚀', zombie: 'Strongman', desc: 'Zombie blasts from the cannon!' },
  { name: "Jeff's Tightrope", oddbod: 'Jeff', icon: '🎪', zombie: 'Acrobat', desc: 'Zombie walks the tightrope!' },
  { name: "Newt's Ribbon Dance", oddbod: 'Newt', icon: '🎀', zombie: 'Contortionist', desc: 'Zombie twirls on the ribbon!' },
  { name: "Pogo's Clown Car", oddbod: 'Pogo', icon: '🚗', zombie: 'Clown', desc: 'Find the right zombie in the car!' },
  { name: "Slick's Juggling", oddbod: 'Slick', icon: '🤹', zombie: 'Magician', desc: 'Zombie catches the right torch!' },
  { name: "Zee's Sleeping Tightrope", oddbod: 'Zee', icon: '😴', zombie: 'Fire Eater', desc: 'Quiet now — Zee is sleeping!' },
]

const WORDS_POOL = [
  { word: 'CIRCUS', emoji: '🎪', blankIndex: 0 },
  { word: 'TIGER', emoji: '🐯', blankIndex: 1 },
  { word: 'CLOWN', emoji: '🤡', blankIndex: 4 },
  { word: 'MAGIC', emoji: '🪄', blankIndex: 2 },
  { word: 'CANON', emoji: '💥', blankIndex: 0 },
  { word: 'DANCE', emoji: '💃', blankIndex: 1 },
  { word: 'JUGLE', emoji: '🤹', blankIndex: 3 },
  { word: 'LION', emoji: '🦁', blankIndex: 2 },
  { word: 'TENT', emoji: '⛺', blankIndex: 0 },
  { word: 'RING', emoji: '⭕', blankIndex: 1 },
  { word: 'TRICK', emoji: '✨', blankIndex: 4 },
  { word: 'STAR', emoji: '⭐', blankIndex: 2 },
  { word: 'FIRE', emoji: '🔥', blankIndex: 0 },
  { word: 'ROPE', emoji: '🪢', blankIndex: 1 },
  { word: 'ACRO', emoji: '🤸', blankIndex: 3 },
  { word: 'BALLOON', emoji: '🎈', blankIndex: 4 },
  { word: 'CONFETI', emoji: '🎊', blankIndex: 1 },
  { word: 'SPOTLIGHT', emoji: '🔦', blankIndex: 2 },
  { word: 'AUDIENCE', emoji: '👏', blankIndex: 0 },
  { word: 'PERFORM', emoji: '🎭', blankIndex: 3 },
  { word: 'AMAZE', emoji: '😲', blankIndex: 4 },
  { word: 'CHEER', emoji: '📣', blankIndex: 1 },
  { word: 'BRAVO', emoji: '👏', blankIndex: 2 },
  { word: 'ENCORE', emoji: '🎵', blankIndex: 0 },
  { word: 'FLIP', emoji: '🤸', blankIndex: 1 },
  { word: 'SPIN', emoji: '🌀', blankIndex: 3 },
  { word: 'LEAP', emoji: '🦘', blankIndex: 2 },
  { word: 'SOAR', emoji: '🦅', blankIndex: 0 },
]

interface WordDef {
  word: string; emoji: string; blankIndex: number
}

export class CircusMode {
  private canvasW: number
  private canvasH: number
  private frame = 0
  private score = 0
  private actIndex = 0
  private wordInAct = 0
  private totalCorrect = 0
  private currentWord: WordDef | null = null
  private correctLetter = ''
  private items: CircusItem[] = []
  private confetti: Confetti[] = []
  private showTrick = 0
  private showSlip = 0
  private transition = 0
  private completed = false
  private usedIndices: number[] = []
  private starCount = 0

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.startRound()
  }

  private pickWord(): WordDef {
    let idx: number
    do {
      idx = Math.floor(Math.random() * WORDS_POOL.length)
    } while (this.usedIndices.includes(idx) && this.usedIndices.length < WORDS_POOL.length)
    this.usedIndices.push(idx)
    return WORDS_POOL[idx]
  }

  private startRound(): void {
    if (this.actIndex >= ACTS.length) {
      this.completed = true
      this.onStateChange?.({
        score: this.score, totalCollected: 28,
        currentLevel: this.actIndex, totalLevels: ACTS.length,
        winner: 'human',
      })
      return
    }

    if (this.wordInAct >= 4) {
      this.actIndex++
      this.wordInAct = 0
      this.starCount++
      this.score += 10
      if (this.actIndex >= ACTS.length) {
        this.completed = true
        this.onStateChange?.({
          score: this.score, totalCollected: 28,
          currentLevel: this.actIndex, totalLevels: ACTS.length,
          winner: 'human',
        })
        return
      }
    }

    this.currentWord = this.pickWord()
    this.correctLetter = this.currentWord.word[this.currentWord.blankIndex]
    this.showTrick = 0
    this.showSlip = 0
    this.items = []
    this.confetti = []

    const distractors = [this.correctLetter]
    const pool = ALL_LETTERS.filter(l => l !== this.correctLetter)
    while (distractors.length < 6) {
      const pick = pool[Math.floor(Math.random() * pool.length)]
      if (!distractors.includes(pick)) distractors.push(pick)
    }
    distractors.sort(() => Math.random() - 0.5)

    const types = ['🎪', '🤡', '🪄', '🔥', '🎈', '⭐']
    const itemCount = distractors.length
    const spacing = Math.min(100, (this.canvasW - 60) / itemCount)
    const startX = (this.canvasW - spacing * (itemCount - 1)) / 2
    const itemY = this.canvasH * 0.55
    this.items = distractors.map((l, i) => ({
      x: startX + i * spacing, y: itemY, letter: l,
      alive: true, collected: false,
      bobPhase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.5,
      type: types[i % types.length],
    }))
  }

  handleClick(cx: number, cy: number): void {
    if (this.completed || this.showTrick > 0 || this.showSlip > 0 || this.transition > 0) return

    for (const item of this.items) {
      if (!item.alive || item.collected) continue
      const r = 22
      if (Math.abs(cx - item.x) < r && Math.abs(cy - item.y) < r) {
        if (item.letter === this.correctLetter) {
          item.collected = true
          this.totalCorrect++
          this.wordInAct++
          this.showTrick = 50
          for (let i = 0; i < 25; i++) {
            const a = Math.random() * Math.PI * 2
            const s = 2 + Math.random() * 5
            this.confetti.push({
              x: item.x, y: item.y,
              vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3,
              life: 0, maxLife: 35 + Math.random() * 25,
              color: ['#e74c5c', '#f5b041', '#58d68d', '#5dade2', '#af7ac5', '#FFD700'][Math.floor(Math.random() * 6)],
              w: 4 + Math.random() * 4, h: 2 + Math.random() * 4,
            })
          }
          this.onStateChange?.({ score: this.score, totalCollected: this.totalCorrect, currentLevel: this.actIndex + 1, totalLevels: ACTS.length })
        } else {
          this.showSlip = 30
        }
        return
      }
    }
  }

  handleKey(key: string): void {
    if (this.completed || this.showTrick > 0 || this.showSlip > 0 || this.transition > 0) return
    const upper = key.toUpperCase()
    for (const item of this.items) {
      if (!item.alive || item.collected) continue
      if (item.letter === upper) {
        item.collected = true
        this.totalCorrect++
        this.wordInAct++
        this.score += 2
        this.showTrick = 50
        for (let i = 0; i < 25; i++) {
          const a = Math.random() * Math.PI * 2
          const s = 2 + Math.random() * 5
          this.confetti.push({
            x: item.x, y: item.y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3,
            life: 0, maxLife: 35 + Math.random() * 25,
            color: ['#e74c5c', '#f5b041', '#58d68d', '#5dade2', '#af7ac5', '#FFD700'][Math.floor(Math.random() * 6)],
            w: 4 + Math.random() * 4, h: 2 + Math.random() * 4,
          })
        }
        this.onStateChange?.({ score: this.score, totalCollected: this.totalCorrect, currentLevel: this.actIndex + 1, totalLevels: ACTS.length })
        return
      }
    }
  }

  update(): void {
    this.frame++
    if (this.completed) return

    if (this.showSlip > 0) {
      this.showSlip--
      return
    }

    if (this.showTrick > 0) {
      this.showTrick--
      for (const c of this.confetti) {
        c.x += c.vx; c.y += c.vy
        c.vy += 0.15
        c.life++
        c.vx *= 0.97
      }
      this.confetti = this.confetti.filter(c => c.life < c.maxLife)
      if (this.showTrick <= 0) {
        this.confetti = []
        this.transition = 30
      }
      return
    }

    if (this.transition > 0) {
      this.transition--
      if (this.transition <= 0) {
        this.startRound()
      }
      return
    }

    for (const item of this.items) {
      if (item.collected) continue
      item.y += Math.sin((this.frame + item.bobPhase) * 0.025) * 0.4
      item.x += Math.sin((this.frame + item.bobPhase) * 0.012) * item.drift
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const w = this.canvasW
    const h = this.canvasH

    this.drawTent(ctx, w, h)

    if (this.currentWord) {
      this.drawSign(ctx, w, h)
    }

    for (const item of this.items) {
      if (item.collected) continue
      this.drawItem(ctx, item)
    }

    for (const c of this.confetti) {
      const a = 1 - c.life / c.maxLife
      if (a <= 0) continue
      ctx.globalAlpha = a
      ctx.fillStyle = c.color
      ctx.fillRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h)
    }
    ctx.globalAlpha = 1

    if (this.showSlip > 0) {
      const b = Math.sin(this.showSlip * 0.4) * 8
      ctx.font = '32px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🍌', w / 2 + b, h * 0.5)
    }

    this.drawRingmaster(ctx, w, h)
    this.drawAudience(ctx, w, h)
    this.drawHUD(ctx, w, h)

    if (this.showTrick > 0) {
      this.drawTrickAnimation(ctx, w, h)
    }

    if (this.transition > 0) {
      const alpha = Math.min(1, (30 - this.transition) / 15)
      ctx.fillStyle = `rgba(0,0,0,${alpha * 0.4})`
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      ctx.font = 'bold 26px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      if (this.wordInAct === 0 && this.actIndex < ACTS.length) {
        ctx.fillText(`🎪 ${ACTS[this.actIndex].name}!`, w / 2, h / 2 - 10)
        ctx.fillStyle = `rgba(200,200,200,${alpha * 0.7})`
        ctx.font = '16px system-ui'
        ctx.fillText(ACTS[this.actIndex].desc, w / 2, h / 2 + 25)
      } else {
        ctx.fillText(`✨ ${ACTS[this.actIndex - 1]?.name || 'Act'} Complete!`, w / 2, h / 2)
      }
    }

    if (this.completed) return
  }

  private drawTent(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#1a0a2a')
    grad.addColorStop(0.3, '#2a1a3a')
    grad.addColorStop(0.7, '#3a1a1a')
    grad.addColorStop(1, '#1a0a0a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    const stripeW = w / 14
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#cc2222' : '#fff'
      ctx.globalAlpha = 0.08
      ctx.fillRect(i * stripeW, 0, stripeW, h * 0.6)
    }
    ctx.globalAlpha = 1

    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, h * 0.6)
    ctx.quadraticCurveTo(w / 2, h * 0.45, w, h * 0.6)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(200,50,50,0.3)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(w * 0.05, h * 0.6)
    ctx.quadraticCurveTo(w / 2, h * 0.48, w * 0.95, h * 0.6)
    ctx.stroke()

    const cx = w / 2
    const flagY = h * 0.13
    for (let i = -1; i <= 1; i++) {
      const fx = cx + i * w * 0.12
      ctx.strokeStyle = 'rgba(200,200,200,0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(fx, flagY + 10)
      ctx.lineTo(fx, flagY - 15)
      ctx.stroke()
      const wave = Math.sin(this.frame * 0.03 + i) * 3
      ctx.fillStyle = i === -1 ? '#e74c5c' : i === 0 ? '#f5b041' : '#5dade2'
      ctx.globalAlpha = 0.4
      ctx.beginPath()
      ctx.moveTo(fx, flagY - 15)
      ctx.lineTo(fx + 15 + wave, flagY - 10)
      ctx.lineTo(fx, flagY - 5)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1
    }

    const spotX = cx + Math.sin(this.frame * 0.01) * w * 0.1
    const spot = ctx.createRadialGradient(spotX, h * 0.15, 0, spotX, h * 0.15, w * 0.3)
    spot.addColorStop(0, 'rgba(255,255,200,0.12)')
    spot.addColorStop(0.5, 'rgba(255,255,200,0.04)')
    spot.addColorStop(1, 'rgba(255,255,200,0)')
    ctx.fillStyle = spot
    ctx.fillRect(0, 0, w, h)
  }

  private drawSign(ctx: CanvasRenderingContext2D, w: number, _h: number): void {
    if (!this.currentWord) return
    const wd = this.currentWord
    const fontSize = Math.min(32, w * 0.065)
    const gap = 8
    const totalWidth = wd.word.length * (fontSize + gap)
    const startX = (w - totalWidth) / 2

    const act = ACTS[Math.min(this.actIndex, ACTS.length - 1)]

    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.roundRect(w / 2 - 140, 50, 280, 24, 12)
    ctx.fill()
    ctx.fillStyle = '#FFD700'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`🎪 ${act.name} — ${this.wordInAct + 1}/4`, w / 2, 62)

    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.beginPath()
    ctx.roundRect(w / 2 - 140, 86, 280, 46, 10)
    ctx.fill()

    ctx.font = `${24}px system-ui`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(wd.emoji, w / 2, 92)

    const wordY = 92 + 26
    const activeColor = '#FFD700'

    for (let i = 0; i < wd.word.length; i++) {
      const lx = startX + i * (fontSize + gap)
      const ly = wordY
      if (i === wd.blankIndex) {
        ctx.strokeStyle = activeColor
        ctx.lineWidth = 2.5
        ctx.setLineDash([4, 3])
        ctx.beginPath()
        ctx.roundRect(lx, ly + 2, fontSize, fontSize * 0.7, 3)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = 'rgba(255,215,0,0.15)'
        ctx.beginPath()
        ctx.roundRect(lx, ly + 2, fontSize, fontSize * 0.7, 3)
        ctx.fill()
      } else {
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${fontSize}px "Arial Black", Arial, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(wd.word[i], lx + fontSize / 2, ly)
      }
    }
  }

  private drawItem(ctx: CanvasRenderingContext2D, item: CircusItem): void {
    const bob = Math.sin(this.frame * 0.035 + item.bobPhase) * 10
    const cx = item.x
    const cy = item.y + bob
    const r = 20

    ctx.save()
    ctx.translate(cx, cy)

    ctx.fillStyle = '#e74c5c'
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(item.letter, 0, 0)

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '10px system-ui'
    ctx.fillText(item.type, 0, -r - 8)

    ctx.restore()
  }

  private drawRingmaster(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const rx = w / 2
    const ry = h * 0.72
    const bob = Math.sin(this.frame * 0.02) * 2

    ctx.save()
    ctx.translate(rx, ry + bob)

    ctx.fillStyle = '#222'
    ctx.fillRect(-8, -40, 16, 50)
    ctx.fillStyle = '#111'
    ctx.fillRect(-6, -38, 12, 46)

    ctx.fillStyle = '#cc2222'
    ctx.beginPath()
    ctx.moveTo(-10, 10)
    ctx.lineTo(10, 10)
    ctx.lineTo(10, -15)
    ctx.lineTo(-10, -15)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#FFD700'
    ctx.fillRect(-2, -12, 4, 20)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 11px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('🎩', 0, -18)

    ctx.restore()
  }

  private drawAudience(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const ay = h * 0.88
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, ay, w, h - ay)

    for (let i = 0; i < 12; i++) {
      const ax = (i + 0.5) * (w / 12)
      const bob = Math.sin(this.frame * 0.03 + i * 1.7) * 1.5
      const emoji = i % 3 === 0 ? '🧟' : i % 3 === 1 ? '🧸' : '👤'
      ctx.font = '16px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(emoji, ax, ay + 14 + bob)
    }
  }

  private drawTrickAnimation(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const progress = 1 - this.showTrick / 50
    const phase = Math.sin(progress * Math.PI)

    ctx.save()
    ctx.translate(w / 2, h * 0.35)

    ctx.fillStyle = '#5B8C5A'
    ctx.beginPath()
    const leg = 20 + phase * 30
    ctx.arc(0, -leg * 0.3, 18, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#222'
    ctx.font = 'bold 16px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.correctLetter, 0, -leg * 0.3)

    if (progress < 0.5) {
      ctx.strokeStyle = 'rgba(255,200,50,0.5)'
      ctx.lineWidth = 3
      const arcR = 40 + phase * 20
      ctx.beginPath()
      ctx.arc(0, 0, arcR, -Math.PI * 0.8 * phase, Math.PI * 0.8 * phase)
      ctx.stroke()
    }

    ctx.restore()
  }

  private drawHUD(ctx: CanvasRenderingContext2D, w: number, _h: number): void {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(0, 0, w, 34)
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 13px system-ui'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    const act = ACTS[Math.min(this.actIndex, ACTS.length - 1)]
    ctx.fillText(`🎪 ${act.icon} ${act.name} — Act ${this.actIndex + 1}/${ACTS.length}`, 12, 17)
    ctx.textAlign = 'right'
    ctx.fillText(`⭐ ${this.starCount}  Score: ${this.score}`, w - 12, 17)
  }

  restart(): void {
    this.frame = 0
    this.score = 0
    this.actIndex = 0
    this.wordInAct = 0
    this.totalCorrect = 0
    this.items = []
    this.confetti = []
    this.showTrick = 0
    this.showSlip = 0
    this.transition = 0
    this.completed = false
    this.usedIndices = []
    this.starCount = 0
    this.startRound()
  }
}
