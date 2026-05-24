# AGENTS.md — ABC World

Educational alphabet game for ages 4+. Three IP pillars: **Alphabet Lore**, **Zombie Alphabet**, **OddBods**. Web (Vite + React + Canvas) and mobile (React Native + Skia).

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | `tsc --noEmit` (typecheck only) |

`build` already runs typecheck — `lint` is redundant but kept for CI clarity.

## Product pillars

| Pillar | Source | Used in |
|--------|--------|---------|
| Alphabet Lore | `src/characters/data.ts` (26 letters) | All modes — primary letter characters |
| Zombie Alphabet | `src/game/ZombieChaser.ts`, `src/game/ZombieRescueMode.ts` | Survival, Defense, Rescue, ZombieSchool |
| OddBods | `src/game/OddbodChaser.ts`, `src/game/CarnivalMode.ts` | Free Pop, Survival, Carnival, Angry Birds-style modes |

## All 17 game modes

### Core (engine-based)
| Mode | Description |
|------|-------------|
| **Free Pop** | Pop floating letters. Collect all 26 before OddBods do. |
| **Word Pop** | Emoji + word with a blank. Pop the correct letter. |
| **Survival** | ❤️ 3 lives. Avoid OddBods & Zombies. |
| **Time Attack** | ⏱️ 60s score rush. |
| **Word Race** | 🔤 Spell the word in order, chasers pursue. |
| **Defense** | 🛡️ Protect letters, click to kill chasers. |

### Self-contained (mini-games)
| Mode | Description |
|------|-------------|
| **Odd Birds** | 🐦 Angry Birds-style. Launch projectiles at letter blocks. |
| **Rescue** | 🏚️ Free caged letters from zombies. |
| **Carnival** | 🎪 7 booths: balloon pop, fire ring, candy catch, etc. |
| **Dance Academy** | 💃 Follow the letter dance pattern. |
| **Runner** | 🏃 Endless runner, collect letters, avoid obstacles. |
| **Evolution Lab** | 🧬 Merge letters to evolve. |
| **Balloon Pop** | 🎈 Pop letter balloons. |
| **Memory Match** | 🧠 Flip cards, match letter pairs. |
| **Chef Kitchen** | 👨‍🍳 Cook recipes by finding the right letters. |
| **Detective** | 🔍 Solve letter-based mysteries. |
| **Zombie School** | 📚 Survive lessons while zombies chase. |

## Architecture (current + planned)

### Current
```
Engine.ts (1153 lines, monolith)
  ├── if-else ladder for mode dispatch (start/restart/update/draw)
  ├── Input.ts (window event listeners)
  ├── Background.ts (Canvas 2D)
  ├── FloatingLetter.ts + OddbodChaser.ts + ZombieChaser.ts
  └── 11 self-contained modes (each with own update/draw/input)
```

### Planned (after refactor)
```
Engine.ts (thin orchestrator)
  ├── GameModeStrategy interface
  │   ├── LetterPopMode (free/word/survival/timeattack/wordrace/defense)
  │   └── SelfContainedAdapter wrapping each mini-game
  ├── Input → GameInput (processed once per frame)
  ├── Background → Renderer
  └── Renderer interface
      ├── Canvas2DRenderer (web)
      └── SkiaRenderer (React Native mobile)
```

## Platform split

| Layer | Web | Mobile |
|-------|-----|--------|
| Shell | Vite + React 19 | React Native (Expo) |
| Renderer | `<canvas>` + `Canvas2DRenderer` | `@shopify/react-native-skia` + `SkiaRenderer` |
| Input | DOM events (keyboard, mouse, touch) | Gesture handler (tap, swipe) |
| Game core | **Shared** — all `.ts` in `src/game/`, `src/characters/` |
| UI | React components overlay | React Native components overlay |

## Project structure (post-refactor)

| Path | Role |
|------|------|
| `src/App.tsx` | Root — screen state, mode routing, game-over overlay |
| `src/game/Engine.ts` | Thin orchestrator: owns loop, delegates to strategy |
| `src/game/GameModeStrategy.ts` | Strategy interface + GameInput type |
| `src/game/strategies/` | One file per strategy: `LetterPopMode`, `AngryMode`, `RescueMode`, etc. |
| `src/game/adapters/SelfContainedAdapter.ts` | Generic wrapper for mini-games |
| `src/renderer/Renderer.ts` | Renderer interface |
| `src/renderer/Canvas2DRenderer.ts` | Web Canvas 2D implementation |
| `src/renderer/SkiaRenderer.ts` | RN Skia implementation (mobile only) |
| `src/characters/data.ts` | 26 letter definitions — pure data |
| `src/characters/draw.ts` | Letter body + eye drawing logic (moves into Renderer) |
| `src/game/Input.ts` | Unified input handling |
| `src/game/Background.ts` | Night sky background (moves into Renderer) |
| `src/game/FloatingLetter.ts` | Bouncing letter with pop particles |
| `src/game/OddbodChaser.ts` | OddBod enemy AI + drawing (drawing moves into Renderer) |
| `src/game/ZombieChaser.ts` | Zombie enemy AI + drawing (drawing moves into Renderer) |
| `src/game/words.ts` | Word list with emojis for Word Pop |
| `src/components/` | `MainMenu`, `HUD`, `GameCanvas` |

## Key conventions

- Characters drawn as **letter shapes** with eyes (matching Alphabet Lore series). Colors from official reference (`#D24545` for A, etc.).
- Keyboard input uses `wasPressed` (just-pressed per frame). Mouse/touch via coordinates.
- Add new characters in `src/characters/data.ts` only — drawing handles any letter generically.
- Add new words in `src/game/words.ts` — each needs `word`, `emoji`, `blankIndex`.
- **To add a new mode**: implement `GameModeStrategy`, register it in the factory. Zero Engine.ts changes.
- `CharacterDef` fields: `bodyColor`, `outlineColor`, `eyeWhiteColor`, `pupilColor`, `eyelidColor?`, `role` (`hero`/`enemy`/`ally`).

## Input system

`GameInput` is the unified input object computed once per frame by Engine and passed to every strategy:

```typescript
interface GameInput {
  gestures: Gesture[]
  wasPressed(key: string): boolean
  isDown(key: string): boolean
  mouseDown: boolean
  mouseX: number
  mouseY: number
  justReleased: boolean
}
```

`Gesture` normalizes touch and mouse into a shared format:

```typescript
interface Gesture {
  type: 'tap' | 'drag' | 'swipe' | 'longpress'
  x: number
  y: number
  dx?: number  // delta x (drag/swipe)
  dy?: number  // delta y (drag/swipe)
}
```

| Source | Web | Mobile |
|--------|-----|--------|
| Keyboard | DOM `keydown`/`keyup` | Software keyboard / hardware keys |
| Tap/click | `click` event → `Gesture.tap` | Gesture handler → `Gesture.tap` |
| Drag | `mousedown`+`mousemove`+`mouseup` → `Gesture.drag` | Pan gesture → `Gesture.drag` |
| Swipe | Derived from drag velocity | Swipe gesture → `Gesture.swipe` |
| Long-press | `setTimeout` on mousedown | Long-press gesture → `Gesture.longpress` |

Strategies should prefer `gestures` for touch interactions and `wasPressed`/`isDown` for keyboard.

## Agent personas

Located in `.ai/agents/` — used for role-played code review and planning:

| Persona | File | Role |
|---------|------|------|
| **Staff Engineer** | `.ai/agents/staff.md` | Architecture, performance, code review |
| **Product Owner** | `.ai/agents/owner.md` | Roadmap, scope, player experience |
| **QA Engineer** | `.ai/agents/qa.md` | Testing, cert, regression risk |
