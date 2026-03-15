---
applyTo: 'control-panel/src/**'
---

# Frontend Conventions — TableRelay Control Panel

Rules for all Svelte 5 / SvelteKit code under `control-panel/src/`.

---

## Svelte 5 runes

- Components use `$props()`, `$state()`, `$derived()`, `$effect()` — never the Svelte 4 store API inside components.
- Global shared singletons (`characters`, `lastRoll`) live in `lib/services/socket.js` as Svelte **writable stores** — they are shared across components and must stay as stores.
- OBS overlay routes import their socket from `lib/components/overlays/shared/overlaySocket.svelte.js` — **never** from `lib/services/socket.js`.
- Do not call `socket.emit()` from overlay components — overlays are listen-only.

```svelte
<!-- ✅ Correct — rune-based component state -->
<script>
  let { character } = $props();
  let isCollapsed = $state(false);
  let hpPercent = $derived(character.hp_current / character.hp_max);
</script>

<!-- ❌ Wrong — do not use writable() inside a component -->
<script>
  import { writable } from 'svelte/store';
  const isCollapsed = writable(false);
</script>
```

---

## Component file conventions

- Every component (`Foo.svelte`) has a paired `Foo.css` in the same directory.
- Import the CSS at the top of `<script>`: `import "./Foo.css";`
- CSS class names use `is-` prefix for state: `.is-collapsed`, `.is-critical`, `.is-selected`.
- Token variables from `generated-tokens.css` — reference via `var(--token-name)`. Never hardcode colour literals.
- Never edit `generated-tokens.css` or `public/tokens.css` directly — edit `design/tokens.json` and run `bun run generate:tokens`.
- Shared base classes (`.card-base`, `.btn-base`, `.label-caps`) come from `app.css`.

```css
/* ✅ Correct — token variable */
.hp-bar-fill { background: var(--color-hp-healthy); }

/* ❌ Wrong — hardcoded colour */
.hp-bar-fill { background: #22c55e; }
```

---

## Types

- Import domain types from `$lib/contracts` — do not declare ad-hoc inline types.
- Key types: `Character`, `Condition`, `Resource`, `Roll` (see `lib/contracts/records.ts` and friends).

```ts
// ✅ Correct
import type { Character } from '$lib/contracts';

// ❌ Wrong — inline ad-hoc shape
let character: { id: string; hp_current: number; name: string };
```

---

## UI library

- Headless primitives (`button`, `dialog`, `tooltip`, `badge`, etc.) live in `lib/components/shared/`. Use these before reaching for `bits-ui` directly.
- `bits-ui` v2 is installed for more complex headless composition.
- `tailwind-variants` is available for variant-based class composition.
- `cn()` (from `lib/services/utils.js`) merges Tailwind classes safely: `cn('base-class', conditionalClass && 'extra')`.

---

## Animations

- Use `anime.js` (`animejs` package) for programmatic effects — damage flash, dice bounce, level-up celebration.
- Use CSS transitions for continuous state changes — HP bar width, collapse/expand height.
- The spring easing helper pattern used in `CharacterCard.svelte`: `const spring = () => "spring(1, 80, 10, 0)"`.

---

## Socket flow in components

Components **never** mutate `characters` or `lastRoll` stores directly. All mutations go through the server:

1. Component calls REST endpoint (`fetch PUT /api/characters/:id/hp`).
2. Server writes to PocketBase and broadcasts Socket.io event to all clients.
3. `socket.js` listener receives the event and updates the store.
4. Component re-renders reactively.

```js
// ✅ Correct — REST first, let socket sync state
async function updateHp(delta) {
  await fetch(`${SERVER_URL}/api/characters/${character.id}/hp`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta }),
  });
  // store update happens via socket.on('hp_updated') in socket.js
}

// ❌ Wrong — mutating store directly
import { characters } from '$lib/services/socket.js';
characters.update(chars => chars.map(c => c.id === id ? { ...c, hp_current: newHp } : c));
```

---

## Storybook stories

- Every component should have a `Foo.stories.svelte` alongside `Foo.svelte`.
- Use `defineMeta` from `@storybook/addon-svelte-csf` in a `<script module>` block.
- Always include `tags: ['autodocs']`.
- Provide at least: Default, edge-case (empty/zero state), and visual stress story (multiple instances or extremes).
- Mock character data uses stable IDs like `"CH101"`, `"CH102"`, `"CH103"`.

```svelte
<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FooComponent from "./FooComponent.svelte";

  const { Story } = defineMeta({
    title: "Components/FooComponent",
    component: FooComponent,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ /* ... */ }} />
```

---

## DOM mapping for overlays

- Overlay character containers must carry a `data-char-id="{character.id}"` attribute.
- Socket event handlers use `document.querySelector('[data-char-id="..."]')` to locate nodes for efficient in-place mutations.
- Never remove or rename this attribute on overlay elements.

---

## Routing

- `lib/services/router.js` is a legacy hash-based router — do not use for new code; prefer SvelteKit's file-based routes.
- Route groups use `(parens)` — organizational only, not in URLs.
- Server URL for overlay query parameter: `?server=http://[IP]:3000` — never hardcode IPs.

