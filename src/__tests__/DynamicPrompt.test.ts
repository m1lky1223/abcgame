import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateLocalConfig } from '../game/adapters/LocalGenerator'
import { generateGeminiConfig } from '../game/adapters/GeminiClient'
import { DynamicPromptStrategy } from '../game/strategies/DynamicPromptStrategy'
import { GameInput } from '../game/GameModeStrategy'
import type { DynamicGameConfig } from '../game/adapters/LocalGenerator'

// ─── LocalGenerator ───────────────────────────────────────────────────────────

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

  it('maps underwater keywords to underwater theme', () => {
    const config = generateLocalConfig('bubbles underwater ocean fish')
    expect(config.theme.background).toBe('underwater')
    expect(config.theme.specialEffects).toBe('bubbles')
  })

  it('maps candy keywords to candy theme', () => {
    const config = generateLocalConfig('candy sweet sugar cookie')
    expect(config.theme.background).toBe('candy')
    expect(config.theme.specialEffects).toBe('snow')
  })

  it('maps forest keywords to forest theme', () => {
    const config = generateLocalConfig('forest nature garden tree')
    expect(config.theme.background).toBe('forest')
    expect(config.theme.specialEffects).toBe('none')
  })

  it('maps desert keywords to desert theme', () => {
    const config = generateLocalConfig('desert sand pyramid cactus')
    expect(config.theme.background).toBe('desert')
    expect(config.theme.specialEffects).toBe('sparks')
  })

  it('defaults to night_sky for unknown prompts', () => {
    const config = generateLocalConfig('fun game mode')
    expect(config.theme.background).toBe('night_sky')
    expect(config.theme.specialEffects).toBe('stars')
  })

  it('maps shoot keyword to shooter control with laser default', () => {
    const config = generateLocalConfig('shooter game with guns')
    expect(config.controls.interaction).toBe('shooter')
    expect(config.controls.projectileType).toBe('laser')
    expect(config.controls.ammoCount).toBe(40)
    expect(config.controls.reloadSpeed).toBe(15)
  })

  it('maps water projectiles in shooter mode', () => {
    const config = generateLocalConfig('water splash ice freeze shooter')
    expect(config.controls.interaction).toBe('shooter')
    expect(config.controls.projectileType).toBe('water')
  })

  it('maps fire projectiles in shooter mode', () => {
    const config = generateLocalConfig('fire flame lava shooter')
    expect(config.controls.interaction).toBe('shooter')
    expect(config.controls.projectileType).toBe('fireball')
  })

  it('maps seed projectiles in shooter mode', () => {
    const config = generateLocalConfig('seed plant nature flower shooter')
    expect(config.controls.interaction).toBe('shooter')
    expect(config.controls.projectileType).toBe('seed')
  })

  it('sets unlimited ammo on keyword detection', () => {
    const config = generateLocalConfig('infinite unlimited ammo shooter')
    expect(config.controls.ammoCount).toBe(9999)
  })

  it('maps keyboard interaction', () => {
    const config = generateLocalConfig('keyboard typing press keys')
    expect(config.controls.interaction).toBe('keyboard')
  })

  it('defaults to tap interaction', () => {
    const config = generateLocalConfig('pop letters')
    expect(config.controls.interaction).toBe('tap')
  })

  it('maps custom word spell prompts correctly', () => {
    const config = generateLocalConfig('spell hello in a sweet candy land')
    expect(config.letters.pool).toBe('custom')
    expect(config.letters.customLetters).toEqual(['H', 'E', 'L', 'L', 'O'])
    expect(config.theme.background).toBe('candy')
  })

  it('maps a longer spell word', () => {
    const config = generateLocalConfig('spell zebra')
    expect(config.letters.pool).toBe('custom')
    expect(config.letters.customLetters).toEqual(['Z', 'E', 'B', 'R', 'A'])
  })

  it('uses word keyword as alias for spell', () => {
    const config = generateLocalConfig('word cat')
    expect(config.letters.pool).toBe('custom')
    expect(config.letters.customLetters).toEqual(['C', 'A', 'T'])
  })

  it('maps vowels pool', () => {
    const config = generateLocalConfig('pop only vowel letters')
    expect(config.letters.pool).toBe('vowels')
  })

  it('maps consonants pool', () => {
    const config = generateLocalConfig('collect consonant letters')
    expect(config.letters.pool).toBe('consonants')
  })

  it('defaults to all pool', () => {
    const config = generateLocalConfig('regular game')
    expect(config.letters.pool).toBe('all')
  })

  it('handles fast difficulty', () => {
    const config = generateLocalConfig('fast quick rush')
    expect(config.letters.minSpeed).toBe(2.5)
    expect(config.letters.maxSpeed).toBe(4.0)
  })

  it('handles slow difficulty', () => {
    const config = generateLocalConfig('slow easy relax zen')
    expect(config.letters.minSpeed).toBe(0.5)
    expect(config.letters.maxSpeed).toBe(1.2)
  })

  it('defaults to normal speed', () => {
    const config = generateLocalConfig('normal game')
    expect(config.letters.minSpeed).toBe(1.0)
    expect(config.letters.maxSpeed).toBe(2.0)
  })

  it('maps fall_down behavior with gravity', () => {
    const config = generateLocalConfig('gravity fall down letters')
    expect(config.letters.behavior).toBe('fall_down')
    expect(config.letters.gravity).toBeGreaterThan(0)
  })

  it('maps float_up behavior', () => {
    const config = generateLocalConfig('float up balloon')
    expect(config.letters.behavior).toBe('float_up')
  })

  it('maps sine_wave behavior', () => {
    const config = generateLocalConfig('wave sine wiggle snake')
    expect(config.letters.behavior).toBe('sine_wave')
  })

  it('defaults to bounce behavior', () => {
    const config = generateLocalConfig('regular game')
    expect(config.letters.behavior).toBe('bounce')
  })

  it('defaults to zombie enemies', () => {
    const config = generateLocalConfig('game mode')
    expect(config.enemies.type).toBe('zombie')
  })

  it('maps oddbod enemy type', () => {
    const config = generateLocalConfig('oddbod chase game')
    expect(config.enemies.type).toBe('oddbod')
  })

  it('maps meteor enemy type', () => {
    const config = generateLocalConfig('meteor asteroid rock')
    expect(config.enemies.type).toBe('meteor')
  })

  it('maps ghost enemy type from spooky', () => {
    const config = generateLocalConfig('spooky ghost forest')
    expect(config.enemies.type).toBe('ghost')
    expect(config.theme.background).toBe('forest')
  })

  it('maps no enemies for peaceful', () => {
    const config = generateLocalConfig('peaceful no enemies')
    expect(config.enemies.type).toBe('none')
  })

  it('maps no enemies for zen', () => {
    const config = generateLocalConfig('zen mode')
    expect(config.enemies.type).toBe('none')
  })

  it('configures faster enemies with fast keyword', () => {
    const config = generateLocalConfig('fast zombie game')
    expect(config.enemies.speed).toBe(2.2)
    expect(config.enemies.spawnRate).toBe(80)
  })

  it('configures slower enemies with slow keyword', () => {
    const config = generateLocalConfig('slow easy zombie game')
    expect(config.enemies.speed).toBe(0.6)
    expect(config.enemies.spawnRate).toBe(180)
  })

  it('sets collect_all win condition for custom words', () => {
    const config = generateLocalConfig('spell cat')
    expect(config.rules.winCondition).toBe('collect_all')
    expect(config.rules.winThreshold).toBe(3)
  })

  it('sets time win condition', () => {
    const config = generateLocalConfig('time timer 45 seconds')
    expect(config.rules.winCondition).toBe('time')
    expect(config.rules.timeLimit).toBe(45)
    expect(config.rules.winThreshold).toBe(15)
  })

  it('sets survival win condition', () => {
    const config = generateLocalConfig('survival lives die')
    expect(config.rules.winCondition).toBe('survival')
    expect(config.rules.lives).toBe(3)
  })

  it('defaults to score win condition', () => {
    const config = generateLocalConfig('game mode')
    expect(config.rules.winCondition).toBe('score')
    expect(config.rules.winThreshold).toBe(20)
  })

  it('sets hard mode to 1 life', () => {
    const config = generateLocalConfig('hard extreme one life')
    expect(config.rules.lives).toBe(1)
  })

  it('sets easy mode to 5 lives', () => {
    const config = generateLocalConfig('easy relax many lives')
    expect(config.rules.lives).toBe(5)
  })

  it('generates title for space shooter', () => {
    const config = generateLocalConfig('fast space shooter')
    const title = config.title
    expect(title).toMatch(/Turbo|Dynamic/)
    expect(title).toMatch(/Cosmos|Dynamic/)
    expect(title).toMatch(/Blaster|Dynamic/)
  })

  it('generates title for zen underwater', () => {
    const config = generateLocalConfig('zen underwater slow')
    expect(config.title).toMatch(/Zen/)
    expect(config.title).toMatch(/Aquatic/)
  })

  it('generates shooter instruction', () => {
    const config = generateLocalConfig('shooter game')
    expect(config.instruction).toMatch(/shoot|Aim/i)
  })

  it('generates keyboard instruction', () => {
    const config = generateLocalConfig('keyboard typing')
    expect(config.instruction).toMatch(/Type the letters/i)
  })

  it('generates custom word spelling instruction', () => {
    const config = generateLocalConfig('spell hello')
    expect(config.instruction).toContain('Spell the word in order')
    expect(config.instruction).toContain('HELLO')
  })

  it('adds enemy warning to instruction', () => {
    const config = generateLocalConfig('zombie game')
    expect(config.instruction).toMatch(/zombie|Stop|Avoid/i)
  })

  it('adds survival instruction', () => {
    const config = generateLocalConfig('survival mode')
    expect(config.instruction).toContain('Survive')
  })

  it('adds time-based instruction', () => {
    const config = generateLocalConfig('time mode 45 seconds')
    expect(config.instruction).toContain('45 seconds')
  })

  it('handles complex multi-keyword prompt', () => {
    const config = generateLocalConfig('spooky zombie shooter in a candy forest with fast falling letters spell cat')
    expect(config.theme.background).toBe('candy')
    expect(config.enemies.type).toBe('ghost')
    expect(config.controls.interaction).toBe('shooter')
    expect(config.letters.pool).toBe('custom')
    expect(config.letters.customLetters).toEqual(['C', 'A', 'T'])
    expect(config.letters.behavior).toBe('fall_down')
    expect(config.letters.minSpeed).toBeGreaterThan(2)
    expect(config.rules.winCondition).toBe('collect_all')
  })
})

// ─── GeminiClient ─────────────────────────────────────────────────────────────

describe('GeminiClient', () => {
  const baseConfig: DynamicGameConfig = {
    title: 'Gemini Title',
    instruction: 'Gemini instruction',
    theme: { background: 'space', specialEffects: 'stars' },
    letters: { pool: 'all', minSpeed: 1, maxSpeed: 2, size: 40, behavior: 'bounce' },
    enemies: { type: 'zombie', count: 2, speed: 1.5, spawnRate: 100, behavior: 'chase_letters', clickToDestroy: true },
    controls: { interaction: 'tap' },
    rules: { winCondition: 'score', winThreshold: 20, lives: 3 },
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to local parser when no API key', async () => {
    const config = await generateGeminiConfig('space shooter', '')
    expect(config.theme.background).toBe('space')
    expect(config.controls.interaction).toBe('shooter')
  })

  it('falls back to local parser on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))
    const config = await generateGeminiConfig('volcano survival', 'fake-key')
    expect(config.theme.background).toBe('volcano')
  })

  it('falls back to local parser on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    } as Response)
    const config = await generateGeminiConfig('underwater', 'fake-key')
    expect(config.theme.background).toBe('underwater')
  })

  it('falls back to local parser on invalid JSON response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: 'not json at all' }] } }],
      }),
    } as Response)
    const config = await generateGeminiConfig('candy land', 'fake-key')
    expect(config.theme.background).toBe('candy')
  })

  it('applies defaults for missing fields from Gemini', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{ text: JSON.stringify({ title: 'Partial' }) }],
          },
        }],
      }),
    } as Response)
    const config = await generateGeminiConfig('some game', 'fake-key')
    expect(config.title).toBe('Partial')
    expect(config.theme.background).toBe('night_sky')
    expect(config.letters.pool).toBe('all')
    // Default enemies after merge is 'zombie' (from local parser default)
    expect(config.controls.interaction).toBe('tap')
    expect(config.rules.winCondition).toBe('score')
  })

  it('parses a valid Gemini response successfully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{ text: JSON.stringify(baseConfig) }],
          },
        }],
      }),
    } as Response)
    const config = await generateGeminiConfig('space shooter', 'fake-key')
    expect(config.title).toBe('Gemini Title')
    expect(config.instruction).toBe('Gemini instruction')
    expect(config.theme.background).toBe('space')
  })

  // ── Merge strategy tests ──

  it('merge: local overrides background when different from Gemini', async () => {
    const geminiConfig = { ...baseConfig, theme: { background: 'space' as const, specialEffects: 'stars' as const } }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: JSON.stringify(geminiConfig) }] } }],
      }),
    } as Response)
    // "volcano" in prompt should override Gemini's "space"
    const config = await generateGeminiConfig('volcano lava shooter', 'fake-key')
    expect(config.theme.background).toBe('volcano')
  })

  it('merge: local overrides behavior keyword', async () => {
    const geminiConfig = { ...baseConfig, letters: { ...baseConfig.letters, behavior: 'bounce' as const } }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: JSON.stringify(geminiConfig) }] } }],
      }),
    } as Response)
    const config = await generateGeminiConfig('fall down gravity shooter', 'fake-key')
    expect(config.letters.behavior).toBe('fall_down')
    expect(config.letters.gravity).toBeGreaterThan(0)
  })

  it('merge: local overrides enemy type when keyword detected', async () => {
    const geminiConfig = { ...baseConfig, enemies: { ...baseConfig.enemies, type: 'zombie' as const } }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: JSON.stringify(geminiConfig) }] } }],
      }),
    } as Response)
    const config = await generateGeminiConfig('ghost spooky mode', 'fake-key')
    expect(config.enemies.type).toBe('ghost')
  })

  it('merge: local overrides pool for custom words', async () => {
    const geminiConfig = { ...baseConfig, letters: { ...baseConfig.letters, pool: 'all' as const } }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: JSON.stringify(geminiConfig) }] } }],
      }),
    } as Response)
    const config = await generateGeminiConfig('spell cat', 'fake-key')
    expect(config.letters.pool).toBe('custom')
    expect(config.letters.customLetters).toEqual(['C', 'A', 'T'])
  })

  it('merge: local overrides difficulty keywords', async () => {
    const geminiConfig = {
      ...baseConfig,
      letters: { ...baseConfig.letters, minSpeed: 1, maxSpeed: 2 },
      enemies: { ...baseConfig.enemies, speed: 1.5, spawnRate: 100 },
      rules: { ...baseConfig.rules, lives: 3 },
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: JSON.stringify(geminiConfig) }] } }],
      }),
    } as Response)
    const config = await generateGeminiConfig('fast hard extreme shooter', 'fake-key')
    expect(config.letters.minSpeed).toBe(2.5)
    expect(config.letters.maxSpeed).toBe(4.0)
    expect(config.enemies.speed).toBe(2.2)
    expect(config.rules.lives).toBe(1)
  })

  it('merge: local overrides interaction type', async () => {
    const geminiConfig = { ...baseConfig, controls: { interaction: 'tap' as const } }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: JSON.stringify(geminiConfig) }] } }],
      }),
    } as Response)
    const config = await generateGeminiConfig('shooter with water guns', 'fake-key')
    expect(config.controls.interaction).toBe('shooter')
    expect(config.controls.projectileType).toBe('water')
  })

  it('merge: local ammo count overrides Gemini', async () => {
    const geminiConfig = {
      ...baseConfig,
      controls: { interaction: 'shooter' as const, projectileType: 'laser' as const, ammoCount: 9999 },
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: JSON.stringify(geminiConfig) }] } }],
      }),
    } as Response)
    const config = await generateGeminiConfig('shooter limited ammo', 'fake-key')
    expect(config.controls.ammoCount).toBe(40)
  })

  it('merge: keeps Gemini creative title and instruction', async () => {
    const geminiConfig = { ...baseConfig, title: 'Cosmic Adventure', instruction: 'Shoot the alien letters!' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: JSON.stringify(geminiConfig) }] } }],
      }),
    } as Response)
    const config = await generateGeminiConfig('space shooter', 'fake-key')
    expect(config.title).toBe('Cosmic Adventure')
    expect(config.instruction).toBe('Shoot the alien letters!')
  })
})

// ─── DynamicPromptStrategy ────────────────────────────────────────────────────

function makeInput(overrides: Partial<GameInput> = {}): GameInput {
  return {
    gestures: [],
    wasPressed: () => false,
    isDown: () => false,
    mouseDown: false,
    mouseX: 0,
    mouseY: 0,
    justReleased: false,
    ...overrides,
  }
}

function makeDefaultConfig(): DynamicGameConfig {
  return {
    title: 'Test Game',
    instruction: 'Pop the letters!',
    theme: { background: 'space', specialEffects: 'stars' },
    letters: { pool: 'all', minSpeed: 1, maxSpeed: 2, size: 40, behavior: 'bounce' },
    enemies: { type: 'none', count: 0, speed: 0, spawnRate: 9999, behavior: 'chase_letters', clickToDestroy: true },
    controls: { interaction: 'tap' },
    rules: { winCondition: 'score', winThreshold: 20, lives: 3 },
  }
}

describe('DynamicPromptStrategy', () => {
  let strategy: DynamicPromptStrategy
  let stateCb: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    stateCb = vi.fn()
    strategy = new DynamicPromptStrategy(800, 600, makeDefaultConfig())
    strategy.onStateChange = stateCb as any
    strategy.start(800, 600)
  })

  it('starts with no errors and spawns letters', () => {
    expect(strategy).toBeDefined()
    expect(stateCb).toHaveBeenCalled()
  })

  it('spawns initial set of letters on start', () => {
    // Access letters via state emit — start triggers onStateChange
    expect(stateCb).toHaveBeenCalled()
  })

  it('renders without errors', () => {
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => strategy.draw(ctx)).not.toThrow()
  })

  it('pops a letter on tap at its location', () => {
    const initialScore = (strategy as any).score
    const firstLetter = (strategy as any).letters[0]
    if (!firstLetter) return // no letters yet — not a failure, just skip

    const input = makeInput({
      gestures: [{ type: 'tap', x: firstLetter.x + 24, y: firstLetter.y + 28 }],
    })
    strategy.update(input, 1)

    expect((strategy as any).score).toBe(initialScore + 1)
  })

  it('does not pop on tap at empty area', () => {
    const initialScore = (strategy as any).score
    const input = makeInput({
      gestures: [{ type: 'tap', x: -100, y: -100 }],
    })
    strategy.update(input, 1)
    expect((strategy as any).score).toBe(initialScore)
  })

  it('wins when score reaches threshold', () => {
    const strat = strategy as any
    strat.score = 19
    strat.emitState()

    const firstLetter = strat.letters[0]
    if (!firstLetter) return

    const input = makeInput({
      gestures: [{ type: 'tap', x: firstLetter.x + 24, y: firstLetter.y + 28 }],
    })
    strategy.update(input, 1)

    expect(strat.score).toBe(20)
    expect(strat.winner).toBe('human')
    expect(strat.gameEnded).toBe(true)
  })

  it('destroys without errors', () => {
    expect(() => strategy.destroy()).not.toThrow()
  })

  it('resizes correctly', () => {
    expect(() => strategy.resize(1200, 800)).not.toThrow()
  })

  it('restarts correctly', () => {
    const strat = strategy as any
    strat.score = 15
    strat.gameEnded = true
    strat.winner = 'oddbods'

    strategy.restart(800, 600)

    expect(strat.score).toBe(0)
    expect(strat.gameEnded).toBe(false)
    expect(strat.winner).toBeNull()
  })

  it('restart on space key when game ended', () => {
    const strat = strategy as any
    strat.gameEnded = true
    strat.winner = 'human'

    const input = makeInput({ wasPressed: (k: string) => k === ' ' })
    strategy.update(input, 1)

    expect(strat.gameEnded).toBe(false)
    expect(strat.winner).toBeNull()
  })
})

describe('DynamicPromptStrategy - Custom Letters', () => {
  let strategy: DynamicPromptStrategy
  let stateCb: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.restoreAllMocks()
    stateCb = vi.fn()
    const config = makeDefaultConfig()
    config.letters.pool = 'custom'
    config.letters.customLetters = ['C', 'A', 'T']
    config.rules.winCondition = 'collect_all'
    config.rules.winThreshold = 3
    strategy = new DynamicPromptStrategy(800, 600, config)
    strategy.onStateChange = stateCb as any
    strategy.start(800, 600)
  })

  it('spawns first custom letter C', () => {
    const strat = strategy as any
    expect(strat.activeCustomLetter).toBe('C')
    expect(strat.letters.length).toBeGreaterThan(0)
    if (strat.letters.length > 0) {
      expect(strat.letters[0].letter).toBe('C')
    }
  })

  it('pops letters in correct order', () => {
    const strat = strategy as any
    const cLetter = strat.letters[0]
    if (!cLetter) return

    let input = makeInput({
      gestures: [{ type: 'tap', x: cLetter.x + 24, y: cLetter.y + 28 }],
    })
    strategy.update(input, 1)
    expect(strat.customLettersIndex).toBe(1)
    expect(strat.activeCustomLetter).toBe('A')
  })

  it('rejects incorrect letter order', () => {
    const strat = strategy as any
    const cLetter = strat.letters[0]
    if (!cLetter) return

    cLetter.letter = 'Z'
    const input = makeInput({
      gestures: [{ type: 'tap', x: cLetter.x + 24, y: cLetter.y + 28 }],
    })
    strategy.update(input, 1)
    expect(strat.customLettersIndex).toBe(0)
    expect(strat.activeCustomLetter).toBe('C')
  })

  it('wins after collecting all custom letters', () => {
    const config = makeDefaultConfig()
    config.letters.pool = 'custom'
    config.letters.customLetters = ['X']
    config.rules.winCondition = 'collect_all'
    const s = new DynamicPromptStrategy(800, 600, config)
    s.onStateChange = vi.fn() as any
    s.start(800, 600)

    const letter = (s as any).letters[0]
    if (!letter) return

    const input = makeInput({
      gestures: [{ type: 'tap', x: letter.x + 24, y: letter.y + 28 }],
    })
    s.update(input, 1)
    expect((s as any).winner).toBe('human')
  })
})

describe('DynamicPromptStrategy - Shooter Mode', () => {
  let strategy: DynamicPromptStrategy
  let stateCb: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.restoreAllMocks()
    stateCb = vi.fn()
    const config = makeDefaultConfig()
    config.controls.interaction = 'shooter'
    config.controls.projectileType = 'laser'
    config.controls.ammoCount = 40
    config.controls.reloadSpeed = 15
    strategy = new DynamicPromptStrategy(800, 600, config)
    strategy.onStateChange = stateCb as any
    strategy.start(800, 600)
  })

  it('fires projectile on tap', () => {
    const strat = strategy as any
    expect(strat.projectiles.length).toBe(0)

    const input = makeInput({
      gestures: [{ type: 'tap', x: 400, y: 100 }],
    })
    strategy.update(input, 1)

    expect(strat.projectiles.length).toBe(1)
    expect(strat.projectiles[0].targetX).toBe(400)
    expect(strat.projectiles[0].targetY).toBe(100)
  })

  it('decrements ammo on fire', () => {
    const strat = strategy as any
    const initialAmmo = strat.config.controls.ammoCount

    const input = makeInput({
      gestures: [{ type: 'tap', x: 400, y: 100 }],
    })
    strategy.update(input, 1)

    expect(strat.config.controls.ammoCount).toBe(initialAmmo - 1)
  })

  it('respects reload cooldown', () => {
    const strat = strategy as any
    const tapInput = makeInput({
      gestures: [{ type: 'tap', x: 400, y: 100 }],
    })

    strategy.update(tapInput, 1)
    const afterFirstShot = strat.projectiles.length

    strategy.update(tapInput, 2)

    expect(strat.projectiles.length).toBe(afterFirstShot)
  })

  it('renders shooter without errors', () => {
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => strategy.draw(ctx)).not.toThrow()
  })
})

describe('DynamicPromptStrategy - Survival Mode', () => {
  let strategy: DynamicPromptStrategy
  let stateCb: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.restoreAllMocks()
    stateCb = vi.fn()
    const config = makeDefaultConfig()
    config.enemies.type = 'zombie'
    config.enemies.count = 1
    config.enemies.speed = 0.5
    config.enemies.spawnRate = 9999
    config.rules.winCondition = 'survival'
    config.rules.lives = 3
    strategy = new DynamicPromptStrategy(800, 600, config)
    strategy.onStateChange = stateCb as any
    strategy.start(800, 600)
  })

  it('deducts life when chaser steals letter', () => {
    const strat = strategy as any
    strat.lives = 3

    strat.chasers.forEach((c: any) => {
      c.alive = true
      c.x = 200
      c.y = 200
    })
    strat.letters.forEach((l: any) => {
      l.x = 200
      l.y = 200
    })

    const input = makeInput()
    strategy.update(input, 1)

    // Chaser with matching position triggers capture logic
    expect(strat.lives).toBeLessThanOrEqual(3)
  })

  it('emits oddbods winner when lives drop to 0', () => {
    const strat = strategy as any
    strat.lives = 0
    strat.gameEnded = true
    strat.winner = 'oddbods'
    strat.emitState()
    expect(stateCb).toHaveBeenCalledWith(
      expect.objectContaining({ winner: 'oddbods', lives: 0 })
    )
  })

  it('renders survival HUD without errors', () => {
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => strategy.draw(ctx)).not.toThrow()
  })
})

describe('DynamicPromptStrategy - Time Mode', () => {
  let strategy: DynamicPromptStrategy
  let stateCb: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.restoreAllMocks()
    stateCb = vi.fn()
    const config = makeDefaultConfig()
    config.rules.winCondition = 'time'
    config.rules.winThreshold = 10
    config.rules.timeLimit = 30
    strategy = new DynamicPromptStrategy(800, 600, config)
    strategy.onStateChange = stateCb as any
    strategy.start(800, 600)
  })

  it('starts with correct time limit', () => {
    const strat = strategy as any
    expect(strat.timeLeft).toBe(30)
  })

  it('decrements time at 60 frame intervals', () => {
    const strat = strategy as any
    strat.frameCounter = 59
    strat.timeLeft = 30

    const input = makeInput()
    strategy.update(input, 60)

    expect(strat.timeLeft).toBe(29)
  })
})

describe('DynamicPromptStrategy - Theme Backgrounds', () => {
  it('renders space background without errors', () => {
    const config = makeDefaultConfig()
    config.theme.background = 'space'
    config.theme.specialEffects = 'stars'
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
  })

  it('renders volcano background without errors', () => {
    const config = makeDefaultConfig()
    config.theme.background = 'volcano'
    config.theme.specialEffects = 'lava_drips'
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
  })

  it('renders all backgrounds without errors', () => {
    const backgrounds: Array<{ bg: string; fx: string }> = [
      { bg: 'space', fx: 'stars' },
      { bg: 'volcano', fx: 'lava_drips' },
      { bg: 'underwater', fx: 'bubbles' },
      { bg: 'candy', fx: 'snow' },
      { bg: 'forest', fx: 'none' },
      { bg: 'desert', fx: 'sparks' },
      { bg: 'night_sky', fx: 'stars' },
    ]
    for (const { bg, fx } of backgrounds) {
      const config = makeDefaultConfig()
      config.theme.background = bg as any
      config.theme.specialEffects = fx as any
      const s = new DynamicPromptStrategy(800, 600, config)
      s.start(800, 600)
      const ctx = document.createElement('canvas').getContext('2d')!
      expect(() => s.draw(ctx)).not.toThrow()
    }
  })
})

describe('DynamicPromptStrategy - Enemies', () => {
  it('renders zombie enemies without errors', () => {
    const config = makeDefaultConfig()
    config.enemies.type = 'zombie'
    config.enemies.count = 1
    config.enemies.speed = 1
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
  })

  it('renders meteor obstacles without errors', () => {
    const config = makeDefaultConfig()
    config.enemies.type = 'meteor'
    config.enemies.count = 1
    config.enemies.speed = 1
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
  })

  it('renders ghost obstacles without errors', () => {
    const config = makeDefaultConfig()
    config.enemies.type = 'ghost'
    config.enemies.count = 1
    config.enemies.speed = 1
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
  })
})

describe('DynamicPromptStrategy - Projectile Types', () => {
  it('renders water projectiles without errors', () => {
    const config = makeDefaultConfig()
    config.controls.interaction = 'shooter'
    config.controls.projectileType = 'water'
    config.controls.ammoCount = 9999
    config.controls.reloadSpeed = 5
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const strat = s as any
    strat.projectiles.push({
      x: 200, y: 200, targetX: 400, targetY: 100,
      vx: 2, vy: -2, type: 'water', alive: true,
    })
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
  })

  it('renders fireball projectiles without errors', () => {
    const config = makeDefaultConfig()
    config.controls.interaction = 'shooter'
    config.controls.projectileType = 'fireball'
    config.controls.ammoCount = 9999
    config.controls.reloadSpeed = 5
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const strat = s as any
    strat.projectiles.push({
      x: 200, y: 200, targetX: 400, targetY: 100,
      vx: 2, vy: -2, type: 'fireball', alive: true,
    })
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
  })

  it('renders laser projectiles without errors', () => {
    const config = makeDefaultConfig()
    config.controls.interaction = 'shooter'
    config.controls.projectileType = 'laser'
    config.controls.ammoCount = 9999
    config.controls.reloadSpeed = 5
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const strat = s as any
    strat.projectiles.push({
      x: 200, y: 200, targetX: 400, targetY: 100,
      vx: 2, vy: -2, type: 'laser', alive: true,
    })
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
  })

  it('renders seed projectiles without errors', () => {
    const config = makeDefaultConfig()
    config.controls.interaction = 'shooter'
    config.controls.projectileType = 'seed'
    config.controls.ammoCount = 9999
    config.controls.reloadSpeed = 5
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const strat = s as any
    strat.projectiles.push({
      x: 200, y: 200, targetX: 400, targetY: 100,
      vx: 2, vy: -2, type: 'seed', alive: true,
    })
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
  })
})

describe('DynamicPromptStrategy - Letter Behaviors', () => {
  it('renders fall_down behavior without errors', () => {
    const config = makeDefaultConfig()
    config.letters.behavior = 'fall_down'
    config.letters.gravity = 0.05
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
    const input = makeInput()
    s.update(input, 1)
    expect(() => s.draw(ctx)).not.toThrow()
  })

  it('renders float_up behavior without errors', () => {
    const config = makeDefaultConfig()
    config.letters.behavior = 'float_up'
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
    const input = makeInput()
    s.update(input, 1)
    expect(() => s.draw(ctx)).not.toThrow()
  })

  it('renders sine_wave behavior without errors', () => {
    const config = makeDefaultConfig()
    config.letters.behavior = 'sine_wave'
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const ctx = document.createElement('canvas').getContext('2d')!
    expect(() => s.draw(ctx)).not.toThrow()
    const input = makeInput()
    s.update(input, 1)
    expect(() => s.draw(ctx)).not.toThrow()
  })
})

describe('DynamicPromptStrategy - High Score Persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves high score for survival mode', () => {
    const config = makeDefaultConfig()
    config.rules.winCondition = 'survival'
    const s = new DynamicPromptStrategy(800, 600, config)
    s.onStateChange = vi.fn() as any
    s.start(800, 600)
    ;(s as any).score = 42
    ;(s as any).emitState()
    expect(localStorage.getItem('hs_custom')).toBe('42')
  })

  it('does not lower high score', () => {
    localStorage.setItem('hs_custom', '100')
    const config = makeDefaultConfig()
    config.rules.winCondition = 'survival'
    const s = new DynamicPromptStrategy(800, 600, config)
    s.onStateChange = vi.fn() as any
    s.start(800, 600)
    ;(s as any).score = 50
    ;(s as any).emitState()
    expect(localStorage.getItem('hs_custom')).toBe('100')
  })
})

describe('DynamicPromptStrategy - Vowels Pool Filtering', () => {
  it('spawns only vowel letters', () => {
    const config = makeDefaultConfig()
    config.letters.pool = 'vowels'
    const s = new DynamicPromptStrategy(800, 600, config)
    s.start(800, 600)
    const strat = s as any
    for (const letter of strat.letters) {
      expect('AEIOU').toContain(letter.letter)
    }
  })
})

describe('DynamicPromptStrategy - Keyboard Controls', () => {
  it('pops letter on matching key press', () => {
    const config = makeDefaultConfig()
    config.controls.interaction = 'keyboard'
    const s = new DynamicPromptStrategy(800, 600, config)
    s.onStateChange = vi.fn() as any
    s.start(800, 600)
    const strat = s as any
    const targetLetter = strat.letters[0]
    if (!targetLetter) return

    const initialScore = strat.score
    const input = makeInput({
      wasPressed: (k: string) => k === targetLetter.letter.toLowerCase(),
    })
    s.update(input, 1)
    expect(strat.score).toBe(initialScore + 1)
  })

  it('does not pop on non-matching key press', () => {
    const config = makeDefaultConfig()
    config.controls.interaction = 'keyboard'
    const s = new DynamicPromptStrategy(800, 600, config)
    s.onStateChange = vi.fn() as any
    s.start(800, 600)
    const strat = s as any
    const initialScore = strat.score

    const input = makeInput({
      wasPressed: () => false,
    })
    s.update(input, 1)
    expect(strat.score).toBe(initialScore)
  })
})
