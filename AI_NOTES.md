# AI Developer Notes

This document provides developer guidelines, structural gotchas, and idiom cheat-sheets specifically tailored for AI assistants and LLMs working in this repository.

---

## 1. Quick Navigation

Before making changes, familiarize yourself with these primary documentation entries:
- **[AGENTS.md](file:///Users/rony/dev/abcgame/AGENTS.md)**: Product pillars, list of all 31+ game modes, platform details, folder structures, and developer commands.
- **[ARCHITECTURE.md](file:///Users/rony/dev/abcgame/ARCHITECTURE.md)**: System topology, game loop lifecycles, state synchronization, input normalization pipelines, and future renderer splitting plans.
- **[mcp.json](file:///Users/rony/dev/abcgame/mcp.json)**: Configuration to run our local repo-helper MCP server for auditing.

---

## 2. Coding Conventions & Idioms

### A. Input Handling
Never read raw DOM pointer or window events inside strategies or game entities. Always consume the normalized **`GameInput`** object passed in the strategy's `update()` method:
- **Taps & Clicks**: Loop through `input.gestures` and look for `g.type === 'tap'`. Do not check `input.mouseDown` for simple clicks as it fires every frame the mouse is held down.
- **Drags & Swipes**: Look for `g.type === 'drag'` or `g.type === 'swipe'` in `input.gestures`.
- **Keyboard Input**: Use `input.wasPressed(key)` (true for one frame when pressed) or `input.isDown(key)` (true as long as held).

### B. Adding a New Game Mode
To introduce a new mode:
1. Implement the **`GameModeStrategy`** interface (located in [GameModeStrategy.ts](file:///Users/rony/dev/abcgame/src/game/GameModeStrategy.ts)) or the **`SelfContainedMode`** interface (located in [SelfContainedAdapter.ts](file:///Users/rony/dev/abcgame/src/game/adapters/SelfContainedAdapter.ts)).
2. Place the file inside `src/game/` or `src/game/strategies/`.
3. Add the mode ID to the `GameMode` union type in [Engine.ts](file:///Users/rony/dev/abcgame/src/game/Engine.ts).
4. Register the strategy instantiation in the `createStrategy()` factory function in [Engine.ts](file:///Users/rony/dev/abcgame/src/game/Engine.ts). *Do not modify the loop structure in Engine.ts; it should remain a thin orchestrator.*
5. Register the game over texts and titles in [App.tsx](file:///Users/rony/dev/abcgame/src/App.tsx) inside `getGameOverText()`.

### C. Character Definition
- All letter configuration properties (colors, role, description) belong inside [data.ts](file:///Users/rony/dev/abcgame/src/characters/data.ts). 
- Drawing coordinates, eye expressions, and vector paths belong in [draw.ts](file:///Users/rony/dev/abcgame/src/characters/draw.ts).

---

## 3. Custom Repository Tools

The repo includes a dedicated Model Context Protocol (MCP) server located in [mcp-repo-helper/](file:///Users/rony/dev/abcgame/mcp-repo-helper/). You can utilize its tools to automate structural checks:

| Tool | Purpose |
|------|---------|
| `get_repo_summary` | Get code stats, files, LOC, and counts by extension. |
| `audit_game_modes` | Verify that game mode strategy files match the registered modes in [Engine.ts](file:///Users/rony/dev/abcgame/src/game/Engine.ts). |
| `canvas_migration_progress` | Find direct HTML5 Canvas references (`ctx.`) to trace renderer refactoring. |
| `run_repo_validation` | Run typechecks, test suite, or git status remotely. |

---

## 4. Architectural Target: The Renderer Interface Split

When editing rendering code (in character files, chasers, backgrounds, or strategies), be mindful of the planned mobile migration to **React Native Skia**:
- Avoid adding new direct canvas context `CanvasRenderingContext2D` calls where possible.
- Wrap drawing routines in reusable utility functions.
- If refactoring, aim to define and pass a unified `Renderer` interface to draw functions instead of the native browser `CanvasRenderingContext2D` instance.
