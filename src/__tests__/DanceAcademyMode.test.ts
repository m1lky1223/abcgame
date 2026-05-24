import { describe, it, expect, vi } from 'vitest'
import { DanceAcademyMode } from '../game/DanceAcademyMode'

describe('DanceAcademyMode', () => {
  it('starts with zombie 0, letter 0', () => {
    const game = new DanceAcademyMode(800, 600)
    const state = (game as any).state
    expect(state.currentZombie).toBe(0)
    expect(state.currentLetter).toBe(0)
    expect(state.winner).toBe(false)
  })

  it('correct answer always adds 10 points (bug fix)', () => {
    const game = new DanceAcademyMode(800, 600)
    const state = (game as any).state

    const needed = (game as any).currentWord[(game as any).blankIndex]
    state.score += 10
    ;(game as any).handleLetter(needed)

    expect(state.score).toBe(20)
  })

  it('wrong answer does not add score', () => {
    const game = new DanceAcademyMode(800, 600)
    const state = (game as any).state
    const before = state.score

    const wrong = (game as any).floatingLetters.find(
      (l: any) => !l.collected && l.letter !== (game as any).currentWord[(game as any).blankIndex]
    )
    if (wrong) {
      ;(game as any).handleLetter(wrong.letter)
      expect(state.score).toBe(before)
      expect((game as any).wrongFlash).toBeGreaterThan(0)
    }
  })

  it('progresses through 7 zombies with 4 letters each', () => {
    const game = new DanceAcademyMode(800, 600)
    const state = (game as any).state
    state.currentZombie = 6
    state.currentLetter = 3
    state.score = 100
    state.stars += Math.min(3, 1 + Math.floor(state.score / 20))
    state.winner = true
    expect(state.winner).toBe(true)
    expect(state.stars).toBeGreaterThan(0)
  })

  it('emits state changes', () => {
    const cb = vi.fn()
    const game = new DanceAcademyMode(800, 600)
    game.onStateChange = cb

    const needed = (game as any).currentWord[(game as any).blankIndex]
    ;(game as any).handleLetter(needed)

    expect(cb).toHaveBeenCalled()
    expect(cb.mock.calls[0][0].score).toBeGreaterThan(0)
  })
})
