import { ALL_LETTERS } from '../characters/data'
import { ThemedLetterQuestMode } from './themedQuest/ThemedLetterQuestMode'

const STRUCTURES: Record<string, string> = {
  'A': 'Arch', 'B': 'Bench', 'C': 'Crawl Tunnel', 'D': 'Dome',
  'E': 'Easy Climb', 'F': 'Fire Pole', 'G': 'Garden Swing', 'H': 'Horizontal Bar',
  'I': 'Ice Cream Stand', 'J': 'Jungle Gym', 'K': 'Kickball Court', 'L': 'Lounge Bench',
  'M': 'Merry-Go-Round', 'N': 'Net Climber', 'O': 'Oval Sandbox', 'P': 'Picnic Table',
  'Q': 'Quiet Nook', 'R': 'Rock Wall', 'S': 'Slide', 'T': 'Tire Swing',
  'U': 'Umbrella Canopy', 'V': 'Volleyball Net', 'W': 'Wave Bridge', 'X': 'Xylophone Wall',
  'Y': 'Yoga Deck', 'Z': 'Zigzag Path',
}

const MATERIALS = ['🧱', '🪵', '🔩', '🪚', '⚙️', '🛠️']

export class ConstructionSiteMode extends ThemedLetterQuestMode {
  constructor(w: number, h: number) {
    super(w, h)
    this.stepsPerLetter = 1
    this.particleColor = '#f5b041'
    this.initRound()
  }

  protected initRound(): void {
    if (this.progressIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.progressIndex]
    this.correctFlash = 0; this.wordIndex = 0
    this.spawnLetters()
  }

  protected drawBackground(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#3a4a2a'); grad.addColorStop(1, '#5a3a1a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#4a3a1a'; ctx.fillRect(0, this.canvasH * 0.7, this.canvasW, this.canvasH * 0.3)
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = '#6a5a3a'; ctx.fillRect(i * (this.canvasW / 8), this.canvasH * 0.7, this.canvasW / 16, 3)
    }

    const bx = this.canvasW / 2 - 60; const by = this.canvasH * 0.25
    ctx.fillStyle = '#f5b041'
    ctx.fillRect(bx, by, 120, 80)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 48px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(this.currentLetter, this.canvasW / 2, by + 40)
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2
    ctx.strokeRect(bx, by, 120, 80)

    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('🔨 Pop materials to build!', this.canvasW / 2, this.canvasH - 8)
  }

  protected drawHUD(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`🚧 Build ${this.progressIndex + 1}/26: ${STRUCTURES[this.currentLetter] || this.currentLetter}`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#58d68d'
    ctx.fillText(`🧱 ${MATERIALS[this.progressIndex % 6]}  Score: ${this.score}`, this.canvasW - 12, 16)
  }

  protected drawPrompt(ctx: CanvasRenderingContext2D): void {
    if (!this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Pop ${this.currentLetter} to build the ${STRUCTURES[this.currentLetter] || this.currentLetter}`, this.canvasW / 2, 130)
    }
  }

  protected drawTransitionOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f5b041'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(`CLANK! ${STRUCTURES[this.currentLetter] || this.currentLetter} built! 🚧`, this.canvasW / 2, this.canvasH / 2)
  }

  protected drawWinnerOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f5b041'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🏗️ Playground Grand Opening! All 26 built!', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = '#58d68d'; ctx.font = '18px system-ui'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score, built: this.progressIndex + 1, total: 26 }
  }
}
