---
name: new-component
description: Scaffold a new Svelte 5 UI component following PITCH OVERLAYS project conventions — scoped <style> block, token-based CSS, data-attribute variants, Storybook story, index.js re-export.
argument-hint: /new-component <ComponentName>
---

## New Component Skill

Scaffold a new primitive UI component in `control-panel/src/lib/components/ui/<name>/`.

## Arguments

The user provides a PascalCase component name, e.g. `/new-component RollBadge`.

---

## Output: 3 Files

### 1. `<name>.svelte` (kebab-case filename)

Full structure — scoped `<style>` block at the bottom, NO `tv()` or `cn()`:

```svelte
<script module>
  /**
   * <ComponentName>
   * ===============
   * [One-line description of what this component does.]
   *
   * Variants (data-variant attribute):
   *   - "default" — [describe]
   *   - "..."     — [describe]
   *
   * Props:
   *   - variant      — controls visual style via data-variant CSS selectors
   *   - [other props]
   *   - class        — forwarded to root element for caller overrides
   */
</script>

<script>
  let {
    variant = "default",
    // add component-specific props here
    class: className = "",
    ...restProps
  } = $props();
</script>

<!-- Root element carries data-variant for CSS selectors.
     Spread ...restProps so callers can add aria-*, id, etc. -->
<div
  class="component-name {className}"
  data-variant={variant}
  {...restProps}
>
  <!-- template -->
</div>

<style>
  /* ── Base ───────────────────────────────────── */
  .component-name {
    /* Declare CSS custom properties for the variant API.
       Each variant overrides these below. */
    --comp-color:    var(--grey);
    --comp-border:   var(--grey-dim);
    --comp-bg:       transparent;
    --comp-hover-bg: var(--grey-dim);

    /* Structural styles */
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    border: 1px solid var(--comp-border);
    background: var(--comp-bg);
    color: var(--comp-color);

    /* Typography — use token vars + app.css font classes */
    font-family: var(--font-ui);
    font-size: 0.875rem;
    line-height: 1;

    /* Transitions */
    transition:
      background var(--t-fast),
      color var(--t-fast),
      border-color var(--t-fast);
  }

  /* ── Variants ───────────────────────────────── */
  .component-name[data-variant="default"] {
    --comp-color:    var(--white);
    --comp-border:   var(--grey-dim);
    --comp-bg:       var(--black-elevated);
    --comp-hover-bg: var(--grey-dim);
  }

  /* Add more variants: [data-variant="red"], [data-variant="cyan"], etc. */

  /* ── States ─────────────────────────────────── */
  .component-name:hover {
    background: var(--comp-hover-bg);
  }

  .component-name[data-interactive="true"] {
    cursor: pointer;
  }

  /* ── Size modifiers (if needed) ─────────────── */
  /* .component-name[data-size="sm"] { ... } */
</style>
```

---

### 2. `<PascalCase>.stories.svelte`

```svelte
<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import <ComponentName> from "./<name>.svelte";

  const { Story } = defineMeta({
    title: "UI/<ComponentName>",
    component: <ComponentName>,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component: `
**<ComponentName>** [one-sentence description].

Used in:
- \`ParentComponent\` — [context]

### Variants
| \`data-variant\` | Appearance | Use Case |
|-----------------|-----------|----------|
| \`default\`      | ...        | ...      |
          `,
        },
      },
    },
    argTypes: {
      variant: {
        control: { type: "select" },
        options: ["default"],
        description: "[what the variant controls]",
      },
    },
  });
</script>

<Story name="Default" args={{ variant: "default" }} />

<Story name="All Variants">
  <div style="display:flex; gap:8px; flex-wrap:wrap; padding:16px; align-items:center;">
    <!-- render each variant here, e.g.: -->
    <!-- <ComponentName variant="default">Label</ComponentName> -->
  </div>
</Story>
```

---

### 3. `index.js`

```js
export { default as <ComponentName> } from "./<name>.svelte";
```

Note: No variants export needed — variant logic lives in CSS, not JS.

---

## CSS Design System Reference

### Global utilities (from `utilities.css` — already loaded globally)

| Class                      | What it does                                     |
| -------------------------- | ------------------------------------------------ |
| `.row`                     | `flex; align-items: center; gap: var(--space-2)` |
| `.row-tight`               | same but `gap: var(--space-1)`                   |
| `.row-spread`              | flex row with `justify-content: space-between`   |
| `.inline-row`              | inline-flex row                                  |
| `.stack`                   | flex column, `gap: var(--space-2)`               |
| `.stack-center`            | flex column, centered, `gap: var(--space-1)`     |
| `.surface-card`            | `background: var(--black-card)`                  |
| `.surface-elevated`        | `background: var(--black-elevated)`              |
| `.surface-red/cyan/purple` | tinted accent fill (`*-dim` token)               |
| `.border-subtle`           | `border: 1px solid var(--grey-dim)`              |
| `.border-red/cyan/purple`  | colored 1px border                               |
| `.text-muted`              | `color: var(--grey)`                             |
| `.text-red/cyan/purple`    | accent text color                                |
| `.text-value`              | white, mono, bold, tabular-nums                  |
| `.pill`                    | `border-radius: var(--radius-pill)`              |
| `.rounded`                 | `border-radius: var(--radius-md)`                |
| `.interactive`             | cursor + transition shorthand                    |
| `.pressable`               | adds `active { transform: scale(0.95) }`         |

### Global classes already in `app.css`

| Class                                       | What it does                                                  |
| ------------------------------------------- | ------------------------------------------------------------- |
| `.label-caps`                               | display font, 0.7rem, caps, tracking — use for ALL label text |
| `.mono-num`                                 | mono font, bold, line-height 1 — use for all numeric values   |
| `.font-display / .font-mono / .font-script` | font-family only                                              |
| `.card-base`                                | full card frame (bg, border, radius, shadow, padding)         |
| `.btn-base`                                 | shared button frame (font, min-height, border, transition)    |
| `.sr-only`                                  | screen-reader only                                            |

### Token variables (always use these — never hardcode colors)

```
Surfaces:  var(--black)  var(--black-card)  var(--black-elevated)
Colors:    var(--red)  var(--red-dim)  var(--cyan)  var(--cyan-dim)
           var(--purple)  var(--purple-dim)  var(--grey)  var(--grey-dim)
HP:        var(--hp-healthy)  var(--hp-injured)  var(--hp-critical)
Fonts:     var(--font-display)  var(--font-mono)  var(--font-ui)
Spacing:   var(--space-1) … var(--space-12)
Radii:     var(--radius-sm)  var(--radius-md)  var(--radius-lg)  var(--radius-pill)
Motion:    var(--t-fast)  var(--t-normal)  var(--t-spring)
Shadows:   var(--shadow-card)  var(--shadow-red)  var(--shadow-cyan)
```

---

## Hard Rules

| Rule                                                              | Why                                            |
| ----------------------------------------------------------------- | ---------------------------------------------- |
| Scoped `<style>` block in `.svelte` — NOT a paired `.css` file    | Components own their styles; no file hierarchy |
| NO `tv()` or `tailwind-variants`                                  | CSS + data attributes replace it cleanly       |
| NO `cn()` — just plain class string interpolation                 | `class="comp {className}"` is sufficient       |
| Variants via `[data-variant="x"]` selectors                       | CSS handles the switch, no JS class juggling   |
| CSS custom properties for the variant API                         | Enables clean hover + state composition        |
| Only token vars — never hardcode colors/sizes                     | `var(--red)` not `#ff4d6a`                     |
| `class: className = ""` + `...restProps` in `$props()`            | Allows caller overrides                        |
| `tags: ["autodocs"]` in every story                               | Required for Storybook + Chromatic             |
| `$state`/`$derived`/`$effect` — NOT writable stores in components | Svelte 5 runes convention                      |
| No socket interaction in `components/ui/`                         | Primitives are pure                            |

---

## After Scaffolding

1. Check Storybook at `http://localhost:6006` — story appears under `UI/<ComponentName>`
2. Run `bun run lint` from `control-panel/` — no warnings allowed
3. Import via `import { <ComponentName> } from '$lib/components/ui/<name>'`
