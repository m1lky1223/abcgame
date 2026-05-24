import { ALL_LETTERS } from '../characters/data'
import { drawCharacter } from '../characters/draw'

export class Collectible {
  x: number
  y: number
  width = 36
  height = 40
  letter: string
  speed: number
  collected = false

  constructor(canvasW: number, canvasH: number, speed: number) {
    this.speed = speed
    this.letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
    this.x = canvasW + 20
    const groundY = canvasH - 120
    this.y = groundY - this.height - 30 - Math.random() * 60
  }

  update(): boolean {
    this.x -= this.speed
    return this.x < -50 || this.collected
  }

  draw(ctx: CanvasRenderingContext2D, frame: number): void {
    if (this.collected) return
    const bob = Math.sin(frame * 0.08) * 4
    drawCharacter(ctx, this.letter, this.x, this.y, 0.7, bob)
  }

  getBounds(): { x: number; y: number; w: number; h: number } {
    return { x: this.x + 4, y: this.y + 4, w: this.width - 8, h: this.height - 8 }
  }
}
