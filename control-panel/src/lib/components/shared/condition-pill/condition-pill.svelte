<!--
  ConditionPill
  =============
  Displays a D&D status condition as a hex-clipped badge.

  Variants:
    - "condition" (default) — red, active status effects (Envenenado, Aturdido…)
    - "tag"                 — cyan, selection preview badges
    - "info"               — grey, read-only / dashboard display
    - "cast"               — amber, Cast surface

  When `interactive` is true, renders as an accessible button-like pill with × and calls onRemove.
-->
<script>
  let {
    label,
    variant = 'condition',
    interactive = false,
    onRemove = () => {},
    class: className = '',
    ...restProps
  } = $props();

  const handleActivate = () => onRemove();

  const handleKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRemove();
    }
  };
</script>

{#if interactive}
  <span
    class="condition-pill condition-pill--{variant} is-interactive {className}"
    role="button"
    tabindex="0"
    onclick={handleActivate}
    onkeydown={handleKeydown}
    {...restProps}
  >
    {label} <span aria-hidden="true">×</span>
  </span>
{:else}
  <span
    class="condition-pill condition-pill--{variant} {className}"
    {...restProps}
  >
    {label}
  </span>
{/if}

<style>
  .condition-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    height: 26px;
    padding: 0 var(--space-3);
    font-family: var(--font-display);
    font-size: 10px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    white-space: nowrap;
    border: 1px solid;
    clip-path: var(--hex-clip-sm);
    transition: background var(--t-fast), color var(--t-fast);
    line-height: 1;
  }

  /* Variants */
  .condition-pill--condition {
    background: color-mix(in srgb, var(--red) 12%, transparent);
    border-color: var(--red);
    color: var(--red);
  }

  .condition-pill--tag {
    background: color-mix(in srgb, var(--cyan) 10%, transparent);
    border-color: var(--cyan);
    color: var(--cyan);
  }

  .condition-pill--info {
    background: transparent;
    border-color: var(--grey-dim);
    color: var(--grey);
  }

  .condition-pill--cast {
    background: var(--cast-amber-dim);
    border-color: var(--cast-amber-border);
    color: var(--cast-amber);
    letter-spacing: 0.1em;
  }

  /* Interactive states */
  .condition-pill.is-interactive {
    cursor: pointer;
  }

  .condition-pill.is-interactive.condition-pill--condition:hover {
    background: var(--red);
    color: var(--white);
  }

  .condition-pill.is-interactive.condition-pill--tag:hover {
    background: var(--cyan);
    color: var(--black);
  }

  .condition-pill.is-interactive.condition-pill--info:hover {
    background: var(--grey-dim);
    color: var(--white);
  }

  .condition-pill.is-interactive.condition-pill--cast:hover {
    background: var(--cast-amber);
    color: var(--black);
  }

  .condition-pill.is-interactive:active {
    transform: scale(0.96);
  }
</style>
