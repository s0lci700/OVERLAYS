# Bun Migration Guide

Complete reference for the Node.js / npm → Bun migration in this project, including a
pros vs cons analysis and answers to common questions.

---

## TL;DR

**Is it a good idea?** Yes — for this project the benefits clearly outweigh the
costs. Bun is drop-in compatible with this codebase, already used in the
release pipeline, and meaningfully faster for installs and server startup.

**Can Vite be replaced by Bun for SvelteKit?** No — and that is not needed.
They serve completely different roles (see below).

---

## Vite vs Bun — what each one does

| Tool | Category | Role in this project |
|------|----------|----------------------|
| **Bun** | Runtime + package manager | Runs `server.js`, installs dependencies, executes scripts |
| **Vite** | Module bundler + dev server | Compiles Svelte components, serves HMR during dev, tree-shakes the production build |

When you run `bun --bun run dev` inside `control-panel/`, Bun **invokes
Vite** with its own JS engine (JavaScriptCore) rather than Node. The `--bun`
flag is the key detail: without it, `bun run dev` executes `vite dev` on the
system Node.js; with it, Vite runs entirely on Bun.

The [official Bun SvelteKit guide](https://bun.sh/guides/ecosystem/sveltekit)
shows exactly this pattern:

```bash
bun --bun run dev    # Vite runs on Bun's engine
bun --bun run build  # build also runs on Bun
```

**Vite itself cannot be removed from a SvelteKit project.** SvelteKit's
compiler and HMR are built on top of `@sveltejs/vite-plugin-svelte`. Bun
does not provide an equivalent bundler. What Bun brings is:

- The `--bun` flag runs Vite faster (Bun's module resolver is quicker than Node's)
- `svelte-adapter-bun` replaces `@sveltejs/adapter-node` so the production
  build output starts with `bun ./build/index.js` instead of `node ./build/index.js`

**Conclusion:** Keep Vite for the control panel. Use Bun (`--bun` flag +
`svelte-adapter-bun`) to run it natively on the Bun runtime. This is what
this migration now implements.

---

## What was migrated

### Control panel (`control-panel/`)

Two changes aligned with the [official Bun SvelteKit guide](https://bun.sh/guides/ecosystem/sveltekit):

**`--bun` flag on all Vite scripts**

```json
"dev":     "bun --bun vite dev",
"build":   "bun --bun vite build",
"preview": "bun --bun vite preview"
```

Without `--bun`, `bun run dev` invokes Vite on Node. With `--bun`, Vite runs
on Bun's JS engine directly.

**`svelte-adapter-bun` instead of `@sveltejs/adapter-node`**

```js
// svelte.config.js — before
import adapter from "@sveltejs/adapter-node";

// after
import adapter from "svelte-adapter-bun";
```

This changes the production build output so the server is started with:

```bash
bun ./build/index.js   # instead of node ./build/index.js
```

### Backend (`server.js`, `data/`, `scripts/`)

`server.js` is CommonJS (`require()`). Bun fully supports CommonJS, so no
source changes are required. The only difference is the command used to start
it:

```bash
# before
node server.js

# after
bun server.js
```

### Package manager

```bash
# before
npm install   # ~5–15 s
npm ci        # ~5–15 s
npm run <x>   # delegates to npm

# after
bun install   # ~0.3–1 s (reads package-lock.json or generates bun.lockb)
bun install   # same command in CI — no separate ci flag needed
bun run <x>   # same script runner interface
```

### CLI tools (`npx` → `bunx`)

```bash
npx playwright test   →   bunx playwright test
npx wait-on …         →   bunx wait-on …
```

### GitHub Actions

`actions/setup-node@v4` replaced with `oven-sh/setup-bun@v2` in
`playwright.yml` and `full-test-and-stress.yml`. The `release.yml` workflow
was already using Bun for standalone binary compilation.

### Scripts / launchers

All `start-demo.sh`, `start-demo.bat`, `scripts/build-dist.sh`,
`scripts/build-dist.bat`, and `scripts/setup-ip.js` updated to use `bun`
instead of `node` / `npm`.

---

## Pros ✅

| # | Benefit | Detail for this project |
|---|---------|-------------------------|
| 1 | **Fast installs** | `bun install` is 10–25× faster than `npm install`. CI pipelines and local setup improve noticeably. |
| 2 | **Fast server startup** | Bun's JS engine (JavaScriptCore) starts `server.js` in ~40 ms vs ~200 ms for Node 20. |
| 3 | **Built-in .env support** | Bun reads `.env` automatically — `require("dotenv").config()` is no longer strictly needed (though harmless to keep for Node portability). |
| 4 | **Standalone binary** | `bun build --compile server.js` produces a single self-contained executable. Already used in `release.yml` to ship `overlays-server-macos` / `-windows` / `-linux`. |
| 5 | **Single tool** | Runtime + package manager + bundler for scripts in one binary. No separate `npm` + `node` to keep in sync. |
| 6 | **Built-in TypeScript** | If the project ever adds `.ts` files, no extra build step is needed — Bun runs TypeScript natively. |
| 7 | **Node.js API compatibility** | Bun implements the Node.js API surface (`os`, `fs`, `path`, `http`, `crypto`, etc.) so all existing `require()` calls in `server.js`, `data/`, and `scripts/` work unchanged. |
| 8 | **Faster test feedback** | `bunx playwright test` launches faster because Bun's module resolution is quicker. |

---

## Cons ⚠️

| # | Risk | Mitigation for this project |
|---|------|------------------------------|
| 1 | **Bun ≠ production-hardened Node.js** | Bun is stable (v1.x) but younger than Node. For a pitch/demo project the risk is acceptable; for a high-volume SaaS it warrants more evaluation. |
| 2 | **CommonJS edge cases** | A handful of npm packages use `__filename`, dynamic `require()` tricks, or native addons that Bun does not support. `express`, `socket.io`, `cors`, and `dotenv` are all tested and working. |
| 3 | **`bun.lockb` vs `package-lock.json`** | Bun generates a binary lockfile (`bun.lockb`). If other contributors use `npm`, the lockfiles diverge. Options: commit `bun.lockb` and tell all contributors to use Bun, or keep `package-lock.json` and let Bun read it. |
| 4 | **`oven-sh/setup-bun` maturity** | The GitHub Action is actively maintained by the Bun team but has fewer users than `actions/setup-node`. Watch for breaking changes on major Bun releases. |
| 5 | **`dotenv` redundancy** | `server.js` still calls `require("dotenv").config()`. Under Bun this is a no-op because Bun loads `.env` automatically, but the package remains in `dependencies`. It can be removed in a future cleanup commit. |
| 6 | **Vite still required** | The frontend still depends on Node.js-ecosystem Vite. Bun does not eliminate this dependency — it just runs Vite faster. |
| 7 | **Team familiarity** | Contributors more comfortable with `npm` / `node` will need a brief introduction to `bun install` and `bun run`. The commands are nearly identical, so the learning curve is minimal. |

---

## Remaining optional improvement — remove `dotenv`

Because Bun loads `.env` files natively before executing any script, the
`dotenv` dependency in `server.js` is now redundant when running under Bun.

If you want to remove it:

1. Delete the first line of `server.js`:
   ```js
   // remove this line:
   require("dotenv").config();
   ```
2. Remove from root `package.json` dependencies:
   ```bash
   bun remove dotenv
   ```

> ⚠️ Only do this if you have no intention of running the server with plain
> `node server.js`. Keep it if you want the code to stay portable between
> Node.js and Bun.

---

## Remaining optional improvement — add `bun.lockb`

To lock exact dependency versions across all machines, commit the Bun lockfile:

```bash
bun install          # generates / updates bun.lockb
git add bun.lockb
git commit -m "chore: add bun lockfile"
```

Then add to `.gitignore` if desired (or leave it committed — both are valid):

```
# keep this if you commit bun.lockb:
# bun.lockb
```

---

## Quick-reference command table

| Task | Before (npm/node) | After (Bun) |
|------|-------------------|-------------|
| Install deps | `npm install` | `bun install` |
| Start server | `node server.js` | `bun server.js` |
| Start control panel | `npm run dev -- --host` | `bun --bun run dev -- --host` |
| Auto-configure IPs | `npm run setup-ip` | `bun run setup-ip` |
| Run E2E tests | `npx playwright test` | `bunx playwright test` |
| Build control panel | `npm run build` | `bun --bun run build` |
| Build binary | `bun build --compile server.js` | _(unchanged)_ |

---

## Verdict

✅ **The migration is worthwhile for this project.**

The codebase is entirely compatible with Bun's Node.js API layer. The
server dependencies (`express`, `socket.io`, `cors`, `dotenv`) all work
under Bun without modification. The primary wins are install speed in CI,
faster server startup during demos, and a streamlined single-tool workflow.
The standalone binary compilation — already central to the release pipeline —
was already using Bun, making this migration a natural completion of what was
started there.

Vite is not replaced and does not need to be. It remains the correct and only
supported build tool for SvelteKit.
