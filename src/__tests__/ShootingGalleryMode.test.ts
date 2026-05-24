import { describe, it, expect, vi } from 'vitest'
import { ShootingGalleryMode } from '../game/ShootingGalleryMode'

describe('ShootingGalleryMode', () => {
  it('starts at wave 1 with 3 lives', () => {
    const game = new ShootingGalleryMode(800, 600)
    expect((game as any).wave).toBe(1)
    expect((game as any).lives).toBe(3)
    expect((game as any).score).toBe(0)
    expect((game as any).collectedLetters).toEqual([])
    expect((game as any).gameOver).toBe(false)
    expect((game as any).win).toBe(false)
    expect((game as any).ammo).toBe(6)
  })

  it('starts wave 1 with correct zombie count', () => {
    const game = new ShootingGalleryMode(800, 600)
    expect((game as any).waveZombieCount).toBe(4)
    expect((game as any).waveZombiesSpawned).toBe(0)
  })

  it('handleClick fires a bullet when not reloading', () => {
    const game = new ShootingGalleryMode(800, 600)
    game.handleClick(400, 300)
    expect((game as any).bullets.length).toBe(3)
  })

  it('handleClick does not fire when ammo is empty', () => {
    const game = new ShootingGalleryMode(800, 600);
    (game as any).ammo = 0
    game.handleClick(400, 300)
    expect((game as any).reloading).toBe(true)
  })

  it('handleClick is ignored when game over', () => {
    const game = new ShootingGalleryMode(800, 600);
    (game as any).gameOver = true
    game.handleClick(400, 300)
    expect((game as any).bullets.length).toBe(0)
  })

  it('handleKey r starts reload', () => {
    const game = new ShootingGalleryMode(800, 600);
    (game as any).ammo = 0
    game.handleKey('r')
    expect((game as any).reloading).toBe(true)
    expect((game as any).reloadTimer).toBe(60)
  })

  it('handleKey with letter damages matching zombie', () => {
    const game = new ShootingGalleryMode(800, 600)
    const cb = vi.fn()
    game.onStateChange = cb;

    (game as any).zombies.push({
      x: 400, y: 300, hp: 1, maxHp: 1, speed: 0.8,
      letter: 'A', typeIndex: 0, wobble: 0,
      hitFlash: 0, slowed: 0, alive: true,
    });

    (game as any).collectedLetters = ['B', 'C']
    game.handleKey('a')
    const zombie = (game as any).zombies[0]
    expect(zombie.alive).toBe(false)
    expect(cb).toHaveBeenCalled()
  })

  it('handleKey 1-7 switches shooter', () => {
    const game = new ShootingGalleryMode(800, 600)
    game.handleKey('3')
    expect((game as any).shooterIndex).toBe(2)
    game.handleKey('7')
    expect((game as any).shooterIndex).toBe(6)
  })

  it('damageZombie collects letter and awards score on kill', () => {
    const game = new ShootingGalleryMode(800, 600)
    const zombie = {
      x: 400, y: 300, hp: 1, maxHp: 1, speed: 0.8,
      letter: 'A', typeIndex: 0, wobble: 0,
      hitFlash: 0, slowed: 0, alive: true,
    };
    (game as any).damageZombie(zombie, 1)
    expect(zombie.alive).toBe(false)
    expect((game as any).collectedLetters).toContain('A')
    expect((game as any).score).toBeGreaterThan(0)
  })

  it('zombie reaching left wall reduces lives', () => {
    const game = new ShootingGalleryMode(800, 600);
    (game as any).zombies.push({
      x: 50, y: 300, hp: 1, maxHp: 1, speed: 0.8,
      letter: 'A', typeIndex: 0, wobble: 0,
      hitFlash: 0, slowed: 0, alive: true,
    });
    (game as any).update()
    expect((game as any).lives).toBe(2)
  })

  it('game over when lives reach 0', () => {
    const game = new ShootingGalleryMode(800, 600);
    (game as any).lives = 1;
    (game as any).zombies.push({
      x: 50, y: 300, hp: 1, maxHp: 1, speed: 0.8,
      letter: 'A', typeIndex: 0, wobble: 0,
      hitFlash: 0, slowed: 0, alive: true,
    });
    (game as any).update()
    expect((game as any).gameOver).toBe(true)
  })

  it('win when 26 letters collected', () => {
    const game = new ShootingGalleryMode(800, 600);
    (game as any).collectedLetters = Array.from({ length: 25 }, (_, i) => String.fromCharCode(65 + i));
    (game as any).damageZombie({
      x: 400, y: 300, hp: 1, maxHp: 1, speed: 0.8,
      letter: 'Z', typeIndex: 0, wobble: 0,
      hitFlash: 0, slowed: 0, alive: true,
    }, 1)
    expect((game as any).collectedLetters).toContain('Z')
    expect((game as any).win).toBe(true)
  })

  it('restart resets all state', () => {
    const game = new ShootingGalleryMode(800, 600);
    (game as any).score = 100
    ;(game as any).wave = 10
    ;(game as any).lives = 1
    ;(game as any).collectedLetters = ['A', 'B']
    ;(game as any).gameOver = true
    ;(game as any).zombies.push({
      x: 400, y: 300, hp: 1, maxHp: 1, speed: 0.8,
      letter: 'Z', typeIndex: 0, wobble: 0,
      hitFlash: 0, slowed: 0, alive: true,
    })
    game.restart()
    expect((game as any).score).toBe(0)
    expect((game as any).wave).toBe(1)
    expect((game as any).lives).toBe(3)
    expect((game as any).collectedLetters).toEqual([])
    expect((game as any).gameOver).toBe(false)
    expect((game as any).win).toBe(false)
    expect((game as any).bullets.length).toBe(0)
    expect((game as any).zombies.length).toBe(0)
    expect((game as any).ammo).toBe(6)
    expect((game as any).reloading).toBe(false)
    expect((game as any).comboCount).toBe(0)
  })

  it('update moves zombies left and spawns new ones', () => {
    const game = new ShootingGalleryMode(800, 600);
    (game as any).zombies.push({
      x: 500, y: 300, hp: 1, maxHp: 1, speed: 0.8,
      letter: 'A', typeIndex: 0, wobble: 0,
      hitFlash: 0, slowed: 0, alive: true,
    })
    const initialX = (game as any).zombies[0].x
    ;(game as any).update()
    expect((game as any).zombies[0].x).toBeLessThan(initialX)
  })

  it('resize updates canvas dimensions', () => {
    const game = new ShootingGalleryMode(800, 600)
    game.resize(1024, 768)
    expect((game as any).canvasW).toBe(1024)
    expect((game as any).canvasH).toBe(768)
  })

  it('combo timer resets combo after timeout', () => {
    const game = new ShootingGalleryMode(800, 600);
    (game as any).comboCount = 5;
    (game as any).comboTimer = 1
    for (let i = 0; i < 40; i++) (game as any).update()
    expect((game as any).comboCount).toBe(0)
    expect((game as any).comboTimer).toBe(0)
  })
})
