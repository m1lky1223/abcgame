import { ALL_LETTERS } from '../characters/data'
import { ThemedLetterQuestMode } from './themedQuest/ThemedLetterQuestMode'
import { Renderer } from '../renderer/Renderer'

const DISCOVERIES: Record<string, string> = {
  'A': 'Asteroid Alpha', 'B': 'Blue Nebula', 'C': 'Comet Cheddar', 'D': 'Dwarf Star Doris',
  'E': 'Exoplanet Echo', 'F': 'Flare Star Felix', 'G': 'Galaxy Gumball', 'H': 'Helix Nebula Honey',
  'I': 'Ice Moon Ivan', 'J': "Jupiter's Jewel", 'K': 'Kepler-Key System', 'L': 'Lunar Lake Lulu',
  'M': 'Mars Meadow', 'N': 'Neutron Star Noodle', 'O': 'Orbit Ring Olive', 'P': "Pluto's Pal",
  'Q': 'Quasar Quartz', 'R': 'Red Giant Ralph', 'S': "Saturn's Sparkle", 'T': 'Terra Twin Tilly',
  'U': "Uranus' Umbrella", 'V': 'Venus Valley', 'W': 'Wormhole Wendy', 'X': 'X-Ray Star Xander',
  'Y': 'Yellow Dwarf Yuki', 'Z': 'Zenith Zone Zero',
}

const SIGNAL_WORDS: Record<string, string[]> = {
  'A': ['ST_R', 'S_A_'], 'B': ['N_BULA', 'NE_ULA'], 'C': ['_OMET', 'CO_ET'],
  'D': ['WARF', 'DW_RF'], 'E': ['XOPLANET', 'EX_PLANET'], 'F': ['L_RE', 'FL_RE'],
  'G': ['_ALAXY', 'GA_AXY'], 'H': ['N_BULA', 'NE_ULA'], 'I': ['C_ MOON', 'IC_ MOON'],
  'J': ['_UPITER', 'JU_ITER'], 'K': ['_EPLER', 'KE_LER'], 'L': ['_UNAR', 'LU_AR'],
  'M': ['_ARS', 'MA_S'], 'N': ['EUTRON', 'NE_TRON'], 'O': ['_RBIT', 'OR_IT'],
  'P': ['_LUTO', 'PL_TO'], 'Q': ['_UASAR', 'QU_SAR'], 'R': ['E_ GIANT', 'RE_ GIANT'],
  'S': ['_ATURN', 'SA_URN'], 'T': ['_ERRA', 'TE_RA'], 'U': ['_RANUS', 'UR_NUS'],
  'V': ['_ENUS', 'VE_US'], 'W': ['_ORMHOLE', 'WO_MHOLE'], 'X': ['_RAY', 'X_A_'],
  'Y': ['_ELLOW', 'YE_OW'], 'Z': ['_ENITH', 'ZE_ITH'],
}

export class SpaceExplorersMode extends ThemedLetterQuestMode {
  constructor(w: number, h: number) {
    super(w, h)
    this.wordLists = SIGNAL_WORDS
    this.particleColor = '#f5b041'
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
    grad.addColorStop(0, '#050510'); grad.addColorStop(1, '#0a0a2a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    for (let i = 0; i < 30; i++) {
      const sx = (i * 137 + this.frame * 0.5) % this.canvasW
      const sy = (i * 97) % this.canvasH
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(i + this.frame * 0.02) * 0.1})`
      ctx.beginPath(); ctx.arc(sx, sy, 1 + (i % 3), 0, Math.PI * 2); ctx.fill()
    }

    ctx.fillStyle = 'rgba(100,150,255,0.1)'
    ctx.beginPath(); ctx.arc(this.canvasW * 0.8, this.canvasH * 0.2, 40, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(150,200,255,0.15)'
    ctx.beginPath(); ctx.arc(this.canvasW * 0.2, this.canvasH * 0.8, 30, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#2a3a5a'; ctx.fillRect(this.canvasW * 0.1, this.canvasH * 0.05, this.canvasW * 0.8, 50)
    ctx.strokeStyle = 'rgba(100,200,255,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(this.canvasW * 0.1, this.canvasH * 0.05, this.canvasW * 0.8, 50)
    ctx.fillStyle = '#5dade2'; ctx.font = '12px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText('📡 MISSION CONTROL', this.canvasW * 0.12, this.canvasH * 0.08)
    ctx.fillStyle = '#58d68d'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'right'
    ctx.fillText(`Signal: "${this.currentWord}"`, this.canvasW * 0.88, this.canvasH * 0.08)
  }

  protected drawHUD(ctx: Renderer): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#5dade2'
    ctx.fillText(`🚀 Discovery ${this.progressIndex + 1}/26`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Score: ${this.score}`, this.canvasW - 12, 16)
  }

  protected drawPrompt(ctx: Renderer): void {
    const disc = DISCOVERIES[this.currentLetter]
    if (disc && this.currentWord && !this.correctFlash && !this.transition) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 20px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`Discover: ${disc}`, this.canvasW / 2, this.canvasH * 0.45)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Complete signal: pop ${this.currentLetter}`, this.canvasW / 2, this.canvasH * 0.5)
    }
  }

  protected drawTransitionOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#5dade2'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('⭐ Discovered! Signal to next system...', this.canvasW / 2, this.canvasH / 2)
  }

  protected drawWinnerOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#5dade2'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🌌 Galactic Explorer! All 26 discovered!', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
    ctx.fillText(`Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score, discovery: this.progressIndex + 1, total: 26 }
  }
}
