import { GameModeStrategy, GameInput } from '../GameModeStrategy'
import { DynamicGameConfig } from '../adapters/LocalGenerator'
import { drawCharacter } from '../../characters/draw'
import { CHARACTERS } from '../../characters/data'
import { ZombieChaser } from '../ZombieChaser'
import { OddbodChaser } from '../OddbodChaser'
import { Renderer } from '../../renderer/Renderer'

// Structural alignment with FloatingLetter so Zombie/Oddbod chasers can interact
class DynamicLetter {
  x: number
  y: number
  letter: string
  collected = false
  scale: number
  bobPhase: number
  drift: number
  correctPulse = 0
  particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }[] = []
  popTime = 0
  popDuration = 30

  // Configuration options
  behavior: 'bounce' | 'float_up' | 'fall_down' | 'sine_wave'
  speedX: number
  speedY: number
  gravity: number
  size: number
  canvasW: number
  canvasH: number

  constructor(
    canvasW: number,
    canvasH: number,
    letter: string,
    behavior: 'bounce' | 'float_up' | 'fall_down' | 'sine_wave',
    minSpeed: number,
    maxSpeed: number,
    size: number,
    gravity = 0
  ) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.letter = letter
    this.behavior = behavior
    this.gravity = gravity
    this.size = size
    this.scale = size / 40 // normalize base size 40 to scale

    // Initial position
    this.x = 50 + Math.random() * (canvasW - 100)
    if (behavior === 'fall_down') {
      this.y = -50 - Math.random() * 100
    } else if (behavior === 'float_up') {
      this.y = canvasH + Math.random() * 100
    } else {
      this.y = 80 + Math.random() * (canvasH - 180)
    }

    this.bobPhase = Math.random() * Math.PI * 2

    // Set speed vectors
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed)
    const angle = Math.random() * Math.PI * 2
    this.speedX = Math.cos(angle) * speed
    this.speedY = Math.sin(angle) * speed

    if (behavior === 'fall_down') {
      this.speedX = (Math.random() - 0.5) * 1.0
      this.speedY = speed // fall downwards
    } else if (behavior === 'float_up') {
      this.speedX = (Math.random() - 0.5) * 1.0
      this.speedY = -speed // float upwards
    } else if (behavior === 'sine_wave') {
      this.speedX = Math.random() > 0.5 ? speed : -speed
      this.speedY = 0
    }

    this.drift = 0.2 + Math.random() * 0.3
    if (Math.random() > 0.5) this.drift *= -1
  }

  containsCanvas(cx: number, cy: number): boolean {
    const centerX = this.x + 24 * this.scale
    const centerY = this.y + 28 * this.scale
    const half = 26 * this.scale
    return Math.abs(cx - centerX) < half && Math.abs(cy - centerY) < half
  }

  pop(): void {
    if (this.collected) return
    this.collected = true
    this.popTime = 0
    const def = CHARACTERS[this.letter]
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12
      const speed = 2 + Math.random() * 3
      this.particles.push({
        x: this.x + 24 * this.scale,
        y: this.y + 28 * this.scale,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 20 + Math.random() * 15,
        color: def?.bodyColor || '#fff',
        size: 2 + Math.random() * 4,
      })
    }
  }

  update(frame: number): boolean {
    if (this.collected) {
      this.popTime++
      for (const p of this.particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.life++
        p.vx *= 0.97
      }
      return this.popTime > this.popDuration
    }

    // Apply movement physics
    switch (this.behavior) {
      case 'bounce':
        this.x += this.speedX
        this.y += this.speedY

        // Bounce left/right
        if (this.x < 10) {
          this.x = 10
          this.speedX = Math.abs(this.speedX)
        } else if (this.x > this.canvasW - 60) {
          this.x = this.canvasW - 60
          this.speedX = -Math.abs(this.speedX)
        }

        // Bounce top/bottom (leave margin for HUD & instructions)
        if (this.y < 50) {
          this.y = 50
          this.speedY = Math.abs(this.speedY)
        } else if (this.y > this.canvasH - 70) {
          this.y = this.canvasH - 70
          this.speedY = -Math.abs(this.speedY)
        }
        break

      case 'fall_down':
        if (this.gravity) {
          this.speedY += this.gravity
        }
        this.x += this.speedX
        this.y += this.speedY

        // Recycle if goes off bottom
        if (this.y > this.canvasH) {
          this.y = -50
          this.x = 50 + Math.random() * (this.canvasW - 100)
          this.speedY = 1.0 + Math.random() * 1.5
        }
        // bounce sides
        if (this.x < 10 || this.x > this.canvasW - 60) {
          this.speedX *= -1
        }
        break

      case 'float_up':
        this.x += this.speedX
        this.y += this.speedY

        // Recycle if goes off top
        if (this.y < 30) {
          this.y = this.canvasH + 20
          this.x = 50 + Math.random() * (this.canvasW - 100)
        }
        // bounce sides
        if (this.x < 10 || this.x > this.canvasW - 60) {
          this.speedX *= -1
        }
        break

      case 'sine_wave':
        this.x += this.speedX
        this.y += Math.sin((frame + this.bobPhase) * 0.03) * 1.2

        // Wrap around horizontal boundaries
        if (this.speedX > 0 && this.x > this.canvasW) {
          this.x = -50
        } else if (this.speedX < 0 && this.x < -50) {
          this.x = this.canvasW
        }
        break
    }

    if (this.correctPulse > 0) this.correctPulse--

    return false
  }

  draw(ctx: Renderer, frame: number): void {
    if (!this.collected) {
      const bob = this.behavior === 'sine_wave' ? 0 : Math.sin((frame + this.bobPhase) * 0.03) * 6
      const pulse = this.correctPulse > 0 ? 1 + Math.sin(this.correctPulse * 0.3) * 0.15 : 0
      const s = this.scale * (1 + pulse)
      
      if (this.correctPulse > 0) {
        ctx.beginPath()
        ctx.arc(this.x + 24 * s, this.y + 28 * s + bob, 30 * s, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)'
        ctx.fill()
      }

      drawCharacter(ctx, this.letter, this.x, this.y + bob, s, 0)
      return
    }

    // Draw explosion particles
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife
      if (alpha <= 0) continue
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
}

class MeteorObstacle {
  x: number
  y: number
  speed: number
  size: number
  alive = true
  particles: { x: number; y: number; life: number; maxLife: number; color: string }[] = []

  constructor(canvasW: number) {
    this.x = 20 + Math.random() * (canvasW - 40)
    this.y = -40
    this.speed = 1.8 + Math.random() * 1.5
    this.size = 18 + Math.random() * 10
  }

  update(): boolean {
    this.y += this.speed
    
    // Spawn dust trail
    if (Math.random() < 0.3) {
      this.particles.push({
        x: this.x + (Math.random() - 0.5) * 10,
        y: this.y - 10,
        life: 0,
        maxLife: 20,
        color: Math.random() > 0.5 ? '#ff4400' : '#ffaa00'
      })
    }

    this.particles.forEach(p => {
      p.life++
      p.y -= 0.5
    })
    this.particles = this.particles.filter(p => p.life < p.maxLife)

    // Check bottom boundary
    return this.y > 600 // assume height max, cleaned by strategy
  }

  containsPoint(cx: number, cy: number): boolean {
    const dx = cx - this.x
    const dy = cy - this.y
    return dx * dx + dy * dy <= this.size * this.size
  }

  draw(ctx: Renderer): void {
    // Draw trail
    this.particles.forEach(p => {
      const alpha = 1 - p.life / p.maxLife
      ctx.globalAlpha = alpha * 0.4
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, this.size * 0.3 * alpha, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // Draw meteor body
    const grad = ctx.createRadialGradient(this.x - 3, this.y - 3, 2, this.x, this.y, this.size)
    grad.addColorStop(0, '#888')
    grad.addColorStop(0.6, '#444')
    grad.addColorStop(1, '#222')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()

    // Draw fire rim
    ctx.strokeStyle = '#ff3300'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size + 1, 0, Math.PI * 2)
    ctx.stroke()
  }
}

class GhostObstacle {
  x: number
  y: number
  speed: number
  angle: number
  wavyOffset: number
  size = 20
  alive = true
  opacityPhase = Math.random() * Math.PI * 2

  constructor(canvasW: number, canvasH: number) {
    this.x = Math.random() * canvasW
    this.y = 80 + Math.random() * (canvasH - 180)
    this.speed = 0.8 + Math.random() * 0.6
    this.angle = Math.random() * Math.PI * 2
    this.wavyOffset = Math.random() * 100
  }

  update(frame: number): void {
    this.opacityPhase += 0.02
    this.angle += (Math.random() - 0.5) * 0.05
    this.x += Math.cos(this.angle) * this.speed
    this.y += Math.sin(this.angle) * this.speed + Math.sin((frame + this.wavyOffset) * 0.03) * 0.2

    // Bound check
    if (this.x < 10) { this.x = 10; this.angle = Math.PI - this.angle }
    if (this.x > 800) { this.x = 750; this.angle = Math.PI - this.angle } // soft max width
    if (this.y < 60) { this.y = 60; this.angle = -this.angle }
    if (this.y > 550) { this.y = 500; this.angle = -this.angle }
  }

  containsPoint(cx: number, cy: number): boolean {
    const dx = cx - this.x
    const dy = cy - this.y
    return dx * dx + dy * dy <= this.size * this.size
  }

  draw(ctx: Renderer): void {
    const opacity = 0.3 + Math.sin(this.opacityPhase) * 0.25
    ctx.globalAlpha = opacity

    // Ghost body
    ctx.fillStyle = '#f0f4ff'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, Math.PI, 0, false)
    ctx.lineTo(this.x + this.size, this.y + this.size)
    // wavy bottom skirt
    ctx.lineTo(this.x + this.size * 0.5, this.y + this.size * 0.7)
    ctx.lineTo(this.x, this.y + this.size)
    ctx.lineTo(this.x - this.size * 0.5, this.y + this.size * 0.7)
    ctx.lineTo(this.x - this.size, this.y + this.size)
    ctx.closePath()
    ctx.fill()

    // Glowing eyes
    ctx.fillStyle = '#ff3344'
    ctx.beginPath()
    ctx.arc(this.x - 6, this.y - 2, 3, 0, Math.PI * 2)
    ctx.arc(this.x + 6, this.y - 2, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 1.0
  }
}

interface Projectile {
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  type: 'water' | 'fireball' | 'laser' | 'seed'
  alive: boolean
}

export class DynamicPromptStrategy implements GameModeStrategy {
  onStateChange?: (state: any) => void
  private config: DynamicGameConfig
  private canvasW = 800
  private canvasH = 600
  private frame = 0

  // Game Entities
  private letters: DynamicLetter[] = []
  private chasers: (ZombieChaser | OddbodChaser)[] = []
  private meteors: MeteorObstacle[] = []
  private ghosts: GhostObstacle[] = []
  private projectiles: Projectile[] = []

  // Game Stats
  private score = 0
  private lives = 3
  private timeLeft = 45
  private gameEnded = false
  private winner: 'human' | 'oddbods' | null = null

  // Special mechanics
  private customLettersIndex = 0
  private activeCustomLetter: string | null = null
  private frameCounter = 0
  private chaserSpawnTimer = 0
  private reloadTimer = 0

  // Background Particles
  private bgParticles: { x: number; y: number; size: number; speed: number; val1: number; val2: number }[] = []

  constructor(canvasW: number, canvasH: number, config: DynamicGameConfig) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.config = config
    this.lives = config.rules.lives
    if (config.rules.timeLimit) {
      this.timeLeft = config.rules.timeLimit
    }

    this.initBackgroundEffects()
  }

  private initBackgroundEffects() {
    this.bgParticles = []
    const effect = this.config.theme.specialEffects
    if (effect === 'none') return

    const count = effect === 'stars' ? 50 : 25
    for (let i = 0; i < count; i++) {
      this.bgParticles.push({
        x: Math.random() * this.canvasW,
        y: Math.random() * this.canvasH,
        size: effect === 'stars' ? 1 + Math.random() * 2 : 2 + Math.random() * 6,
        speed: 0.2 + Math.random() * 0.8,
        val1: Math.random() * Math.PI * 2, // phase
        val2: Math.random() * 0.5 + 0.5 // drift
      })
    }
  }

  start(canvasW: number, canvasH: number): void {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.restart(canvasW, canvasH)
  }

  restart(canvasW: number, canvasH: number): void {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.score = 0
    this.lives = this.config.rules.lives
    this.timeLeft = this.config.rules.timeLimit || 45
    this.gameEnded = false
    this.winner = null
    this.customLettersIndex = 0
    this.frameCounter = 0
    this.chaserSpawnTimer = 0
    this.reloadTimer = 0
    
    this.letters = []
    this.chasers = []
    this.meteors = []
    this.ghosts = []
    this.projectiles = []

    this.initBackgroundEffects()

    // Spawn first round of letters
    if (this.config.letters.pool === 'custom' && this.config.letters.customLetters) {
      this.activeCustomLetter = this.config.letters.customLetters[0]
      this.spawnLetter(this.activeCustomLetter)
    } else {
      const initialSpawnCount = 7
      for (let i = 0; i < initialSpawnCount; i++) {
        this.spawnRandomLetterFromPool()
      }
    }

    // Spawn initial enemies if type is configured
    if (this.config.enemies.type !== 'none') {
      for (let i = 0; i < this.config.enemies.count; i++) {
        this.spawnEnemy()
      }
    }

    this.emitState()
  }

  resize(w: number, h: number): void {
    this.canvasW = w
    this.canvasH = h
  }

  destroy(): void {}

  private spawnLetter(char: string) {
    const spec = this.config.letters
    this.letters.push(
      new DynamicLetter(
        this.canvasW,
        this.canvasH,
        char,
        spec.behavior,
        spec.minSpeed,
        spec.maxSpeed,
        spec.size,
        spec.gravity
      )
    )
  }

  private spawnRandomLetterFromPool() {
    const pool = this.config.letters.pool
    let char = 'A'
    if (pool === 'vowels') {
      const vowels = ['A', 'E', 'I', 'O', 'U']
      char = vowels[Math.floor(Math.random() * vowels.length)]
    } else if (pool === 'consonants') {
      const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z']
      char = consonants[Math.floor(Math.random() * consonants.length)]
    } else {
      const all = Object.keys(CHARACTERS)
      char = all[Math.floor(Math.random() * all.length)]
    }

    this.spawnLetter(char)
  }

  private spawnEnemy() {
    const type = this.config.enemies.type
    if (type === 'none') return

    if (type === 'zombie') {
      this.chasers.push(new ZombieChaser(this.canvasW, this.canvasH, this.config.enemies.speed))
    } else if (type === 'oddbod') {
      this.chasers.push(new OddbodChaser(this.canvasW, this.canvasH, this.config.enemies.speed))
    } else if (type === 'meteor') {
      this.meteors.push(new MeteorObstacle(this.canvasW))
    } else if (type === 'ghost') {
      this.ghosts.push(new GhostObstacle(this.canvasW, this.canvasH))
    }
  }

  private triggerLetterPop(letter: DynamicLetter) {
    letter.pop()
    this.score++

    if (this.config.letters.pool === 'custom' && this.config.letters.customLetters) {
      this.customLettersIndex++
      if (this.customLettersIndex >= this.config.letters.customLetters.length) {
        // Spelled the word!
        if (this.config.rules.winCondition === 'collect_all') {
          this.winner = 'human'
          this.gameEnded = true
        } else {
          // Restart word loop
          this.customLettersIndex = 0
          this.activeCustomLetter = this.config.letters.customLetters[0]
          this.spawnLetter(this.activeCustomLetter)
        }
      } else {
        this.activeCustomLetter = this.config.letters.customLetters[this.customLettersIndex]
        this.spawnLetter(this.activeCustomLetter)
      }
    } else {
      // General pop, respawn another
      this.spawnRandomLetterFromPool()

      if (this.config.rules.winCondition === 'score' && this.score >= this.config.rules.winThreshold) {
        this.winner = 'human'
        this.gameEnded = true
      }
    }

    this.emitState()
  }

  update(input: GameInput, frame: number): void {
    this.frame = frame

    if (this.gameEnded) {
      // Check space restart
      if (input.wasPressed(' ')) {
        this.restart(this.canvasW, this.canvasH)
      }
      return
    }

    // 1. Timer Countdown
    if (this.config.rules.winCondition === 'time' || this.config.rules.timeLimit) {
      this.frameCounter++
      if (this.frameCounter >= 60) {
        this.frameCounter = 0
        this.timeLeft--
        this.emitState()

        if (this.timeLeft <= 0) {
          if (this.config.rules.winCondition === 'time') {
            if (this.score >= this.config.rules.winThreshold) {
              this.winner = 'human'
            } else {
              this.winner = 'oddbods' // lose if threshold not met
            }
          } else {
            // General time limit elapsed, check if player wins by survival
            this.winner = 'human'
          }
          this.gameEnded = true
        }
      }
    }

    // 2. Spawn Enemies/Obstacles periodically
    if (this.config.enemies.type !== 'none') {
      this.chaserSpawnTimer++
      if (this.chaserSpawnTimer >= this.config.enemies.spawnRate) {
        this.chaserSpawnTimer = 0
        this.spawnEnemy()
      }
    }

    // 3. Update letters
    // Clean up popped letters
    this.letters = this.letters.filter(l => {
      const popped = l.update(frame)
      return !popped
    })

    // 4. Update Background Particles
    this.updateBackgroundEffects()

    // 5. Update Enemies
    // AIs (Zombie/Oddbod)
    const activeChasers = this.chasers.filter(c => c.alive)
    this.chasers = activeChasers

    activeChasers.forEach(c => {
      // ZombieChaser expects FloatingLetter[] structurally matching DynamicLetter[]
      const stolenChar = c.update(this.letters as any)
      if (stolenChar) {
        // Enemy captured a letter!
        if (this.config.rules.winCondition === 'survival') {
          this.lives--
          this.emitState()
          if (this.lives <= 0) {
            this.winner = 'oddbods'
            this.gameEnded = true
          }
        } else {
          // just spawn a replacement
          this.spawnRandomLetterFromPool()
        }
      }
    })

    // Meteors
    this.meteors = this.meteors.filter(m => {
      const offscreen = m.update()
      if (offscreen) return false

      // Check collision with letters
      for (const letter of this.letters) {
        if (!letter.collected && m.containsPoint(letter.x + 24 * letter.scale, letter.y + 28 * letter.scale)) {
          letter.pop() // destroy letter
          this.spawnRandomLetterFromPool()
          m.alive = false
          return false
        }
      }
      return m.alive
    })

    // Ghosts
    this.ghosts.forEach(g => {
      g.update(frame)
      // Ghost touches letter
      for (const letter of this.letters) {
        if (!letter.collected && g.containsPoint(letter.x + 24 * letter.scale, letter.y + 28 * letter.scale)) {
          letter.correctPulse = 10 // make it flash in warning
        }
      }
    })

    // 6. Handle Input & Interactions
    const ctrl = this.config.controls
    if (ctrl.interaction === 'keyboard') {
      const keys = 'abcdefghijklmnopqrstuvwxyz'
      for (const key of keys) {
        if (input.wasPressed(key)) {
          const match = this.letters.find(l => !l.collected && l.letter.toLowerCase() === key)
          if (match) {
            // spell order enforcement
            if (this.config.letters.pool === 'custom' && this.activeCustomLetter) {
              if (match.letter === this.activeCustomLetter) {
                this.triggerLetterPop(match)
              } else {
                match.correctPulse = 10
              }
            } else {
              this.triggerLetterPop(match)
            }
          }
        }
      }
    } else if (ctrl.interaction === 'shooter') {
      // Shooter interaction logic
      if (this.reloadTimer > 0) this.reloadTimer--

      // Fire projectile on click/tap
      for (const gesture of input.gestures) {
        if (gesture.type === 'tap' && this.reloadTimer === 0) {
          // Check ammo
          if (ctrl.ammoCount !== undefined && ctrl.ammoCount !== 9999) {
            if (ctrl.ammoCount <= 0) {
              // Out of ammo, trigger loss if we have no letters popping
              continue
            }
            ctrl.ammoCount--
            this.emitState()
          }

          // Spawn projectile
          const startX = this.canvasW / 2
          const startY = this.canvasH - 10
          const dx = gesture.x - startX
          const dy = gesture.y - startY
          const dist = Math.sqrt(dx * dx + dy * dy)

          const pSpeed = 12
          this.projectiles.push({
            x: startX,
            y: startY,
            targetX: gesture.x,
            targetY: gesture.y,
            vx: (dx / dist) * pSpeed,
            vy: (dy / dist) * pSpeed,
            type: ctrl.projectileType || 'laser',
            alive: true
          })

          this.reloadTimer = ctrl.reloadSpeed || 15
        }
      }

      // Update projectiles
      this.projectiles = this.projectiles.filter(p => {
        p.x += p.vx
        p.y += p.vy

        // Out of bounds check
        if (p.x < 0 || p.x > this.canvasW || p.y < 0 || p.y > this.canvasH) {
          return false
        }

        // Collision with letters
        for (const letter of this.letters) {
          if (!letter.collected && letter.containsCanvas(p.x, p.y)) {
            if (this.config.letters.pool === 'custom' && this.activeCustomLetter) {
              if (letter.letter === this.activeCustomLetter) {
                this.triggerLetterPop(letter)
              } else {
                letter.correctPulse = 10
              }
            } else {
              this.triggerLetterPop(letter)
            }
            p.alive = false
            return false
          }
        }

        // Collision with enemies
        for (const chaser of this.chasers) {
          if (chaser.alive && chaser.containsPoint(p.x, p.y)) {
            chaser.alive = false
            p.alive = false
            this.score += 2
            this.emitState()
            return false
          }
        }

        for (const m of this.meteors) {
          if (m.alive && m.containsPoint(p.x, p.y)) {
            m.alive = false
            p.alive = false
            this.score += 2
            this.emitState()
            return false
          }
        }

        for (const g of this.ghosts) {
          if (g.alive && g.containsPoint(p.x, p.y)) {
            g.alive = false
            p.alive = false
            this.score += 3
            this.emitState()
            return false
          }
        }

        return p.alive
      })
    } else {
      // Tap controls
      for (const gesture of input.gestures) {
        if (gesture.type === 'tap') {
          // Direct tap letters
          for (const letter of this.letters) {
            if (!letter.collected && letter.containsCanvas(gesture.x, gesture.y)) {
              if (this.config.letters.pool === 'custom' && this.activeCustomLetter) {
                if (letter.letter === this.activeCustomLetter) {
                  this.triggerLetterPop(letter)
                } else {
                  letter.correctPulse = 10
                }
              } else {
                this.triggerLetterPop(letter)
              }
              break
            }
          }

          // Direct tap clickToDestroy enemies
          if (this.config.enemies.clickToDestroy) {
            for (const chaser of this.chasers) {
              if (chaser.alive && chaser.containsPoint(gesture.x, gesture.y)) {
                chaser.alive = false
                this.score++
                this.emitState()
              }
            }
            for (const m of this.meteors) {
              if (m.alive && m.containsPoint(gesture.x, gesture.y)) {
                m.alive = false
                this.score++
                this.emitState()
              }
            }
            for (const g of this.ghosts) {
              if (g.alive && g.containsPoint(gesture.x, gesture.y)) {
                g.alive = false
                this.score++
                this.emitState()
              }
            }
          }
        }
      }
    }

    // Out of Ammo validation (shooter only)
    if (ctrl.interaction === 'shooter' && ctrl.ammoCount === 0 && this.projectiles.length === 0) {
      if (this.config.rules.winCondition !== 'survival') {
        this.winner = 'oddbods'
        this.gameEnded = true
      }
    }
  }

  private updateBackgroundEffects() {
    const effect = this.config.theme.specialEffects
    const w = this.canvasW
    const h = this.canvasH

    for (const p of this.bgParticles) {
      p.val1 += 0.02
      
      switch (effect) {
        case 'stars':
          // Twinkle size
          break
        case 'bubbles':
          p.y -= p.speed * 1.5
          p.x += Math.sin(p.val1) * p.val2 * 0.3
          if (p.y < 40) {
            p.y = h + 10
            p.x = Math.random() * w
          }
          break
        case 'snow':
          p.y += p.speed * 0.8
          p.x += Math.cos(p.val1) * 0.2
          if (p.y > h) {
            p.y = -10
            p.x = Math.random() * w
          }
          break
        case 'lava_drips':
          p.y += p.speed * 2.0
          if (p.y > h) {
            p.y = -10
            p.x = Math.random() * w
            p.size = 2 + Math.random() * 4
          }
          break
        case 'sparks':
          p.y -= p.speed * 1.8
          p.x += Math.sin(p.val1) * 0.4
          if (p.y < 40) {
            p.y = h + 10
            p.x = Math.random() * w
          }
          break
      }
    }
  }

  draw(ctx: Renderer): void {
    const w = this.canvasW
    const h = this.canvasH

    ctx.clearRect(0, 0, w, h)

    // 1. Draw Theme Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
    switch (this.config.theme.background) {
      case 'space':
        bgGrad.addColorStop(0, '#060814')
        bgGrad.addColorStop(0.5, '#0c102b')
        bgGrad.addColorStop(1, '#020308')
        break
      case 'volcano':
        bgGrad.addColorStop(0, '#1c0505')
        bgGrad.addColorStop(0.6, '#380a0a')
        bgGrad.addColorStop(1, '#1a0000')
        break
      case 'underwater':
        bgGrad.addColorStop(0, '#05182e')
        bgGrad.addColorStop(0.5, '#0b2d54')
        bgGrad.addColorStop(1, '#030c17')
        break
      case 'candy':
        bgGrad.addColorStop(0, '#2e0f2b')
        bgGrad.addColorStop(0.5, '#521f4d')
        bgGrad.addColorStop(1, '#1b0519')
        break
      case 'forest':
        bgGrad.addColorStop(0, '#071f0d')
        bgGrad.addColorStop(0.6, '#113b1b')
        bgGrad.addColorStop(1, '#030d05')
        break
      case 'desert':
        bgGrad.addColorStop(0, '#241a05')
        bgGrad.addColorStop(0.6, '#473610')
        bgGrad.addColorStop(1, '#171003')
        break
      default:
        bgGrad.addColorStop(0, '#13111c')
        bgGrad.addColorStop(0.5, '#221e33')
        bgGrad.addColorStop(1, '#0c0a12')
    }
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, w, h)

    // 2. Draw Background Special Effects
    this.drawBackgroundEffects(ctx)

    // 3. Draw Game Title / Prompts at top
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = 'bold 24px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(this.config.title, w / 2, 48)

    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '14px system-ui'
    ctx.fillText(this.config.instruction, w / 2, 82)

    // If custom spell word, render the spelling board
    if (this.config.letters.pool === 'custom' && this.config.letters.customLetters) {
      this.drawSpellingBoard(ctx)
    }

    // 4. Draw Projectiles (if shooter)
    if (this.config.controls.interaction === 'shooter') {
      this.drawShooterLauncher(ctx)
      this.projectiles.forEach(p => this.drawProjectile(ctx, p))
    }

    // 5. Draw Letters
    this.letters.forEach(l => l.draw(ctx, this.frame))

    // 6. Draw Enemies / Obstacles
    this.chasers.forEach(c => c.draw(ctx))
    this.meteors.forEach(m => m.draw(ctx))
    this.ghosts.forEach(g => g.draw(ctx))

    // 7. Draw HUD Overlay (Score, Lives, Time, Ammo)
    this.drawHUD(ctx)
  }

  private drawBackgroundEffects(ctx: Renderer) {
    const effect = this.config.theme.specialEffects
    if (effect === 'none') return

    for (const p of this.bgParticles) {
      ctx.beginPath()

      switch (effect) {
        case 'stars':
          const starTwinkle = Math.sin(this.frame * 0.05 + p.val1) * 0.3 + 0.7
          ctx.globalAlpha = starTwinkle * 0.7
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          break

        case 'bubbles':
          ctx.globalAlpha = 0.25
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.strokeStyle = '#aaddff'
          ctx.lineWidth = 1
          ctx.stroke()
          // bubble highlight
          ctx.fillStyle = 'rgba(255,255,255,0.1)'
          ctx.fill()
          break

        case 'snow':
          ctx.globalAlpha = 0.4
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2)
          ctx.fillStyle = '#ffd6f5'
          ctx.fill()
          break

        case 'lava_drips':
          ctx.globalAlpha = 0.6
          ctx.fillStyle = '#ff5500'
          ctx.ellipse(p.x, p.y, p.size * 0.5, p.size * 1.2, 0, 0, Math.PI * 2)
          ctx.fill()
          break

        case 'sparks':
          const flicker = Math.sin(this.frame * 0.1 + p.val1) * 0.4 + 0.6
          ctx.globalAlpha = flicker * 0.6
          ctx.fillStyle = '#ffaa00'
          ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2)
          ctx.fill()
          break
      }
    }
    ctx.globalAlpha = 1.0
  }

  private drawSpellingBoard(ctx: Renderer) {
    const letters = this.config.letters.customLetters || []
    const boxSize = 36
    const gap = 8
    const totalW = letters.length * boxSize + (letters.length - 1) * gap
    const startX = (this.canvasW - totalW) / 2
    const y = 108

    for (let i = 0; i < letters.length; i++) {
      const bx = startX + i * (boxSize + gap)
      ctx.fillStyle = i < this.customLettersIndex ? 'rgba(88, 214, 141, 0.2)' : 'rgba(255,255,255,0.05)'
      ctx.strokeStyle = i === this.customLettersIndex ? '#f5b041' : i < this.customLettersIndex ? '#58d68d' : '#8899bb'
      ctx.lineWidth = i === this.customLettersIndex ? 2 : 1
      ctx.strokeRect(bx, y, boxSize, boxSize)
      ctx.fillRect(bx, y, boxSize, boxSize)

      ctx.fillStyle = i < this.customLettersIndex ? '#58d68d' : i === this.customLettersIndex ? '#f5b041' : 'rgba(255,255,255,0.3)'
      ctx.font = 'bold 18px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(letters[i], bx + boxSize / 2, y + boxSize / 2)
    }
  }

  private drawShooterLauncher(ctx: Renderer) {
    const x = this.canvasW / 2
    const y = this.canvasH - 5
    
    // Draw base ring
    ctx.fillStyle = '#34495e'
    ctx.strokeStyle = '#2c3e50'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y, 32, Math.PI, 0, false)
    ctx.fill()
    ctx.stroke()

    // Draw barrel pointing towards reload ring indicator
    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = '#1a252f'
    ctx.fillRect(-8, -48, 16, 44)
    ctx.restore()

    // Draw reload indicator ring around muzzle
    if (this.reloadTimer > 0) {
      const cooldownSpec = this.config.controls.reloadSpeed || 15
      const angle = (this.reloadTimer / cooldownSpec) * Math.PI
      ctx.strokeStyle = '#f5b041'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y - 52, 6, -Math.PI / 2, -Math.PI / 2 + angle * 2)
      ctx.stroke()
    }
  }

  private drawProjectile(ctx: Renderer, p: Projectile) {
    ctx.beginPath()
    
    switch (p.type) {
      case 'water':
        ctx.fillStyle = '#3498db'
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'fireball':
        const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 8)
        grad.addColorStop(0, '#fff')
        grad.addColorStop(0.3, '#f39c12')
        grad.addColorStop(1, '#d35400')
        ctx.fillStyle = grad
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'seed':
        ctx.fillStyle = '#2ecc71'
        ctx.ellipse(p.x, p.y, 4, 7, Math.atan2(p.vy, p.vx), 0, Math.PI * 2)
        ctx.fill()
        break
      default: // laser
        ctx.strokeStyle = '#e74c3c'
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        const len = 15
        const angle = Math.atan2(p.vy, p.vx)
        ctx.moveTo(p.x - Math.cos(angle) * len, p.y - Math.sin(angle) * len)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
    }
  }

  private drawHUD(ctx: Renderer) {
    const w = this.canvasW
    const pad = 12

    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, 0, w, 40)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 15px system-ui'
    ctx.textBaseline = 'middle'

    // Left HUD: Score
    ctx.textAlign = 'left'
    ctx.fillStyle = '#58d68d'
    ctx.fillText(`Score: ${this.score}`, pad, 20)

    // Center HUD: Time / Lives
    ctx.textAlign = 'center'
    if (this.config.rules.winCondition === 'time' || this.config.rules.timeLimit) {
      ctx.fillStyle = this.timeLeft <= 10 ? '#e74c5c' : '#fff'
      ctx.fillText(`Time: ${this.timeLeft}s`, w / 2, 20)
    } else if (this.config.rules.winCondition === 'survival') {
      ctx.fillStyle = '#e74c5c'
      ctx.fillText(`Lives: ${'❤️'.repeat(this.lives)}`, w / 2, 20)
    } else {
      ctx.fillStyle = '#fff'
      ctx.fillText(`Goal: ${this.config.rules.winThreshold} pts`, w / 2, 20)
    }

    // Right HUD: Ammo (if shooter)
    ctx.textAlign = 'right'
    if (this.config.controls.interaction === 'shooter') {
      const ammo = this.config.controls.ammoCount
      ctx.fillStyle = '#f5b041'
      const ammoStr = ammo === undefined || ammo === 9999 ? 'Ammo: ∞' : `Ammo: ${ammo}`
      ctx.fillText(ammoStr, w - pad, 20)
    } else if (this.config.rules.winCondition === 'survival') {
      // display score/Zen
      ctx.fillStyle = '#58d68d'
      ctx.fillText(`High: ${localStorage.getItem('hs_custom') || 0}`, w - pad, 20)
    }
  }

  private emitState() {
    // Save high score if survival
    if (this.config.rules.winCondition === 'survival') {
      const prev = parseInt(localStorage.getItem('hs_custom') || '0', 10)
      if (this.score > prev) {
        localStorage.setItem('hs_custom', String(this.score))
      }
    }

    this.onStateChange?.({
      score: this.score,
      collectedSet: new Set(), // not used for dynamic sets directly
      totalCollected: this.score,
      mode: 'prompt',
      wordsCompleted: this.customLettersIndex,
      oddScore: 0,
      winner: this.winner,
      lives: this.config.rules.winCondition === 'survival' ? this.lives : undefined,
      timeLeft: this.config.rules.winCondition === 'time' ? this.timeLeft : undefined,
      ammoLeft: this.config.controls.ammoCount,
      customTitle: this.config.title,
    })
  }
}
