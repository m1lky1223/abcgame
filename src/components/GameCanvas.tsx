import { useEffect, useRef } from 'react'
import { Engine, GameState, GameMode } from '../game/Engine'
import { Canvas2DRenderer } from '../renderer/Canvas2DRenderer'

interface GameCanvasProps {
  onReady: (engine: Engine) => void
  onStateChange: (state: GameState) => void
  mode: GameMode
  customConfig?: any
}

export default function GameCanvas({ onReady, onStateChange, mode, customConfig }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    const ctx = canvas.getContext('2d')!
    const renderer = new Canvas2DRenderer(ctx, canvas.width, canvas.height)
    const engine = new Engine(renderer, canvas, mode, customConfig)
    engine.onStateChange = onStateChange
    engine.start()
    onReady(engine)

    const handleResize = () => {
      engine.resize(canvas.clientWidth, canvas.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      engine.stop()
      window.removeEventListener('resize', handleResize)
    }
  }, [mode, customConfig])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
    />
  )
}
