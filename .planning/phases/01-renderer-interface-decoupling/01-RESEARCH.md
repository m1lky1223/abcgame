# Phase 1: Renderer Interface Decoupling - Research

## User Constraints (from CONTEXT.md)

### Interface Injection Pattern
* **D-01: Parameter Injection:** The `Engine` holds the active platform-specific `Renderer` instance (e.g. `Canvas2DRenderer` on web) and passes it down into the active strategy's `draw(renderer)` and individual entities' `draw(renderer)` calls. We avoid a global active Renderer singleton to keep testing and multithreading capabilities clean.

### Drawing Responsibility
* **D-02: Delegate to Renderer:** Move all path, bezier, and shape drawing implementation (such as eyes, body curves, eyelids) out of the individual entity classes (`src/characters/draw.ts`, `src/game/Background.ts`, `src/game/OddbodChaser.ts`, `src/game/ZombieChaser.ts`) and place them directly into the platform-specific `Renderer` implementations.

### Renderer API Granularity
* **D-03: Hybrid API:** The `Renderer` interface will expose both low-level drawing primitives (e.g. lines, rects, text, gradients) and high-level domain operations (e.g. `drawLetter`, `drawBackground`, `drawChaser`). This allows individual strategies to use simple drawing calls while preserving the ability for platforms to optimize high-performance renderings.

### Agent's Discretion
* The exact signatures of low-level primitives in the `Renderer` interface.
* Optimization of canvas clears and state resets.
* Structure of rendering options (shadows, opacity, rotation scale) passed to draw calls.

---

## Phase Requirements

* **REND-01: Define Renderer Interface** (Confidence: **HIGH**)
  * *Research Finding:* The `Renderer` interface must define:
    1. Dimensions and resizing operations (`width`, `height`, `resize()`).
    2. State management (`save()`, `restore()`, `translate()`, `rotate()`, `scale()`).
    3. Primitives matching the subset used in game strategies (`beginPath()`, `closePath()`, `moveTo()`, `lineTo()`, `arc()`, `ellipse()`, `rect()`, `roundRect()`, `quadraticCurveTo()`, `bezierCurveTo()`, `fill()`, `stroke()`, `fillRect()`, `strokeRect()`, `clearRect()`, `fillText()`, `strokeText()`, `setLineDash()`).
    4. Gradient creation helpers (`createLinearGradient()`, `createRadialGradient()`).
    5. Context style property getters/setters (`fillStyle`, `strokeStyle`, `lineWidth`, `lineCap`, `lineJoin`, `globalAlpha`, `font`, `textAlign`, `textBaseline`, `shadowBlur`, `shadowColor`, `shadowOffsetX`, `shadowOffsetY`).
    6. High-level domain wrappers (`drawLetter()`, `drawBackground()`, `drawOddbodChaser()`, `drawZombieChaser()`).
  * *Refactoring Target:* Create `src/renderer/Renderer.ts` containing the interface and platform-agnostic type mappings (like `Gradient`, `LineCap`, `LineJoin`, etc.).

* **REND-02: Implement Canvas2DRenderer** (Confidence: **HIGH**)
  * *Research Finding:* `Canvas2DRenderer` wraps a native `CanvasRenderingContext2D` and delegates all primitive/state operations to it. The high-level operations will contain the drawing logic extracted from entities (using bezier curves, loops, and math transformations).
  * *Refactoring Target:* Create `src/renderer/Canvas2DRenderer.ts`.

* **REND-03: Refactor Entity Classes** (Confidence: **HIGH**)
  * *Research Finding:* Refactor the following entities to accept `Renderer` instead of `CanvasRenderingContext2D` and call high-level operations:
    * `src/characters/draw.ts`: Convert `drawCharacter()` into a simple delegation wrapper calling `renderer.drawLetter()`. Cut out all eye, outline, and shape curves and move them to `Canvas2DRenderer.drawLetter()`.
    * `src/game/Background.ts`: Change signature to `draw(renderer: Renderer)`. Change implementation to delegate to `renderer.drawBackground(this.clouds, this.sparkles, canvasW, canvasH, frame)`. Expose private cloud/sparkle data to satisfy TS interface.
    * `src/game/OddbodChaser.ts`: Change signature to `draw(renderer: Renderer)`. Move body shape, design features (unicorn horn, ram horns, bear ears), smile curves, and shadow effects to `Canvas2DRenderer.drawOddbodChaser()`. Pass a simplified design object (`name`, `bodyColor`, `outlineColor`) and state fields to the renderer to prevent circular dependency imports.
    * `src/game/ZombieChaser.ts`: Change signature to `draw(renderer: Renderer)`. Move rotten features, ghoulish details, toxic spots, eye pupil colors, and smile details to `Canvas2DRenderer.drawZombieChaser()`. Pass design properties and state fields to the renderer.
    * `src/game/FloatingLetter.ts` and `src/game/Collectible.ts`: Change `draw()` parameter from `CanvasRenderingContext2D` to `Renderer`.

* **REND-04: Verify Zero Direct Context References** (Confidence: **HIGH**)
  * *Research Finding:*
    1. Ensure all 31+ game strategies (`src/game/AlphabetArcadeMode.ts`, `src/game/strategies/LetterPopCore.ts`, `src/game/themedQuest/ThemedLetterQuestMode.ts`, etc.) change their signature from `draw(ctx: CanvasRenderingContext2D)` to `draw(ctx: Renderer)`.
    2. Maintain `ctx` as the variable name to allow existing inner-drawing calls (like `ctx.fillStyle = color`, `ctx.fillRect()`, etc.) to compile without modifications.
    3. Modify `src/game/Engine.ts` to accept `boundsProvider: InputBoundsProvider` and `renderer: Renderer` instead of direct canvas references. This isolates DOM dependency from the shared core loop.
    4. Mock `Renderer` in tests, or wrap the vitest mock context inside `Canvas2DRenderer` for test execution.

---

## Architectural Responsibility Map

```
+-------------------------------------------------------------+
|                     Vite / Web Shell                        |
| - src/components/GameCanvas.tsx                             |
| - Instantiates Canvas2DRenderer, passes to Engine.ts        |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                      Game Engine                            |
| - src/game/Engine.ts (Core loop & coordination)             |
| - Reads inputs using boundsProvider, triggers strategy      |
| - Holds abstract Renderer reference                         |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                 Active Game Mode Strategy                   |
| - src/game/GameModeStrategy.ts (Interface)                  |
| - src/game/strategies/* & src/game/*Mode.ts (Strategies)    |
| - Duck-typed draw(ctx: Renderer) calls                      |
+----------------------+-----------------------+--------------+
                       |                       |
                       v                       v
+-----------------------------+ +-----------------------------+
|      High-Level Drawing     | |     Low-Level primitives    |
| - renderer.drawLetter()     | | - renderer.fillRect()       |
| - renderer.drawBackground() | | - renderer.beginPath()      |
| - renderer.drawChaser()     | | - renderer.font = "bold 56px"|
+----------------------+------+ +--------------+--------------+
                       |                       |
                       +-----------+-----------+
                                   |
                                   v
+-------------------------------------------------------------+
|                   Abstract Renderer Tier                    |
| - src/renderer/Renderer.ts (Interface & Types)              |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                   Concrete Canvas 2D Tier                   |
| - src/renderer/Canvas2DRenderer.ts (HTML5 Canvas 2D)         |
| - Direct access to canvas context                           |
+-------------------------------------------------------------+
```

---

## Standard Stack

* **Platform:** Web / Mobile React Native (Parity Target).
* **Linter/Compiler:** TypeScript 5.8.3 (`tsc --noEmit`).
* **Test Runner:** Vitest 4.1.7.
* **Canvas Target:** HTML5 2D Context (`CanvasRenderingContext2D`).

---

## Package Legitimacy Audit

No external packages are installed or required for Phase 1.

---

## Architecture Patterns

1. **Parameter Injection:** The platform-specific renderer is injected during bootstrapping into the shared engine, avoiding global singleton state and ensuring testability.
2. **Structural Types / Duck-Typing Mappings:** Strategies and mini-game states are kept duck-typed to decrease boilerplate overhead while decoupling rendering.
3. **DOM Decoupling Interface:** Exposing an `InputBoundsProvider` instead of directly binding `HTMLCanvasElement` allows engine inputs to run natively inside Node.js testing environments or mobile shells.

---

## Environment Availability

* Canvas 2D APIs are supported globally across all modern client browsers.
* In Node testing environments, `vitest` mocks canvas interactions using `src/__tests__/setup.ts`. By wrapping these mock canvases inside a `Canvas2DRenderer` instance, tests execute successfully.

---

## Common Pitfalls

1. **Circular Import Dependencies:**
   * *Problem:* If `Renderer.ts` imports classes like `ZombieChaser` to specify signatures (e.g. `drawZombieChaser(chaser: ZombieChaser)`), and those classes import `Renderer`, a circular dependency loop occurs.
   * *Solution:* Pass simplified primitive structures (such as design parameters, coordinates, and simple state fields) in renderer signatures rather than full class objects.
2. **Standard DOM Types in React Native:**
   * *Problem:* `CanvasGradient` or `CanvasRenderingContext2D` types are not available in a pure React Native context, causing compile-time errors on mobile.
   * *Solution:* Declare custom type/interface aliases (e.g., `Gradient` instead of `CanvasGradient`, and local literal types for `LineCap`, `TextAlign`, etc.) in `Renderer.ts` to keep the interface platform-agnostic.
3. **Scope of Strategy signature changes:**
   * *Problem:* The codebase has 31+ strategies, each containing dozens of drawing commands (e.g. `ctx.fillRect()`). Renaming all `ctx` variables to `renderer` will result in a huge and risky diff.
   * *Solution:* Change strategy signatures to `draw(ctx: Renderer)` instead of `draw(renderer: Renderer)`. By keeping the parameter named `ctx`, all existing drawing statements (e.g. `ctx.fillRect()`) compile cleanly without changes.

---

## Code Examples

### `src/renderer/Renderer.ts`
```typescript
export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'bevel' | 'round' | 'miter';
export type TextAlign = 'left' | 'right' | 'center' | 'start' | 'end';
export type TextBaseline = 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';

export interface Gradient {
  addColorStop(offset: number, color: string): void;
}

export interface CloudData {
  x: number;
  y: number;
  w: number;
  a: number;
}

export interface SparkleData {
  x: number;
  y: number;
  phase: number;
  size: number;
}

export interface Renderer {
  // Dimensions
  width: number;
  height: number;
  resize(w: number, h: number): void;

  // State
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(x: number, y: number): void;

  // Primitives
  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  rect(x: number, y: number, w: number, h: number): void;
  roundRect(x: number, y: number, w: number, h: number, radii: number | number[]): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  fill(): void;
  stroke(): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
  setLineDash(segments: number[]): void;

  // Gradients
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): Gradient;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): Gradient;

  // Styling properties
  fillStyle: string | Gradient;
  strokeStyle: string | Gradient;
  lineWidth: number;
  lineCap: LineCap;
  lineJoin: LineJoin;
  globalAlpha: number;
  font: string;
  textAlign: TextAlign;
  textBaseline: TextBaseline;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;

  // High-Level Domain Operations
  drawLetter(letter: string, x: number, y: number, scale?: number, bobOffset?: number): void;
  drawBackground(clouds: CloudData[], sparkles: SparkleData[], width: number, height: number, frame: number): void;
  drawOddbodChaser(x: number, y: number, design: { name: string; bodyColor: string; outlineColor: string }, runFrame: number, caughtLetter: boolean, catchTimer: number): void;
  drawZombieChaser(x: number, y: number, design: { name: string; bodyColor: string; outlineColor: string }, runFrame: number, caughtLetter: boolean, catchTimer: number): void;
}
```

### `src/renderer/Canvas2DRenderer.ts` (Skeleton Example)
```typescript
import { Renderer, Gradient, CloudData, SparkleData, LineCap, LineJoin, TextAlign, TextBaseline } from './Renderer';
import { CHARACTERS } from '../characters/data';

export class Canvas2DRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;
  private _width: number;
  private _height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this._width = width;
    this._height = height;
  }

  get width(): number { return this._width; }
  get height(): number { return this._height; }

  resize(w: number, h: number): void {
    this._width = w;
    this._height = h;
    if (this.ctx.canvas) {
      this.ctx.canvas.width = w;
      this.ctx.canvas.height = h;
    }
  }

  save(): void { this.ctx.save(); }
  restore(): void { this.ctx.restore(); }
  translate(x: number, y: number): void { this.ctx.translate(x, y); }
  rotate(angle: number): void { this.ctx.rotate(angle); }
  scale(x: number, y: number): void { this.ctx.scale(x, y); }

  beginPath(): void { this.ctx.beginPath(); }
  closePath(): void { this.ctx.closePath(); }
  moveTo(x: number, y: number): void { this.ctx.moveTo(x, y); }
  lineTo(x: number, y: number): void { this.ctx.lineTo(x, y); }
  arc(x: number, y: number, r: number, sa: number, ea: number, ccw?: boolean): void {
    this.ctx.arc(x, y, r, sa, ea, ccw);
  }
  ellipse(x: number, y: number, rx: number, ry: number, rot: number, sa: number, ea: number, ccw?: boolean): void {
    this.ctx.ellipse(x, y, rx, ry, rot, sa, ea, ccw);
  }
  rect(x: number, y: number, w: number, h: number): void { this.ctx.rect(x, y, w, h); }
  roundRect(x: number, y: number, w: number, h: number, radii: number | number[]): void {
    this.ctx.roundRect(x, y, w, h, radii);
  }
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.ctx.quadraticCurveTo(cpx, cpy, x, y);
  }
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }
  fill(): void { this.ctx.fill(); }
  stroke(): void { this.ctx.stroke(); }
  fillRect(x: number, y: number, w: number, h: number): void { this.ctx.fillRect(x, y, w, h); }
  strokeRect(x: number, y: number, w: number, h: number): void { this.ctx.strokeRect(x, y, w, h); }
  clearRect(x: number, y: number, w: number, h: number): void { this.ctx.clearRect(x, y, w, h); }
  fillText(text: string, x: number, y: number, maxW?: number): void { this.ctx.fillText(text, x, y, maxW); }
  strokeText(text: string, x: number, y: number, maxW?: number): void { this.ctx.strokeText(text, x, y, maxW); }
  setLineDash(s: number[]): void { this.ctx.setLineDash(s); }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number): Gradient {
    return this.ctx.createLinearGradient(x0, y0, x1, y1);
  }
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): Gradient {
    return this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }

  get fillStyle(): string | Gradient { return this.ctx.fillStyle as string | CanvasGradient; }
  set fillStyle(v: string | Gradient) { this.ctx.fillStyle = v as string | CanvasGradient; }

  get strokeStyle(): string | Gradient { return this.ctx.strokeStyle as string | CanvasGradient; }
  set strokeStyle(v: string | Gradient) { this.ctx.strokeStyle = v as string | CanvasGradient; }

  get lineWidth(): number { return this.ctx.lineWidth; }
  set lineWidth(v: number) { this.ctx.lineWidth = v; }

  get lineCap(): LineCap { return this.ctx.lineCap as LineCap; }
  set lineCap(v: LineCap) { this.ctx.lineCap = v; }

  get lineJoin(): LineJoin { return this.ctx.lineJoin as LineJoin; }
  set lineJoin(v: LineJoin) { this.ctx.lineJoin = v; }

  get globalAlpha(): number { return this.ctx.globalAlpha; }
  set globalAlpha(v: number) { this.ctx.globalAlpha = v; }

  get font(): string { return this.ctx.font; }
  set font(v: string) { this.ctx.font = v; }

  get textAlign(): TextAlign { return this.ctx.textAlign as TextAlign; }
  set textAlign(v: TextAlign) { this.ctx.textAlign = v; }

  get textBaseline(): TextBaseline { return this.ctx.textBaseline as TextBaseline; }
  set textBaseline(v: TextBaseline) { this.ctx.textBaseline = v; }

  get shadowBlur(): number { return this.ctx.shadowBlur; }
  set shadowBlur(v: number) { this.ctx.shadowBlur = v; }

  get shadowColor(): string { return this.ctx.shadowColor; }
  set shadowColor(v: string) { this.ctx.shadowColor = v; }

  get shadowOffsetX(): number { return this.ctx.shadowOffsetX; }
  set shadowOffsetX(v: number) { this.ctx.shadowOffsetX = v; }

  get shadowOffsetY(): number { return this.ctx.shadowOffsetY; }
  set shadowOffsetY(v: number) { this.ctx.shadowOffsetY = v; }

  drawLetter(letter: string, x: number, y: number, scale = 1, bobOffset = 0): void {
    const def = CHARACTERS[letter];
    if (!def) return;
    const fontSize = 56 * scale;
    const cx = x + 24 * scale;
    const cy = y + 28 * scale + bobOffset;

    // Drawing code migrated from draw.ts using this.ctx...
  }

  drawBackground(clouds: CloudData[], sparkles: SparkleData[], width: number, height: number, frame: number): void {
    // Drawing code migrated from Background.ts using this.ctx...
  }

  drawOddbodChaser(x: number, y: number, design: { name: string; bodyColor: string; outlineColor: string }, runFrame: number, caughtLetter: boolean, catchTimer: number): void {
    // Drawing code migrated from OddbodChaser.ts using this.ctx...
  }

  drawZombieChaser(x: number, y: number, design: { name: string; bodyColor: string; outlineColor: string }, runFrame: number, caughtLetter: boolean, catchTimer: number): void {
    // Drawing code migrated from ZombieChaser.ts using this.ctx...
  }
}
```

---

## Validation Architecture

1. **Static Analysis & Type Checking:**
   * Run `npm run lint` (triggering `tsc --noEmit`) to verify there are no typescript errors remaining across the 31+ strategies, adapter, or game core files after signature migration.
2. **Automated Vitest Suite:**
   * Run `npm test` to verify that all 188 unit/integration tests pass. For drawing-related tests in `src/__tests__/DynamicPrompt.test.ts`, ensure `Canvas2DRenderer` is instantiated with the mocked canvas context and passed into the strategy's draw calls.
3. **Codebase Grep Verification:**
   * Execute a project-wide search to confirm that no references to the standard browser `CanvasRenderingContext2D` type remain outside of:
     * `src/renderer/Canvas2DRenderer.ts` (the web implementation)
     * `src/__tests__/setup.ts` (test environment mock hooks)
     * `src/components/GameCanvas.tsx` (the React web container bootstrapping the context)
4. **Visual Smoke Checks:**
   * Run `npm run dev` to verify the game operates in the browser identical to pre-refactor states. Check character eyes, chaser animations, backgrounds, and pop sparkles across multiple game modes.

---

## Security Domain

* All rendering pipeline decoupling executes locally in the user client thread.
* There are no network request transitions or inputs parsed in the rendering logic.
* Ensure no unsafe scripts are injected when generating custom dynamic configurations in Prompt mode.
