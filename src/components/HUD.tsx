import { GameState } from '../game/Engine'

interface HUDProps {
  state: GameState
}

export default function HUD({ state }: HUDProps) {
  let leftContent: React.ReactNode = null
  let rightContent: React.ReactNode = null

  switch (state.mode) {
    case 'free':
      leftContent = (
        <span>You: <span style={{ color: state.collectedSet.size >= 26 ? '#58d68d' : '#5dade2', fontWeight: 700 }}>{state.collectedSet.size}</span>/26</span>
      )
      rightContent = (
        <span>OddBods: <span style={{ color: state.oddScore >= 26 ? '#e74c5c' : '#f5b041', fontWeight: 700 }}>{state.oddScore}</span>/26</span>
      )
      break
    case 'word':
      leftContent = (
        <span>Words: <span style={{ color: '#58d68d', fontWeight: 700 }}>{state.wordsCompleted}</span></span>
      )
      rightContent = (
        <span style={{ color: '#f5b041', fontWeight: 700 }}>Score: {state.score}</span>
      )
      break
    case 'survival':
      leftContent = (
        <span>{'❤️'.repeat(Math.max(0, state.lives ?? 3))}</span>
      )
      rightContent = (
        <span style={{ color: '#f5b041', fontWeight: 700 }}>Score: {state.score}</span>
      )
      break
    case 'timeattack':
      leftContent = (
        <span>Time: <span style={{ color: (state.timeLeft ?? 60) <= 10 ? '#e74c5c' : '#fff', fontWeight: 700 }}>{state.timeLeft ?? 60}s</span></span>
      )
      rightContent = (
        <span style={{ color: '#f5b041', fontWeight: 700 }}>Score: {state.score}</span>
      )
      break
    case 'wordrace':
      leftContent = (
        <span>Words: <span style={{ color: '#58d68d', fontWeight: 700 }}>{state.wordsCompleted}</span></span>
      )
      rightContent = (
        <span style={{ color: '#f5b041', fontWeight: 700 }}>Score: {state.score}</span>
      )
      break
    case 'defense':
      leftContent = (
        <span>{'❤️'.repeat(Math.max(0, state.lives ?? 3))}</span>
      )
      rightContent = (
        <span style={{ color: '#f5b041', fontWeight: 700 }}>Score: {state.score}</span>
      )
      break
    case 'angry':
      leftContent = (
        <span style={{ color: '#58d68d', fontWeight: 700 }}>🎯 {state.score}/26</span>
      )
      rightContent = null
      break
    case 'balloon':
    case 'memory':
    case 'chef':
    case 'detective':
    case 'zombieSchool':
    case 'pirate':
    case 'circus':
    case 'shooting':
      leftContent = null
      rightContent = null
      break
  }

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      padding: '8px 16px',
      display: 'flex', justifyContent: 'space-between',
      pointerEvents: 'none', zIndex: 5,
    }}>
      <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
        {leftContent}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>
        {rightContent}
      </div>
    </div>
  )
}
