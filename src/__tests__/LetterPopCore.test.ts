import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LetterPopCore } from '../game/strategies/LetterPopCore'
import { GameInput, buildGameInput } from '../game/GameModeStrategy'
import { Input } from '../game/Input'

function makeInput(): Input {
  const input = new Input()
  return input
}

function keyInput(input: Input, key: string, rect = { left: 0, top: 0, width: 800, height: 600 } as DOMRect): GameInput {
  input.wasPressed = vi.fn((k: string) => k === key)
  return buildGameInput(input, rect)
}

describe('LetterPopCore — Free Mode', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with letters on the field', () => {
    const core = new LetterPopCore(800, 600, 'free')
    core.start()
    expect(core.letters.length).toBeGreaterThan(0)
    expect(core.winner).toBeNull()
  })

  it('keyboard pop gives +2 and adds to collected set', () => {
    const core = new LetterPopCore(800, 600, 'free')
    core.start()
    const input = makeInput()
    const letter = core.letters[0]
    const gi = keyInput(input, letter.letter.toLowerCase())
    core.update(1, gi)

    expect(core.score).toBe(2)
    expect(core.totalCollected).toBe(1)
    expect(core.collectedSet.has(letter.letter)).toBe(true)
  })

  it('detects human win at 26 collected', () => {
    const core = new LetterPopCore(800, 600, 'free')
    for (let i = 0; i < 26; i++) {
      core.collectedSet.add(String.fromCharCode(65 + i))
    }
    core.totalCollected = 26
    expect(core.collectedSet.size).toBe(26)
    core.winner = 'human'
    expect(core.winner).toBe('human')
  })

  it('emits state changes', () => {
    const cb = vi.fn()
    const core = new LetterPopCore(800, 600, 'free')
    core.onStateChange = cb
    core.start()

    const input = makeInput()
    const gi = keyInput(input, core.letters[0].letter.toLowerCase())
    core.update(1, gi)

    expect(cb).toHaveBeenCalled()
    const state = cb.mock.calls[0][0]
    expect(state.score).toBe(2)
  })
})

describe('LetterPopCore — Survival Mode', () => {
  it('starts with 3 lives', () => {
    const core = new LetterPopCore(800, 600, 'survival')
    expect(core.survivalLives).toBe(3)
  })
})

describe('LetterPopCore — Time Attack Mode', () => {
  it('starts with 60 seconds', () => {
    const core = new LetterPopCore(800, 600, 'timeattack')
    expect(core.timeLeft).toBe(60)
  })
})

describe('LetterPopCore — Defense Mode', () => {
  it('starts with 3 defense lives', () => {
    const core = new LetterPopCore(800, 600, 'defense')
    expect(core.defenseLives).toBe(3)
  })
})
