import { ALL_LETTERS } from '../characters/data'
import { WORDS } from './words'

interface TreasureChest {
  x: number; y: number; letter: string
  alive: boolean; collected: boolean
  bobPhase: number; drift: number
}

interface CoinParticle {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; color: string; size: number
}

interface FishSplash {
  x: number; y: number; timer: number
}

const TREASURES: Record<string, string> = {
  A: 'Anchor of Gold', B: 'Barrel of Bounty', C: 'Crown of Coral',
  D: 'Diamond Doubloon', E: 'Emerald Eyes', F: 'Flag of the Fleet',
  G: 'Golden Goblet', H: 'Hook of Honour', I: 'Ivory Idol',
  J: 'Jewel of the Jungle', K: "King's Key", L: 'Lucky Locket',
  M: 'Map of the Mystic Isles', N: "Navigator's Necklace", O: 'Opal Orb',
  P: 'Pearl of the Pacific', Q: "Queen's Quartz", R: 'Ruby Ring',
  S: 'Sapphire Spyglass', T: 'Treasure Chest (golden)',
  U: 'Umbrella of the Undersea', V: "Vanquisher's Sword",
  W: 'Wooden Wheel', X: 'X-marks-the-spot Coin',
  Y: 'Yellow Yarn (map thread)', Z: "Zombie Pirate's Gold Tooth",
}

const ISLANDS = [
  { name: 'Sandbar', letters: 4 },
  { name: 'Palm Cove', letters: 5 },
  { name: 'Skull Rock', letters: 5 },
  { name: 'Hidden Lagoon', letters: 6 },
  { name: 'The Dark Cave', letters: 6 },
]

export class PirateHuntMode {
  private canvasW: number
  private canvasH: number
  private frame = 0
  private score = 0
  private letterIndex = 0
  private correctLetter = ''
  private currentWord: { word: string; emoji: string; blankIndex: number } | null = null
  private chests: TreasureChest[] = []
  private coins: CoinParticle[] = []
  private fish: FishSplash | null = null
  private showTreasure = 0
  private showFish = 0
  private transition = 0
  private completed = false
  private usedWordIndices: Set<number> = new Set()

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.startRound()
  }

  private getIslandIndex(): number {
    let accumulated = 0
    for (let i = 0; i < ISLANDS.length; i++) {
      accumulated += ISLANDS[i].letters
      if (this.letterIndex < accumulated) return i
    }
    return ISLANDS.length
  }

  private startRound(): void {
    if (this.letterIndex >= 26) {
      this.completed = true
      this.onStateChange?.({
        score: this.score,
        totalCollected: 26,
        currentLevel: ISLANDS.length + 1,
        totalLevels: ISLANDS.length + 1,
        winner: 'human',
      })
      return
    }

    this.correctLetter = ALL_LETTERS[this.letterIndex]

    let wordIndex: number
    do {
      wordIndex = Math.floor(Math.random() * WORDS.length)
    } while (this.usedWordIndices.has(wordIndex) && this.usedWordIndices.size < WORDS.length)
    this.usedWordIndices.add(wordIndex)

    this.currentWord = WORDS[wordIndex]
    this.showTreasure = 0
    this.showFish = 0
    this.fish = null
    this.chests = []
    this.coins = []

    const correct = this.correctLetter
    const distractors = [correct]
    const pool = ALL_LETTERS.filter(l => l !== correct)
    while (distractors.length < 6) {
      const pick = pool[Math.floor(Math.random() * pool.length)]
      if (!distractors.includes(pick)) distractors.push(pick)
    }
    distractors.sort(() => Math.random() - 0.5)

    const chestCount = distractors.length
    const spacing = Math.min(100, (this.canvasW - 60) / chestCount)
    const startX = (this.canvasW - spacing * (chestCount - 1)) / 2
    const chestY = this.canvasH * 0.58
    this.chests = distractors.map((l, i) => ({
      x: startX + i * spacing, y: chestY, letter: l,
      alive: true, collected: false,
      bobPhase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.5,
    }))
  }

  handleClick(cx: number, cy: number): void {
    if (this.completed || this.showTreasure > 0 || this.showFish > 0 || this.transition > 0) return

    for (const chest of this.chests) {
      if (!chest.alive || chest.collected) continue
      const hw = 24
      const hh = 26
      if (Math.abs(cx - chest.x) < hw && Math.abs(cy - chest.y) < hh) {
        if (chest.letter === this.correctLetter) {
          chest.collected = true
          this.score += 10
          this.showTreasure = 60
          for (let i = 0; i < 20; i++) {
            const a = Math.random() * Math.PI * 2
            const s = 2 + Math.random() * 4
            this.coins.push({
              x: chest.x, y: chest.y,
              vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2,
              life: 0, maxLife: 30 + Math.random() * 20,
              color: ['#FFD700', '#FFA500', '#FFC107', '#FFF3A0'][Math.floor(Math.random() * 4)],
              size: 3 + Math.random() * 4,
            })
          }
          this.onStateChange?.({
            score: this.score,
            totalCollected: this.letterIndex + 1,
            currentLevel: this.getIslandIndex() + 1,
            totalLevels: ISLANDS.length + 1,
          })
        } else {
          this.showFish = 40
          this.fish = { x: chest.x, y: chest.y, timer: 0 }
        }
        return
      }
    }
  }

  handleKey(key: string): void {
    if (this.completed || this.showTreasure > 0 || this.showFish > 0 || this.transition > 0) return
    const upper = key.toUpperCase()
    for (const chest of this.chests) {
      if (!chest.alive || chest.collected) continue
      if (chest.letter === upper) {
        chest.collected = true
        this.score += 2
        this.showTreasure = 60
        for (let i = 0; i < 20; i++) {
          const a = Math.random() * Math.PI * 2
          const s = 2 + Math.random() * 4
          this.coins.push({
            x: chest.x, y: chest.y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2,
            life: 0, maxLife: 30 + Math.random() * 20,
            color: ['#FFD700', '#FFA500', '#FFC107', '#FFF3A0'][Math.floor(Math.random() * 4)],
            size: 3 + Math.random() * 4,
          })
        }
        this.onStateChange?.({
          score: this.score,
          totalCollected: this.letterIndex + 1,
          currentLevel: this.getIslandIndex() + 1,
          totalLevels: ISLANDS.length + 1,
        })
        return
      }
    }
  }

  update(): void {
    this.frame++
    if (this.completed) return

    if (this.showFish > 0) {
      this.showFish--
      if (this.showFish <= 0) this.fish = null
      return
    }

    if (this.showTreasure > 0) {
      this.showTreasure--
      for (const c of this.coins) {
        c.x += c.vx
        c.y += c.vy
        c.vy += 0.12
        c.life++
        c.vx *= 0.97
      }
      this.coins = this.coins.filter(c => c.life < c.maxLife)
      if (this.showTreasure <= 0) {
        this.coins = []
        this.letterIndex++
        this.transition = 40
      }
      return
    }

    if (this.transition > 0) {
      this.transition--
      if (this.transition <= 0) this.startRound()
      return
    }

    for (const chest of this.chests) {
      if (chest.collected) continue
      chest.y += Math.sin((this.frame + chest.bobPhase) * 0.02) * 0.3
      chest.x += Math.sin((this.frame + chest.bobPhase) * 0.01) * chest.drift
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const w = this.canvasW
    const h = this.canvasH

    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7)
    sky.addColorStop(0, '#0a1628')
    sky.addColorStop(0.3, '#1a3a5c')
    sky.addColorStop(0.6, '#2a6a8a')
    sky.addColorStop(1, '#4a8a6a')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)

    this.drawShip(ctx, w, h)
    this.drawOcean(ctx, w, h)

    if (this.currentWord) {
      this.drawWordPrompt(ctx, w, h)
    }

    for (const chest of this.chests) {
      if (chest.collected) continue
      this.drawChest(ctx, chest)
    }

    for (const c of this.coins) {
      const a = 1 - c.life / c.maxLife
      if (a <= 0) continue
      ctx.globalAlpha = a
      ctx.fillStyle = c.color
      ctx.beginPath()
      ctx.arc(c.x, c.y, c.size * a, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    if (this.fish && this.showFish > 0) {
      const bounce = Math.sin(this.showFish * 0.3) * 10
      ctx.font = '28px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🐟', this.fish.x, this.fish.y - 20 - bounce)
    }

    this.drawHUD(ctx, w, h)

    if (this.showTreasure > 0) {
      this.drawTreasurePopup(ctx, w, h)
    }

    if (this.transition > 0) {
      const alpha = Math.min(1, (40 - this.transition) / 20)
      ctx.fillStyle = `rgba(0,0,0,${alpha * 0.4})`
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`
      ctx.font = 'bold 28px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const islandIdx = this.getIslandIndex()
      const name = islandIdx < ISLANDS.length ? ISLANDS[islandIdx].name : 'Treasure Island'
      ctx.fillText(`🗺️ ${name}!`, w / 2, h / 2)
    }

    if (this.completed) return
  }

  private drawOcean(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const oceanY = h * 0.78
    ctx.fillStyle = '#1a4a6a'
    ctx.fillRect(0, oceanY, w, h - oceanY)

    for (let row = 0; row < 3; row++) {
      ctx.beginPath()
      ctx.moveTo(0, oceanY + row * 6)
      const amp = 4 + row * 2
      const freq = 0.03 - row * 0.005
      for (let x = 0; x <= w; x += 4) {
        const y = oceanY + row * 6 + Math.sin(x * freq + this.frame * 0.04 + row) * amp
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.lineTo(0, h)
      ctx.closePath()
      const alpha = 0.15 + row * 0.12
      ctx.fillStyle = `rgba(30, 100, 150, ${alpha})`
      ctx.fill()
    }

    for (let i = 0; i < 6; i++) {
      const fx = (i * 137 + this.frame * 0.5) % w
      const fy = oceanY + 8 + Math.sin(i * 2.7 + this.frame * 0.03) * 4
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath()
      ctx.arc(fx, fy, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawShip(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const sx = w * 0.15
    const sy = h * 0.55
    const bob = Math.sin(this.frame * 0.015) * 3
    ctx.save()
    ctx.translate(sx, sy + bob)

    ctx.fillStyle = '#3a2010'
    ctx.beginPath()
    ctx.moveTo(-30, 10)
    ctx.lineTo(30, 10)
    ctx.lineTo(40, 35)
    ctx.lineTo(-40, 35)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#2a1008'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = '#5a3a1a'
    ctx.fillRect(-28, -20, 6, 30)
    ctx.fillRect(22, -20, 6, 30)

    ctx.fillStyle = '#2a1a0a'
    ctx.beginPath()
    ctx.moveTo(0, -40)
    ctx.lineTo(18, -10)
    ctx.lineTo(-18, -10)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#8B4513'
    ctx.fillRect(-3, -45, 6, 55)

    ctx.fillStyle = 'rgba(200,50,50,0.6)'
    ctx.beginPath()
    ctx.moveTo(3, -42)
    ctx.lineTo(28, -18)
    ctx.lineTo(3, -10)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  private drawChest(ctx: CanvasRenderingContext2D, chest: TreasureChest): void {
    const bob = Math.sin(this.frame * 0.03 + chest.bobPhase) * 12
    const cx = chest.x
    const cy = chest.y + bob
    const s = 22

    const grad = ctx.createLinearGradient(cx - s, cy - s, cx + s, cy + s)
    grad.addColorStop(0, '#8B4513')
    grad.addColorStop(0.5, '#A0522D')
    grad.addColorStop(1, '#6B3410')
    ctx.fillStyle = grad

    ctx.beginPath()
    ctx.roundRect(cx - s, cy - s, s * 2, s * 2, 4)
    ctx.fill()

    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx - s, cy - 2)
    ctx.lineTo(cx + s, cy - 2)
    ctx.stroke()

    ctx.fillStyle = '#FFD700'
    ctx.fillRect(cx - 4, cy - s - 2, 8, 4)
    ctx.beginPath()
    ctx.arc(cx, cy - s, 4, Math.PI, 0)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(chest.letter, cx, cy + 2)
  }

  private drawWordPrompt(ctx: CanvasRenderingContext2D, w: number, _h: number): void {
    if (!this.currentWord) return
    const wd = this.currentWord
    const fontSize = Math.min(36, w * 0.07)
    const gap = 10
    const totalWidth = wd.word.length * (fontSize + gap)
    const startX = (w - totalWidth) / 2

    const islandIdx = this.getIslandIndex()
    const islandName = islandIdx < ISLANDS.length ? ISLANDS[islandIdx].name : 'Treasure Island'

    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.roundRect(w / 2 - 120, 50, 240, 24, 12)
    ctx.fill()
    ctx.fillStyle = '#FFD700'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`🗺️ ${islandName} — ${this.letterIndex + 1}/26`, w / 2, 62)

    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.beginPath()
    ctx.roundRect(w / 2 - 160, 88, 320, 54, 12)
    ctx.fill()

    ctx.font = `${28}px system-ui`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(wd.emoji, w / 2, 94)

    const wordY = 94 + 32

    for (let i = 0; i < wd.word.length; i++) {
      const lx = startX + i * (fontSize + gap)
      const ly = wordY

      if (i === wd.blankIndex) {
        const correct = wd.word[wd.blankIndex]
        if (correct === this.correctLetter) {
          ctx.strokeStyle = '#FFD700'
          ctx.lineWidth = 3
          ctx.setLineDash([5, 3])
          ctx.beginPath()
          ctx.roundRect(lx, ly + 2, fontSize, fontSize * 0.75, 4)
          ctx.stroke()
          ctx.setLineDash([])
        }
      } else {
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${fontSize}px "Arial Black", Arial, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(wd.word[i], lx + fontSize / 2, ly)
      }
    }
  }

  private drawTreasurePopup(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const alpha = Math.min(1, (60 - this.showTreasure) / 15)
    ctx.fillStyle = `rgba(0,0,0,${alpha * 0.3})`
    ctx.fillRect(0, 0, w, h)

    const tx = w / 2
    const ty = h * 0.35

    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 48px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🏆', tx, ty - 30)

    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`
    ctx.font = 'bold 22px system-ui'
    ctx.fillText(`${this.correctLetter} — ${TREASURES[this.correctLetter] || 'Treasure'}`, tx, ty + 30)

    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`
    ctx.font = '14px system-ui'
    ctx.fillText(`+10 points!`, tx, ty + 60)
  }

  private drawHUD(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(0, 0, w, 36)
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 14px system-ui'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText(`🏴‍☠️ Treasures: ${this.letterIndex}/26`, 12, 18)
    ctx.textAlign = 'right'
    ctx.fillText(`💰 ${this.score}`, w - 12, 18)

    ctx.fillStyle = 'rgba(255,215,0,0.15)'
    const barW = w - 24
    const barX = 12
    const pct = Math.min(1, this.letterIndex / 26)
    ctx.beginPath()
    ctx.roundRect(barX, h - 14, barW, 6, 3)
    ctx.fill()
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.roundRect(barX, h - 14, barW * pct, 6, 3)
    ctx.fill()
  }

  restart(): void {
    this.frame = 0
    this.score = 0
    this.letterIndex = 0
    this.chests = []
    this.coins = []
    this.fish = null
    this.showTreasure = 0
    this.showFish = 0
    this.transition = 0
    this.completed = false
    this.usedWordIndices = new Set()
    this.startRound()
  }
}
