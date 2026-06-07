# Coding Conventions

**Analysis Date:** 2026-06-07

## Naming Patterns
- **Files:**
  - React components use `PascalCase` with a `.tsx` extension, e.g., `src/App.tsx`, `src/components/HUD.tsx`, `src/components/MainMenu.tsx`.
  - Game engine, adapters, and custom strategies use `PascalCase` with a `.ts` extension, e.g., `src/game/Engine.ts`, `src/game/FloatingLetter.ts`, `src/game/adapters/GeminiClient.ts`.
  - Game mode strategies follow the `*Mode.ts` pattern, e.g., `src/game/BalloonPopMode.ts`, `src/game/CircusMode.ts`, or the `*Strategy.ts` pattern, e.g., `src/game/strategies/DynamicPromptStrategy.ts`.
  - AI Chaser classes end with `*Chaser.ts`, e.g., `src/game/OddbodChaser.ts`, `src/game/ZombieChaser.ts`.
  - Test files are grouped together under `src/__tests__/` and named with a `*.test.ts` pattern, e.g., `src/__tests__/Input.test.ts`. The global configuration file is `src/__tests__/setup.ts`.
- **Functions:** `camelCase` for normal functions and callback handlers (e.g., `buildGameInput`, `handleStateChange` in `src/game/GameModeStrategy.ts` and `src/App.tsx`). React functional components themselves use `PascalCase` (e.g., `App`, `HUD`).
- **Variables:** `camelCase` for local variables, loop indexes, parameters, and class attributes/properties (e.g., `bobPhase`, `correctPulse`, `particles` in `src/game/FloatingLetter.ts`). Constants use `UPPER_SNAKE_CASE` (e.g., `SWIPE_THRESHOLD` in `src/game/GameModeStrategy.ts`, `WORDS` in `src/game/words.ts`).
- **Types:** Types and interfaces use `PascalCase` (e.g., `Gesture`, `GameInput`, `GameModeStrategy` in `src/game/GameModeStrategy.ts`). Type assertions use the `as` syntax (e.g., `{} as HTMLCanvasElement` in `src/__tests__/setup.ts`).

## Code Style
- **Formatting:** 
  - Indentation is strictly 2 spaces.
  - Semicolons are omitted in almost all TS/TSX files.
  - String quotes: Double quotes are preferred for JSX/HTML attributes, inline CSS properties, and events (e.g., `type: "tap"`). Single quotes are used for module imports, types, or general string constants (e.g., `import { vi } from 'vitest'`).
  - Class structures explicitly define property types before constructors and methods (e.g., `src/game/FloatingLetter.ts`).
  - No dedicated formatting packages (such as Prettier) are configured in `package.json`.
- **Linting:**
  - Type-checking is performed via the TypeScript compiler (`tsc --noEmit`) which acts as the linter.
  - Run command: `npm run lint` maps to `tsc --noEmit` (configured in `package.json`).
  - Strict type checking rules are enforced in `tsconfig.app.json` with `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"noFallthroughCasesInSwitch": true`, and `"noUncheckedSideEffectImports": true`.

## Import Organization
- **Order:**
  - Standard React core hooks and React modules first (e.g., `import { useCallback, useRef, useState } from 'react'`).
  - Project engines, strategies, and adapters (e.g., `import { Engine, GameState, GameMode } from './game/Engine'`).
  - UI Components (e.g., `import GameCanvas from './components/GameCanvas'`).
  - Data models, helper functions, and assets (e.g., `import { WORDS } from '../game/words'`).
- **Path Aliases:** Path aliases are not used. All imports leverage relative file system paths (e.g., `../characters/draw`, `./Input`).

## Error Handling
- **Patterns:**
  - Asynchronous network calls (such as fetching data from APIs like Gemini) use `try/catch` blocks (e.g., in `src/game/adapters/GeminiClient.ts` and `src/components/AIPromptCreator.tsx`).
  - Custom errors are thrown via `throw new Error(...)` describing response codes or empty payloads.
  - Graceful fallback strategies are integrated into catch blocks to keep the application responsive. For instance, when the Gemini API request fails in `src/game/adapters/GeminiClient.ts`, it logs the error and falls back to `generateLocalConfig(prompt)`.

## Logging
- **Framework:** No external logging library is used. All logs are handled by the browser's native `Console` API.
- **Patterns:**
  - Catch blocks in application services and UI components log failures using `console.error(err)` or `console.error('message', err)` (e.g., in `src/game/adapters/GeminiClient.ts` and `src/components/AIPromptCreator.tsx`).
  - Build/test scripts use `console.log()` to notify execution progress (e.g., `smoke-test.mjs`).

---
*Convention analysis: 2026-06-07*
