import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, "..")

// Helper to run commands
function runCmd(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { cwd: REPO_ROOT }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout || "",
        stderr: stderr || "",
        code: error ? error.code : 0,
      })
    })
  })
}

// Helper to recursively find files in a directory
function getFilesRecursive(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "dist") {
        getFilesRecursive(fullPath, fileList)
      }
    } else {
      fileList.push(fullPath)
    }
  }
  return fileList
}

// Initialize the MCP server
const server = new McpServer({
  name: "ABC-World-Repo-Helper",
  version: "1.0.0",
})

// 1. Tool: get_repo_summary
server.tool(
  "get_repo_summary",
  {},
  async () => {
    try {
      const srcPath = path.join(REPO_ROOT, "src")
      const files = getFilesRecursive(srcPath)
      
      let totalLines = 0
      const countsByExt = {}
      const componentFiles = []
      const strategyFiles = []
      const modeFiles = []

      for (const file of files) {
        const ext = path.extname(file)
        countsByExt[ext] = (countsByExt[ext] || 0) + 1

        const content = fs.readFileSync(file, "utf8")
        const lines = content.split("\n").length
        totalLines += lines

        const relativePath = path.relative(REPO_ROOT, file)
        if (relativePath.startsWith("src/components/")) {
          componentFiles.push(relativePath)
        } else if (relativePath.startsWith("src/game/strategies/")) {
          strategyFiles.push(relativePath)
        } else if (relativePath.startsWith("src/game/") && file.endsWith("Mode.ts")) {
          modeFiles.push(relativePath)
        }
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            workspace: REPO_ROOT,
            totalFiles: files.length,
            totalLinesOfCode: totalLines,
            filesByExtension: countsByExt,
            structure: {
              componentsCount: componentFiles.length,
              strategiesCount: strategyFiles.length,
              customGameModesCount: modeFiles.length,
              components: componentFiles.map(f => path.basename(f)),
              customGameModes: modeFiles.map(f => path.basename(f)),
            }
          }, null, 2),
        }],
      }
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] }
    }
  }
)

// 2. Tool: audit_game_modes
server.tool(
  "audit_game_modes",
  {},
  async () => {
    try {
      const enginePath = path.join(REPO_ROOT, "src", "game", "Engine.ts")
      if (!fs.existsSync(enginePath)) {
        return { content: [{ type: "text", text: "Error: src/game/Engine.ts not found" }] }
      }

      const engineContent = fs.readFileSync(enginePath, "utf8")
      // Extract the GameMode union type values
      const modeTypeMatch = engineContent.match(/export type GameMode = ([^;]+)/)
      let registeredModes = []
      if (modeTypeMatch) {
        registeredModes = modeTypeMatch[1]
          .split("|")
          .map(m => m.trim().replace(/['"]/g, ""))
          .filter(m => m.length > 0)
      }

      // Read files in src/game/
      const gameDir = path.join(REPO_ROOT, "src", "game")
      const gameFiles = fs.readdirSync(gameDir)
      const modeFiles = gameFiles.filter(f => f.endsWith("Mode.ts"))

      const audit = registeredModes.map(modeId => {
        // Try to match the modeId to filename patterns
        // e.g. 'angry' -> 'AngryMode.ts', 'zombieSchool' -> 'ZombieSchoolMode.ts'
        const expectedFilenameLower = `${modeId.toLowerCase()}mode.ts`
        const matchedFile = modeFiles.find(f => f.toLowerCase() === expectedFilenameLower)
        
        let implementationType = "Unknown"
        if (["free", "word", "survival", "timeattack", "wordrace", "defense"].includes(modeId)) {
          implementationType = "Shared (LetterPopCore)"
        } else if (modeId === "prompt") {
          implementationType = "DynamicPromptStrategy"
        } else if (matchedFile) {
          implementationType = `Self-Contained File (${matchedFile})`
        }

        return {
          modeId,
          implementationType,
          hasDedicatedFile: !!matchedFile,
          filename: matchedFile || null,
        }
      })

      // Check for files not matching registered modes
      const unmatchedFiles = modeFiles.filter(file => {
        const fileBase = file.replace("Mode.ts", "").toLowerCase()
        return !registeredModes.some(m => m.toLowerCase() === fileBase)
      })

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            registeredModesCount: registeredModes.length,
            modeFilesCount: modeFiles.length,
            audit,
            unmatchedModeFiles: unmatchedFiles,
          }, null, 2),
        }],
      }
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] }
    }
  }
)

// 3. Tool: canvas_migration_progress
server.tool(
  "canvas_migration_progress",
  {},
  async () => {
    try {
      const srcPath = path.join(REPO_ROOT, "src")
      const files = getFilesRecursive(srcPath)
      const results = []

      // Patterns indicating direct canvas context drawings
      const canvasPatterns = [
        /\bctx\.(?:beginPath|arc|rect|fill|stroke|lineTo|moveTo|fillText|drawImage|save|restore|translate|rotate|scale|clearRect)\b/,
        /CanvasRenderingContext2D/,
      ]

      for (const file of files) {
        if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue
        const relativePath = path.relative(REPO_ROOT, file)
        
        // Skip tests and renderer folder itself (since that's where canvas drawing belongs)
        if (relativePath.includes("__tests__") || relativePath.startsWith("src/renderer/")) {
          continue
        }

        const content = fs.readFileSync(file, "utf8")
        let hasDirectDraw = false
        const matches = []

        const lines = content.split("\n")
        lines.forEach((line, index) => {
          for (const pattern of canvasPatterns) {
            if (pattern.test(line)) {
              hasDirectDraw = true
              matches.push({ lineNum: index + 1, content: line.trim() })
              break
            }
          }
        })

        if (hasDirectDraw) {
          results.push({
            file: relativePath,
            directDrawReferenceCount: matches.length,
            sampleReferences: matches.slice(0, 3), // Show first 3 instances as a sample
          })
        }
      }

      // Sort by file name
      results.sort((a, b) => a.file.localeCompare(b.file))

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            summary: "Files with direct canvas context (ctx) references. Target refactor: migrate these to the Renderer interface split.",
            totalFilesWithDirectDraw: results.length,
            files: results,
          }, null, 2),
        }],
      }
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] }
    }
  }
)

// 4. Tool: run_repo_validation
server.tool(
  "run_repo_validation",
  {
    action: z.enum(["typecheck", "test", "git_status"]).describe("The validation action to run"),
  },
  async ({ action }) => {
    let command = ""
    if (action === "typecheck") {
      command = "npm run lint"
    } else if (action === "test") {
      command = "npm run test"
    } else if (action === "git_status") {
      command = "git status -s"
    }

    try {
      const res = await runCmd(command)
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            action,
            command,
            success: res.success,
            code: res.code,
            stdout: res.stdout.trim(),
            stderr: res.stderr.trim(),
          }, null, 2),
        }],
      }
    } catch (err) {
      return { content: [{ type: "text", text: `Execution failed: ${err.message}` }] }
    }
  }
)

// Start stdio transport
const transport = new StdioServerTransport()
await server.connect(transport)
console.error("ABC World Repo Helper MCP server running on stdio")
