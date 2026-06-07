# Roadmap: React Native Mobile Port & APK

## Overview

Decouple the game's rendering pipeline from HTML5 Canvas to support both Web (Canvas 2D) and Mobile (React Native Skia), then bootstrap an Expo project shell, implement mobile Skia drawing & inputs, and package the final Android APK.

## Phases

- [ ] **Phase 1: Renderer Interface Decoupling** - Define the Renderer abstraction and migrate entities away from direct `CanvasRenderingContext2D` calls.
- [ ] **Phase 2: React Native Shell & Code Sharing** - Initialize Expo mobile container and configure TypeScript codebase sharing.
- [ ] **Phase 3: React Native Skia Renderer & Input** - Implement the Skia-based rendering backend and map mobile gestures to `GameInput`.
- [ ] **Phase 4: Android Build & APK packaging** - Configure credentials and run EAS build to package the installable APK.

## Phase Details

### Phase 1: Renderer Interface Decoupling
**Goal**: Decouple drawing operations from platform-specific APIs.
**Depends on**: Nothing
**Requirements**: [REND-01, REND-02, REND-03, REND-04]
**Success Criteria**:
  1. `src/renderer/Renderer.ts` defines the unified drawing API.
  2. `src/renderer/Canvas2DRenderer.ts` implements the API for web canvas.
  3. Game entity classes contain no direct references to `CanvasRenderingContext2D`.
  4. Web build compiles cleanly and passes smoke-test suite.
**Plans**: 3 plans

Plans:
- [ ] 01-01: Define `Renderer` interface and implement web `Canvas2DRenderer`.
- [ ] 01-02: Migrate entity classes (`draw.ts`, `Background.ts`, `OddbodChaser.ts`, `ZombieChaser.ts`) to use `Renderer` interface.
- [ ] 01-03: Run typechecks, unit tests, and smoke tests to ensure web parities.

### Phase 2: React Native Shell & Code Sharing
**Goal**: Create a React Native project configured to run the shared game engine.
**Depends on**: Phase 1
**Requirements**: [PORT-01, PORT-02, PORT-03, PORT-04]
**Success Criteria**:
  1. Expo React Native project initialized successfully.
  2. Mobile project compiles TypeScript files referencing game engine folder.
  3. UI components (HUD, MainMenu) ported to mobile components.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Initialize Expo project and configure module bundling/sharing from root.
- [ ] 02-02: Port web HUD and MainMenu overlays to React Native components.

### Phase 3: React Native Skia Renderer & Input
**Goal**: Implement canvas rendering and gesture inputs on mobile.
**Depends on**: Phase 2
**Requirements**: [SKIA-01, SKIA-02, SKIA-03]
**Success Criteria**:
  1. `SkiaRenderer` renders letters, chasers, backgrounds, and particles.
  2. Screen gestures map accurately to normalized tap/drag/swipe vectors.
  3. Shared game loop strategy runs at 60 FPS in Skia canvas.
**Plans**: 3 plans

Plans:
- [ ] 03-01: Implement `SkiaRenderer` using `@shopify/react-native-skia`.
- [ ] 03-02: Build mobile touch handler overlay translating gesture events to `GameInput`.
- [ ] 03-03: Assemble Engine loop with SkiaRenderer and gesture input on React Native screen.

### Phase 4: Android Build & APK packaging
**Goal**: Package the app as an installable Android APK.
**Depends on**: Phase 3
**Requirements**: [APK-01, APK-02, APK-03]
**Success Criteria**:
  1. App configurations (manifest, bundle ID, app icon) set up.
  2. Local or cloud EAS build completes successfully.
  3. The generated APK runs on Android without crashing and starts game modes.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Configure app.json and credentials for Android.
- [ ] 04-02: Generate installable APK and complete UAT check.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Decoupling | 0/3 | Not started | - |
| 2. RN Shell   | 0/2 | Not started | - |
| 3. Rendering  | 0/3 | Not started | - |
| 4. APK Build  | 0/2 | Not started | - |
