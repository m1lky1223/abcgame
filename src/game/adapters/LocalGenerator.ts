export interface DynamicGameConfig {
  title: string
  instruction: string
  theme: {
    background: 'night_sky' | 'forest' | 'space' | 'volcano' | 'underwater' | 'candy' | 'desert'
    specialEffects: 'stars' | 'bubbles' | 'snow' | 'lava_drips' | 'sparks' | 'none'
  }
  letters: {
    pool: 'all' | 'vowels' | 'consonants' | 'custom'
    customLetters?: string[]
    minSpeed: number
    maxSpeed: number
    size: number
    behavior: 'bounce' | 'float_up' | 'fall_down' | 'sine_wave'
    gravity?: number
  }
  enemies: {
    type: 'zombie' | 'oddbod' | 'meteor' | 'ghost' | 'none'
    count: number
    speed: number
    spawnRate: number // interval in frames
    behavior: 'chase_letters' | 'chase_player' | 'float_random' | 'fall_from_top'
    clickToDestroy: boolean
  }
  controls: {
    interaction: 'tap' | 'keyboard' | 'shooter'
    projectileType?: 'water' | 'fireball' | 'laser' | 'seed'
    ammoCount?: number
    reloadSpeed?: number // frame duration
  }
  rules: {
    winCondition: 'score' | 'time' | 'collect_all' | 'survival'
    winThreshold: number
    lives: number
    timeLimit?: number
  }
}

export function generateLocalConfig(prompt: string): DynamicGameConfig {
  const p = prompt.toLowerCase()

  // 1. Theme Configuration
  let background: DynamicGameConfig['theme']['background'] = 'night_sky'
  let specialEffects: DynamicGameConfig['theme']['specialEffects'] = 'stars'

  if (p.includes('space') || p.includes('star') || p.includes('galaxy') || p.includes('cosmic') || p.includes('rocket')) {
    background = 'space'
    specialEffects = 'stars'
  } else if (p.includes('volcano') || p.includes('lava') || p.includes('fire') || p.includes('spark') || p.includes('magma') || p.includes('burn')) {
    background = 'volcano'
    specialEffects = 'lava_drips'
  } else if (p.includes('sea') || p.includes('water') || p.includes('ocean') || p.includes('bubble') || p.includes('underwater') || p.includes('aquarium') || p.includes('fish')) {
    background = 'underwater'
    specialEffects = 'bubbles'
  } else if (p.includes('candy') || p.includes('sweet') || p.includes('sugar') || p.includes('cookie') || p.includes('bakery') || p.includes('chocolate') || p.includes('cupcake')) {
    background = 'candy'
    specialEffects = 'snow'
  } else if (p.includes('forest') || p.includes('tree') || p.includes('jungle') || p.includes('nature') || p.includes('garden') || p.includes('leaf') || p.includes('plant')) {
    background = 'forest'
    specialEffects = 'none'
  } else if (p.includes('desert') || p.includes('sand') || p.includes('pyramid') || p.includes('dune') || p.includes('cactus')) {
    background = 'desert'
    specialEffects = 'sparks'
  }

  // 2. Control Configuration
  let interaction: DynamicGameConfig['controls']['interaction'] = 'tap'
  let projectileType: DynamicGameConfig['controls']['projectileType'] = undefined
  let ammoCount: number | undefined = undefined
  let reloadSpeed: number | undefined = undefined

  if (p.includes('shoot') || p.includes('gun') || p.includes('laser') || p.includes('fireball') || p.includes('projectile') || p.includes('blast') || p.includes('weapon') || p.includes('cannon') || p.includes('gallery')) {
    interaction = 'shooter'
    projectileType = 'laser'
    ammoCount = 40
    reloadSpeed = 15

    if (p.includes('water') || p.includes('splash') || p.includes('ice') || p.includes('freeze')) {
      projectileType = 'water'
    } else if (p.includes('fire') || p.includes('flame') || p.includes('lava') || p.includes('fireball')) {
      projectileType = 'fireball'
    } else if (p.includes('seed') || p.includes('plant') || p.includes('nature') || p.includes('flower')) {
      projectileType = 'seed'
    }

    if (p.includes('unlimited') || p.includes('infinite') || p.includes('unlimit')) {
      ammoCount = 9999
    }
  } else if (p.includes('keyboard') || p.includes('type') || p.includes('key') || p.includes('press') || p.includes('typing')) {
    interaction = 'keyboard'
  }

  // 3. Letters Configuration
  let pool: DynamicGameConfig['letters']['pool'] = 'all'
  let customLetters: string[] | undefined = undefined

  // Check for "spell [word]" or "word [word]"
  const spellMatch = p.match(/(?:spell|word)\s+([a-z]+)/)
  if (spellMatch && spellMatch[1]) {
    pool = 'custom'
    customLetters = spellMatch[1].toUpperCase().split('')
  } else if (p.includes('vowel')) {
    pool = 'vowels'
  } else if (p.includes('consonant')) {
    pool = 'consonants'
  }

  let minSpeed = 1.0
  let maxSpeed = 2.0
  let letterBehavior: DynamicGameConfig['letters']['behavior'] = 'bounce'
  let gravity: number | undefined = undefined

  if (p.includes('fast') || p.includes('speed') || p.includes('quick') || p.includes('rush') || p.includes('hard') || p.includes('chaos')) {
    minSpeed = 2.5
    maxSpeed = 4.0
  } else if (p.includes('slow') || p.includes('easy') || p.includes('relax') || p.includes('zen') || p.includes('calm')) {
    minSpeed = 0.5
    maxSpeed = 1.2
  }

  if (p.includes('gravity') || p.includes('fall') || p.includes('drop') || p.includes('down')) {
    letterBehavior = 'fall_down'
    gravity = minSpeed * 0.04
  } else if (p.includes('float') || p.includes('rise') || p.includes('up') || p.includes('balloon')) {
    letterBehavior = 'float_up'
  } else if (p.includes('wave') || p.includes('sine') || p.includes('wiggle') || p.includes('snake')) {
    letterBehavior = 'sine_wave'
  }

  // 4. Enemies Configuration
  let enemyType: DynamicGameConfig['enemies']['type'] = 'zombie'
  let enemySpeed = 1.2
  let spawnRate = 120 // frame interval
  let clickToDestroy = true

  if (p.includes('no enemy') || p.includes('no enemies') || p.includes('without enemies') || p.includes('peaceful') || p.includes('zen') || p.includes('safe') || p.includes('calm')) {
    enemyType = 'none'
  } else if (p.includes('oddbod') || p.includes('bod')) {
    enemyType = 'oddbod'
  } else if (p.includes('meteor') || p.includes('asteroid') || p.includes('rock') || p.includes('stone') || p.includes('space rock')) {
    enemyType = 'meteor'
  } else if (p.includes('ghost') || p.includes('spooky') || p.includes('phantom') || p.includes('spirit') || p.includes('scary')) {
    enemyType = 'ghost'
  }

  if (enemyType !== 'none') {
    if (p.includes('fast') || p.includes('speed') || p.includes('hard') || p.includes('rush')) {
      enemySpeed = 2.2
      spawnRate = 80
    } else if (p.includes('slow') || p.includes('easy') || p.includes('relax') || p.includes('zen')) {
      enemySpeed = 0.6
      spawnRate = 180
    }
  }

  let enemyBehavior: DynamicGameConfig['enemies']['behavior'] = 'chase_letters'
  if (enemyType === 'meteor') {
    enemyBehavior = 'fall_from_top'
    clickToDestroy = interaction === 'tap' // only direct tap to destroy if we are tap controls, shooter hits them with bullets
  } else if (enemyType === 'ghost') {
    enemyBehavior = 'float_random'
  } else if (p.includes('chase me') || p.includes('follow me') || p.includes('chase player') || p.includes('kill me') || p.includes('attack player')) {
    enemyBehavior = 'chase_player'
  }

  // 5. Rules Configuration
  let winCondition: DynamicGameConfig['rules']['winCondition'] = 'score'
  let winThreshold = 20
  let lives = 3
  let timeLimit: number | undefined = undefined

  if (pool === 'custom') {
    winCondition = 'collect_all'
    winThreshold = customLetters ? customLetters.length : 10
  } else if (p.includes('time') || p.includes('timer') || p.includes('seconds') || p.includes('clock') || p.includes('countdown')) {
    winCondition = 'time'
    timeLimit = 45
    winThreshold = 15 // score to reach within limit
  } else if (p.includes('survival') || p.includes('live') || p.includes('health') || p.includes('die') || p.includes('survive')) {
    winCondition = 'survival'
    lives = 3
  }

  if (p.includes('hard') || p.includes('extreme') || p.includes('one life')) {
    lives = 1
  } else if (p.includes('easy') || p.includes('relax') || p.includes('many lives')) {
    lives = 5
  }

  // 6. Generate Title and Instruction
  let title = 'Custom Game Mode'
  const adjective = p.includes('fast') ? 'Turbo' : p.includes('slow') || p.includes('zen') ? 'Zen' : p.includes('spooky') || p.includes('ghost') ? 'Spooky' : 'Dynamic'
  const themeName = background === 'space' ? 'Cosmos' : background === 'volcano' ? 'Magma' : background === 'underwater' ? 'Aquatic' : background === 'candy' ? 'Sugar' : background === 'forest' ? 'Forest' : background === 'desert' ? 'Dune' : 'Sky'
  const controlsName = interaction === 'shooter' ? 'Blaster' : interaction === 'keyboard' ? 'Typer' : 'Pop'
  const enemiesName = enemyType === 'zombie' ? 'Zombies' : enemyType === 'oddbod' ? 'OddBods' : enemyType === 'meteor' ? 'Meteors' : enemyType === 'ghost' ? 'Ghosts' : 'Letters'

  title = `${adjective} ${themeName} ${controlsName}`

  let instruction = 'Pop the letters to score points!'
  if (interaction === 'shooter') {
    instruction = `Aim and shoot the letters with ${projectileType} projectiles!`
  } else if (interaction === 'keyboard') {
    instruction = 'Type the letters on your keyboard to collect them!'
  }

  if (pool === 'vowels') {
    instruction += ' ONLY target the Vowels (A, E, I, O, U)!'
  } else if (pool === 'consonants') {
    instruction += ' ONLY target the Consonants!'
  } else if (pool === 'custom' && customLetters) {
    instruction = `Spell the word in order: ${customLetters.join('')}!`
  }

  if (enemyType !== 'none') {
    if (enemyBehavior === 'chase_player') {
      instruction += ` Avoid the ${enemiesName} chasing you!`
    } else {
      instruction += ` Stop the ${enemiesName} before they steal the letters!`
    }
  }

  if (winCondition === 'survival') {
    instruction += ' Survive as long as you can!'
  } else if (winCondition === 'time' && timeLimit) {
    instruction += ` Reach ${winThreshold} points within ${timeLimit} seconds!`
  }

  return {
    title,
    instruction,
    theme: {
      background,
      specialEffects,
    },
    letters: {
      pool,
      customLetters,
      minSpeed,
      maxSpeed,
      size: 40,
      behavior: letterBehavior,
      gravity,
    },
    enemies: {
      type: enemyType,
      count: 1,
      speed: enemySpeed,
      spawnRate,
      behavior: enemyBehavior,
      clickToDestroy,
    },
    controls: {
      interaction,
      projectileType,
      ammoCount,
      reloadSpeed,
    },
    rules: {
      winCondition,
      winThreshold,
      lives,
      timeLimit,
    },
  }
}
