# ABC World Memory & Roadmap

This document serves as the repository's stateful memory, tracking completed milestones, known limitations, and the engineering roadmap for the **ABC World** project.

---

## 1. Current State of the Repository

- **Tech Stack**: React 19, Vite, TypeScript, Canvas 2D.
- **Game Core**: Orchestrated by a single frame loop orchestrator ([Engine.ts](file:///Users/rony/dev/abcgame/src/game/Engine.ts)) using the Strategy Pattern ([GameModeStrategy.ts](file:///Users/rony/dev/abcgame/src/game/GameModeStrategy.ts)) to power 31+ game modes.
- **IP Pillars**: Alphabet Lore letters, Zombie Alphabet chasers/modes, OddBods chasers/projectiles.
- **Helper Infrastructure**: Fully configured with a local, custom Stdio-based **Repository Helper MCP server** ([mcp-repo-helper/](file:///Users/rony/dev/abcgame/mcp-repo-helper/)) and [mcp.json](file:///Users/rony/dev/abcgame/mcp.json) configuration for auto-discovery by LLM interfaces.

---

## 2. Completed Milestones

### Core Architecture Documentation
- Created [ARCHITECTURE.md](file:///Users/rony/dev/abcgame/ARCHITECTURE.md) outlining system topology, bootstrapping flow, lifecycle state, input normalization structures, and future multi-platform rendering separation.

### Custom Repository Helper MCP Server
- Implemented and packaged a custom stdio-based helper server in [mcp-repo-helper/](file:///Users/rony/dev/abcgame/mcp-repo-helper/) exposing tools to:
  - Summarize codebase LOC, components, and extensions.
  - Audit file-to-mode registration.
  - Scan direct HTML5 canvas (`ctx`) drawing commands to monitor renderer split progress.
  - Trigger test suites and typechecks.
- Integrated `"mcp:helper"` script inside the root [package.json](file:///Users/rony/dev/abcgame/package.json).
- Created [mcp.json](file:///Users/rony/dev/abcgame/mcp.json) in the repository root for automatic configuration by LLM agents.

### Developer Environment Setup
- Verified project integrity. `npm run lint` typecheck reports **0 errors** (compiles cleanly).

---

## 3. Engineering Roadmap

### Stage 1: Renderer Interface Decoupling (High Priority)
- [ ] Define the `Renderer` interface to capture all drawing operations (shapes, colors, bezier paths, texts, sprites).
- [ ] Implement `Canvas2DRenderer` using HTML5 Canvas 2D contexts for web execution.
- [ ] Refactor game entities ([draw.ts](file:///Users/rony/dev/abcgame/src/characters/draw.ts), [Background.ts](file:///Users/rony/dev/abcgame/src/game/Background.ts), [OddbodChaser.ts](file:///Users/rony/dev/abcgame/src/game/OddbodChaser.ts), [ZombieChaser.ts](file:///Users/rony/dev/abcgame/src/game/ZombieChaser.ts)) to accept the `Renderer` abstraction instead of direct `CanvasRenderingContext2D` contexts.
- [ ] Audit progress using the MCP tool `canvas_migration_progress` until no direct `ctx.` references remain in entity classes.

### Stage 2: React Native Mobile Port (Medium Priority)
- [ ] Initialize the React Native mobile shell wrapper (using Expo).
- [ ] Implement `SkiaRenderer` using `@shopify/react-native-skia` wrapping the shared TypeScript physics and state engines.
- [ ] Set up gesture handler wrappers mapping mobile swipe and tap gestures to the normalised `GameInput` format.

### Stage 3: Mode Enhancement (Low Priority)
- [ ] Expand the word lists and emojis database in [words.ts](file:///Users/rony/dev/abcgame/src/game/words.ts) for richer puzzles.
- [ ] Add unit testing coverage for game mode strategies inside `src/__tests__/`.
