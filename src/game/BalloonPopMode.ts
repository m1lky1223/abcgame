import { ALL_LETTERS } from '../characters/data'
import { Renderer } from '../renderer/Renderer'

interface BalloonZombie {
  x: number; y: number; letter: string
  alive: boolean; speed: number; pattern: number
  wobble: number; popped: boolean
}

const ZOMBIE_TYPES = ['Classic', 'Decayed', 'Toxic', 'Undead', 'Rotten', 'Ghoul', 'Mutant']
const COLORS = ['#5B8C5A', '#7A8A6E', '#4F8A5E', '#8A7A6E', '#6A7A5E', '#5A7A6E', '#7A6A5E']

export class BalloonPopMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private score = 0; private wave = 1
  private zombies: BalloonZombie[] = []
  private particles: any[] = []
  private comboCount = 0; private comboTimer = 0
  private gameOver = false; private win = false
  private spawnTimer = 0

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.spawnWave()
  }

  private spawnWave(): void {
    const count = Math.min(3 + this.wave, 7 + Math.floor(this.wave / 3))
    for (let i = 0; i < count; i++) {
      this.zombies.push(this.makeZombie())
    }
  }

  private makeZombie(): BalloonZombie {
    return {
      x: 40 + Math.random() * (this.canvasW - 80),
      y: this.canvasH + 20 + Math.random() * 60,
      letter: ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)],
      alive: true, speed: 0.3 + Math.random() * 0.4 + this.wave * 0.03,
      pattern: Math.floor(Math.random() * 4),
      wobble: Math.random() * Math.PI * 2,
      popped: false,
    }
  }

  handleClick(cx: number, cy: number): void {
    if (this.gameOver || this.win) return
    for (const z of this.zombies) {
      if (!z.alive) continue
      const dx = cx - z.x; const dy = cy - z.y - 40
      if (dx * dx + dy * dy < 25 * 25) {
        z.alive = false; z.popped = true
        this.score++
        this.comboCount++
        this.comboTimer = 120
        for (let i = 0; i < 8; i++) {
          const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
          this.particles.push({ x: z.x, y: z.y - 40, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#e74c5c', life: 0, maxLife: 20 })
        }
        this.onStateChange?.({ score: this.score, wave: this.wave, gameOver: false })
        if (this.zombies.every(z => !z.alive)) {
          this.wave++
          if (this.wave > 20) { this.win = true; this.checkHighScore() }
          else this.spawnTimer = 60
        }
        continue
      }
    }
  }

  handleKey(key: string): void {
    if (this.gameOver || this.win) return
    const upper = key.toUpperCase()
    for (const z of this.zombies) {
      if (!z.alive) continue
      if (z.letter === upper) {
        z.alive = false; z.popped = true
        this.score += 2
        this.comboCount++
        this.comboTimer = 120
        for (let i = 0; i < 10; i++) {
          const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 4
          this.particles.push({ x: z.x, y: z.y - 40, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#f5b041', life: 0, maxLife: 25 })
        }
        this.onStateChange?.({ score: this.score, wave: this.wave, gameOver: false })
        if (this.zombies.every(z => !z.alive)) {
          this.wave++
          if (this.wave > 20) { this.win = true; this.checkHighScore() }
          else this.spawnTimer = 60
        }
        continue
      }
    }
  }

  private checkHighScore(): void {
    const prev = parseInt(localStorage.getItem('hs_balloon') || '0', 10)
    if (this.score > prev) localStorage.setItem('hs_balloon', String(this.score))
  }

  update(): void {
    if (this.gameOver || this.win) { this.frame++; return }
    this.frame++
    if (this.comboTimer > 0) this.comboTimer--
    if (this.comboTimer <= 0) this.comboCount = 0

    if (this.spawnTimer > 0) { this.spawnTimer--; if (this.spawnTimer === 0) this.spawnWave() }

    for (const z of this.zombies) {
      if (!z.alive) continue
      switch (z.pattern) {
        case 0: z.x += Math.sin(this.frame * 0.02 + z.wobble) * 0.8; break
        case 1: z.x += Math.sin(this.frame * 0.03 + z.wobble) * 0.3; break
        case 2: z.x += Math.sin(this.frame * 0.04 + z.wobble) * 1.5; z.x += Math.cos(this.frame * 0.02) * 0.3; break
        case 3: break
      }
      z.y -= z.speed
      if (z.y < -80) { z.alive = false }
    }
    this.zombies = this.zombies.filter(z => z.alive || z.popped)

    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
    this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
  }

  draw(ctx: Renderer): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a3a6e'); grad.addColorStop(0.5, '#4a7aae'); grad.addColorStop(1, '#6a9a6a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    for (const z of this.zombies) {
      if (!z.alive) continue
      const wobX = Math.sin(this.frame * 0.03 + z.wobble) * 3

      ctx.strokeStyle = 'rgba(200,200,200,0.4)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(z.x + wobX, z.y + 20); ctx.lineTo(z.x + wobX * 0.5, z.y + 60); ctx.stroke()

      ctx.fillStyle = '#e74c5c'
      ctx.beginPath(); ctx.ellipse(z.x + wobX, z.y - 20, 20, 26, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.beginPath(); ctx.ellipse(z.x + wobX - 6, z.y - 28, 6, 8, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(z.letter, z.x + wobX, z.y - 18)

      ctx.fillStyle = COLORS[z.pattern]
      ctx.beginPath(); ctx.arc(z.x, z.y + 20, 14, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#222'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(ZOMBIE_TYPES[z.pattern].substring(0, 4), z.x, z.y + 21)
    }

    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife; if (a <= 0) continue
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#58d68d'; ctx.fillText(`🎈 Wave ${this.wave}  Score: ${this.score}`, 12, 16)
    if (this.comboCount >= 3) {
      ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
      ctx.fillText(`🔥 ${this.comboCount}x COMBO!`, this.canvasW - 12, 16)
    }

    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('Pop balloons! Click or press letter keys', this.canvasW / 2, this.canvasH - 8)

    if (this.gameOver || this.win) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = this.win ? '#58d68d' : '#e74c5c'
      ctx.font = 'bold 32px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(this.win ? '🎈 Balloon Master! 🎉' : 'Oops!', this.canvasW / 2, this.canvasH / 2 - 30)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`Final Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 10)
      ctx.fillStyle = '#8899bb'; ctx.font = '14px system-ui'
      ctx.fillText('Press SPACE to play again', this.canvasW / 2, this.canvasH / 2 + 45)
    }
  }

  restart(): void {
    this.score = 0; this.wave = 1; this.zombies = []; this.particles = []
    this.comboCount = 0; this.comboTimer = 0; this.gameOver = false; this.win = false; this.frame = 0
    this.spawnWave()
  }
}
