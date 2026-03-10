## From `export let` to `$props()`

Svelte 4 used `export let` to declare props. Svelte 5 uses the `$props()` rune, which returns all props as a destructured object.

```svelte
<!-- Svelte 4 -->
<script>
  export let name;
  export let hp = 100;
</script>

<!-- Svelte 5 -->
<script lang="ts">
  let { name, hp = 100 } = $props();
</script>
```

## Typed props

Define an interface and pass it as the generic argument:

```svelte
<script lang="ts">
  interface Props {
    name: string;
    hp: number;
    maxHp?: number;
    class?: string;
  }

  let { name, hp, maxHp = hp, class: className = '' }: Props = $props();
</script>
```

Note: `class` is a reserved keyword — destructure it as `class: className`.

## Spread props

When a component wraps a native element, spread remaining props through with `...rest`:

```svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    label: string;
  }

  let { label, ...rest }: Props = $props();
</script>

<button {...rest}>{label}</button>
```

## Children (default slot equivalent)

The special `children` prop holds nested content — it's a Snippet (covered in the next topic):

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="card">
  {@render children()}
</div>
```
