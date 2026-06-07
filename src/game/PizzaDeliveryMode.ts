import { ALL_LETTERS } from '../characters/data'
import { ThemedLetterQuestMode } from './themedQuest/ThemedLetterQuestMode'
import { Renderer } from '../renderer/Renderer'

const PIZZA_WORDS: Record<string, string[]> = {
  'C': ['_ORN', 'CHEESE'], 'H': ['AM', 'H_OT'], 'M': ['_USHROOM', 'MOZZARELLA'],
  'P': ['EPPERONI', 'P_ZZA'], 'S': ['AUSAGE', 'SA_CE'], 'B': ['ACON', 'BAS_L'],
  'O': ['LIVE', 'ON_ON'], 'T': ['OMATO', 'OPPING'], 'A': ['NCHOVY', 'ART_CHOKE'],
  'R': ['ED PEPPER', 'RIC_OTA'], 'E': ['GGPLANT', 'EXTRA_CHEESE'],
  'L': ['ETTUCE', 'A_ASAGNA'], 'D': ['OUBLE', 'O_GH'], 'F': ['ENNEL', '_ENNEL'],
  'G': ['ARLIC', 'G_REEN'], 'I': ['TALIAN', 'T_LIAN'], 'J': ['ALAPENO', 'J_LAPENO'],
  'K': ['ALE', 'K_LE'], 'N': ['ONIONS', 'O_IONS'], 'Q': ['UESADILLA', 'QU_CHEDDAR'],
  'U': ['MBRELLA', 'UMB_ELLA'], 'V': ['EGGIE', 'V_GGIE'], 'W': ['HEAT', 'WH_AT'],
  'X': ['TRA CHEESE', 'E_TRA'], 'Y': ['OGURT', 'Y_GURT'], 'Z': ['UCCHINI', 'ZU_CHINI'],
}

const ZOMBIE_EMOJIS = ['🧟', '🧟‍♂️', '🧟‍♀️', '💀', '👻', '🦴', '🧠']

export class PizzaDeliveryMode extends ThemedLetterQuestMode {
  private pizzaProgress = 0

  constructor(w: number, h: number) {
    super(w, h)
    this.wordLists = PIZZA_WORDS
    this.particleColor = '#e74c5c'
    this.initRound()
  }

  protected initRound(): void {
    if (this.progressIndex >= 26) { this.winner = true; return }
    this.currentLetter = ALL_LETTERS[this.progressIndex]
    this.wordIndex = 0; this.correctFlash = 0; this.pizzaProgress = 0
    this.advanceToNextWord()
  }

  protected onCorrect(): void {
    this.pizzaProgress++
  }

  protected extraDraw(ctx: Renderer): void {
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('Pop the right pizza topping! Press letter keys for bonus', this.canvasW / 2, this.canvasH - 8)
  }

  protected drawBackground(ctx: Renderer): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#2a1a0a'); grad.addColorStop(0.5, '#4a2a1a'); grad.addColorStop(1, '#6a3a2a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(0, this.canvasH * 0.6, this.canvasW, this.canvasH * 0.4)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(0, this.canvasH * 0.6); ctx.lineTo(this.canvasW, this.canvasH * 0.6); ctx.stroke()

    const cx = this.canvasW / 2; const cy = this.canvasH * 0.45; const r = 50
    ctx.fillStyle = '#d4a04a'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(cx, cy, r - 8, 0, Math.PI * 2); ctx.fill()
    for (let i = 0; i < this.pizzaProgress; i++) {
      const a = (i / 5) * Math.PI * 2; const pr = 8 + Math.random() * 5
      ctx.fillStyle = '#e74c5c'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (r - 20), cy + Math.sin(a) * (r - 20), pr, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(this.currentLetter, cx, cy)
  }

  protected drawHUD(ctx: Renderer): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#e74c5c'
    ctx.fillText(`🍕 Order ${this.progressIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Zombie: ${ZOMBIE_EMOJIS[this.progressIndex % 7]}  Score: ${this.score}`, this.canvasW - 12, 16)
  }

  protected drawPrompt(ctx: Renderer): void {
    if (this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`I want ${this.currentWord} pizza!`, this.canvasW / 2, 80)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Pop the letter: ${this.currentLetter}`, this.canvasW / 2, 120)
    }
  }

  protected drawTransitionOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#e74c5c'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🍕 Pizza served! Next order...', this.canvasW / 2, this.canvasH / 2)
  }

  protected drawWinnerOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#e74c5c'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🍕 Pizza Party! All orders complete!', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score, round: this.progressIndex + 1, totalRounds: 26 }
  }
}
