import { useCallback, useRef, useState } from 'react'
import { Engine, GameState, GameMode } from './game/Engine'
import GameCanvas from './components/GameCanvas'
import MainMenu from './components/MainMenu'
import HUD from './components/HUD'
import AIPromptCreator from './components/AIPromptCreator'

type Screen = 'menu' | 'playing'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [mode, setMode] = useState<GameMode>('free')
  const [gameState, setGameState] = useState<GameState>({
    score: 0, collectedSet: new Set(), totalCollected: 0,
    mode: 'free', wordsCompleted: 0, oddScore: 0, winner: null, ammoLeft: 30,
  })
  const [gameKey, setGameKey] = useState(0)
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [customGameConfig, setCustomGameConfig] = useState<any>(null)
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

  const startPromptGame = useCallback((config: any) => {
    setCustomGameConfig(config)
    setShowAIPrompt(false)
    startGame('prompt')
  }, [startGame])

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
    if (mode === 'prompt') {
      const customTitle = gameState.customTitle || 'Custom Mode'
      if (gameState.winner === 'human') {
        return { title: 'Victory! 🎉', subtitle: `You conquered ${customTitle}! Score: ${gameState.score}` }
      } else {
        return { title: 'Game Over 💀', subtitle: `Failed ${customTitle}. Final Score: ${gameState.score}` }
      }
    }
    if (mode === 'alphabetArcade' && gameState.winner === 'oddbods') return { title: 'Knockout!', subtitle: `Reached round ${gameState.currentLevel ?? 1}/${gameState.totalLevels ?? 25}  |  Score: ${gameState.score}` }
    if (gameState.winner === 'human') {
      if (mode === 'alphabetArcade') return { title: 'Arcade Champion!', subtitle: `Defeated the alphabet roster! Score: ${gameState.score}` }
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
      if (mode === 'shooting') return { title: 'All Letters Rescued! 🎯', subtitle: `Score: ${gameState.score}  |  Waves cleared: ${gameState.currentLevel ?? 26}` }
      if (mode === 'pizza') return { title: 'Pizza Party! 🍕', subtitle: `All 26 pizzas served! Score: ${gameState.score}` }
      if (mode === 'construction') return { title: 'Grand Opening! 🏗️', subtitle: `All 26 structures built! Score: ${gameState.score}` }
      if (mode === 'mail') return { title: 'Master Mail Carrier! 📬', subtitle: `All 26 letters delivered! Score: ${gameState.score}` }
      if (mode === 'garden') return { title: 'Garden in Full Bloom! 🌸', subtitle: `All 26 plants grown! Score: ${gameState.score}` }
      if (mode === 'fire') return { title: 'Heroes of the Day! 🚒', subtitle: `All 26 fires extinguished! Score: ${gameState.score}` }
      if (mode === 'doctor') return { title: 'Doctor of the Year! 🏆', subtitle: `All 26 patients cured! Score: ${gameState.score}` }
      if (mode === 'train') return { title: 'All Aboard! 🚂', subtitle: `Full alphabet train! Score: ${gameState.score}` }
      if (mode === 'space') return { title: 'Galactic Explorer! 🌌', subtitle: `All 26 discoveries made! Score: ${gameState.score}` }
      if (mode === 'bakery') return { title: 'Master Baker! 🎂', subtitle: `All 26 treats served! Score: ${gameState.score}` }
      if (mode === 'aquarium') return { title: 'Ocean Explorer! 🐳', subtitle: `All 26 creatures discovered! Score: ${gameState.score}` }
      return { title: 'You Win! 🎉', subtitle: `Score: ${gameState.score}` }
    }
    if (mode === 'angry') return { title: 'Out of Ammo! 💣', subtitle: `Letters destroyed: ${gameState.score}/26` }
    if (mode === 'survival') return { title: 'Game Over 💀', subtitle: `The OddBods got you! Score: ${gameState.score}` }
    if (mode === 'defense') return { title: 'Defense Breached! 💀', subtitle: `The OddBods broke through! Score: ${gameState.score}` }
    if (mode === 'shooting') return { title: 'Zombies Overran the Base! 💀', subtitle: `Letters rescued: ${gameState.totalCollected}/26  |  Score: ${gameState.score}` }
    return { title: 'OddBods Win! 😈', subtitle: 'They collected all 26 letters first!' }
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <GameCanvas
        key={gameKey}
        onReady={handleReady}
        onStateChange={handleStateChange}
        mode={mode}
        customConfig={customGameConfig}
      />

      {screen === 'menu' && (
        <MainMenu onStartMode={startGame} onOpenAIPrompt={() => setShowAIPrompt(true)} />
      )}

      {showAIPrompt && (
        <AIPromptCreator
          onStartGame={startPromptGame}
          onClose={() => setShowAIPrompt(false)}
        />
      )}

      {screen === 'playing' && !gameState.winner && mode !== 'angry' && mode !== 'kart' && mode !== 'suika' && mode !== 'pinball' && mode !== 'zombieDefense' && mode !== 'zombieDiner' && mode !== 'letterMaze' && (
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
