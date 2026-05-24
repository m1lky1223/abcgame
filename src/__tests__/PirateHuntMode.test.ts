import { describe, it, expect, vi } from 'vitest'
import { PirateHuntMode } from '../game/PirateHuntMode'

describe('PirateHuntMode', () => {
  it('starts at letter 0 with zero score', () => {
    const game = new PirateHuntMode(800, 600)
    expect((game as any).letterIndex).toBe(0)
    expect((game as any).score).toBe(0)
    expect((game as any).completed).toBe(false)
  })

  it('has a current word and correct letter tracked independently', () => {
    const game = new PirateHuntMode(800, 600)
    const word = (game as any).currentWord
    expect(word).toBeDefined()
    expect(word.word).toBeTruthy()
    expect(typeof (game as any).correctLetter).toBe('string')
    expect((game as any).correctLetter.length).toBe(1)
  })

  it('spawns 6 chests with one matching the correct letter', () => {
    const game = new PirateHuntMode(800, 600)
    const chests = (game as any).chests as any[]
    expect(chests.length).toBe(6)
    const correct = (game as any).correctLetter
    expect(chests.some((c: any) => c.letter === correct)).toBe(true)
  })

  it('handleClick on correct chest emits state and starts treasure popup', () => {
    const game = new PirateHuntMode(800, 600)
    const cb = vi.fn()
    game.onStateChange = cb
    const correct = (game as any).correctLetter
    const chest = (game as any).chests.find((c: any) => c.letter === correct)
    expect(chest).toBeDefined()
    game.handleClick(chest.x, chest.y)
    expect((game as any).showTreasure).toBeGreaterThan(0)
    expect(cb).toHaveBeenCalled()
    expect(cb.mock.calls[0][0].score).toBeGreaterThan(0)
  })

  it('handleClick on wrong chest shows fish splash', () => {
    const game = new PirateHuntMode(800, 600)
    const correct = (game as any).correctLetter
    const wrong = (game as any).chests.find((c: any) => c.letter !== correct)
    expect(wrong).toBeDefined()
    game.handleClick(wrong.x, wrong.y + 10)
    expect((game as any).showFish).toBeGreaterThan(0)
  })

  it('handleKey on correct letter awards double points and emits state', () => {
    const game = new PirateHuntMode(800, 600)
    const cb = vi.fn()
    game.onStateChange = cb
    const correct = (game as any).correctLetter
    game.handleKey(correct.toLowerCase())
    expect((game as any).showTreasure).toBeGreaterThan(0)
    expect(cb).toHaveBeenCalled()
    expect(cb.mock.calls[0][0].score).toBeGreaterThan(1)
  })

  it('advances through islands as letters are collected', () => {
    const game = new PirateHuntMode(800, 600)
    expect((game as any).getIslandIndex()).toBe(0)
    ;(game as any).letterIndex = 4
    expect((game as any).getIslandIndex()).toBe(1)
    ;(game as any).letterIndex = 9
    expect((game as any).getIslandIndex()).toBe(2)
    ;(game as any).letterIndex = 14
    expect((game as any).getIslandIndex()).toBe(3)
    ;(game as any).letterIndex = 20
    expect((game as any).getIslandIndex()).toBe(4)
  })

  it('sets completed and emits winner after 26 letters', () => {
    const game = new PirateHuntMode(800, 600)
    const cb = vi.fn()
    game.onStateChange = cb
    ;(game as any).letterIndex = 26
    ;(game as any).startRound()
    expect((game as any).completed).toBe(true)
    expect(cb).toHaveBeenCalled()
    expect(cb.mock.calls[0][0].winner).toBe('human')
  })

  it('restart resets all state', () => {
    const game = new PirateHuntMode(800, 600)
    ;(game as any).score = 50
    ;(game as any).letterIndex = 10
    ;(game as any).completed = true
    game.restart()
    expect((game as any).score).toBe(0)
    expect((game as any).letterIndex).toBe(0)
    expect((game as any).completed).toBe(false)
  })
})
