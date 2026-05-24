# ABC World MCP Server

MCP server for the ABC World educational alphabet game. Exposes game data and instructions to AI assistants like Claude.

## Tools

| Tool | Description |
|------|-------------|
| `list_game_modes` | List all 30 game modes (optional `category` filter: Core, Arcade, Mini-Game) |
| `get_character` | Get info for a single letter character |
| `list_characters` | List all characters (optional `role` filter: hero, ally, enemy) |
| `get_word` | Get a random word or search by starting letter |
| `get_mode_instructions` | Get detailed how-to-play instructions for a game mode |
| `get_game_info` | Get overall game info (stats, tech stack, character counts) |

## Setup

### 1. Install dependencies

```bash
cd mcp-server && npm install
```

### 2. Connect to Claude Desktop

Add to your Claude Desktop config (`~/.config/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "abcgame": {
      "command": "node",
      "args": ["/absolute/path/to/abcgame/mcp-server/index.js"],
      "env": {}
    }
  }
}
```

Or via `opencode.json` if using opencode:

```json
{
  "mcpServers": {
    "abcgame": {
      "command": "node",
      "args": ["mcp-server/index.js"]
    }
  }
}
```

### 3. Test

```bash
npm run mcp
# or
node mcp-server/index.js
```
