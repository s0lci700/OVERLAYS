---
name: mcp-check
description: Audit all MCP server and plugin configurations. Finds duplicates, misplaced entries, JSON errors, and schema issues across project and user config files. Optionally fixes them.
argument-hint: /mcp-check [--fix]
---

# MCP Config Audit Skill

Scan every location that can hold MCP server config, identify all issues, and report a clean summary. If `--fix` is passed, apply safe fixes automatically.

This skill exists because MCP config errors (wrong file, duplicate entries, schema mismatches) have caused 8+ lost sessions. One command prevents all of them.

---

## Arguments

`$ARGUMENTS` is optional:
- *(empty)* — audit only, no changes
- `--fix` — audit + apply safe fixes (deduplication, move misplaced entries, fix JSON)

---

## Config File Locations to Check

**Project-level** (relative to workspace root):
- `.mcp.json` ← correct home for MCP server configs
- `.claude/settings.json`
- `.claude/settings.local.json`

**User-level** (Windows paths):
- `C:\Users\Sol\.claude\settings.json`
- `C:\Users\Sol\.claude\settings.local.json`
- `C:\Users\Sol\.claude\mcp.json` (if it exists)

---

## Workflow

### Step 1 — Discover config files

Use Glob to find all relevant config files in both locations. Read each one that exists. Note any that are missing entirely.

### Step 2 — Parse and inventory

For each file, extract:
- `mcpServers` entries (key → object)
- Plugin entries (if any)
- Any other settings keys

Build a unified inventory:

```
Server name | Defined in | Command | Type (stdio/sse) | Notes
```

### Step 3 — Run checks

**Check A: Wrong file**
`mcpServers` entries found in `settings.json` or `settings.local.json` are misplaced — they belong in `.mcp.json`. Flag each one.

**Check B: Duplicates**
Same server name defined in more than one file. Flag with: defined in [file1, file2].

**Check C: JSON syntax**
If Read fails to parse a file as valid JSON, flag it. (Tip: Bash `node -e "JSON.parse(require('fs').readFileSync('.mcp.json','utf8'))"` to verify.)

**Check D: Schema issues**
Each mcpServers entry should have:
- `command` (string) or `url` (string for SSE)
- `args` (array, optional)
- `env` (object, optional)

Flag entries missing `command`/`url`, or where `args` is not an array.

**Check E: Dead paths**
For entries with `command`, check if the command binary exists (Bash `where <command>` on Windows). Flag if not found.

### Step 4 — Report

Output a structured report:

---

## MCP Config Audit Report

**Files scanned:**
- `.mcp.json` — [found / not found]
- `.claude/settings.json` — [found / not found]
- `.claude/settings.local.json` — [found / not found]
- `~/.claude/settings.json` — [found / not found]

**Server inventory:**
| Server | File | Status |
|--------|------|--------|
| server-name | .mcp.json | ✓ OK |
| other-server | settings.json | ⚠ Wrong file |
| dup-server | .mcp.json + settings.json | ⚠ Duplicate |

**Issues found:** N

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 1 | ⚠ Warning | Entry in wrong file | settings.json → mcpServers.X |
| 2 | ⚠ Warning | Duplicate entry | .mcp.json + ~/.claude/settings.json |
| 3 | 🔴 Error | Missing `command` field | .mcp.json → mcpServers.Y |
| 4 | 🔴 Error | JSON syntax error | settings.local.json line N |

**Recommendation:** [run `/mcp-check --fix` to auto-fix safe issues, or list manual steps]

---

### Step 5 — Fix (only if `--fix` passed)

Apply these fixes automatically:

1. **Move misplaced entries**: Remove from `settings.json`, add to `.mcp.json`
2. **Deduplicate**: Keep the `.mcp.json` version, remove duplicates from other files
3. **Fix JSON syntax**: Only if the error is trivially fixable (trailing comma, missing bracket) — otherwise report and skip

**Do not auto-fix:**
- Missing `command` fields (can't guess the right value)
- Dead binary paths (may need user to install something)
- Entries that conflict in content between duplicates (ask the user which to keep)

After fixing, re-read all affected files and confirm the JSON is valid. Re-run the inventory check and output a clean "after" summary.

---

## Rules

- **Always read files fresh** — never assume content from a previous session.
- **Never delete an entry without confirming it's a true duplicate** (same name AND same command/url).
- **Do not create `.mcp.json` if it doesn't exist** during audit-only mode — only create it during `--fix` if there are entries to move there.
- **Report even when there are no issues** — a clean bill of health is useful too.
- **Windows paths use backslashes** — use PowerShell-compatible syntax for all Bash commands in this skill.
