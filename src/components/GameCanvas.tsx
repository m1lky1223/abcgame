import { useEffect, useRef } from 'react'
import { Engine, GameState, GameMode } from '../game/Engine'

interface GameCanvasProps {
  onReady: (engine: Engine) => void
  onStateChange: (state: GameState) => void
  mode: GameMode
}

export default function GameCanvas({ onReady, onStateChange, mode }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    const engine = new Engine(canvas, mode)
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
  }, [mode])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
    />
  )
}
