# AGENTS.md — abcgame

Gentle letter-pop game featuring Alphabet Lore characters. React + Canvas, kid-friendly.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | `tsc --noEmit` (typecheck only) |

Order: `lint` before `build` is redundant — `build` already runs typecheck.

## Project structure

| Path | Role |
|------|------|
| `src/App.tsx` | Root component — screen state (menu/playing) |
| `src/game/Engine.ts` | Game loop, floating letters, click/keyboard pop |
| `src/game/FloatingLetter.ts` | Bouncing letters with pop particles |
| `src/game/Background.ts` | Night sky with sparkles and clouds |
| `src/game/Input.ts` | Keyboard + mouse click input |
| `src/game/words.ts` | Word list with emojis for Word Pop mode |
| `src/characters/data.ts` | All 26 letters — accurate colors from the series |
| `src/characters/draw.ts` | Canvas drawing: actual letter shape as body+eyes |
| `src/components/` | `MainMenu`, `HUD`, `GameCanvas` |

## Two game modes

**Free Pop** — letters float around, click or press matching key to pop them. Collect all 26.

**Word Pop** — an emoji & a word with a missing letter appear. Pop the correct floating letter to complete the word. Wrong clicks get a pulse animation (no penalty).

## How to play

- **Click** a letter to pop it (+1 pt)
- **Press the matching key** on keyboard (+2 pt bonus)
- No enemies, no game over, no lives

## Key details

- Characters are drawn as their **letter shapes** (not round bodies) with eyes, matching the Alphabet Lore series. Colors from the official reference (`D24545` for A, `A2BEFF` for B, etc.).
- Enemies (F, N, X) are **not used** — this is a non-violent tapping game for ages 3+.
- Keyboard input uses `wasPressed` (just-pressed detection per frame). Mouse clicks captured via canvas coordinate check.
- Add new characters in `src/characters/data.ts` only — drawing handles any letter generically.
- Add new words in `src/game/words.ts` — each needs `word`, `emoji`, `blankIndex`.
- Canvas auto-resizes to container. May need refresh on resize.
- `GameMode` type (`'free' | 'word'`) determines Engine behavior — recreates Engine on switch.
- `CharacterDef` fields: `bodyColor`, `outlineColor`, `eyeWhiteColor`, `pupilColor`, `eyelidColor?`, `role` (`hero`/`enemy`/`ally`).

## AC agents

All screens overlaid. `GameCanvas` always mounts and renders the canvas underneath menu/HUD.
