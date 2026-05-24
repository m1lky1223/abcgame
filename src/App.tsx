import { useCallback, useRef, useState } from 'react'
import { Engine, GameState, GameMode } from './game/Engine'
import GameCanvas from './components/GameCanvas'
import MainMenu from './components/MainMenu'
import HUD from './components/HUD'

type Screen = 'menu' | 'playing'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [mode, setMode] = useState<GameMode>('free')
  const [gameState, setGameState] = useState<GameState>({
    score: 0, collectedSet: new Set(), totalCollected: 0,
    mode: 'free', wordsCompleted: 0, oddScore: 0, winner: null, ammoLeft: 30,
  })
  const [gameKey, setGameKey] = useState(0)
  const engineRef = useRef<Engine | null>(null)

  const handleStateChange = useCallback((state: GameState) => {
    setGameState({ ...state, collectedSet: new Set(state.collectedSet) })
  }, [])

  const handleReady = useCallback((engine: Engine) => {
    engineRef.current = engine
    engine.onGameOver = () => {}
  }, [])

  const startGame = useCallback((m: GameMode) => {
    setMode(m)
    setGameState({ score: 0, collectedSet: new Set(), totalCollected: 0, mode: m, wordsCompleted: 0, oddScore: 0, winner: null, ammoLeft: 30 })
    setScreen('playing')
    setGameKey(k => k + 1)
  }, [])

  const handleReplay = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.restart()
      setGameState({ score: 0, collectedSet: new Set(), totalCollected: 0, mode, wordsCompleted: 0, oddScore: 0, winner: null, ammoLeft: 30 })
    } else {
      setGameKey(k => k + 1)
    }
  }, [mode])

  const handleBackToMenu = useCallback(() => {
    setScreen('menu')
  }, [])

  const getGameOverText = (): { title: string; subtitle: string } => {
    if (!gameState.winner) return { title: '', subtitle: '' }
    if (gameState.winner === 'human') {
      if (mode === 'timeattack') {
        const hs = gameState.highScore ?? gameState.score
        return { title: 'Time\'s Up! ⏰', subtitle: `Score: ${gameState.score}  |  Best: ${hs}` }
      }
      if (mode === 'free') return { title: 'You Win! 🎉', subtitle: 'You collected all 26 letters first!' }
      if (mode === 'survival' || mode === 'defense') return { title: 'You Win! 🎉', subtitle: `Final score: ${gameState.score}` }
      if (mode === 'angry') return { title: 'All 26 Destroyed! 🎉', subtitle: `Ammo used: ${30 - (gameState.ammoLeft ?? 0)} / 30` }
      if (mode === 'rescue') return { title: 'All Letters Rescued! 🏆', subtitle: `Score: ${gameState.score}  |  Rooms cleared: ${gameState.totalLevels}` }
      if (mode === 'balloon') return { title: 'All Balloons Popped! 🎈', subtitle: `Score: ${gameState.score}` }
      if (mode === 'memory') return { title: 'All Pairs Matched! 🧠', subtitle: `Score: ${gameState.score}` }
      if (mode === 'chef') return { title: 'All Recipes Cooked! 👨‍🍳', subtitle: `Score: ${gameState.score}` }
      if (mode === 'detective') return { title: 'All Cases Solved! 🕵️', subtitle: `Score: ${gameState.score}` }
      if (mode === 'zombieSchool') return { title: 'Graduated! 🎓', subtitle: `Score: ${gameState.score}` }
      if (mode === 'pirate') return { title: 'Pirate King! 🏴‍☠️', subtitle: `All 26 treasures found! Score: ${gameState.score}` }
      if (mode === 'circus') return { title: 'Grand Finale! 🎪', subtitle: `All 7 acts completed! Score: ${gameState.score}` }
      return { title: 'You Win! 🎉', subtitle: `Score: ${gameState.score}` }
    }
    if (mode === 'angry') return { title: 'Out of Ammo! 💣', subtitle: `Letters destroyed: ${gameState.score}/26` }
    if (mode === 'survival') return { title: 'Game Over 💀', subtitle: `The OddBods got you! Score: ${gameState.score}` }
    if (mode === 'defense') return { title: 'Defense Breached! 💀', subtitle: `The OddBods broke through! Score: ${gameState.score}` }
    return { title: 'OddBods Win! 😈', subtitle: 'They collected all 26 letters first!' }
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <GameCanvas
        key={gameKey}
        onReady={handleReady}
        onStateChange={handleStateChange}
        mode={mode}
      />

      {screen === 'menu' && (
        <MainMenu onStartMode={startGame} />
      )}

      {screen === 'playing' && !gameState.winner && mode !== 'angry' && (
        <HUD state={gameState} />
      )}

      {screen === 'playing' && gameState.winner && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 10,
          pointerEvents: 'auto',
        }}>
          <h1 style={{
            fontSize: 48, fontWeight: 900,
            color: gameState.winner === 'human' ? '#58d68d' : '#e74c5c',
            textShadow: '0 0 30px rgba(0,0,0,0.7)',
            marginBottom: 8,
          }}>
            {getGameOverText().title}
          </h1>
          <p style={{ color: '#8899bb', fontSize: 18, marginBottom: 32, textAlign: 'center' }}>
            {getGameOverText().subtitle}
          </p>
          <div style={{ display: 'flex', gap: 14 }}>
            <button onClick={handleReplay} style={{
              padding: '14px 44px', fontSize: 18, fontWeight: 700,
              background: 'linear-gradient(135deg, #58d68d, #2ecc71)',
              color: '#fff', border: 'none', borderRadius: 12,
              letterSpacing: 1, cursor: 'pointer',
            }}>
              🔄 PLAY AGAIN
            </button>
            <button onClick={handleBackToMenu} style={{
              padding: '14px 44px', fontSize: 18, fontWeight: 700,
              background: 'linear-gradient(135deg, #5dade2, #3498db)',
              color: '#fff', border: 'none', borderRadius: 12,
              letterSpacing: 1, cursor: 'pointer',
            }}>
              🏠 MENU
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
