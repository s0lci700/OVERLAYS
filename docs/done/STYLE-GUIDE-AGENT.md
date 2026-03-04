# Dados & Risas — Machine-Readable Style Guide

> This file is loaded by `ui-designer` and `ui-builder` agents on every invocation.
> **Single source of design truth.** To update rules, edit this file — not the agents.

---

## Design Language

**Brand:** "Dados & Risas" — a dark, D&D-flavored pixel-art UI for OBS overlays and tablet control panels.

**Aesthetic intent:**
- Deep near-black backgrounds with white/accent text. No light mode, no grey wash.
- Flat pixel-art shadows (hard, offset 3–4px, no blur). Not soft drop shadows.
- Uppercase display font for anything label-like; mono font for all numbers.
- High contrast. If a number is important, it should be instantly readable at a glance from across a table.

**Emotional tone:** Tactical, bold, readable under dim lighting. Feels like a game HUD — not a SaaS dashboard.

**Avoid:**
- Pastel or desaturated colors
- Rounded soft shadows or large blur radius
- `border-radius` > `--radius-pill` on non-pill elements
- Light backgrounds or "card on light" patterns
- Generic SaaS aesthetics (white background, grey text, shadcn defaults)
- Font sizes below 0.65rem (illegibility on tablet)

---

## Color Semantics

Always use token vars. **Never hardcode hex values.**

| Color | Token | `-dim` counterpart | Use |
|-------|-------|--------------------|-----|
| Red | `var(--red)` | `var(--red-dim)` | Damage, conditions, critical HP state, danger, errors |
| Cyan | `var(--cyan)` | `var(--cyan-dim)` | Healing, selection highlight, focus rings, success, connection |
| Purple | `var(--purple)` | `var(--purple-dim)` | Dice / d20 accent, arcane flavor |
| Grey | `var(--grey)` | `var(--grey-dim)` | Secondary text, inactive labels, subtle borders |

**`-dim` variants** are translucent tints (rgba) — use for backgrounds, not text.
**Full saturation** (e.g., `var(--red)`) — use for borders, text, glow shadows, filled states.

**Never** use cyan for damage or red for healing. The semantic meaning is strict.

### HP Health State Colors

Use only for HP bars and HP-adjacent numeric display.

| State | Threshold | Token |
|-------|-----------|-------|
| Healthy | > 60% | `var(--hp-healthy)` / `var(--hp-healthy-dim)` |
| Injured | 30–60% | `var(--hp-injured)` / `var(--hp-injured-dim)` |
| Critical | ≤ 30% | `var(--hp-critical)` / `var(--hp-critical-dim)` |

Critical state triggers `.is-critical` class and a pulsing bar animation (`barPulse` keyframe).

### Surface Hierarchy

```
--black           (#000000)    Page canvas / overlay background
--black-card      (#0d0d0d)    Card surfaces (.card-base)
--black-elevated  (#1a1a1a)    Inputs, steppers, dropdowns, HP track
```

Never invert this hierarchy — elevated must be lighter than card, card lighter than canvas.

---

## Typography Rules

Three fonts, strict roles:

| Font | Token | When to use |
|------|-------|-------------|
| **Bebas Neue** | `var(--font-display)` | Character names, brand text, action buttons, ALL label text |
| **JetBrains Mono** | `var(--font-mono)` | HP numbers, dice results, any numeric value, input values |
| **system-ui** | `var(--font-ui)` | Body copy, form descriptions, tooltips, prose |

**Use `.label-caps` for all label text.** This class applies display font + uppercase + tracking. Do not re-implement it locally.

**Use `.mono-num` or `.text-value` for all numeric display.** These apply mono font + bold + tabular-nums. Do not set `font-family: var(--font-mono)` inline — use the class.

**Never** use `font-ui` for labels or `font-display` for body paragraphs.

Minimum readable sizes: labels `0.65rem`, body `0.75rem`, values `0.875rem+`, large HP `2rem+`.

---

## Spacing Contract

**Always use token vars. Never write raw px in new component CSS.**

```
var(--space-half)  2px   — sub-pixel tight (identity stack, hp-nums baseline gap)
var(--space-1)     4px   — minimum comfortable gap
var(--space-2)     8px   — default component internal gap
var(--space-3)     12px  — section internal padding
var(--space-4)     16px  — card padding
var(--space-5)     20px  — section separation
var(--space-6)     24px  — large layout gap
var(--space-8)     32px  — page-level spacing
var(--space-10)    40px  — large page sections
var(--space-12)    48px  — hero / oversized spacing
```

Touch targets: minimum **44×44px** for any interactive element. Use `min-height: 44px` not exact height.

---

## CSS Architecture

### New Components (`components/ui/`)

- **Scoped `<style>` block** inside the `.svelte` file. No paired `.css` file.
- **`[data-variant="x"]` CSS selectors** for variant switching — not JS class juggling.
- **CSS custom properties as the variant API:** Declare `--comp-color`, `--comp-bg`, etc. at the root class; each `[data-variant]` override sets only those vars.
- **No `tv()` or `tailwind-variants`** in new components.
- **No `cn()`** — plain class string interpolation suffices: `class="comp {className}"`.

### When to use `utilities.css` classes

Apply these directly in templates — do NOT re-implement them in component CSS:

| Class | Use |
|-------|-----|
| `.row` / `.row-tight` / `.row-spread` | Horizontal flex layouts |
| `.stack` / `.stack-tight` / `.stack-center` | Vertical flex layouts |
| `.inline-row` / `.inline-row-tight` | Inline-flex badge rows |
| `.surface-card` / `.surface-elevated` | Background fills |
| `.surface-red` / `.surface-cyan` / `.surface-purple` | Tinted accent fills |
| `.border-subtle` / `.border-red` / `.border-cyan` / `.border-purple` | 1px colored borders |
| `.text-muted` / `.text-red` / `.text-cyan` / `.text-purple` | Text color helpers |
| `.text-value` | White mono bold tabular-nums (for numeric display) |
| `.pill` / `.rounded` / `.rounded-sm` / `.rounded-lg` | Border-radius shortcuts |
| `.interactive` | cursor + transition shorthand |
| `.pressable` | `.pressable:active { transform: scale(0.95) }` |

### When to write component CSS

Write scoped CSS for:
- Structural layout specific to this component (grid, flex container sizes)
- State variations beyond utilities (`.is-critical`, `.is-selected`)
- Pseudo-element decoration (`::before`, `::after`)
- Animation keyframes unique to this component
- Variant API custom properties

### Existing components with paired `.css` files

`CharacterCard.svelte`, `DiceRoller.svelte`, `CharacterCreationForm.svelte` etc. use the old pattern of a paired `.css` file. **Do not refactor them.** Maintain their existing convention when updating.

---

## Component Conventions (Svelte 5)

### Props pattern — always use this exact form:

```svelte
<script>
  let {
    variant = "default",
    // component-specific props
    class: className = "",
    ...restProps
  } = $props();
</script>
```

### State: runes only

- Use `$state`, `$derived`, `$effect` inside components.
- **Never use writable stores inside `components/ui/` primitives.**
- The global `characters` and `lastRoll` in `socket.js` are stores — they stay as stores because they are cross-component singletons. Components in `components/ui/` must not import them.

### Primitives must be pure

- No `import { characters } from '$lib/socket'` inside `components/ui/`.
- No REST calls, no Socket.io, no server interaction.
- All data flows in via props, all interaction flows out via callback props or events.

### `bits-ui` headless primitives

Use `bits-ui` v2 for complex accessibility patterns (dialogs, tooltips, popovers, selects). Do not re-implement focus traps or ARIA widget patterns from scratch.

### `data-variant` on root element

Every component that accepts a `variant` prop must put `data-variant={variant}` on its root element. CSS then uses `[data-variant="x"]` selectors.

---

## Storybook Requirements

**Format:** `@storybook/addon-svelte-csf` v5 — `defineMeta` + `<Story>` tags

### Required in every story file:

```svelte
<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ComponentName from "./component-name.svelte";

  const { Story } = defineMeta({
    title: "UI/ComponentName",
    component: ComponentName,
    tags: ["autodocs"],   // REQUIRED — enables Storybook autodocs
    parameters: { docs: { description: { component: "..." } } },
    argTypes: { variant: { control: { type: "select" }, options: [...] } },
  });
</script>
```

### Required story set:

1. **Default** — `args={{ variant: "default" }}`
2. **All Variants** — renders all variants side-by-side in a flex row
3. At least one **usage example** showing the component in realistic context

### Snippets syntax (NOT `let:args`):

```svelte
<Story name="With Content">
  {#snippet children(args)}
    <ComponentName {...args}>Slot content</ComponentName>
  {/snippet}
</Story>
```

### Socket mock

The Storybook Vite config aliases `$lib/socket` → `src/__mocks__/socket.js`. Components that import socket will work in stories without a live server.

---

## Quality Checklist

Both agents run this checklist mentally before signing off:

1. **Tokens only** — no hardcoded hex, no raw px in colors or spacing
2. **Semantic color** — red=damage, cyan=healing/selection, purple=dice; no swaps
3. **Typography** — labels use `.label-caps`/display font; numbers use `.text-value`/mono font
4. **Touch targets** — all interactive elements `min-height: 44px`
5. **Focus visible** — `outline: 2px solid var(--cyan); outline-offset: 2px` on interactive elements
6. **State classes** — use `is-` prefix (`.is-critical`, `.is-selected`, `.is-disabled`)
7. **No stores in primitives** — `components/ui/` components must not import `socket.js`
8. **Lint** — `bun run lint` from `control-panel/` passes with 0 warnings
9. **Storybook** — story file exists with `tags: ["autodocs"]` and all required stories
10. **`data-char-id` preserved** — never remove this attribute from overlay elements

---

## Gold Standard Reference

**`src/lib/CharacterCard.svelte` + `CharacterCard.css`** is the aesthetic benchmark.

Before shipping a new component, ask: *"Is this at home next to CharacterCard?"*

Key patterns to match from CharacterCard:
- Display font for name (2rem+, uppercase, tight line-height)
- Mono font for HP numbers (2.25rem, font-weight 700, `is-critical` class turns them red)
- Hard pixel shadows on active buttons (3px offset, no blur, color-matched)
- `border-color: var(--red)` on the card when critical — the card frame glows
- HP bar gradient: `linear-gradient(90deg, var(--hp-*-dim), var(--hp-*))` left-to-right
- Damage flash: red overlay `opacity 0 → 0.5 → 0` via anime.js
- `.card-base` for the card frame (bg, border, radius, shadow, padding)
