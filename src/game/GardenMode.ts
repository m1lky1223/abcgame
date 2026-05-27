import { ALL_LETTERS } from '../characters/data'
import { ThemedLetterQuestMode } from './themedQuest/ThemedLetterQuestMode'

const PLANTS: Record<string, string> = {
  'A': 'Apple Tree', 'B': 'Blueberry Bush', 'C': 'Carrot', 'D': 'Daisy',
  'E': 'Elderflower', 'F': 'Fern', 'G': 'Grapevine', 'H': 'Hibiscus',
  'I': 'Ivy', 'J': 'Jasmine', 'K': 'Kale', 'L': 'Lavender',
  'M': 'Marigold', 'N': 'Nasturtium', 'O': 'Orchid', 'P': 'Pumpkin',
  'Q': "Queen's Rose", 'R': 'Raspberry', 'S': 'Sunflower', 'T': 'Tulip',
  'U': 'Umbrella Plant', 'V': 'Violet', 'W': 'Watermelon', 'X': 'Xanthium',
  'Y': 'Yarrow', 'Z': 'Zucchini',
}

export class GardenMode extends ThemedLetterQuestMode {
  private growth = 0

  constructor(w: number, h: number) {
    super(w, h)
    this.stepsPerLetter = 3
    this.particleColor = '#58d68d'
    this.initRound()
  }

  protected initRound(): void {
    if (this.progressIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.progressIndex]
    this.wordIndex = 0; this.correctFlash = 0; this.growth = 0
    this.spawnLetters()
  }

  protected onCorrect(): void {
    this.growth = this.wordIndex
  }

  protected drawBackground(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#4a8a5a'); grad.addColorStop(1, '#8a6a3a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#6a5a3a'; ctx.fillRect(0, this.canvasH * 0.7, this.canvasW, this.canvasH * 0.3)

    const potX = this.canvasW / 2 - 25; const potY = this.canvasH * 0.55
    ctx.fillStyle = '#a05030'; ctx.fillRect(potX, potY, 50, 40)
    ctx.fillStyle = '#b06040'; ctx.fillRect(potX - 5, potY + 30, 60, 10)
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1
    ctx.strokeRect(potX, potY, 50, 40)

    ctx.fillStyle = '#5a3a1a'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'
    ctx.fillText(this.currentLetter, this.canvasW / 2, potY + 24)

    const plantCX = this.canvasW / 2; const plantBY = potY
    if (this.growth >= 1) {
      ctx.fillStyle = '#58d68d'; ctx.fillRect(plantCX - 3, plantBY - 20, 6, 20)
      ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.ellipse(plantCX, plantBY - 25, 15, 8, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.font = '10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(this.currentLetter, plantCX, plantBY - 25)
    }
    if (this.growth >= 2) {
      ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.ellipse(plantCX - 12, plantBY - 20, 10, 6, -0.3, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(plantCX + 12, plantBY - 20, 10, 6, 0.3, 0, Math.PI * 2); ctx.fill()
    }
    if (this.growth >= 3) {
      for (let i = 0; i < 3; i++) {
        const fx = plantCX + (i - 1) * 18; const fy = plantBY - 35 - Math.abs(i - 1) * 8
        ctx.fillStyle = ['#e74c5c', '#f5b041', '#9b59b6'][i]
        ctx.beginPath(); ctx.arc(fx, fy, 6, 0, Math.PI * 2); ctx.fill()
      }
    }
  }

  protected drawHUD(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#58d68d'
    ctx.fillText(`🌱 Plant ${this.progressIndex + 1}/26: ${PLANTS[this.currentLetter] || this.currentLetter}`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Stage: ${'🌱'.repeat(Math.max(1, this.growth))}${'🌿'.repeat(Math.max(0, this.growth - 1))}  Score: ${this.score}`, this.canvasW - 12, 16)
  }

  protected drawPrompt(ctx: CanvasRenderingContext2D): void {
    if (!this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Water the ${PLANTS[this.currentLetter] || 'plant'} — pop ${this.currentLetter}!`, this.canvasW / 2, 130)
    }
  }

  protected drawTransitionOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#58d68d'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(`🌻 ${PLANTS[this.currentLetter] || 'Plant'} fully grown!`, this.canvasW / 2, this.canvasH / 2)
  }

  protected drawWinnerOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#58d68d'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🌸 Alphabet Garden Complete! All 26 blooming!', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score, plant: this.progressIndex + 1, total: 26 }
  }
}
