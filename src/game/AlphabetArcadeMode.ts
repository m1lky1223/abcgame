import { ALL_LETTERS } from '../characters/data'
import { drawCharacter } from '../characters/draw'
import { GameInput, GameModeStrategy } from './GameModeStrategy'

type FighterAction = 'idle' | 'walk' | 'jump' | 'punch' | 'kick' | 'special' | 'block' | 'hit' | 'ko'

interface Fighter {
  letter: string
  x: number
  y: number
  vx: number
  vy: number
  facing: 1 | -1
  health: number
  energy: number
  action: FighterAction
  actionTimer: number
  attackCooldown: number
  invulnTimer: number
  combo: number
  onGround: boolean
}

interface HitSpark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

const MAX_HEALTH = 100
const MAX_ENERGY = 100
const MOVE_SPEED = 4.1
const JUMP_POWER = -12
const GRAVITY = 0.62
const TOTAL_ROUNDS = 25

export class AlphabetArcadeMode implements GameModeStrategy {
  onStateChange?: (state: any) => void

  private canvasW: number
  private canvasH: number
  private groundY = 0
  private frame = 0
  private round = 1
  private score = 0
  private winner: 'human' | 'oddbods' | null = null
  private roundIntro = 90
  private roundOverTimer = 0
  private cameraShake = 0
  private message = 'Round 1'

  private player: Fighter
  private rival: Fighter
  private sparks: HitSpark[] = []

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.groundY = canvasH - 82
    this.player = this.createFighter('A', canvasW * 0.28, 1)
    this.rival = this.createFighter('B', canvasW * 0.72, -1)
  }

  start(): void {
    this.emitState()
  }

  update(input: GameInput, frame: number): void {
    if (this.winner) return
    this.frame = frame

    if (this.roundIntro > 0) {
      this.roundIntro--
      this.updateFighterPhysics(this.player)
      this.updateFighterPhysics(this.rival)
      return
    }

    if (this.roundOverTimer > 0) {
      this.roundOverTimer--
      this.updateSparks()
      if (this.roundOverTimer <= 0) this.advanceRound()
      return
    }

    this.handlePlayerInput(input)
    this.updateRivalAi()
    this.updateFighter(this.player)
    this.updateFighter(this.rival)
    this.keepFightersApart()
    this.updateSparks()

    if (this.cameraShake > 0) this.cameraShake--

    if (this.rival.health <= 0 && this.rival.action !== 'ko') {
      this.rival.health = 0
      this.rival.action = 'ko'
      this.rival.actionTimer = 120
      this.score += 100 + Math.floor(this.player.health)
      this.message = `${this.player.letter} wins!`
      this.roundOverTimer = 110
      this.emitState()
    }

    if (this.player.health <= 0 && this.player.action !== 'ko') {
      this.player.health = 0
      this.player.action = 'ko'
      this.player.actionTimer = 120
      this.winner = 'oddbods'
      this.message = `${this.rival.letter} wins!`
      this.roundOverTimer = 0
      this.emitState()
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const shakeX = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake : 0
    const shakeY = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake : 0

    ctx.save()
    ctx.translate(shakeX, shakeY)
    this.drawStage(ctx)
    this.drawFighter(ctx, this.rival, false)
    this.drawFighter(ctx, this.player, true)
    this.drawSparks(ctx)
    ctx.restore()

    this.drawHud(ctx)
    this.drawTouchHints(ctx)
  }

  resize(w: number, h: number): void {
    const oldGround = this.groundY || h - 82
    this.canvasW = w
    this.canvasH = h
    this.groundY = h - 82
    const dy = this.groundY - oldGround
    this.player.y += dy
    this.rival.y += dy
    this.player.x = Math.min(Math.max(this.player.x, 70), w - 70)
    this.rival.x = Math.min(Math.max(this.rival.x, 70), w - 70)
  }

  restart(): void {
    this.frame = 0
    this.round = 1
    this.score = 0
    this.winner = null
    this.roundIntro = 90
    this.roundOverTimer = 0
    this.cameraShake = 0
    this.message = 'Round 1'
    this.sparks = []
    this.player = this.createFighter('A', this.canvasW * 0.28, 1)
    this.rival = this.createFighter('B', this.canvasW * 0.72, -1)
    this.emitState()
  }

  destroy(): void {}

  private createFighter(letter: string, x: number, facing: 1 | -1): Fighter {
    return {
      letter,
      x,
      y: this.groundY,
      vx: 0,
      vy: 0,
      facing,
      health: MAX_HEALTH,
      energy: 20,
      action: 'idle',
      actionTimer: 0,
      attackCooldown: 0,
      invulnTimer: 0,
      combo: 0,
      onGround: true,
    }
  }

  private handlePlayerInput(input: GameInput): void {
    const p = this.player
    const touch = this.getTouchControl(input)
    const left = input.isDown('a') || input.isDown('arrowleft') || touch.left
    const right = input.isDown('d') || input.isDown('arrowright') || touch.right
    const block = input.isDown('s') || input.isDown('arrowdown') || touch.block
    const jump = input.wasPressed('w') || input.wasPressed('arrowup') || input.wasPressed(' ') || touch.jump

    if (p.action === 'hit' || p.action === 'ko') return

    if (block && p.onGround && !this.isAttacking(p)) {
      p.action = 'block'
      p.vx *= 0.65
    } else if (!this.isAttacking(p)) {
      if (left === right) {
        p.vx *= 0.78
        if (p.onGround) p.action = 'idle'
      } else {
        p.vx = left ? -MOVE_SPEED : MOVE_SPEED
        if (p.onGround) p.action = 'walk'
      }
    }

    if (jump && p.onGround && !this.isAttacking(p)) {
      p.vy = JUMP_POWER
      p.onGround = false
      p.action = 'jump'
    }

    if (input.wasPressed('j') || input.wasPressed('f') || touch.punch) this.startAttack(p, 'punch')
    if (input.wasPressed('k') || input.wasPressed('g') || touch.kick) this.startAttack(p, 'kick')
    if (input.wasPressed('l') || input.wasPressed('h') || input.wasPressed('enter') || touch.special) this.startAttack(p, 'special')
  }

  private getTouchControl(input: GameInput): Record<string, boolean> {
    const active = { left: false, right: false, jump: false, block: false, punch: false, kick: false, special: false }
    const points = input.mouseDown ? [{ x: input.mouseX, y: input.mouseY }] : input.gestures
    for (const point of points) {
      const x = point.x
      const y = point.y
      if (y < this.canvasH * 0.52) continue
      if (x < this.canvasW * 0.18) active.left = true
      else if (x < this.canvasW * 0.36) active.right = true
      else if (x > this.canvasW * 0.78 && y > this.canvasH * 0.74) active.special = true
      else if (x > this.canvasW * 0.66 && y > this.canvasH * 0.74) active.kick = true
      else if (x > this.canvasW * 0.54 && y > this.canvasH * 0.74) active.punch = true
      else if (x > this.canvasW * 0.80) active.block = true
      else if (x > this.canvasW * 0.42) active.jump = true
    }
    return active
  }

  private updateRivalAi(): void {
    const r = this.rival
    const p = this.player
    if (r.action === 'hit' || r.action === 'ko' || this.isAttacking(r)) return

    const distance = Math.abs(p.x - r.x)
    r.facing = p.x < r.x ? -1 : 1

    if (r.health < 25 && distance < 95 && this.frame % 90 < 34) {
      r.action = 'block'
      r.vx *= 0.5
      return
    }

    if (distance > 108) {
      r.vx = r.facing * (2.1 + this.round * 0.05)
      r.action = r.onGround ? 'walk' : 'jump'
    } else {
      r.vx *= 0.72
      if (r.onGround) r.action = 'idle'
      const roll = (this.frame + this.round * 19) % 82
      if (roll === 0) this.startAttack(r, r.energy >= 45 && this.round > 3 ? 'special' : 'punch')
      if (roll === 39) this.startAttack(r, 'kick')
    }

    if (this.round > 5 && r.onGround && distance > 145 && this.frame % 170 === 0) {
      r.vy = JUMP_POWER * 0.92
      r.onGround = false
      r.action = 'jump'
    }
  }

  private updateFighter(f: Fighter): void {
    if (f.attackCooldown > 0) f.attackCooldown--
    if (f.invulnTimer > 0) f.invulnTimer--
    if (f.actionTimer > 0) {
      f.actionTimer--
      if (this.isAttacking(f)) this.checkAttackHit(f, f === this.player ? this.rival : this.player)
      if (f.actionTimer <= 0 && f.action !== 'ko') f.action = f.onGround ? 'idle' : 'jump'
    }
    this.updateFighterPhysics(f)
    f.energy = Math.min(MAX_ENERGY, f.energy + 0.08)
  }

  private updateFighterPhysics(f: Fighter): void {
    f.x += f.vx
    f.y += f.vy
    f.vy += GRAVITY

    if (f.y >= this.groundY) {
      f.y = this.groundY
      f.vy = 0
      f.onGround = true
      if (f.action === 'jump') f.action = 'idle'
    } else {
      f.onGround = false
    }

    f.x = Math.min(Math.max(f.x, 52), this.canvasW - 52)
    if (f.onGround && !this.isAttacking(f)) f.vx *= 0.86
  }

  private keepFightersApart(): void {
    const dx = this.rival.x - this.player.x
    const minGap = 62
    if (Math.abs(dx) >= minGap) return
    const push = (minGap - Math.abs(dx)) / 2
    if (dx >= 0) {
      this.player.x -= push
      this.rival.x += push
    } else {
      this.player.x += push
      this.rival.x -= push
    }
    this.player.x = Math.min(Math.max(this.player.x, 52), this.canvasW - 52)
    this.rival.x = Math.min(Math.max(this.rival.x, 52), this.canvasW - 52)
  }

  private startAttack(f: Fighter, action: 'punch' | 'kick' | 'special'): void {
    if (f.attackCooldown > 0 || f.action === 'hit' || f.action === 'ko' || f.action === 'block') return
    if (action === 'special' && f.energy < 35) return

    f.action = action
    f.actionTimer = action === 'punch' ? 18 : action === 'kick' ? 24 : 34
    f.attackCooldown = action === 'punch' ? 24 : action === 'kick' ? 34 : 56
    if (action === 'special') f.energy -= 35
  }

  private checkAttackHit(attacker: Fighter, defender: Fighter): void {
    if (defender.invulnTimer > 0 || defender.action === 'ko') return
    const active = attacker.action === 'punch'
      ? attacker.actionTimer >= 8 && attacker.actionTimer <= 13
      : attacker.action === 'kick'
        ? attacker.actionTimer >= 9 && attacker.actionTimer <= 17
        : attacker.actionTimer >= 12 && attacker.actionTimer <= 24
    if (!active) return

    const reach = attacker.action === 'punch' ? 72 : attacker.action === 'kick' ? 90 : 128
    const height = attacker.action === 'special' ? 82 : 58
    const forward = attacker.facing
    const hitX = attacker.x + forward * reach
    const inFront = forward === 1 ? defender.x > attacker.x - 12 : defender.x < attacker.x + 12
    const closeX = Math.abs(defender.x - hitX) < reach * 0.72
    const closeY = Math.abs(defender.y - attacker.y) < height
    if (!inFront || !closeX || !closeY) return

    const blocked = defender.action === 'block' && defender.facing === -attacker.facing
    const baseDamage = attacker.action === 'punch' ? 8 : attacker.action === 'kick' ? 12 : 22
    const damage = blocked ? Math.ceil(baseDamage * 0.28) : baseDamage
    defender.health = Math.max(0, defender.health - damage)
    defender.invulnTimer = 18
    defender.action = blocked ? 'block' : 'hit'
    defender.actionTimer = blocked ? 10 : 18
    defender.vx = attacker.facing * (blocked ? 2 : 5.4)
    defender.vy = blocked ? defender.vy : Math.min(defender.vy, -2.4)
    attacker.energy = Math.min(MAX_ENERGY, attacker.energy + (blocked ? 4 : 10))
    attacker.combo++
    this.cameraShake = attacker.action === 'special' ? 10 : 5
    this.spawnSparks(defender.x, defender.y - 48, blocked ? '#5dade2' : '#f5b041', attacker.action === 'special' ? 18 : 10)
    this.emitState()
  }

  private isAttacking(f: Fighter): boolean {
    return f.action === 'punch' || f.action === 'kick' || f.action === 'special'
  }

  private advanceRound(): void {
    if (this.round >= TOTAL_ROUNDS) {
      this.winner = 'human'
      this.emitState()
      return
    }

    this.round++
    this.message = `Round ${this.round}`
    this.roundIntro = 80
    this.roundOverTimer = 0
    this.sparks = []
    this.player = this.createFighter('A', this.canvasW * 0.28, 1)
    this.player.health = Math.min(MAX_HEALTH, 72 + this.round * 2)
    this.player.energy = Math.min(MAX_ENERGY, 20 + this.round * 3)
    this.rival = this.createFighter(ALL_LETTERS[this.round], this.canvasW * 0.72, -1)
    this.rival.health = Math.min(MAX_HEALTH, 76 + this.round)
    this.emitState()
  }

  private spawnSparks(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1.5 + Math.random() * 4
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 18 + Math.random() * 18,
        color,
      })
    }
  }

  private updateSparks(): void {
    for (const s of this.sparks) {
      s.x += s.vx
      s.y += s.vy
      s.vy += 0.12
      s.life--
    }
    this.sparks = this.sparks.filter(s => s.life > 0)
  }

  private drawStage(ctx: CanvasRenderingContext2D): void {
    const sky = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    sky.addColorStop(0, '#15192d')
    sky.addColorStop(0.48, '#26345a')
    sky.addColorStop(1, '#15100f')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = '#ffd166'
    ctx.beginPath()
    ctx.arc(this.canvasW - 90, 78, 28, 0, Math.PI * 2)
    ctx.fill()

    const backY = this.groundY - 180
    for (let i = 0; i < 8; i++) {
      const bw = this.canvasW / 7
      const x = i * bw - 30
      const h = 80 + ((i * 47) % 90)
      ctx.fillStyle = i % 2 === 0 ? '#23283d' : '#1d2235'
      ctx.fillRect(x, backY + 120 - h, bw * 0.82, h)
      ctx.fillStyle = 'rgba(245,176,65,0.5)'
      for (let w = 0; w < 3; w++) {
        ctx.fillRect(x + 14 + w * 22, backY + 138 - h, 8, 12)
      }
    }

    ctx.fillStyle = '#34302e'
    ctx.fillRect(0, this.groundY, this.canvasW, this.canvasH - this.groundY)
    ctx.fillStyle = '#1f1b1a'
    ctx.fillRect(0, this.groundY + 34, this.canvasW, 14)
    ctx.strokeStyle = '#f5b041'
    ctx.lineWidth = 3
    ctx.setLineDash([28, 22])
    ctx.beginPath()
    ctx.moveTo(0, this.groundY + 42)
    ctx.lineTo(this.canvasW, this.groundY + 42)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.beginPath()
    ctx.ellipse(this.player.x, this.groundY + 8, 52, 12, 0, 0, Math.PI * 2)
    ctx.ellipse(this.rival.x, this.groundY + 8, 52, 12, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawFighter(ctx: CanvasRenderingContext2D, f: Fighter, isPlayer: boolean): void {
    ctx.save()
    ctx.translate(f.x, f.y)
    ctx.scale(f.facing, 1)

    const bob = f.action === 'walk' ? Math.sin(this.frame * 0.3) * 3 : 0
    const scale = isPlayer ? 1.38 : 1.28
    const lean = f.action === 'hit' ? -0.18 : f.action === 'punch' ? 0.1 : f.action === 'kick' ? -0.08 : 0
    ctx.rotate(lean)
    drawCharacter(ctx, f.letter, -32, -96 + bob, scale, 0)

    this.drawLimbs(ctx, f)
    ctx.restore()
  }

  private drawLimbs(ctx: CanvasRenderingContext2D, f: Fighter): void {
    ctx.lineCap = 'round'
    ctx.lineWidth = 8
    ctx.strokeStyle = f.action === 'special' ? '#f5b041' : '#e9eef8'

    const punchReach = f.action === 'punch' || f.action === 'special' ? 42 : 16
    const kickReach = f.action === 'kick' ? 48 : 20

    ctx.beginPath()
    ctx.moveTo(6, -54)
    ctx.lineTo(punchReach, f.action === 'block' ? -65 : -54)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(-8, -54)
    ctx.lineTo(-22, f.action === 'block' ? -72 : -46)
    ctx.stroke()

    ctx.strokeStyle = '#d4d7e2'
    ctx.beginPath()
    ctx.moveTo(-8, -12)
    ctx.lineTo(-20, 0)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(10, -12)
    ctx.lineTo(kickReach, f.action === 'kick' ? -18 : 0)
    ctx.stroke()

    if (f.action === 'special') {
      ctx.strokeStyle = 'rgba(245,176,65,0.55)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(36, -56, 26 + Math.sin(this.frame * 0.4) * 4, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  private drawSparks(ctx: CanvasRenderingContext2D): void {
    for (const s of this.sparks) {
      ctx.globalAlpha = Math.max(0, s.life / 26)
      ctx.fillStyle = s.color
      ctx.beginPath()
      ctx.arc(s.x, s.y, 3 + s.life * 0.08, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawHud(ctx: CanvasRenderingContext2D): void {
    this.drawHealthBar(ctx, 24, 18, this.canvasW * 0.38, this.player.health, this.player.energy, this.player.letter, true)
    this.drawHealthBar(ctx, this.canvasW - 24 - this.canvasW * 0.38, 18, this.canvasW * 0.38, this.rival.health, this.rival.energy, this.rival.letter, false)

    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(this.canvasW / 2 - 54, 12, 108, 52)
    ctx.strokeStyle = '#f5b041'
    ctx.lineWidth = 2
    ctx.strokeRect(this.canvasW / 2 - 54, 12, 108, 52)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`ROUND ${this.round}`, this.canvasW / 2, 28)
    ctx.fillStyle = '#f5b041'
    ctx.font = 'bold 13px system-ui'
    ctx.fillText(`Score ${this.score}`, this.canvasW / 2, 48)

    if (this.roundIntro > 0 || this.roundOverTimer > 0 || this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(0, this.canvasH * 0.36, this.canvasW, 72)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 36px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.message, this.canvasW / 2, this.canvasH * 0.36 + 36)
    }

    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('A/D move  W/Space jump  S block  J punch  K kick  L special', this.canvasW / 2, this.canvasH - 10)
  }

  private drawHealthBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    health: number,
    energy: number,
    letter: string,
    alignLeft: boolean,
  ): void {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(x, y, w, 24)
    ctx.fillStyle = '#2b1d24'
    ctx.fillRect(x + 3, y + 3, w - 6, 18)
    ctx.fillStyle = health > 45 ? '#58d68d' : health > 20 ? '#f5b041' : '#e74c5c'
    const hw = (w - 6) * (health / MAX_HEALTH)
    if (alignLeft) ctx.fillRect(x + 3, y + 3, hw, 18)
    else ctx.fillRect(x + w - 3 - hw, y + 3, hw, 18)

    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(x, y + 30, w, 8)
    ctx.fillStyle = '#5dade2'
    const ew = w * (energy / MAX_ENERGY)
    if (alignLeft) ctx.fillRect(x, y + 30, ew, 8)
    else ctx.fillRect(x + w - ew, y + 30, ew, 8)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px system-ui'
    ctx.textAlign = alignLeft ? 'left' : 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(letter, alignLeft ? x : x + w, y - 2)
  }

  private drawTouchHints(ctx: CanvasRenderingContext2D): void {
    if (this.canvasW > 900) return
    const y = this.canvasH - 78
    const labels = [
      { text: 'LEFT', x: 46 },
      { text: 'RIGHT', x: 136 },
      { text: 'JUMP', x: this.canvasW - 300 },
      { text: 'PUNCH', x: this.canvasW - 210 },
      { text: 'KICK', x: this.canvasW - 126 },
      { text: 'SUPER', x: this.canvasW - 46 },
    ]
    ctx.font = 'bold 11px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const item of labels) {
      ctx.fillStyle = 'rgba(0,0,0,0.34)'
      ctx.beginPath()
      ctx.arc(item.x, y, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.fillText(item.text, item.x, y)
    }
  }

  private emitState(): void {
    this.onStateChange?.({
      score: this.score,
      currentLevel: this.round,
      totalLevels: TOTAL_ROUNDS,
      winner: this.winner,
    })
  }
}
