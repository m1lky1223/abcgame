import { Renderer } from '../renderer/Renderer'

export function drawCharacter(
  renderer: Renderer,
  letter: string,
  x: number,
  y: number,
  scale = 1,
  bobOffset = 0,
): void {
  renderer.drawLetter(letter, x, y, scale, bobOffset)
}
