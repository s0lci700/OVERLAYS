## Callback props — for actions

Use a callback prop when the parent needs to _react to something_ the child does:

```svelte
<!-- Parent -->
<CharacterCard
  character={c}
  onhpchange={(delta) => updateHp(c.id, delta)}
  ondelete={() => deleteCharacter(c.id)}
/>

<!-- CharacterCard.svelte -->
<script lang="ts">
  interface Props {
    character: Character;
    onhpchange: (delta: number) => void;
    ondelete: () => void;
  }
  let { character, onhpchange, ondelete }: Props = $props();
</script>
```

## Snippets — for content projection

Use a Snippet when the parent wants to inject _markup_ into a child component. This replaces named slots from Svelte 4.

```svelte
<!-- Parent -->
<Card>
  {#snippet header()}
    <h2>{character.name}</h2>
  {/snippet}
  <p>HP: {character.hp}</p>
</Card>

<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    header?: Snippet;
    children: Snippet;
  }
  let { header, children }: Props = $props();
</script>

<div class="card">
  {#if header}
    <div class="card-header">{@render header()}</div>
  {/if}
  <div class="card-body">{@render children()}</div>
</div>
```

## Decision guide

| Need | Use |
|------|-----|
| Parent reacts to child event | Callback prop |
| Parent injects markup into child | Snippet |
| Simple conditional content | Snippet with `{#if snippet}` guard |
| Event + data back to parent | Callback with typed parameter |

In OVERLAYS, the stage components (HP controls, dice roller) use callback props heavily. Layout wrappers use Snippets for content slots.
