---
name: svelte-native
description: Convert a bits-ui / shadcn-svelte / tailwind-variants component to a native Svelte 5 component with a paired CSS file and design token vars. Use when Tailwind class resolution fails, bits-ui quirks break styling, or the component fights the project's token system.
argument-hint: /svelte-native <ComponentName or file path>
---

# Svelte Native Skill

Convert a `bits-ui`, `shadcn-svelte`, or `tailwind-variants` component into a native Svelte 5 + CSS component that follows the project's conventions.

**Use when:**
- Tailwind utility classes aren't resolving (font-family, clip-path, custom properties)
- `tailwind-variants` `tv()` classes are silently ignored (common in `<script module>` string arrays)
- The component has styling that fights the design token system
- The component is simple enough that bits-ui headless primitives add no value

---

## Argument

`$ARGUMENTS` is the component to convert — e.g. `ConditionPill`, `src/lib/components/shared/condition-pill/condition-pill.svelte`.

---

## Workflow

### Step 1 — Audit the current component

Re-read the component file fresh.

Extract:
- **Props**: names, types, defaults
- **Variants**: what visual states exist and what changes between them (color, border, background)
- **Interactivity**: click handlers, hover states, keyboard behavior
- **Accessibility**: roles, aria attributes, labels
- **Exports**: anything exported from the component file (e.g. `conditionPillVariants`) — check `index.js`

```bash
# Find the index barrel
cat src/lib/components/shared/<name>/index.js

# Find all import sites
grep -r "ComponentName" control-panel/src --include="*.svelte" --include="*.ts" --include="*.js" -l
```

Check what named exports are consumed at import sites. If a `tv()` variant object is exported and used elsewhere, note it — it will need to be replaced.

### Step 2 — Map to project conventions

Before writing anything, confirm the design tokens and patterns to use:

**Typography** — check `StripCard.css` or `btn-add-condition` as the reference for label-scale elements:
- `font-family: var(--font-display)` — Bebas Neue, for UI labels and badges
- `font-family: var(--font-mono)` — JetBrains Mono, for numbers and status codes
- `font-size: 10px` — smallest label size in the system
- `letter-spacing: 0.05em` — standard for uppercase labels

**Shape** — check which clip-path fits:
- `clip-path: var(--hex-clip-sm)` — small badges, pills, tags
- `clip-path: var(--hex-clip-md)` — buttons, larger elements
- `border-radius` — only for elements that intentionally break the hex aesthetic

**Colors** — always use tokens, never hardcode:
- `var(--red)` / `color-mix(in srgb, var(--red) 12%, transparent)` — destructive / condition
- `var(--cyan)` / `color-mix(in srgb, var(--cyan) 10%, transparent)` — info / tag
- `var(--cast-amber)` — primary brand accent
- `var(--grey-dim)` — neutral / disabled

**Height** — match sibling interactive elements:
- `height: 26px` — small badges and inline labels
- `height: 44px` — primary action buttons (WCAG touch target)

### Step 3 — Write the native component

Replace the component file entirely. Structure:

```svelte
<!--
  ComponentName
  =============
  One-line description.

  Variants: (list them)
  Props: (list interactive props)
-->
<script>
  let {
    prop1,
    variant = 'default',
    interactive = false,
    onAction = () => {},
    class: className = '',
    ...restProps
  } = $props();
</script>

{#if interactive}
  <button
    class="component-name component-name--{variant} {className}"
    onclick={() => onAction()}
    {...restProps}
  >
    <!-- content -->
  </button>
{:else}
  <span
    class="component-name component-name--{variant} {className}"
    {...restProps}
  >
    <!-- content -->
  </span>
{/if}

<style>
  .component-name {
    /* shared base styles using tokens */
  }

  .component-name--variant-a { /* ... */ }
  .component-name--variant-b { /* ... */ }

  button.component-name { cursor: pointer; }
  button.component-name:hover { /* interactive state */ }
  button.component-name:active { transform: scale(0.96); }
</style>
```

**Rules:**
- `<style>` block inside the file for UI primitives in `components/shared/`
- Paired `.css` file for surface components in `components/stage/`, `components/cast/`
- State classes use `is-` prefix: `.is-active`, `.is-disabled`
- All colors via token vars — never hardcode hex or `rgba()`
- Use `color-mix(in srgb, var(--token) X%, transparent)` for transparent tints
- No `tailwind-variants`, no `cn()`, no Tailwind utility classes

### Step 4 — Update the index barrel

Remove any exported variant objects (`conditionPillVariants`, etc.) that no longer exist:

```js
// index.js — only export the component
export { default as ComponentName } from "./component-name.svelte";
```

### Step 5 — Update import sites

For each file that imported a now-removed named export:
1. Read it fresh
2. Remove the unused import
3. Replace any `conditionPillVariants({ variant })` calls with equivalent inline class strings if needed

### Step 6 — Verify

```bash
cd control-panel && bun run lint
```

Fix all errors. Report done only when lint passes clean.

---

## Common Tailwind → Token Translations

| Tailwind class | Project token equivalent |
|---|---|
| `font-display` | `font-family: var(--font-display)` — **do not use Tailwind utility, it resolves to Georgia/serif** |
| `font-mono` | `font-family: var(--font-mono)` |
| `text-xs` | `font-size: 12px` |
| `text-[10px]` | `font-size: 10px` |
| `tracking-wider` | `letter-spacing: 0.08em` |
| `tracking-[0.05em]` | `letter-spacing: 0.05em` |
| `rounded-full` | `clip-path: var(--hex-clip-sm)` (prefer hex) or `border-radius: 9999px` |
| `px-3 h-[26px]` | `padding: 0 var(--space-3); height: 26px` |
| `transition-colors duration-150` | `transition: background var(--t-fast), color var(--t-fast)` |
| `bg-[rgba(255,77,106,0.12)]` | `color-mix(in srgb, var(--red) 12%, transparent)` |
| `bg-[rgba(0,212,232,0.10)]` | `color-mix(in srgb, var(--cyan) 10%, transparent)` |
| `border-[var(--red)]` | `border-color: var(--red)` |
| `text-[var(--red)]` | `color: var(--red)` |
| `whitespace-nowrap` | `white-space: nowrap` |
| `leading-none` | `line-height: 1` |
| `inline-flex items-center gap-1` | `display: inline-flex; align-items: center; gap: var(--space-1)` |

## Why `font-display` fails in tailwind-variants

Tailwind v4's `font-display` utility maps to `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif` — the browser's default serif stack. It does **not** read `var(--font-display)` from the project's CSS tokens unless explicitly configured in `@theme`.

Class strings inside `tailwind-variants` `tv()` arrays are also often missed by Tailwind's JIT scanner when they live in `<script module>` blocks, causing the classes to never generate at all.

This is the most common reason to reach for this skill.
