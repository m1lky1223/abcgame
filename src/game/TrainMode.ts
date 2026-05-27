import { ALL_LETTERS } from '../characters/data'
import { ThemedLetterQuestMode } from './themedQuest/ThemedLetterQuestMode'

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

export class TrainMode extends ThemedLetterQuestMode {
  private trainLength = 0

  constructor(w: number, h: number) {
    super(w, h)
    this.wordLists = CARGO_WORDS
    this.particleColor = '#f5b041'
    this.initRound()
  }

  protected initRound(): void {
    if (this.progressIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.progressIndex]
    this.wordIndex = 0; this.correctFlash = 0
    this.advanceToNextWord()
  }

  protected onLetterDone(): void {
    this.trainLength++
  }

  protected extraDraw(ctx: CanvasRenderingContext2D): void {
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
  }

  protected drawBackground(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#4a8abd'); grad.addColorStop(1, '#6a9a6a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
    ctx.fillStyle = '#5a4a3a'; ctx.fillRect(0, this.canvasH * 0.75, this.canvasW, 8)
  }

  protected drawHUD(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`🚄 Stop ${this.progressIndex + 1}/26: ${STATION_NAMES[this.progressIndex] || ''}`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#58d68d'
    ctx.fillText(`Cars: ${this.trainLength}  Score: ${this.score}`, this.canvasW - 12, 16)
  }

  protected drawPrompt(ctx: CanvasRenderingContext2D): void {
    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 26px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Load cargo: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.35)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Pop the letter: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.4)
    }
  }

  protected drawTransitionOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f5b041'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🚂 CHOO-CHOO! Cargo loaded! Next stop!', this.canvasW / 2, this.canvasH / 2)
  }

  protected drawWinnerOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f5b041'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🚂 All Aboard! Alphabet Train complete!', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = '#58d68d'; ctx.font = '18px system-ui'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score, stop: this.progressIndex + 1, total: 26 }
  }
}
