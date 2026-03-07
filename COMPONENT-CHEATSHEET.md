# TableRelay Component Development Cheat Sheet

## Quick Start: Creating a New Component

### 1. Basic Component Template

```svelte
<!-- MyComponent.svelte -->
<script>
  import "./MyComponent.css";

  let {
    title = "",
    variant = "default",
    children = undefined,
    ...restProps
  } = $props();

  let isOpen = $state(false);

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class="my-component">
  <h2>{title}</h2>
  <button onclick={toggle}>
    {isOpen ? "Close" : "Open"}
  </button>
  {#if isOpen}
    {@render children?.()}
  {/if}
</div>

<style>
  /* Or use paired CSS file */
</style>
```

### 2. Styling a Component

```css
/* MyComponent.css */

.my-component {
  padding: var(--space-3);
  background: var(--black-card);
  border: 1px solid var(--grey-dim);
  border-radius: var(--radius-lg);
}

.my-component.is-open {
  border-color: var(--cyan);
}
```

### 3. Create Storybook Story

```svelte
<!-- MyComponent.stories.svelte -->
<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MyComponent from "./MyComponent.svelte";

  const { Story } = defineMeta({
    title: "Components/MyComponent",
    component: MyComponent,
    tags: ["autodocs"],
    argTypes: {
      variant: {
        control: { type: "select" },
        options: ["default", "primary"],
      },
    },
  });
</script>

<Story name="Default" args={{ title: "My Component" }}>
  {#snippet children(args)}
    <MyComponent {...args}>Content goes here</MyComponent>
  {/snippet}
</Story>

<Story name="Open">
  {#snippet children(args)}
    <MyComponent {...args}>Content here</MyComponent>
  {/snippet}
</Story>
```

---

## Svelte 5 Patterns

### Props
```svelte
<script>
  let {
    name,              // Required
    age = 0,           // Default value
    ref = $bindable(null),  // Two-way binding
    onclick = () => {}, // Callback
    children = undefined,   // Snippet slot
    ...rest            // Spread HTML attrs
  } = $props();
</script>
```

### State
```svelte
<script>
  let count = $state(0);           // Simple state
  let obj = $state({ x: 0, y: 0 }); // Object state
  let arr = $state([1, 2, 3]);     // Array state

  function increment() {
    count++;  // Mutate directly
  }
</script>
```

### Derived State
```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);           // Auto-computed
  let isEven = $derived(count % 2 === 0);     // Boolean
  let className = $derived(
    count > 10 ? "is-large" : "is-small"       // Conditional class
  );
</script>
```

### Effects (Side Effects)
```svelte
<script>
  let count = $state(0);
  let element;

  // Runs when count changes
  $effect(() => {
    console.log("Count is now:", count);
  });

  // Animate when dependency changes
  $effect(() => {
    if (element) {
      animate(element, { scale: count });
    }
  });

  // Cleanup (like onDestroy)
  $effect(() => {
    const unsubscribe = store.subscribe(value => {
      // handle value
    });

    return () => {
      unsubscribe();
    };
  });
</script>
```

### Snippets (Child Content)
```svelte
<!-- Parent Component -->
<script>
  let { content = undefined } = $props();
</script>

<div>
  {@render content?.()}
</div>

<!-- Usage -->
<MyComponent>
  {#snippet content()}
    <p>This is custom content</p>
  {/snippet}
</MyComponent>
```

### Conditional Rendering
```svelte
{#if isOpen}
  <div>Visible</div>
{:else if isLoading}
  <div>Loading...</div>
{:else}
  <div>Hidden</div>
{/if}

{#if items.length}
  {#each items as item (item.id)}
    <div>{item.name}</div>
  {/each}
{:else}
  <p>No items</p>
{/if}
```

---

## Styling Patterns

### Using Design Tokens
```css
.component {
  padding: var(--space-3);           /* spacing */
  color: var(--white);               /* color */
  font-family: var(--font-display);  /* typography */
  border-radius: var(--radius-lg);   /* radius */
  transition: all var(--t-fast);     /* timing */
}
```

### BEM Naming
```css
/* Block: main component */
.character-card { }

/* Element: child of block */
.character-card__header { }
.character-card__body { }

/* Modifier: variation of block/element */
.character-card--expanded { }
.character-card__body--collapsed { }

/* State: dynamic condition */
.character-card.is-critical { }
.character-card.is-selected { }
```

### Using tailwind-variants
```svelte
<script module>
  import { tv } from "tailwind-variants";

  export const buttonVariants = tv({
    base: "px-4 py-2 rounded transition-all",
    variants: {
      color: {
        primary: "bg-blue-500 hover:bg-blue-600",
        danger: "bg-red-500 hover:bg-red-600",
      },
      size: {
        sm: "text-sm px-2 py-1",
        lg: "text-lg px-6 py-3",
      },
    },
    defaultVariants: {
      color: "primary",
      size: "sm",
    },
  });
</script>

<script>
  import { cn } from "$lib/utils.js";

  let { color = "primary", size = "sm", class: className = "" } = $props();
</script>

<button class={cn(buttonVariants({ color, size }), className)}>
  <slot />
</button>
```

### Responsive Design
```css
/* Mobile first */
.component {
  font-size: 1rem;
  padding: var(--space-2);
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    font-size: 1.25rem;
    padding: var(--space-3);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    font-size: 1.5rem;
    padding: var(--space-4);
  }
}
```

---

## bits-ui Common Components

### Dialog (Modal)
```svelte
<script>
  import * as Dialog from "$lib/components/ui/dialog/index.js";

  let isOpen = $state(false);
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Trigger asChild let:builder>
    <button {builder}>Open Dialog</button>
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Close />
      </Dialog.Header>

      <p>Content</p>

      <Dialog.Footer>
        <button onclick={() => isOpen = false}>Close</button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Collapsible
```svelte
<script>
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";

  let isOpen = $state(false);
</script>

<Collapsible.Root bind:open={isOpen}>
  <Collapsible.Trigger>
    {isOpen ? "Hide" : "Show"} Details
  </Collapsible.Trigger>

  <Collapsible.Content>
    Collapsible content here
  </Collapsible.Content>
</Collapsible.Root>
```

### Tooltip
```svelte
<script>
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
</script>

<Tooltip.Provider delayDuration={300}>
  <Tooltip.Root>
    <Tooltip.Trigger asChild let:builder>
      <button {builder}>Hover me</button>
    </Tooltip.Trigger>
    <Tooltip.Content>
      This is a tooltip
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
```

---

## Global State Management

### Writable Store
```js
// lib/stores/socket.js
import { writable } from "svelte/store";

export const characters = writable([]);
export const selectedId = writable(null);
```

### Using in Components
```svelte
<script>
  import { characters, selectedId } from "$lib/stores/socket";
</script>

<!-- Auto-subscribe with $ prefix -->
{#each $characters as char (char.id)}
  <div
    class:is-selected={char.id === $selectedId}
    onclick={() => $selectedId = char.id}
  >
    {char.name}
  </div>
{/each}
```

### Updating Store
```svelte
<script>
  import { characters } from "$lib/stores/socket";

  async function handleDelete(charId) {
    await fetch(`/api/characters/${charId}`, { method: "DELETE" });

    // Server broadcasts Socket.io update
    // Store updates automatically
  }
</script>
```

---

## Animation Patterns

### anime.js Animation
```svelte
<script>
  import { animate } from "animejs";

  let element;

  function triggerAnimation() {
    animate(element, {
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 300,
      ease: "easeOutElastic",
      complete: () => console.log("Done!"),
    });
  }
</script>

<button bind:this={element} onclick={triggerAnimation}>
  Animate me
</button>
```

### CSS Transition
```css
.component {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease-out;
}

.component.is-hidden {
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
}
```

### CSS Animation Keyframes
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.component.is-new {
  animation: slideIn 0.3s ease-out;
}
```

---

## Accessibility

### Semantic HTML
```svelte
<!-- Good -->
<button>Click me</button>
<nav></nav>
<main></main>
<section></section>
<article></article>
<header></header>
<footer></footer>

<!-- Avoid generic divs where semantic elements exist -->
```

### ARIA Attributes
```svelte
<!-- Button state -->
<button aria-pressed={isActive}>Toggle</button>

<!-- Expanded/collapsed -->
<button aria-expanded={isOpen} aria-controls="panel-1">
  Show More
</button>
<div id="panel-1" hidden={!isOpen}>Content</div>

<!-- Loading state -->
<div aria-busy={isLoading} role="status" aria-live="polite">
  {isLoading ? "Loading..." : "Done"}
</div>

<!-- Hidden from screen readers -->
<span aria-hidden="true">→</span>

<!-- Screen reader only text -->
<span class="sr-only">Additional information</span>
```

### Focus Management
```svelte
<script>
  let inputRef;

  function focusInput() {
    inputRef.focus();
  }
</script>

<button onclick={focusInput}>Focus the input below</button>
<input bind:this={inputRef} type="text" />
```

---

## Common Imports

```svelte
<!-- Components -->
<script>
  import Button from "$lib/components/ui/button/button.svelte";
  import { Button } from "$lib/components/ui/button/index.js";

  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
</script>

<!-- Utilities -->
<script>
  import { cn } from "$lib/utils.js";
  import { get } from "svelte/store";
</script>

<!-- Global State -->
<script>
  import { characters, lastRoll } from "$lib/stores/socket";
</script>

<!-- Animation -->
<script>
  import { animate } from "animejs";
</script>

<!-- Form -->
<script>
  import { tick } from "svelte";
</script>
```

---

## Development Commands

```bash
# Start development server
cd control-panel
bun run dev -- --host

# Or auto-setup IP + dev
bun run dev:auto

# Run Storybook
bun run storybook

# Run tests
bun run test

# Lint code
bun run lint

# Build for production
bun run build

# Preview production build
bun run preview
```

---

## File Structure Quick Reference

```
control-panel/src/
├── lib/
│   ├── components/
│   │   ├── ui/           ← Base UI components
│   │   ├── stage/        ← Operator components
│   │   ├── cast/         ← DM/Player components
│   │   └── overlays/     ← OBS overlay components
│   ├── stores/
│   │   └── socket.js     ← Global state
│   ├── utils.js          ← Utilities (cn, etc.)
│   └── app.css           ← Global styles + base classes
├── routes/
│   ├── (stage)/
│   ├── (cast)/
│   ├── (audience)/
│   └── +layout.svelte
├── design/
│   └── tokens.json       ← Design system source
└── generated-tokens.css  ← Auto-generated tokens
```

---

## Common Gotchas

### ❌ Don't mutate parent props
```svelte
<!-- Wrong -->
<script>
  let { character } = $props();
  character.hp = 50;  // ✗ Breaks reactivity
</script>

<!-- Right -->
<script>
  async function handleDamage(damage) {
    const res = await fetch(`/api/damage`, {
      method: "POST",
      body: JSON.stringify({ charId: character.id, damage })
    });
    // Let server broadcast Socket.io update
  }
</script>
```

### ❌ Don't forget to await PocketBase calls
```js
// Wrong
const char = pb.collection("characters").getOne(id);

// Right
const char = await pb.collection("characters").getOne(id);
```

### ❌ Don't hardcode CSS colors
```css
/* Wrong */
.button { color: #00d4e8; }

/* Right */
.button { color: var(--primary); }
```

### ❌ Don't use div for everything
```svelte
<!-- Wrong -->
<div class="button" onclick={...}>Click</div>

<!-- Right -->
<button onclick={...}>Click</button>
```

### ❌ Don't forget keys in loops
```svelte
<!-- Wrong -->
{#each items as item}
  <div>{item.name}</div>
{/each}

<!-- Right -->
{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}
```

---

## Debugging Tips

### Check Storybook for Component Behavior
```bash
bun run storybook
# Visit http://localhost:6006
# Look for your component story
```

### Console Logging
```svelte
<script>
  let { character } = $props();

  $effect(() => {
    console.log("Character changed:", character);
  });
</script>
```

### Inspect Store State
```svelte
<script>
  import { characters } from "$lib/stores/socket";
</script>

<pre>{JSON.stringify($characters, null, 2)}</pre>
```

### Check CSS Tokens
```css
/* In browser DevTools, inspect element and look for:
   --space-1, --primary, --radius-lg, etc.
*/
```

---

## Performance Checklist

- [ ] Use `$derived` instead of `$state` for computed values
- [ ] Provide keys to `{#each}` loops
- [ ] Use `bind:this` instead of `getElementById()`
- [ ] Use `{#await}` for async data instead of manual loading states
- [ ] Use CSS transitions over anime.js for simple animations
- [ ] Lazy load images with `loading="lazy"`
- [ ] Use `<Picture>` or `srcset` for responsive images
- [ ] Import only what you use (tree-shaking friendly)
- [ ] Use `-B` and `-A` flags in `grep` for context when searching

---

## Resources

- **Svelte 5 Docs:** https://svelte.dev/docs/svelte
- **SvelteKit Docs:** https://kit.svelte.dev/docs
- **bits-ui:** https://bits-ui.com/docs
- **tailwind-variants:** https://www.tailwind-variants.org/
- **Design System:** See `design/tokens.json` and `DESIGN-SYSTEM.md`
- **Full Architecture:** See `COMPONENT-GUIDE.md` and `ARCHITECTURE-DIAGRAM.md`
