export class Background {
  private clouds: { x: number; y: number; w: number; a: number }[] = []
  private sparkles: { x: number; y: number; phase: number; size: number }[] = []

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

  draw(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number, frame: number): void {
    const grad = ctx.createLinearGradient(0, 0, 0, canvasH)
    grad.addColorStop(0, '#1a1a3e')
    grad.addColorStop(0.3, '#2d2d6b')
    grad.addColorStop(0.6, '#4a3f7a')
    grad.addColorStop(1, '#2a1a3e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvasW, canvasH)

    for (const s of this.sparkles) {
      const flicker = Math.sin(frame * 0.05 + s.phase) * 0.4 + 0.6
      ctx.globalAlpha = flicker * 0.5
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    for (const c of this.clouds) {
      ctx.globalAlpha = c.a
      ctx.fillStyle = '#8899cc'
      ctx.beginPath()
      ctx.ellipse(c.x, c.y, c.w / 2, 14, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(c.x - c.w * 0.25, c.y + 4, c.w * 0.3, 10, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(c.x + c.w * 0.25, c.y + 3, c.w * 0.3, 11, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
}
