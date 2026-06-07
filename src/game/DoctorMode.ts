import { ALL_LETTERS } from '../characters/data'
import { ThemedLetterQuestMode } from './themedQuest/ThemedLetterQuestMode'
import { Renderer } from '../renderer/Renderer'

const SYMPTOM_WORDS: Record<string, string[]> = {
  'A': ['ALLER_Y', '_LLERGY'], 'B': ['_ANDAGE', 'BA_DAGE'], 'C': ['_HECKUP', 'CH_CKUP'],
  'D': ['_ENTAL', 'DE_TAL'], 'E': ['_MERGENCY', 'EM_RGENCY'], 'F': ['_RACTURE', 'FR_CTURE'],
  'G': ['_ENERAL', 'GE_ERAL'], 'H': ['_YGIENE', 'HY_IENT'], 'I': ['_CU', 'IC_'],
  'J': ['_OINT', 'JO_NT'], 'K': ['_IDS', 'KI_S'], 'L': ['_AB', 'LA_'],
  'M': ['_ATERNITY', 'MA_ERNITY'], 'N': ['_EUROLOGY', 'NE_ROLOGY'], 'O': ['_PERATING', 'OP_RATING'],
  'P': ['_HARMACY', 'PH_RMACY'], 'Q': ['_UIET', 'QU_ET'], 'R': ['_ECOVERY', 'RE_OVERY'],
  'S': ['_URGERY', 'SU_GERY'], 'T': ['_REATMENT', 'TR_ATMENT'], 'U': ['_LTRASOUND', 'UL_RASOUND'],
  'V': ['_ACCINATION', 'VA_CINATION'], 'W': ['_AITING', 'WA_TING'], 'X': ['_RAY', 'X_A_'],
  'Y': ['_OGA', 'YO_A'], 'Z': ['_OOM CARE', 'ZO_M CARE'],
}

export class DoctorMode extends ThemedLetterQuestMode {
  private patientRecovered = false

  constructor(w: number, h: number) {
    super(w, h)
    this.wordLists = SYMPTOM_WORDS
    this.particleColor = '#e74c5c'
    this.initRound()
  }

  protected initRound(): void {
    if (this.progressIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.progressIndex]
    this.wordIndex = 0; this.correctFlash = 0; this.patientRecovered = false
    this.advanceToNextWord()
  }

  protected onLetterDone(): void {
    this.patientRecovered = true
  }

  protected drawBackground(ctx: Renderer): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#e8f0f8'); grad.addColorStop(1, '#c8d8e8')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    const bx = this.canvasW / 2 - 50; const by = this.canvasH * 0.1
    ctx.fillStyle = '#d0d8e0'; ctx.fillRect(bx, by, 100, 70)
    ctx.strokeStyle = '#aab'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, 100, 70)
    ctx.fillStyle = '#8a9aaa'; ctx.fillRect(bx + 10, by + 10, 80, 5)
    ctx.fillRect(bx + 10, by + 25, 60, 5)
    ctx.fillRect(bx + 10, by + 40, 70, 5)

    ctx.fillStyle = this.patientRecovered ? '#58d68d' : '#5a8a6a'
    ctx.beginPath(); ctx.arc(this.canvasW / 2, by - 10, 18, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(this.canvasW / 2 - 5, by - 12, 3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(this.canvasW / 2 + 5, by - 12, 3, 0, Math.PI * 2); ctx.fill()
    if (this.patientRecovered) {
      ctx.strokeStyle = '#58d68d'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(this.canvasW / 2, by + 5, 6, 0, Math.PI); ctx.stroke()
      ctx.fillStyle = '#e74c5c'; ctx.font = '16px system-ui'; ctx.textAlign = 'center'
      ctx.fillText('❤️', this.canvasW / 2, by + 25)
    }
  }

  protected drawHUD(ctx: Renderer): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#333'
    ctx.fillText(`🏥 Patient ${this.progressIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#e74c5c'
    ctx.fillText(`Score: ${this.score}`, this.canvasW - 12, 16)
  }

  protected drawPrompt(ctx: Renderer): void {
    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#333'; ctx.font = 'bold 26px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Symptom: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.5)
      ctx.fillStyle = '#666'; ctx.font = '14px system-ui'
      ctx.fillText(`Give medicine: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.55)
    }
  }

  protected drawTransitionOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#58d68d'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('💊 Patient cured! Next case...', this.canvasW / 2, this.canvasH / 2)
  }

  protected drawWinnerOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#58d68d'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🏆 Doctor of the Year! All 26 cured!', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score, patient: this.progressIndex + 1, total: 26 }
  }
}
