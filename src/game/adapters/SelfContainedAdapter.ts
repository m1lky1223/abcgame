import { GameModeStrategy, GameInput } from '../GameModeStrategy'

export interface SelfContainedMode {
  update(): void
  draw(ctx: CanvasRenderingContext2D): void
  handleClick?(cx: number, cy: number): void
  handleKey?(key: string): void
  handleAimStart?(cx: number, cy: number): void
  handleAimMove?(cx: number, cy: number): void
  handleAimRelease?(): void
  restart?(): void
  resize?(w: number, h: number): void
  onStateChange?: (s: any) => void
}

export class SelfContainedAdapter implements GameModeStrategy {
  onStateChange?: (state: any) => void
  private inner: SelfContainedMode

  constructor(inner: SelfContainedMode) {
    this.inner = inner
    this.inner.onStateChange = (s) => this.onStateChange?.(s)
  }

  start(_canvasW: number, _canvasH: number): void {}

  update(input: GameInput, _frame: number): void {
    if (this.inner.handleAimStart || this.inner.handleAimMove || this.inner.handleAimRelease) {
      if (input.mouseDown) {
        this.inner.handleAimStart?.(input.mouseX, input.mouseY)
        this.inner.handleAimMove?.(input.mouseX, input.mouseY)
      }
      if (input.justReleased) {
        this.inner.handleAimRelease?.()
      }
    }

    for (const g of input.gestures) {
      if (g.type === 'tap' && this.inner.handleClick) {
        this.inner.handleClick(g.x, g.y)
      }
      if (g.type === 'drag' && this.inner.handleClick) {
        this.inner.handleClick(g.x, g.y)
      }
    }

    const keys = 'abcdefghijklmnopqrstuvwxyz '
    for (const key of keys) {
      if (input.wasPressed(key) && this.inner.handleKey) {
        this.inner.handleKey(key)
      }
    }

    this.inner.update()
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.inner.draw(ctx)
  }

  resize(w: number, h: number): void {
    this.inner.resize?.(w, h)
  }

  restart(_canvasW: number, _canvasH: number): void {
    this.inner.restart?.()
  }

  destroy(): void {}
}
