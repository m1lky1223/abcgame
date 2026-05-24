import { describe, it, expect, vi } from 'vitest'
import { CircusMode } from '../game/CircusMode'

describe('CircusMode', () => {
  it('starts at act 0 with zero score', () => {
    const game = new CircusMode(800, 600)
    expect((game as any).actIndex).toBe(0)
    expect((game as any).wordInAct).toBe(0)
    expect((game as any).score).toBe(0)
    expect((game as any).completed).toBe(false)
  })

  it('has a current word with a correct letter', () => {
    const game = new CircusMode(800, 600)
    const word = (game as any).currentWord
    expect(word).toBeDefined()
    expect(word.word).toBeTruthy()
    expect((game as any).correctLetter).toBe(word.word[word.blankIndex])
  })

  it('spawns 6 items with one matching the correct letter', () => {
    const game = new CircusMode(800, 600)
    const items = (game as any).items as any[]
    expect(items.length).toBe(6)
    const correct = (game as any).correctLetter
    expect(items.some((i: any) => i.letter === correct)).toBe(true)
  })

  it('handleClick on correct item emits state and starts trick animation', () => {
    const game = new CircusMode(800, 600)
    const cb = vi.fn()
    game.onStateChange = cb
    const correct = (game as any).correctLetter
    const item = (game as any).items.find((i: any) => i.letter === correct)
    expect(item).toBeDefined()
    game.handleClick(item.x, item.y)
    expect((game as any).showTrick).toBeGreaterThan(0)
    expect((game as any).wordInAct).toBe(1)
    expect(cb).toHaveBeenCalled()
    expect(cb.mock.calls[0][0].totalCollected).toBeGreaterThan(0)
  })

  it('handleClick on wrong item shows banana slip', () => {
    const game = new CircusMode(800, 600)
    const correct = (game as any).correctLetter
    const wrong = (game as any).items.find((i: any) => i.letter !== correct)
    expect(wrong).toBeDefined()
    game.handleClick(wrong.x, wrong.y)
    expect((game as any).showSlip).toBeGreaterThan(0)
  })

  it('handleKey on correct letter awards double points', () => {
    const game = new CircusMode(800, 600)
    const cb = vi.fn()
    game.onStateChange = cb
    const correct = (game as any).correctLetter
    game.handleKey(correct.toLowerCase())
    expect((game as any).showTrick).toBeGreaterThan(0)
    expect((game as any).wordInAct).toBe(1)
    expect(cb).toHaveBeenCalled()
    expect(cb.mock.calls[0][0].score).toBeGreaterThan(1)
  })

  it('completes an act after 4 words and advances to next act', () => {
    const game = new CircusMode(800, 600)
    expect((game as any).actIndex).toBe(0)
    expect((game as any).wordInAct).toBe(0)

    ;(game as any).wordInAct = 3
    const correct = (game as any).correctLetter
    const item = (game as any).items.find((i: any) => i.letter === correct)
    if (item) game.handleClick(item.x, item.y)
  })

  it('sets completed and emits winner after all acts', () => {
    const game = new CircusMode(800, 600)
    const cb = vi.fn()
    game.onStateChange = cb
    ;(game as any).actIndex = 7
    ;(game as any).startRound()
    expect((game as any).completed).toBe(true)
    expect(cb).toHaveBeenCalled()
    expect(cb.mock.calls[0][0].winner).toBe('human')
  })

  it('restart resets all state', () => {
    const game = new CircusMode(800, 600)
    ;(game as any).score = 50
    ;(game as any).actIndex = 4
    ;(game as any).wordInAct = 2
    ;(game as any).completed = true
    game.restart()
    expect((game as any).score).toBe(0)
    expect((game as any).actIndex).toBe(0)
    expect((game as any).wordInAct).toBe(0)
    expect((game as any).completed).toBe(false)
  })

  it('tracks star count as acts are completed', () => {
    const game = new CircusMode(800, 600)
    expect((game as any).starCount).toBe(0)
    ;(game as any).wordInAct = 4
    ;(game as any).startRound()
    expect((game as any).starCount).toBe(1)
    expect((game as any).actIndex).toBe(1)
  })
})
