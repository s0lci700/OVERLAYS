<!-- gitnexus:start -->
# GitNexus MCP

This project is indexed by GitNexus as **OVERLAYS** (2821 symbols, 6268 relationships, 177 execution flows).

## Always Start Here

1. **Read `gitnexus://repo/{name}/context`** — codebase overview + check index freshness
2. **Match your task to a skill below** and **read that skill file**
3. **Follow the skill's workflow and checklist**

> If step 1 warns the index is stale, run `npx gitnexus analyze` in the terminal first.

## Skills

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

## Svelte MCP

You have access to the Svelte MCP server with comprehensive Svelte 5 and SvelteKit documentation. Use the available tools effectively:

- **`list-sections`** — Use FIRST to discover all available documentation sections. When asked about Svelte or SvelteKit topics, ALWAYS call this at the start to find relevant sections.
- **`get-documentation`** — Retrieves full documentation for specific sections. After `list-sections`, fetch ALL sections relevant to the task.
- **`svelte-autofixer`** — Analyzes Svelte code and returns issues/suggestions. MUST be used whenever writing Svelte code before sending it to the user. Keep calling until no issues are returned.
- **`playground-link`** — Generates a Svelte Playground link. Only call after user confirmation, and NEVER if code was written to project files.
