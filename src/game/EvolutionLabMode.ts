import { CHARACTERS, ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'

interface Evolution {
  level: number
  path: 'oddbod' | 'zombie' | null
}

interface LabState {
  dna: number
  lettersPopped: number
  evolutions: Record<string, Evolution>
  score: number
  winner: boolean
  screen: 'play' | 'lab' | 'gallery'
  selectedLetter: string | null
}

export class EvolutionLabMode {
  private canvasW: number
  private canvasH: number
  private state: LabState
  private letters: FloatingLetter[] = []
  private frame = 0
  private particles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []
  private evolveParticles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []
  private evolveAnimTimer = 0
  private evolveAnimLetter = ''
  private evolveAnimPath: 'oddbod' | 'zombie' | null = null
  private message = ''
  private messageTimer = 0

  onStateChange?: (state: { dna: number; evolutions: number; score: number; winner: boolean }) => void
  private loadedEvolutions: Record<string, Evolution> = {}

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    const saved = localStorage.getItem('evolutions')
    this.loadedEvolutions = saved ? JSON.parse(saved) : {}
    this.state = {
      dna: 0, lettersPopped: 0,
      evolutions: { ...this.loadedEvolutions },
      score: 0, winner: false,
      screen: 'play', selectedLetter: null,
    }
    this.spawnLetters()
  }

  private spawnLetters(): void {
    const count = Math.min(6, ALL_LETTERS.length)
    for (let i = 0; i < count; i++) {
      this.letters.push(new FloatingLetter(this.canvasW, this.canvasH))
    }
  }

  handleClick(cx: number, cy: number): void {
    if (this.state.winner) return

    if (this.state.screen === 'lab') {
      this.handleLabClick(cx, cy)
      return
    }
    if (this.state.screen === 'gallery') {
      this.state.screen = 'play'
      return
    }

    for (const letter of this.letters) {
      if (!letter.collected && letter.containsCanvas(cx, cy)) {
        const isKeyboard = false
        this.popLetter(letter, isKeyboard)
        letter.pop()
        return
      }
    }
  }

  handleKey(key: string): void {
    if (this.state.winner) return
    if (this.state.screen === 'lab' || this.state.screen === 'gallery') return

    const letter = this.letters.find(l => !l.collected && l.letter.toLowerCase() === key)
    if (letter) {
      this.popLetter(letter, true)
      letter.pop()
    }
  }

  private popLetter(letter: FloatingLetter, isKeyboard: boolean): void {
    const dnaGain = isKeyboard ? 10 : 5
    this.state.dna += dnaGain
    this.state.lettersPopped++
    this.state.score += isKeyboard ? 2 : 1

    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 2 + Math.random() * 3
      const def = CHARACTERS[letter.letter]
      this.particles.push({
        x: letter.x + 24, y: letter.y + 28,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        color: def?.bodyColor || '#58d68d',
        life: 0, maxLife: 20 + Math.random() * 10,
      })
    }

    this.message = `+${dnaGain} DNA`
    this.messageTimer = 30

    this.onStateChange?.({
      dna: this.state.dna,
      evolutions: Object.keys(this.state.evolutions).length,
      score: this.state.score,
      winner: this.state.winner,
    })

    if (this.letters.filter(l => !l.collected).length < 4) {
      this.letters.push(new FloatingLetter(this.canvasW, this.canvasH))
    }
  }

  private handleLabClick(cx: number, cy: number): void {
    const btnW = 180
    const btnH = 40
    const btnY = this.canvasH - 60

    if (cx >= this.canvasW / 2 - btnW / 2 && cx <= this.canvasW / 2 + btnW / 2 && cy >= btnY && cy <= btnY + btnH) {
      this.state.screen = 'play'
      this.state.selectedLetter = null
      return
    }

    if (this.state.selectedLetter) {
      const oddbodBtnX = this.canvasW / 2 - 120
      const zombieBtnX = this.canvasW / 2 + 20
      if (cy >= 200 && cy <= 240) {
        if (cx >= oddbodBtnX && cx <= oddbodBtnX + 100) {
          this.evolveLetter(this.state.selectedLetter, 'oddbod')
        } else if (cx >= zombieBtnX && cx <= zombieBtnX + 100) {
          this.evolveLetter(this.state.selectedLetter, 'zombie')
        }
      }
    }

    const gridStartX = (this.canvasW - 6 * 42) / 2
    const gridStartY = 100
    for (let i = 0; i < ALL_LETTERS.length; i++) {
      const gx = gridStartX + (i % 6) * 42
      const gy = gridStartY + Math.floor(i / 6) * 42
      if (cx >= gx && cx <= gx + 36 && cy >= gy && cy <= gy + 36) {
        this.state.selectedLetter = ALL_LETTERS[i]
        return
      }
    }
  }

  private evolveLetter(letter: string, path: 'oddbod' | 'zombie'): void {
    const current = this.state.evolutions[letter]
    const level = current ? current.level : 0
    if (level >= 3) return

    const cost = level === 0 ? 10 : level === 1 ? 25 : 50
    if (this.state.dna < cost) {
      this.message = 'Not enough DNA!'
      this.messageTimer = 40
      return
    }

    this.state.dna -= cost
    this.state.evolutions[letter] = { level: level + 1, path }
    this.evolveAnimTimer = 1
    this.evolveAnimLetter = letter
    this.evolveAnimPath = path

    localStorage.setItem('evolutions', JSON.stringify(this.state.evolutions))

    const totalEvolutions = Object.values(this.state.evolutions).filter(e => e.level >= 3).length
    if (totalEvolutions >= 26) {
      this.state.winner = true
    }

    this.onStateChange?.({
      dna: this.state.dna,
      evolutions: Object.keys(this.state.evolutions).length,
      score: this.state.score,
      winner: this.state.winner,
    })
  }

  update(): void {
    if (this.state.winner) return
    this.frame++

    if (this.messageTimer > 0) this.messageTimer--

    if (this.evolveAnimTimer > 0) {
      this.evolveAnimTimer++
      for (const p of this.evolveParticles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life++
      }
      if (this.evolveAnimTimer % 5 === 0 && this.evolveAnimTimer < 30) {
        for (let i = 0; i < 5; i++) {
          const a = Math.random() * Math.PI * 2
          const s = 2 + Math.random() * 4
          this.evolveParticles.push({
            x: this.canvasW / 2, y: this.canvasH / 2 - 60,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2,
            color: this.evolveAnimPath === 'oddbod' ? '#f5b041' : '#4F8A5E',
            life: 0, maxLife: 20 + Math.random() * 10,
          })
        }
      }
      if (this.evolveAnimTimer > 40) {
        this.evolveAnimTimer = 0
        this.evolveParticles = []
      }
      return
    }

    if (this.state.screen !== 'play') return

    for (const letter of this.letters) {
      letter.update(this.frame)
    }
    this.letters = this.letters.filter(l => {
      if (l.collected) return l.popTime < l.popDuration
      return true
    })

    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life++
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#0a0a1e'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    if (this.state.screen === 'lab') {
      this.drawLabScreen(ctx)
      return
    }
    if (this.state.screen === 'gallery') {
      this.drawGallery(ctx)
      return
    }

    this.drawPlayScreen(ctx)
    this.drawParticles(ctx)
    this.drawMessage(ctx)

    if (this.state.winner) this.drawWinScreen(ctx)
  }

  private drawPlayScreen(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#0a0a2e')
    grad.addColorStop(1, '#1a1a3e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    for (const letter of this.letters) {
      letter.draw(ctx, this.frame)
    }

    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, this.canvasW, 36)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px system-ui'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#58d68d'
    ctx.fillText(`🧬 DNA: ${this.state.dna}  Popped: ${this.state.lettersPopped}`, 12, 18)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#f5b041'
    ctx.fillText(`Evolutions: ${Object.keys(this.state.evolutions).length}`, this.canvasW - 12, 18)

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('Click L to open Lab  |  Pop letters to earn DNA', this.canvasW / 2, this.canvasH - 10)

    ctx.fillStyle = '#5dade2'
    ctx.font = 'bold 14px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('🔬 [LAB]', this.canvasW - 60, this.canvasH - 40)
  }

  private drawLabScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#0b0e1a'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 24px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('🔬 Evolution Lab', this.canvasW / 2, 20)

    ctx.fillStyle = '#58d68d'
    ctx.font = '16px system-ui'
    ctx.fillText(`🧬 DNA: ${this.state.dna}`, this.canvasW / 2, 55)

    const gridStartX = (this.canvasW - 6 * 42) / 2
    const gridStartY = 100
    for (let i = 0; i < ALL_LETTERS.length; i++) {
      const letter = ALL_LETTERS[i]
      const gx = gridStartX + (i % 6) * 42
      const gy = gridStartY + Math.floor(i / 6) * 42
      const ev = this.state.evolutions[letter]
      const hasEvo = !!ev
      const isSelected = this.state.selectedLetter === letter

      ctx.fillStyle = isSelected ? 'rgba(88,214,141,0.3)' : hasEvo ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'
      ctx.strokeStyle = isSelected ? '#58d68d' : hasEvo ? '#f5b041' : 'rgba(255,255,255,0.1)'
      ctx.lineWidth = isSelected ? 2 : 1
      ctx.beginPath()
      ctx.roundRect(gx, gy, 36, 36, 4)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(letter, gx + 18, gy + 18)

      if (hasEvo && ev) {
        ctx.fillStyle = ev.path === 'oddbod' ? '#f5b041' : '#4F8A5E'
        ctx.font = '10px system-ui'
        ctx.fillText(`Lv${ev.level}`, gx + 18, gy + 30)
      }
    }

    if (this.state.selectedLetter) {
      const letter = this.state.selectedLetter
      const ev = this.state.evolutions[letter]
      const level = ev ? ev.level : 0
      const cost = level >= 3 ? 0 : level === 0 ? 10 : level === 1 ? 25 : 50
      const canAfford = this.state.dna >= cost && level < 3

      ctx.fillStyle = 'rgba(0,0,0,0.8)'
      ctx.fillRect(0, 190, this.canvasW, 60)

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`Letter ${letter}  |  Current: ${ev ? `${ev.path} Lv${level}` : 'Not evolved'}`, this.canvasW / 2, 205)

      if (level < 3) {
        const oddbodBtnX = this.canvasW / 2 - 120
        const zombieBtnX = this.canvasW / 2 + 20

        ctx.fillStyle = canAfford ? '#f5b041' : 'rgba(255,255,255,0.2)'
        ctx.beginPath()
        ctx.roundRect(oddbodBtnX, 220, 100, 28, 6)
        ctx.fill()
        ctx.fillStyle = canAfford ? '#fff' : 'rgba(255,255,255,0.3)'
        ctx.font = '12px system-ui'
        ctx.fillText(`Oddbod (${cost})`, oddbodBtnX + 50, 234)

        ctx.fillStyle = canAfford ? '#4F8A5E' : 'rgba(255,255,255,0.2)'
        ctx.beginPath()
        ctx.roundRect(zombieBtnX, 220, 100, 28, 6)
        ctx.fill()
        ctx.fillStyle = canAfford ? '#fff' : 'rgba(255,255,255,0.3)'
        ctx.font = '12px system-ui'
        ctx.fillText(`Zombie (${cost})`, zombieBtnX + 50, 234)

        if (!canAfford) {
          ctx.fillStyle = '#e74c5c'
          ctx.font = '10px system-ui'
          ctx.fillText('Not enough DNA', this.canvasW / 2, 260)
        }
      } else {
        ctx.fillStyle = '#58d68d'
        ctx.font = '12px system-ui'
        ctx.fillText('MAX LEVEL — All 52 evolutions complete!', this.canvasW / 2, 235)
      }
    }

    const btnY = this.canvasH - 60
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.beginPath()
    ctx.roundRect(this.canvasW / 2 - 90, btnY, 180, 40, 8)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Back to Play', this.canvasW / 2, btnY + 20)

    if (this.evolveAnimTimer > 0) {
      for (const p of this.evolveParticles) {
        const alpha = 1 - p.life / p.maxLife
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3 * alpha, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      }
      ctx.globalAlpha = 1

      ctx.fillStyle = '#58d68d'
      ctx.font = 'bold 22px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const alpha = Math.min(1, this.evolveAnimTimer / 20)
      ctx.globalAlpha = alpha
      ctx.fillText(`✨ ${this.evolveAnimLetter} Evolved!`, this.canvasW / 2, this.canvasH / 2 - 40)
      ctx.globalAlpha = 1
    }

    this.drawMessage(ctx)
  }

  private drawGallery(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#0b0e1a'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 22px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('🖼️ Collection Gallery', this.canvasW / 2, 30)
    ctx.font = '14px system-ui'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    const total = Object.values(this.state.evolutions).filter(e => e.level >= 3).length
    ctx.fillText(`${total} / 52 Evolutions Complete`, this.canvasW / 2, 55)

    const cols = 7
    const cellSize = 50
    const gap = 8
    const startX = (this.canvasW - cols * cellSize - (cols - 1) * gap) / 2
    const startY = 80

    for (let i = 0; i < ALL_LETTERS.length; i++) {
      const letter = ALL_LETTERS[i]
      const ev = this.state.evolutions[letter]
      const gx = startX + (i % cols) * (cellSize + gap)
      const gy = startY + Math.floor(i / cols) * (cellSize + gap)

      if (ev && ev.level >= 3) {
        ctx.fillStyle = ev.path === 'oddbod' ? '#f5b041' : '#4F8A5E'
        ctx.fillRect(gx, gy, cellSize, cellSize)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 20px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(letter, gx + cellSize / 2, gy + cellSize / 2)
        ctx.fillStyle = ev.path === 'oddbod' ? '#fff' : '#88cc88'
        ctx.font = '9px system-ui'
        ctx.fillText(ev.path === 'oddbod' ? '✨' : '🧟', gx + cellSize / 2, gy + cellSize - 8)
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.05)'
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.lineWidth = 1
        ctx.strokeRect(gx, gy, cellSize, cellSize)
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.font = '18px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('?', gx + cellSize / 2, gy + cellSize / 2)
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '14px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Click to return to game', this.canvasW / 2, this.canvasH - 30)
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife
      if (alpha <= 0) continue
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3 * alpha, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawMessage(ctx: CanvasRenderingContext2D): void {
    if (this.messageTimer <= 0) return
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, this.messageTimer / 15)})`
    ctx.font = 'bold 16px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(this.message, this.canvasW / 2, this.canvasH - 80)
  }

  private drawWinScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
    ctx.fillStyle = '#58d68d'
    ctx.font = 'bold 32px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🧬 Alphabet Evolution Complete!', this.canvasW / 2, this.canvasH / 2 - 40)
    ctx.fillStyle = '#f5b041'
    ctx.font = '18px system-ui'
    ctx.fillText('All 52 evolutions collected!', this.canvasW / 2, this.canvasH / 2)
    ctx.fillStyle = '#8899bb'
    ctx.font = '14px system-ui'
    ctx.fillText('Every letter transformed in both Oddbod and Zombie paths', this.canvasW / 2, this.canvasH / 2 + 35)
  }

  restart(): void {
    const saved = localStorage.getItem('evolutions')
    const freshEvolutions = saved ? JSON.parse(saved) : {}
    this.state = {
      dna: 0, lettersPopped: 0,
      evolutions: { ...freshEvolutions },
      score: 0, winner: false,
      screen: 'play', selectedLetter: null,
    }
    this.letters = []
    this.particles = []
    this.evolveParticles = []
    this.evolveAnimTimer = 0
    this.frame = 0
    this.spawnLetters()
  }
}
