import { CHARACTERS } from '../characters/data'
import { GameMode } from '../game/Engine'

interface MainMenuProps {
  onStartMode: (mode: GameMode) => void
}

export default function MainMenu({ onStartMode }: MainMenuProps) {
  const previews = ['A', 'B', 'C', 'D', 'E']

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0b0e17 0%, #1a1a2e 50%, #16213e 100%)',
      zIndex: 10,
    }}>
      <h1 style={{
        fontSize: 56, fontWeight: 900,
        background: 'linear-gradient(90deg, #e74c5c, #f5b041, #58d68d, #5dade2, #af7ac5)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 4, letterSpacing: 3,
      }}>
        ABC GAME
      </h1>
      <p style={{ color: '#8899bb', fontSize: 16, marginBottom: 24 }}>
        Alphabet Lore — pop letters before the OddBods catch them!
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
        {previews.map(l => {
          const c = CHARACTERS[l]
          return (
            <div key={l} style={{
              width: 48, height: 48, borderRadius: 10,
              backgroundColor: c.bodyColor,
              border: `3px solid ${c.outlineColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 22,
            }}>
              {l}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onStartMode('free')} style={{
            padding: '12px 30px', fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #58d68d, #2ecc71)',
            color: '#fff', border: 'none', borderRadius: 12, letterSpacing: 1, cursor: 'pointer',
          }}>
            🎈 FREE POP
          </button>
          <button onClick={() => onStartMode('word')} style={{
            padding: '12px 30px', fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #5dade2, #3498db)',
            color: '#fff', border: 'none', borderRadius: 12, letterSpacing: 1, cursor: 'pointer',
          }}>
            📖 WORD POP
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onStartMode('survival')} style={{
            padding: '12px 30px', fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #e74c5c, #c0392b)',
            color: '#fff', border: 'none', borderRadius: 12, letterSpacing: 1, cursor: 'pointer',
          }}>
            ❤️ SURVIVAL
          </button>
          <button onClick={() => onStartMode('timeattack')} style={{
            padding: '12px 30px', fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #f5b041, #e67e22)',
            color: '#fff', border: 'none', borderRadius: 12, letterSpacing: 1, cursor: 'pointer',
          }}>
            ⏱️ TIME ATTACK
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onStartMode('wordrace')} style={{
            padding: '12px 30px', fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #af7ac5, #8e44ad)',
            color: '#fff', border: 'none', borderRadius: 12, letterSpacing: 1, cursor: 'pointer',
          }}>
            🔤 WORD RACE
          </button>
          <button onClick={() => onStartMode('defense')} style={{
            padding: '12px 30px', fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #1abc9c, #16a085)',
            color: '#fff', border: 'none', borderRadius: 12, letterSpacing: 1, cursor: 'pointer',
          }}>
            🛡️ DEFENSE
          </button>
          <button onClick={() => onStartMode('angry')} style={{
            padding: '12px 30px', fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #e74c5c, #c0392b)',
            color: '#fff', border: 'none', borderRadius: 12, letterSpacing: 1, cursor: 'pointer',
          }}>
            🐦 ODD BIRDS
          </button>
          <button onClick={() => onStartMode('rescue')} style={{
            padding: '12px 30px', fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #8e44ad, #6c3483)',
            color: '#fff', border: 'none', borderRadius: 12, letterSpacing: 1, cursor: 'pointer',
          }}>
            🏚️ RESCUE
          </button>
          <button onClick={() => onStartMode('carnival')} style={{
            padding: '12px 30px', fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #e67e22, #d35400)',
            color: '#fff', border: 'none', borderRadius: 12, letterSpacing: 1, cursor: 'pointer',
          }}>
            🎪 CARNIVAL
          </button>
        </div>
      </div>

      <div style={{ marginTop: 36, color: '#556688', fontSize: 12, textAlign: 'center', lineHeight: 2 }}>
        <p>Click letters to pop them!</p>
        <p>Press keyboard keys for bonus points ✨</p>
      </div>
    </div>
  )
}
