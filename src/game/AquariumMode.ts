import { ALL_LETTERS } from '../characters/data'
import { ThemedLetterQuestMode } from './themedQuest/ThemedLetterQuestMode'
import { Renderer } from '../renderer/Renderer'

const CREATURES: Record<string, { name: string; emoji: string }> = {
  'A': { name: 'Anemone', emoji: '🌊' }, 'B': { name: 'Barracuda', emoji: '🐟' },
  'C': { name: 'Clownfish', emoji: '🐠' }, 'D': { name: 'Dolphin', emoji: '🐬' },
  'E': { name: 'Eel', emoji: '🐍' }, 'F': { name: 'Flounder', emoji: '🐡' },
  'G': { name: 'Goldfish', emoji: '🐟' }, 'H': { name: 'Hammerhead', emoji: '🦈' },
  'I': { name: 'Iguana', emoji: '🦎' }, 'J': { name: 'Jellyfish', emoji: '🪼' },
  'K': { name: 'Krill', emoji: '🦐' }, 'L': { name: 'Lobster', emoji: '🦞' },
  'M': { name: 'Manatee', emoji: '🐋' }, 'N': { name: 'Narwhal', emoji: '🦄' },
  'O': { name: 'Octopus', emoji: '🐙' }, 'P': { name: 'Pufferfish', emoji: '🐡' },
  'Q': { name: 'Queen Angelfish', emoji: '🐠' }, 'R': { name: 'Ray', emoji: '🦈' },
  'S': { name: 'Seahorse', emoji: '🐴' }, 'T': { name: 'Turtle', emoji: '🐢' },
  'U': { name: 'Urchin', emoji: '🟣' }, 'V': { name: 'Viperfish', emoji: '🐟' },
  'W': { name: 'Whale', emoji: '🐳' }, 'X': { name: 'X-ray Tetra', emoji: '🐟' },
  'Y': { name: 'Yellowtail', emoji: '🐟' }, 'Z': { name: 'Zebrafish', emoji: '🦓' },
}

const CREATURE_WORDS: Record<string, string[]> = {
  'A': ['_NEMONE', 'AN_MONE', 'ANE_ONE'], 'B': ['_ARRACUDA', 'BA_ACUDA'], 'C': ['_LOWNFISH', 'CL_WNFISH'],
  'D': ['_OLPHIN', 'DO_PHIN'], 'E': ['_EL', 'E_'], 'F': ['_LOUNDER', 'FL_UNDER'],
  'G': ['_OLDFISH', 'GO_DFISH'], 'H': ['_AMMERHEAD', 'HA_ERHEAD'], 'I': ['_GUANA', 'IG_ANA'],
  'J': ['_ELLYFISH', 'JE_LYFISH'], 'K': ['_RILL', 'KR_LL'], 'L': ['_OBSTER', 'LO_TER'],
  'M': ['_ANATEE', 'MA_ATEE'], 'N': ['_ARWHAL', 'NA_WHAL'], 'O': ['_CTOPUS', 'OC_OPUS'],
  'P': ['_UFFERFISH', 'PU_FERFISH'], 'Q': ['_UEEN', 'QU_EN'], 'R': ['_AY', 'RA_'],
  'S': ['_EAHORSE', 'SE_HORSE'], 'T': ['_URTLE', 'TU_TLE'], 'U': ['_RCHIN', 'UR_HIN'],
  'V': ['_IPERFISH', 'VI_ERFISH'], 'W': ['_HALE', 'WH_LE'], 'X': ['_RAY TETRA', 'X_A_ TETRA'],
  'Y': ['_ELLOWTAIL', 'YE_LOWTAIL'], 'Z': ['_EBRAFISH', 'ZE_AFISH'],
}

export class AquariumMode extends ThemedLetterQuestMode {
  private bubbles: { x: number; y: number; speed: number; size: number }[] = []

  constructor(w: number, h: number) {
    super(w, h)
    this.wordLists = CREATURE_WORDS
    this.particleColor = '#5dade2'
    this.initRound()
  }

  protected initRound(): void {
    if (this.progressIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.progressIndex]
    this.wordIndex = 0; this.correctFlash = 0
    this.advanceToNextWord()
  }

  protected extraUpdate(): void {
    if (this.frame % 10 === 0) {
      this.bubbles.push({ x: Math.random() * this.canvasW, y: this.canvasH + 10, speed: 0.3 + Math.random() * 0.5, size: 2 + Math.random() * 4 })
    }
    for (const b of this.bubbles) { b.y -= b.speed }
    this.bubbles = this.bubbles.filter(b => b.y > -10)
  }

  protected extraDraw(ctx: Renderer): void {
    for (const b of this.bubbles) {
      ctx.strokeStyle = `rgba(150,200,255,${0.2 + Math.sin(b.y * 0.1) * 0.1})`
      ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.stroke()
    }
  }

  protected drawBackground(ctx: Renderer): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#0a2a4a'); grad.addColorStop(0.5, '#0a3a6a'); grad.addColorStop(1, '#0a4a3a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    const tx = this.canvasW / 2 - 70; const ty = this.canvasH * 0.08
    ctx.strokeStyle = 'rgba(100,200,255,0.3)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.roundRect(tx, ty, 140, 90, 8); ctx.stroke()
    ctx.fillStyle = 'rgba(0,50,100,0.4)'; ctx.beginPath(); ctx.roundRect(tx, ty, 140, 90, 8); ctx.fill()

    const creature = CREATURES[this.currentLetter]
    if (creature) {
      ctx.font = '36px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(creature.emoji, this.canvasW / 2, ty + 35)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px system-ui'
      ctx.fillText(creature.name, this.canvasW / 2, ty + 70)
    }
  }

  protected drawHUD(ctx: Renderer): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#5dade2'
    ctx.fillText(`🐠 Creature ${this.progressIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#58d68d'
    ctx.fillText(`Score: ${this.score}`, this.canvasW - 12, 16)
  }

  protected drawPrompt(ctx: Renderer): void {
    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Name: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.55)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Pop the bubble: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.6)
    }
  }

  protected drawTransitionOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#5dade2'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🐬 Creature discovered! Next tank!', this.canvasW / 2, this.canvasH / 2)
  }

  protected drawWinnerOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#5dade2'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🐳 Ocean Explorer! All 26 discovered!', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score, creature: this.progressIndex + 1, total: 26 }
  }
}
