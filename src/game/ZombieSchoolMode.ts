import { ALL_LETTERS } from '../characters/data'
import { ThemedLetterQuestMode } from './themedQuest/ThemedLetterQuestMode'
import { Renderer } from '../renderer/Renderer'

const TEACHERS = [
  { name: 'Bubbles', subject: 'Science', emoji: '🔬', line: 'A is for Apple! Let us grow one!' },
  { name: 'Jeff', subject: 'Math', emoji: '📋', line: 'A comes before B. Order matters!' },
  { name: 'Newt', subject: 'Art', emoji: '🎨', line: 'Let us make A beautiful!' },
  { name: 'Fuse', subject: 'Gym', emoji: '🏋️', line: 'Stretch your arms for A!' },
  { name: 'Pogo', subject: 'Recess', emoji: '🎮', line: 'Who can find A fastest?' },
  { name: 'Slick', subject: 'Music', emoji: '🎵', line: 'Sing the alphabet with me!' },
  { name: 'Zee', subject: 'Nap Time', emoji: '😴', line: 'Quiet letter tracing... zzz' },
]

const STUDENTS = [
  { name: 'Classic', color: '#5B8C5A' },
  { name: 'Decayed', color: '#7A8A6E' },
  { name: 'Toxic', color: '#4F8A5E' },
  { name: 'Undead', color: '#8A7A6E' },
  { name: 'Rotten', color: '#6A7A5E' },
  { name: 'Ghoul', color: '#5A7A6E' },
  { name: 'Mutant', color: '#7A6A5E' },
]

const LESSON_WORDS: Record<string, string[]> = {
  'A': ['APPLE', 'ANT', 'AXE'], 'B': ['BALL', 'BED', 'BUS'],
  'C': ['CAT', 'CUP', 'CAR'], 'D': ['DOG', 'DUCK', 'DOOR'],
  'E': ['EGG', 'EEL', 'EIGHT'], 'F': ['FISH', 'FAN', 'FORK'],
  'G': ['GAME', 'GIRL', 'GOAT'], 'H': ['HAT', 'HAND', 'HOUSE'],
  'I': ['ICE', 'INK', 'ISLAND'], 'J': ['JAM', 'JET', 'JUICE'],
  'K': ['KEY', 'KITE', 'KING'], 'L': ['LION', 'LAMP', 'LEAF'],
  'M': ['MOON', 'MILK', 'MASK'], 'N': ['NEST', 'NOSE', 'NOTE'],
  'O': ['OWL', 'OVEN', 'OCEAN'], 'P': ['PEN', 'PIG', 'POT'],
  'Q': ['QUEEN', 'QUIZ', 'QUILT'], 'R': ['RAT', 'ROSE', 'ROPE'],
  'S': ['SUN', 'STAR', 'SNAKE'], 'T': ['TOP', 'TREE', 'TRAIN'],
  'U': ['UP', 'UMBRELLA', 'UNICORN'], 'V': ['VAN', 'VASE', 'VIOLIN'],
  'W': ['WET', 'WINDOW', 'WATER'], 'X': ['XRAY', 'XENON', 'XEROX'],
  'Y': ['YES', 'YELLOW', 'YARN'], 'Z': ['ZOO', 'ZIP', 'ZEBRA'],
}

export class ZombieSchoolMode extends ThemedLetterQuestMode {
  private stars = 0
  private teacherLine = ''
  private teacherTimer = 0
  private recessTimer = 0
  private inRecess = false

  constructor(w: number, h: number) {
    super(w, h)
    this.wordLists = LESSON_WORDS
    this.particleColor = '#58d68d'
    this.initRound()
  }

  protected initRound(): void {
    this.currentLetter = ALL_LETTERS[this.progressIndex]
    this.wordIndex = 0
    this.correctFlash = 0
    this.teacherLine = ''
    this.teacherTimer = 0
    const words = LESSON_WORDS[this.currentLetter]
    if (words) this.advanceToNextWord()
  }

  protected spawnLetters(): void {
    super.spawnLetters()
    const teacher = TEACHERS[this.progressIndex % TEACHERS.length]
    this.teacherLine = teacher.line.replace('A', this.currentLetter)
    this.teacherTimer = 80
  }

  protected onLetterDone(): void {
    if (this.progressIndex >= 26) { this.winner = true; return }
    if (this.progressIndex % 5 === 0) {
      this.inRecess = true; this.recessTimer = 0
    }
  }

  protected advanceToNextLetter(): void {
    this.progressIndex++
    this.onLetterDone()
    if (this.winner) return
    if (!this.inRecess) this.transition = 1
  }

  protected blockInput(): boolean {
    return this.inRecess
  }

  protected extraUpdate(): void {
    if (this.teacherTimer > 0) this.teacherTimer--
    if (this.inRecess) {
      this.recessTimer++
      if (this.recessTimer > 90) { this.inRecess = false; this.transition = 1 }
    }
  }

  protected drawBackground(ctx: Renderer): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a1a2e'); grad.addColorStop(1, '#2a1a2e')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#8a7a6e'; ctx.fillRect(0, this.canvasH * 0.55, this.canvasW, 4)

    for (let i = 0; i < 7; i++) {
      const sx = 30 + i * ((this.canvasW - 60) / 6)
      const sy = this.canvasH * 0.62
      const r = 14
      ctx.fillStyle = STUDENTS[i].color
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#222'; ctx.font = '8px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(STUDENTS[i].name.substring(0, 4), sx, sy + 1)

      if (i === this.progressIndex % 7) {
        ctx.strokeStyle = '#f5b041'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(sx, sy, r + 3, 0, Math.PI * 2); ctx.stroke()
      }
    }
  }

  protected drawHUD(ctx: Renderer): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#58d68d'
    const teacher = TEACHERS[this.progressIndex % TEACHERS.length]
    ctx.fillText(`📚 Lesson ${this.progressIndex + 1}/26: Letter ${this.currentLetter}`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Teacher: ${teacher.emoji} ${teacher.name}  ⭐${this.stars}`, this.canvasW - 12, 16)
  }

  protected drawPrompt(ctx: Renderer): void {
    const words = LESSON_WORDS[this.currentLetter]
    if (words && this.currentWord && !this.correctFlash && !this.transition && !this.inRecess) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 36px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(words[this.wordIndex - 1] || words[0], this.canvasW / 2, 80)

      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
      ctx.fillText(`Pop the letter: ${this.currentLetter}`, this.canvasW / 2, 125)
    }

    if (this.teacherTimer > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.beginPath(); ctx.roundRect(this.canvasW / 2 - 160, this.canvasH * 0.42, 320, 32, 8); ctx.fill()
      ctx.fillStyle = '#ffd'; ctx.font = '12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`${TEACHERS[this.progressIndex % TEACHERS.length].emoji} "${this.teacherLine}"`, this.canvasW / 2, this.canvasH * 0.42 + 16)
    }
  }

  protected drawTransitionOverlay(ctx: Renderer): void {
    if (this.inRecess) {
      ctx.fillStyle = '#f5b041'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🎉 Recess Time! 5 letters learned!', this.canvasW / 2, this.canvasH / 2)
    }
  }

  protected drawWinnerOverlay(ctx: Renderer): void {
    ctx.fillStyle = '#58d68d'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🎓 Graduation Day! All 26 letters learned!', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
    ctx.fillText(`Score: ${this.score}  Stars: ${this.stars}`, this.canvasW / 2, this.canvasH / 2 + 20)
  }

  protected getStatePayload(): Record<string, unknown> {
    return { score: this.score, lesson: this.progressIndex + 1, totalLessons: 26 }
  }
}
