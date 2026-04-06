---
name: design-to-component
description: Build a production Svelte 5 component from a design spec or by extracting patterns from existing code — token-mapped, classified by surface, with Storybook story. Self-contained; works with spec input (ui-designer output or prose) or extraction mode (existing code path).
argument-hint: /design-to-component <ComponentName or file path>
user-invokable: true
---

Build a production-ready Svelte 5 component for the Dados & Risas / TableRelay project,
starting from either a design spec or existing code. Produces the component file, story file,
and any token additions — all tightly bound to this project's conventions.

---

## Input Modes

**Spec mode** — user provides a design spec (from `ui-designer` output or prose description).
Skip pattern scanning; go straight to clarification questions.

**Extraction mode** — user provides a file path or area name (e.g. "the HP bar in CharacterCard").
Run a Discover scan first, then clarify.

If neither is clear, ask before proceeding.

---

## Phase 1 — DISCOVER & CLARIFY

### Extraction mode only: scan first

Before asking anything, read the target file(s) and identify:

- **Repeated patterns** — similar UI markup used 2+ times
- **Hardcoded values** — hex colors, raw px spacing, raw border-radius values that have token equivalents in `design/tokens.json`
- **Inconsistent implementations** — multiple versions of the same concept (e.g. three different card shadow styles)
- **Extraction candidates** — patterns worth systematizing vs. context-specific one-offs

Build and present a short candidate list, then ask the user which ones to extract.

> Not everything should be extracted. A pattern worth extracting is used 3+ times, improves
> consistency, and is general enough to survive outside its current context.

### Both modes: clarify before writing any code

Ask these questions if not already answered by the spec or extraction scan:

1. **Component name** — PascalCase (e.g. `ConditionPill`, `TurnIndicator`, `RollBadge`)
2. **Surface placement** — determines file path:
   - `shared` → `control-panel/src/lib/components/shared/<name>/`
   - `stage` → `control-panel/src/lib/components/stage/`
   - `cast` → `control-panel/src/lib/components/cast/dm/` or `cast/players/`
   - `overlays` → `control-panel/src/lib/components/overlays/`
   - `commons` → `control-panel/src/lib/components/commons/`
3. **Variants** — list every visual variant by name; which is the default?
4. **Interactive or display-only** — does it respond to clicks/keyboard? What does it emit?
5. **State modifiers** — boolean `is-*` states that change appearance (e.g. `is-active`, `is-critical`)
6. **Contract types** — does this component consume `CharacterRecord`, `SessionRecord`, etc.?
   Check `control-panel/src/lib/contracts/records.ts` if unsure.

Do not proceed to Phase 2 until all six are resolved.

---

## Phase 2 — TOKEN PLAN

Read `design/tokens.json` fresh every time. Do not rely on memory.

Build a written TOKEN PLAN before touching CSS:

```
TOKEN PLAN for <ComponentName>
  Background:  var(--black-card)          ← card surface
  Border:      var(--grey-dim)            ← default; var(--cyan) when selected
  Text:        var(--white) primary       ← label text
               var(--grey) secondary      ← supporting text
  Accent:      var(--cast-amber)          ← amber variant
  Spacing:     var(--space-3) padding
               var(--space-2) gap
  Radius:      var(--radius-md)
  Shadow:      var(--shadow-card)
  Transition:  var(--t-fast)
  Font:        var(--font-display) labels
               var(--font-mono) numbers
  New tokens:  none
```

### When a spec value has no matching token

- **One-off** → map to the nearest existing token, note the substitution in your output
- **Semantically meaningful + likely reused** → propose a new token. Show the exact JSON diff
  before adding anything. **Wait for user approval.** Do not modify `design/tokens.json` silently.

Example new token proposal:
```diff
  "colors": {
+   "--cast-glass-border": "rgba(200, 148, 74, 0.18)"
  }
```
Then remind the user to run `bun run generate:tokens` from the repo root after approval.

### Classification → file structure

| Classification | Scoped `<style>`? | Paired `.css` file? | `index.js`? | Socket import? |
|---------------|-------------------|---------------------|-------------|----------------|
| **Primitive** (shared) | Yes | No | Yes | No (pure) |
| **Business** (surface) | No | Yes, paired `<Name>.css` | No | Via service, not directly |
| **Overlay** (audience) | Yes | No | No | `overlaySocket.svelte.ts` only |

**Primitive** — no domain types, no socket, no PocketBase; usable across surfaces. Examples: `RollBadge`, `ResourcePip`, `LevelPill`.

**Business** — consumes `$lib/contracts/` types or `$lib/services/`; tied to a surface. Examples: `CharacterCard`, `SessionCard`, `InitiativeStrip`.

**Overlay** — lives at `(audience)/` routes, displayed in OBS, receives data only via Socket.io, must have `mock*` props for Storybook. Examples: `OverlayHP`, `OverlayDice`, `OverlayConditions`.

---

## Phase 3 — BUILD

### Primitive template (scoped `<style>`)

```svelte
<script module>
  /**
   * <ComponentName>
   * ─────────────────────────────────────────────
   * [One-line description of what this component does.]
   *
   * Variants (data-variant attribute):
   *   "default" — [describe]
   *   "red"     — damage / critical state
   *   "cyan"    — healing / selection
   *   "amber"   — cast surface accent
   *
   * Props:
   *   variant   {string}   visual style; drives CSS via data-variant
   *   [others]
   *   class     {string}   forwarded to root element
   */
</script>

<script>
  let {
    variant = "default",
    class: className = "",
    ...restProps
  } = $props();

  // $derived for computed values; $state for local UI state; $effect for DOM side-effects only
</script>

<div
  class="component-name {className}"
  data-variant={variant}
  {...restProps}
>
  <!-- template -->
</div>

<style>
  /* ── Base ─────────────────────────────────────────── */
  .component-name {
    /* CSS custom properties = variant API.
       Declare defaults here; variants override below. */
    --comp-color:   var(--grey);
    --comp-border:  var(--grey-dim);
    --comp-bg:      transparent;
    --comp-shadow:  none;

    /* Structure */
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    border: 1px solid var(--comp-border);
    background: var(--comp-bg);
    color: var(--comp-color);

    /* Typography */
    font-family: var(--font-display);
    font-size: 0.875rem;
    line-height: 1;

    /* Motion — list properties explicitly, never "all" */
    transition:
      background var(--t-fast),
      color var(--t-fast),
      border-color var(--t-fast),
      box-shadow var(--t-fast);
  }

  /* ── Variants ──────────────────────────────────────── */
  .component-name[data-variant="default"] {
    --comp-color:   var(--white);
    --comp-border:  var(--grey-dim);
    --comp-bg:      var(--black-elevated);
  }

  .component-name[data-variant="red"] {
    --comp-color:  var(--red);
    --comp-border: var(--red);
    --comp-bg:     var(--red-dim);
  }

  .component-name[data-variant="cyan"] {
    --comp-color:  var(--cyan);
    --comp-border: var(--cyan);
    --comp-bg:     var(--cyan-dim);
  }

  .component-name[data-variant="amber"] {
    --comp-color:  var(--cast-amber);
    --comp-border: var(--cast-amber-border);
    --comp-bg:     var(--cast-amber-dim);
  }

  /* ── State modifiers ──────────────────────────────── */
  .component-name.is-active  { /* selected / focused */ }
  .component-name.is-critical { --comp-border: var(--red); --comp-color: var(--red); }

  /* ── Interactive states ───────────────────────────── */
  .component-name:hover { /* add if interactive */ }

  .component-name:active { transform: scale(0.97); }

  /* Required for all interactive elements */
  .component-name:focus-visible {
    outline: 2px solid var(--cyan);
    outline-offset: 2px;
  }
</style>
```

### Business component template (paired `.css`)

The `.svelte` file — import the CSS at the top of `<script lang="ts">`:

```svelte
<script lang="ts">
  import './ComponentName.css';
  import type { CharacterRecord } from '$lib/contracts/records';

  let {
    character,
    isActive = false,
    class: className = "",
    ...restProps
  }: {
    character: CharacterRecord;
    isActive?: boolean;
    class?: string;
    [key: string]: unknown;
  } = $props();

  const computed = $derived(/* ... */);
</script>

<article
  class="component-name {className}"
  class:is-active={isActive}
  {...restProps}
>
  <!-- template -->
</article>
```

The paired `ComponentName.css`:
```css
/* ComponentName.css
 * ─────────────────────────────────────────────
 * Svelte ↔ CSS quick-map:
 *   .component-name           → root <article>
 *   .component-name__header   → header section
 *   .component-name.is-active → selected state
 *   .component-name.is-critical → critical HP state
 */

.component-name {
  /* all token vars, no hardcoded values */
}

.component-name.is-active { /* ... */ }
.component-name.is-critical { /* ... */ }
```

### Overlay template

Like a primitive (scoped `<style>`) but with:
- `mock*` prop (e.g. `mockCharacters`) for Storybook isolation — the real socket data
  uses this same prop shape
- `data-char-id` attributes on DOM nodes that need socket-driven updates
- Import `overlaySocket.svelte.ts` from `$lib/components/overlays/shared/`

### Global utility classes — compose in HTML, never re-declare in CSS

These are loaded globally via `app.css` → `utilities.css`. Add them to the element's `class`
attribute directly:

| Class | Behavior |
|-------|----------|
| `.row` | flex row, `gap: var(--space-2)` |
| `.row-tight` | flex row, `gap: var(--space-1)` |
| `.row-spread` | flex row, `justify-content: space-between` |
| `.stack` | flex column, `gap: var(--space-2)` |
| `.stack-tight` | flex column, `gap: var(--space-1)` |
| `.stack-center` | flex column, centered |
| `.surface-card` | `background: var(--black-card)` |
| `.surface-elevated` | `background: var(--black-elevated)` |
| `.border-subtle` | `border: 1px solid var(--grey-dim)` |
| `.border-red` / `.border-cyan` / `.border-purple` | colored 1px border |
| `.text-muted` | `color: var(--grey)` |
| `.text-red` / `.text-cyan` / `.text-purple` | colored text |
| `.text-value` | white, mono, bold, tabular-nums |
| `.pill` | `border-radius: var(--radius-pill)` |
| `.rounded` / `.rounded-lg` | `--radius-md` / `--radius-lg` |
| `.interactive` | cursor + transition shorthand |
| `.pressable` | `:active { transform: scale(0.95) }` |
| `.label-caps` | display font, 0.7rem, uppercase, letter-spacing — all labels |
| `.mono-num` | mono font, bold, lh 1 — all numeric values |
| `.card-base` | full card frame (bg, border, radius, shadow, padding) |
| `.btn-base` | shared button frame (min-height: 52px, font, border, transition) |
| `.sr-only` | screen-reader only |

### Write the Storybook story

```svelte
<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ComponentName from "./component-name.svelte";

  /* ── Mock data ───────────────────────────────────────
     All fixtures inline — no socket, no PocketBase.
     Use canonical IDs: CH101 Kael, CH102 Lyra, CH103 Brum, CH104 Zara
  ────────────────────────────────────────────────── */
  const mockCharacter = {
    id: "CH101",
    name: "Kael",
    /* minimum shape for this component */
  };

  const { Story } = defineMeta({
    title: "<SurfacePrefix>/<ComponentName>",  /* see table below */
    component: ComponentName,
    tags: ["autodocs"],  /* REQUIRED — never omit */
    parameters: {
      docs: {
        description: {
          component: `**<ComponentName>** — [one sentence].\n\nUsed in: \`ParentComponent\``,
        },
      },
    },
    argTypes: {
      variant: {
        control: { type: "select" },
        options: ["default" /* list all */],
      },
    },
  });
</script>

<Story name="Default" args={{ variant: "default" }} />

<Story name="All Variants">
  <div style="display:flex;gap:8px;flex-wrap:wrap;padding:16px;align-items:center;">
    <!-- each variant rendered inline -->
  </div>
</Story>
```

**Story title convention:**

| Surface | Title prefix |
|---------|-------------|
| Shared primitive | `"Shared/<ComponentName>"` |
| Stage | `"Stage/<ComponentName>"` |
| Cast / DM | `"Cast/DM/<ComponentName>"` |
| Cast / Players | `"Cast/Players/<ComponentName>"` |
| Audience (overlay) | `"Audience/Persistent/<Name>"` or `"Audience/Moments/<Name>"` |
| Commons | `"Commons/<ComponentName>"` |

**Required stories — cover all that apply:**
1. Default state
2. Every named variant (one story each, or an "All Variants" composite)
3. Every `is-*` modifier that visually changes appearance
4. Interactive state (if the component is interactive)
5. "In context" story showing the component inside its typical parent layout

Overlays additionally need:
```svelte
parameters: { layout: "fullscreen", backgrounds: { default: "dark" } }
```

### Validate

Run `bun run lint` from `control-panel/` and fix all errors before proceeding.

If the Svelte MCP autofixer is available (`mcp__claude_ai_svelte__svelte-autofixer`), run it
on the component code as well — it catches Svelte 5 rune mistakes and SSR issues that lint
misses. Iterate until no errors or warnings remain.

---

## Phase 4 — MIGRATE (extraction mode only)

When you extracted a pattern from existing code:

1. **Find all instances** — search the codebase for the old pattern (Grep for class names, inline styles, or the repeated markup structure)
2. **Replace each** with an import of the new component
3. **Delete dead code** — the old CSS selectors, any helper functions that were absorbed
4. **Preserve DOM attributes** — ensure `data-char-id`, `data-variant`, and other mapping attributes are carried through correctly on the new component
5. **Verify parity** — read the before/after side by side and confirm nothing visual was lost

---

## Phase 5 — SUMMARY

Report to the user:

1. **Files created / modified** (absolute paths from project root)
2. **Storybook path** to verify (e.g. `Shared/ConditionPill`)
3. **Import statement** for callers: `import { ComponentName } from '$lib/components/shared/<name>'`
4. **Token substitutions** — every case where the spec value X was mapped to token Y
5. **New tokens** — if any were added to `design/tokens.json`, list them and remind user to run `bun run generate:tokens` from the repo root
6. **Lint / autofixer results** — any issues found and how they were resolved
7. **Migration count** (extraction mode only) — N instances of the old pattern replaced

---

## Pre-Output Checklist

Verify every item before calling the work complete.

### Token compliance
- [ ] Zero hardcoded hex colors in `<style>` blocks or `.css` files (grep for `#[0-9a-fA-F]`)
- [ ] Zero raw px values for spacing that have a `--space-*` token (`padding: 8px` → `var(--space-2)`)
- [ ] Zero raw px border-radius that have a `--radius-*` token
- [ ] Every transition uses `var(--t-fast)`, `var(--t-normal)`, or `var(--t-spring)`
- [ ] Every font-family is `var(--font-*)` not a quoted family name

### CSS architecture
- [ ] Primitive: scoped `<style>` block present, **no** paired `.css` file
- [ ] Business: paired `.css` file imported at top of `<script>`, **no** `<style>` block
- [ ] Variant logic lives in `[data-variant="x"]` CSS selectors — **no** `tv()` or `cn()`
- [ ] Variant API uses CSS custom properties on the root class, overridden per variant
- [ ] State modifiers use `.is-` prefix (`.is-critical`, `.is-active`, `.is-selected`)
- [ ] Global utility classes used in HTML — not redeclared inside `<style>`
- [ ] `transition` lists individual properties, never `all`

### Svelte 5 runes
- [ ] `$props()` used: `let { variant = "default", class: className = "", ...restProps } = $props()`
- [ ] Computed values use `$derived()` not `$:` reactive statements
- [ ] Local UI state uses `$state()` not `writable()`
- [ ] DOM side-effects use `$effect()`
- [ ] No `import { writable } from 'svelte/store'` in the component file

### Storybook
- [ ] `tags: ["autodocs"]` present in `defineMeta()`
- [ ] Story title follows surface convention table above
- [ ] All mock data is inline — no `$lib/services/socket` import in the story file
- [ ] Overlay stories have `layout: "fullscreen"` parameter
- [ ] Every visual variant has at least one named Story

### Validation
- [ ] `bun run lint` (from `control-panel/`) passes with zero errors
- [ ] Svelte autofixer run (if MCP available) — zero errors

### Placement & exports
- [ ] File is in the correct directory for its surface and classification
- [ ] Primitive: `index.js` barrel export created (`export { default as ComponentName } from ...`)
- [ ] Business / overlay: no `index.js` needed (imported directly by path)

---

## Anti-Patterns — Never Do These

| Anti-pattern | Correct approach |
|---|---|
| `import { tv } from "tailwind-variants"` in a new component | `[data-variant="x"]` CSS selectors + CSS custom properties |
| `import { cn } from "$lib/services/utils.js"` in a new component | `class="comp-name {className}"` string interpolation |
| `color: #ff4d6a` | `color: var(--red)` |
| `padding: 8px` | `padding: var(--space-2)` |
| `border-radius: 8px` | `border-radius: var(--radius-md)` |
| `transition: all 150ms ease` | `transition: background var(--t-fast), color var(--t-fast)` |
| `$: computed = value * 2` (Svelte 4 syntax) | `const computed = $derived(value * 2)` |
| `import { writable } from 'svelte/store'` | `$state()` |
| Scoped `<style>` in a business component that has a paired `.css` file | One or the other — never both |
| `socket.on(...)` inside a primitive or business component | Socket subscriptions belong in `+page.svelte` or a service layer |
| Storybook story that imports `$lib/services/socket` | All story data is inline mock fixtures |
| Omitting `tags: ["autodocs"]` | Always include it |
| Silent addition to `design/tokens.json` | Show the JSON diff, wait for approval |

---

## Important: Two Component Generations

The project has two generations of primitives. **Do not mix them.**

**Generation 1** (existing, built before this convention): `Button`, `Badge`, `ConditionPill`,
`StatDisplay`, `Select`, `Checkbox`, `Input`. These use `tv()` + `cn()` from shadcn-svelte.
**Do not refactor them unless explicitly asked.** When adding a variant to a Gen 1 component,
match its existing `tv()` pattern.

**Generation 2** (this skill's output): `data-variant` + CSS custom properties + scoped
`<style>` + token vars only. Every component you create with this skill is Gen 2.

If you are unsure which generation an existing component is: check whether it imports `tv`
from `tailwind-variants`. If yes → Gen 1. If no → Gen 2 (or a business component with paired CSS).
