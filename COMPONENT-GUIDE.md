# TableRelay Component Architecture Guide

## Overview

This document explains how components work in **TableRelay (OVERLAYS)**, including inheritance patterns, implementation strategies, and how SvelteKit + ShadCN + bits-ui integrate together.

**Tech Stack:**
- **Svelte 5** with runes (`$state`, `$derived`, `$effect`)
- **SvelteKit** for routing and SSR
- **bits-ui v2** — headless, unstyled primitives (like Radix UI)
- **tailwind-variants** — type-safe variant styling engine
- **Tailwind CSS 4** — utility-first styling
- **Custom design tokens** — centralized color/spacing/typography via `design/tokens.json`

---

## 1. Component Organization & Structure

### Directory Layout

```
control-panel/src/
├── lib/
│   ├── components/
│   │   ├── ui/                    ← Base/reusable UI components
│   │   │   ├── button/
│   │   │   │   ├── button.svelte
│   │   │   │   ├── Button.stories.svelte
│   │   │   │   └── index.js       ← Re-export for cleaner imports
│   │   │   ├── dialog/
│   │   │   │   ├── dialog.svelte
│   │   │   │   ├── dialog-content.svelte
│   │   │   │   ├── dialog-trigger.svelte
│   │   │   │   └── ...
│   │   │   ├── form/              ← Form helpers (fieldsets, labels, etc.)
│   │   │   └── ...
│   │   ├── stage/                 ← Operator/control panel components
│   │   │   ├── CharacterCard.svelte
│   │   │   ├── CharacterCard.css
│   │   │   ├── CharacterCard.stories.svelte
│   │   │   ├── DiceRoller.svelte
│   │   │   └── ...
│   │   ├── cast/                  ← DM/player-facing components
│   │   │   ├── dm/
│   │   │   │   ├── SessionCard.svelte
│   │   │   │   ├── SessionCard.css
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── overlays/              ← OBS overlay components (audience view)
│   │       ├── OverlayHP.svelte
│   │       ├── OverlayConditions.svelte
│   │       └── ...
│   ├── stores/
│   │   └── socket.js              ← Global Socket.io state (writable stores)
│   ├── lib/utils.js               ← Utilities (cn, resolvePhotoSrc, etc.)
│   └── app.css                    ← Global styles + base classes
├── design/
│   └── tokens.json                ← Design system source (colors, spacing, etc.)
├── generated-tokens.css           ← Auto-generated from tokens.json
└── ...
```

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| **Component files** | PascalCase | `CharacterCard.svelte` |
| **Styles** | Match component name | `CharacterCard.css` |
| **Stories** | `ComponentName.stories.svelte` | `Button.stories.svelte` |
| **Re-exports** | `index.js` per folder | `ui/button/index.js` |
| **CSS classes** | kebab-case | `.char-card`, `.btn-damage` |
| **State classes** | `is-` prefix | `.is-critical`, `.is-selected` |
| **Utility classes** | `-base` suffix | `.card-base`, `.btn-base` |
| **BEM modifiers** | Double dash | `.hp--healthy`, `.pip--filled` |

---

## 2. Svelte 5 Component Fundamentals

### Props & State

**Props** are reactive inputs; **state** is local, mutable data.

```svelte
<script>
  // Props (receive from parent)
  let {
    character,           // Required prop (no default)
    selected = false,    // Optional prop with default
    onToggleSelect = () => {},  // Callback prop
    ref = $bindable(null),      // Bindable ref (two-way binding)
    children = undefined,        // Snippet prop for child content
    ...restProps         // Spread remaining attributes
  } = $props();

  // Local state (component-only)
  let isCollapsed = $state(false);
  let hitFlashEl;  // DOM refs don't need $state
</script>
```

**Key points:**
- Use `$props()` to declare all props in one destructuring assignment
- Props automatically become reactive
- `$bindable()` creates two-way binding (parent ↔ component)
- Spread `...restProps` to pass unused HTML attributes down (accessibility!)

---

### Derived State with `$derived`

Compute values automatically when dependencies change—no need to track manually.

```svelte
<script>
  let { character } = $props();

  // Auto-recomputes when character.hp_current or character.hp_max changes
  const hpPercent = $derived((character.hp_current / character.hp_max) * 100);

  const hpClass = $derived(
    hpPercent > 60
      ? "hp--healthy"
      : hpPercent > 30
        ? "hp--injured"
        : "hp--critical"
  );

  // Use in template
  <div class="hp-fill {hpClass}" style="width: {hpPercent}%"></div>
</script>
```

**Benefits:**
- No reactivity boilerplate
- Guaranteed to be in sync
- Derived state is read-only (immutable by design)

---

### Side Effects with `$effect`

Run code when dependencies change—used for animations, API calls, DOM manipulation.

```svelte
<script>
  import { animate } from "animejs";

  let { character } = $props();
  let prevHp = 0;
  let hitFlashEl;

  // Runs whenever character.hp_current changes
  $effect(() => {
    const hp = character.hp_current;
    if (hp < prevHp && hitFlashEl) {
      // Animate damage flash when HP drops
      hitFlashEl.style.opacity = "0.5";
      animate(hitFlashEl, { opacity: 0, duration: 900, ease: "outCubic" });
    }
    prevHp = hp;
  });
</script>
```

**Rules:**
- Dependencies are tracked automatically (just reference variables)
- Runs after DOM updates (`onMount`, `onDestroy` equivalent)
- Can't directly modify parent props (one-way data flow)

---

### Snippets (Render Props)

Pass reusable content as props using `{#snippet}`:

```svelte
<!-- Parent -->
<Button
  variant="primary"
  let:args={args}
>
  {#snippet children(args)}
    <span>Click me: {args.label}</span>
  {/snippet}
</Button>

<!-- Button.svelte -->
<script>
  let { children = undefined, ...props } = $props();
</script>

<button {...props}>
  {@render children?.({ label: "Hello" })}
</button>
```

---

## 3. Component Inheritance & Patterns

### Base Classes & Composition

TableRelay uses **CSS composition** over component inheritance. Base classes provide shared behavior:

```css
/* app.css - shared base styles */
.card-base {
  padding: var(--space-3);
  background: var(--black-card);
  border: 1px solid var(--grey-dim);
  border-radius: var(--radius-lg);
}

.btn-base {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: all var(--t-fast);
  cursor: pointer;
}
```

```svelte
<!-- CharacterCard.svelte -->
<article class="char-card card-base" ...>
  <!-- inherits padding, background, border from .card-base -->
</article>
```

### Component Composition via Snippets

Instead of inheritance, **compose** components together:

```svelte
<!-- Modal.svelte -->
<script>
  let {
    isOpen = $state(false),
    title = undefined,
    content = undefined,
    footer = undefined
  } = $props();
</script>

{#if isOpen}
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>{title}</h2>
      <div>
        {@render content?.()}
      </div>
      <div>
        {@render footer?.()}
      </div>
    </div>
  </div>
{/if}
```

```svelte
<!-- Using the modal -->
<Modal title="Confirm Action">
  {#snippet content()}
    <p>Are you sure?</p>
  {/snippet}

  {#snippet footer()}
    <Button onclick={handleConfirm}>Yes</Button>
  {/snippet}
</Modal>
```

---

## 4. bits-ui Integration (Headless Primitives)

### What is bits-ui?

**bits-ui** provides **unstyled, accessible primitives**—you write the HTML structure and styles. It handles:
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- ARIA attributes
- Focus management
- State synchronization

### Example: Dialog (Modal)

```svelte
<!-- dialog.svelte - Wrapper around bits-ui Dialog -->
<script>
  import { Dialog as DialogPrimitive } from "bits-ui";

  let { open = $bindable(false), ...restProps } = $props();
</script>

<!-- Just pass through to bits-ui's Root component -->
<DialogPrimitive.Root bind:open {...restProps} />
```

The actual **composition** happens in the route/page:

```svelte
<!-- +page.svelte -->
<script>
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Button from "$lib/components/ui/button/button.svelte";

  let dialogOpen = $state(false);
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger asChild let:builder>
    <Button builders={[builder]}>
      Open Dialog
    </Button>
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Create Character</Dialog.Title>
        <Dialog.Close />
      </Dialog.Header>

      <form>
        <!-- form content -->
      </form>

      <Dialog.Footer>
        <Button type="submit">Create</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Key bits-ui Components Used

| Component | Purpose | Location |
|-----------|---------|----------|
| **Dialog** | Modal/popup dialogs | `ui/dialog/` |
| **Collapsible** | Expandable/collapsible sections | `ui/collapsible/` |
| **Popover** | Floating menus/tooltips | (if used) |
| **Select** | Dropdown select | native `<select>` instead |
| **Tooltip** | Hover tooltips | `ui/tooltip/` |

**Why bits-ui?**
- Unstyled → full control over design
- Handles a11y automatically
- Composable (assemble your own components)
- No design opinions (vs shadcn/ui which comes opinionated)

---

## 5. ShadCN + tailwind-variants: Styling System

### tailwind-variants

A type-safe API for building variant-based component styles using Tailwind utilities:

```js
// button.svelte (module scope)
import { tv } from "tailwind-variants";

export const buttonVariants = tv({
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all disabled:opacity-50",

  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-white hover:bg-destructive/90",
      outline: "border bg-background hover:bg-accent",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },

    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3",
      lg: "h-10 px-6",
      icon: "size-9",
    },
  },

  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
```

### Using Variants in Components

```svelte
<script>
  import { buttonVariants } from "./button.svelte";
  import { cn } from "$lib/utils.js";

  let {
    variant = "default",
    size = "default",
    class: className = "",
    ...props
  } = $props();
</script>

<button
  class={cn(
    buttonVariants({ variant, size }),
    className  // Allow overrides from parent
  )}
  {...props}
>
  <slot />
</button>
```

### The `cn()` Utility

Merges Tailwind classes intelligently—removes conflicting utilities:

```js
// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

**Example:**
```js
cn("px-4 py-2", "px-6")  // → "py-2 px-6" (px-4 removed)
```

---

## 6. CSS Architecture

### Component-Paired CSS Files

Each component has a corresponding `.css` file:

```
CharacterCard.svelte  ← Component logic
CharacterCard.css     ← Styles (imported via <script>)
```

```svelte
<!-- CharacterCard.svelte -->
<script>
  import "./CharacterCard.css";  // ← Always import first

  let { character } = $props();
</script>
```

### Base Classes & Utilities (app.css)

Shared styles live in **app.css**, not component CSS:

```css
/* app.css */

/* Base utility classes */
.card-base {
  padding: var(--space-3);
  background: var(--black-card);
  border: 1px solid var(--grey-dim);
  border-radius: var(--radius-lg);
  transition: border-color var(--t-fast);
}

.btn-base {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: all var(--t-fast);
  cursor: pointer;
}

.label-caps {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--grey);
}
```

### Design Tokens

Centralized in **design/tokens.json**:

```json
{
  "colors": {
    "primary": "#00d4e8",
    "destructive": "#ff4d6a",
    "black": "#000000",
    "white": "#ffffff"
  },
  "spacing": {
    "0": "0",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "half": "2px"
  },
  "typography": {
    "font-display": "'Inter', sans-serif",
    "font-mono": "'JetBrains Mono', monospace"
  },
  "radius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "pill": "9999px"
  }
}
```

**Auto-generated** to `generated-tokens.css`:

```css
/* generated-tokens.css (DO NOT EDIT) */
:root {
  --primary: #00d4e8;
  --destructive: #ff4d6a;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --radius-sm: 4px;
  --radius-lg: 12px;
  /* ... */
}
```

**Usage in component CSS:**

```css
.char-card {
  padding: var(--space-3);           /* Uses token */
  border-radius: var(--radius-lg);   /* Uses token */
  border: 1px solid var(--grey-dim); /* Uses token */
}
```

### CSS Naming Conventions

| Pattern | Purpose | Example |
|---------|---------|---------|
| **BEM block** | Component container | `.char-card` |
| **BEM element** | Child element | `.char-card__header` or `.char-header` |
| **BEM modifier** | Style variation | `.hp-fill--critical` or `.hp--critical` |
| **State class** | Dynamic state | `.is-critical`, `.is-selected`, `.collapsed` |
| **Utility base** | Reusable pattern | `.card-base`, `.btn-base` |

---

## 7. State Management Patterns

### Local Component State

Use `$state` for component-private data:

```svelte
<script>
  let isCollapsed = $state(false);
  let selectedItems = $state([]);
  let formData = $state({ name: "", email: "" });
</script>
```

### Global Shared State (Socket Stores)

Use **Svelte writable stores** for global state (shared across components):

```js
// lib/stores/socket.js
import { writable } from "svelte/store";

export const characters = writable([]);  // All characters
export const lastRoll = writable(null);  // Latest dice roll
export const SERVER_URL = writable("");   // Server endpoint
```

**Subscripting in components:**

```svelte
<script>
  import { characters, lastRoll } from "$lib/stores/socket";

  // Prefix $ to auto-subscribe and unsubscribe
  {#each $characters as char (char.id)}
    <CharacterCard {char} />
  {/each}
</script>
```

**Updating:**

```js
// Send REST request first
const response = await fetch(`${SERVER_URL}/api/damage`, {
  method: "POST",
  body: JSON.stringify({ charId, damage: 5 })
});

// Server broadcasts via Socket.io, which updates the store:
socket.on("character_updated", (updatedChar) => {
  characters.update(chars =>
    chars.map(c => c.id === updatedChar.id ? updatedChar : c)
  );
});
```

**Pattern: REST → Server → Socket.io → Store:**
```
User clicks "Damage" button
    ↓
Component sends REST POST /api/damage
    ↓
Server updates PocketBase
    ↓
Server broadcasts Socket.io event
    ↓
All clients receive update
    ↓
Svelte store updates
    ↓
Component re-renders
```

---

## 8. Animation & Effects

### anime.js for Complex Animations

Use **anime.js** for programmatic, orchestrated animations:

```svelte
<script>
  import { animate } from "animejs";

  function toggleCollapse() {
    if (!charBodyEl) return;

    const startHeight = charBodyEl.scrollHeight;
    charBodyEl.style.height = `${startHeight}px`;
    charBodyEl.style.overflow = "hidden";

    animate(charBodyEl, {
      height: 0,
      duration: 400,
      ease: "inOutCubic",
    });

    animate(charBodyEl, {
      opacity: 0,
      duration: 300,
      delay: 80,
      ease: "linear",
      complete: () => {
        charBodyEl.style.display = "none";
      },
    });
  }
</script>
```

### CSS Transitions for Simple Effects

Use **CSS transitions** for simple state changes (width, opacity, color):

```css
.hp-fill {
  height: 100%;
  transition:
    width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    background var(--t-normal);
}

.hp-fill.hp--critical {
  animation: barPulse 1.5s ease-in-out infinite;
}

@keyframes barPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

---

## 9. Accessibility

### Semantic HTML

Always use semantic elements:

```svelte
<!-- ✗ Bad -->
<div class="button" onclick={handleClick}>Click me</div>

<!-- ✓ Good -->
<button onclick={handleClick}>Click me</button>

<!-- For read-only content -->
<article class="char-card">
  <div role="progressbar" aria-valuenow={hp} aria-valuemax={max}></div>
</article>
```

### ARIA Attributes

```svelte
<!-- Toggle button with aria-expanded state -->
<button
  aria-expanded={!isCollapsed}
  aria-controls={`char-body-${id}`}
  onclick={toggleCollapse}
>
  {isCollapsed ? "Expand" : "Collapse"}
</button>

<div id={`char-body-${id}`} data-state={isCollapsed ? "closed" : "open"}>
  {/* content */}
</div>
```

### Screen Reader Only Text

```svelte
<button>
  <span aria-hidden="true">▾</span>
  <span class="sr-only">Expand menu</span>
</button>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 10. Storybook & Documentation

### Story Structure

Stories document component variants and use cases:

```svelte
<!-- Button.stories.svelte -->
<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Button from "./button.svelte";

  const { Story } = defineMeta({
    title: "UI/Button",
    component: Button,
    tags: ["autodocs"],
    argTypes: {
      variant: {
        control: { type: "select" },
        options: ["default", "destructive", "outline"],
      },
      size: {
        control: { type: "select" },
        options: ["sm", "default", "lg"],
      },
    },
  });
</script>

<Story name="Default" args={{ variant: "default" }}>
  {#snippet children(args)}
    <Button {...args}>Click me</Button>
  {/snippet}
</Story>

<Story name="All Variants">
  <div style="display: flex; gap: 8px;">
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
  </div>
</Story>
```

### Running Storybook

```bash
cd control-panel
bun run storybook
# Opens at http://localhost:6006
```

---

## 11. Real-World Examples

### Example 1: CharacterCard (Stateful Component)

```svelte
<script>
  import "./CharacterCard.css";
  import { animate } from "animejs";
  import { onMount } from "svelte";

  let {
    character,
    selected = false,
    onToggleSelect = () => {},
  } = $props();

  let prevHp = 0;
  let hitFlashEl;
  let charBodyEl;
  let isCollapsed = $state(false);

  onMount(() => {
    prevHp = character.hp_current;
  });

  // Auto-animate when HP changes
  $effect(() => {
    const hp = character.hp_current;
    if (hp < prevHp && hitFlashEl) {
      hitFlashEl.style.opacity = "0.5";
      animate(hitFlashEl, { opacity: 0, duration: 900 });
    }
    prevHp = hp;
  });

  // Derive HP percentage and color
  const hpPercent = $derived((character.hp_current / character.hp_max) * 100);
  const hpClass = $derived(
    hpPercent > 60 ? "hp--healthy"
    : hpPercent > 30 ? "hp--injured"
    : "hp--critical"
  );

  function toggleCollapse() {
    // Animate collapse/expand using anime.js
    if (!isCollapsed) {
      const height = charBodyEl.scrollHeight;
      animate(charBodyEl, { height: 0, duration: 400 });
      isCollapsed = true;
    } else {
      const height = charBodyEl.scrollHeight;
      animate(charBodyEl, { height, duration: 250 });
      isCollapsed = false;
    }
  }
</script>

<article class="char-card card-base" class:is-critical={hpPercent <= 30}>
  <div class="hit-flash" bind:this={hitFlashEl}></div>

  <div class="char-header">
    <img src={character.photo} alt={character.name} class="char-photo" />
    <div class="char-identity">
      <h2 class="char-name">{character.name}</h2>
      <span class="char-player">{character.player}</span>
    </div>
    <div class="char-hp-nums">
      <span class="hp-cur">{character.hp_current}</span>
      <span class="hp-sep">/</span>
      <span class="hp-max">{character.hp_max}</span>
    </div>
  </div>

  <div class="hp-track" role="progressbar" aria-valuenow={character.hp_current} aria-valuemax={character.hp_max}>
    <div class="hp-fill {hpClass}" style="width: {hpPercent}%"></div>
  </div>

  <div class="char-body" bind:this={charBodyEl}>
    {/* Collapsible content */}
  </div>
</article>
```

### Example 2: DiceRoller (Controlled Component)

```svelte
<script>
  import { characters, lastRoll, SERVER_URL } from "$lib/stores/socket";
  import { animate } from "animejs";

  let selectedCharId = $state($characters[0]?.id);
  let modifier = $state(0);
  let lastAnimation = null;

  function roll(diceType) {
    return Math.floor(Math.random() * diceType) + 1;
  }

  async function rollDice(diceType) {
    const rollValue = roll(diceType);

    // Send to server
    const response = await fetch(`${SERVER_URL}/api/rolls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charId: selectedCharId,
        result: rollValue,
        modifier: modifier,
        sides: diceType,
      }),
    });
  }

  // Derived state: is this a critical success/fail?
  const isCrit = $derived($lastRoll?.result === 20 && $lastRoll?.sides === 20);
  const isFail = $derived($lastRoll?.result === 1);

  // Animate when roll updates
  $effect(() => {
    const roll = $lastRoll;
    if (!roll) return;

    const resultEl = document.querySelector(".roll-result");
    const numberEl = document.querySelector(".roll-number");
    if (!resultEl) return;

    // Fade in result
    animate(resultEl, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 200,
    });

    // Bounce number
    if (numberEl) {
      animate(numberEl, {
        scale: [0.3, 1],
        duration: 450,
        delay: 70,
        ease: "outElastic(1, .6)",
      });
    }
  });
</script>

<div class="dice-panel">
  <div class="char-selector">
    <label for="char-select">ACTIVE CHARACTER</label>
    <select id="char-select" bind:value={selectedCharId}>
      {#each $characters as char (char.id)}
        <option value={char.id}>{char.name}</option>
      {/each}
    </select>
  </div>

  <div class="modifier-input">
    <label>MODIFIER</label>
    <input type="number" bind:value={modifier} min={-20} max={20} />
  </div>

  <div class="dice-grid">
    {#each [4, 6, 8, 10, 12, 20] as sides (sides)}
      <button class="dice-btn" onclick={() => rollDice(sides)}>
        d{sides}
      </button>
    {/each}
  </div>

  {#if $lastRoll}
    <div class="roll-result" class:is-crit={isCrit} class:is-fail={isFail}>
      <div class="roll-die-label">D{$lastRoll.sides}</div>
      <div class="roll-number">{$lastRoll.rollResult}</div>
      <div class="roll-label">{$lastRoll.characterName}</div>
    </div>
  {/if}
</div>
```

### Example 3: Dialog with bits-ui

```svelte
<!-- +page.svelte -->
<script>
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Button from "$lib/components/ui/button/button.svelte";

  let isCreateDialogOpen = $state(false);
  let formData = $state({ name: "", player: "" });

  async function handleCreateCharacter() {
    const res = await fetch(`/api/characters`, {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      isCreateDialogOpen = false;
      // Socket.io will broadcast update
    }
  }
</script>

<Dialog.Root bind:open={isCreateDialogOpen}>
  <Dialog.Trigger asChild let:builder>
    <Button builders={[builder]}>Create Character</Button>
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Create New Character</Dialog.Title>
        <Dialog.Close />
      </Dialog.Header>

      <form onsubmit={handleCreateCharacter}>
        <input
          type="text"
          placeholder="Character name"
          bind:value={formData.name}
          required
        />
        <input
          type="text"
          placeholder="Player name"
          bind:value={formData.player}
          required
        />
      </form>

      <Dialog.Footer>
        <Button onclick={handleCreateCharacter}>Create</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

---

## 12. Quick Reference: Common Patterns

### Pattern: Controlled Component (REST → Server → Socket → Store)

```svelte
<script>
  import { characters } from "$lib/stores/socket";

  async function handleDamage(charId, damage) {
    // 1. Send REST request
    const res = await fetch(`/api/damage`, {
      method: "POST",
      body: JSON.stringify({ charId, damage }),
    });

    // Server broadcasts via Socket.io
    // 2. Store updates automatically from Socket event
    // 3. Component re-renders
  }
</script>

{#each $characters as char (char.id)}
  <button onclick={() => handleDamage(char.id, 5)}>
    Damage {char.name}
  </button>
{/each}
```

### Pattern: Derived State with Animation Trigger

```svelte
<script>
  let { value } = $props();
  let prevValue = 0;

  $effect(() => {
    if (value > prevValue) {
      // Animate increase
      animateUp();
    } else if (value < prevValue) {
      // Animate decrease
      animateDown();
    }
    prevValue = value;
  });
</script>
```

### Pattern: Compose with Snippets

```svelte
<script>
  let {
    title,
    content,
    footer,
  } = $props();
</script>

<div class="modal">
  <header>
    {@render title?.()}
  </header>
  <main>
    {@render content?.()}
  </main>
  <footer>
    {@render footer?.()}
  </footer>
</div>
```

### Pattern: Re-export Components

```js
// ui/button/index.js
export { default as Button } from "./button.svelte";
export { buttonVariants } from "./button.svelte";
```

Then import as:
```svelte
import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
```

---

## 13. Performance Tips

### Use Keyed Loops

Always provide a key to `{#each}` loops:

```svelte
<!-- ✓ Good - prevents DOM churn -->
{#each characters as char (char.id)}
  <CharacterCard {char} />
{/each}

<!-- ✗ Bad - recreates DOM on reorder -->
{#each characters as char}
  <CharacterCard {char} />
{/each}
```

### Use `$derived` Instead of `$state`

```svelte
<!-- ✗ Requires manual updates -->
let hpPercent = $state(0);
$effect(() => {
  hpPercent = (character.hp_current / character.hp_max) * 100;
});

<!-- ✓ Auto-computed -->
const hpPercent = $derived((character.hp_current / character.hp_max) * 100);
```

### Avoid Inline Handlers in Loops

```svelte
<!-- ✗ Creates new function on each render -->
{#each items as item}
  <button onclick={() => handleDelete(item.id)}>Delete</button>
{/each}

<!-- ✓ Better (if possible, extract handler) -->
{#each items as item}
  <button onclick={handleDelete} data-id={item.id}>Delete</button>
{/each}
```

---

## Summary

| Concept | How It Works | When to Use |
|---------|-------------|-----------|
| **$props** | Declare component inputs | Every component |
| **$state** | Local mutable data | Component-only state |
| **$derived** | Computed values | Transformations, percentages, classes |
| **$effect** | Side effects | API calls, animations, DOM updates |
| **Snippets** | Pass content as props | Flexible components (modals, lists) |
| **bits-ui** | Headless primitives | Complex interactive components |
| **tailwind-variants** | Variant styling | Button variants, size variants |
| **CSS composition** | Shared base classes | `.card-base`, `.btn-base` |
| **Design tokens** | Centralized variables | Colors, spacing, typography |
| **Storybook** | Component documentation | Development, testing, design review |
| **Socket stores** | Global state | Shared data across components |

---

## Resources

- **Svelte 5 Docs:** https://svelte.dev/docs
- **SvelteKit Docs:** https://kit.svelte.dev/
- **bits-ui Docs:** https://bits-ui.com/
- **tailwind-variants:** https://www.tailwind-variants.org/
- **Design Tokens:** See `design/tokens.json`
- **Storybook:** Run `bun run storybook` in `control-panel/`
