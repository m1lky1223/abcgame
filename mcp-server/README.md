# ABC World MCP Server

MCP server for ABC World educational alphabet game. Exposes 6 tools for AI assistants.

## Tools

| Tool | Description |
|------|-------------|
| `list_game_modes` | List all 30 game modes (optional `category` filter: Core, Arcade, Mini-Game) |
| `get_character` | Get info for a single letter character |
| `list_characters` | List all characters (optional `role` filter: hero, ally, enemy) |
| `get_word` | Get a random word puzzle or search by starting letter |
| `get_mode_instructions` | Get detailed how-to-play instructions for a game mode |
| `get_game_info` | Get overall game info (stats, tech stack, character counts) |

## Setup

```bash
cd mcp-server && npm install
```

## Run (HTTP server for remote access)

```bash
PORT=3001 node index.js
```

Server listens on `http://0.0.0.0:3001/mcp` with health check at `/health`.

## Deploy to the cloud

Deploy as a Node.js app to any platform (Railway, Render, Fly.io, etc.):

```bash
PORT=8080 node mcp-server/index.js
```

## Connect Claude to a remote MCP URL

In your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "abcgame": {
      "url": "https://your-deployed-url.com/mcp"
    }
  }
}
```

Or via `opencode.json`:

```json
{
  "mcpServers": {
    "abcgame": {
      "url": "https://your-deployed-url.com/mcp"
    }
  }
}
```
