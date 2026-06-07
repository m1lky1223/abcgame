# Technology Stack

**Analysis Date:** 2026-06-07

## Languages

**Primary:**
- TypeScript ~5.8.3 - All application code and configurations
- TSX - React components (`src/App.tsx`, components in `src/components/`)

**Secondary:**
- JavaScript (ES Module) - Build scripts and helper tools (e.g. `smoke-test.mjs`, `mcp-server/index.js`, `mcp-repo-helper/index.js`)

## Runtime

**Environment:**
- Node.js >=24.0.0 (specified in `package.json` engines)
- Web Browser (Chrome, Safari, Firefox, Edge supporting ES2020 and HTML5 Canvas 2D)

**Package Manager:**
- npm >=11.0.0
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React ^19.1.0 - Web UI rendering and overlay state orchestration
- React DOM ^19.1.0 - Web renderer for React

**Testing:**
- Vitest ^4.1.7 - Unit and strategy testing framework
- Playwright ^1.60.0 - E2E smoke testing and UI verification
- Happy-dom ^20.9.0 - Browser environment simulator for Vitest

**Build/Dev:**
- Vite ^6.3.5 - Build bundler and hot dev server
- TypeScript ~5.8.3 - Compilation and typechecking

## Key Dependencies

**Critical:**
- @modelcontextprotocol/sdk ^1.11.0 - Used to implement the custom standard Model Context Protocol (MCP) servers in `mcp-server/` and `mcp-repo-helper/`

## Configuration

**Environment:**
- Browser `localStorage` is used to persist client-side keys like `gemini_api_key`.

**Build:**
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` - Compiler targets and directories
- `vite.config.ts` - Bundle paths, build output configurations, and Vitest setup

## Platform Requirements

**Development:**
- macOS, Linux, or Windows with Node.js and npm installed

**Production:**
- Static assets deployment target (e.g. GitHub Pages, Vercel, Firebase Hosting, AWS S3)

---

*Stack analysis: 2026-06-07*
