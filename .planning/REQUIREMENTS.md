# Requirements: Mobile APK & React Native Port

**Defined:** 2026-06-07
**Core Value:** Enable cross-platform gameplay parity so children can play the same A-Z mini-games on Android mobile devices with optimized touch performance.

## v1 Requirements

### Renderer Decoupling (REND)

- [ ] **REND-01**: Define `Renderer` interface containing abstractions for drawing lines, shapes, text, particles, and letter characters.
- [ ] **REND-02**: Implement `Canvas2DRenderer` using Web Canvas Rendering Context 2D.
- [ ] **REND-03**: Refactor entity classes (`draw.ts`, `Background.ts`, `OddbodChaser.ts`, `ZombieChaser.ts`) to use `Renderer` instead of direct canvas context.
- [ ] **REND-04**: Verify zero direct canvas `ctx` references remain outside `Canvas2DRenderer` and the web components.

### Mobile Shell & Code Sharing (PORT)

- [ ] **PORT-01**: Initialize Expo React Native project within the codebase or as a shared project root.
- [ ] **PORT-02**: Configure path aliases and compilation to consume shared `src/game/` physics/state/logic directly.
- [ ] **PORT-03**: Port the global `HUD.tsx` React component to a React Native styling/component structure.
- [ ] **PORT-04**: Port the `MainMenu.tsx` React component to a React Native styling/component structure.

### Skia Rendering & Touch Input (SKIA)

- [ ] **SKIA-01**: Implement `SkiaRenderer` using `@shopify/react-native-skia` implementing the `Renderer` interface.
- [ ] **SKIA-02**: Adapt mobile touch handler events to normalize swipe, drag, and tap gesture actions to the `Gesture` array in `GameInput`.
- [ ] **SKIA-03**: Connect loop orchestration and Skia Canvas component to execute strategies correctly at 60 FPS on mobile.

### Android Packaging & APK (APK)

- [ ] **APK-01**: Configure Android package configurations (app name, bundle ID, icons).
- [ ] **APK-02**: Generate an installable Android APK file using Expo EAS Build (local or cloud).
- [ ] **APK-03**: Validate APK runs and passes basic A-Z gameplay smoke checks on Android device or emulator.

## Out of Scope

| Feature | Reason |
|---------|--------|
| iOS Build/IPA | Android APK is the primary focus for deployment testing |
| Local database syncing | High score and settings persistence via standard mobile storage (`AsyncStorage`) is sufficient for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REND-01     | Phase 1 | Pending |
| REND-02     | Phase 1 | Pending |
| REND-03     | Phase 1 | Pending |
| REND-04     | Phase 1 | Pending |
| PORT-01     | Phase 2 | Pending |
| PORT-02     | Phase 2 | Pending |
| PORT-03     | Phase 2 | Pending |
| PORT-04     | Phase 2 | Pending |
| SKIA-01     | Phase 3 | Pending |
| SKIA-02     | Phase 3 | Pending |
| SKIA-03     | Phase 3 | Pending |
| APK-01      | Phase 4 | Pending |
| APK-02      | Phase 4 | Pending |
| APK-03      | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---

*Requirements defined: 2026-06-07*
*Last updated: 2026-06-07 after initial definition*
