import { DynamicGameConfig, generateLocalConfig } from './LocalGenerator'

export async function generateGeminiConfig(prompt: string, apiKey?: string): Promise<DynamicGameConfig> {
  if (!apiKey) {
    console.log('No Gemini API key provided. Using local parser fallback.')
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
    
    // Validate config and apply basic defaults if fields are missing
    if (!parsedConfig.title) parsedConfig.title = 'AI Game Mode'
    if (!parsedConfig.instruction) parsedConfig.instruction = 'Pop the letters!'
    if (!parsedConfig.theme) parsedConfig.theme = { background: 'night_sky', specialEffects: 'stars' }
    if (!parsedConfig.letters) parsedConfig.letters = { pool: 'all', minSpeed: 1, maxSpeed: 2, size: 40, behavior: 'bounce' }
    if (!parsedConfig.enemies) parsedConfig.enemies = { type: 'none', count: 0, speed: 1, spawnRate: 120, behavior: 'chase_letters', clickToDestroy: true }
    if (!parsedConfig.controls) parsedConfig.controls = { interaction: 'tap' }
    if (!parsedConfig.rules) parsedConfig.rules = { winCondition: 'score', winThreshold: 20, lives: 3 }

    return parsedConfig
  } catch (err) {
    console.error('Failed to generate game via Gemini API, using local parser fallback:', err)
    return generateLocalConfig(prompt)
  }
}
