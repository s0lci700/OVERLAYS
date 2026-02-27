# Copilot instructions

## Quick index

- See docs/INDEX.md for the fast file map, entry points, and do-not-edit paths.

## Build, test, and lint commands

- **Root backend** (Node.js/Express/Socket.io):
  - `npm install`
  - `npm run setup-ip` — generates .env files with local IP + ports.
  - `node server.js` — starts an `http` + `socket.io` server on `PORT` (default 3000).
  - `npm test` only exists as the default `echo "Error: no test specified"` script, so pick a manual HTTP call instead (`curl http://localhost:3000/api/characters` or use `test.http`).
- **Control panel (Svelte + Vite)**:
  - `cd control-panel && npm install`
  - `npm run dev -- --host` — mobile-first dev server that exposes the UI on your local network for phone/tablet control.
  - `npm run dev:auto` — runs setup-ip + `vite dev --host` in one step.
  - `npm run build` / `npm run preview` for production assets.
- **Linting**: no lint script yet (clean builds are enforced manually via formatting in `control-panel` files and `public` overlays).
- **Playwright E2E**: `npx playwright test app.test.js --config tests-log/playwright.config.js` (logs saved under tests-log).

## High-level architecture

```
Phone / Tablet
  └── control-panel (SvelteKit + Vite, port 5173) – Socket.io client + REST calls for HP/rolls, mobile-first UI, reuses a singleton socket store.
        │
        │  HTTP PUT /api/characters/:id/hp  (CharacterCard)  &  POST /api/rolls (DiceRoller)
        ▼
  Node.js server (Express + Socket.io, port 3000)
        │
        │  REST API + `io.emit` broadcasts (`initialData`, `hp_updated`, `dice_rolled`)
        ▼
  `public/overlay-hp.html` + `public/overlay-dice.html` (OBS Browser Sources, load Socket.io via CDN and listen for `hp_updated` / `dice_rolled` to mutate DOM by `data-char-id` attributes)
```

- The server keeps `characters` and `rolls` in-memory and seeds each socket with `initialData` on connect; every REST update broadcasts via Socket.io so overlays and the control panel stay in sync.
- The `control-panel/src/lib/socket.js` file exports the singleton `socket`, `characters` store, and `lastRoll` store so every component shares the same connection and state.
- Overlays rely on the same `serverPort` host (and Socket.io v4.8.3 via CDN) and mutate DOM nodes marked with `data-char-id` to reflect live HP/roll updates.

## SvelteKit routing

- File-based routes live in `control-panel/src/routes`.
- Redirect: `src/routes/+page.svelte` routes `/` to `/control/characters`.
- Layout shell: `src/routes/+layout.svelte` provides the app chrome (header/sidebar).
- Control tabs: `src/routes/control/+layout.svelte` + pages at `/control/characters` and `/control/dice`.
- Management tabs: `src/routes/management/+layout.svelte` + pages at `/management/create` and `/management/manage`.

## Key conventions

- **IP alignment**: use `npm run setup-ip` to generate root .env and control-panel/.env. Overlays read the server URL from the `?server=` query parameter (default `http://localhost:3000`).
- **Socket flow**: `socket.on('initialData')` bootstraps `characters`. `CharacterCard` fetches `PUT /api/characters/:id/hp` and relies on the `hp_updated` broadcast to mutate the `characters` store; `DiceRoller` posts to `/api/rolls` and stores the server response in `lastRoll` for UI feedback.
- **DOM mapping**: The overlays use `data-char-id` to find existing character nodes. When `hp_updated` arrives, they only mutate the matching node instead of rerendering the entire list. Keep this attribute in sync if you add new overlays.
- **UI theming**: HP thresholds are computed in Svelte (`hpPercent`, `hpClass`) and mirrored in overlay CSS (healthy/injured/critical gradients + pulsing critical animation). Use the same breakpoint definitions when adding new visual states.
- **Manual testing helpers**: Use `test.http` at the root for quick `GET /api/characters`, `PUT /api/characters/:id/hp`, and `POST /api/rolls` requests; the file already contains working payloads for the demo characters listed in README/CLAUDE.

## Server handling

- **Running servers**: Start the Node.js server first (`node server.js`), then run the Svelte control panel on ./control-panel (`npm run dev -- --host`).
- **Closing Servers**: After running server instances remember to always close them properly (Ctrl+C in terminal) to free up ports and avoid conflicts on next run.
- **Agent reminder**: If you start a server during a task, stop it before you finish the response. This is mandatory for all agents.

# UI development

Before doing any UI, frontend or React development, ALWAYS call the storybook MCP server to get further instructions.

## Additional references

- The README and CLAUDE.md describe the demo priorities, OBS setup (1920×1080, transparent backgrounds, “refresh when scene becomes active”), and the project’s MVP checklist. Refer to them before updating the overlays or control panel UI.
- The `.github/workflows/check-progress.yml` job parses `PROGRESS.md` on every push; keep that file’s sections intact if you need the progress reporting to stay green.



### STORYBOOK MCP

# Copilot Instructions for Storybook MCP Addon

## Architecture Overview

This is a **pnpm monorepo** with two MCP implementations:

- **`packages/addon-mcp`**: Storybook addon using `tmcp`, exposes MCP server at `/mcp` via Vite middleware
  - Provides addon-specific tools (story URLs, UI building instructions)
  - **Imports and reuses tools from `@storybook/mcp` package** for component manifest features
  - Extends `StorybookContext` with addon-specific configuration (`AddonContext`)
- **`packages/mcp`**: Standalone MCP library using `tmcp`, reusable outside Storybook
  - Provides reusable component manifest tools (list components, get documentation)
  - Exports tools and types for consumption by addon-mcp
- **`apps/internal-storybook`**: Test environment for addon integration

**Both packages use `tmcp`** with HTTP transport and Valibot schema validation for consistent APIs.

### Addon Architecture

The addon uses a **Vite plugin workaround** to inject middleware (see `packages/addon-mcp/src/preset.ts`):

- Storybook doesn't expose an API for addons to register server middleware
- Solution: Inject a Vite plugin via `viteFinal` that adds `/mcp` endpoint
- Handler in `mcp-handler.ts` creates MCP servers using `tmcp` with HTTP transport

**Toolset Configuration:**

The addon supports configuring which toolsets are enabled:

- **Addon Options**: Configure default toolsets in `.storybook/main.js`:
  ```typescript
  {
    name: '@storybook/addon-mcp',
    options: {
      toolsets: {
        dev: true,
        docs: true,
      }
    }
  }
  ```
- **Per-Request Override**: MCP clients can override toolsets per-request using the `X-MCP-Toolsets` header:
  - Header format: comma-separated list (e.g., `dev,docs`)
  - When header is present, only specified toolsets are enabled (others are disabled)
  - When header is absent, addon options are used
- **Tool Enablement**: Tools use the `enabled` callback to check if their toolset is active:
  ```typescript
  server.tool(
  	{
  		name: 'my-tool',
  		enabled: () => server.ctx.custom?.toolsets?.dev ?? true,
  	},
  	handler,
  );
  ```
- **Context-Aware**: The `getToolsets()` function in `mcp-handler.ts` parses the header and returns enabled toolsets, which are passed to tools via `AddonContext.toolsets`

### MCP Library Architecture

The `@storybook/mcp` package (in `packages/mcp`) is framework-agnostic:

- Uses `tmcp` with HTTP transport and Valibot schema validation
- Factory pattern: `createStorybookMcpHandler()` returns a request handler
- Context-based: handlers accept `StorybookContext` which includes the HTTP `Request` object and optional callbacks
- **Exports tools and types** for reuse by `addon-mcp` and other consumers
- **Request-based manifest loading**: The `request` property in context is passed to tools, which use it to determine the manifest URL (defaults to same origin, replacing `/mcp` with the manifest path)
- **Optional manifestProvider**: Custom function to override default manifest fetching behavior
  - Signature: `(request: Request, path: string) => Promise<string>`
  - Receives the `Request` object and a `path` parameter (currently always `'./manifests/components.json'`)
  - The provider determines the base URL (e.g., mapping to S3 buckets) while the MCP server handles the path
  - Returns the manifest JSON as a string
- **Optional handlers**: `StorybookContext` supports optional handlers that are called at various points, allowing consumers to track usage or collect telemetry:
  - `onSessionInitialize`: Called when an MCP session is initialized
  - `onListAllDocumentation`: Called when the list-all-documentation tool is invoked
  - `onGetDocumentation`: Called when the get-documentation tool is invoked
- **Output Format**: Responses are markdown-only (token-efficient markdown with adaptive formatting).
  - Formatter implementations are in `packages/mcp/src/utils/manifest-formatter/`.

## Development Environment

**Prerequisites:**

- Node.js **24+** (enforced by `.nvmrc`)
- pnpm **10.19.0+** (strict `packageManager` in root `package.json`)

**Monorepo orchestration:**

- Turborepo manages build dependencies (see `turbo.json`)
- Run `pnpm dev` at root for parallel development
- Run `pnpm storybook` to test addon (starts internal-storybook + addon dev mode)

**Build tools:**

- All packages use `tsdown` (rolldown-based bundler)
- Shared configuration in `tsdown-shared.config.ts` at monorepo root
- Individual packages extend shared config in their `tsdown.config.ts`

**Testing:**

- **Unit tests**: Both `packages/mcp` and `packages/addon-mcp` have unit tests (Vitest with coverage)
  - Run `pnpm test run --coverage` in individual package directories
  - Run `pnpm test:run` at root to run all unit tests
  - Prefer TDD when adding new tools
- **E2E tests**: `apps/internal-storybook/tests` contains E2E tests for the addon
  - Run `pnpm test` in `apps/internal-storybook` directory
  - Tests verify MCP endpoint works with latest Storybook prereleases
  - Uses inline snapshots for response validation
  - **When to update E2E tests**:
    - Adding or modifying MCP tools (update tool discovery snapshots)
    - Changing MCP protocol implementation (update session init tests)
    - Modifying tool responses or schemas (update tool-specific tests)
    - Adding new toolsets or changing toolset behavior (update filtering tests)
  - **Running tests**:
    - `pnpm test` in apps/internal-storybook - run E2E tests
    - `pnpm vitest run -u` - update snapshots when responses change
    - Tests start Storybook server automatically, wait for MCP endpoint, then run
  - **Test structure**:
    - `mcp-endpoint.e2e.test.ts` - MCP protocol and tool tests
    - `check-deps.e2e.test.ts` - Storybook version validation

**Formatting and checks (CRITICAL):**

- **ALWAYS format code after making changes**: Run `pnpm run format` before committing
- **ALWAYS run checks after formatting**: Run `pnpm run check` to ensure all checks pass
- **Fix any failing checks**: Analyze check results and fix issues until all checks pass
- **This is mandatory for every commit** - formatting checks will fail in CI if not done
- The workflow is:
  1. Make your code changes
  2. Run `pnpm run format` to format all files
  3. Run `pnpm run check` to verify all checks pass
  4. Fix any failing checks and repeat step 3 until all pass
  5. Commit your changes

**Type checking:**

- All packages have TypeScript strict mode enabled
- Run `pnpm typecheck` at root to check all packages
- Run `pnpm typecheck` in individual packages for focused checking
- CI enforces type checking on all PRs
- Type checking uses `tsc --noEmit` (no build artifacts, just validation)

**Debugging MCP servers:**

```bash
pnpm inspect  # Launches MCP inspector using .mcp.inspect.json config
```

## Code Style & Conventions

**ESM-only codebase:**

- All packages have `"type": "module"`
- **ALWAYS include file extensions** in imports: `import { foo } from './bar.ts'` (not `./bar`)
- Exception: Package imports don't need extensions

**JSON imports:**

```typescript
import pkgJson from '../package.json' with { type: 'json' };
```

**TypeScript config:**

- Uses `@tsconfig/node24` base
- Module resolution: `bundler`
- Module format: `preserve`

**Naming:**

- Constants: `SCREAMING_SNAKE_CASE` (e.g., `PREVIEW_STORIES_TOOL_NAME`)
- Functions: `camelCase`
- Types: `PascalCase`

## Adding MCP Tools

### In addon package (`packages/addon-mcp`):

**Option 1: Addon-specific tools** (for tools that require Storybook addon context):

1. Create `src/tools/my-tool.ts`:

```typescript
import type { McpServer } from 'tmcp';
import * as v from 'valibot';
import type { AddonContext } from '../types.ts';

export const MY_TOOL_NAME = 'my_tool';

const MyToolInput = v.object({
	param: v.string(),
});

type MyToolInput = v.InferOutput<typeof MyToolInput>;

export async function addMyTool(server: McpServer<any, AddonContext>) {
	server.tool(
		{
			name: MY_TOOL_NAME,
			title: 'My Tool',
			description: 'What it does',
			schema: MyToolInput,
		},
		async (input: MyToolInput) => {
			// Implementation
			return {
				content: [{ type: 'text', text: 'result' }],
			};
		},
	);
}
```

2. Import and call in `src/mcp-handler.ts` within `initializeMCPServer`

**Option 2: Reuse tools from `@storybook/mcp`** (for component manifest features):

1. Import the tool from `@storybook/mcp` in `src/mcp-handler.ts`:

```typescript
import { addMyTool, MY_TOOL_NAME } from '@storybook/mcp';
```

2. Call it conditionally based on feature flags (see component manifest tools example)
3. Ensure `AddonContext` extends `StorybookContext` for compatibility
4. Pass the `source` URL in context for manifest-based tools

### In mcp package (`packages/mcp`):

1. Create `src/tools/my-tool.ts`:

```typescript
export const MY_TOOL_NAME = 'my-tool';

export async function addMyTool(server: McpServer<any, StorybookContext>) {
	server.tool({ name: MY_TOOL_NAME, description: 'What it does' }, async () => ({
		content: [{ type: 'text', text: 'result' }],
	}));
}
```

2. Import and call in `src/index.ts` within `createStorybookMcpHandler`

3. **Export for reuse** in `src/index.ts`:

```typescript
export { addMyTool, MY_TOOL_NAME } from './tools/my-tool.ts';
```

## Integration Points

**Tool Reuse Between Packages:**

- `addon-mcp` depends on `@storybook/mcp` (workspace dependency)
- `AddonContext` extends `StorybookContext` to ensure type compatibility
- Component manifest tools are conditionally registered based on feature flags:
  - Checks `features.experimentalComponentsManifest` flag
  - Checks for `experimental_manifests` preset
  - Only registers `addListAllDocumentationTool` and `addGetDocumentationTool` when enabled
- Context includes `request` (HTTP Request object) which tools use to determine manifest location
- Default manifest URL is constructed from request origin, replacing `/mcp` with `/manifests/components.json`
- **Optional handlers for tracking**:
  - `onSessionInitialize`: Called when an MCP session is initialized, receives context
  - `onListAllDocumentation`: Called when list tool is invoked, receives context and manifest
  - `onGetDocumentation`: Called when get tool is invoked, receives context, input with id, and optional foundDocumentation
  - Addon-mcp uses these handlers to collect telemetry on tool usage

**Storybook internals used:**

- `storybook/internal/csf` - `storyNameFromExport()` for story name conversion
- `storybook/internal/types` - TypeScript types for Options, StoryIndex
- `storybook/internal/node-logger` - Logging utilities
- Framework detection via `options.presets.apply('framework')`
- Feature flags via `options.presets.apply('features')`
- Component manifest generator via `options.presets.apply('experimental_manifests')`

**Story URL generation:**

- Fetches `http://localhost:${port}/index.json` for story index
- Matches stories by `importPath` (relative from cwd) and `name`
- Returns URLs like `http://localhost:6006/?path=/story/button--primary`

**Telemetry:**

- Addon collects usage data (see `src/telemetry.ts`)
- Respects `disableTelemetry` from Storybook core config
- Tracks session initialization and tool usage

## Special Build Considerations

**Shared tsdown configuration:**

- `tsdown-shared.config.ts` at monorepo root contains shared build settings
- Targets Node 20.19 (minimum version supported by Storybook 10)
- Includes custom JSON tree-shaking plugin to work around rolldown bug (see [rolldown#6614](https://github.com/rolldown/rolldown/issues/6614))
- Only includes specified package.json keys in bundle (name, version, description)
- If adding new package.json properties to code, update the `jsonTreeShakePlugin` keys array in shared config
- Individual packages extend this config and specify their entry points

**Package exports:**

- Addon exports only `./preset` (Storybook convention)
- MCP package exports main module with types

## Release Process

Uses Changesets for versioning:

```bash
pnpm changeset       # Create a changeset for your changes
pnpm release         # Build and publish (CI handles this)
```

**Creating Changesets (MANDATORY for user-facing changes):**

When making changes to `@storybook/mcp` or `@storybook/addon-mcp` that affect users (bug fixes, features, breaking changes, dependency updates), you **MUST** create a changeset:

1. Create a new `.md` file in `.changeset/` directory
2. Use naming convention: `<random-word>-<random-word>-<random-word>.md` (e.g., `brave-wolves-swim.md`)
3. File format:

   ```markdown
   ---
   '@storybook/mcp': patch
   '@storybook/addon-mcp': patch
   ---

   Brief description of what changed

   More details about why the change was made and any migration notes if needed.
   ```

4. Version bump types:
   - `patch`: Bug fixes, security updates, dependency updates (non-breaking)
   - `minor`: New features (backward compatible)
   - `major`: Breaking changes

5. Include in changeset description:
   - **WHAT** the change is
   - **WHY** the change was made
   - **HOW** consumers should update their code (if applicable)

6. Only include packages that have actual user-facing changes (ignore internal packages like `@storybook/mcp-internal-storybook`)

## Testing with Internal Storybook

The `apps/internal-storybook` provides a real Storybook instance:

- Runs on port 6006
- Addon MCP endpoint: `http://localhost:6006/mcp`
- Test with `.mcp.json` config pointing to localhost:6006

## Package-Specific Instructions

For detailed package-specific guidance, see:

- `packages/addon-mcp/**` → `.github/instructions/addon-mcp.instructions.md`
- `packages/mcp/**` → `.github/instructions/mcp.instructions.md`
- `eval/**` → `.github/instructions/eval.instructions.md`

## Documentation resources

When working with the MCP server/tools related stuff, refer to the following resources:

- https://github.com/paoloricciuti/tmcp/tree/main/packages/tmcp
- https://github.com/paoloricciuti/tmcp/tree/main/packages/transport-http
- https://github.com/paoloricciuti/tmcp

When working on data validation, refer to the following resources:

- https://valibot.dev/
- https://github.com/paoloricciuti/tmcp/tree/main/packages/adapter-valibot

When working with MCP Apps and/or the `preview-stories.ts` file, refer to the MCP App specification:

- https://raw.githubusercontent.com/modelcontextprotocol/ext-apps/refs/heads/main/specification/draft/apps.mdx
