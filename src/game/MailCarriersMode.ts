import { ALL_LETTERS } from '../characters/data'
import { ThemedLetterQuestMode } from './themedQuest/ThemedLetterQuestMode'

const MAIL_WORDS: Record<string, string[]> = {
  'A': ['_DDRESS', 'MA_L'], 'B': ['O_', 'BO_'], 'C': ['_ARD', 'CAR_'],
  'D': ['ELI_ERY', 'DEL_VER'], 'E': ['N_ELOPE', '_NVELOPE'], 'F': ['_RANK', 'FR_'],
  'G': ['_IFT', 'GI_T'], 'H': ['_AND', 'HAN_'], 'I': ['_NVITE', 'IN_ITE'],
  'J': ['_OURNEY', 'J_URNEY'], 'K': ['_EY', 'KE_'], 'L': ['_ETTER', 'LET_ER'],
  'M': ['AIL', 'M_I_'], 'N': ['_EWS', 'NEW_'], 'O': ['_RDER', 'OR_ER'],
  'P': ['_OST', 'POS_'], 'Q': ['_UICK', 'QU_CK'], 'R': ['_OUTE', 'RO_TE'],
  'S': ['_TAMP', 'STA_P'], 'T': ['RUCK', 'TR_CK'], 'U': ['_RGENT', 'UR_ENT'],
  'V': ['_AN', 'V_N'], 'W': ['_RITE', 'WR_TE'], 'X': ['_EROX', 'XE_O_'],
  'Y': ['_ELLOW', 'YEL_OW'], 'Z': ['_ONE', 'ZO_E'],
}

const RECIPIENTS = ['Bubbles', 'Fuse', 'Jeff', 'Newt', 'Pogo', 'Slick', 'Zee']

export class MailCarriersMode extends ThemedLetterQuestMode {
  constructor(w: number, h: number) {
    super(w, h)
    this.wordLists = MAIL_WORDS
    this.particleColor = '#5dade2'
    this.initRound()
  }

  protected initRound(): void {
    if (this.progressIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.progressIndex]
    this.wordIndex = 0; this.correctFlash = 0
    this.advanceToNextWord()
  }

  protected drawBackground(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a2a4a'); grad.addColorStop(1, '#2a4a3a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#3a4a3a'; ctx.fillRect(this.canvasW * 0.1, this.canvasH * 0.05, this.canvasW * 0.8, this.canvasH * 0.55)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2
    ctx.strokeRect(this.canvasW * 0.1, this.canvasH * 0.05, this.canvasW * 0.8, this.canvasH * 0.55)

    const ex = this.canvasW / 2 - 40; const ey = this.canvasH * 0.1
    ctx.fillStyle = '#f5f0e0'; ctx.fillRect(ex, ey, 80, 55)
    ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 2; ctx.strokeRect(ex, ey, 80, 55)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('📮', this.canvasW / 2, ey + 20)
    ctx.fillStyle = '#333'; ctx.font = 'bold 24px system-ui'; ctx.textBaseline = 'middle'
    ctx.fillText(this.currentLetter, this.canvasW / 2, ey + 42)
  }

  protected drawHUD(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#5dade2'
    ctx.fillText(`📬 Mail ${this.progressIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`To: ${RECIPIENTS[this.progressIndex % 7]}  Score: ${this.score}`, this.canvasW - 12, 16)
  }

  protected drawPrompt(ctx: CanvasRenderingContext2D): void {
    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Stamp: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.65)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Pop the letter: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.7)
    }
  }

  protected drawTransitionOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#5dade2'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('✉️ Mail delivered! Next stop...', this.canvasW / 2, this.canvasH / 2)
  }

  protected drawWinnerOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#5dade2'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('📫 Master Mail Carrier! All 26 delivered!', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score, delivered: this.progressIndex + 1, total: 26 }
  }
}
