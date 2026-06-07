import { Renderer, CloudData, SparkleData } from '../renderer/Renderer'

export class Background {
  public readonly clouds: CloudData[] = []
  public readonly sparkles: SparkleData[] = []

  constructor(canvasW: number, canvasH: number) {
    for (let i = 0; i < 4; i++) {
      this.clouds.push({
        x: Math.random() * canvasW,
        y: 20 + Math.random() * (canvasH * 0.35),
        w: 60 + Math.random() * 100,
        a: 0.15 + Math.random() * 0.15,
      })
    }
    for (let i = 0; i < 20; i++) {
      this.sparkles.push({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        phase: Math.random() * Math.PI * 2,
        size: 1.5 + Math.random() * 2.5,
      })
    }
  }

  update(_speed: number, _canvasW: number): void {
  }

  draw(renderer: Renderer, canvasW: number, canvasH: number, frame: number): void {
    renderer.drawBackground(this.clouds, this.sparkles, canvasW, canvasH, frame)
  }
}
