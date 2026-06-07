import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Canvas2DRenderer } from '../renderer/Canvas2DRenderer'

describe('Canvas2DRenderer', () => {
  let mockCtx: any
  let renderer: Canvas2DRenderer

  beforeEach(() => {
    mockCtx = {
      canvas: {
        width: 0,
        height: 0,
      },
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 10, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 })),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
      putImageData: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      font: '10px sans-serif',
      textAlign: 'left',
      textBaseline: 'alphabetic',
      shadowBlur: 0,
      shadowColor: '',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      filter: 'none',
      globalCompositeOperation: 'source-over',
      miterLimit: 10,
      direction: 'ltr',
      roundRect: vi.fn(),
    }

    renderer = new Canvas2DRenderer(mockCtx as unknown as CanvasRenderingContext2D, 800, 600)
  })

  it('instantiates with custom width and height', () => {
    expect(renderer.width).toBe(800)
    expect(renderer.height).toBe(600)
  })

  it('mutates dimensions and canvas properties on resize', () => {
    renderer.resize(1024, 768)
    expect(renderer.width).toBe(1024)
    expect(renderer.height).toBe(768)
    expect(mockCtx.canvas.width).toBe(1024)
    expect(mockCtx.canvas.height).toBe(768)
  })

  it('delegates primitive operations to the context', () => {
    renderer.fillRect(10, 20, 100, 200)
    expect(mockCtx.fillRect).toHaveBeenCalledWith(10, 20, 100, 200)

    renderer.beginPath()
    expect(mockCtx.beginPath).toHaveBeenCalled()

    renderer.arc(50, 60, 10, 0, Math.PI)
    expect(mockCtx.arc).toHaveBeenCalledWith(50, 60, 10, 0, Math.PI, false)

    renderer.lineTo(150, 250)
    expect(mockCtx.lineTo).toHaveBeenCalledWith(150, 250)

    renderer.fill()
    expect(mockCtx.fill).toHaveBeenCalled()

    renderer.stroke()
    expect(mockCtx.stroke).toHaveBeenCalled()
  })

  it('sets style and state properties on the context', () => {
    renderer.fillStyle = '#ff0000'
    expect(mockCtx.fillStyle).toBe('#ff0000')

    renderer.strokeStyle = '#00ff00'
    expect(mockCtx.strokeStyle).toBe('#00ff00')

    renderer.lineWidth = 5
    expect(mockCtx.lineWidth).toBe(5)

    renderer.font = '20px Arial'
    expect(mockCtx.font).toBe('20px Arial')

    renderer.shadowColor = '#0000ff'
    expect(mockCtx.shadowColor).toBe('#0000ff')
  })

  it('exposes high-level methods with stub or complete implementations', () => {
    expect(typeof renderer.drawLetter).toBe('function')
    expect(typeof renderer.drawBackground).toBe('function')
    expect(typeof renderer.drawOddbodChaser).toBe('function')
    expect(typeof renderer.drawZombieChaser).toBe('function')
  })
})
