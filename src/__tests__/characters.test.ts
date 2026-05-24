import { describe, it, expect } from 'vitest'
import { CHARACTERS, ALL_LETTERS, ALLY_LETTERS, ENEMY_LETTERS } from '../characters/data'

describe('characters/data.ts data integrity', () => {
  it('has exactly 26 characters (A-Z)', () => {
    expect(Object.keys(CHARACTERS).length).toBe(26)
  })

  it('ALL_LETTERS contains all 26 letters', () => {
    expect(ALL_LETTERS.length).toBe(26)
    expect(ALL_LETTERS).toEqual([
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
      'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
      'U', 'V', 'W', 'X', 'Y', 'Z',
    ])
  })

  it('every character has required fields', () => {
    for (const letter of ALL_LETTERS) {
      const c = CHARACTERS[letter]
      expect(c).toBeDefined()
      expect(c.letter).toBe(letter)
      expect(c.bodyColor).toMatch(/^#[0-9A-Fa-f]{3,6}$/)
      expect(c.outlineColor).toMatch(/^#[0-9A-Fa-f]{3,6}$/)
      expect(c.eyeWhiteColor).toMatch(/^#[0-9A-Fa-f]{3,6}$/)
      expect(c.pupilColor).toMatch(/^#[0-9A-Fa-f]{3,6}$/)
      expect(['hero', 'enemy', 'ally']).toContain(c.role)
    }
  })

  it('has exactly 1 hero (A)', () => {
    const heroes = ALL_LETTERS.filter(l => CHARACTERS[l].role === 'hero')
    expect(heroes).toEqual(['A'])
  })

  it('has exactly 3 enemies (F, N, X)', () => {
    expect(ENEMY_LETTERS).toEqual(['F', 'N', 'X'])
  })

  it('has 23 allies (all non-enemy letters)', () => {
    expect(ALLY_LETTERS.length).toBe(23)
  })
})
