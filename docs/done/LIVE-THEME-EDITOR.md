# Live Theme Editor — Dados & Risas

A standalone browser tool for visually editing overlay design tokens and previewing changes in real time against the actual OBS overlays.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Quick Start](#2-quick-start)
3. [File Structure](#3-file-structure)
4. [Architecture](#4-architecture)
5. [UI Layout](#5-ui-layout)
6. [Features in Detail](#6-features-in-detail)
7. [Token Groups Reference](#7-token-groups-reference)
8. [Data Flow](#8-data-flow-step-by-step)
9. [Integration with the Rest of the System](#9-integration-with-the-rest-of-the-system)
10. [Remote Server Support](#10-remote-server-support)
11. [Security Measures](#11-security-measures)
12. [Known Limitations](#12-known-limitations)
13. [Making Changes Permanent](#13-making-changes-permanent)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Overview

The Live Theme Editor is a zero-dependency, single-file browser tool that lets you:

- **Visually edit** all CSS design tokens for the Dados & Risas overlay system
- **Preview changes instantly** against the actual overlay HTML files in an embedded iframe
- **Save named theme snapshots** to browser localStorage
- **Export** theme overrides as JSON or CSS
- **Import** previously exported themes
- **Reset** to canonical defaults at any time

It has **no build step** and requires **no framework** — just a running Express server and a browser.

The theme editor is a **read-only design prototyping tool**. Changes you make in the editor are local and do not modify any file on disk. To make a theme permanent, see [Making Changes Permanent](#13-making-changes-permanent).

---

## 2. Quick Start

### Prerequisites

The Express server must be running. The theme editor fetches tokens from `/api/tokens` on startup.

```bash
# From the project root
bun server.js
# or
node server.js
```

### Open the editor

```
http://localhost:3000/theme-editor/
```

The sidebar loads all token groups automatically. The preview pane shows the HP Bars overlay by default.

### First steps

1. Click a tab in the sidebar (e.g., **Colors**).
2. Click a color swatch or type a new hex value in the text field.
3. Click **▶ Apply to preview** — the overlay in the iframe updates immediately.
4. When satisfied, click **+ Save theme** to name and persist the state to `localStorage`.

---

## 3. File Structure

```
OVERLAYS/
├── design/
│   └── tokens.json                          ← single source of truth (edit this)
├── scripts/
│   └── generate-tokens.ts                   ← build-time CSS generator
├── public/
│   ├── tokens.css                           ← GENERATED — overlay token CSS
│   ├── theme-editor/
│   │   └── index.html                       ← the entire editor (625 lines, self-contained)
│   ├── overlay-hp.html                      ← previewed in iframe
│   ├── overlay-dice.html                    ← previewed in iframe
│   └── overlay-conditions.html             ← previewed in iframe
├── control-panel/src/
│   └── generated-tokens.css                 ← GENERATED — control panel token CSS
└── server.js                                ← serves /api/tokens + static files
```

### Key paths

| Path | Role |
|---|---|
| `design/tokens.json` | Canonical data source — defines all token names, values, and descriptions |
| `scripts/generate-tokens.ts` | Reads `tokens.json`, writes both CSS outputs |
| `public/theme-editor/index.html` | The entire editor implementation |
| `public/tokens.css` | Generated CSS imported by overlay HTML files |
| `server.js` lines 21–125 | Token caching at startup + `GET /api/tokens` endpoint |

---

## 4. Architecture

### Layers

```
design/tokens.json          ← edit here (permanent changes)
        │
        │ bun run generate:tokens
        ↓
┌───────────────────────────────────────────────────────────┐
│  scripts/generate-tokens.ts                               │
│  Reads tokens.json and writes two CSS files:              │
│    • control-panel/src/generated-tokens.css (full set)    │
│    • public/tokens.css (overlay subset)                   │
└───────────────────────────────────────────────────────────┘
        │
        │ server startup
        ↓
┌───────────────────────────────────────────────────────────┐
│  server.js — GET /api/tokens                              │
│  Reads tokens.json once at startup into cachedTokens.     │
│  Every subsequent request is a zero-I/O JSON serialize.   │
└───────────────────────────────────────────────────────────┘
        │
        │ fetch() on page load
        ↓
┌───────────────────────────────────────────────────────────┐
│  public/theme-editor/index.html                           │
│  Fetches /api/tokens → builds sidebar UI → injects CSS    │
│  override <style> into the overlay iframe's document.     │
└───────────────────────────────────────────────────────────┘
        │
        │ iframe loads (same-origin)
        ↓
┌───────────────────────────────────────────────────────────┐
│  public/overlay-hp.html (or -dice, or -conditions)        │
│  Loads tokens.css. Editor injects <style id="__theme-     │
│  editor__"> into its <head>, which overrides tokens.css.  │
└───────────────────────────────────────────────────────────┘
```

### Why same-origin iframe injection?

The editor directly manipulates `iframe.contentDocument.head` — no `postMessage` relay. This is only possible because both the editor (`/theme-editor/`) and the overlays (`/overlay-hp.html`, etc.) are served from the same Express origin (`localhost:3000`). Cross-origin iframes would throw a security exception that the editor catches and surfaces as a status bar warning.

### No Socket.io involvement

The theme editor has **zero Socket.io integration**. It reads tokens once via REST and injects CSS locally. The overlays inside the iframe still maintain their own Socket.io connections to the server (so HP updates from the control panel are visible inside the preview), but theme changes never travel over the wire.

---

## 5. UI Layout

The page uses a CSS Grid with three named areas:

```
┌────────────────────────────────────────────────────┐
│  header  — title + action buttons                  │
├──────────────┬─────────────────────────────────────┤
│              │                                     │
│  sidebar     │  preview pane                       │
│  (340px)     │  (flex-fill)                        │
│              │                                     │
│  ┌─ Themes ─┐│  ┌─ toolbar: overlay select ───┐   │
│  │ chips    ││  │                             │   │
│  └──────────┘│  │                             │   │
│  ┌─ Tabs ───┐│  │  <iframe>                   │   │
│  │ Colors   ││  │  overlay-hp.html            │   │
│  │ HP …     ││  │                             │   │
│  └──────────┘│  └─────────────────────────────┘   │
│  ┌─ Panel ──┐│                                     │
│  │ rows     ││                                     │
│  └──────────┘│                                     │
│  ┌─ status ─┘                                     │
└──────────────┴─────────────────────────────────────┘
```

### Header

- **Title:** `THEME EDITOR dados & risas`
- **Buttons:** Reset to defaults | Import JSON | Export JSON | Export CSS | ▶ Apply to preview

### Sidebar (340px wide)

Three stacked sections:

1. **Themes bar** — shows named theme chips saved to localStorage; a `+ Save theme` button opens a prompt.
2. **Tab bar** — one tab per token group, built dynamically from the JSON keys. Tab labels use the first word of the group's display name (`Colors`, `HP`, `Typography`, `Spacing`, `Radii`, `Shadows`, `Motion`, `Opacity`, `Z-Index`, `Overlay`).
3. **Tab panels** — each panel contains rows of token inputs. Color-valued tokens render both a text input and a native `<input type="color">` kept in two-way sync.
4. **Status bar** — at the bottom of the sidebar; shows success (`✓ Applied to preview`), error (`✗ Could not fetch tokens`), or idle messages.

### Preview pane

- **Toolbar:** an `<select>` to switch overlays + a `↻ Reload` button.
- **`<iframe id="preview-frame">`** — loads the selected overlay. The editor's style injector targets this iframe's document.

---

## 6. Features in Detail

### 6.1 Token editing

Every token from `tokens.json` gets a row in its group's tab panel:

| Token type | Controls |
|---|---|
| Color (hex / `rgb()` / `hsl()`) | Text input (140px wide) + native color picker |
| Non-color (spacing, font, shadow, etc.) | Text input only |

**Two-way sync for color tokens:**
- Typing in the text field updates the color picker via `toHex()` (converts 3-digit hex and `rgb()` to 6-digit hex).
- Picking a color updates the text field with the hex value.

Edits are stored in an in-memory `overrides` object `{ "--token-name": "value" }`. The `overrides` object is a **delta** — only changed tokens are stored.

### 6.2 Live preview via iframe injection

**`applyToPreview()`** is the core function (index.html line 332):

1. Accesses `frame.contentDocument` (same-origin only).
2. Finds or creates `<style id="__theme-editor__">` in the overlay's `<head>`.
3. Sets `styleEl.textContent` to a full `:root { … }` block built by `buildStyleBlock()`.
4. `buildStyleBlock()` merges `canonicalTokens._flat` (all canonical defaults) with `overrides` (user changes), so the injected block always contains the full token set.

`applyToPreview()` is called:
- Once on initial load (after tokens are fetched).
- On every `change` event from any text input or color picker.
- On every `load` event of the iframe (handles overlay switching).
- When "▶ Apply to preview" is clicked.

### 6.3 Overlay switching

The `<select>` in the preview toolbar allows switching between:

| Label | URL loaded in iframe |
|---|---|
| HP Bars | `/overlay-hp.html` |
| Dice Result | `/overlay-dice.html` |
| Conditions | `/overlay-conditions.html` |

When the select changes, `iframe.src` is updated. The `load` event fires and re-applies the current overrides automatically, so theme state is preserved across overlay switches.

### 6.4 Save theme

Clicking **+ Save theme**:
1. Opens a `window.prompt()` for a name.
2. Validates against `/^[\w\s\-]{1,50}$/` (alphanumeric, spaces, hyphens, max 50 chars).
3. Stores the current `overrides` snapshot under that name in `savedThemes`.
4. Persists `savedThemes` to `localStorage` under the key `__dr_themes__`.
5. Renders a new chip in the themes bar.

**Applying a saved theme:**
Click the chip → `applyTheme()` sets `overrides` to a copy of the saved snapshot, refreshes all text inputs and color pickers, and calls `applyToPreview()`. The active chip gets a cyan border.

Themes **persist across sessions** — they survive browser restarts because they are stored in `localStorage`.

### 6.5 Export JSON

Downloads `theme-overrides.json` with shape:

```json
{
  "meta": {
    "name": "Dados & Risas Design Tokens",
    "version": "1.0.0",
    "description": "...",
    "exportedAt": "2026-02-26T12:00:00.000Z"
  },
  "overrides": {
    "--red": "#ff6b35",
    "--hp-healthy": "#4ade80"
  }
}
```

Only modified tokens appear in `overrides`. Unmodified tokens are omitted (they will fall back to canonical defaults when imported).

### 6.6 Export CSS

Downloads `theme-overrides.css` containing the full `:root { … }` block with **all** token values — canonical defaults merged with overrides. This is a ready-to-use CSS file that can be injected into any page to apply the theme without the server.

### 6.7 Import JSON

1. Opens a hidden `<input type="file" accept=".json">`.
2. Reads and `JSON.parse()`s the file.
3. Accepts either the full export shape (`{ meta, overrides }`) or a bare `{ "--token": "value" }` map.
4. **Sanitizes** by filtering keys: only keys that exist in `canonicalTokens._flat` are accepted. Unknown token names are silently discarded. This prevents arbitrary CSS variable injection from a malicious theme file.
5. Updates all text inputs and color pickers.
6. Calls `applyToPreview()`.

### 6.8 Reset to defaults

Clicking **Reset to defaults**:
1. Clears `overrides = {}`.
2. Sets every text input and color picker back to the canonical value from `canonicalTokens._flat`.
3. Calls `applyToPreview()`.

The saved themes in localStorage are **not** affected by reset.

---

## 7. Token Groups Reference

All groups are defined in `design/tokens.json`. The editor's `GROUP_LABELS` map defines display names:

| Group key | Display label | Tokens | Exported to overlays? |
|---|---|---|---|
| `colors` | Colors | `--black`, `--black-card`, `--black-elevated`, `--white`, `--grey`, `--grey-dim`, `--red`, `--red-dim`, `--cyan`, `--cyan-dim`, `--purple`, `--purple-dim`, `--purple-mid` | Yes |
| `hp` | HP Thresholds | `--hp-healthy`, `--hp-injured`, `--hp-critical`, `--hp-healthy-dim`, `--hp-injured-dim`, `--hp-critical-dim` | Yes |
| `overlayGradients` | Overlay Gradients | `--gradient-healthy`, `--gradient-injured`, `--gradient-critical` | Yes (overlay-only) |
| `typography` | Typography | `--font-display`, `--font-script`, `--font-mono`, `--font-ui` | Yes |
| `shadows` | Shadows | `--shadow-card`, `--shadow-red`, `--shadow-cyan`, `--shadow-purple` | Yes |
| `radii` | Radii | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill` | Yes |
| `spacing` | Spacing | `--space-half`, `--space-1` through `--space-12` | No (control panel only) |
| `motion` | Motion | `--t-fast`, `--t-normal`, `--t-spring` | No (control panel only) |
| `alpha` | Opacity / Alpha | `--alpha-subtle`, `--alpha-dim`, `--alpha-medium`, `--alpha-overlay`, `--alpha-solid` | No (control panel only) |
| `zIndex` | Z-Index | `--z-sidebar-backdrop`, `--z-sidebar`, `--z-nav`, `--z-modal-backdrop`, `--z-modal` | No (control panel only) |

> **Note on overlay tokens:** The "Exported to overlays?" column reflects what `generate-tokens.ts` writes to `public/tokens.css`. The editor itself edits *all* groups regardless, because it fetches the full `tokens.json`. Edits to spacing, motion, alpha, or z-index tokens will appear in the injected `<style>` block but will only take effect in the iframe if the overlay's CSS actually references those variables.

### HP threshold logic

HP bar color is driven by JavaScript in `overlay-hp.html`, not CSS alone. The `getHPClass()` function maps percentage to class:

| HP percentage | Class applied | Gradient used |
|---|---|---|
| > 60% | `healthy` | `var(--gradient-healthy)` |
| > 30% | `injured` | `var(--gradient-injured)` |
| ≤ 30% | `critical` | `var(--gradient-critical)` |

Editing `--gradient-healthy` (or `--hp-healthy` / `--hp-healthy-dim`) in the editor and applying to preview will visually update the HP bar for whichever state the demo characters are currently in.

---

## 8. Data Flow: Step-by-Step

### On page load

```
1. IIFE runs immediately.
2. SERVER = location.origin (or ?server= param value).
3. fetch(`${SERVER}/api/tokens`) → GET /api/tokens
4. Server returns design/tokens.json from in-memory cachedTokens.
5. tokens._flat = flattenTokens(tokens)
   → builds { "--black": "#000000", "--red": "#ff4d6a", … }
6. canonicalTokens = tokens
7. loadSavedThemes() → reads localStorage.__dr_themes__, validates names
8. buildSidebar(tokens)
   → creates tab buttons + panels with text inputs (+ color pickers for color values)
9. applyToPreview() → injects style block into iframe (no overrides yet, all canonical)
10. setStatus("Tokens loaded — edit values and click Apply", "ok")
```

### On token edit (text input)

```
input event  → overrides[tokenName] = input.value
             → sync color picker (if present): colorPicker.value = toHex(input.value)
change event → applyToPreview()
```

### On token edit (color picker)

```
input event  → input.value = colorPicker.value
             → overrides[tokenName] = colorPicker.value
change event → applyToPreview()
```

### applyToPreview() in detail

```
frame = document.getElementById("preview-frame")
doc = frame.contentDocument          ← throws if cross-origin
styleEl = doc.getElementById("__theme-editor__")
  or: styleEl = doc.createElement("style"); doc.head.appendChild(styleEl)
styleEl.textContent = buildStyleBlock()

buildStyleBlock():
  merged = { ...canonicalTokens._flat, ...overrides }
  rules = Object.entries(merged).map(([k, v]) => `  ${k}: ${sanitizeCSSValue(v)};`)
  return `:root {\n${rules.join("\n")}\n}`
```

The injected `:root {}` block overrides the overlay's imported `tokens.css` because CSS specificity is equal (both `:root`) but the injected style is appended to `<head>` after the `<link>` tag, giving it last-declared priority.

---

## 9. Integration with the Rest of the System

### What the editor touches

| System component | Relationship |
|---|---|
| `server.js` | Reads `GET /api/tokens`; served as static file at `/theme-editor/` |
| `design/tokens.json` | Reads (via API); never writes |
| `public/tokens.css` | Consumed by overlays in the iframe; editor overrides it via `<style>` injection |
| Socket.io | None — the editor has no Socket.io client |
| Control panel (Svelte) | No relationship — independent tool |
| OBS Browser Sources | The real OBS browser sources are not affected; only the iframe preview |

### What the editor does NOT touch

- The actual running overlays in OBS Browser Sources
- `design/tokens.json` on disk
- `public/tokens.css` on disk
- Any character or game state data

### Socket.io inside the iframe

The overlay HTML files loaded in the editor's preview iframe **maintain their own Socket.io connections** to the server. This means:

- HP updates from the control panel appear inside the preview while you are editing themes.
- Dice roll results show up live.
- The Socket.io connection coexists with the CSS injection — they affect different parts of the overlay.

---

## 10. Remote Server Support

The theme editor supports pointing at a server running on a different machine (useful for LAN demos):

```
http://localhost:3000/theme-editor/?server=http://192.168.1.5:3000
```

With the `?server=` parameter:
- Token fetch goes to `http://192.168.1.5:3000/api/tokens`.
- The iframe preview still loads overlays from the **local** origin (where the editor HTML is hosted), so same-origin injection still works.

> **Limitation:** If the editor HTML itself is opened as a local file (`file://`) rather than from the server, same-origin iframe injection will fail. Always serve the editor through Express.

---

## 11. Security Measures

The editor includes several safeguards since it injects arbitrary CSS into iframes:

### CSS value sanitization

`sanitizeCSSValue(v)` strips the characters `{`, `}`, `;`, `\n`, and `\r` from all token values before they are written into the `:root {}` block. This prevents a malicious value from breaking out of the property declaration and injecting arbitrary CSS rules.

```js
function sanitizeCSSValue(v) {
  return String(v).replace(/[{};\n\r]/g, "");
}
```

### Import sanitization

When importing a JSON theme file, only keys that already exist in `canonicalTokens._flat` are accepted. Unknown CSS variable names are silently discarded. This blocks injection of arbitrary CSS custom properties that could affect overlay layout in unexpected ways.

```js
const sanitized = {};
for (const [k, v] of Object.entries(raw)) {
  if (Object.prototype.hasOwnProperty.call(knownTokens, k)) {
    sanitized[k] = String(v);
  }
}
```

### Theme name validation

Saved theme names must match `/^[\w\s\-]{1,50}$/` (word chars, spaces, hyphens; max 50 chars). Names that don't match are rejected with a status bar error. Stored theme data is also re-validated on load — entries with non-conforming names are stripped from `savedThemes` before use.

### Cross-origin guard

`applyToPreview()` wraps the iframe DOM access in a `try/catch`. If the overlay is cross-origin, the access throws and the status bar shows `⚠ Could not inject into iframe (cross-origin?)` rather than throwing an unhandled exception.

---

## 12. Known Limitations

### Editor chrome is not tokenized

The editor's own UI colors (`#000`, `#00d4e8`, etc.) are hardcoded in its internal `:root {}` block and are **not** read from `tokens.json`. If brand colors change, the editor's chrome will not automatically reflect them.

### Changes are local only

Theme editor overrides live in browser memory and `localStorage`. They do not:
- Write back to `design/tokens.json`
- Update `public/tokens.css` or `generated-tokens.css`
- Affect OBS Browser Sources that are pointed at the overlays

### `window.prompt()` for theme names

The "Save theme" button uses the browser's native `prompt()` dialog, which is jarring in a dark-themed tool but works universally without any additional UI code.

### Overlay subset vs. full token set

The editor loads **all** token groups from `tokens.json` (including spacing, motion, alpha, and z-index). But overlays only consume the subset written to `public/tokens.css` (colors, HP, gradients, typography, shadows, radii). Editing a spacing or z-index token in the editor will inject it into the iframe's `:root {}`, but unless the overlay CSS references that variable, the change will have no visible effect in the preview.

### No undo/redo

There is no history stack. The only way to revert is:
- Click "Reset to defaults" (reverts everything).
- Click a saved theme chip (reverts to that snapshot).
- Manually retype the original value.

---

## 13. Making Changes Permanent

The theme editor is a **read-only prototyping tool**. To make a theme permanent:

### Step-by-step

1. In the editor, achieve the desired look.
2. Click **Export JSON** → download `theme-overrides.json`.
3. Open `design/tokens.json` in a text editor.
4. For each entry in the exported `overrides` object, find the corresponding token in `tokens.json` and update its `"value"` field.
5. Run the generator to regenerate both CSS outputs:
   ```bash
   bun run generate:tokens
   ```
6. The two CSS files are overwritten:
   - `control-panel/src/generated-tokens.css` (Svelte app + Storybook)
   - `public/tokens.css` (OBS overlays)
7. Commit all three changed files (`tokens.json`, `generated-tokens.css`, `tokens.css`).

### Shortcut: Export CSS

If you only need to patch the overlay CSS for a quick demo, you can:
1. Click **Export CSS** → download `theme-overrides.css`.
2. Replace `public/tokens.css` with the exported file.
3. Do not run `generate:tokens` (or it will overwrite your changes).

> This approach is fragile — your manual file will be overwritten the next time anyone runs `bun run generate:tokens`. Use only for short-term demos.

---

## 14. Troubleshooting

### "Could not fetch tokens from server. Is it running?"

The editor could not reach `GET /api/tokens`. Check:
- Is `server.js` running? (`bun server.js` or `node server.js`)
- Is it on port 3000? Check for `EADDRINUSE` in the terminal.
- Did you open the editor at `http://localhost:3000/theme-editor/` (not as a local file)?

### "Could not inject into iframe (cross-origin?)"

The overlay iframe loaded from a different origin than the editor. This happens if:
- You opened the editor as a local file (`file://`) instead of via the server.
- You passed a `?server=` URL that is a different host than where the overlays are served.

Solution: always open the editor through the Express server (`http://localhost:3000/theme-editor/`).

### Changes aren't visible in OBS

The theme editor **only affects the preview iframe** — it does not touch OBS Browser Sources. To apply a theme to OBS overlays, you must regenerate the CSS files (see [Making Changes Permanent](#13-making-changes-permanent)) and then refresh the Browser Sources in OBS (right-click Source → Refresh).

### Sidebar shows no tokens / stays empty

`buildSidebar()` only renders groups whose key exists in the fetched JSON. If `design/tokens.json` is malformed, the fetch will fail and the sidebar will remain empty. Check the browser console (F12) and the server terminal for parse errors.

### Saved themes disappeared

`localStorage` is scoped to the origin (`http://localhost:3000`). Themes saved in one browser or from a different URL will not appear. Also, `savedThemes` is re-validated on load — entries with non-conforming names are dropped.

### Color picker shows wrong color

The `toHex()` helper converts 3-digit hex and `rgb()` to 6-digit hex for the native color picker. Values like `rgba()` (with alpha), `hsl()`, or CSS gradient strings (`linear-gradient(…)`) cannot be represented by `<input type="color">` and will fall back to `#000000` in the picker (though the text input retains the correct original value).

---

## See Also

- [`docs/THEMING.md`](./THEMING.md) — token pipeline overview and generator reference
- [`docs/DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) — full design system and token usage in components
- [`design/tokens.json`](../design/tokens.json) — the canonical token source
- [`scripts/generate-tokens.ts`](../scripts/generate-tokens.ts) — the CSS generator
- [`public/theme-editor/index.html`](../public/theme-editor/index.html) — the editor implementation
