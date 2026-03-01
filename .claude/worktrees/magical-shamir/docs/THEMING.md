# Theming — Dados & Risas

> **TL;DR** — edit `design/tokens.json`, run `bun run generate:tokens`, done.

---

## Overview

All design tokens (colors, typography, spacing, radii, shadows, motion, alpha, z-index) live in a single canonical JSON file:

```
design/tokens.json
```

A Bun generator script reads that file and writes two CSS outputs:

| Output file | Consumer |
|---|---|
| `control-panel/src/generated-tokens.css` | Svelte control panel (Vite build) |
| `public/tokens.css` | OBS overlay HTML files |

`control-panel/src/app.css` imports `generated-tokens.css` at the top, so the control panel and Storybook both pick up any token changes automatically after re-generating.

---

## Editing tokens

1. Open `design/tokens.json` in any text editor.
2. Change the `"value"` field for any token. Every token entry looks like:
   ```json
   "--red": { "value": "#ff4d6a", "description": "Primary action / damage / critical state" }
   ```
3. Run the generator:
   ```bash
   bun run generate:tokens
   ```
4. The two CSS files are overwritten with the new values. Commit them alongside `tokens.json`.

---

## Token groups

| Group key | Description |
|---|---|
| `colors` | Core neutrals and brand accents |
| `hp` | HP threshold colors and gradient stops |
| `typography` | Font family stacks |
| `spacing` | 4px-base spacing scale (`--space-1` … `--space-12`) |
| `radii` | Border radius scale |
| `shadows` | Pixel-art accent shadows |
| `motion` | Transition presets (`--t-fast`, `--t-normal`, `--t-spring`) |
| `alpha` | Opacity constants |
| `zIndex` | Documented layer order |
| `overlayGradients` | Gradient shorthands for OBS overlay HP bars |

---

## Generator script

**File:** `scripts/generate-tokens.ts`  
**Run with:** `bun run generate:tokens` (calls `bun scripts/generate-tokens.ts`)

The script:
1. Parses `design/tokens.json`.
2. Iterates every group and emits `--token-name: value;` lines (with inline comments from the `description` field).
3. Writes the **full** token set to `control-panel/src/generated-tokens.css`.
4. Writes a **curated overlay subset** (colors + HP + gradients + typography + shadows + radii) to `public/tokens.css`.

Both outputs start with a `/* GENERATED — do not edit by hand */` header.

---

## Live theme editor

A standalone browser webtool ships at:

```
public/theme-editor/index.html
```

Served by the Express server at `http://localhost:3000/theme-editor/`.

### Features

- **Load tokens** from `/api/tokens` (Express endpoint added to `server.js`).
- **Edit** any token value in-browser — colors get a native color picker alongside the text input.
- **Live preview** — overlays load in an iframe; changes inject a `<style id="__theme-editor__">` `:root{}` block that overrides defaults instantly.
- **Save themes** to `localStorage` (named themes, restored on next visit).
- **Export** as:
  - JSON overrides file (`theme-overrides.json`)
  - CSS variables file (`theme-overrides.css`)
- **Import** a previously exported JSON theme.
- **Reset** to canonical defaults at any time.

### Opening the editor

1. Start the server: `bun server.js` (or `bun run start`).
2. Open `http://localhost:3000/theme-editor/` in a browser.
3. To point at a remote server: `http://localhost:3000/theme-editor/?server=http://192.168.1.5:3000`

---

## Storybook integration

Design tokens are documented visually in Storybook under **Design System → Design Tokens**:

```bash
cd control-panel
bun run storybook       # dev server on port 6006
bun run build-storybook # static output
```

Stories cover: Color Palette, Typography, Spacing & Radii, Shadows, Motion, and a full All Tokens Reference table.

Since `control-panel/.storybook/preview.js` imports `app.css`, which in turn imports `generated-tokens.css`, all Storybook stories automatically reflect the current token values.

---

## Adding a new token

1. Add an entry to the appropriate group in `design/tokens.json`:
   ```json
   "--my-new-token": { "value": "#abcdef", "description": "What it does" }
   ```
2. Run `bun run generate:tokens`.
3. Use it in CSS as `var(--my-new-token)`.
4. If it should be available in overlays, add it to the `overlayGradients` group or ensure the generator's overlay subset includes the group.

---

## Reference implementations & further reading

- [Style Dictionary](https://amzn.github.io/style-dictionary/) — multi-platform token pipeline (not used here, but worth knowing).
- [Tokens Studio](https://tokens.studio/) — Figma plugin for design token management.
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming) — semantic token approach used by this project's shadcn-svelte aliases.
- [W3C Design Tokens spec](https://tr.designtokens.org/format/) — emerging standard for token interchange format.
