# Component System — SvelteKit + bits-ui

> How components are built, how styles flow, and how bits-ui (shadcn-style) works in this project.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Design Token Pipeline](#2-design-token-pipeline)
3. [CSS Inheritance Chain](#3-css-inheritance-chain)
4. [Component Layers](#4-component-layers)
5. [bits-ui — How it Works](#5-bits-ui--how-it-works)
6. [Tailwind Variants — How Variants Are Built](#6-tailwind-variants--how-variants-are-built)
7. [The `cn()` Utility](#7-the-cn-utility)
8. [Component File Anatomy](#8-component-file-anatomy)
9. [The Export / Re-export Pattern](#9-the-export--re-export-pattern)
10. [Svelte 5 Runes Cheatsheet](#10-svelte-5-runes-cheatsheet)
11. [Real Component Walkthrough — Button](#11-real-component-walkthrough--button)
12. [Real Component Walkthrough — Dialog](#12-real-component-walkthrough--dialog)
13. [Real Component Walkthrough — CharacterCard](#13-real-component-walkthrough--charactercard)
14. [Storybook Integration](#14-storybook-integration)
15. [Folder Map](#15-folder-map)

---

## 1. The Big Picture

```
design/tokens.json          ← Single source of truth for all colors, spacing, fonts
       │
       ▼ (bun run generate:tokens)
control-panel/src/
  generated-tokens.css      ← CSS custom properties, auto-generated. NEVER edit manually.
  app.css                   ← Global styles: imports tokens, maps them to shadcn semantics
  utilities.css             ← Utility classes built on top of tokens
       │
       ▼ (imported globally by SvelteKit)
Every .svelte component can use:
  var(--cyan), var(--hp-healthy), var(--font-mono) ...  ← raw tokens
  bg-primary, text-foreground, border-accent ...        ← Tailwind v4 semantic aliases
  .row, .stack, .surface-card, .text-muted ...          ← utility classes
```

There is **no magic inheritance**. Tokens are CSS custom properties cascading from `:root`, so every element in the DOM can read them. Tailwind v4 maps those same properties into utility classes via `@theme`.

---

## 2. Design Token Pipeline

```
design/tokens.json
  { "colors": { "cyan": "#00d4e8", "red": "#ff4d6a" },
    "fonts": { "display": "'Bebas Neue'" },
    "spacing": { "1": "4px", "2": "8px" } ... }

        ▼  bun run generate:tokens

generated-tokens.css
  :root {
    --cyan: #00d4e8;
    --red: #ff4d6a;
    --font-display: "Bebas Neue", sans-serif;
    --space-4: 16px;
    --radius-md: 8px;
    --t-normal: 250ms ease;
    ...
  }
```

`app.css` then **aliases** those raw tokens into **semantic names** that shadcn/bits-ui components understand:

```css
/* app.css — semantic mapping layer */
:root {
  --background:  var(--black);        /* page background */
  --foreground:  var(--white);        /* default text */
  --primary:     var(--cyan);         /* primary action color */
  --accent:      var(--purple);       /* secondary accent */
  --destructive: var(--red);          /* danger/delete */
  --border:      var(--grey-dim);     /* default border */
  --muted:       var(--black-card);   /* subtle surfaces */
  --radius:      var(--radius-md);    /* shadcn border radius */
}

/* Tailwind v4 @theme — makes semantic vars into utility classes */
@theme inline {
  --color-background: var(--background);
  --color-primary:    var(--primary);
  --color-accent:     var(--accent);
  --color-border:     var(--border);
  --radius-*:         var(--radius-*);
}
```

After this, `bg-primary` in Tailwind = `var(--primary)` = `var(--cyan)` = `#00d4e8`. Three levels of aliasing, all traceable back to one JSON file.

---

## 3. CSS Inheritance Chain

```
:root { --cyan: #00d4e8 }          ← generated-tokens.css
  └── :root { --primary: var(--cyan) }  ← app.css semantic alias
        └── @theme { --color-primary: var(--primary) }  ← Tailwind mapping
              └── .bg-primary { background-color: var(--color-primary) }  ← Tailwind class
                    └── <button class="bg-primary">  ← Component usage
```

For **paired CSS files** (e.g. `CharacterCard.css`), styles are scoped to the component by Svelte's automatic class hashing — no BEM namespace collision risk. These files use raw tokens directly:

```css
/* CharacterCard.css */
.hp-bar {
  background: var(--hp-healthy);      /* token direct reference */
  transition: width var(--t-normal);  /* token for timing */
  border-radius: var(--radius-sm);
}

.hp-bar.is-critical {
  background: var(--hp-critical);     /* BEM-style state class */
}
```

---

## 4. Component Layers

The project has three distinct layers of components:

```
Layer 3: App Components          (CharacterCard, DiceRoller, ConditionPill...)
          ↑ consume
Layer 2: UI Primitives           ($lib/components/ui/button, dialog, tooltip...)
          ↑ wrap
Layer 1: bits-ui Headless        (bits-ui Dialog.Root, Tooltip.Root, Label.Root...)
          ↑ built on
         WAI-ARIA + browser DOM
```

### Layer 1 — bits-ui (Headless)
Provides accessibility, keyboard navigation, ARIA roles, focus traps. Zero styling.

### Layer 2 — UI Primitives (`$lib/components/ui/`)
Wraps bits-ui in project styles. Applies Tailwind classes, `data-slot` attributes, and exposes a typed `$props()` API. This is what shadcn-svelte calls "component installation."

### Layer 3 — App Components (`$lib/components/`)
Business-logic components. Import from Layer 2, compose them, and add Socket.io / PocketBase integration.

---

## 5. bits-ui — How it Works

**bits-ui** is the Svelte equivalent of Radix UI (React). It provides unstyled, accessible component primitives.

### What bits-ui gives you

| Primitive | What it handles |
|-----------|----------------|
| `Dialog`  | focus trap, scroll lock, escape key, portal, ARIA modal |
| `Tooltip` | hover delay, portal, ARIA describedby |
| `Collapsible` | open/close state, ARIA expanded |
| `Label`   | for/id association, click-to-focus |
| `Select`  | keyboard navigation, ARIA listbox |

### How bits-ui is imported and used

```svelte
<!-- Raw bits-ui usage (inside a wrapper component) -->
<script>
  import { Dialog as DialogPrimitive } from "bits-ui";
</script>

<DialogPrimitive.Root>
  <DialogPrimitive.Trigger>Open</DialogPrimitive.Trigger>
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay />
    <DialogPrimitive.Content>
      <!-- your content here -->
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
</DialogPrimitive.Root>
```

bits-ui uses a **dot-notation namespace API** — `Dialog.Root`, `Dialog.Trigger`, etc. Each sub-component is a separate Svelte component internally.

### How we wrap it (the Layer 2 pattern)

```svelte
<!-- control-panel/src/lib/components/ui/dialog/dialog-content.svelte -->
<script>
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  let { ref = $bindable(null), class: className = '', children, ...restProps } = $props();
</script>

<DialogPrimitive.Content
  bind:ref
  data-slot="dialog-content"
  class={cn(
    "bg-background fixed top-1/2 left-1/2 z-50 rounded-lg shadow-xl",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    className          <!-- allows callers to add extra classes -->
  )}
  {...restProps}       <!-- passes any extra props down to bits-ui -->
>
  {@render children?.()}
</DialogPrimitive.Content>
```

Key patterns in every wrapper:
- `class: className = ''` in `$props()` — receives extra classes from the caller
- `cn(baseClasses, className)` — merges without conflicts
- `{...restProps}` — passes unknown props (aria-*, data-*, event handlers) to bits-ui
- `bind:ref` — exposes DOM element reference upward via `$bindable`
- `data-slot="..."` — marks the element for CSS targeting

---

## 6. Tailwind Variants — How Variants Are Built

`tailwind-variants` (`tv()`) replaces writing manual conditional class strings. It compiles to a function that returns the right class string.

```js
// control-panel/src/lib/components/ui/button/button.svelte (module script)
import { tv } from "tailwind-variants";

export const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:ring-2",
  variants: {
    variant: {
      default:     "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-white hover:bg-destructive/90",
      outline:     "border border-border bg-transparent hover:bg-muted",
      ghost:       "hover:bg-muted hover:text-foreground",
    },
    size: {
      default: "h-9 px-4 py-2 text-sm",
      sm:      "h-8 px-3 text-xs",
      lg:      "h-10 px-6 text-base",
      icon:    "size-9",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
```

Usage in the component:
```svelte
<button class={cn(buttonVariants({ variant, size }), className)}>
```

Usage at the call site:
```svelte
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost" size="icon"><TrashIcon /></Button>
```

The variant function call produces a single resolved class string — no runtime `if` statements.

---

## 7. The `cn()` Utility

```js
// control-panel/src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

- **`clsx`** — handles arrays, objects, and falsy values: `clsx(["a", false && "b", { c: true }])` → `"a c"`
- **`twMerge`** — resolves Tailwind conflicts: `twMerge("px-4 px-2")` → `"px-2"` (last wins, correctly)

Without `twMerge`, Tailwind conflicts like `"bg-red-500 bg-blue-500"` would depend on stylesheet order. With it, the later class always wins predictably.

```svelte
<!-- Caller overrides base padding -->
<Button class="px-8">Wide Button</Button>

<!-- Inside button.svelte -->
class={cn(buttonVariants({ variant, size }), className)}
<!-- Result: "... px-4 px-8" → twMerge → "... px-8" ✓ -->
```

---

## 8. Component File Anatomy

### UI Primitive (Layer 2)

```
$lib/components/ui/button/
├── button.svelte          ← The component itself
├── Button.stories.svelte  ← Storybook stories
└── index.js               ← Re-exports for clean imports
```

```svelte
<!-- button.svelte — full structure -->

<!-- Module script: shared across all instances, runs once -->
<script module>
  import { tv } from "tailwind-variants";
  import { cn } from "$lib/utils.js";

  export const buttonVariants = tv({ ... });  // exported so callers can use it too
</script>

<!-- Instance script: runs per-component -->
<script>
  let {
    class: className = '',    // rename "class" prop to avoid JS keyword
    variant = "default",
    size = "default",
    href = undefined,         // render as <a> if href is provided
    children,                 // Svelte 5 snippet (replaces <slot>)
    ...restProps
  } = $props();
</script>

<!-- Template: conditional rendering based on href -->
{#if href}
  <a
    class={cn(buttonVariants({ variant, size }), className)}
    {href}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    class={cn(buttonVariants({ variant, size }), className)}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}
```

### App Component (Layer 3)

```
$lib/components/character-card/
├── CharacterCard.svelte    ← Component
├── CharacterCard.css       ← Paired scoped styles
└── CardActions.svelte      ← Sub-component (imported internally)
```

```svelte
<!-- CharacterCard.svelte — structure -->
<script>
  import "./CharacterCard.css";                         // paired CSS file
  import LevelPill from "$lib/components/ui/pills/LevelPill.svelte";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { animate } from "animejs";

  let { character, serverUrl } = $props();              // typed props via $props()

  let hpPercent = $derived(character.hp_current / character.hp_max * 100);
  let isCritical = $derived(hpPercent < 25);

  function flashDamage(element) {
    animate(element, { backgroundColor: ["#ff4d6a", "transparent"], duration: 600 });
  }
</script>

<div class="character-card card-base" class:is-critical={isCritical}>
  <!-- Tooltip wrapping HP display -->
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger>
        <span class="hp-value text-value">{character.hp_current}</span>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {character.hp_current} / {character.hp_max} HP
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>

  <div class="hp-bar" style="width: {hpPercent}%"></div>
</div>

<!-- Scoped styles in CharacterCard.css (auto-scoped by Svelte) -->
```

---

## 9. The Export / Re-export Pattern

Every UI component folder has an `index.js` that provides two import styles:

```js
// $lib/components/ui/dialog/index.js

// Import sub-components
import Root from "./dialog.svelte";
import Content from "./dialog-content.svelte";
import Trigger from "./dialog-trigger.svelte";
import Overlay from "./dialog-overlay.svelte";
import Portal from "./dialog-portal.svelte";
import Title from "./dialog-title.svelte";
import Close from "./dialog-close.svelte";
import Header from "./dialog-header.svelte";
import Footer from "./dialog-footer.svelte";
import Description from "./dialog-description.svelte";

export {
  // Structural names (used inside compound components)
  Root, Content, Trigger, Overlay, Portal,
  Title, Close, Header, Footer, Description,

  // Namespaced aliases (match shadcn naming convention)
  Root        as Dialog,
  Content     as DialogContent,
  Trigger     as DialogTrigger,
  Title       as DialogTitle,
  Close       as DialogClose,
  Header      as DialogHeader,
  Footer      as DialogFooter,
  Description as DialogDescription,
};
```

This gives callers two equivalent import styles:

```svelte
<!-- Style A: namespace import (recommended) -->
<script>
  import * as Dialog from "$lib/components/ui/dialog/index.js";
</script>

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Hello</Dialog.Title>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>

<!-- Style B: named import (when you only need one part) -->
<script>
  import { DialogContent } from "$lib/components/ui/dialog/index.js";
</script>
```

For **Tooltip**, the index also re-exports raw bits-ui primitives directly (since Root/Trigger need no styling):

```js
// $lib/components/ui/tooltip/index.js
import { Tooltip as TooltipPrimitive } from "bits-ui";

// Re-export raw bits-ui parts (no wrapper needed)
const Root    = TooltipPrimitive.Root;
const Trigger = TooltipPrimitive.Trigger;
const Provider = TooltipPrimitive.Provider;

// Import only the custom wrapper
import Content from "./tooltip-content.svelte";

export { Root, Trigger, Provider, Content,
         Root as Tooltip, Trigger as TooltipTrigger,
         Content as TooltipContent };
```

---

## 10. Svelte 5 Runes Cheatsheet

Svelte 5 replaced the old `export let` / `$:` reactive syntax with **runes** — special compiler-understood functions.

| Old (Svelte 4)          | New (Svelte 5 rune)                     | Purpose |
|-------------------------|------------------------------------------|---------|
| `export let foo = 1`    | `let { foo = 1 } = $props()`            | Receive props |
| `export let bar`        | `let { bar = $bindable() } = $props()`  | Two-way bindable prop |
| `let x = 0`             | `let x = $state(0)`                     | Reactive local state |
| `$: y = x * 2`          | `let y = $derived(x * 2)`              | Computed value |
| `$: { side effects }`   | `$effect(() => { ... })`               | Run on change |
| `<slot />`              | `{@render children?.()}`               | Default slot |
| `<slot name="x" />`     | `{@render mySnippet?.()}`              | Named slot |

### Props pattern in this project

```svelte
<script>
  let {
    character,              // required prop (no default)
    size = "default",       // optional with default
    class: className = '',  // rename "class" keyword
    children,               // slot content (Svelte 5 snippet)
    ref = $bindable(null),  // exposes DOM ref to parent
    onchange,               // event callback
    ...restProps            // anything else → spread onto root element
  } = $props();
</script>
```

### State and derived values

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  let isEven = $derived(count % 2 === 0);

  // $effect runs after DOM updates, like useEffect
  $effect(() => {
    console.log("count changed:", count);
    return () => console.log("cleanup");  // optional cleanup
  });
</script>
```

---

## 11. Real Component Walkthrough — Button

```
File: control-panel/src/lib/components/ui/button/button.svelte
```

**What it does:** Renders either a `<button>` or `<a>` tag with variant styling. No bits-ui needed — native HTML handles all accessibility.

**Props:**
- `variant`: `"default" | "destructive" | "outline" | "ghost"` → controls color scheme
- `size`: `"default" | "sm" | "lg" | "icon"` → controls padding/height
- `href`: if set, renders as `<a>` tag
- `class`: extra Tailwind classes merged in via `cn()`
- `...restProps`: passes `disabled`, `type`, `onClick`, etc. directly to the element

**How a caller uses it:**

```svelte
<script>
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<Button variant="destructive" size="sm" onclick={handleDelete}>
  Delete Character
</Button>

<Button href="/live/characters" variant="ghost">
  Back
</Button>
```

**Class resolution example:**
```
buttonVariants({ variant: "destructive", size: "sm" })
→ "inline-flex items-center ... h-8 px-3 text-xs bg-destructive text-white hover:bg-destructive/90"

cn(above, "mt-4")
→ "inline-flex items-center ... h-8 px-3 text-xs bg-destructive text-white hover:bg-destructive/90 mt-4"
```

---

## 12. Real Component Walkthrough — Dialog

```
Files: control-panel/src/lib/components/ui/dialog/
```

Dialog is a **compound component** — multiple pieces that work together.

**Composition tree:**

```
Dialog.Root          ← bits-ui state machine (open/closed)
  Dialog.Trigger     ← button that opens the dialog
  Dialog.Portal      ← renders outside DOM tree (avoids z-index issues)
    Dialog.Overlay   ← dark backdrop
    Dialog.Content   ← the modal box (focus trap lives here)
      Dialog.Header
        Dialog.Title
        Dialog.Description
      <!-- your content -->
      Dialog.Footer
        Dialog.Close ← button to close
```

**How a page uses it:**

```svelte
<script>
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<Dialog.Root>
  <Dialog.Trigger>
    <Button>Open Settings</Button>
  </Dialog.Trigger>

  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Character Settings</Dialog.Title>
      <Dialog.Description>Adjust stats for this character.</Dialog.Description>
    </Dialog.Header>

    <!-- your form or content here -->

    <Dialog.Footer>
      <Dialog.Close>
        <Button variant="outline">Cancel</Button>
      </Dialog.Close>
      <Button onclick={save}>Save</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

**What bits-ui handles automatically:**
- Opens/closes on Trigger click and Escape key
- Locks body scroll when open
- Traps focus inside Content
- Adds `aria-modal`, `role="dialog"`, `aria-labelledby` pointing to Title

**What the wrappers add:**
- Background colors, padding, border-radius via Tailwind classes
- `data-[state=open]:animate-in` / `data-[state=closed]:animate-out` transitions
- Close button (X icon) in the top-right corner

---

## 13. Real Component Walkthrough — CharacterCard

```
Files: control-panel/src/lib/components/character-card/CharacterCard.svelte
       control-panel/src/lib/components/character-card/CharacterCard.css
```

This is a **Layer 3 app component**. It consumes Layer 2 UI primitives and adds game logic.

**Data flow:**

```
Socket.io broadcast  →  characters store (socket.js)
                                  │
                    CharacterCard receives { character } prop
                                  │
                    User clicks "Deal 5 damage"
                                  │
                    fetch() → POST /api/characters/:id/damage
                                  │
                    Server emits hp_updated socket event
                                  │
                    characters store updates
                                  │
                    CharacterCard re-renders (reactive)
```

**Key implementation patterns:**

```svelte
<script>
  import "./CharacterCard.css";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { animate } from "animejs";

  let { character, serverUrl } = $props();

  // Derived state — updates automatically when character prop changes
  let hpPercent = $derived(
    character.hp_max > 0
      ? Math.max(0, Math.min(100, (character.hp_current / character.hp_max) * 100))
      : 0
  );
  let hpState = $derived(
    hpPercent > 50 ? "healthy" : hpPercent > 25 ? "injured" : "critical"
  );

  // Animation on damage
  async function dealDamage(amount) {
    const res = await fetch(`${serverUrl}/api/characters/${character.id}/damage`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    if (res.ok) flashDamage();     // animate, server will broadcast update
  }

  function flashDamage() {
    // anime.js programmatic animation — not CSS transition
    animate(".character-card[data-char-id='" + character.id + "']", {
      backgroundColor: ["#ff4d6a33", "transparent"],
      duration: 600,
      easing: "easeOutQuad",
    });
  }
</script>

<!-- data-char-id used by overlay DOM targeting -->
<div
  class="character-card card-base"
  data-char-id={character.id}
  class:is-critical={hpState === "critical"}
>
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger class="hp-display">
        <span class="text-value">{character.hp_current}</span>
        <span class="text-muted">/ {character.hp_max}</span>
      </Tooltip.Trigger>
      <Tooltip.Content>
        HP: {character.hp_current} of {character.hp_max} — {hpState}
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>

  <!-- HP bar — width animated via CSS transition -->
  <div class="hp-bar" style="width: {hpPercent}%"></div>
</div>
```

```css
/* CharacterCard.css — scoped to this component by Svelte */
.hp-bar {
  height: 4px;
  background: var(--hp-healthy);
  transition: width var(--t-normal), background var(--t-normal);
  border-radius: var(--radius-pill);
}

.is-critical .hp-bar {
  background: var(--hp-critical);
  animation: pulse 1s ease-in-out infinite;
}
```

---

## 14. Storybook Integration

Each UI primitive has a `*.stories.svelte` file. Run Storybook at `http://localhost:6006`.

```svelte
<!-- Button.stories.svelte -->
<script module>
  export const meta = {
    title: "UI/Button",
    component: Button,
    argTypes: {
      variant: {
        control: "select",
        options: ["default", "destructive", "outline", "ghost"],
      },
      size: {
        control: "select",
        options: ["default", "sm", "lg", "icon"],
      },
    },
  };
</script>

<script>
  import { Story } from "@storybook/addon-svelte-csf";
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<Story name="Default">
  <Button>Click me</Button>
</Story>

<Story name="Destructive">
  <Button variant="destructive">Delete</Button>
</Story>

<Story name="All Sizes">
  <div class="row">
    <Button size="sm">Small</Button>
    <Button>Default</Button>
    <Button size="lg">Large</Button>
  </div>
</Story>
```

---

## 15. Folder Map

```
control-panel/src/
├── app.css                    ← Global styles, token → semantic mapping, layout
├── generated-tokens.css       ← Auto-generated from design/tokens.json. NEVER edit.
├── utilities.css              ← .row, .stack, .surface-*, .text-* utility classes
│
├── lib/
│   ├── utils.js               ← cn() and resolvePhotoSrc()
│   ├── socket.js              ← Socket.io singleton, characters/lastRoll stores
│   │
│   └── components/
│       ├── ui/                ← Layer 2: styled bits-ui wrappers
│       │   ├── button/        ← button.svelte, index.js, Button.stories.svelte
│       │   ├── dialog/        ← 9 sub-components + index.js
│       │   ├── tooltip/       ← tooltip-content.svelte + index.js
│       │   ├── collapsible/   ← thin wrappers around bits-ui Collapsible
│       │   ├── form/          ← formsnap + bits-ui Label integration
│       │   ├── input/         ← styled <input> wrapper
│       │   ├── label/         ← bits-ui Label.Root + cn()
│       │   ├── badge/         ← status badge component
│       │   ├── pills/         ← LevelPill, ConditionPill
│       │   ├── stat-display/  ← StatDisplay compound component
│       │   └── ...            ← 17 total UI components
│       │
│       └── character-card/    ← Layer 3: app component example
│           ├── CharacterCard.svelte
│           ├── CharacterCard.css
│           └── CardActions.svelte
│
└── routes/
    ├── (stage)/               ← Operator routes (/live/characters, /live/dice...)
    ├── (cast)/                ← DM & player routes (/dm, /players/[id])
    └── (audience)/            ← Overlay routes (/persistent/hp, /moments/dice...)
```

---

## Quick Reference

| Question | Answer |
|----------|--------|
| Where do colors come from? | `design/tokens.json` → `generated-tokens.css` → `app.css` semantic aliases |
| How do I add a new color? | Edit `design/tokens.json`, run `bun run generate:tokens` |
| How do I add a Tailwind utility for a token? | Add to `@theme inline {}` block in `app.css` |
| How do I use a dialog? | `import * as Dialog from "$lib/components/ui/dialog/index.js"` |
| How do I make a variant? | Use `tv()` from `tailwind-variants` + `cn()` for merging |
| How do I make a prop two-way bindable? | Use `$bindable()` as default value in `$props()` |
| How do I scope styles to a component? | Put them in a paired `.css` file — Svelte auto-scopes |
| Why `{...restProps}`? | To pass aria-*, data-*, onclick, etc. without listing every prop |
| What is `data-slot`? | A marker attribute for CSS targeting of compound component parts |
