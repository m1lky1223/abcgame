<!-- refreshed: 2026-06-07 -->
# Architecture

**Analysis Date:** 2026-06-07

## System Overview

```text
+-----------------------------------------------------------------------------+
|                                  React UI                                   |
|   +-------------------+    +----------------------+    +----------------+   |
|   |    App.tsx        |    |      HUD.tsx         |    |  MainMenu.tsx  |   |
|   |  (Screen State)   |<-->| (Lives, Score overlay)|   | (Mode selector)|   |
|   +---------+---------+    +----------------------+    +----------------+   |
|             |                                                               |
+-------------|---------------------------------------------------------------+
              | mounts
              v
+-------------|---------------------------------------------------------------+
|             v                                                               |
|     GameCanvas.tsx (React Wrapper / Resizing Canvas Component)              |
|             |                                                               |
|             v                                                               |
|     Engine.ts (Core loop via requestAnimationFrame, GameState management)    |
|             |                                                               |
|      +------+--------------------------+-----------------------+            |
|      |                                 |                       |            |
|      v (normalized)                    v (updates/draws)       v (captures) |
|   Input.ts                       GameModeStrategy           Canvas 2D       |
| (DOM Input Listener)             (Base Interface)           Rendering       |
|                                        |                       ctx          |
|                 +----------------------+--------------------+               |
|                 |                      |                    |               |
|                 v                      v                    v               |
|          LetterPopMode        SelfContainedAdapter  ThemedLetterQuestMode   |
|           (Pop modes)            (Arcade modes)        (A-Z themed quests)   |
|                 |                      |                    |               |
|                 v                      v                    v               |
|           LetterPopCore        *Mode.ts (Angry,      *Mode.ts (Bakery,      |
|         (Free, Word, etc.)    Runner, Rescue, etc.)   Garden, Mail, etc.)   |
+-----------------------------------------------------------------------------+
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| **App** | Root component managing screen routing (`menu` vs. `playing`), global state overlays, high scores, custom game setups, and game-over modals. | `src/App.tsx` |
| **GameCanvas** | Canvas React wrapper component. Handles setup/teardown of the animation frame, canvas resizing listeners, and engine instantiation. | `src/components/GameCanvas.tsx` |
| **HUD** | Lightweight DOM-based UI overlay for lives, score, current level, progress stats, and custom title rendering. | `src/components/HUD.tsx` |
| **MainMenu** | Interactive React grid representing all 31+ available game modes grouped by similarity. | `src/components/MainMenu.tsx` |
| **Engine** | Central loop orchestrator. Tracks engine state, schedules `requestAnimationFrame`, pulls normalised inputs, and triggers strategy update/draw loops. | `src/game/Engine.ts` |
| **Input** | Event handler managing low-level window bindings (`mousedown`, `touchstart`, `keydown`, etc.) and event buffering. | `src/game/Input.ts` |
| **GameModeStrategy** | Core interface definitions for game loops and the static mapper constructing concrete inputs relative to client bounds. | `src/game/GameModeStrategy.ts` |
| **SelfContainedAdapter** | Adapter pattern implementation that wraps mini-games (`SelfContainedMode`) to conform to the standard strategy loop. | `src/game/adapters/SelfContainedAdapter.ts` |
| **ThemedLetterQuestMode** | Base template strategy regulating A-Z letter iterations, spawning choice arrays, checking matches, and drawing basic particles. | `src/game/themedQuest/ThemedLetterQuestMode.ts` |
| **LetterPopCore** | Concrete engine implementing floating letter logic, chaser enemies, collision checks, word prompts, and sub-mode mechanics. | `src/game/strategies/LetterPopCore.ts` |
| **LetterPopMode** | Strategy wrapper delegating Engine hooks directly to `LetterPopCore`. | `src/game/strategies/LetterPopMode.ts` |
| **DynamicPromptStrategy** | Custom AI-driven strategy translating user prompts dynamically into custom game rules, backgrounds, and settings. | `src/game/strategies/DynamicPromptStrategy.ts` |
| **GeminiClient** | Dynamic configuration client communicating with Gemini API for system prompt conversion and parameters generation. | `src/game/adapters/GeminiClient.ts` |
| **LocalGenerator** | Fallback logic parser mapping prompts into configurations locally without network requests. | `src/game/adapters/LocalGenerator.ts` |
| **Characters Data** | Read-only configuration database outlining letter colors, outlines, pupils, and role types. | `src/characters/data.ts` |
| **Characters Draw** | Canvas procedures rendering letter body polygons, eyeballs, and pupil orientation targets. | `src/characters/draw.ts` |

## Pattern Overview

**Overall:** Strategy and Adapter Pattern

**Key Characteristics:**
- **Decoupled execution:** The core `Engine` has no knowledge of specific mode rules. It coordinates loop timing, resizing, and input normalization, while delegating mechanics to a `GameModeStrategy`.
- **Targeted adapters:** Mini-games conforming to `SelfContainedMode` are integrated cleanly using `SelfContainedAdapter` which manages clicks and keyboard event mapping internally.
- **Template Method inheritance:** Custom A-Z modes subclass `ThemedLetterQuestMode`, which handles state, correct letter checks, progress increments, and floating pools. Subclasses only specify theme-related colors, backgrounds, HUD panels, and prompts.

## Layers

**Shell / UI Layer:**
- Purpose: Orchestrates layout screens, config settings, game overlays, and custom AI prompt text forms.
- Location: `src/components/`, `src/App.tsx`
- Contains: React TSX components, component state hooks, and high-score managers.
- Depends on: Game Orchestration (`src/game/Engine.ts`)
- Used by: Vite main entry.

**Game Orchestration Layer:**
- Purpose: Normalizes physical pointer events and manages lifecycle methods.
- Location: `src/game/Engine.ts`, `src/game/Input.ts`, `src/game/GameModeStrategy.ts`
- Contains: requestAnimationFrame loops, Input listeners, and canvas scaling controllers.
- Depends on: Shell Layer (callbacks), Game Strategy Layer.
- Used by: `src/components/GameCanvas.tsx`.

**Game Strategy Layer:**
- Purpose: Declares and runs specific gameplay logic, obstacle physics, chaser chase rules, and triggers particle effects.
- Location: `src/game/strategies/`, `src/game/themedQuest/`, `src/game/adapters/`, `src/game/`
- Contains: Strategy implementations, abstract quest classes, and adapters.
- Depends on: Character Definition Layer.
- Used by: `src/game/Engine.ts`.

**Character Definition Layer:**
- Purpose: Establishes visual data profiles (colors and rolls) and generic canvas bezier curves representation.
- Location: `src/characters/`
- Contains: Static styling objects (`CHARACTERS`) and canvas-bound drawing functions (`drawLetter`).
- Depends on: None.
- Used by: Game Strategy Layer.

## Data Flow

### Primary Request Path
1. `requestAnimationFrame` triggers `loop()` inside `src/game/Engine.ts#L189`.
2. The engine polls the `Input` instance and maps cursor positions using `buildGameInput()` inside `src/game/GameModeStrategy.ts#L33`.
3. The engine invokes `strategy.update(gameInput, frame)` inside `src/game/Engine.ts#L205` to advance physics, check collisions, and adjust states.
4. The strategy executes callback triggers `onStateChange` mapped to `Engine.handleStrategyState` inside `src/game/Engine.ts#L141`.
5. The engine updates its local states and invokes its own `onStateChange` callback, which causes the React component state in `src/App.tsx#L22` to update.
6. The engine clears the canvas and invokes `strategy.draw(ctx)` inside `src/game/Engine.ts#L213` to repaint the screen buffer.

**State Management:**
- Transient positions, physics parameters, particle groups, and chaser configurations are preserved locally inside Strategy instances.
- High-level player metrics (current score, remaining lives, ammo counts, current levels, and final winner) are synchronized back to `src/App.tsx` state and rendered declaratively as a overlay HUD DOM element, keeping the canvas rendering loop fast.

## Key Abstractions
**`GameModeStrategy`:**
- Purpose: High-level interface isolating engine logic from specific mode lifecycles.
- Examples: `src/game/strategies/LetterPopMode.ts`, `src/game/adapters/SelfContainedAdapter.ts`.

**`SelfContainedMode`:**
- Purpose: Simplified interface for unique mini-games focusing solely on basic updates, canvas rendering, and explicit inputs.
- Examples: `src/game/AngryMode.ts`, `src/game/ZombieRescueMode.ts`, `src/game/LetterRunnerMode.ts`.

**`ThemedLetterQuestMode`:**
- Purpose: Abstract blueprint enforcing structured, stateful progression from letter A to Z.
- Examples: `src/game/themedQuest/ThemedLetterQuestMode.ts`, inherited by `src/game/BakeryMode.ts`, `src/game/GardenMode.ts`.

## Entry Points
**Vite Entry Point:**
- Location: `src/main.tsx`
- Triggers: Renders `<App />` root into the browser DOM element `#root`.

**React Shell Entry Point:**
- Location: `src/App.tsx`
- Triggers: Controls game mode configurations and boots `<GameCanvas />` overlay.

**Engine Setup:**
- Location: `src/components/GameCanvas.tsx`
- Triggers: Instantiates the `Engine` and triggers `engine.start()` when mounted or configuration changes.

## Architectural Constraints
- **Threading:** Single-threaded execution. High calculation costs (e.g. detailed canvas drawing or collision checks) directly block Vite React DOM rendering and frame rates.
- **Global state:** No shared singletons. Instance contexts flow downward from `App.tsx` to `Engine`, ensuring parallel setups remain independent.
- **Circular imports:** Managed strictly. Strategies notify wrappers of changes via callbacks (`onStateChange`) rather than referencing engine properties.

## Anti-Patterns
### Direct Canvas Drawing in Game Entities
- What happens: Chasers, backgrounds, and letter models draw themselves by writing directly onto native browser `CanvasRenderingContext2D` contexts.
- Why it's wrong: Prevents compiling the simulation code on mobile platforms (e.g., React Native Skia) which do not offer the web Canvas API.
- Do this instead: Decouple drawing routines into an abstract `Renderer` interface (e.g. stage 1 target roadmap) and pass this interface wrapper.

### Direct DOM Event Handling in Gameplay Logic
- What happens: Reading window touch or keyboard event registers directly inside strategy update loops.
- Why it's wrong: Breaks multi-platform gesture handlers and compromises control portability.
- Do this instead: Inspect normalized pointer actions using the `GameInput` parameters.

---
*Architecture analysis: 2026-06-07*
