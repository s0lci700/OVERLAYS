---
name: svelte-animejs
description: Best practices for integrating Anime.js v4 with Svelte 5 — actions, lifecycle cleanup, reactive triggers, timeline management, and common pitfalls.
argument-hint: /svelte-animejs
---

# Svelte 5 + Anime.js v4 Integration Guide

> Researched against: Anime.js v4 docs (animejs.com) + Svelte 5 docs (svelte.dev). Project uses `animejs@^4.3.6`.

---

## Core Principle

Anime.js manipulates the DOM imperatively. Svelte 5 manages the DOM declaratively. The integration seam is:

- **Svelte `use:` action** → wraps Anime.js animations tied to a single element's lifetime
- **`$effect` rune** → re-triggers animations when reactive state changes
- **`bind:this`** → gives you a ref to a DOM node for use in non-action contexts

Never let an animation run after its target element is removed — always cancel/revert in cleanup.

---

## Pattern 1 — `use:` Action (preferred for element-scoped animations)

Actions are the cleanest seam for Anime.js. They fire when the node mounts and clean up when it unmounts.

```svelte
<script lang="ts">
  import { animate } from 'animejs';
  import type { Action } from 'svelte/action';

  const fadeIn: Action = (node) => {
    $effect(() => {
      const anim = animate(node, {
        opacity: [0, 1],
        translateY: ['8px', '0px'],
        duration: 400,
        ease: 'out(3)',
      });

      return () => {
        anim.cancel(); // stops animation and leaves element at current state
        // use anim.revert() if you want to restore original CSS values
      };
    });
  };
</script>

<div use:fadeIn>Content</div>
```

**Key points:**
- `$effect` inside the action handles reactive teardown correctly in Svelte 5
- Return a cleanup fn from `$effect` — it runs before each re-run AND on unmount
- Use `anim.cancel()` to stop mid-animation; use `anim.revert()` to undo all applied styles
- The action is called **once** per mount — do NOT put reactive reads inside the action unless you want re-runs (Svelte 5 doesn't re-call actions on arg change the way Svelte 4 `update()` did)

---

## Pattern 2 — `$effect` with `bind:this` (for reactive re-triggers)

When an animation should re-run in response to state changes, use `$effect` directly in the component.

```svelte
<script lang="ts">
  import { animate } from 'animejs';

  let { hp }: { hp: number } = $props();
  let barEl = $state<HTMLElement | null>(null);

  $effect(() => {
    if (!barEl) return;

    // Reading `hp` here makes this effect depend on it
    const _hp = hp;

    const anim = animate(barEl, {
      scaleX: [1.1, 1],
      duration: 300,
      ease: 'out(2)',
    });

    return () => anim.cancel();
  });
</script>

<div bind:this={barEl} class="hp-bar" style:width="{hp}%" />
```

**Key points:**
- Read every reactive value you want to track **synchronously** before any `await` — `$effect` only tracks synchronous reads
- `bind:this` is `$state<HTMLElement | null>` in Svelte 5 — always guard `if (!barEl) return`
- The cleanup fn from `$effect` fires before the next run, so the previous animation is always cancelled before starting a new one

---

## Pattern 3 — Timelines (`createTimeline`)

Use `createTimeline()` for sequenced multi-step animations. Manage the timeline instance with a module-level or `$state` variable so you can pause/cancel it.

```svelte
<script lang="ts">
  import { createTimeline, stagger } from 'animejs';
  import { onMount } from 'svelte';

  let items: HTMLElement[] = [];

  onMount(() => {
    const tl = createTimeline({ autoplay: false });

    tl
      .add(items, {
        opacity: [0, 1],
        translateY: ['12px', '0px'],
        duration: 350,
        ease: 'out(3)',
      }, stagger(60))
      .play();

    return () => tl.cancel(); // onMount cleanup
  });
</script>

{#each characters as char, i}
  <div bind:this={items[i]}>{char.name}</div>
{/each}
```

**Key points:**
- `onMount` is fine for one-shot entrance animations that don't need reactive re-runs
- `onMount` returns a cleanup fn → Svelte calls it on component destroy
- Collect DOM refs with `bind:this={items[i]}` inside `{#each}` — the array is populated by the time `onMount` fires
- `stagger(ms)` works as the timeline position argument for multi-target staggered entries

---

## Pattern 4 — Scope (`createScope`) for Component Isolation

`createScope()` prevents animation leaks between component instances — especially important for list items or repeated components.

```svelte
<script lang="ts">
  import { createScope, animate } from 'animejs';
  import { onMount } from 'svelte';

  let root: HTMLElement;

  onMount(() => {
    const scope = createScope({ root });

    scope.execute(() => {
      animate('.item', { opacity: [0, 1], duration: 400 });
      // Selector is scoped to `root` — won't match `.item` outside this component
    });

    return () => scope.revert(); // Cleans up all animations and styles in scope
  });
</script>

<div bind:this={root}>
  <div class="item">A</div>
  <div class="item">B</div>
</div>
```

**Key points:**
- `scope.revert()` is the safest cleanup for scoped animations — reverts all CSS changes
- Use when a component has multiple animated children and you want contained cleanup
- Do NOT use class-based selectors without scope in repeated components — you'll animate elements outside your component

---

## Pattern 5 — WAAPI (for performance-critical animations)

Anime.js v4 includes `waapi.animate()` which uses the native Web Animations API. Prefer this for transforms and opacity when you need 60fps on the compositor thread.

```typescript
import { waapi } from 'animejs';

const anim = waapi.animate(node, {
  transform: ['translateY(8px)', 'translateY(0px)'],
  opacity: [0, 1],
  duration: 400,
  easing: 'ease-out',
});

// cleanup
anim.cancel();
```

**When to use WAAPI vs JS engine:**
| Scenario | Use |
|---|---|
| CSS transforms + opacity | `waapi.animate()` |
| SVG attributes, JS object props | `animate()` |
| Complex timelines with callbacks | `createTimeline()` |
| Scroll-driven or scrubbed | `createScrollObserver()` |

---

## Cleanup Reference

| Method | Effect |
|---|---|
| `anim.cancel()` | Stops animation, leaves element at current mid-animation state |
| `anim.revert()` | Stops animation, restores all properties to their pre-animation values |
| `anim.complete()` | Jumps to end state immediately |
| `anim.pause()` | Pauses at current frame (resumable) |
| `scope.revert()` | Reverts all animations registered inside the scope |
| `tl.cancel()` | Cancels entire timeline |

**Rule of thumb:** Use `revert()` when a component unmounts (so outgoing elements don't leave stale inline styles). Use `cancel()` when you're about to restart the animation with new values.

---

## Common Pitfalls

### 1. Animating elements that don't exist yet
Svelte renders `{#if}` blocks lazily — the element doesn't exist until the condition is true. Always guard with `if (!el) return` or use the `use:` action (it only fires when the node is mounted).

### 2. Using CSS class selectors in repeated components
```svelte
<!-- WRONG — animates ALL .card elements on the page -->
animate('.card', { opacity: [0, 1] });

<!-- RIGHT — use a direct ref or scope -->
animate(cardEl, { opacity: [0, 1] });
```

### 3. Forgetting cleanup causes memory leaks
An animation that references a removed DOM node will throw. Always return a cancel/revert fn from `$effect` or `onMount`.

### 4. Conflicting with Svelte transitions
Do NOT mix Svelte's `transition:` / `in:` / `out:` directives with Anime.js on the same element — they both manipulate inline styles and will conflict. Pick one approach per element.

### 5. `autoplay: true` animations in SSR
Anime.js animations need the DOM. SvelteKit SSR will error if you run `animate()` at module scope or outside `onMount`/`$effect`. Always gate animation code inside `onMount` or `$effect` (which already don't run during SSR).

---

## This Project's Conventions

- Animation logic lives in `use:` actions for entrance/hover effects on UI primitives
- State-driven re-animations (HP change flash, roll result pulse) use `$effect` + `bind:this`
- Design tokens at `design/tokens.json` include `--anim-*` duration/easing variables — use these instead of hardcoded `400ms`
- Overlay components (Audience route) are animation-heavy: use `createScope` to prevent leaks between OBS browser source reloads
- Never import `animejs` in server-side files (`.server.ts`, `+page.server.ts`) — it's browser-only

---

## Minimal Action Template (copy-paste ready)

```typescript
// src/lib/actions/animate-in.ts
import { animate } from 'animejs';
import type { Action } from 'svelte/action';

interface AnimateInParams {
  duration?: number;
  delay?: number;
}

export const animateIn: Action<HTMLElement, AnimateInParams> = (node, params = {}) => {
  const { duration = 400, delay = 0 } = params;

  $effect(() => {
    const anim = animate(node, {
      opacity: [0, 1],
      translateY: ['8px', '0px'],
      duration,
      delay,
      ease: 'out(3)',
    });

    return () => anim.revert();
  });
};
```

```svelte
<script>
  import { animateIn } from '$lib/actions/animate-in';
</script>

<div use:animateIn={{ duration: 300, delay: 100 }}>Hello</div>
```
