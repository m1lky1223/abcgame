import { Input } from './Input'

export interface Gesture {
  type: 'tap' | 'drag' | 'swipe' | 'longpress'
  x: number
  y: number
  dx?: number
  dy?: number
}

export interface GameInput {
  gestures: Gesture[]
  wasPressed(key: string): boolean
  isDown(key: string): boolean
  mouseDown: boolean
  mouseX: number
  mouseY: number
  justReleased: boolean
}

export interface GameModeStrategy {
  onStateChange?: (state: any) => void
  start(canvasW: number, canvasH: number): void
  update(input: GameInput, frame: number): void
  draw(ctx: CanvasRenderingContext2D): void
  resize(w: number, h: number): void
  restart(canvasW: number, canvasH: number): void
  destroy(): void
}

const SWIPE_THRESHOLD = 30

export function buildGameInput(input: Input, rect: DOMRect): GameInput {
  const gestures: Gesture[] = []

  if (input.mouseJustPressed) {
    const x = input.mouseX - rect.left
    const y = input.mouseY - rect.top
    gestures.push({ type: 'tap', x, y })
  }

  if (input.justReleased) {
    const dx = input.mouseX - input.mouseDownX
    const dy = input.mouseY - input.mouseDownY
    if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
      gestures.push({
        type: 'swipe',
        x: input.mouseX - rect.left,
        y: input.mouseY - rect.top,
        dx, dy,
      })
    } else {
      gestures.push({
        type: 'tap',
        x: input.mouseX - rect.left,
        y: input.mouseY - rect.top,
      })
    }
  }

  if (input.mouseDown) {
    const dx = input.mouseX - input.mouseDownX
    const dy = input.mouseY - input.mouseDownY
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      gestures.push({
        type: 'drag',
        x: input.mouseX - rect.left,
        y: input.mouseY - rect.top,
        dx, dy,
      })
    }
  }

  const { mouseDown, mouseX, mouseY, justReleased } = input

  return {
    gestures,
    wasPressed: (key: string) => input.wasPressed(key),
    isDown: (key: string) => input.isDown(key),
    mouseDown,
    mouseX: mouseX - rect.left,
    mouseY: mouseY - rect.top,
    justReleased,
  }
}
