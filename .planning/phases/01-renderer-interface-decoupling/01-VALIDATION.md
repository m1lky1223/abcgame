---
phase: 1
slug: renderer-interface-decoupling
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-07
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.7 |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint` (typecheck) and `npm run test` (unit tests)
- **After every plan wave:** Run `npm run test` and `npm run test:smoke` (smoke tests)
- **Before `/gsd-verify-work`:** Full suite must be green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | REND-02 | — | N/A | unit | `test -f src/__tests__/Canvas2DRenderer.test.ts` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | REND-01 | — | N/A | unit | `test -f src/renderer/Renderer.ts && npx tsc --noEmit src/renderer/Renderer.ts` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | REND-02 | — | N/A | unit | `npx vitest run src/__tests__/Canvas2DRenderer.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | REND-03 | — | N/A | unit | `npx tsc --noEmit src/renderer/Renderer.ts src/renderer/Canvas2DRenderer.ts src/characters/draw.ts src/game/Background.ts` | ✅ | ⬜ pending |
| 1-02-02 | 02 | 2 | REND-03 | — | N/A | unit | `npx tsc --noEmit src/renderer/Renderer.ts src/renderer/Canvas2DRenderer.ts src/characters/draw.ts src/game/Background.ts src/game/OddbodChaser.ts src/game/ZombieChaser.ts src/game/FloatingLetter.ts src/game/Collectible.ts` | ✅ | ⬜ pending |
| 1-03-01 | 03 | 3 | REND-04 | — | N/A | unit | `npx tsc --noEmit src/renderer/Renderer.ts src/renderer/Canvas2DRenderer.ts src/game/GameModeStrategy.ts src/game/adapters/SelfContainedAdapter.ts src/game/strategies/LetterPopCore.ts src/game/strategies/LetterPopMode.ts` | ✅ | ⬜ pending |
| 1-03-02 | 03 | 3 | REND-04 | — | N/A | unit | `npm run lint && npx vitest run src/__tests__/LetterPopCore.test.ts` | ✅ | ⬜ pending |
| 1-03-03 | 03 | 3 | REND-04 | — | N/A | integration | `npm run lint && npm test && npm run test:smoke` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Game is visual and playable in browser | REND-03 | Needs visual verification of rendering parities (eyes, letter curves, chaser movements) | 1. Run `npm run dev` to start dev server.<br>2. Open browser at `http://localhost:5173/abcgame/`.<br>3. Launch several game modes (e.g. Free Pop, Word Pop) and check visual correctness. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
