import { ALL_LETTERS } from '../characters/data'
import { Renderer } from '../renderer/Renderer'

interface DinerCustomer {
  name: string
  word: string
  wordIndex: number
  patience: number
  maxPatience: number
  active: boolean
  served: boolean
  angry: boolean
}

interface DinerIngredient {
  letter: string
  x: number
  y: number
  radius: number
  used: boolean
}

const ZOMBIE_NAMES = ['Classic', 'Decayed', 'Toxic', 'Undead', 'Rotten', 'Ghoul', 'Mutant', 'Biter', 'Creep', 'Stalker']

const ORDER_WORDS = ['CAT', 'DOG', 'BUN', 'CUP', 'FAN', 'MAP', 'PEN', 'LOG', 'BED', 'HEN', 'PIG', 'JAM', 'NUT', 'FOX', 'BOX', 'RED', 'HAT', 'SUN', 'BIG', 'FUN', 'BUG', 'MOP', 'RUG', 'VAN', 'WEB', 'YAM', 'ZIP', 'BAT', 'CAN', 'DOT', 'EGG', 'FIN', 'GUM', 'HOP', 'INK', 'KIT', 'LIP', 'MIX', 'NET', 'OWL', 'POT', 'RAM', 'SIT', 'TOP', 'URN', 'WAX', 'YES']

export class ZombieDinerMode {
  private canvasW: number
  private canvasH: number
  private frame = 0
  private phase: 'playing' | 'gameover' = 'playing'

  private customers: DinerCustomer[] = []
  private ingredients: DinerIngredient[] = []
  private activeCustomer = -1
  private score = 0
  private lives = 3
  private ordersServed = 0
  private totalOrders = 26
  private combo = 0
  private highScore = 0
  private message = ''
  private messageTimer = 0
  private trayItems: { letter: string; x: number }[] = []

  private particles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = []

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    const hs = parseInt(localStorage.getItem('hs_zombiediner') || '0', 10)
    this.highScore = hs
    this.spawnCustomers()
    this.spawnIngredients()
  }

  private spawnCustomers(): void {
    this.customers = []
    for (let i = 0; i < 3; i++) {
      const word = ORDER_WORDS[Math.floor(Math.random() * ORDER_WORDS.length)]
      this.customers.push({
        name: ZOMBIE_NAMES[Math.floor(Math.random() * ZOMBIE_NAMES.length)],
        word,
        wordIndex: 0,
        patience: 300 + Math.random() * 100,
        maxPatience: 400,
        active: i === 0,
        served: false,
        angry: false,
      })
    }
    this.activeCustomer = 0
  }

  private spawnIngredients(): void {
    this.ingredients = []
    const needed = new Set<string>()
    for (const c of this.customers) {
      for (const ch of c.word) needed.add(ch)
    }
    const pool = ALL_LETTERS.filter(l => !needed.has(l))
    const allLetters = Array.from(needed)
    while (allLetters.length < 8) {
      const r = pool[Math.floor(Math.random() * pool.length)]
      if (!allLetters.includes(r)) allLetters.push(r)
    }
    for (let i = allLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLetters[i], allLetters[j]] = [allLetters[j], allLetters[i]]
    }

    const cols = Math.min(4, allLetters.length)
    const gapX = this.canvasW * 0.18
    const startX = (this.canvasW - (cols - 1) * gapX) / 2
    const gapY = 70
    const startY = this.canvasH * 0.72

    allLetters.forEach((letter, i) => {
      this.ingredients.push({
        letter,
        x: startX + (i % cols) * gapX,
        y: startY + Math.floor(i / cols) * gapY,
        radius: 22,
        used: false,
      })
    })
  }

  handleClick(cx: number, cy: number): void {
    if (this.phase === 'gameover') {
      this.restart()
      return
    }

    for (const ing of this.ingredients) {
      if (ing.used) continue
      const dx = cx - ing.x
      const dy = cy - ing.y
      if (dx * dx + dy * dy < ing.radius * ing.radius) {
        this.tryServe(ing.letter)
        return
      }
    }
  }

  handleKey(key: string): void {
    if (this.phase === 'gameover') {
      if (key === ' ') this.restart()
      return
    }
    this.tryServe(key.toUpperCase())
  }

  private tryServe(letter: string): void {
    if (this.activeCustomer < 0 || this.activeCustomer >= this.customers.length) return
    const cust = this.customers[this.activeCustomer]
    if (cust.served) return

    const expected = cust.word[cust.wordIndex]
    if (letter === expected) {
      cust.wordIndex++
      this.trayItems.push({ letter, x: this.canvasW / 2 - 40 + cust.wordIndex * 20 })

      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2
        const s = 1 + Math.random() * 2
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.5, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#58d68d', life: 0, maxLife: 15 })
      }

      if (cust.wordIndex >= cust.word.length) {
        cust.served = true
        this.combo++
        const bonus = this.combo * 5
        this.score += 20 + bonus
        this.ordersServed++
        this.message = `+${20 + bonus}  Combo x${this.combo}!`
        this.messageTimer = 60

        for (let i = 0; i < 15; i++) {
          const a = Math.random() * Math.PI * 2
          const s = 2 + Math.random() * 3
          this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.3, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#f5b041', life: 0, maxLife: 25 })
        }

        this.trayItems = []

        if (this.ordersServed >= this.totalOrders) {
          this.phase = 'gameover'
          if (this.score > this.highScore) {
            this.highScore = this.score
            localStorage.setItem('hs_zombiediner', String(this.score))
          }
          this.onStateChange?.({ score: this.score, orders: this.ordersServed })
          return
        }

        this.nextCustomer()

        for (const ing of this.ingredients) {
          const stillNeeded = new Set<string>()
          for (const c of this.customers) {
            if (!c.served && !c.angry) {
              for (let i = c.wordIndex; i < c.word.length; i++) stillNeeded.add(c.word[i])
            }
          }
          if (!stillNeeded.has(ing.letter)) ing.used = true
        }

        setTimeout(() => { this.spawnIngredients() }, 500)
      }

      const ingredient = this.ingredients.find(i => i.letter === letter && !i.used)
      if (ingredient) ingredient.used = true

      this.onStateChange?.({ score: this.score, lives: this.lives, orders: this.ordersServed })
    } else {
      this.combo = 0
      this.message = 'Wrong! Combo lost!'
      this.messageTimer = 30
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2
        const s = 1 + Math.random() * 2
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.5, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#e74c5c', life: 0, maxLife: 15 })
      }
    }
  }

  private nextCustomer(): void {
    const served = this.customers.findIndex(c => c.served)
    if (served >= 0) {
      this.customers.splice(served, 1)
      const word = ORDER_WORDS[Math.floor(Math.random() * ORDER_WORDS.length)]
      this.customers.push({
        name: ZOMBIE_NAMES[Math.floor(Math.random() * ZOMBIE_NAMES.length)],
        word,
        wordIndex: 0,
        patience: 300 + Math.random() * 100,
        maxPatience: 400,
        active: false,
        served: false,
        angry: false,
      })
    }

    this.activeCustomer = this.customers.findIndex(c => !c.served && !c.angry && c.active)
    if (this.activeCustomer < 0) {
      this.activeCustomer = this.customers.findIndex(c => !c.served && !c.angry)
      if (this.activeCustomer >= 0) this.customers[this.activeCustomer].active = true
    }
  }

  restart(): void {
    this.score = 0
    this.lives = 3
    this.ordersServed = 0
    this.combo = 0
    this.trayItems = []
    this.particles = []
    this.message = ''
    this.messageTimer = 0
    this.phase = 'playing'
    this.frame = 0
    this.spawnCustomers()
    this.spawnIngredients()
  }

  update(): void {
    this.frame++
    if (this.phase !== 'playing') return

    if (this.messageTimer > 0) this.messageTimer--

    for (const cust of this.customers) {
      if (cust.served || cust.angry) continue
      if (cust.active) {
        cust.patience--
        if (cust.patience <= 0) {
          cust.angry = true
          this.lives--
          this.combo = 0
          this.message = `${cust.name} stormed out! -1 ❤️`
          this.messageTimer = 60
          for (let i = 0; i < 10; i++) {
            const a = Math.random() * Math.PI * 2
            const s = 1 + Math.random() * 3
            this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.2, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#e74c5c', life: 0, maxLife: 20 })
          }
          this.onStateChange?.({ score: this.score, lives: this.lives, orders: this.ordersServed })

          if (this.lives <= 0) {
            this.phase = 'gameover'
            if (this.score > this.highScore) {
              this.highScore = this.score
              localStorage.setItem('hs_zombiediner', String(this.score))
            }
            this.onStateChange?.({ score: this.score, orders: this.ordersServed })
            return
          }

          this.customers.splice(this.customers.indexOf(cust), 1)
          const word = ORDER_WORDS[Math.floor(Math.random() * ORDER_WORDS.length)]
          this.customers.push({
            name: ZOMBIE_NAMES[Math.floor(Math.random() * ZOMBIE_NAMES.length)],
            word,
            wordIndex: 0,
            patience: 300 + Math.random() * 100,
            maxPatience: 400,
            active: false,
            served: false,
            angry: false,
          })
          this.nextCustomer()
        }
      }
    }

    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life++
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife)
  }

  draw(ctx: Renderer): void {
    this.drawBackground(ctx)
    this.drawCounter(ctx)
    this.drawCustomers(ctx)
    this.drawIngredients(ctx)
    this.drawTray(ctx)
    this.drawParticles(ctx)
    this.drawHUD(ctx)

    if (this.messageTimer > 0) {
      ctx.fillStyle = '#f5b041'
      ctx.font = 'bold 18px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.message, this.canvasW / 2, this.canvasH * 0.35)
    }

    if (this.phase === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (this.ordersServed >= this.totalOrders) {
        ctx.fillStyle = '#58d68d'
        ctx.font = 'bold 32px system-ui'
        ctx.fillText('🍽️ Diner Champion!', this.canvasW / 2, this.canvasH / 2 - 50)
        ctx.fillStyle = '#fff'
        ctx.font = '18px system-ui'
        ctx.fillText('All 26 orders served!', this.canvasW / 2, this.canvasH / 2)
      } else {
        ctx.fillStyle = '#e74c5c'
        ctx.font = 'bold 32px system-ui'
        ctx.fillText('💀 Diner Closed!', this.canvasW / 2, this.canvasH / 2 - 50)
        ctx.fillStyle = '#fff'
        ctx.font = '18px system-ui'
        ctx.fillText('Too many angry customers!', this.canvasW / 2, this.canvasH / 2)
      }

      ctx.fillStyle = '#f5b041'
      ctx.font = '20px system-ui'
      ctx.fillText(`Orders: ${this.ordersServed}/26  Score: ${this.score}  Best: ${this.highScore}`, this.canvasW / 2, this.canvasH / 2 + 40)
      ctx.fillStyle = '#8899bb'
      ctx.font = '14px system-ui'
      ctx.fillText('Click or press SPACE to play again', this.canvasW / 2, this.canvasH / 2 + 80)
    }
  }

  private drawBackground(ctx: Renderer): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#2a1a0a')
    grad.addColorStop(0.5, '#3a2a1a')
    grad.addColorStop(1, '#1a0a00')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#4a3a2a'
    ctx.fillRect(0, this.canvasH * 0.65, this.canvasW, this.canvasH * 0.35)

    ctx.fillStyle = '#5a4a3a'
    ctx.fillRect(0, this.canvasH * 0.65, this.canvasW, 6)
  }

  private drawCounter(ctx: Renderer): void {
    ctx.fillStyle = '#8a7a6a'
    ctx.fillRect(0, this.canvasH * 0.4, this.canvasW, 8)
    ctx.fillStyle = '#6a5a4a'
    ctx.fillRect(0, this.canvasH * 0.4, this.canvasW, 3)
  }

  private drawCustomers(ctx: Renderer): void {
    for (let i = 0; i < this.customers.length; i++) {
      const cust = this.customers[i]
      const cx = this.canvasW * (0.2 + i * 0.3)
      const cy = this.canvasH * 0.2
      const isActive = cust.active

      ctx.fillStyle = cust.angry ? '#8a2a2a' : cust.served ? '#2a5a2a' : '#4a6a4a'
      ctx.beginPath()
      ctx.arc(cx, cy, 24, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ccd'
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(cx + side * 7, cy - 4, isActive ? 4 : 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(cx + side * 7, cy - 4, 2, 0, Math.PI * 2)
        ctx.fillStyle = cust.angry ? '#ff0000' : '#222'
        ctx.fill()
      }

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(cust.name.substring(0, 6), cx, cy - 32)

      if (!cust.served && !cust.angry) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)'
        ctx.beginPath()
        ctx.roundRect(cx - 45, cy + 28, 90, 20, 4)
        ctx.fill()

        ctx.font = 'bold 13px system-ui'
        for (let j = 0; j < cust.word.length; j++) {
          const lx = cx - 25 + j * 22
          if (j < cust.wordIndex) {
            ctx.fillStyle = '#58d68d'
            ctx.fillText(cust.word[j], lx, cy + 38)
          } else {
            ctx.fillStyle = 'rgba(255,255,255,0.2)'
            ctx.fillText(cust.word[j], lx, cy + 38)
          }
        }

        const patPct = cust.patience / cust.maxPatience
        ctx.fillStyle = 'rgba(0,0,0,0.4)'
        ctx.beginPath()
        ctx.roundRect(cx - 35, cy + 48, 70, 5, 3)
        ctx.fill()
        ctx.fillStyle = patPct > 0.5 ? '#58d68d' : patPct > 0.25 ? '#f5b041' : '#e74c5c'
        ctx.beginPath()
        ctx.roundRect(cx - 35, cy + 48, 70 * patPct, 5, 3)
        ctx.fill()
      } else if (cust.served) {
        ctx.fillStyle = '#58d68d'
        ctx.font = 'bold 12px system-ui'
        ctx.fillText('✓ Served!', cx, cy + 38)
      } else {
        ctx.fillStyle = '#e74c5c'
        ctx.font = 'bold 12px system-ui'
        ctx.fillText('✗ Left!', cx, cy + 38)
      }

      if (isActive) {
        ctx.strokeStyle = '#f5b041'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx, cy, 28, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }

  private drawIngredients(ctx: Renderer): void {
    for (const ing of this.ingredients) {
      if (ing.used) {
        ctx.globalAlpha = 0.2
      }
      ctx.fillStyle = '#5dade2'
      ctx.beginPath()
      ctx.arc(ing.x, ing.y, ing.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(ing.x, ing.y, ing.radius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(ing.letter, ing.x, ing.y + 1)
      ctx.globalAlpha = 1
    }
  }

  private drawTray(ctx: Renderer): void {
    const trayY = this.canvasH * 0.55
    ctx.fillStyle = '#6a5a4a'
    ctx.beginPath()
    ctx.roundRect(this.canvasW / 2 - 60, trayY, 120, 24, 4)
    ctx.fill()

    for (const item of this.trayItems) {
      ctx.fillStyle = '#58d68d'
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(item.letter, item.x, trayY + 12)
    }
  }

  private drawParticles(ctx: Renderer): void {
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife
      if (alpha <= 0) continue
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, 2 * alpha + 1, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawHUD(ctx: Renderer): void {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, 0, this.canvasW, 32)

    ctx.textBaseline = 'middle'
    ctx.font = 'bold 13px system-ui'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#f5b041'
    ctx.fillText('🧟 Zombie Diner', 10, 16)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#e74c5c'
    let hearts = ''
    for (let i = 0; i < this.lives; i++) hearts += '❤️'
    for (let i = this.lives; i < 3; i++) hearts += '🖤'
    ctx.fillText(hearts, this.canvasW / 2 - 30, 16)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#58d68d'
    ctx.fillText(`Orders: ${this.ordersServed}/26  Score: ${this.score}`, this.canvasW - 10, 16)
  }
}
