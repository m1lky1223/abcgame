import { CHARACTERS } from '../characters/data'
import { GameMode } from '../game/Engine'

interface MainMenuProps {
  onStartMode: (mode: GameMode) => void
}

interface ModeEntry {
  mode: GameMode
  label: string
  gradient: string
}

const MODE_ROWS: { title: string; modes: ModeEntry[] }[] = [
  {
    title: 'Core',
    modes: [
      { mode: 'free', label: '🎈 FREE POP', gradient: 'linear-gradient(135deg, #58d68d, #2ecc71)' },
      { mode: 'word', label: '📖 WORD POP', gradient: 'linear-gradient(135deg, #5dade2, #3498db)' },
      { mode: 'survival', label: '❤️ SURVIVAL', gradient: 'linear-gradient(135deg, #e74c5c, #c0392b)' },
      { mode: 'timeattack', label: '⏱️ TIME ATTACK', gradient: 'linear-gradient(135deg, #f5b041, #e67e22)' },
      { mode: 'wordrace', label: '🔤 WORD RACE', gradient: 'linear-gradient(135deg, #af7ac5, #8e44ad)' },
      { mode: 'defense', label: '🛡️ DEFENSE', gradient: 'linear-gradient(135deg, #1abc9c, #16a085)' },
    ],
  },
  {
    title: 'Arcade',
    modes: [
      { mode: 'angry', label: '🐦 ODD BIRDS', gradient: 'linear-gradient(135deg, #e74c5c, #c0392b)' },
      { mode: 'rescue', label: '🏚️ RESCUE', gradient: 'linear-gradient(135deg, #8e44ad, #6c3483)' },
      { mode: 'carnival', label: '🎪 CARNIVAL', gradient: 'linear-gradient(135deg, #e67e22, #d35400)' },
      { mode: 'dance', label: '💃 DANCE ACADEMY', gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)' },
      { mode: 'runner', label: '🏃 RUNNER', gradient: 'linear-gradient(135deg, #3498db, #2980b9)' },
      { mode: 'lab', label: '🧬 EVOLUTION LAB', gradient: 'linear-gradient(135deg, #2ecc71, #1abc9c)' },
      { mode: 'alphabetArcade', label: 'ALPHABET ARCADE', gradient: 'linear-gradient(135deg, #f5b041, #e74c5c)' },
    ],
  },
  {
    title: 'Mini-Games',
    modes: [
      { mode: 'balloon', label: '🎈 BALLOON POP', gradient: 'linear-gradient(135deg, #e74c5c, #c0392b)' },
      { mode: 'memory', label: '🧠 MEMORY MATCH', gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)' },
      { mode: 'chef', label: '👨‍🍳 CHEF KITCHEN', gradient: 'linear-gradient(135deg, #e67e22, #d35400)' },
      { mode: 'detective', label: '🔍 DETECTIVE', gradient: 'linear-gradient(135deg, #3498db, #2980b9)' },
      { mode: 'zombieSchool', label: '📚 ZOMBIE SCHOOL', gradient: 'linear-gradient(135deg, #1abc9c, #16a085)' },
      { mode: 'pirate', label: '🏴‍☠️ PIRATE HUNT', gradient: 'linear-gradient(135deg, #8B4513, #D2691E)' },
      { mode: 'circus', label: '🎪 CIRCUS', gradient: 'linear-gradient(135deg, #e74c5c, #c0392b)' },
      { mode: 'shooting', label: '🎯 SHOOTING GALLERY', gradient: 'linear-gradient(135deg, #2c3e50, #34495e)' },
      { mode: 'pizza', label: '🍕 PIZZA DELIVERY', gradient: 'linear-gradient(135deg, #e74c5c, #c0392b)' },
      { mode: 'construction', label: '🏗️ CONSTRUCTION', gradient: 'linear-gradient(135deg, #f5b041, #e67e22)' },
      { mode: 'mail', label: '📬 MAIL CARRIERS', gradient: 'linear-gradient(135deg, #5dade2, #3498db)' },
      { mode: 'garden', label: '🌸 ALPHABET GARDEN', gradient: 'linear-gradient(135deg, #58d68d, #2ecc71)' },
      { mode: 'fire', label: '🚒 FIREFIGHTERS', gradient: 'linear-gradient(135deg, #e74c5c, #c0392b)' },
      { mode: 'doctor', label: '🏥 ZOMBIE DOCTOR', gradient: 'linear-gradient(135deg, #1abc9c, #16a085)' },
      { mode: 'train', label: '🚂 ALPHABET TRAIN', gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)' },
      { mode: 'space', label: '🚀 SPACE EXPLORERS', gradient: 'linear-gradient(135deg, #2c3e50, #34495e)' },
      { mode: 'bakery', label: '🧁 ZOMBIE BAKERY', gradient: 'linear-gradient(135deg, #e67e22, #d35400)' },
      { mode: 'aquarium', label: '🐠 ALPHABET AQUARIUM', gradient: 'linear-gradient(135deg, #5dade2, #2980b9)' },
    ],
  },
]

export default function MainMenu({ onStartMode }: MainMenuProps) {
  const previews = ['A', 'B', 'C', 'D', 'E']

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      paddingTop: 40, paddingBottom: 40,
      overflowY: 'auto', WebkitOverflowScrolling: 'touch',
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', width: '100%', maxWidth: 700 }}>
        {MODE_ROWS.map(section => (
          <div key={section.title} style={{ width: '100%' }}>
            <h2 style={{
              color: '#8899bb', fontSize: 13, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase',
              marginBottom: 8, paddingLeft: 4,
            }}>
              {section.title}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {section.modes.map(m => (
                <button key={m.mode} onClick={() => onStartMode(m.mode)} style={{
                  flex: '1 0 auto',
                  padding: '10px 20px', fontSize: 14, fontWeight: 700,
                  background: m.gradient,
                  color: '#fff', border: 'none', borderRadius: 12,
                  letterSpacing: 0.5, cursor: 'pointer',
                }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 36, color: '#556688', fontSize: 12, textAlign: 'center', lineHeight: 2 }}>
        <p>Click letters to pop them!</p>
        <p>Press keyboard keys for bonus points ✨</p>
      </div>
    </div>
  )
}
