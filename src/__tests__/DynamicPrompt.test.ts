import { describe, it, expect } from 'vitest'
import { generateLocalConfig } from '../game/adapters/LocalGenerator'

describe('LocalGenerator', () => {
  it('maps space keyword to space theme', () => {
    const config = generateLocalConfig('make a space survival game')
    expect(config.theme.background).toBe('space')
    expect(config.theme.specialEffects).toBe('stars')
  })

  it('maps volcano keywords to volcano theme', () => {
    const config = generateLocalConfig('volcano lava fire letters')
    expect(config.theme.background).toBe('volcano')
    expect(config.theme.specialEffects).toBe('lava_drips')
  })

  it('maps shoot keyword to shooter control', () => {
    const config = generateLocalConfig('zombie shooter with water guns')
    expect(config.controls.interaction).toBe('shooter')
    expect(config.controls.projectileType).toBe('water')
    expect(config.controls.ammoCount).toBe(40)
  })

  it('maps custom word spell prompts correctly', () => {
    const config = generateLocalConfig('spell hello in a sweet candy land')
    expect(config.letters.pool).toBe('custom')
    expect(config.letters.customLetters).toEqual(['H', 'E', 'L', 'L', 'O'])
    expect(config.theme.background).toBe('candy')
  })

  it('maps vowels and consonants pools', () => {
    const vowelsConfig = generateLocalConfig('pop only vowel letters')
    expect(vowelsConfig.letters.pool).toBe('vowels')

    const consonantsConfig = generateLocalConfig('collect consonant letters')
    expect(consonantsConfig.letters.pool).toBe('consonants')
  })

  it('handles speed and difficulty levels', () => {
    const fastConfig = generateLocalConfig('fast rush extreme mode')
    expect(fastConfig.letters.minSpeed).toBe(2.5)
    expect(fastConfig.rules.lives).toBe(1)

    const slowConfig = generateLocalConfig('slow zen easy relaxing mode')
    expect(slowConfig.letters.minSpeed).toBe(0.5)
    expect(slowConfig.rules.lives).toBe(5)
  })

  it('handles custom enemy types', () => {
    const ghostConfig = generateLocalConfig('spooky ghost forest')
    expect(ghostConfig.enemies.type).toBe('ghost')
    expect(ghostConfig.theme.background).toBe('forest')

    const meteorConfig = generateLocalConfig('asteroid meteor storm')
    expect(meteorConfig.enemies.type).toBe('meteor')
  })
})
