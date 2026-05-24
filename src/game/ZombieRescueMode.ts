import { CHARACTERS, ALL_LETTERS } from '../characters/data'
import { drawCharacter } from '../characters/draw'
import { FloatingLetter } from './FloatingLetter'

interface RescueRoom {
  name: string
  letters: string[]
  zombieType: number
  bgGradient: [string, string]
}

interface RescueCage {
  letter: string
  word: string
  blankIndex: number
  freed: boolean
  x: number
  y: number
}

interface RescueState {
  lettersFreed: number
  totalLetters: number
  currentRoom: number
  totalRooms: number
  score: number
  winner: boolean
  powerUpActive: string | null
  powerUpTimer: number
}

const ROOMS: RescueRoom[] = [
  { name: 'Front Entrance', letters: ['A', 'B', 'C', 'D'], zombieType: 0, bgGradient: ['#1a0a0a', '#3a1a1a'] },
  { name: 'Hallway', letters: ['E', 'F', 'G', 'H', 'I'], zombieType: 1, bgGradient: ['#1a1a0a', '#3a2a1a'] },
  { name: 'Lab', letters: ['J', 'K', 'L', 'M'], zombieType: 2, bgGradient: ['#0a1a0a', '#1a3a1a'] },
  { name: 'Night Wing', letters: ['N', 'O', 'P', 'Q', 'R'], zombieType: 3, bgGradient: ['#0a0a1a', '#1a1a3a'] },
  { name: 'Cell Block', letters: ['S', 'T', 'U', 'V'], zombieType: 4, bgGradient: ['#1a0a1a', '#3a1a2a'] },
  { name: 'Dungeon', letters: ['W', 'X', 'Y', 'Z'], zombieType: 5, bgGradient: ['#0a0a0a', '#2a1a0a'] },
]

const POWER_UPS = [
  { id: 'slow', name: 'Bubbles', icon: '🐢', desc: 'Slows zombies' },
  { id: 'hint', name: 'Jeff', icon: '💡', desc: 'Shows correct letter' },
  { id: 'distract', name: 'Pogo', icon: '🤡', desc: 'Distracts zombies' },
  { id: 'burn', name: 'Fuse', icon: '🔥', desc: 'Burns cage bars' },
  { id: 'heal', name: 'Newt', icon: '✨', desc: 'Sparkle cheer' },
  { id: 'freeze', name: 'Zee', icon: '❄️', desc: 'Freezes zombies' },
  { id: 'reveal', name: 'Slick', icon: '🔦', desc: 'Reveals full word' },
]

const WORDS_POOL = [
  { word: 'JUPITER', emoji: '🪐' }, { word: 'DRAGON', emoji: '🐉' },
  { word: 'BANANA', emoji: '🍌' }, { word: 'VOLCANO', emoji: '🌋' },
  { word: 'KNIGHT', emoji: '⚔️' }, { word: 'WIZARD', emoji: '🧙' },
  { word: 'BRIDGE', emoji: '🌉' }, { word: 'GALAXY', emoji: '🌌' },
  { word: 'JUNGLE', emoji: '🌴' }, { word: 'LANTERN', emoji: '🏮' },
  { word: 'PLANET', emoji: '🌍' }, { word: 'PUZZLE', emoji: '🧩' },
  { word: 'SAILOR', emoji: '⛵' }, { word: 'TROPHY', emoji: '🏆' },
  { word: 'VIKING', emoji: '🛡️' }, { word: 'PYTHON', emoji: '🐍' },
  { word: 'TURTLE', emoji: '🐢' }, { word: 'FLOWER', emoji: '🌸' },
  { word: 'GUITAR', emoji: '🎸' }, { word: 'ISLAND', emoji: '🏝️' },
  { word: 'JACKET', emoji: '🧥' }, { word: 'LADDER', emoji: '🪜' },
  { word: 'PIRATE', emoji: '🏴‍☠️' }, { word: 'ROBOT', emoji: '🤖' },
  { word: 'SCARF', emoji: '🧣' }, { word: 'UNICORN', emoji: '🦄' },
]

const ZOMBIE_WARDEN = [
  { name: 'Classic', bodyColor: '#5B8C5A', outlineColor: '#3D6B3C' },
  { name: 'Decayed', bodyColor: '#7A8A6E', outlineColor: '#5A6A4E' },
  { name: 'Toxic', bodyColor: '#4F8A5E', outlineColor: '#2F6A3E' },
  { name: 'Undead', bodyColor: '#8A7A6E', outlineColor: '#6A5A4E' },
  { name: 'Rotten', bodyColor: '#6A7A5E', outlineColor: '#4A5A3E' },
  { name: 'Ghoul', bodyColor: '#5A7A6E', outlineColor: '#3A5A4E' },
  { name: 'Mutant', bodyColor: '#7A6A5E', outlineColor: '#5A4A3E' },
]

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickWordForLetter(letter: string): { word: string; emoji: string; blankIndex: number } {
  const pool = WORDS_POOL.filter(w => w.word.includes(letter))
  if (pool.length === 0) {
    const fallback = WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)]
    let bi = fallback.word.indexOf(letter)
    if (bi === -1) bi = Math.floor(Math.random() * fallback.word.length)
    return { ...fallback, blankIndex: bi }
  }
  const pick = pool[Math.floor(Math.random() * pool.length)]
  const bi = pick.word.indexOf(letter)
  return { ...pick, blankIndex: bi }
}

export class ZombieRescueMode {
  private canvasW: number
  private canvasH: number
  private state: RescueState
  private cages: RescueCage[] = []
  private floatingLetters: FloatingLetter[] = []
  private zombies: { x: number; y: number; designIndex: number; runFrame: number; alive: boolean }[] = []
  private particles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []
  private freedLetters: { letter: string; x: number; y: number; vy: number; life: number }[] = []
  private roomTransition = 0
  private correctFlash = 0
  private pulseTimer = 0
  private wrongPulse = 0

  onStateChange?: (state: { score: number; lettersFreed: number; totalLetters: number; currentRoom: number; totalRooms: number; winner: boolean }) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.state = {
      lettersFreed: 0, totalLetters: 26, currentRoom: 0,
      totalRooms: ROOMS.length, score: 0, winner: false,
      powerUpActive: null, powerUpTimer: 0,
    }
    this.startRoom(0)
  }

  private startRoom(roomIndex: number): void {
    this.state.currentRoom = roomIndex
    this.state.powerUpActive = null
    this.state.powerUpTimer = 0
    this.floatingLetters = []
    this.particles = []
    this.freedLetters = []
    this.correctFlash = 0
    this.roomTransition = 0

    const room = ROOMS[roomIndex]
    const cageCount = room.letters.length
    const spacingX = Math.min(120, (this.canvasW - 100) / cageCount)
    const startX = (this.canvasW - (cageCount - 1) * spacingX) / 2
    const cageY = this.canvasH * 0.2

    this.cages = room.letters.map((letter, i) => {
      const wd = pickWordForLetter(letter)
      return {
        letter,
        word: wd.word,
        blankIndex: wd.blankIndex,
        freed: false,
        x: startX + i * spacingX,
        y: cageY,
      }
    })

    this.zombies = []
    const zombieCount = 1 + Math.floor(roomIndex / 2)
    for (let i = 0; i < zombieCount; i++) {
      this.zombies.push({
        x: 40 + Math.random() * (this.canvasW - 80),
        y: this.canvasH * 0.7 + Math.random() * (this.canvasH * 0.2),
        designIndex: room.zombieType,
        runFrame: Math.random() * 100,
        alive: true,
      })
    }

    this.spawnFloatingOptions()
  }

  private spawnFloatingOptions(): void {
    const needed = new Set(this.cages.filter(c => !c.freed).map(c => c.letter))
    const options = [...needed]
    const pool = ALL_LETTERS.filter(l => !needed.has(l))
    while (options.length < 6 && pool.length > 0) {
      const pick = pool[Math.floor(Math.random() * pool.length)]
      if (!options.includes(pick)) options.push(pick)
    }
    this.floatingLetters = shuffleArray(options).map(l =>
      new FloatingLetter(this.canvasW, this.canvasH, l, this.canvasH * 0.45)
    )
  }

  handleClick(cx: number, cy: number): void {
    if (this.state.winner || this.roomTransition > 0 || this.correctFlash > 0) return

    for (const letter of this.floatingLetters) {
      if (!letter.collected && letter.containsCanvas(cx, cy)) {
        this.handleLetterPick(letter.letter)
        letter.pop()
        return
      }
    }
  }

  handleKey(key: string): void {
    if (this.state.winner || this.roomTransition > 0 || this.correctFlash > 0) return
    const letter = this.floatingLetters.find(l => !l.collected && l.letter.toLowerCase() === key)
    if (letter) {
      this.handleLetterPick(letter.letter)
      letter.pop()
    }
  }

  private handleLetterPick(letter: string): void {
    const cage = this.cages.find(c => !c.freed && c.letter === letter)
    if (cage) {
      cage.freed = true
      this.state.lettersFreed++
      this.state.score += cage.word === '' ? 5 : 10
      this.freedLetters.push({
        letter: cage.letter,
        x: cage.x + 30,
        y: cage.y + 30,
        vy: -4 - Math.random() * 2,
        life: 0,
      })
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 3
        this.particles.push({
          x: cage.x + 30, y: cage.y + 30,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          color: ['#58d68d', '#f5b041', '#5dade2', '#af7ac5', '#e74c5c'][Math.floor(Math.random() * 5)],
          life: 0, maxLife: 30 + Math.random() * 20,
        })
      }
      this.correctFlash = 1
      this.onStateChange?.({
        score: this.state.score,
        lettersFreed: this.state.lettersFreed,
        totalLetters: this.state.totalLetters,
        currentRoom: this.state.currentRoom,
        totalRooms: this.state.totalRooms,
        winner: this.state.winner,
      })

      const allFreed = this.cages.every(c => c.freed)
      if (allFreed) {
        if (this.state.currentRoom < ROOMS.length - 1) {
          this.roomTransition = 1
        } else {
          this.state.winner = true
          this.onStateChange?.({
            score: this.state.score,
            lettersFreed: this.state.lettersFreed,
            totalLetters: this.state.totalLetters,
            currentRoom: this.state.currentRoom,
            totalRooms: this.state.totalRooms,
            winner: true,
          })
        }
      }
    } else {
      this.wrongPulse = 20
      for (const z of this.zombies) {
        z.x += (Math.random() - 0.5) * 20
        z.y += (Math.random() - 0.5) * 10
      }
    }
  }

  update(): void {
    if (this.state.winner) return

    if (this.roomTransition > 0) {
      this.roomTransition++
      if (this.roomTransition > 90) {
        this.roomTransition = 0
        this.startRoom(this.state.currentRoom + 1)
      }
    }

    if (this.correctFlash > 0) {
      this.correctFlash++
      for (const p of this.particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++
      }
      this.particles = this.particles.filter(p => p.life < p.maxLife)
      for (const fl of this.freedLetters) {
        fl.y += fl.vy
        fl.vy += 0.15
        fl.life++
      }
      this.freedLetters = this.freedLetters.filter(fl => fl.life < 60)
      if (this.correctFlash > 45) {
        this.correctFlash = 0
        if (!this.roomTransition) this.spawnFloatingOptions()
      }
      return
    }

    if (this.wrongPulse > 0) this.wrongPulse--

    for (const letter of this.floatingLetters) {
      letter.update(0)
    }
    this.floatingLetters = this.floatingLetters.filter(l => {
      if (l.collected) {
        return l.popTime < l.popDuration
      }
      return true
    })

    for (const z of this.zombies) {
      z.runFrame++
      z.x += Math.sin(z.runFrame * 0.02) * 0.5
      z.y += Math.cos(z.runFrame * 0.015) * 0.3
    }

    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife)

    for (const fl of this.freedLetters) {
      fl.y += fl.vy
      fl.vy += 0.15
      fl.life++
    }
    this.freedLetters = this.freedLetters.filter(fl => fl.life < 60)

    this.pulseTimer++
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawBackground(ctx)
    this.drawCages(ctx)
    this.drawZombies(ctx)
    this.drawFloatingLetters(ctx)
    this.drawWordPrompts(ctx)
    this.drawParticles(ctx)
    this.drawFreedLetters(ctx)
    this.drawPowerUps(ctx)
    this.drawHUD(ctx)

    if (this.roomTransition > 0) {
      this.drawRoomTransition(ctx)
    }

    if (this.state.winner) {
      this.drawWinScreen(ctx)
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const room = ROOMS[this.state.currentRoom]
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, room.bgGradient[0])
    grad.addColorStop(1, room.bgGradient[1])
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    for (let i = 0; i < 15; i++) {
      const flicker = (Math.sin(this.pulseTimer * 0.03 + i * 1.7) * 0.3 + 0.7) * 0.3
      ctx.globalAlpha = flicker
      ctx.fillStyle = '#ffd'
      const bx = (i * 97 + 50) % this.canvasW
      const by = (i * 53 + 20) % (this.canvasH * 0.3)
      ctx.beginPath()
      ctx.arc(bx, by, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fillRect(0, this.canvasH * 0.65, this.canvasW, this.canvasH * 0.35)

    ctx.fillStyle = room.bgGradient[1]
    ctx.fillRect(0, this.canvasH * 0.65, this.canvasW, 3)
  }

  private drawCages(ctx: CanvasRenderingContext2D): void {
    for (const cage of this.cages) {
      const cx = cage.x
      const cy = cage.y
      const cw = 60
      const ch = 70

      ctx.save()

      ctx.strokeStyle = 'rgba(200,180,150,0.6)'
      ctx.lineWidth = 2
      ctx.strokeRect(cx, cy, cw, ch)

      for (let i = 0; i < 4; i++) {
        const bx = cx + (i + 1) * (cw / 5)
        ctx.beginPath()
        ctx.moveTo(bx, cy)
        ctx.lineTo(bx, cy + ch)
        ctx.strokeStyle = 'rgba(200,180,150,0.4)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      for (let i = 0; i < 3; i++) {
        const by = cy + (i + 1) * (ch / 4)
        ctx.beginPath()
        ctx.moveTo(cx, by)
        ctx.lineTo(cx + cw, by)
        ctx.strokeStyle = 'rgba(200,180,150,0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      if (cage.freed) {
        ctx.strokeStyle = 'rgba(88,214,141,0.3)'
        ctx.lineWidth = 3
        ctx.strokeRect(cx - 2, cy - 2, cw + 4, ch + 4)
        ctx.fillStyle = 'rgba(88,214,141,0.05)'
        ctx.fillRect(cx, cy, cw, ch)
      } else {
        const def = CHARACTERS[cage.letter]
        if (def) {
          ctx.globalAlpha = 0.5
          drawCharacter(ctx, cage.letter, cx + 6, cy + 8, 0.8, 0)
          ctx.globalAlpha = 1
        }
      }

      ctx.restore()
    }
  }

  private drawZombies(ctx: CanvasRenderingContext2D): void {
    for (const z of this.zombies) {
      if (!z.alive) continue
      const design = ZOMBIE_WARDEN[z.designIndex]
      const r = 22
      const wobble = Math.sin(z.runFrame * 0.1) * 3

      ctx.save()
      ctx.translate(z.x, z.y)

      ctx.fillStyle = design.bodyColor
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = design.outlineColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.stroke()

      const eyeR = r * 0.18
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(side * r * 0.3, -r * 0.15 + wobble * 0.1, eyeR, 0, Math.PI * 2)
        ctx.fillStyle = '#ccd'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(side * r * 0.3, -r * 0.15 + wobble * 0.1, r * 0.1, 0, Math.PI * 2)
        ctx.fillStyle = '#cc2222'
        ctx.fill()
      }

      ctx.strokeStyle = '#222'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(0, r * 0.2, r * 0.12, 0.3, Math.PI - 0.3)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, -r * 0.7)
      ctx.lineTo(wobble * 0.3, -r * 1.1)
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 1.2
      ctx.stroke()

      ctx.restore()
    }
  }

  private drawFloatingLetters(ctx: CanvasRenderingContext2D): void {
    for (const letter of this.floatingLetters) {
      if (!letter.collected) {
        letter.draw(ctx, this.pulseTimer)
      } else if (letter.popTime < letter.popDuration) {
        letter.draw(ctx, this.pulseTimer)
      }
    }
  }

  private drawWordPrompts(ctx: CanvasRenderingContext2D): void {
    for (const cage of this.cages) {
      if (cage.freed) continue
      const cx = cage.x + 30
      const wordY = cage.y - 30

      const fontSize = 14
      ctx.font = `bold ${fontSize}px "Arial Black", Arial, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'

      let displayX = cx - (cage.word.length * (fontSize + 2)) / 2
      for (let i = 0; i < cage.word.length; i++) {
        const lx = displayX + i * (fontSize + 2)
        if (i === cage.blankIndex) {
          ctx.fillStyle = 'rgba(245,176,65,0.3)'
          ctx.fillRect(lx - 2, wordY - fontSize + 2, fontSize + 4, fontSize + 4)
          ctx.strokeStyle = '#f5b041'
          ctx.lineWidth = 1.5
          ctx.strokeRect(lx - 2, wordY - fontSize + 2, fontSize + 4, fontSize + 4)
        } else {
          ctx.fillStyle = '#fff'
          ctx.fillText(cage.word[i], lx + fontSize / 2, wordY + 2)
        }
      }
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife
      if (alpha <= 0) continue
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3 + alpha * 2, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawFreedLetters(ctx: CanvasRenderingContext2D): void {
    for (const fl of this.freedLetters) {
      const alpha = 1 - fl.life / 60
      if (alpha <= 0) continue
      ctx.globalAlpha = alpha
      const def = CHARACTERS[fl.letter]
      if (def) {
        ctx.font = 'bold 28px "Arial Black", Arial, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeStyle = def.outlineColor
        ctx.lineWidth = 3
        ctx.strokeText(fl.letter, fl.x + 12, fl.y + 14)
        ctx.fillStyle = def.bodyColor
        ctx.fillText(fl.letter, fl.x + 12, fl.y + 14)
      }
      ctx.globalAlpha = 1
    }
  }

  private drawPowerUps(ctx: CanvasRenderingContext2D): void {
    const pw = POWER_UPS
    const startX = this.canvasW - 170
    const startY = this.canvasH - 50

    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(startX - 8, startY - 8, pw.length * 28 + 16, 40)

    for (let i = 0; i < pw.length; i++) {
      const px = startX + i * 28
      ctx.font = '18px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(pw[i].icon, px + 12, startY + 12)
    }
  }

  private drawHUD(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, this.canvasW, 34)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px system-ui'
    ctx.textBaseline = 'middle'

    ctx.textAlign = 'left'
    ctx.fillStyle = '#58d68d'
    ctx.fillText(`Rescued: ${this.state.lettersFreed}/${this.state.totalLetters}`, 12, 17)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#f5b041'
    ctx.fillText(ROOMS[this.state.currentRoom].name, this.canvasW / 2, 17)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#5dade2'
    ctx.fillText(`Room ${this.state.currentRoom + 1}/${this.state.totalRooms}`, this.canvasW - 12, 17)

    if (this.wrongPulse > 0) {
      ctx.fillStyle = '#e74c5c'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Wrong! Zombies stirred...', this.canvasW / 2, this.canvasH - 16)
    }
  }

  private drawRoomTransition(ctx: CanvasRenderingContext2D): void {
    const alpha = Math.min(1, this.roomTransition / 30)
    ctx.fillStyle = `rgba(0,0,0,${alpha * 0.6})`
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
    ctx.fillStyle = `rgba(88, 214, 141, ${alpha})`
    ctx.font = 'bold 36px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Room Clear! 🎉', this.canvasW / 2, this.canvasH / 2 - 20)
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`
    ctx.font = '18px system-ui'
    const nextRoom = ROOMS[this.state.currentRoom + 1]
    ctx.fillText(`Next: ${nextRoom?.name || 'Final Room'}`, this.canvasW / 2, this.canvasH / 2 + 24)
  }

  private drawWinScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)
    ctx.fillStyle = '#58d68d'
    ctx.font = 'bold 42px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('All Letters Rescued! 🎉', this.canvasW / 2, this.canvasH / 2 - 30)
    ctx.fillStyle = '#f5b041'
    ctx.font = '20px system-ui'
    ctx.fillText(`Score: ${this.state.score}`, this.canvasW / 2, this.canvasH / 2 + 24)
    ctx.fillStyle = '#8899bb'
    ctx.font = '16px system-ui'
    ctx.fillText('Press SPACE to play again', this.canvasW / 2, this.canvasH / 2 + 60)

    const bobY = Math.sin(this.pulseTimer * 0.05) * 8
    ctx.font = '20px system-ui'
    ctx.fillText('🏆', this.canvasW / 2, this.canvasH / 2 - 90 + bobY)
  }

  restart(): void {
    this.state = {
      lettersFreed: 0, totalLetters: 26, currentRoom: 0,
      totalRooms: ROOMS.length, score: 0, winner: false,
      powerUpActive: null, powerUpTimer: 0,
    }
    this.cages = []
    this.floatingLetters = []
    this.zombies = []
    this.particles = []
    this.freedLetters = []
    this.roomTransition = 0
    this.correctFlash = 0
    this.wrongPulse = 0
    this.startRoom(0)
  }
}
