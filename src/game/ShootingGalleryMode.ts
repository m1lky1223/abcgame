import { ALL_LETTERS } from '../characters/data'

interface OddbodShooter {
  name: string; weapon: string; fireRate: number; damage: number
  spread: number; special: string; emoji: string; color: string
}

interface ZombieType {
  name: string; hp: number; speed: number; special: string; color: string
}

interface Zombie {
  x: number; y: number; hp: number; maxHp: number; speed: number
  letter: string; typeIndex: number; wobble: number; hitFlash: number
  slowed: number; alive: boolean
}

interface Bullet {
  x: number; y: number; vx: number; vy: number; damage: number
  alive: boolean; isSpread: boolean; pierces: boolean
}

const SHOOTERS: OddbodShooter[] = [
  { name: 'Bubbles', weapon: 'Bubble Blaster', fireRate: 20, damage: 1, spread: 15, special: '3-way split', emoji: '🫧', color: '#5dade2' },
  { name: 'Jeff', weapon: 'Laser Pointer', fireRate: 12, damage: 1, spread: 0, special: 'instant hit', emoji: '🔴', color: '#58d68d' },
  { name: 'Newt', weapon: 'Paintball Gun', fireRate: 18, damage: 1, spread: 8, special: 'splash (30px)', emoji: '🎨', color: '#f5b041' },
  { name: 'Fuse', weapon: 'Hand Cannon', fireRate: 35, damage: 2, spread: 0, special: '2x damage', emoji: '💥', color: '#e74c5c' },
  { name: 'Pogo', weapon: 'Pea Shooter', fireRate: 6, damage: 0.5, spread: 5, special: 'rapid fire', emoji: '🟢', color: '#2ecc71' },
  { name: 'Slick', weapon: 'Boomerang', fireRate: 25, damage: 1, spread: 0, special: 'pierces 2', emoji: '🪃', color: '#9b59b6' },
  { name: 'Zee', weapon: 'Sleep Dart', fireRate: 22, damage: 0, spread: 0, special: 'slows 3s', emoji: '💤', color: '#1abc9c' },
]

const ZOMBIE_TYPES: ZombieType[] = [
  { name: 'Classic', hp: 1, speed: 0.8, special: '—', color: '#5B8C5A' },
  { name: 'Decayed', hp: 2, speed: 0.5, special: 'armor', color: '#7A8A6E' },
  { name: 'Toxic', hp: 1, speed: 0.8, special: 'poison cloud', color: '#4F8A5E' },
  { name: 'Undead', hp: 1, speed: 0.7, special: 'zigzag', color: '#8A7A6E' },
  { name: 'Rotten', hp: 1, speed: 0.8, special: 'explodes', color: '#6A7A5E' },
  { name: 'Ghoul', hp: 1, speed: 1.3, special: 'fast', color: '#5A7A6E' },
  { name: 'Mutant', hp: 3, speed: 0.4, special: 'big & tough', color: '#7A6A5E' },
]

export class ShootingGalleryMode {
  private canvasW: number; private canvasH: number
  private frame = 0
  private zombies: Zombie[] = []
  private bullets: Bullet[] = []
  private particles: any[] = []
  private collectedLetters: string[] = []
  private lives = 3
  private wave = 1
  private score = 0
  private waveSpawnTimer = 0
  private waveZombiesSpawned = 0
  private waveZombieCount = 0
  private fireCooldown = 0
  private ammo = 6; private maxAmmo = 6
  private reloading = false; private reloadTimer = 0
  private shooterIndex = 0
  private mouseX = 0; private mouseY = 0
  private gameOver = false; private win = false
  private freeLetters: { letter: string; x: number; y: number; vy: number; alpha: number }[] = []
  private letterCollectFlash = ''; private letterFlashTimer = 0
  private comboCount = 0; private comboTimer = 0
  private baseLine = 0

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.baseLine = canvasH * 0.15
    this.startWave()
  }

  private startWave(): void {
    this.waveZombiesSpawned = 0
    this.waveSpawnTimer = 0
    const isBoss = this.wave % 5 === 0
    this.waveZombieCount = isBoss ? 1 : 3 + this.wave
    if (this.waveZombieCount > 12) this.waveZombieCount = 12
  }

  handleClick(cx: number, cy: number): void {
    if (this.gameOver || this.win) return
    this.mouseX = cx; this.mouseY = cy
    if (this.reloading) return
    this.fire()
  }

  handleKey(key: string): void {
    if (this.gameOver || this.win) return
    if (key === 'r') { this.startReload(); return }
    if (key >= '1' && key <= '7') {
      this.shooterIndex = parseInt(key) - 1
      if (this.shooterIndex >= SHOOTERS.length) this.shooterIndex = 0
      return
    }
    const upper = key.toUpperCase()
    const target = this.zombies.find(z => z.alive && z.letter === upper)
    if (target) {
      this.damageZombie(target, 999)
    }
  }

  private fire(): void {
    if (this.fireCooldown > 0) return
    if (this.ammo <= 0) { this.startReload(); return }
    const s = SHOOTERS[this.shooterIndex]
    this.ammo--
    this.fireCooldown = s.fireRate

    const dx = this.mouseX - 60; const dy = this.mouseY - (this.canvasH - 100)
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 1) return
    const spreadRad = (s.spread * Math.PI) / 180
    const ang = Math.atan2(dy, dx)
    const count = s.special === '3-way split' ? 3 : 1
    for (let i = 0; i < count; i++) {
      const offset = count > 1 ? (i - 1) * spreadRad * 0.5 : 0
      const a = ang + offset + (Math.random() - 0.5) * spreadRad * 0.3
      this.bullets.push({
        x: 60, y: this.canvasH - 100, vx: Math.cos(a) * 8,
        vy: Math.sin(a) * 8, damage: s.damage, alive: true,
        isSpread: count > 1 && i > 0,
        pierces: s.special === 'pierces 2',
      })
    }

    for (let p = 0; p < 5; p++) {
      this.particles.push({
        x: 60, y: this.canvasH - 100, vx: (Math.random() - 0.5) * 3,
        vy: -(2 + Math.random() * 2), color: s.color, life: 0, maxLife: 10,
      })
    }
  }

  private startReload(): void {
    if (this.ammo >= this.maxAmmo) return
    this.reloading = true; this.reloadTimer = 60
  }

  private damageZombie(z: Zombie, damage: number): void {
    if (!z.alive) return
    z.hp -= damage; z.hitFlash = 8

    if (z.hp <= 0) {
      z.alive = false
      this.comboCount++; this.comboTimer = 40
      const letterScore = (z.letter.charCodeAt(0) - 64) * 10
      const comboMult = Math.min(this.comboCount, 5)
      this.score += letterScore * comboMult

      if (z.y < z.hitFlash) { this.score += 5 }

      for (let p = 0; p < 12; p++) {
        const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
        this.particles.push({
          x: z.x, y: z.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          color: ZOMBIE_TYPES[z.typeIndex].color, life: 0, maxLife: 20,
        })
      }

      this.freeLetters.push({
        letter: z.letter, x: z.x, y: z.y, vy: -4, alpha: 1,
      })

      if (!this.collectedLetters.includes(z.letter)) {
        this.collectedLetters.push(z.letter)
        this.letterCollectFlash = z.letter; this.letterFlashTimer = 40
      }
      this.onStateChange?.({ score: this.score, wave: this.wave, letters: this.collectedLetters.length, totalLetters: 26, ammo: this.ammo, lives: this.lives })

      if (this.collectedLetters.length >= 26) {
        this.win = true; this.onStateChange?.({ score: this.score, wave: this.wave, winner: true })
      }
    }
  }

  update(): void {
    this.frame++
    if (this.gameOver || this.win) return

    if (this.comboTimer > 0) this.comboTimer--
    else this.comboCount = 0

    if (this.letterFlashTimer > 0) this.letterFlashTimer--

    if (this.fireCooldown > 0) this.fireCooldown--
    if (this.reloading) {
      this.reloadTimer--
      if (this.reloadTimer <= 0) {
        this.ammo = this.maxAmmo; this.reloading = false
      }
    }

    for (const f of this.freeLetters) {
      f.y += f.vy; f.vy += 0.2; f.alpha -= 0.008
    }
    this.freeLetters = this.freeLetters.filter(f => f.alpha > 0)

    for (const b of this.bullets) {
      b.x += b.vx; b.y += b.vy
      b.vy += 0.05
      if (b.x > this.canvasW + 20 || b.x < -20 || b.y > this.canvasH + 20) {
        b.alive = false; continue
      }

      if (b.pierces || !b.isSpread) {
        for (const z of this.zombies) {
          if (!z.alive) continue
          const dx = b.x - z.x; const dy = b.y - z.y
          if (dx * dx + dy * dy < 22 * 22) {
            this.damageZombie(z, b.damage)
            if (!b.pierces) { b.alive = false; break }
          }
        }
      } else {
        for (const z of this.zombies) {
          if (!z.alive) continue
          const dx = b.x - z.x; const dy = b.y - z.y
          if (dx * dx + dy * dy < 22 * 22) {
            this.damageZombie(z, b.damage)
            b.alive = false; break
          }
        }
      }
    }
    this.bullets = this.bullets.filter(b => b.alive)

    this.waveSpawnTimer++
    const spawnInterval = Math.max(15, 60 - this.wave * 2)
    if (this.waveSpawnTimer >= spawnInterval && this.waveZombiesSpawned < this.waveZombieCount) {
      this.waveSpawnTimer = 0
      this.waveZombiesSpawned++
      this.spawnZombie()
    }

    const alive = this.zombies.filter(z => z.alive)
    if (alive.length === 0 && this.waveZombiesSpawned >= this.waveZombieCount) {
      this.wave++
      if (this.wave > 26) { this.win = true; return }
      this.startWave()
    }

    for (const z of this.zombies) {
      if (!z.alive) continue
      if (z.hitFlash > 0) z.hitFlash--
      if (z.slowed > 0) { z.slowed--; z.wobble += 0.03 }
      else { z.wobble += 0.04 }

      const type = ZOMBIE_TYPES[z.typeIndex]
      let mult = z.slowed > 0 ? 0.5 : 1
      if (type.special === 'zigzag') {
        z.x -= type.speed * mult * 0.8
        z.y += Math.sin(this.frame * 0.08 + z.wobble) * 1.5
      } else if (type.special === 'fast') {
        z.x -= type.speed * mult * 1.3
      } else {
        z.x -= type.speed * mult
      }

      if (z.x < 60) {
        z.alive = false
        this.lives--
        this.onStateChange?.({ score: this.score, wave: this.wave, lives: this.lives })
        if (this.lives <= 0) {
          this.gameOver = true
          this.onStateChange?.({ score: this.score, wave: this.wave, gameOver: true })
        }
      }
    }
    this.zombies = this.zombies.filter(z => z.alive || z.hitFlash > 0)

    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life++ }
    this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
  }

  private spawnZombie(): void {
    const isBoss = this.wave % 5 === 0
    let typeIndex: number
    if (isBoss) {
      typeIndex = 6
    } else {
      typeIndex = Math.floor(Math.random() * Math.min(this.wave, ZOMBIE_TYPES.length))
    }
    const type = ZOMBIE_TYPES[typeIndex]

    const letterIdx = Math.floor(Math.random() * ALL_LETTERS.length)
    const letter = ALL_LETTERS[letterIdx]

    const y = this.baseLine + Math.random() * (this.canvasH * 0.55)

    this.zombies.push({
      x: this.canvasW + 20, y, hp: type.hp, maxHp: type.hp,
      speed: type.speed, letter, typeIndex,
      wobble: Math.random() * Math.PI * 2, hitFlash: 0,
      slowed: 0, alive: true,
    })
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const w = this.canvasW; const h = this.canvasH

    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#0a1628'); grad.addColorStop(0.6, '#1a2a3a'); grad.addColorStop(1, '#2a1a1a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)

    for (let i = 0; i < 30; i++) {
      const sx = (i * 137 + this.frame) % w; const sy = (i * 97) % h
      ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.sin(i + this.frame * 0.02) * 0.05})`
      ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill()
    }

    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, h - 30, w, 30)
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(0, h - 28, w, 2)
    for (let i = 0; i < 10; i++) {
      const gx = (i * w / 10 + this.frame * 0.5) % w
      ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(gx, h - 30, 1, 30)
    }

    const s = SHOOTERS[this.shooterIndex]
    const shooterX = 60; const shooterY = h - 100
    ctx.fillStyle = s.color; ctx.beginPath()
    ctx.arc(shooterX, shooterY, 22, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '20px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(s.emoji, shooterX, shooterY - 1)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(shooterX, shooterY, 26, 0, Math.PI * 2); ctx.stroke()

    for (const z of this.zombies) {
      if (!z.alive) continue
      const type = ZOMBIE_TYPES[z.typeIndex]
      const bob = Math.sin(z.wobble) * 3
      const flash = z.hitFlash > 0 && z.hitFlash % 2 === 0

      ctx.save()
      ctx.translate(z.x, z.y + bob)

      const sz = z.typeIndex === 6 ? 32 : 24
      ctx.fillStyle = flash ? '#fff' : type.color
      ctx.beginPath()
      ctx.arc(0, -sz * 0.3, sz, 0, Math.PI * 2)
      ctx.fillRect(-sz * 0.5, -sz * 0.3, sz, sz * 0.8)
      ctx.fill()

      ctx.fillStyle = flash ? '#222' : '#1a1a1a'
      ctx.beginPath(); ctx.arc(-6, -sz * 0.5, 3, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(6, -sz * 0.5, 3, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#e74c5c'
      ctx.beginPath(); ctx.arc(-6, -sz * 0.5, 1.5, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(6, -sz * 0.5, 1.5, 0, Math.PI * 2); ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath(); ctx.arc(0, sz * 0.1, 4, 0, Math.PI); ctx.fill()

      ctx.fillStyle = '#fff'; ctx.font = `bold ${sz * 0.6}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.globalAlpha = 0.5 + Math.sin(this.frame * 0.1) * 0.3
      ctx.fillText(z.letter, 0, sz * 0.15)
      ctx.globalAlpha = 1

      if (z.slowed > 0) {
        ctx.fillStyle = 'rgba(100,200,255,0.3)'; ctx.beginPath()
        ctx.arc(0, 0, sz + 6, 0, Math.PI * 2); ctx.fill()
      }

      ctx.restore()
    }

    for (const f of this.freeLetters) {
      ctx.globalAlpha = f.alpha
      ctx.fillStyle = '#58d68d'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(f.letter, f.x, f.y)
      ctx.globalAlpha = 1
    }

    for (const b of this.bullets) {
      ctx.fillStyle = s.color; ctx.beginPath()
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.beginPath()
      ctx.arc(b.x, b.y, 2, 0, Math.PI * 2); ctx.fill()
    }

    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife; if (a <= 0) continue
      ctx.globalAlpha = a; ctx.fillStyle = p.color
      ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, w, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#58d68d'
    ctx.fillText(`📬 ${this.collectedLetters.length}/26`, 10, 16)
    ctx.textAlign = 'center'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`🌊 Wave ${this.wave}/26`, w / 2, 16)
    ctx.textAlign = 'right'
    ctx.fillText(`${'❤️'.repeat(Math.max(0, this.lives))}`, w - 10, 16)

    const reloadingStr = this.reloading ? ` [RELOADING ${Math.ceil(this.reloadTimer / 60)}s]` : ''
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, h - 28, w, 28)
    ctx.fillStyle = '#888'; ctx.font = '11px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText(`${s.emoji} ${s.name}: ${s.weapon}`, 10, h - 14)
    ctx.textAlign = 'center'
    ctx.fillStyle = this.ammo <= 2 ? '#e74c5c' : '#fff'
    ctx.fillText(`🔫 ${'●'.repeat(this.ammo)}${'○'.repeat(this.maxAmmo - this.ammo)}${reloadingStr}`, w / 2, h - 14)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Score: ${this.score}`, w - 10, h - 14)

    if (this.letterFlashTimer > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.beginPath(); ctx.roundRect(w / 2 - 70, h * 0.38, 140, 50, 10); ctx.fill()
      ctx.fillStyle = '#58d68d'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`${this.letterCollectFlash} Collected! ✨`, w / 2, h * 0.4 + 25)
    }

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#e74c5c'; ctx.font = 'bold 36px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('💀 Game Over', w / 2, h / 2 - 20)
      ctx.fillStyle = '#fff'; ctx.font = '16px system-ui'
      ctx.fillText(`Letters: ${this.collectedLetters.length}/26`, w / 2, h / 2 + 20)
    }

    if (this.win) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#58d68d'; ctx.font = 'bold 36px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🎉 All Letters Rescued!', w / 2, h / 2 - 20)
      ctx.fillStyle = '#f5b041'; ctx.font = '16px system-ui'
      ctx.fillText(`Score: ${this.score}`, w / 2, h / 2 + 20)
    }

    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.font = '10px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'
    ctx.fillText('Click to shoot | R to reload | 1-7 switch weapon', 8, h - 32)
  }

  restart(): void {
    this.zombies = []; this.bullets = []; this.particles = []
    this.collectedLetters = []; this.freeLetters = []
    this.lives = 3; this.wave = 1; this.score = 0
    this.waveSpawnTimer = 0; this.waveZombiesSpawned = 0; this.waveZombieCount = 0
    this.fireCooldown = 0; this.ammo = this.maxAmmo; this.reloading = false; this.reloadTimer = 0
    this.gameOver = false; this.win = false; this.frame = 0
    this.letterCollectFlash = ''; this.letterFlashTimer = 0
    this.comboCount = 0; this.comboTimer = 0
    this.startWave()
  }

  resize(w: number, h: number): void {
    this.canvasW = w; this.canvasH = h
  }
}
