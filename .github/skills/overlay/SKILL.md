---
name: overlay
description: >
  Build or extend a SvelteKit OBS overlay route (Audience layer).
  Use this skill when the user asks to create, modify, or debug an overlay
  component under `(audience)/` — HP bars, conditions, dice, scene titles,
  lower thirds, etc. Covers: overlaySocket setup, data-char-id DOM mapping,
  OBS Browser Source configuration, transparent background, and Storybook mock.
---

# Skill: Build an OBS Overlay Route

Overlays are **pure output** — they listen to Socket.io but never send requests. They run in OBS Browser Source at 1920×1080 with a transparent background.

---

## Step 1 — Understand the overlay socket

All audience routes use the **`createOverlaySocket(serverUrl)`** factory from:

```
control-panel/src/lib/components/overlays/shared/overlaySocket.svelte.js
```

```js
// Inside a +page.svelte under (audience)/
import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
import { page } from '$app/stores';
import { get } from 'svelte/store';

const serverUrl = get(page).url.searchParams.get('server') ?? 'http://localhost:3000';
const overlaySocket = createOverlaySocket(serverUrl);
// overlaySocket.characters — $state([]) array, reactive
// overlaySocket.getChar(id) — fast map lookup
// overlaySocket.socket — raw socket.io instance for extra event listeners
```

**Never** import from `lib/services/socket.js` in overlay routes — that singleton is for the control panel only.

### Adding extra event listeners

If the overlay needs events beyond `initialData` / `hp_updated` / `character_updated`, attach them after creating the socket:

```svelte
<script>
  import { onDestroy } from 'svelte';
  const overlaySocket = createOverlaySocket(serverUrl);

  let scene = $state(null);
  overlaySocket.socket.on('scene_changed', (data) => { scene = data; });
  // onDestroy is handled inside createOverlaySocket — no need to disconnect manually
</script>
```

---

## Step 2 — Route and file structure

Create these four files:

```
control-panel/src/routes/(audience)/<route-name>/
  +page.svelte          ← page shell: reads ?server param, passes to component

control-panel/src/lib/components/overlays/
  OverlayFoo.svelte     ← the actual overlay component
  OverlayFoo.css        ← styles (import at top of <script>)
  OverlayFoo.stories.svelte  ← Storybook story with mockCharacters
```

### `+page.svelte` (minimal shell)

```svelte
<script>
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import OverlayFoo from '$lib/components/overlays/OverlayFoo.svelte';

  const serverUrl = get(page).url.searchParams.get('server') ?? 'http://localhost:3000';
</script>

<OverlayFoo {serverUrl} />
```

### OBS Browser Source URL format

```
http://[LAN-IP]:5173/<route-name>?server=http://[LAN-IP]:3000
```

Use `bun run setup-ip` to auto-detect the LAN IP and generate `.env` files. Never hardcode IPs.

---

## Step 3 — Component structure

```svelte
<!--
  OverlayFoo — <brief description>.
  OBS Browser Source: 1920×1080, transparent background.

  Props:
    serverUrl    {string} — Socket.io server URL
    mockCharacters {Character[]|null} — For Storybook; skips socket setup when provided
-->
<script>
  import './OverlayFoo.css';
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';

  let { serverUrl = 'http://localhost:3000', mockCharacters = null } = $props();

  let characters = $state(mockCharacters ?? []);

  if (!mockCharacters) {
    const overlaySocket = createOverlaySocket(serverUrl);
    // Derive characters from the socket reactively
    $effect(() => { characters = overlaySocket.characters; });
  }
</script>

<div class="overlay-foo">
  {#each characters as character (character.id)}
    <div class="char-card" data-char-id={character.id}>
      <!-- render character info -->
    </div>
  {/each}
</div>
```

---

## Step 4 — CSS rules

```css
/* OverlayFoo.css */

/* Root: full 1920×1080, transparent background */
.overlay-foo {
  width: 1920px;
  height: 1080px;
  background: transparent;
  position: relative;
  overflow: hidden;
  font-family: var(--font-display);
}

/* State classes use is- prefix */
.char-card.is-critical { /* ... */ }
.char-card.is-selected { /* ... */ }

/* Always use token variables — never hardcoded colours */
.hp-bar { background: var(--color-hp-healthy); }
```

- Import `$lib/components/overlays/overlays.css` for shared overlay utilities if needed.
- Never edit `generated-tokens.css` — edit `design/tokens.json` → `bun run generate:tokens`.

---

## Step 5 — DOM mapping for efficient updates

Socket updates should mutate only the affected character node — do not re-render the whole overlay.

```svelte
<!-- Mark containers with data-char-id -->
<div class="char-card" data-char-id={character.id}>
```

```js
// Efficient in-place DOM mutation (optional, for animation)
const el = document.querySelector(`[data-char-id="${character.id}"] .hp-bar-fill`);
if (el) {
  el.classList.add('heal-flash');
  setTimeout(() => el.classList.remove('heal-flash'), 800);
}
```

---

## Step 6 — Storybook story

```svelte
<!-- OverlayFoo.stories.svelte -->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import OverlayFoo from './OverlayFoo.svelte';

  const mockCharacters = [
    { id: 'CH101', name: 'Kael', hp_current: 18, hp_max: 18, conditions: [], resources: [] },
    { id: 'CH102', name: 'Lyra', hp_current: 5,  hp_max: 14, conditions: [{ id: 'c1', condition_name: 'Envenenado', intensity_level: 1 }], resources: [] },
  ];

  const { Story } = defineMeta({
    title: 'Overlays/OverlayFoo',
    component: OverlayFoo,
    tags: ['autodocs'],
  });
</script>

<Story name="Default" args={{ mockCharacters }} />
<Story name="Empty"   args={{ mockCharacters: [] }} />
```

Pass `mockCharacters` to skip socket setup in Storybook. The component must check `if (!mockCharacters)` before calling `createOverlaySocket`.

---

## Step 7 — OBS configuration checklist

| Setting                      | Value                                  |
| ---------------------------- | -------------------------------------- |
| Source type                  | Browser Source                         |
| Width × Height               | 1920 × 1080                            |
| Background colour            | `#00000000` (transparent)              |
| Refresh when scene activates | ✅ Enabled                              |
| URL                          | `http://[IP]:5173/<route>?server=http://[IP]:3000` |

---

## Common pitfalls

| Pitfall | Fix |
| --- | --- |
| Importing `socket.js` instead of `overlaySocket.svelte.js` | Overlays must use `createOverlaySocket` |
| Calling `socket.emit()` from overlay | Overlays are listen-only — never emit |
| Hardcoding `localhost` in overlay URL | Use `?server=` param; generate via `bun run setup-ip` |
| Editing `generated-tokens.css` | Edit `design/tokens.json`, run `generate:tokens` |
| Missing `data-char-id` on container | Required for DOM-targeted animations |
| No `mockCharacters` guard | Storybook will try to connect to localhost:3000 |

