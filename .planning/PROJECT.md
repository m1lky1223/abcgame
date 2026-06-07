# ABC World — React Native Mobile Port

## What This Is

ABC World is an educational alphabet game for children ages 4+ featuring characters from Alphabet Lore, Zombie Alphabet, and OddBods. This project focuses on building a React Native mobile port of the game, enabling APK generation for Android by sharing the core TS physics/state engine and implementing rendering via React Native Skia.

## Core Value

Enable cross-platform gameplay parity so children can play the same A-Z mini-games on Android mobile devices with optimized touch performance and zero duplication of physics/rules engine code.

## Requirements

### Validated

- ✓ Core TypeScript gameplay engine with Strategy Pattern — existing
- ✓ 31+ educational game modes and quests implemented — existing
- ✓ Unified GameInput and Gesture structures — existing

### Active

- [ ] Define shared `Renderer` interface to abstract drawing commands
- [ ] Implement `Canvas2DRenderer` for Web Canvas 2D
- [ ] Migrate all game entities (`draw.ts`, `Background.ts`, etc.) to use the `Renderer` abstraction
- [ ] Initialize Expo React Native mobile project shell
- [ ] Port UI components (HUD, MainMenu) to React Native components
- [ ] Implement `SkiaRenderer` using React Native Skia
- [ ] Map mobile gesture interactions to unified `GameInput` gestures
- [ ] Build and generate Android APK using EAS Build

### Out of Scope

- Rewrite gameplay strategy logic in native code — We must share the TS files
- React Native iOS-specific optimization (focus is Android APK first)

## Context

The web codebase is built on Vite + React 19 + Canvas 2D. To avoid duplicating game logic for mobile, we need to decouple rendering from drawing APIs. The target architecture maps drawing logic to a unified `Renderer` interface, allowing web to use HTML5 Canvas and mobile to use React Native Skia.

## Constraints

- **Tech Stack**: React Native (Expo) + `@shopify/react-native-skia` + `@react-native-masked-view/masked-view`.
- **Code Sharing**: We must share files under `src/game/` directly without code duplication.
- **Performance**: Game loop must run smoothly at 60 FPS on typical mobile devices.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native Skia | High-performance canvas drawing on mobile, matching the browser's imperative Canvas 2D context API. | — Pending |
| Renderer Interface Decoupling | Enables complete logic reuse across platforms. | — Pending |

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-07 after project initialization*
