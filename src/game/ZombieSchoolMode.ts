import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

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

export class ZombieSchoolMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private lessonIndex = 0; private wordIndex = 0
  private score = 0; private stars = 0; private completed: string[] = []
  private floatingLetters: FloatingLetter[] = []
  private particles: any[] = []
  private correctFlash = 0
  private currentLetter = ''
  private currentWord = ''
  private teacherLine = ''; private teacherTimer = 0
  private transition = 0; private recessTimer = 0
  private inRecess = false; private winner = false

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.startLesson()
  }

  private startLesson(): void {
    this.currentLetter = ALL_LETTERS[this.lessonIndex]
    this.wordIndex = 0
    this.correctFlash = 0
    this.teacherLine = ''
    this.teacherTimer = 0
    const words = LESSON_WORDS[this.currentLetter]
    if (words) this.nextWord()
  }

  private nextWord(): void {
    const words = LESSON_WORDS[this.currentLetter]
    if (!words || this.wordIndex >= words.length) {
      this.completed.push(this.currentLetter)
      this.lessonIndex++
      if (this.lessonIndex >= 26) { this.winner = true; return }
      if (this.lessonIndex % 5 === 0) {
        this.inRecess = true; this.recessTimer = 0
      } else {
        this.transition = 1
      }
      return
    }
    this.currentWord = words[this.wordIndex]
    this.spawnLetters()
  }

  private spawnLetters(): void {
    const needed = this.currentLetter
    const options = [needed]
    const pool = ALL_LETTERS.filter(l => l !== needed)
    while (options.length < 5) {
      const p = pool[Math.floor(Math.random() * pool.length)]
      if (!options.includes(p)) options.push(p)
    }
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]
    }
    this.floatingLetters = options.map(l => new FloatingLetter(this.canvasW, this.canvasH, l, 150))
    const teacher = TEACHERS[this.lessonIndex % TEACHERS.length]
    this.teacherLine = teacher.line.replace('A', this.currentLetter)
    this.teacherTimer = 80
  }

  handleClick(cx: number, cy: number): void {
    if (this.winner || this.correctFlash > 0 || this.transition > 0 || this.inRecess) return
    for (const l of this.floatingLetters) {
      if (!l.collected && l.containsCanvas(cx, cy)) {
        this.checkLetter(l.letter); l.pop(); return
      }
    }
  }

  handleKey(key: string): void {
    if (this.winner || this.correctFlash > 0 || this.transition > 0 || this.inRecess) return
    const l = this.floatingLetters.find(f => !f.collected && f.letter.toLowerCase() === key)
    if (l) { this.checkLetter(l.letter); l.pop() }
  }

  private checkLetter(letter: string): void {
    if (letter === this.currentLetter) {
      this.score += 10; this.wordIndex++; this.correctFlash = 1
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.4, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#58d68d', life: 0, maxLife: 20 })
      }
      this.stars++
      this.onStateChange?.({ score: this.score, lesson: this.lessonIndex + 1, totalLessons: 26 })
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++
    if (this.teacherTimer > 0) this.teacherTimer--

    if (this.inRecess) {
      this.recessTimer++
      if (this.recessTimer > 90) { this.inRecess = false; this.transition = 1 }
      return
    }

    if (this.transition > 0) {
      this.transition++
      if (this.transition > 30) { this.transition = 0; this.startLesson() }
      return
    }

    if (this.correctFlash > 0) {
      this.correctFlash++
      for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
      this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
      if (this.correctFlash > 30) {
        this.correctFlash = 0
        this.nextWord()
      }
      return
    }

    for (const l of this.floatingLetters) { l.update(0) }
    this.floatingLetters = this.floatingLetters.filter(l => { if (l.collected) return l.popTime < l.popDuration; return true })
    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
    this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a1a2e'); grad.addColorStop(1, '#2a1a2e')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#58d68d'
    const teacher = TEACHERS[this.lessonIndex % TEACHERS.length]
    ctx.fillText(`📚 Lesson ${this.lessonIndex + 1}/26: Letter ${this.currentLetter}`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Teacher: ${teacher.emoji} ${teacher.name}  ⭐${this.stars}`, this.canvasW - 12, 16)

    ctx.fillStyle = '#8a7a6e'; ctx.fillRect(0, this.canvasH * 0.55, this.canvasW, 4)

    for (let i = 0; i < 7; i++) {
      const sx = 30 + i * ((this.canvasW - 60) / 6)
      const sy = this.canvasH * 0.62
      const r = 14
      ctx.fillStyle = STUDENTS[i].color
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#222'; ctx.font = '8px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(STUDENTS[i].name.substring(0, 4), sx, sy + 1)

      if (i === this.lessonIndex % 7) {
        ctx.strokeStyle = '#f5b041'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(sx, sy, r + 3, 0, Math.PI * 2); ctx.stroke()
      }
    }

    if (this.currentWord && !this.correctFlash && !this.transition && !this.inRecess) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 36px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      const words = LESSON_WORDS[this.currentLetter]
      if (words) {
        const idx = this.wordIndex < words.length ? this.wordIndex : 0
        ctx.fillText(words[idx], this.canvasW / 2, 80)

        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px system-ui'
        ctx.fillText(`Pop the letter: ${this.currentLetter}`, this.canvasW / 2, 125)
      }
    }

    if (this.teacherTimer > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.beginPath(); ctx.roundRect(this.canvasW / 2 - 160, this.canvasH * 0.42, 320, 32, 8); ctx.fill()
      ctx.fillStyle = '#ffd'; ctx.font = '12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`${teacher.emoji} "${this.teacherLine}"`, this.canvasW / 2, this.canvasH * 0.42 + 16)
    }

    for (const l of this.floatingLetters) {
      if (!l.collected) l.draw(ctx, this.frame)
      else if (l.popTime < l.popDuration) l.draw(ctx, this.frame)
    }

    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife; if (a <= 0) continue
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2)
      ctx.fillStyle = p.color; ctx.fill()
    }
    ctx.globalAlpha = 1

    if (this.inRecess) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#f5b041'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🎉 Recess Time! 5 letters learned!', this.canvasW / 2, this.canvasH / 2)
    }

    if (this.transition > 0) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.3, this.transition / 15)})`; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#58d68d'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🎓 Graduation Day! All 26 letters learned!', this.canvasW / 2, this.canvasH / 2 - 20)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`Score: ${this.score}  Stars: ${this.stars}`, this.canvasW / 2, this.canvasH / 2 + 20)
    }
  }

  restart(): void {
    this.lessonIndex = 0; this.wordIndex = 0; this.score = 0; this.stars = 0
    this.completed = []; this.floatingLetters = []; this.particles = []
    this.correctFlash = 0; this.transition = 0; this.recessTimer = 0
    this.inRecess = false; this.winner = false; this.frame = 0
    this.startLesson()
  }
}
