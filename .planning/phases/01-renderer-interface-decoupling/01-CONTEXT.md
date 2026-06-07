# Phase 1: Renderer Interface Decoupling - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Decouple the game's rendering pipeline from HTML5 Canvas to support both Web (Canvas 2D) and Mobile (React Native Skia). Define a unified `Renderer` interface and migrate the drawing logic for letters, chasers, backgrounds, and particles.

</domain>

<decisions>
## Implementation Decisions

### Interface Injection Pattern
- **D-01:** Parameter Injection — The `Engine` holds the active platform-specific `Renderer` instance (e.g. `Canvas2DRenderer` on web) and passes it down into the strategy's `draw(renderer)` and individual entities' `draw(renderer)` calls. We avoid a global active Renderer singleton to keep testing and multithreading capabilities clean.

### Drawing Responsibility
- **D-02:** Delegate to Renderer — Move all path, bezier, and shape drawing implementation (such as eyes, body curves, eyelids) out of the individual entity classes (`draw.ts`, `Background.ts`, `OddbodChaser.ts`, `ZombieChaser.ts`) and place them directly into the platform-specific `Renderer` implementations. 

### Renderer API Granularity
- **D-03:** Hybrid API — The `Renderer` interface will expose both low-level drawing primitives (e.g. lines, rects, text, gradients) and high-level domain operations (e.g. `drawLetter`, `drawBackground`, `drawChaser`). This allows individual strategies to use simple drawing calls while preserving the ability for platforms to optimize high-performance renderings.

### the agent's Discretion
- The exact signatures of low-level primitives in the `Renderer` interface.
- Optimization of canvas clears and state resets.
- Structure of rendering options (shadows, opacity, rotation scale) passed to draw calls.

</decisions>

<canonical_refs>
## Canonical References

### Renderer Split
- `ARCHITECTURE.md` §6 — Target split architecture schema
- `ARCHITECTURE.md` §7 — Refactoring transition steps
- `MEMORY.md` §3 — Stage 1 decoupling objectives
- `AGENTS.md` — Project post-refactor directory conventions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/characters/draw.ts`: Contains the current Canvas 2D curves for drawing letter characters. This logic will be migrated into `Canvas2DRenderer.ts`.
- `src/game/Background.ts`: Contains stars and sky gradient drawing. To be moved to `Canvas2DRenderer`.
- `src/game/OddbodChaser.ts` & `src/game/ZombieChaser.ts`: Drawing methods to be ported to `Renderer`.

### Established Patterns
- Strategy Pattern: All 31+ game modes implement `GameModeStrategy.ts`, which uses `draw(ctx: CanvasRenderingContext2D)`. This will be updated to `draw(renderer: Renderer)`.

### Integration Points
- `src/components/GameCanvas.tsx`: Connects the HTML5 canvas element to the `Engine` loop. It will instantiate `Canvas2DRenderer` and pass it to the `Engine`.
- `src/game/Engine.ts`: The loop orchestrator that triggers strategy updates and draws.

</code_context>

<deferred>
## Deferred Ideas

- React Native Skia implementation (`SkiaRenderer`) — Phase 3
- Touch gesture mappings for mobile — Phase 3

</deferred>

---

*Phase: 01-renderer-interface-decoupling*
*Context gathered: 2026-06-07*
