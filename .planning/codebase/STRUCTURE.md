# Codebase Structure

**Analysis Date:** 2026-06-07

## Directory Layout
```text
abcgame/
├── .planning/
│   └── codebase/       # Codebase architectural maps and documentation
├── mcp-repo-helper/    # Local Model Context Protocol developer utility tools
├── src/
│   ├── __tests__/      # Vitest unit and integration test modules
│   ├── characters/     # Character configuration definitions and Canvas drawing routines
│   ├── components/     # React UI overlay elements, main menus, and HUD displays
│   └── game/           # Core physical models, game engines, and concrete game strategies
│       ├── adapters/   # System client connectors (Gemini, local fallback, adapter class)
│       ├── strategies/ # Floating pop engine components and prompt-based strategies
│       └── themedQuest/# Core abstract quests managing linear A-Z modes
```

## Directory Purposes
**`.planning/codebase/`:**
- Purpose: Houses codebase documentation guides, architecture details, and structure descriptions.
- Contains: Markdown `.md` documentation files.
- Key files: `ARCHITECTURE.md`, `STRUCTURE.md`.

**`mcp-repo-helper/`:**
- Purpose: Stdio-based helper server supplying developers/agents with custom inspection scripts.
- Contains: Python tools, scripts, and local configurations.
- Key files: `mcp-repo-helper/server.py`, `package.json`.

**`src/__tests__/`:**
- Purpose: Houses the test suite validation files covering engine modules, setup behaviors, and gameplay modes.
- Contains: TypeScript spec files and mock fixtures.
- Key files: `setup.ts`, `Input.test.ts`, `LetterPopCore.test.ts`.

**`src/characters/`:**
- Purpose: Defines styling structures and visual drawing configurations representing the Alphabet Lore letters.
- Contains: Static dataset lists and canvas Bezier drawing methods.
- Key files: `data.ts`, `draw.ts`.

**`src/components/`:**
- Purpose: Declares React components overlays surrounding the interactive game canvas.
- Contains: React TSX components and style layouts.
- Key files: `HUD.tsx`, `MainMenu.tsx`, `GameCanvas.tsx`, `AIPromptCreator.tsx`.

**`src/game/`:**
- Purpose: Houses orchestrating classes, control structures, and individual mini-game implementations.
- Contains: TypeScript class modules, collision models, physics engines, and custom strategies.
- Key files: `Engine.ts`, `Input.ts`, `GameModeStrategy.ts`, `words.ts`.

**`src/game/adapters/`:**
- Purpose: Connects custom game classes or AI interfaces to standard engine loops.
- Contains: Client managers, static local configurations, and adapter code blocks.
- Key files: `SelfContainedAdapter.ts`, `GeminiClient.ts`, `LocalGenerator.ts`.

**`src/game/strategies/`:**
- Purpose: Integrates standard core strategies like popping floating letters or custom prompt engines.
- Contains: Concrete Strategy modules.
- Key files: `LetterPopCore.ts`, `LetterPopMode.ts`, `DynamicPromptStrategy.ts`.

**`src/game/themedQuest/`:**
- Purpose: Regulates template methods for standard A-Z letter progression modes.
- Contains: Abstract core strategy files and custom type maps.
- Key files: `ThemedLetterQuestMode.ts`, `types.ts`.

## Key File Locations
**Entry Points:**
- `src/main.tsx`: Direct Vite web compiler entry mounting React App context.
- `src/App.tsx`: Top-level router managing screens, game configs, and overlay layouts.

**Configuration:**
- `tsconfig.json`: Global TypeScript compilation options.
- `vite.config.ts`: Vite compilation rules, server parameters, and environment overrides.
- `package.json`: Dependency manifests, build scripts, and helper registrations.
- `mcp.json`: Configuration for local repository helper MCP server.

**Core Logic:**
- `src/game/Engine.ts`: Heart of the game loop; controls animation schedules and frame callbacks.
- `src/game/Input.ts`: Low-level event buffer listening directly to pointer and keyboard actions.
- `src/game/GameModeStrategy.ts`: Interface schema unifying inputs and strategies.
- `src/game/adapters/SelfContainedAdapter.ts`: Wrapper that translates self-contained games into `GameModeStrategy` calls.

**Testing:**
- `src/__tests__/setup.ts`: Vitest environments and mock globals initialization.
- `src/__tests__/Input.test.ts`: Validates input translation and gesture mapping.

## Naming Conventions
- Files:
  - React components: PascalCase with `.tsx` extensions (e.g. `GameCanvas.tsx`, `HUD.tsx`).
  - Strategy modules & class models: PascalCase with `.ts` extensions (e.g. `Engine.ts`, `AngryMode.ts`).
  - Helper libraries & configurations: camelCase with `.ts` extensions (e.g. `words.ts`, `data.ts`).
  - Test specs: End with `.test.ts` (e.g. `Input.test.ts`, `BalloonPopMode.test.ts`).
- Directories:
  - Lowercase or camelCase (e.g. `adapters`, `strategies`, `themedQuest`, `__tests__`).

## Where to Add New Code
- **New Feature / Game Mode:**
  - Create a new strategy class in `src/game/` (e.g. `NewGameMode.ts`) inheriting from `ThemedLetterQuestMode` or implementing `SelfContainedMode`.
  - Register the mode ID inside the `GameMode` union in `src/game/Engine.ts`.
  - Add instantiation logic inside the `createStrategy()` factory in `src/game/Engine.ts`.
  - Register user-facing titles and game-over texts inside `getGameOverText()` in `src/App.tsx`.
- **New Component:**
  - Place React HUD components, menus, or overlay panels inside `src/components/`.
- **Utilities:**
  - Save general math or coordinate systems to `src/game/` or add letter shapes to `src/characters/draw.ts`.

---
*Structure analysis: 2026-06-07*
