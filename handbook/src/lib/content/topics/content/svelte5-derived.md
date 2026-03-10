## $state — raw reactive values

`$state` holds a value and makes it reactive. When it changes, anything that depends on it re-renders.

```svelte
<script lang="ts">
  let hp = $state(45);
  let name = $state('Thorin');
</script>

<p>{name} has {hp} HP</p>
<button onclick={() => hp -= 5}>Take 5 damage</button>
```

## $derived — computed values

`$derived` computes a value from other reactive state. It auto-updates whenever its dependencies change — no manual subscription needed.

```svelte
<script lang="ts">
  let hp = $state(45);
  let maxHp = $state(80);

  let hpPercent = $derived(Math.round((hp / maxHp) * 100));
  let isCritical = $derived(hpPercent <= 20);
  let statusLabel = $derived(isCritical ? 'Critical' : hp < maxHp ? 'Wounded' : 'Full');
</script>

<div class="bar" style:width="{hpPercent}%" class:is-critical={isCritical}></div>
<span>{statusLabel}</span>
```

## $derived.by — for complex derivations

When the derived value needs more than one expression, use `$derived.by`:

```svelte
let sortedCharacters = $derived.by(() => {
  return [...characters]
    .filter((c) => c.active)
    .sort((a, b) => b.hp - a.hp);
});
```

## $effect — side effects

`$effect` runs when reactive values it reads change. Use sparingly — mostly for DOM manipulation and external integrations.

```svelte
$effect(() => {
  if (isCritical) {
    // Trigger anime.js flash animation
    animate(element, { background: ['#ff0000', 'transparent'] });
  }
});
```

> **Rule of thumb:** Prefer `$derived` for computed values. Reach for `$effect` only when you need to _do something_ outside Svelte's rendering — DOM mutations, animation triggers, or logging.
