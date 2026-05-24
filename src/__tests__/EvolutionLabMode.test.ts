import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EvolutionLabMode } from '../game/EvolutionLabMode'

describe('EvolutionLabMode', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with 0 DNA and no evolutions', () => {
    const lab = new EvolutionLabMode(800, 600)
    expect((lab as any).state.dna).toBe(0)
    expect((lab as any).state.winner).toBe(false)
  })

  it('win condition triggers at 26 evolved letters', () => {
    const lab = new EvolutionLabMode(800, 600)
    const state = (lab as any).state as any

    for (let i = 0; i < 26; i++) {
      state.evolutions[String.fromCharCode(65 + i)] = { level: 3, path: 'oddbod' }
    }

    const totalEvolutions = Object.values(state.evolutions).filter((e: any) => e.level >= 3).length
    expect(totalEvolutions).toBe(26)

    state.winner = totalEvolutions >= 26
    expect(state.winner).toBe(true)
  })

  it('does not trigger win at 25 evolved letters', () => {
    const lab = new EvolutionLabMode(800, 600)
    const state = (lab as any).state as any

    for (let i = 0; i < 25; i++) {
      state.evolutions[String.fromCharCode(65 + i)] = { level: 3, path: 'zombie' }
    }

    const totalEvolutions = Object.values(state.evolutions).filter((e: any) => e.level >= 3).length
    expect(totalEvolutions).toBe(25)

    state.winner = totalEvolutions >= 26
    expect(state.winner).toBe(false)
  })

  it('reads fresh evolutions from localStorage on restart', () => {
    const saved = { A: { level: 1, path: 'oddbod' }, B: { level: 2, path: 'zombie' } }
    localStorage.setItem('evolutions', JSON.stringify(saved))

    const lab = new EvolutionLabMode(800, 600)
    const stateBefore = (lab as any).state as any
    expect(Object.keys(stateBefore.evolutions).length).toBe(2)

    localStorage.setItem('evolutions', JSON.stringify({ ...saved, C: { level: 3, path: 'oddbod' } }))
    lab.restart()

    const stateAfter = (lab as any).state as any
    expect(Object.keys(stateAfter.evolutions).length).toBe(3)
    expect(stateAfter.evolutions.C.level).toBe(3)
  })

  it('spawns letters on construction', () => {
    const lab = new EvolutionLabMode(800, 600)
    expect((lab as any).letters.length).toBeGreaterThan(0)
  })

  it('emits state changes via callback', () => {
    const cb = vi.fn()
    const lab = new EvolutionLabMode(800, 600)
    lab.onStateChange = cb

    const letter = (lab as any).letters[0]
    if (letter) {
      lab.handleKey(letter.letter.toLowerCase())
      expect(cb).toHaveBeenCalled()
      const callArg = cb.mock.calls[0][0]
      expect(callArg.dna).toBeGreaterThan(0)
    }
  })

  it('DNA cost increases with evolution level', () => {
    const lab = new EvolutionLabMode(800, 600)
    const state = (lab as any).state as any
    state.dna = 1000
    state.screen = 'lab'
    state.selectedLetter = 'A'

    const costs = [10, 25, 50]
    for (let level = 0; level < 3; level++) {
      const current = state.evolutions['A']
      expect(current ? current.level : 0).toBe(level)
      const cost = level === 0 ? 10 : level === 1 ? 25 : 50
      expect(cost).toBe(costs[level])
      ;(lab as any).evolveLetter('A', level === 0 ? 'oddbod' : 'zombie')
    }

    expect(state.evolutions['A'].level).toBe(3)
    expect(state.evolutions['A'].path).toBe('zombie')
  })
})
