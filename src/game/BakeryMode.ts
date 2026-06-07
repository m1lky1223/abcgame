import { ALL_LETTERS } from '../characters/data'
import { ThemedLetterQuestMode } from './themedQuest/ThemedLetterQuestMode'
import { Renderer } from '../renderer/Renderer'

const TREAT_WORDS: Record<string, string[]> = {
  'A': ['_PPLE PIE', 'AP_LE PIE'], 'B': ['_UTTER CAKE', 'BU_TER CAKE'], 'C': ['_ROISSANT', 'CR_ISSANT'],
  'D': ['_ONUT', 'DO_UT'], 'E': ['_CLAIR', 'EC_IR'], 'F': ['_UNNEL CAKE', 'FU_NEL CAKE'],
  'G': ['_INGERBREAD', 'GI_GERBREAD'], 'H': ['_ONEY CAKE', 'HO_EY CAKE'], 'I': ['_CE CREAM', 'IC_ CREAM'],
  'J': ['_AM TART', 'JA_ TART'], 'K': ['_EY LIME', 'KE_ LIME'], 'L': ['_OLLIPOP', 'LO_LIPOP'],
  'M': ['_ACARON', 'MA_ARON'], 'N': ['_OUGAT', 'NO_GAT'], 'O': ['_ATMEAL', 'OA_EAL'],
  'P': ['_ANCAKE', 'PA_CAKE'], 'Q': ['_UICHE', 'QU_CHE'], 'R': ['_UGELACH', 'RU_ELACH'],
  'S': ['_CONE', 'SC_NE'], 'T': ['_IRAMISU', 'TI_AMISU'], 'U': ['_PSIDE DOWN', 'UP_IDE DOWN'],
  'V': ['_ANILLA', 'VA_ILLA'], 'W': ['_AFFLE', 'WA_FLE'], 'X': ['_MAS PUDDING', 'XMA_ PUDDING'],
  'Y': ['_OGURT', 'YO_URT'], 'Z': ['_EBRA CAKE', 'ZE_RA CAKE'],
}

const ZOMBIE_NAMES = ['Classic', 'Decayed', 'Toxic', 'Undead', 'Rotten', 'Ghoul', 'Mutant']

export class BakeryMode extends ThemedLetterQuestMode {
  constructor(w: number, h: number) {
    super(w, h)
    this.wordLists = TREAT_WORDS
    this.particleColor = '#e67e22'
    this.initRound()
  }

  protected initRound(): void {
    if (this.progressIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.progressIndex]
    this.wordIndex = 0; this.correctFlash = 0
    this.advanceToNextWord()
  }

  protected drawBackground(ctx: Renderer): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#f5e6d0'); grad.addColorStop(1, '#e8d4b8')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#d4a04a'; ctx.fillRect(0, this.canvasH * 0.55, this.canvasW, 6)
    ctx.fillStyle = '#c09030'; ctx.fillRect(0, this.canvasH * 0.55, this.canvasW, 2)

    ctx.fillStyle = '#8a6a4a'; ctx.fillRect(this.canvasW * 0.7, this.canvasH * 0.2, 60, 80)
    ctx.fillStyle = 'rgba(255,100,0,0.15)'; ctx.beginPath()
    ctx.arc(this.canvasW * 0.7 + 30, this.canvasH * 0.2 + 10, 20, Math.PI, 0); ctx.fill()

    ctx.fillStyle = '#6a4a2a'; ctx.fillRect(this.canvasW * 0.05, this.canvasH * 0.15, 50, 60)
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = ['#e74c5c', '#f5b041', '#58d68d'][i]
      ctx.fillRect(this.canvasW * 0.08, this.canvasH * 0.18 + i * 18, 10, 10)
    }
  }

  protected drawHUD(ctx: Renderer): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#e67e22'
    ctx.fillText(`🧁 Treat ${this.progressIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#8a4a2a'
    ctx.fillText(`Customer: ${ZOMBIE_NAMES[this.progressIndex % 7]}  Score: ${this.score}`, this.canvasW - 12, 16)
  }

  protected drawPrompt(ctx: Renderer): void {
    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#4a2a1a'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Order: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.55)
      ctx.fillStyle = '#8a6a4a'; ctx.font = '14px system-ui'
      ctx.fillText(`Bake the letter: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.6)
    }
  }

  protected drawTransitionOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#e67e22'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🧁 Treat served! Next customer!', this.canvasW / 2, this.canvasH / 2)
  }

  protected drawWinnerOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#e67e22'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🎂 Master Baker! All 26 treats served!', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score, customer: this.progressIndex + 1, total: 26 }
  }
}
