import { ALL_LETTERS } from '../characters/data'
import { ThemedLetterQuestMode } from './themedQuest/ThemedLetterQuestMode'
import { Renderer } from '../renderer/Renderer'

const BUILDING_WORDS: Record<string, string[]> = {
  'A': ['_PARTMENT', 'AP_RTMENT'], 'B': ['_AKERY', 'BA_ERY'], 'C': ['_ASTLE', 'CA_TLE'],
  'D': ['_EPARTMENT', 'DE_ARTMENT'], 'E': ['L_MENTARY', 'ELE_ENTARY'], 'F': ['_ACTORY', 'FA_TORY'],
  'G': ['_ARAGE', 'GA_AGE'], 'H': ['_OSPITAL', 'HO_ITAL'], 'I': ['_CE CREAM', 'ICE C_EAM'],
  'J': ['_EWELRY', 'JE_ELRY'], 'K': ['_ENNEL', 'KE_NEL'], 'L': ['_IBRARY', 'LI_RARY'],
  'M': ['_OVIE', 'MO_IE'], 'N': ['_IGHTCLUB', 'NI_HTCLUB'], 'O': ['_BSERVATORY', 'OB_ERVATORY'],
  'P': ['_OLICE', 'PO_ICE'], 'Q': ['_UILT', 'QU_LT'], 'R': ['_ESTAURANT', 'RE_TAURANT'],
  'S': ['_CHOOL', 'SC_OOL'], 'T': ['_OY STORE', 'TO_ STORE'], 'U': ['_MBRELLA', 'UM_RELLA'],
  'V': ['_ET', 'VE_'], 'W': ['_ATER PARK', 'WA_ER'], 'X': ['_RAY', 'X_A_'],
  'Y': ['_OGA', 'YO_A'], 'Z': ['_OO', 'ZO_'],
}

export class FireFightersMode extends ThemedLetterQuestMode {
  private flameIntensity = 5

  constructor(w: number, h: number) {
    super(w, h)
    this.wordLists = BUILDING_WORDS
    this.particleColor = '#5dade2'
    this.initRound()
  }

  protected initRound(): void {
    if (this.progressIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.progressIndex]
    this.wordIndex = 0; this.correctFlash = 0; this.flameIntensity = 5
    this.advanceToNextWord()
  }

  protected onCorrect(): void {
    this.flameIntensity = Math.max(1, this.flameIntensity - 1)
  }

  protected drawBackground(ctx: Renderer): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a1a2a'); grad.addColorStop(1, '#2a1a1a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    const bx = this.canvasW / 2 - 60; const by = this.canvasH * 0.15
    ctx.fillStyle = '#4a4a5a'; ctx.fillRect(bx, by, 120, 120)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.fillStyle = '#6a6a8a'; ctx.fillRect(bx + 15 + j * 50, by + 15 + i * 35, 15, 20)
      }
    }

    ctx.beginPath()
    ctx.moveTo(bx - 20, by)
    ctx.lineTo(bx + 60, by - 30)
    ctx.lineTo(bx + 140, by)
    ctx.closePath()
    ctx.fillStyle = '#5a3a3a'
    ctx.fill()

    if (this.flameIntensity > 0) {
      for (let f = 0; f < this.flameIntensity * 3; f++) {
        const fx = bx + 15 + Math.random() * 90
        const fy = by - 5 - Math.random() * 20 * (this.flameIntensity / 5)
        const fs = 4 + Math.random() * 8
        ctx.fillStyle = ['#e74c5c', '#f5b041', '#e67e22'][f % 3]
        ctx.globalAlpha = 0.6 + Math.random() * 0.4
        ctx.beginPath(); ctx.arc(fx, fy, fs, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
    }
  }

  protected drawHUD(ctx: Renderer): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#e74c5c'
    ctx.fillText(`🔥 Fire ${this.progressIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#5dade2'
    ctx.fillText(`${'🔥'.repeat(this.flameIntensity)}  Score: ${this.score}`, this.canvasW - 12, 16)
  }

  protected drawPrompt(ctx: Renderer): void {
    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 26px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Spray water: "${this.currentWord}"`, this.canvasW / 2, this.canvasH * 0.65)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Pop water droplet: ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.7)
    }
  }

  protected drawTransitionOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#5dade2'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('💧 Fire extinguished! Next emergency!', this.canvasW / 2, this.canvasH / 2)
  }

  protected drawWinnerOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#5dade2'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🚒 Heroes! All 26 buildings saved!', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score, building: this.progressIndex + 1, total: 26 }
  }
}
