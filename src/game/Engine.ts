import { Input } from './Input'
import { GameModeStrategy, buildGameInput } from './GameModeStrategy'
import { SelfContainedAdapter, SelfContainedMode } from './adapters/SelfContainedAdapter'
import { LetterPopMode } from './strategies/LetterPopMode'
import { PopSubMode } from './strategies/LetterPopCore'

import { AngryMode } from './AngryMode'
import { ZombieRescueMode } from './ZombieRescueMode'
import { CarnivalMode } from './CarnivalMode'
import { DanceAcademyMode } from './DanceAcademyMode'
import { LetterRunnerMode } from './LetterRunnerMode'
import { EvolutionLabMode } from './EvolutionLabMode'
import { BalloonPopMode } from './BalloonPopMode'
import { MemoryMatchMode } from './MemoryMatchMode'
import { ChefKitchenMode } from './ChefKitchenMode'
import { DetectiveMode } from './DetectiveMode'
import { ZombieSchoolMode } from './ZombieSchoolMode'
import { PirateHuntMode } from './PirateHuntMode'
import { CircusMode } from './CircusMode'
import { ShootingGalleryMode } from './ShootingGalleryMode'
import { PizzaDeliveryMode } from './PizzaDeliveryMode'
import { ConstructionSiteMode } from './ConstructionSiteMode'
import { MailCarriersMode } from './MailCarriersMode'
import { GardenMode } from './GardenMode'
import { FireFightersMode } from './FireFightersMode'
import { DoctorMode } from './DoctorMode'
import { TrainMode } from './TrainMode'
import { SpaceExplorersMode } from './SpaceExplorersMode'
import { BakeryMode } from './BakeryMode'
import { AquariumMode } from './AquariumMode'
import { AlphabetArcadeMode } from './AlphabetArcadeMode'
import { OddbodKartRacer } from './OddbodKartRacer'
import { SuikaMode } from './SuikaMode'
import { PinballMode } from './PinballMode'
import { ZombieDefenseMode } from './ZombieDefenseMode'
import { ZombieDinerMode } from './ZombieDinerMode'
import { LetterMazeMode } from './LetterMazeMode'
import { WordEntry } from './words'
import { DynamicPromptStrategy } from './strategies/DynamicPromptStrategy'

export type GameMode = 'free' | 'word' | 'survival' | 'timeattack' | 'wordrace' | 'defense' | 'angry' | 'rescue' | 'carnival' | 'dance' | 'runner' | 'lab' | 'balloon' | 'memory' | 'chef' | 'detective' | 'zombieSchool' | 'pirate' | 'circus' | 'shooting' | 'pizza' | 'construction' | 'mail' | 'garden' | 'fire' | 'doctor' | 'train' | 'space' | 'bakery' | 'aquarium' | 'alphabetArcade' | 'kart' | 'suika' | 'pinball' | 'zombieDefense' | 'zombieDiner' | 'letterMaze' | 'prompt'

export const WIN_SCORE = 26

export interface GameState {
  score: number
  collectedSet: Set<string>
  totalCollected: number
  mode: GameMode
  wordsCompleted: number
  currentWord?: WordEntry
  oddScore: number
  winner: 'human' | 'oddbods' | null
  lives?: number
  timeLeft?: number
  highScore?: number
  ammoLeft?: number
  currentLevel?: number
  totalLevels?: number
  customTitle?: string
}

function createStrategy(mode: GameMode, canvasW: number, canvasH: number, customConfig?: any): GameModeStrategy {
  if (mode === 'prompt' && customConfig) {
    return new DynamicPromptStrategy(canvasW, canvasH, customConfig)
  }

  const popModes: PopSubMode[] = ['free', 'word', 'survival', 'timeattack', 'wordrace', 'defense']
  if (popModes.includes(mode as PopSubMode)) {
    return new LetterPopMode(canvasW, canvasH, mode as PopSubMode)
  }

  if (mode === 'alphabetArcade') {
    return new AlphabetArcadeMode(canvasW, canvasH)
  }

  const modeMap: Record<string, new (w: number, h: number) => SelfContainedMode> = {
    angry: AngryMode,
    rescue: ZombieRescueMode,
    carnival: CarnivalMode,
    dance: DanceAcademyMode,
    runner: LetterRunnerMode,
    lab: EvolutionLabMode,
    balloon: BalloonPopMode,
    memory: MemoryMatchMode,
    chef: ChefKitchenMode,
    detective: DetectiveMode,
    zombieSchool: ZombieSchoolMode,
    pirate: PirateHuntMode,
    circus: CircusMode,
    shooting: ShootingGalleryMode,
    pizza: PizzaDeliveryMode,
    construction: ConstructionSiteMode,
    mail: MailCarriersMode,
    garden: GardenMode,
    fire: FireFightersMode,
    doctor: DoctorMode,
    train: TrainMode,
    space: SpaceExplorersMode,
    bakery: BakeryMode,
    aquarium: AquariumMode,
    kart: OddbodKartRacer,
    suika: SuikaMode,
    pinball: PinballMode,
    zombieDefense: ZombieDefenseMode,
    zombieDiner: ZombieDinerMode,
    letterMaze: LetterMazeMode,
  }

  const Inner = modeMap[mode]
  if (Inner) {
    return new SelfContainedAdapter(new Inner(canvasW, canvasH))
  }

  return new LetterPopMode(canvasW, canvasH, 'free')
}

export class Engine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private input: Input
  private strategy: GameModeStrategy
  private frame = 0
  private animId = 0
  private running = false

  state: GameState = { score: 0, collectedSet: new Set(), totalCollected: 0, mode: 'free', wordsCompleted: 0, oddScore: 0, winner: null }
  onStateChange?: (state: GameState) => void
  onGameOver?: (winner: 'human' | 'oddbods') => void

  constructor(canvas: HTMLCanvasElement, mode: GameMode = 'free', customConfig?: any) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.input = new Input()
    this.strategy = createStrategy(mode, canvas.width, canvas.height, customConfig)
    this.state.mode = mode
    this.strategy.onStateChange = this.handleStrategyState
    this.loop = this.loop.bind(this)
  }

  private handleStrategyState = (s: any): void => {
    if (s.score !== undefined) this.state.score = s.score
    if (s.totalCollected !== undefined) this.state.totalCollected = s.totalCollected
    if (s.wordsCompleted !== undefined) this.state.wordsCompleted = s.wordsCompleted
    if (s.oddScore !== undefined) this.state.oddScore = s.oddScore
    if (s.winner !== undefined) this.state.winner = s.winner
    if (s.lives !== undefined) this.state.lives = s.lives
    if (s.timeLeft !== undefined) this.state.timeLeft = s.timeLeft
    if (s.ammoLeft !== undefined) this.state.ammoLeft = s.ammoLeft
    if (s.currentLevel !== undefined) this.state.currentLevel = s.currentLevel
    if (s.totalLevels !== undefined) this.state.totalLevels = s.totalLevels
    if (s.collectedSet) this.state.collectedSet = s.collectedSet
    if (s.highScore !== undefined) this.state.highScore = s.highScore
    if (s.customTitle !== undefined) this.state.customTitle = s.customTitle
    this.onStateChange?.(this.state)
  }

  start(): void {
    this.input.attach()
    this.strategy.start(this.canvas.width, this.canvas.height)
    this.running = true
    this.onStateChange?.(this.state)
    this.loop()
  }

  stop(): void {
    this.running = false
    this.input.detach()
    cancelAnimationFrame(this.animId)
  }

  restart(): void {
    this.state = { score: 0, collectedSet: new Set(), totalCollected: 0, mode: this.state.mode, wordsCompleted: 0, oddScore: 0, winner: null }
    this.strategy.restart(this.canvas.width, this.canvas.height)
    this.running = true
    this.onStateChange?.(this.state)
    this.input.detach()
    this.input = new Input()
    this.input.attach()
    this.loop()
  }

  resize(w: number, h: number): void {
    this.canvas.width = w
    this.canvas.height = h
    this.strategy.resize(w, h)
  }

  private loop(): void {
    if (!this.running) return
    this.animId = requestAnimationFrame(this.loop)
    this.frame++
    this.update()
    this.draw()
    this.input.clearFrame()
  }

  private update(): void {
    if (this.state.winner) {
      if (this.input.wasPressed(' ')) this.restart()
      return
    }
    const rect = this.canvas.getBoundingClientRect()
    const gameInput = buildGameInput(this.input, rect)
    this.strategy.update(gameInput, this.frame)
  }

  private draw(): void {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height
    ctx.clearRect(0, 0, w, h)
    this.strategy.draw(ctx)
    if (this.state.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, w, h)
    }
  }
}
