# Storybook — TableRelay Control Panel

## Stack

| Package | Version | Role |
|---------|---------|------|
| `storybook` | 10.x | Core |
| `@storybook/sveltekit` | 10.x | Framework (inherits SvelteKit Vite config + `$lib` alias) |
| `@storybook/addon-svelte-csf` | 5.x | `.stories.svelte` file format |
| `@storybook/addon-docs` | 10.x | Auto-docs from JSDoc |
| `@storybook/addon-a11y` | 10.x | Accessibility audit panel |
| `@storybook/addon-vitest` | 10.x | Run Vitest tests inside Storybook UI |

## Running

```bash
# from control-panel/
bun run storybook          # dev server on :6006
bun run build-storybook    # static build → storybook-static/
```

## Surface → Story folder mapping

Stories are **colocated** with their component files — not in a separate `src/stories/` directory.

| Surface | Component path | Storybook sidebar |
|---------|---------------|-------------------|
| Stage | `src/lib/components/stage/` | `Stage/` |
| Cast — DM | `src/lib/components/cast/dm/` | `Cast/DM/` |
| Cast — Players | `src/lib/components/cast/player-sheet/` | `Cast/Players/` |
| Audience overlays | `src/lib/components/overlays/` | `Audience/` |
| Shared primitives | `src/lib/components/shared/` | `Shared/` |

The `title` field in `defineMeta` controls the sidebar path:

```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MyComponent from './MyComponent.svelte';

  const { Story } = defineMeta({
    title: 'Stage/MyComponent',   // ← sidebar path
    component: MyComponent,
  });
</script>
```

## Writing a new story

Stories use `@storybook/addon-svelte-csf` v5 syntax — **not** CSF3 `.ts` files.

```svelte
<!-- MyComponent.stories.svelte -->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MyComponent from './MyComponent.svelte';

  const { Story } = defineMeta({
    title: 'Surface/MyComponent',
    component: MyComponent,
    args: {
      // default args shared across all stories
    },
  });
</script>

<Story name="Default" />

<Story name="Variant">
  {#snippet children(args)}
    <MyComponent {...args} extraProp="value" />
  {/snippet}
</Story>
```

Key rules:
- Use `{#snippet children(args)}` — **not** `let:args` (that is the v4 API)
- Pass mock data through `args`, never import live services
- For overlay components, use the `mockCharacters` prop instead of providing a real `serverUrl`

## Mock data strategy

Stories run in **full isolation** — no PocketBase, no Socket.io, no OBS.

- All state comes through component props
- Overlay components accept a `mockCharacters` prop that bypasses the socket entirely
- Character fixtures live in `src/lib/mocks/` (or inline in the story for one-offs)
- Never call `fetch()` or import from `$lib/services/socket` inside a story file

## Global styles

`preview.js` imports `src/app.css` which loads all CSS custom properties (design tokens). All stories automatically have access to `var(--token-name)` variables and base typography.
