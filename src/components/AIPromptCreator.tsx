import { useState, useEffect } from 'react'
import { generateGeminiConfig } from '../game/adapters/GeminiClient'
import { DynamicGameConfig } from '../game/adapters/LocalGenerator'

interface AIPromptCreatorProps {
  onStartGame: (config: DynamicGameConfig) => void
  onClose: () => void
}

const SUGGESTIONS = [
  'Spooky ghost chase in a sweet candy forest',
  'Galactic shooter spelling CAT with rapid lasers',
  'Zen mode popping slow vowels in low gravity',
  'Volcano survival dodging fast fire zombies',
  'Spelling racing spelling HELLO in space'
]

export default function AIPromptCreator({ onStartGame, onClose }: AIPromptCreatorProps) {
  const [prompt, setPrompt] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [generatedConfig, setGeneratedConfig] = useState<DynamicGameConfig | null>(null)

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('gemini_api_key') || ''
    setApiKey(savedKey)
  }, [])

  const handleSaveApiKey = (val: string) => {
    setApiKey(val)
    localStorage.setItem('gemini_api_key', val)
  }

  const handleGenerate = async (overridePrompt?: string) => {
    const activePrompt = overridePrompt !== undefined ? overridePrompt : prompt
    if (!activePrompt.trim()) return

    setLoading(true)
    setGeneratedConfig(null)
    setLoadingStage(0)

    // Simulate compilation steps for visual premium feedback
    const stages = [
      'Analyzing prompt parameters...',
      'Synthesizing visual theme...',
      'Balancing letter movement algorithms...',
      'Configuring chaser mechanics...',
      'Assembling final package...'
    ]

    const interval = setInterval(() => {
      setLoadingStage(prev => {
        if (prev < stages.length - 1) {
          return prev + 1
        }
        clearInterval(interval)
        return prev
      })
    }, 700)

    try {
      const config = await generateGeminiConfig(activePrompt, apiKey)
      
      // Ensure the loading sequence finishes or waits at least 2.5 seconds
      setTimeout(() => {
        clearInterval(interval)
        setGeneratedConfig(config)
        setLoading(false)
      }, 2500)
      
    } catch (err) {
      console.error(err)
      clearInterval(interval)
      setLoading(false)
    }
  }

  const getThemeEmoji = (bg: string) => {
    switch (bg) {
      case 'space': return '🌌 SPACE'
      case 'volcano': return '🌋 VOLCANO'
      case 'underwater': return '🐠 DEEP SEA'
      case 'candy': return '🧁 CANDY'
      case 'forest': return '🌲 FOREST'
      case 'desert': return '🏜️ DESERT'
      default: return '🌃 NIGHT SKY'
    }
  }

  const getControlsLabel = (ctrl: string) => {
    if (ctrl === 'shooter') return '🎯 CROSSHAIR SHOOTER'
    if (ctrl === 'keyboard') return '⌨️ KEYBOARD TYPING'
    return '👆 DIRECT TOUCH POP'
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(7, 9, 21, 0.95)',
      backdropFilter: 'blur(20px)',
      zIndex: 100,
      padding: 24,
      color: '#fff',
      overflowY: 'auto'
    }}>
      {/* Outer Card Container */}
      <div style={{
        width: '100%',
        maxWidth: 620,
        background: 'rgba(25, 30, 48, 0.55)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        padding: '32px 24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255,255,255,0.02)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute', top: 20, right: 20,
            background: 'none', border: 'none',
            color: '#8899bb', fontSize: 24, cursor: 'pointer',
            opacity: loading ? 0.3 : 1
          }}
        >
          ✕
        </button>

        <h2 style={{
          fontSize: 28, fontWeight: 900,
          background: 'linear-gradient(90deg, #ff7b00, #ffae00, #00f0ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8, textAlign: 'center',
          letterSpacing: 1
        }}>
          AI GAME CREATOR
        </h2>
        <p style={{ color: '#8899bb', fontSize: 13, marginBottom: 24, textAlign: 'center', lineHeight: 1.5 }}>
          Type what kind of game you want to play, and watch the game generate the rules, themes, controls, and physics on the fly!
        </p>

        {/* Text Input Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#8899bb', letterSpacing: 1 }}>
            DESCRIBE YOUR GAME
          </label>
          <textarea
            disabled={loading}
            placeholder="e.g., Space shooter where letters fly down fast and you shoot them with ice spells..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            style={{
              width: '100%', height: 90,
              background: 'rgba(10, 12, 22, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 14,
              padding: 12, color: '#fff',
              fontSize: 14, resize: 'none',
              fontFamily: 'inherit', outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Suggestion Chips */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#8899bb', display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>
            QUICK PROMPT INSPIRATIONS:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                disabled={loading}
                onClick={() => setPrompt(s)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20,
                  padding: '6px 12px',
                  color: '#ccc', fontSize: 12,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                💡 {s}
              </button>
            ))}
          </div>
        </div>

        {/* Offline Compiler Cheat Sheet */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          padding: 14,
          marginBottom: 24,
          fontSize: 12,
          lineHeight: 1.4,
          color: '#8899bb'
        }}>
          <div style={{ fontWeight: 700, color: '#ffae00', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, letterSpacing: 0.5 }}>
            💡 OFFLINE COMPILER GUIDE (NO API KEY)
          </div>
          <p style={{ margin: '0 0 8px 0', fontSize: 11, color: '#8899bb' }}>
            When playing offline without an AI key, the compiler parses specific keywords in your prompt:
          </p>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#ccc', display: 'flex', flexDirection: 'column', gap: 4, listStyleType: 'disc' }}>
            <li><strong>Theme:</strong> Include <code>space</code>, <code>volcano</code>, <code>sea</code>/<code>underwater</code>, <code>candy</code>, <code>forest</code>/<code>garden</code>, or <code>desert</code>.</li>
            <li><strong>Controls:</strong> Include <code>shoot</code>/<code>cannon</code> (shooter blaster) or <code>keyboard</code>/<code>type</code> (keyboard typing). Default is direct touch pop.</li>
            <li><strong>Letters Pool:</strong> Include <code>vowels</code>, <code>consonants</code>, or write <code>spell CAT</code> / <code>word HELLO</code> to spell custom words.</li>
            <li><strong>Difficulty & Lives:</strong> Include <code>fast</code>/<code>extreme</code> (1 life, fast speed) or <code>slow</code>/<code>easy</code> (5 lives, slow speed).</li>
          </ul>
        </div>

        {/* API Key settings (collapsed toggle) */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 12, padding: 12,
          marginBottom: 24, border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <label style={{
            fontSize: 11, fontWeight: 700, color: '#8899bb',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', cursor: 'pointer', letterSpacing: 0.5
          }}>
            <span>🔑 USE ADVANCED GEMINI AI (OPTIONAL)</span>
            <span style={{ fontSize: 9, color: '#58d68d', border: '1px solid #58d68d', borderRadius: 4, padding: '1px 4px' }}>
              RECOMMENDED
            </span>
          </label>
          <input
            disabled={loading}
            type="password"
            placeholder="Enter Gemini API Key (leaves blank for instant local parser)"
            value={apiKey}
            onChange={e => handleSaveApiKey(e.target.value)}
            style={{
              width: '100%', marginTop: 8,
              background: 'rgba(10, 12, 22, 0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '8px 12px',
              color: '#fff', fontSize: 12, outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <p style={{ margin: '6px 0 0 0', color: '#667799', fontSize: 10, lineHeight: 1.4 }}>
            If left blank, our smart keyword-based compiler creates your game immediately offline. Enter a key to unlock creative, descriptive AI generation.
          </p>
        </div>

        {/* LOADING ANIMATION */}
        {loading && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '20px 0'
          }}>
            {/* Spinning Loader */}
            <div style={{
              width: 36, height: 36,
              border: '3px solid rgba(255, 255, 255, 0.1)',
              borderTopColor: '#ffae00',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: 16
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            
            {/* Compiling Stages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              {[
                'Analyzing prompt parameters...',
                'Synthesizing visual theme...',
                'Balancing letter movement algorithms...',
                'Configuring chaser mechanics...',
                'Assembling final package...'
              ].map((stage, idx) => {
                const isActive = idx === loadingStage
                const isPassed = idx < loadingStage
                return (
                  <div key={idx} style={{
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#ffae00' : isPassed ? '#58d68d' : '#556688',
                    transition: 'all 0.3s',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <span>{isPassed ? '✓' : isActive ? '●' : '○'}</span>
                    <span>{stage}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CONFIG REVIEW CARD */}
        {generatedConfig && !loading && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(88, 214, 141, 0.08), rgba(0, 240, 255, 0.03))',
            border: '2px solid rgba(88, 214, 141, 0.3)',
            borderRadius: 16,
            padding: 18,
            marginBottom: 24,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{
              margin: '0 0 4px 0', fontSize: 13,
              fontWeight: 800, color: '#58d68d',
              letterSpacing: 2, textTransform: 'uppercase'
            }}>
              ✨ GENERATED GAME MODE
            </h3>
            
            <h4 style={{ margin: '0 0 12px 0', fontSize: 22, fontWeight: 900, color: '#fff' }}>
              {generatedConfig.title}
            </h4>

            {/* Config Specs Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px 16px',
              fontSize: 12,
              color: '#ccddee',
              marginBottom: 16
            }}>
              <div>
                <span style={{ color: '#8899bb', display: 'block', fontSize: 10, fontWeight: 700 }}>THEME</span>
                {getThemeEmoji(generatedConfig.theme.background)}
              </div>
              <div>
                <span style={{ color: '#8899bb', display: 'block', fontSize: 10, fontWeight: 700 }}>CONTROLS</span>
                {getControlsLabel(generatedConfig.controls.interaction)}
              </div>
              <div>
                <span style={{ color: '#8899bb', display: 'block', fontSize: 10, fontWeight: 700 }}>LETTERS POOL</span>
                🔤 {generatedConfig.letters.pool.toUpperCase()}
              </div>
              <div>
                <span style={{ color: '#8899bb', display: 'block', fontSize: 10, fontWeight: 700 }}>ENEMY THREAT</span>
                👾 {generatedConfig.enemies.type.toUpperCase()}
              </div>
              <div>
                <span style={{ color: '#8899bb', display: 'block', fontSize: 10, fontWeight: 700 }}>GOAL</span>
                🏆 {generatedConfig.rules.winCondition.toUpperCase()}
              </div>
              <div>
                <span style={{ color: '#8899bb', display: 'block', fontSize: 10, fontWeight: 700 }}>DIFFICULTY</span>
                🔥 {generatedConfig.letters.maxSpeed > 2.2 ? 'FAST' : 'NORMAL'}
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8, padding: 10, fontSize: 11,
              lineHeight: 1.4, color: '#aabccc', borderLeft: '3px solid #00f0ff'
            }}>
              <strong>How to play:</strong> {generatedConfig.instruction}
            </div>
          </div>
        )}

        {/* Generate/Start Action Buttons */}
        {!loading && (
          <div style={{ display: 'flex', gap: 12 }}>
            {generatedConfig ? (
              <>
                <button
                  onClick={() => setGeneratedConfig(null)}
                  style={{
                    flex: 1, padding: '14px 20px',
                    fontSize: 14, fontWeight: 700,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, color: '#fff',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  ✏️ EDIT PROMPT
                </button>
                <button
                  onClick={() => onStartGame(generatedConfig)}
                  style={{
                    flex: 2, padding: '14px 20px',
                    fontSize: 14, fontWeight: 900,
                    background: 'linear-gradient(135deg, #00ff87 0%, #60efff 100%)',
                    border: 'none', borderRadius: 12,
                    color: '#070915', cursor: 'pointer',
                    boxShadow: '0 0 16px rgba(0,255,135,0.4)',
                    transition: 'all 0.2s'
                  }}
                >
                  🎮 PLAY DYNAMIC MODE
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                <button
                  onClick={() => handleGenerate()}
                  disabled={!prompt.trim()}
                  style={{
                    flex: 2, padding: '16px 20px',
                    fontSize: 15, fontWeight: 800,
                    background: prompt.trim()
                      ? 'linear-gradient(135deg, #ff7b00 0%, #ffae00 100%)'
                      : 'rgba(255,255,255,0.06)',
                    border: 'none', borderRadius: 14,
                    color: prompt.trim() ? '#070915' : '#556688',
                    cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: prompt.trim() ? '0 0 20px rgba(255,174,0,0.3)' : 'none',
                    transition: 'all 0.2s', letterSpacing: 0.5
                  }}
                >
                  🚀 COMPILE GAME CODE
                </button>
                <button
                  onClick={() => {
                    setPrompt('random')
                    handleGenerate('random')
                  }}
                  style={{
                    flex: 1.2, padding: '16px 20px',
                    fontSize: 15, fontWeight: 800,
                    background: 'linear-gradient(135deg, #9b51e0 0%, #bb6bd9 100%)',
                    border: 'none', borderRadius: 14,
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(155,81,224,0.3)',
                    transition: 'all 0.2s', letterSpacing: 0.5
                  }}
                >
                  🎲 RANDOM GAME
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
