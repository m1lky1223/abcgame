# ABC World

Educational alphabet game for ages 4+. Featuring **Alphabet Lore**, **Zombie Alphabet**, and **OddBods** characters across 31 game modes.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173/abcgame/](http://localhost:5173/abcgame/)

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | Typecheck only (`tsc --noEmit`) |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:smoke` | Run automated browser smoke test |

## Tech Stack

- **Web**: Vite + React 19 + Canvas 2D
- **Mobile** (in progress): React Native (Expo) + `@shopify/react-native-skia`
- **Language**: TypeScript
- **Characters**: 26 Alphabet Lore letters drawn with body + eyes (`src/characters/data.ts`)

## Architecture

The game engine uses a **Renderer interface** pattern to support multiple rendering backends:

```
Renderer (interface)
  ├── Canvas2DRenderer   — Web (Canvas 2D) ✓ live
  └── SkiaRenderer       — Mobile (React Native Skia) — in progress
```

All 31+ game modes draw through `Renderer` — zero direct `CanvasRenderingContext2D` calls outside the renderer implementation. The `Engine` loop accepts `Renderer + InputBoundsProvider` and is fully platform-agnostic.

### Shared core (`src/game/`)
- Strategy pattern: `GameModeStrategy` → 6 core modes via `LetterPopCore`, self-contained modes and mini-games via `SelfContainedAdapter`
- `GameInput` / `Gesture` — unified input abstraction (keyboard, mouse, touch, swipe, drag)
- All game logic, physics, and AI is shared between Web and Mobile builds

### Project structure

| Path | Role |
|------|------|
| `src/renderer/Renderer.ts` | Renderer interface (drawing abstraction) |
| `src/renderer/Canvas2DRenderer.ts` | Web Canvas 2D implementation |
| `src/game/Engine.ts` | Game loop orchestrator |
| `src/game/GameModeStrategy.ts` | Strategy interface + GameInput types |
| `src/game/strategies/` | Strategy implementations |
| `src/game/adapters/` | Adapter for self-contained mini-games |
| `src/characters/` | Letter data (`data.ts`) + drawing logic |
| `src/components/` | React overlays (MainMenu, HUD, GameCanvas) |

## Game Modes

| Category | Modes |
|----------|-------|
| **Core** | Free Pop, Word Pop, Survival, Time Attack, Word Race, Defense |
| **Arcade** | Odd Birds, Rescue, Carnival, Dance Academy, Runner, Evolution Lab, Alphabet Arcade, Kart Racer |
| **Mini-Games** | Balloon Pop, Memory Match, Chef Kitchen, Detective, Zombie School, Pirate Hunt, Circus, Shooting Gallery, Pizza Delivery, Construction, Mail Carriers, Alphabet Garden, Firefighters, Zombie Doctor, Alphabet Train, Space Explorers, Zombie Bakery, Alphabet Aquarium, Suika Merge, Pinball, Tower Defense, Zombie Diner, Letter Maze |

## Mobile Port Status

Phase 1 (Renderer Interface Decoupling) — **complete**. Phases 2–4 pending.

| Phase | Status |
|-------|--------|
| 1. Renderer Interface Decoupling | ✅ Complete |
| 2. React Native Shell & Code Sharing | ⏳ Not started |
| 3. Skia Renderer & Touch Input | ⏳ Not started |
| 4. Android APK Build | ⏳ Not started |

See `.planning/` for detailed roadmap and state.
