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

## All 31 game modes

### Core shared implementation

These six modes are backed by `src/game/strategies/LetterPopCore.ts` through `LetterPopMode`.

| Mode | Description |
|------|-------------|
| **Free Pop** | Pop floating letters. Collect all 26 before OddBods do. |
| **Word Pop** | Word prompt with a blank. Pop the correct letter. |
| **Survival** | 3 lives. Avoid OddBods and zombies while scoring. |
| **Time Attack** | 60-second score rush. |
| **Word Race** | Spell the word in order while chasers pursue. |
| **Defense** | Protect letters by clicking chasers before they break through. |

### Self-contained arcade modes

| Mode | Description |
|------|-------------|
| **Odd Birds** | Angry Birds-style. Launch projectiles at letter blocks. |
| **Rescue** | Free caged letters from zombies. |
| **Carnival** | Seven booths: balloon pop, fire ring, candy catch, dance, memory, etc. |
| **Dance Academy** | Follow word/letter dance prompts. |
| **Runner** | Endless runner: collect letters, avoid obstacles, escape chasers. |
| **Evolution Lab** | Collect DNA and evolve letters into OddBod/zombie variants. |
| **Alphabet Arcade** | Street Fighter-style side-view battles between Alphabet Lore letters. |

### Self-contained mini-games

| Mode | Description |
|------|-------------|
| **Balloon Pop** | Pop letter balloons/zombies across waves. |
| **Memory Match** | Flip cards and match letter pairs. |
| **Chef Kitchen** | Cook recipes by finding the next needed ingredient letter. |
| **Detective** | Find clues, reveal the missing letter, solve 26 cases. |
| **Zombie School** | Complete 26 letter lessons with occasional recess transitions. |
| **Pirate Hunt** | Search for alphabet treasure by choosing the right letter chest. |
| **Circus** | Complete seven circus acts by choosing missing word letters. |
| **Shooting Gallery** | Target zombies with OddBod shooters, manage ammo/reload, rescue letters. |
| **Pizza Delivery** | Serve zombie customers by popping the current pizza/ingredient letter. |
| **Construction** | Build 26 structures by popping the current construction letter. |
| **Mail Carriers** | Deliver 26 letters by popping the current mail/word letter. |
| **Alphabet Garden** | Grow 26 plants through staged correct-letter pops. |
| **Firefighters** | Extinguish 26 themed fires by popping the current rescue letter. |
| **Zombie Doctor** | Cure 26 patients by popping the current medical word letter. |
| **Alphabet Train** | Complete 26 train stops by popping the current cargo letter. |
| **Space Explorers** | Make 26 discoveries by popping the current signal letter. |
| **Zombie Bakery** | Serve 26 bakery customers by popping the current treat letter. |
| **Alphabet Aquarium** | Discover 26 sea creatures by popping the current bubble letter. |

## Mode similarity map

Most modes fall into a few reusable gameplay loops:

| Group | Modes | Shared loop |
|-------|-------|-------------|
| `LetterPopCore` variants | Free Pop, Word Pop, Survival, Time Attack, Word Race, Defense | Floating letters, tap/key input, optional words, timers, lives, and chasers. |
| Themed A-Z letter quests | Bakery, Mail Carriers, Doctor, Train, Firefighters, Pizza Delivery, Aquarium, Space Explorers, Zombie School | Progress A-Z, set `currentLetter`, spawn five floating choices, accept click/key, advance after the correct letter. |
| Staged A-Z letter quests | Construction, Alphabet Garden | Same correct-letter picker as above, but with build/growth stages instead of word lists. |
| Word-blank choosers | Word Pop, Word Race, Pirate Hunt, Circus, Dance Academy, Chef Kitchen | Choose the missing or next needed letter from distractors. |
| Target pop/shooter | Balloon Pop, Shooting Gallery, Defense, Time Attack | Hit moving targets quickly; Shooting Gallery adds ammo/reload/projectiles. |
| Memory pairs | Memory Match, Carnival booth 7 | Flip cards and match letter pairs. |
| Mostly unique | Odd Birds, Runner, Evolution Lab, Detective, Carnival, Alphabet Arcade | Physics, endless-runner, upgrade/evolution, hidden-object, multi-booth, or fighting-game gameplay. |

## Architecture (current + planned)

### Current
```
Engine.ts (thin orchestrator)
  - createStrategy(mode, canvasW, canvasH)
  - LetterPopMode wraps LetterPopCore for the six core modes
  - SelfContainedAdapter wraps each self-contained mini-game
  - Input.ts builds GameInput once per frame
  - Strategy owns update/draw/restart behavior
```

### Still planned
```
Renderer interface split
  - Canvas2DRenderer for web
  - SkiaRenderer for React Native mobile
  - Move direct drawing out of character/enemy/game classes over time
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

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:970c3bf2 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   bd dolt push
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->

<!-- BEGIN BEADS CODEX SETUP: generated by bd setup codex -->
## Beads Issue Tracker

Use Beads (`bd`) for durable task tracking in repositories that include it. Use the `beads` skill at `.agents/skills/beads/SKILL.md` (project install) or `~/.agents/skills/beads/SKILL.md` (global install) for Beads workflow guidance, then use the `bd` CLI for issue operations.

### Quick Reference

```bash
bd ready                # Find available work
bd show <id>            # View issue details
bd update <id> --claim  # Claim work
bd close <id>           # Complete work
bd prime                # Refresh Beads context
```

### Rules

- Use `bd` for all task tracking; do not create markdown TODO lists.
- Run `bd prime` when Beads context is missing or stale. Codex 0.129.0+ can load Beads context automatically through native hooks; use `/hooks` to inspect or toggle them.
- Keep persistent project memory in Beads via `bd remember`; do not create ad hoc memory files.

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.
<!-- END BEADS CODEX SETUP -->
