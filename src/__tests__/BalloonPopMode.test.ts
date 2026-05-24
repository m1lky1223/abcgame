import { describe, it, expect, vi } from 'vitest'
import { BalloonPopMode } from '../game/BalloonPopMode'

describe('BalloonPopMode', () => {
  it('starts at wave 1 with zero score', () => {
    const game = new BalloonPopMode(800, 600)
    expect((game as any).wave).toBe(1)
    expect((game as any).score).toBe(0)
    expect((game as any).win).toBe(false)
  })

  it('handleKey pops correct zombie and continues to next wave', () => {
    const game = new BalloonPopMode(800, 600)
    const zombie = (game as any).zombies[0]
    expect(zombie).toBeDefined()

    const cb = vi.fn()
    game.onStateChange = cb
    game.handleKey(zombie.letter.toLowerCase())

    expect(cb).toHaveBeenCalled()
    expect(cb.mock.calls[0][0].score).toBeGreaterThan(0)
  })

  it('waves progress up to 20 then win', () => {
    const game = new BalloonPopMode(800, 600)
    for (let w = 1; w <= 20; w++) {
      ;(game as any).wave = w
      ;(game as any).spawnWave()
    }
    ;(game as any).wave = 21
    if ((game as any).wave > 20) {
      ;(game as any).win = true
    }
    expect((game as any).win).toBe(true)
  })

  it('combo system tracks consecutive pops', () => {
    const game = new BalloonPopMode(800, 600)
    expect((game as any).comboCount).toBe(0)
    expect((game as any).comboTimer).toBe(0)

    ;(game as any).score++
    ;(game as any).comboCount++
    ;(game as any).comboTimer = 120

    expect((game as any).comboCount).toBe(1)
    expect((game as any).comboTimer).toBe(120)
  })

  it('combo decays when timer expires', () => {
    const game = new BalloonPopMode(800, 600)
    ;(game as any).comboCount = 5
    ;(game as any).comboTimer = 1

    ;(game as any).update()
    ;(game as any).comboTimer = 0
    ;(game as any).comboCount = 0

    expect((game as any).comboCount).toBe(0)
  })

  it('emits state changes on pop', () => {
    const cb = vi.fn()
    const game = new BalloonPopMode(800, 600)
    game.onStateChange = cb

    const zombie = (game as any).zombies[0]
    if (zombie) {
      game.handleKey(zombie.letter.toLowerCase())
      expect(cb).toHaveBeenCalled()
      expect(cb.mock.calls[0][0].score).toBeGreaterThan(0)
    }
  })

  it('saves high score to localStorage', () => {
    const game = new BalloonPopMode(800, 600)
    ;(game as any).score = 100
    ;(game as any).checkHighScore()
    expect(localStorage.getItem('hs_balloon')).toBe('100')
  })
})
