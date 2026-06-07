# Testing Patterns

**Analysis Date:** 2026-06-07

## Test Framework
- **Runner:** 
  - Vitest (`vitest`) for unit and integration testing.
  - Playwright (`playwright`) for end-to-end browser smoke testing.
- **Assertion Library:** Vitest's built-in Jest-compatible assertions (`expect`).
- **Run Commands:**
  - Unit/Integration Tests: `npm run test` (executes `vitest run` once).
  - Smoke Tests: `npm run test:smoke` (executes `npx vite --port 5173 & sleep 3 && node smoke-test.mjs && kill %1` to launch the dev server, run the smoke test suite using Playwright, and then shut down the server).

## Test File Organization
- **Location:** Separate. All test files are located in `src/__tests__/`.
- **Naming:** 
  - Test suites are named `[Target].test.ts`, matching the corresponding implementation file, e.g., `src/__tests__/Input.test.ts` for `src/game/Input.ts`.
  - Global test environment configuration is stored in `src/__tests__/setup.ts`.

## Test Structure
Unit tests follow a standard `describe` -> `it` -> `expect` nested block pattern. Here is the structure used in `src/__tests__/BalloonPopMode.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { BalloonPopMode } from '../game/BalloonPopMode'

describe('BalloonPopMode', () => {
  it('starts at wave 1 with zero score', () => {
    const game = new BalloonPopMode(800, 600)
    expect((game as any).wave).toBe(1)
    expect((game as any).score).toBe(0)
    expect((game as any).win).toBe(false)
  })

  it('saves high score to localStorage', () => {
    const game = new BalloonPopMode(800, 600)
    ;(game as any).score = 100
    ;(game as any).checkHighScore()
    expect(localStorage.getItem('hs_balloon')).toBe('100')
  })
})
```

## Mocking
- **Framework:** Vitest's utility object `vi`.
- **Patterns:**
  - **Global Environment Mocks:** Configured in `src/__tests__/setup.ts`. Since the environment is `happy-dom` (specified in `vite.config.ts`), HTML5 Canvas APIs do not exist natively. The setup file stubs:
    - `CanvasRenderingContext2D` methods (such as `fillRect`, `beginPath`, `drawImage`, and `measureText`) using `vi.fn()`.
    - `HTMLCanvasElement.prototype.getContext` to return the mock context object.
    - `HTMLCanvasElement.prototype.getBoundingClientRect` to return a static rect layout (`800x600`).
    - `localStorage` stubbed globally via `vi.stubGlobal('localStorage', ...)` backed by a simple in-memory `Map` store.
  - **State-Change Invocations:** Spying on game-loop events by replacing callbacks on instance properties, e.g.:
    ```typescript
    const cb = vi.fn()
    game.onStateChange = cb
    game.handleKey(correctLetter)
    expect(cb).toHaveBeenCalled()
    ```
  - **Class Method Stubbing:** Dynamically overriding inputs or keys to simulate user input during a frame update (seen in `src/__tests__/LetterPopCore.test.ts`):
    ```typescript
    input.wasPressed = vi.fn((k: string) => k === targetKey)
    ```

## Coverage
- **Requirements:** 
  - There is no strict code coverage threshold configuration in the workspace.
  - Test suites focus on verifying critical state mutations (e.g., scoring, combos, waves progress, game over, lives decay) across all strategy behaviors.
  - The E2E smoke test (`smoke-test.mjs`) exercises browser interaction by launching Chromium, navigating to the Vite dev server, clicking on each of the 20 main game modes, and verifying that a `<canvas>` element mounts successfully without scripting errors.

---
*Testing analysis: 2026-06-07*
