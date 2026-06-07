import { GameModeStrategy, GameInput } from '../GameModeStrategy'
import { LetterPopCore, PopSubMode } from './LetterPopCore'
import { Renderer } from '../../renderer/Renderer'

export class LetterPopMode implements GameModeStrategy {
  onStateChange?: (state: any) => void
  private core: LetterPopCore
  private frame = 0

  constructor(canvasW: number, canvasH: number, subMode: PopSubMode) {
    this.core = new LetterPopCore(canvasW, canvasH, subMode)
    this.core.onStateChange = (s) => this.onStateChange?.(s)
  }

  start(_canvasW: number, _canvasH: number): void {
    this.core.start()
  }

  update(input: GameInput, frame: number): void {
    this.frame = frame
    this.core.update(frame, input)
  }

  draw(ctx: Renderer): void {
    this.core.draw(ctx, this.frame)
  }

  resize(w: number, h: number): void {
    this.core.resize(w, h)
  }

  restart(_canvasW: number, _canvasH: number): void {
    this.core.restart()
  }

  destroy(): void {}
}
