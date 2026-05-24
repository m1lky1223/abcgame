import { describe, it, expect } from 'vitest'
import { WORDS } from '../game/words'

describe('words.ts data integrity', () => {
  it('has at least 1 word entry', () => {
    expect(WORDS.length).toBeGreaterThan(0)
  })

  it('all words have required fields', () => {
    for (const w of WORDS) {
      expect(w.word).toBeDefined()
      expect(typeof w.word).toBe('string')
      expect(w.emoji).toBeDefined()
      expect(typeof w.emoji).toBe('string')
      expect(w.blankIndex).toBeDefined()
      expect(typeof w.blankIndex).toBe('number')
    }
  })

  it('all blankIndex values are valid within word length', () => {
    for (const w of WORDS) {
      expect(w.blankIndex).toBeGreaterThanOrEqual(0)
      expect(w.blankIndex).toBeLessThan(w.word.length)
    }
  })

  it('no duplicate word entries', () => {
    const words = WORDS.map(w => w.word)
    const unique = new Set(words)
    expect(unique.size).toBe(words.length)
  })

  it('words are between 4 and 9 characters', () => {
    for (const w of WORDS) {
      expect(w.word.length).toBeGreaterThanOrEqual(4)
      expect(w.word.length).toBeLessThanOrEqual(9)
    }
  })
})
