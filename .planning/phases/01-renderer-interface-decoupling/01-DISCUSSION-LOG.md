# Phase 1: Renderer Interface Decoupling - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 1-Renderer Interface Decoupling
**Areas discussed:** Interface Injection Pattern, Drawing Responsibility, Renderer API Granularity

---

## Interface Injection Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Parameter Injection | Engine passes the Renderer instance down through strategy.draw(renderer) and entity.draw(renderer) calls. | ✓ |
| Global Singleton | Supply a global active Renderer singleton that entities import and call directly. | |

**User's choice:** Parameter Injection
**Notes:** Decouples strategies and entities from platform-specific APIs cleanly.

---

## Drawing Responsibility

| Option | Description | Selected |
|--------|-------------|----------|
| Delegate to Renderer | Move all path and shape drawing implementation (e.g. eyes, body curves) into platform-specific Renderer classes. | ✓ |
| Low-Level Primitives | Keep geometry drawing logic in entities but abstract canvas calls through low-level Renderer primitives. | |

**User's choice:** Delegate to Renderer
**Notes:** Crucial for allowing React Native Skia to implement drawings natively instead of parsing canvas calls.

---

## Renderer API Granularity

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid API | Provide both low-level primitives (rect, text, line) and high-level domain operations (drawLetter, drawBackground). | ✓ |
| Strict Vector Primitives | Only expose low-level math/path primitives on the Renderer. | |

**User's choice:** Hybrid API
**Notes:** Standardizes general strategy rendering while allowing custom elements to use low-level APIs.

---

## the agent's Discretion

- Exact method signatures of low-level primitives in the Renderer interface.
- Optimization and state management inside the Canvas2DRenderer.

## Deferred Ideas

- Mobile SkiaRenderer implementation and touch event adapters (deferred to Phase 3).

---

*Phase: 01-renderer-interface-decoupling*
*Discussion log generated: 2026-06-07*
