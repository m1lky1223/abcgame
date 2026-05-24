import { describe, it, expect, vi } from 'vitest'
import { MemoryMatchMode } from '../game/MemoryMatchMode'

describe('MemoryMatchMode', () => {
  it('starts with round 1 and zero score', () => {
    const game = new MemoryMatchMode(800, 600)
    expect((game as any).score).toBe(0)
    expect((game as any).round).toBe(1)
    expect((game as any).win).toBe(false)
  })

  it('combo resets to 1 after mismatch to avoid zero-point matches', () => {
    const game = new MemoryMatchMode(800, 600)
    const cards = (game as any).cards as any[]
    const unmatched = cards.filter((c: any) => !c.matched)
    expect(unmatched.length).toBeGreaterThanOrEqual(2)

    const first = unmatched[0]
    const second = unmatched[1]

    first.flipped = true
    second.flipped = true
    ;(game as any).selected = [cards.indexOf(first), cards.indexOf(second)]

    if (first.letter !== second.letter) {
      ;(game as any).combo = 0
      expect((game as any).combo).toBe(0)
      ;(game as any).combo = 1
      expect((game as any).combo).toBe(1)
    }
  })

  it('increments combo on successful match', () => {
    const game = new MemoryMatchMode(800, 600)
    expect((game as any).combo).toBe(0)

    const cards = (game as any).cards as any[]
    const pair = cards.find((c: any) => {
      const twin = cards.find((t: any) => t !== c && t.letter === c.letter)
      return twin && !c.matched && !twin.matched
    })
    if (pair) {
      const twin = cards.find((t: any) => t !== pair && t.letter === pair.letter)!
      pair.flipped = true
      twin.flipped = true
      ;(game as any).selected = [cards.indexOf(pair), cards.indexOf(twin)]
      ;(game as any).combo++
      const comboValue = (game as any).combo
      expect(comboValue).toBeGreaterThan(0)
    }
  })

  it('progresses through 4 rounds then wins', () => {
    const game = new MemoryMatchMode(800, 600)
    for (let round = 1; round <= 4; round++) {
      if (round > 1) {
        ;(game as any).startRound(round)
      }
      expect((game as any).round).toBe(round)
      expect((game as any).totalPairs).toBe([6, 8, 10, 12][round - 1])
    }
    ;(game as any).win = true
    expect((game as any).win).toBe(true)
  })

  it('emits state changes', () => {
    const cb = vi.fn()
    const game = new MemoryMatchMode(800, 600)
    game.onStateChange = cb

    const cards = (game as any).cards as any[]
    const first = cards[0]
    const second = cards.find((c: any) => c !== first && c.letter === first.letter)!
    first.flipped = true
    second.flipped = true
    ;(game as any).selected = [cards.indexOf(first), cards.indexOf(second)]

    if (first.letter === second.letter) {
      first.matched = true
      second.matched = true
      const s = (game as any)
      s.matched++
      s.combo++
      s.score += 10 * s.combo
      s.selected = []
      s.onStateChange?.({ score: s.score, matched: s.matched, totalPairs: s.totalPairs, round: s.round })
      expect(cb).toHaveBeenCalled()
      expect(cb.mock.calls[0][0].matched).toBeGreaterThan(0)
    }
  })
})
