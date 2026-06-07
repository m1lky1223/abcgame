# Codebase Concerns

**Analysis Date:** 2026-06-07

## Tech Debt

**Coupling of Graphics to HTML5 Canvas API:**
- Issue: Visual rendering logic is directly coupled to standard HTML5 Canvas 2D context (`CanvasRenderingContext2D`). The planned Renderer interface (`Canvas2DRenderer` for web vs `SkiaRenderer` for mobile) has not been implemented.
- Files: `src/characters/draw.ts`, `src/game/Background.ts`, `src/game/FloatingLetter.ts`, `src/game/ZombieChaser.ts`, `src/game/OddbodChaser.ts`, and all 38 self-contained game modes (e.g. `src/game/OddbodKartRacer.ts`, `src/game/SuikaMode.ts`, `src/game/AlphabetArcadeMode.ts`).
- Impact: Blockers for compiling the application for mobile (React Native + Skia) without a complete rewrite of all graphics routines.
- Fix approach: Define a unified `Renderer` interface with basic drawing operations (e.g. `drawText`, `drawRect`, `drawCircle`, `save`, `restore`). Implement `Canvas2DRenderer` for Web and `SkiaRenderer` for Mobile. Refactor all entities to interact with the abstraction instead of direct HTML5 Context.

**Global HUD Hardcoding in Main App:**
- Issue: Hiding/showing the global HUD is hardcoded in the root wrapper layout via custom mode name exceptions.
- Files: `src/App.tsx` (lines 126-128)
- Impact: High maintenance overhead; adding or renaming custom mini-games requires updates to the root React code to avoid HUD overlapping.
- Fix approach: Add a queryable property/method (e.g. `hasGlobalHUD(): boolean`) on the `GameModeStrategy` interface and check this state on the active strategy instance.

## Known Bugs

**Incomplete Keyboard Control Mapping in SelfContainedAdapter:**
- Symptoms: Keyboard-driven selections and gameplay movements are partially broken in self-contained modes. For instance, in `OddbodKartRacer` and `LetterRunnerMode`, selecting characters via numeric keys (`1`, `2`, `3`) is impossible because the adapter filters keys. Similarly, jumping with `ArrowUp` in `LetterRunnerMode` is ignored.
- Files: `src/game/adapters/SelfContainedAdapter.ts` (lines 47-53)

**Runtime Crashes on Mobile (React Native) via `localStorage`:**
- Symptoms: Reading/writing high scores or game states directly accesses browser `localStorage`. When running on React Native, this will cause immediate runtime crashes with `ReferenceError: localStorage is not defined`.
- Files: `src/game/strategies/DynamicPromptStrategy.ts`, `src/game/strategies/LetterPopCore.ts`, `src/game/BalloonPopMode.ts`, `src/game/EvolutionLabMode.ts`, `src/game/LetterMazeMode.ts`, `src/game/LetterRunnerMode.ts`, `src/game/OddbodKartRacer.ts`, `src/game/PinballMode.ts`, `src/game/SuikaMode.ts`, `src/game/ZombieDefenseMode.ts`, `src/game/ZombieDinerMode.ts`, and `src/components/AIPromptCreator.tsx`.

## Security Considerations

**Exposed Client-Side Gemini API Keys:**
- Risk: The user's Gemini API key is collected inside the UI and stored in plain text in client-side `localStorage`. Because the game communicates directly from the browser context to the Google APIs, the API key is fully exposed in network payloads and developer console inspection.
- Files: `src/components/AIPromptCreator.tsx` (lines 25-35), `src/game/adapters/GeminiClient.ts` (lines 109-111).

## Performance Bottlenecks

**Frame-rate Dependent Game Loop (No Delta Time):**
- Problem: The game engine update steps receive frames but do not track or incorporate elapsed time delta (`dt`). Playing on high-refresh-rate displays (120Hz/144Hz monitors, Apple ProMotion) causes the game physics, speed vectors, timers, and enemy spawns to run twice as fast.
- Files: `src/game/Engine.ts` (lines 189-196), `src/game/GameModeStrategy.ts`, `src/game/strategies/DynamicPromptStrategy.ts`, `src/game/strategies/LetterPopCore.ts`.

**Garbage Collection Thrashing in Game Loop:**
- Problem: Iterative object allocations (creating fresh gesture arrays in `buildGameInput` per frame, spawning new particle elements, measuring text fonts in draw cycles) lead to frequent CPU overhead and frame stutter due to frequent browser garbage collection.
- Files: `src/game/GameModeStrategy.ts` (`buildGameInput`), `src/game/strategies/DynamicPromptStrategy.ts`, `src/characters/draw.ts`.

## Fragile Areas

**Massive Unit Test Coverage Deficit for Arcade Modes:**
- Module: `src/game/`
- Why fragile: Only ~10 out of the 38 total game modes have active unit tests in the test suite. Breaking changes to shared character AI (`ZombieChaser.ts`, `OddbodChaser.ts`) or letter updates can break other untested modes without failing the test runner.

**High-Level Graphics Mocking in Unit Tests:**
- Module: `src/__tests__/setup.ts`
- Why fragile: Layout calculations and coordinate boundaries are checked against static mock assertions. This mock verification masks issues with canvas scaling, DPI resolution, and actual browser render cycles.

---
*Concerns audit: 2026-06-07*
