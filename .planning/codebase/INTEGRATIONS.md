# External Integrations

**Analysis Date:** 2026-06-07

## APIs & External Services

**Generative AI:**
- Google Gemini API - Used to generate dynamic customized game configs based on freeform user prompts.
  - SDK/Client: Direct HTTP `fetch` POST call in `src/game/adapters/GeminiClient.ts`
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  - Auth: Client-side `apiKey` passed to API calls, persisted via browser `localStorage` as `gemini_api_key` in `src/components/AIPromptCreator.tsx`.

## Data Storage

**Databases:**
- None (In-memory game state).

**File Storage:**
- Local browser filesystem / assets folder.

**Caching / Local Storage:**
- Browser `localStorage` - Used to save and load the Gemini API key (`gemini_api_key`) and persist basic game states like high scores and configurations.

## Authentication & Identity

**Auth Provider:**
- None.

## Monitoring & Observability

**Error Tracking:**
- None.

**Logs:**
- Console logging via `console.error` for failed client requests and fallback states in `src/game/adapters/GeminiClient.ts`.

## CI/CD & Deployment

**Hosting:**
- Generates a static SPA. Deployable to GitHub Pages, Netlify, Vercel, or Firebase Hosting.

**CI Pipeline:**
- None.

## Environment Configuration

**Required env vars:**
- None.

**Secrets location:**
- Persisted client-side in the browser's `localStorage` as `gemini_api_key`. No secrets are committed to the codebase.

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

---

*Integration audit: 2026-06-07*
