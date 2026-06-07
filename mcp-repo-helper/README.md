# ABC World Repository Helper MCP Server

A custom Model Context Protocol (MCP) server designed to assist developers and AI agents in managing, analyzing, and validating the **ABC World** repository.

This server runs locally and communicates over standard input/output (stdio), which is compatible with most local MCP clients (such as Claude Desktop).

## Available Tools

### 1. `get_repo_summary`
Returns high-level statistics of the codebase, including:
- Total file count and lines of code (LOC).
- File count breakdown by extension.
- Quantities of components, custom strategies, and mini-game adapters.
- List of custom modes and React components.

### 2. `audit_game_modes`
Audits the list of game modes in the code to ensure consistency:
- Scans `src/game/Engine.ts` to retrieve all defined `GameMode` string values.
- Matches them to filename patterns (e.g. `AngryMode.ts`).
- Identifies whether a mode is implemented as a shared `LetterPopCore` strategy, a custom mini-game, or a `DynamicPromptStrategy`.
- Flags any mode files that are in the directory but not registered in the `Engine.ts`.

### 3. `canvas_migration_progress`
Identifies direct HTML5 Canvas 2D API calls (`ctx.arc`, `ctx.beginPath`, etc.) in game and character entities:
- Helps track progress on the planned architecture split of the `Renderer` layer (separating web Canvas 2D logic from mobile React Native Skia logic).
- Lists files containing references to canvas drawing methods along with line numbers and snippets of direct canvas drawing.

### 4. `run_repo_validation`
Runs repository checks directly from the MCP client:
- `action: "typecheck"`: Runs `npm run lint` (`tsc --noEmit`).
- `action: "test"`: Runs `npm run test` (unit tests).
- `action: "git_status"`: Runs `git status -s` to check unstaged/untracked modifications.

## Configuration & Usage

To connect this server to your local **Claude Desktop** client, add the following entry to your configuration file (typically located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "abc-repo-helper": {
      "command": "node",
      "args": [
        "/Users/rony/dev/abcgame/mcp-repo-helper/index.js"
      ]
    }
  }
}
```

Make sure you run `npm install` inside the `mcp-repo-helper` directory before launching:

```bash
cd mcp-repo-helper && npm install
```
