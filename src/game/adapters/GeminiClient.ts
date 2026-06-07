import { DynamicGameConfig, generateLocalConfig } from './LocalGenerator'

function mergeWithLocalHints(prompt: string, geminiConfig: DynamicGameConfig): DynamicGameConfig {
  const localHints = generateLocalConfig(prompt)
  const merged = structuredClone(geminiConfig)

  merged.theme.background = localHints.theme.background
  merged.theme.specialEffects = localHints.theme.specialEffects

  if (localHints.letters.pool !== 'all' || localHints.letters.customLetters) {
    merged.letters.pool = localHints.letters.pool
    merged.letters.customLetters = localHints.letters.customLetters
  }

  merged.letters.behavior = localHints.letters.behavior
  if (localHints.letters.gravity !== undefined) {
    merged.letters.gravity = localHints.letters.gravity
  }

  const speedChanged = localHints.letters.minSpeed !== 1.0 || localHints.letters.maxSpeed !== 2.0
  if (speedChanged) {
    merged.letters.minSpeed = localHints.letters.minSpeed
    merged.letters.maxSpeed = localHints.letters.maxSpeed
  }

  if (localHints.enemies.type !== geminiConfig.enemies.type) {
    merged.enemies.type = localHints.enemies.type
    merged.enemies.speed = localHints.enemies.speed
    merged.enemies.spawnRate = localHints.enemies.spawnRate
    merged.enemies.behavior = localHints.enemies.behavior
    merged.enemies.clickToDestroy = localHints.enemies.clickToDestroy
  }

  merged.enemies.speed = localHints.enemies.speed
  merged.enemies.spawnRate = localHints.enemies.spawnRate

  merged.controls.interaction = localHints.controls.interaction
  merged.controls.projectileType = localHints.controls.projectileType
  if (localHints.controls.ammoCount !== undefined) {
    merged.controls.ammoCount = localHints.controls.ammoCount
  }
  if (localHints.controls.reloadSpeed !== undefined) {
    merged.controls.reloadSpeed = localHints.controls.reloadSpeed
  }

  if (localHints.rules.winCondition !== geminiConfig.rules.winCondition) {
    merged.rules.winCondition = localHints.rules.winCondition
    merged.rules.winThreshold = localHints.rules.winThreshold
  }

  if (localHints.rules.lives !== 3) {
    merged.rules.lives = localHints.rules.lives
  }

  return merged
}

export async function generateGeminiConfig(prompt: string, apiKey?: string): Promise<DynamicGameConfig> {
  if (!apiKey) {
    return generateLocalConfig(prompt)
  }

  const systemInstructions = `You are a game design engine for 'ABC World', an educational alphabet game.
Your task is to take a user's prompt and output a strictly formatted JSON object representing the game parameters for a custom canvas-based mini-game.

The JSON object must strictly adhere to this TypeScript interface:

interface DynamicGameConfig {
  title: string; // Catchy, fun title (e.g., 'Volcanic Vowel Defense')
  instruction: string; // Short instructions for the screen (e.g., 'Tap the vowels before they burn!')
  theme: {
    background: 'night_sky' | 'forest' | 'space' | 'volcano' | 'underwater' | 'candy' | 'desert';
    specialEffects: 'stars' | 'bubbles' | 'snow' | 'lava_drips' | 'sparks' | 'none';
  };
  letters: {
    pool: 'all' | 'vowels' | 'consonants' | 'custom';
    customLetters?: string[]; // array of uppercase strings (e.g. ['C', 'A', 'T']) if pool is 'custom'
    minSpeed: number; // speed range: 0.5 (slow) to 4.5 (fast)
    maxSpeed: number; // must be >= minSpeed
    size: number; // drawing scale size, default 40
    behavior: 'bounce' | 'float_up' | 'fall_down' | 'sine_wave';
    gravity?: number; // if behavior is 'fall_down', between 0.01 and 0.15
  };
  enemies: {
    type: 'zombie' | 'oddbod' | 'meteor' | 'ghost' | 'none';
    count: number; // number of starting enemies on screen (default 1)
    speed: number; // speed of enemies (0.5 to 3.0)
    spawnRate: number; // spawn rate in frames (60 to 240)
    behavior: 'chase_letters' | 'chase_player' | 'float_random' | 'fall_from_top';
    clickToDestroy: boolean; // whether tapping directly destroys the enemy
  };
  controls: {
    interaction: 'tap' | 'keyboard' | 'shooter';
    projectileType?: 'water' | 'fireball' | 'laser' | 'seed'; // if interaction is 'shooter'
    ammoCount?: number; // 15 to 60, or 9999 for infinite, if interaction is 'shooter'
    reloadSpeed?: number; // frame duration cooldown (e.g. 10 to 30) if interaction is 'shooter'
  };
  rules: {
    winCondition: 'score' | 'time' | 'collect_all' | 'survival';
    winThreshold: number; // target score to win (e.g. 10 to 30)
    lives: number; // starting player lives (1 to 5)
    timeLimit?: number; // in seconds (e.g. 30 to 90) if winCondition is 'time'
  };
}

Be extremely creative, fitting the user's prompt request to these parameters. Make sure speeds are reasonable and matches the user's difficulty description. Return ONLY the JSON object. Do not include markdown code block syntax (like \`\`\`json).`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Create a game config from this user prompt: "${prompt}"`
                }
              ]
            }
          ],
          systemInstruction: {
            parts: [
              {
                text: systemInstructions
              }
            ]
          },
          generationConfig: {
            responseMimeType: 'application/json'
          }
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      throw new Error('Empty response from Gemini API')
    }

    const parsedConfig = JSON.parse(text) as DynamicGameConfig

    if (!parsedConfig.title) parsedConfig.title = 'AI Game Mode'
    if (!parsedConfig.instruction) parsedConfig.instruction = 'Pop the letters!'
    if (!parsedConfig.theme) parsedConfig.theme = { background: 'night_sky', specialEffects: 'stars' }
    if (!parsedConfig.letters) parsedConfig.letters = { pool: 'all', minSpeed: 1, maxSpeed: 2, size: 40, behavior: 'bounce' }
    if (!parsedConfig.enemies) parsedConfig.enemies = { type: 'none', count: 0, speed: 1, spawnRate: 120, behavior: 'chase_letters', clickToDestroy: true }
    if (!parsedConfig.controls) parsedConfig.controls = { interaction: 'tap' }
    if (!parsedConfig.rules) parsedConfig.rules = { winCondition: 'score', winThreshold: 20, lives: 3 }

    return mergeWithLocalHints(prompt, parsedConfig)
  } catch (err) {
    console.error('Failed to generate game via Gemini API, using local parser fallback:', err)
    return generateLocalConfig(prompt)
  }
}
